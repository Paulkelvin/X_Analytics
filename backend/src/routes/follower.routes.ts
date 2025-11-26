import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getNonFollowers, 
  getInactiveFollowers,
  syncFollowers 
} from '../controllers/follower.controller';

const router = Router();

router.use(authenticateToken);

router.get('/non-followers', getNonFollowers);
router.get('/inactive', getInactiveFollowers);
router.post('/sync', syncFollowers);

export default router;
