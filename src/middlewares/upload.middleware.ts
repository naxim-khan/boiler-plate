import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req:any, file:any, cb:any) => {
    cb(null, uploadsDir);
  },
  filename: (req:any, file:any, cb:any) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `avatar-${req.user?.userId}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req:any, file:any, cb:any) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});
