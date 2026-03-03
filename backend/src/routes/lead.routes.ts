import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createLead, getLeads, uploadLeads } from '../controllers/lead.controller';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(authMiddleware);

router.post('/', createLead);
router.get('/', getLeads);
router.post('/upload', upload.single('file'), uploadLeads);

export default router;
