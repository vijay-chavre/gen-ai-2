import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
});

export type ChatRequestDTO = z.infer<typeof ChatRequestSchema>;


