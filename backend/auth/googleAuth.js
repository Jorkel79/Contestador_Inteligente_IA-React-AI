require("dotenv").config();

const { google } = require("googleapis");

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.GOOGLE_CLIENT_SECRET);


const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 1️⃣ Generar URL
function generateAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly"
    ],
  });
}

// 2️⃣ Intercambiar code por tokens
async function getTokens(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

module.exports = {
  generateAuthUrl,
  getTokens
};