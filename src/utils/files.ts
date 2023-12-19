import multer, { StorageEngine } from 'multer';
import fs from 'fs';
import { Request } from 'express';
import { ensureDir } from 'fs-extra';
import { path } from 'app-root-path';
import format from 'date-fns/format';

const fileStorage: StorageEngine = multer.diskStorage({
  destination: async (req: Request, file, cb) => {
    const dateFolder = format(new Date(), 'yyyy-MM-dd');
    const uploadFolder = `${path}/uploads/${dateFolder}`;
    await ensureDir(uploadFolder);
    cb(null, `uploads/${dateFolder}`);
  },
  filename: (req: Request, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: fileStorage,
  fileFilter,
});

// Delete file
export const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error('Error while deleting file');
    }
  });
};
