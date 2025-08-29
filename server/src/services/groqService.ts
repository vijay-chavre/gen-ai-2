import Groq from "groq-sdk";
import type { ChatMessage } from "../features/chat/types.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chatWithGroq(messages: ChatMessage[]) {
  return groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile",
  });
}


