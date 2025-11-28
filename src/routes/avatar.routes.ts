import type{Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middlewares/auth.middleware';
import { getUserById } from '../repositories/user.repository'; // <- import the function

const router = Router();

/**
 * GET /api/users/profile/me/avatar
 * Returns the logged-in user's profile avatar
 */
router.get('/avatar', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await getUserById(req.user.userId); // <- use the function

    if (!user.avatarUrl) {
      return res.status(404).json({
        success: false,
        message: 'Profile image not found',
        code: 'NOT_FOUND',
        data: null,
      });
    }

    const imagePath = path.join(process.cwd(), user.avatarUrl);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found on server',
        code: 'NOT_FOUND',
        data: null,
      });
    }

    return res.sendFile(imagePath);
  } catch (err) {
    next(err);
  }
});

export default router;
