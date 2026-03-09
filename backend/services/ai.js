import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateReply(emailText) {

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
Eres un asistente que redacta respuestas profesionales a correos.

Reglas:
- Responde de forma profesional y breve
- No menciones que eres una IA
- No inventes información
- No agregues datos que no estén en el correo
- Mantén un tono natural
- Humaniza la respuesta, no suenes robótico: por ejmplo, en vez de "Estimado cliente, gracias por su correo", di "Hola, gracias por escribirme".
- No agregues campos innecesarios como "Asunto" o "Firma" solo redacta el cuerpo del correo.
- Siempre refierace a la persona de usted y presenta respuestas formales, incluso si el correo es informal.

Siempre termina con:
Saludos,
`
    },
    {
      role: "user",
      content: emailText
    }
  ]
});

  return response.choices[0].message.content;
}