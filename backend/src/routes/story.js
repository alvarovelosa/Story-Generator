import express from 'express';
import * as storyController from '../controllers/storyController.js';

const router = express.Router();

router.post('/turn', storyController.generateStoryTurn);
router.get('/history/:sessionId', storyController.getStoryHistory);
router.get('/prompt/:sessionId', storyController.getSystemPrompt);

export default router;
