import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import OpenAI from "openai";

console.log("KEY FROM ENV:", process.env.OPENAI_API_KEY);
console.log("ENV PATH:", process.cwd());
console.log("KEY:", process.env.OPENAI_API_KEY);

console.log("KEY RAW:", process.env.OPENAI_API_KEY);
console.log("KEY LENGTH:", process.env.OPENAI_API_KEY?.length);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.trim()
});

const res = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "hola" }]
});

console.log(res.choices[0].message);