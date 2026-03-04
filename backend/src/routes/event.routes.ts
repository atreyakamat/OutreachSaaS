import { Router } from 'express';
import { handleEvent } from '../controllers/event.controller.js';

const router = Router();

// This endpoint would typically be hit by an external service (SES, SendGrid) webhook
router.post('/webhook', handleEvent);

export default router;
