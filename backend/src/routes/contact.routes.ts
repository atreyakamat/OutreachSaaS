import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createContact, getContacts, setPrimaryContact } from '../controllers/contact.controller.js';
import prisma from '../config/prisma.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createContact);
router.get('/', getContacts);
router.get('/:id', async (req: any, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: { company: true }
    });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error: any) {
    res.status(404).json({ message: 'Contact not found' });
  }
});
router.put('/:id', async (req: any, res) => {
  try {
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(contact);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating contact', error: error.message });
  }
});
router.delete('/:id', async (req: any, res) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: 'Contact not found' });
  }
});
router.patch('/:id/primary', setPrimaryContact);

export default router;
