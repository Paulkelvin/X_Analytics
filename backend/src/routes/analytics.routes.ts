import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getDemographics,
  getEngagementStats,
  getGrowthStats 
} from '../controllers/analytics.controller';

const router = Router();

router.use(authenticateToken);

router.get('/demographics', getDemographics);
router.get('/engagement', getEngagementStats);
router.get('/growth', getGrowthStats);

export default router;
