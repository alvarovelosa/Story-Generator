import express from 'express';
import * as scriptController from '../controllers/scriptController.js';

const router = express.Router();

// Get all scripts
router.get('/', scriptController.getScripts);

// Update script settings
router.put('/:name', scriptController.updateScript);

// Get logs
router.get('/logs', scriptController.getLogs);

// Clear logs
router.delete('/logs', scriptController.clearLogs);

export default router;
