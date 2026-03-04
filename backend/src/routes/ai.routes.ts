import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { discoverCompanies, bulkSaveCompanies, runAutomatedDiscovery, getDiscoveredCompanies, approveDiscoveredCompany } from '../controllers/ai.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/discover', discoverCompanies);
router.post('/bulk-save-companies', bulkSaveCompanies);
router.post('/run-automated-discovery', runAutomatedDiscovery);
router.get('/discovered-queue', getDiscoveredCompanies);
router.post('/approve-discovered/:id', approveDiscoveredCompany);

export default router;
