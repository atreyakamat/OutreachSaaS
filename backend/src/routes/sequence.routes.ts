import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createSequence, getSequences, addSequenceStep, enrollContacts } from '../controllers/sequence.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createSequence);
router.get('/', getSequences);
router.get('/:sequenceId', async (req, res) => {
  const { sequenceId } = req.params;
  const prisma = (await import('../config/prisma.js')).default;
  try {
    const sequence = await prisma.sequence.findUnique({
      where: { id: sequenceId },
      include: { steps: { orderBy: { orderIndex: 'asc' } } }
    });
    if (!sequence) {
      return res.status(404).json({ message: 'Sequence not found' });
    }
    res.json(sequence);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching sequence', error: error.message });
  }
});
router.post('/:sequenceId/steps', addSequenceStep);
router.post('/:sequenceId/enroll', enrollContacts);
router.delete('/:sequenceId', async (req, res) => {
  const { sequenceId } = req.params;
  const prisma = (await import('../config/prisma.js')).default;
  try {
    await prisma.sequence.delete({ where: { id: sequenceId } });
    res.json({ message: 'Sequence deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: 'Sequence not found' });
  }
});

export default router;
