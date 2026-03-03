import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { processAILeads, bulkSaveLeads } from '../controllers/ai.controller';

const router = Router();

router.use(authMiddleware);

router.post('/process', processAILeads);
router.post('/bulk-save', bulkSaveLeads);

export default router;
