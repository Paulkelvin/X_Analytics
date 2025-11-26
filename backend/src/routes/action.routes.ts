import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { unfollowUser } from '../controllers/action.controller';

const router = Router();

router.use(authenticateToken);

router.post('/unfollow', unfollowUser);

export default router;
