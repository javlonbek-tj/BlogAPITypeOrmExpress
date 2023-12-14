import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import ApiError from '../utils/appError';
import { deleteFile } from '../utils/deleteFile';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        params: req.params,
        query: req.query,
        body: req.body,
      });
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        next(ApiError.BadRequest('Validation Error', e.errors));
        if (req.file) {
          deleteFile(req.file.path);
        }
      } else {
        next(e);
      }
    }
  };
