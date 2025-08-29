import { type NextFunction, type Request, type Response } from "express";
import { type ZodSchema } from "zod";
import { HttpError } from "../utils/http.js";

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new HttpError(400, JSON.stringify(parsed.error.flatten())));
    }
    // Attach validated data for downstream handlers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    res.locals.body = parsed.data as T;
    return next();
  };
}


