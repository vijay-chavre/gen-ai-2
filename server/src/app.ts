import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createChatRouter } from "./features/chat/routes.js";
import { env, isProd } from "./config/env.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (isProd) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(compression());

  app.use(
    cors({
      origin: env.CORS_ORIGIN || true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });
  app.use(limiter);

  app.use(morgan(isProd ? "combined" : "dev"));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.use("/", createChatRouter());

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found", path: req.path });
  });

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status && err.status >= 400 ? err.status : 500;
    const message = isProd && status === 500 ? "Internal Server Error" : err.message;
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    res.status(status).json({ error: message });
  });

  return app;
}


