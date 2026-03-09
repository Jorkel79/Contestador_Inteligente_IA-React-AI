import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateReply(emailText) {

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Eres un asistente que responde correos profesionales.`
      },
      {
        role: "user",
        content: emailText
      }
    ]
  });

  return completion.choices[0].message.content;
}