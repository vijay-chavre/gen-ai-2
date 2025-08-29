import { type Request, type Response } from "express";
import { type ChatRequestDTO } from "./schema.js";
import { chatWithGroq } from "../../services/groqService.js";
import { HttpError } from "../../utils/http.js";

export async function postChat(_req: Request, res: Response) {
  const body = res.locals.body as ChatRequestDTO | undefined;
  if (!body) {
    throw new HttpError(400, "Invalid request body");
  }
  const { messages } = body;
  const completion = await chatWithGroq(messages);
  const reply = completion.choices[0]?.message?.content ?? "";
  return res.json({ reply });
}


