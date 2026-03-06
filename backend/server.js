import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { generateReply } from "./services/ai.js";

import { authorize } from "./services/gmail.js";
import { google } from "googleapis";
import { generateAuthUrl, getTokens } from "./auth/googleAuth.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";

import User from "./models/User.js";
import Reply from "./models/Reply.js";
import Usage from "./models/Usage.js";

import auth from "./middleware/auth.js";

import "./jobs/resetUsage.js";

const app = express();

const SECRET = "ultra_secreto_123";

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB conectado 🧠");
})
.catch(err => {
  console.error("Error conectando MongoDB:", err);
});

app.get("/auth/google", (req, res) => {
  const url = generateAuthUrl();
  res.send(url);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  console.log("QUERY:", req.query);
  console.log("CODE:", code);

if (!code) {
  return res.send("No llegó ningún code 👀");
}

  const tokens = await getTokens(code);

  console.log("REFRESH TOKEN:", tokens.refresh_token);

  res.send("Revisa tu consola");
});

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================
// FUNCIONES AUXILIARES
// ==========================

function isNewsletter(emailText) {
  const spamWords = [
    "unsubscribe",
    "manage preferences",
    "view in browser",
    "click here",
    "no-reply",
    "dashboard",
    "cron jobs",
    "background workers"
  ];

  return spamWords.some(word =>
    emailText.toLowerCase().includes(word)
  );
}

function cleanEmail(emailText) {
  return emailText
    .split("\n")
    .filter(line =>
      !line.toLowerCase().includes("unsubscribe") &&
      !line.toLowerCase().includes("manage preferences") &&
      !line.toLowerCase().includes("render, inc") &&
      !line.toLowerCase().includes("click") &&
      !line.toLowerCase().includes("dashboard") &&
      !line.toLowerCase().includes("hubspot") &&
      !line.toLowerCase().includes("http")
    )
    .join("\n");
}

function decodeBase64(data) {
  return Buffer.from(data, 'base64').toString('utf-8');
}

// ==========================
// RUTAS
// ==========================

app.get("/", (req, res) => {
  res.send("Smart Reply AI backend corriendo");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Test Gmail API
app.get("/test-gmail", async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const result = await gmail.users.labels.list({
      userId: "me",
    });

    return res.json({
      success: true,
      labels: result.data.labels || [],
    });

  } catch (err) {
    console.error("GMAIL ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Error al conectar con Gmail",
    });
  }
});

// Obtener últimos correos
app.get("/emails", async (req, res) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 5
    });

    const messages = list.data.messages || [];
    const fullMessages = [];

    for (const m of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id
      });

      let body = "";

      const parts = msg.data.payload.parts;

      if (parts) {
        const part = parts.find(p => p.mimeType === "text/plain");

        if (part && part.body.data) {
          body = Buffer.from(
            part.body.data.replace(/-/g, "+").replace(/_/g, "/"),
            "base64"
          ).toString("utf-8");
        }
      }

      const headers = msg.data.payload.headers;

      const from = headers.find(h => h.name === "From")?.value;
      const subject = headers.find(h => h.name === "Subject")?.value;

      fullMessages.push({
        id: m.id,
        from,
        subject,
        body
      });
    }

    res.json(fullMessages);

  } catch (err) {
    console.error("ERROR REAL:", err);
    res.status(500).send("Error leyendo correos");
  }
});

// ==========================
// IA SERVICE
// ==========================


function getToday() {
  return new Date().toISOString().slice(0, 10);
}


app.post("/generate-reply", async (req, res) => {
  try {

    const { emailText, from } = req.body;

    const cleanedEmail = cleanEmail(emailText);

    const reply = await generateReply(cleanedEmail);

    res.json({ reply });

  } catch (error) {

    console.error("ERROR GENERANDO RESPUESTA:", error);

    res.status(500).json({
      error: "Error generando respuesta"
    });

  }
});


// ==========================
// Registro de usuarios
// ==========================

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ message: "Usuario registrado" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registrando usuario");
  }
});

// ==========================
// Login de usuarios
// ==========================

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Usuario no existe" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({ message: "Password incorrecta" });
  }

  const token = jwt.sign(
    { userId: user._id },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});