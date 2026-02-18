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
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

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
          body = decodeBase64(
            part.body.data.replace(/-/g, '+').replace(/_/g, '/')
          );
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
    console.error(err);
    res.status(500).send("Error leyendo correos");
  }
});

// ==========================
// IA SERVICE
// ==========================

app.post("/generate-reply", async (req, res) => {
  try {

    const { emailText, from } = req.body;

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

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando respuesta");
  }
});


// ==========================
// PUERTO
// ==========================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
