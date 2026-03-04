import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { updatePipelineStage, getFollowups, getActivityLogs } from '../controllers/pipeline.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/followups', getFollowups);
router.get('/activity', getActivityLogs);
router.patch('/:leadId/stage', updatePipelineStage);

export default router;
