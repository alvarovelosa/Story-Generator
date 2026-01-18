import express from 'express';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.post('/', sessionController.createSession);
router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);
router.post('/:id/activate-card', sessionController.activateCard);
router.post('/:id/deactivate-card', sessionController.deactivateCard);

export default router;
