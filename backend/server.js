const { generateReply } = require("./services/ai");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { authorize } = require("./services/gmail");
const { google } = require("googleapis");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Smart Reply AI backend corriendo");
});

// Health check para deploy en Render, Railway, Docker, etc
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
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 5
    });

    const messages = list.data.messages || [];

    // Traer detalle de cada correo
    const fullMessages = [];

    for (const m of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id
      });

      fullMessages.push({
        id: m.id,
        snippet: msg.data.snippet,
        headers: msg.data.payload.headers
      });
    }

    res.json(fullMessages);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error leyendo correos");
  }
});

//Servicio de ia
app.post("/generate-reply", async (req, res) => {
  try {
    const { emailText } = req.body;

    const reply = await generateReply(emailText);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando respuesta");
  }
});


app.get("/generate-reply", async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    // 1. Obtener correos
    const r = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1
    });

    if (!r.data.messages || r.data.messages.length === 0) {
      return res.send("No hay correos");
    }

    const messageId = r.data.messages[0].id;

    // 2. Obtener contenido del correo
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: messageId
    });

    const body =
      msg.data.snippet || "Correo sin contenido";

    // 3. Enviar a la IA
    const reply = await generateReply(body);

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando respuesta");
  }
});

app.get("/generate-reply", async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    // 1. Obtener correos
    const r = await gmail.users.messages.list({
      userId: "me",
      maxResults: 1
    });

    if (!r.data.messages || r.data.messages.length === 0) {
      return res.send("No hay correos");
    }

    const messageId = r.data.messages[0].id;

    // 2. Obtener contenido del correo
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: messageId
    });

    const body =
      msg.data.snippet || "Correo sin contenido";

    // 3. Enviar a la IA
    const reply = await generateReply(body);

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando respuesta");
  }
});

// Puerto
const PORT = process.env.PORT || 4000;

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
