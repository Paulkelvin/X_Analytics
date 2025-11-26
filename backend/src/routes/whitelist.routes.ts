import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  addToWhitelist,
  removeFromWhitelist,
  getWhitelist 
} from '../controllers/whitelist.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', getWhitelist);
router.post('/add', addToWhitelist);
router.delete('/:id', removeFromWhitelist);

export default router;
