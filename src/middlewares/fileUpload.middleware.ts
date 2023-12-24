import { Request, Response, NextFunction } from 'express';
import { upload } from '../utils/files';

export const uploadMiddleware =
  (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    const singleUpload = upload.single(fieldName);
    singleUpload(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({
          status: 'fail',
          message: `Error while uploading ${fieldName}. Please try again!`,
        });
      }
      next();
    });
  };
