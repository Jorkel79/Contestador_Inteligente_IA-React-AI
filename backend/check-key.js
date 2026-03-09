import dotenv from "dotenv";
dotenv.config();

console.log(process.env.OPENAI_API_KEY);
console.log("length:", process.env.OPENAI_API_KEY.length);