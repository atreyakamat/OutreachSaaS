import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { processAILeads, bulkSaveLeads } from '../controllers/ai.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/process', processAILeads);
router.post('/bulk-save', bulkSaveLeads);

export default router;
