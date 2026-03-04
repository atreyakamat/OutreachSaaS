import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createCompany, getCompanies, updateCompanyStatus } from '../controllers/company.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createCompany);
router.get('/', getCompanies);
router.patch('/:id/status', updateCompanyStatus);

export default router;
