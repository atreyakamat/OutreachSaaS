import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createCompany, getCompanies, updateCompanyStatus } from '../controllers/company.controller.js';
import prisma from '../config/prisma.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createCompany);
router.get('/', getCompanies);
router.get('/:id', async (req: any, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { contacts: true, opportunities: true }
    });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching company', error: error.message });
  }
});
router.put('/:id', async (req: any, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
});
router.delete('/:id', async (req: any, res) => {
  try {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ message: 'Company deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: 'Company not found' });
  }
});
router.patch('/:id/status', updateCompanyStatus);

export default router;
