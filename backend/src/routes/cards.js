import express from 'express';
import * as cardController from '../controllers/cardController.js';

const router = express.Router();

router.get('/', cardController.getAllCards);
router.get('/top-level', cardController.getTopLevelCards);
router.get('/type/:type', cardController.getCardsByType);
router.get('/rarity/:rarity', cardController.getCardsByRarity);
router.get('/nested/:parentId', cardController.getNestedCards);
router.get('/:id', cardController.getCardById);
router.post('/', cardController.createCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

export default router;
