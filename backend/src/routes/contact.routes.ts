import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createContact, getContacts, setPrimaryContact } from '../controllers/contact.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createContact);
router.get('/', getContacts);
router.patch('/:id/primary', setPrimaryContact);

export default router;
