import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { 
  createUniversity, 
  getUniversities, 
  createCollege, 
  createStudent, 
  getStudents, 
  createOpportunity, 
  getOpportunities 
} from '../controllers/network.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/universities', createUniversity);
router.get('/universities', getUniversities);
router.post('/colleges', createCollege);
router.post('/students', createStudent);
router.get('/students', getStudents);
router.post('/opportunities', createOpportunity);
router.get('/opportunities', getOpportunities);

export default router;
