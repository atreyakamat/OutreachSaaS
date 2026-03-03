import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createCampaign, getCampaigns, startCampaign } from '../controllers/campaign.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.post('/:id/start', startCampaign);

export default router;
