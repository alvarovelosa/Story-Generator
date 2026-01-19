import { initDatabase, saveDatabase } from '../database/db.js';

class Card {
  static async getDB() {
    return await initDatabase();
  }

  static getRarityMaxKnowledge(rarity) {
    const limits = {
      'Common': 2,
      'Bronze': 3,
      'Silver': 4,
      'Gold': 5
    };
    return limits[rarity] || 2;
  }

  // Parse JSON fields from database
  static parseCard(card) {
    if (!card) return null;
    return {
      ...card,
      parent_card_ids: JSON.parse(card.parent_card_ids || '[]'),
      tags: JSON.parse(card.tags || '[]'),
      triggers: JSON.parse(card.triggers || '[]'),
      linked_card_ids: JSON.parse(card.linked_card_ids || '[]'),
      unlock_conditions: JSON.parse(card.unlock_conditions || '{}')
    };
  }

  // Check if card is editable (system cards are read-only)
  static isEditable(card) {
    return card && card.source !== 'system';
  }

  // Check if card is deletable
  static isDeletable(card) {
    return card && card.source !== 'system' && card.source !== 'default';
  }

  // Get cards by source type
  static async getBySource(source) {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE source = ? ORDER BY created_at DESC');
    stmt.bind([source]);
    const cards = [];
    while (stmt.step()) {
      cards.push(this.parseCard(stmt.getAsObject()));
    }
    stmt.free();
    return cards;
  }

  // Get all system cards
  static async getSystemCards() {
    return await this.getBySource('system');
  }

  static async getAll() {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards ORDER BY created_at DESC');
    const cards = [];
    while (stmt.step()) {
      cards.push(this.parseCard(stmt.getAsObject()));
    }
    stmt.free();
    return cards;
  }

  static async getById(id) {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE id = ?');
    stmt.bind([id]);
    let card = null;
    if (stmt.step()) {
      card = this.parseCard(stmt.getAsObject());
    }
    stmt.free();
    return card;
  }

  static async getByType(type) {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE type = ? ORDER BY created_at DESC');
    stmt.bind([type]);
    const cards = [];
    while (stmt.step()) {
      cards.push(this.parseCard(stmt.getAsObject()));
    }
    stmt.free();
    return cards;
  }

  static async getByRarity(rarity) {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE rarity = ? ORDER BY created_at DESC');
    stmt.bind([rarity]);
    const cards = [];
    while (stmt.step()) {
      cards.push(this.parseCard(stmt.getAsObject()));
    }
    stmt.free();
    return cards;
  }

  static async getNestedCards(parentId) {
    const db = await this.getDB();
    // Search for cards where parent_card_ids contains the parentId
    const allCards = await this.getAll();
    return allCards.filter(card =>
      card.parent_card_ids && card.parent_card_ids.includes(parentId)
    );
  }

  static async getTopLevelCards() {
    const db = await this.getDB();
    const allCards = await this.getAll();
    return allCards.filter(card =>
      !card.parent_card_ids || card.parent_card_ids.length === 0
    );
  }

  static async getByTag(tag) {
    const allCards = await this.getAll();
    return allCards.filter(card =>
      card.tags && card.tags.includes(tag)
    );
  }

  static async getAllTags() {
    const allCards = await this.getAll();
    const tags = new Set();
    allCards.forEach(card => {
      if (card.tags) {
        card.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }

  static async create(cardData) {
    const {
      name,
      type,
      rarity,
      source = 'user',
      prompt_text,
      knowledge_level = 1,
      parent_card_ids = [],
      tags = [],
      triggers = [],
      linked_card_ids = [],
      compressed_prompt = null,
      unlock_conditions = {}
    } = cardData;

    const max_knowledge_level = this.getRarityMaxKnowledge(rarity);

    const db = await this.getDB();
    db.run(`
      INSERT INTO cards (name, type, rarity, source, prompt_text, knowledge_level, max_knowledge_level, parent_card_ids, tags, triggers, linked_card_ids, compressed_prompt, unlock_conditions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      type,
      rarity,
      source,
      prompt_text,
      knowledge_level,
      max_knowledge_level,
      JSON.stringify(parent_card_ids),
      JSON.stringify(tags),
      JSON.stringify(triggers),
      JSON.stringify(linked_card_ids),
      compressed_prompt,
      JSON.stringify(unlock_conditions)
    ]);

    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const { id } = stmt.getAsObject();
    stmt.free();

    saveDatabase();
    return await this.getById(id);
  }

  static async update(id, cardData) {
    // First check if card is editable
    const existingCard = await this.getById(id);
    if (!existingCard) return null;

    // System cards cannot be edited (except for usage stats)
    if (existingCard.source === 'system') {
      // Only allow updating usage stats for system cards
      const allowedFields = ['times_used', 'last_used'];
      const hasDisallowedFields = Object.keys(cardData).some(key => !allowedFields.includes(key));
      if (hasDisallowedFields) {
        throw new Error('System cards cannot be edited. Clone the card to create an editable copy.');
      }
    }

    const {
      name,
      type,
      rarity,
      prompt_text,
      knowledge_level,
      progression_points,
      possession_state,
      parent_card_ids,
      tags,
      triggers,
      linked_card_ids,
      compressed_prompt,
      unlock_conditions,
      times_used,
      last_used
    } = cardData;

    let updateFields = [];
    let values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      values.push(type);
    }
    if (rarity !== undefined) {
      updateFields.push('rarity = ?');
      values.push(rarity);
      updateFields.push('max_knowledge_level = ?');
      values.push(this.getRarityMaxKnowledge(rarity));
    }
    if (prompt_text !== undefined) {
      updateFields.push('prompt_text = ?');
      values.push(prompt_text);
    }
    if (knowledge_level !== undefined) {
      updateFields.push('knowledge_level = ?');
      values.push(knowledge_level);
    }
    if (progression_points !== undefined) {
      updateFields.push('progression_points = ?');
      values.push(progression_points);
    }
    if (possession_state !== undefined) {
      updateFields.push('possession_state = ?');
      values.push(possession_state ? 1 : 0);
    }
    if (parent_card_ids !== undefined) {
      updateFields.push('parent_card_ids = ?');
      values.push(JSON.stringify(parent_card_ids));
    }
    if (tags !== undefined) {
      updateFields.push('tags = ?');
      values.push(JSON.stringify(tags));
    }
    if (triggers !== undefined) {
      updateFields.push('triggers = ?');
      values.push(JSON.stringify(triggers));
    }
    if (linked_card_ids !== undefined) {
      updateFields.push('linked_card_ids = ?');
      values.push(JSON.stringify(linked_card_ids));
    }
    if (compressed_prompt !== undefined) {
      updateFields.push('compressed_prompt = ?');
      values.push(compressed_prompt);
    }
    if (unlock_conditions !== undefined) {
      updateFields.push('unlock_conditions = ?');
      values.push(JSON.stringify(unlock_conditions));
    }
    if (times_used !== undefined) {
      updateFields.push('times_used = ?');
      values.push(times_used);
    }
    if (last_used !== undefined) {
      updateFields.push('last_used = ?');
      values.push(last_used);
    }

    if (updateFields.length === 0) return await this.getById(id);

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const db = await this.getDB();
    db.run(`
      UPDATE cards
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, values);

    saveDatabase();
    return await this.getById(id);
  }

  static async delete(id) {
    const card = await this.getById(id);
    if (!card) return { success: false, error: 'Card not found' };

    // System and default cards cannot be deleted
    if (!this.isDeletable(card)) {
      throw new Error('System and default cards cannot be deleted.');
    }

    const db = await this.getDB();
    db.run('DELETE FROM cards WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  }

  // Clone a card (creates a user copy of any card)
  static async clone(id, overrides = {}) {
    const original = await this.getById(id);
    if (!original) return null;

    // Create a copy with source='user'
    const cloneData = {
      name: overrides.name || `${original.name} (Copy)`,
      type: original.type,
      rarity: original.rarity,
      source: 'user', // Clones are always user cards
      prompt_text: original.prompt_text,
      knowledge_level: 1, // Reset knowledge for clone
      parent_card_ids: original.parent_card_ids || [],
      tags: [...(original.tags || [])],
      triggers: [...(original.triggers || [])],
      linked_card_ids: [...(original.linked_card_ids || [])],
      compressed_prompt: original.compressed_prompt,
      unlock_conditions: {}
    };

    // Apply any overrides
    Object.assign(cloneData, overrides, { source: 'user' }); // Ensure source stays 'user'

    return await this.create(cloneData);
  }

  // Increment usage stats
  static async incrementUsage(id) {
    const card = await this.getById(id);
    if (!card) return null;

    return await this.update(id, {
      times_used: (card.times_used || 0) + 1,
      last_used: new Date().toISOString()
    });
  }

  static async updateKnowledge(id, progressionPoints) {
    const card = await this.getById(id);
    if (!card) return null;

    const newTotal = card.progression_points + progressionPoints;
    const newLevel = Math.min(
      Math.floor(newTotal / 3),
      card.max_knowledge_level
    );

    return await this.update(id, {
      progression_points: newTotal,
      knowledge_level: newLevel
    });
  }

  static async getCardsByIds(ids) {
    if (!ids || ids.length === 0) return [];

    const db = await this.getDB();
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT * FROM cards WHERE id IN (${placeholders})`);
    stmt.bind(ids);
    const cards = [];
    while (stmt.step()) {
      cards.push(this.parseCard(stmt.getAsObject()));
    }
    stmt.free();
    return cards;
  }

  // Tag management methods
  static async addTag(id, tag) {
    const card = await this.getById(id);
    if (!card) return null;

    const tags = card.tags || [];
    if (!tags.includes(tag)) {
      tags.push(tag);
      return await this.update(id, { tags });
    }
    return card;
  }

  static async removeTag(id, tag) {
    const card = await this.getById(id);
    if (!card) return null;

    const tags = (card.tags || []).filter(t => t !== tag);
    return await this.update(id, { tags });
  }

  // Link management methods
  static async addLink(id, linkedCardId) {
    const card = await this.getById(id);
    if (!card) return null;

    const linked_card_ids = card.linked_card_ids || [];
    if (!linked_card_ids.includes(linkedCardId)) {
      linked_card_ids.push(linkedCardId);
      return await this.update(id, { linked_card_ids });
    }
    return card;
  }

  static async removeLink(id, linkedCardId) {
    const card = await this.getById(id);
    if (!card) return null;

    const linked_card_ids = (card.linked_card_ids || []).filter(lid => lid !== linkedCardId);
    return await this.update(id, { linked_card_ids });
  }

  // Parent management methods
  static async addParent(id, parentId) {
    const card = await this.getById(id);
    if (!card) return null;

    // Check for cycles
    if (await this.wouldCreateCycle(id, parentId)) {
      throw new Error('Adding this parent would create a cycle');
    }

    const parent_card_ids = card.parent_card_ids || [];
    if (!parent_card_ids.includes(parentId)) {
      parent_card_ids.push(parentId);
      return await this.update(id, { parent_card_ids });
    }
    return card;
  }

  static async removeParent(id, parentId) {
    const card = await this.getById(id);
    if (!card) return null;

    const parent_card_ids = (card.parent_card_ids || []).filter(pid => pid !== parentId);
    return await this.update(id, { parent_card_ids });
  }

  // Cycle detection for DAG
  static async wouldCreateCycle(cardId, newParentId) {
    // If adding newParentId as a parent of cardId would create a cycle
    // Check if cardId is an ancestor of newParentId
    const visited = new Set();
    const stack = [newParentId];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === cardId) return true; // Found cycle
      if (visited.has(current)) continue;
      visited.add(current);

      const card = await this.getById(current);
      if (card && card.parent_card_ids) {
        stack.push(...card.parent_card_ids);
      }
    }

    return false;
  }

  // Get all ancestors (parents, grandparents, etc.) up to maxDepth
  static async getAncestors(id, maxDepth = 10) {
    const ancestors = [];
    const visited = new Set();
    let currentLevel = [id];
    let depth = 0;

    while (currentLevel.length > 0 && depth < maxDepth) {
      const nextLevel = [];
      for (const cardId of currentLevel) {
        if (visited.has(cardId)) continue;
        visited.add(cardId);

        const card = await this.getById(cardId);
        if (card && card.parent_card_ids) {
          for (const parentId of card.parent_card_ids) {
            if (!visited.has(parentId)) {
              const parent = await this.getById(parentId);
              if (parent) {
                ancestors.push(parent);
                nextLevel.push(parentId);
              }
            }
          }
        }
      }
      currentLevel = nextLevel;
      depth++;
    }

    return ancestors;
  }

  // Get all descendants (children, grandchildren, etc.) up to maxDepth
  static async getDescendants(id, maxDepth = 10) {
    const descendants = [];
    const visited = new Set();
    let currentLevel = [id];
    let depth = 0;

    while (currentLevel.length > 0 && depth < maxDepth) {
      const nextLevel = [];
      for (const cardId of currentLevel) {
        if (visited.has(cardId)) continue;
        visited.add(cardId);

        const children = await this.getNestedCards(cardId);
        for (const child of children) {
          if (!visited.has(child.id)) {
            descendants.push(child);
            nextLevel.push(child.id);
          }
        }
      }
      currentLevel = nextLevel;
      depth++;
    }

    return descendants;
  }

  // Trigger management methods
  static async addTrigger(id, trigger) {
    const card = await this.getById(id);
    if (!card) return null;

    const triggers = card.triggers || [];
    triggers.push(trigger);
    return await this.update(id, { triggers });
  }

  static async removeTrigger(id, triggerIndex) {
    const card = await this.getById(id);
    if (!card) return null;

    const triggers = card.triggers || [];
    triggers.splice(triggerIndex, 1);
    return await this.update(id, { triggers });
  }

  static async updateTrigger(id, triggerIndex, newTrigger) {
    const card = await this.getById(id);
    if (!card) return null;

    const triggers = card.triggers || [];
    if (triggerIndex >= 0 && triggerIndex < triggers.length) {
      triggers[triggerIndex] = newTrigger;
      return await this.update(id, { triggers });
    }
    return card;
  }
}

export default Card;
