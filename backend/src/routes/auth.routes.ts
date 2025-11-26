import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { 
  initiateXAuth, 
  handleXCallback, 
  disconnectXAccount,
  getXAccountStatus 
} from '../controllers/xauth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

// X OAuth routes - /x/authorize is public for direct OAuth
router.get('/x/authorize', initiateXAuth);
router.get('/x/callback', handleXCallback);
router.delete('/x/disconnect', authenticateToken, disconnectXAccount);
router.get('/x/status', authenticateToken, getXAccountStatus);

export default router;
