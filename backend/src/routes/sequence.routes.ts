import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createSequence, getSequences, addSequenceStep, enrollLeads } from '../controllers/sequence.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createSequence);
router.get('/', getSequences);
router.post('/:sequenceId/steps', addSequenceStep);
router.post('/:sequenceId/enroll', enrollLeads);

export default router;
