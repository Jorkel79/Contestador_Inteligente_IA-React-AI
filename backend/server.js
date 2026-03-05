require("dotenv").config();

const { generateReply } = require("./services/ai");
const express = require("express");
const cors = require("cors");

const { authorize } = require("./services/gmail");
const { google } = require("googleapis");
const { generateAuthUrl, getTokens } = require("./auth/googleAuth");

const app = express();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = "ultra_secreto_123";
const User = require("./models/User");

const Reply = require("./models/Reply");

const Usage = require("./models/Usage");

require("./jobs/resetUsage");

const mongoose = require("mongoose");

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

const auth = require("./middleware/auth");

function getToday() {
  return new Date().toISOString().slice(0, 10);
}


app.post("/generate-reply", auth, async (req, res) => {
  try {

    const { emailText, from } = req.body;

    const user = await User.findById(req.userId);
    const today = getToday();

    let usage = await Usage.findOne({
      userId: req.userId,
      date: today
    });

    if (!usage) {
      usage = await Usage.create({
        userId: req.userId,
        date: today,
        count: 0
      });
    }

    // 🚫 LIMITE PLAN FREE
    if (user.plan === "free" && usage.count >= 5) {
      return res.json({
        reply: "🚫 Has alcanzado el límite diario del plan gratuito"
      });
    }

    // FILTRO POR REMITENTE
    if (
      from &&
      (
        from.toLowerCase().includes("facebook") ||
        from.toLowerCase().includes("no-reply") ||
        from.toLowerCase().includes("notification") ||
        from.toLowerCase().includes("noreply") ||
        from.toLowerCase().includes("newsletter")
      )
    ) {
      return res.json({
        reply: "Este correo es automático. No se recomienda responder."
      });
    }

    // FILTRO POR CONTENIDO
    if (isNewsletter(emailText)) {
      return res.json({
        reply: "Este correo parece promocional o automático."
      });
    }

    const cleanedEmail = cleanEmail(emailText);

    const reply = await generateReply(cleanedEmail);

    // 🔢 AUMENTAR USO SI ES FREE
    if (user.plan === "free") {
      usage.count += 1;
      await usage.save();
    }

    // 💾 GUARDAR HISTORIAL
    await Reply.create({
      userId: req.userId,
      emailFrom: from,
      emailSubject: "",
      emailBody: cleanedEmail,
      aiReply: reply
    });

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando respuesta");
  }
});


// ==========================
// Registro de usuarios
// ==========================

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword
  });

  await newUser.save();

  res.json({ message: "Usuario registrado" });
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