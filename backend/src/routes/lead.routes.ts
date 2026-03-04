import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createLead, getLeads, uploadLeads } from '../controllers/lead.controller.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(authMiddleware);

router.post('/', createLead);
router.get('/', getLeads);
router.post('/upload', upload.single('file'), uploadLeads);

export default router;
