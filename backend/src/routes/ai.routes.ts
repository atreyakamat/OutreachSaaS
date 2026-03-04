import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { discoverCompanies, bulkSaveCompanies } from '../controllers/ai.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/discover', discoverCompanies);
router.post('/bulk-save-companies', bulkSaveCompanies);

export default router;
