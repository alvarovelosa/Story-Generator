import express from 'express';
import * as cardController from '../controllers/cardController.js';

const router = express.Router();

// Tags (must be before /:id routes to avoid matching 'tags' as an id)
router.get('/tags/all', cardController.getAllTags);
router.get('/tag/:tag', cardController.getCardsByTag);

// System cards and source filtering (must be before /:id)
router.get('/system', cardController.getSystemCards);
router.get('/source/:source', cardController.getCardsBySource);

// Basic CRUD
router.get('/', cardController.getAllCards);
router.get('/top-level', cardController.getTopLevelCards);
router.get('/type/:type', cardController.getCardsByType);
router.get('/rarity/:rarity', cardController.getCardsByRarity);
router.get('/nested/:parentId', cardController.getNestedCards);
router.get('/:id', cardController.getCardById);
router.post('/', cardController.createCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

// Tags - card-specific
router.post('/:id/tags', cardController.addTag);
router.delete('/:id/tags/:tag', cardController.removeTag);

// Parents (multi-parent DAG)
router.get('/:id/parents', cardController.getParents);
router.post('/:id/parents', cardController.addParent);
router.delete('/:id/parents/:parentId', cardController.removeParent);
router.get('/:id/ancestors', cardController.getAncestors);
router.get('/:id/descendants', cardController.getDescendants);

// Links
router.get('/:id/links', cardController.getLinkedCards);
router.post('/:id/links', cardController.addLink);
router.delete('/:id/links/:linkedCardId', cardController.removeLink);

// Triggers
router.post('/:id/triggers', cardController.addTrigger);
router.put('/:id/triggers/:index', cardController.updateTrigger);
router.delete('/:id/triggers/:index', cardController.removeTrigger);

// Clone and usage
router.post('/:id/clone', cardController.cloneCard);
router.post('/:id/usage', cardController.incrementUsage);

export default router;
