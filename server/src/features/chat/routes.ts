import { Router } from "express";
import { postChat } from "./controller.js";
import { asyncHandler } from "../../utils/http.js";
import { validate } from "../../middleware/validate.js";
import { ChatRequestSchema } from "./schema.js";

export function createChatRouter() {
  const router = Router();
  router.post("/chat", validate(ChatRequestSchema), asyncHandler(postChat));
  return router;
}


