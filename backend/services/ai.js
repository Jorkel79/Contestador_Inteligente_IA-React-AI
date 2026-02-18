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
        content: `Eres Jorge, un ingeniero de software que responde correos profesionales.
        
        Reglas IMPORTANTES:
- Responde de forma profesional pero natural
- No inventes cargo
- No inventes empresa
- No inventes teléfono
- No uses placeholders como [Tu Nombre] o [Empresa]
- No agregues datos que no estén en el correo

  Siempre termina el correo con:
  Saludos,`
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
