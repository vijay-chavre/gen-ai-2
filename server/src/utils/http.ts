import { type NextFunction, type Request, type Response } from "express";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function asyncHandler<Req extends Request, Res extends Response>(
  fn: (req: Req, res: Res, next: NextFunction) => Promise<unknown>
) {
  return (req: Req, res: Res, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}


