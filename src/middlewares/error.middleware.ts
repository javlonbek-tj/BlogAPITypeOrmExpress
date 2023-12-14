import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/appError';
import logger from '../utils/logger';

export default function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message, errors: err.errors });
  }
  logger.error(err);
  return res.status(500).json({ status: err.status, message: err.message });
}
