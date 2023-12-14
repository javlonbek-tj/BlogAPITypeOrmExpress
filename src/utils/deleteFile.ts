import fs from 'fs';

export const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error('Error while deleting file');
    }
  });
};
