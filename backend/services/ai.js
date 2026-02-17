const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateReply(emailText) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Eres un asistente profesional que responde correos de manera clara, breve y formal."
      },
      {
        role: "user",
        content: `Responde este correo:\n\n${emailText}`
      }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

module.exports = { generateReply };
