import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createCampaign, getCampaigns, createTemplate } from '../controllers/campaign.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.post('/:campaignId/templates', createTemplate);

export default router;
