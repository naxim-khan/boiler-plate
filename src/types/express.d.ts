import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File; // multer adds this when uploading single files
      files?: Multer.File[]; // optional, if you use multiple uploads
      user?: {
        userId: number;
        email: string;
        role: string;
      };
    }
  }
}
