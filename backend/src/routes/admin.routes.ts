import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getAllUsers,
  getSystemHealth 
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', getAllUsers);
router.get('/health', getSystemHealth);

export default router;
