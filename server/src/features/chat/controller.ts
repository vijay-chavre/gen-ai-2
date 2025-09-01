import { type Request, type Response } from "express";
import { type ChatRequestDTO } from "./schema.js";
import { chatWithGroq } from "../../services/groqService.js";
import { HttpError } from "../../utils/http.js";

export async function postChat(_req: Request, res: Response) {
  const body = res.locals.body as ChatRequestDTO | undefined;
  if (!body) {
    throw new HttpError(400, "Invalid request body");
  }
  
  const { messages, responseFormat, systemPrompt } = body;
  
  try {
    const options: any = {};
    if (responseFormat) options.responseFormat = responseFormat;
    if (systemPrompt) options.systemPrompt = systemPrompt;
    
    const completion = await chatWithGroq(messages, options);
    
    return res.json({
      reply: completion.reply,
      responseType: completion.responseType,
      metadata: completion.metadata,
      usage: completion.usage,
      model: completion.model,
    });
  } catch (error) {
    console.error("Groq API error:", error);
    throw new HttpError(500, "Failed to get AI response. Please try again.");
  }
}


