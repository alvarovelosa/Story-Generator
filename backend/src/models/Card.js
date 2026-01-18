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

  static async getAll() {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards ORDER BY created_at DESC');
    const cards = [];
    while (stmt.step()) {
      cards.push(stmt.getAsObject());
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
      card = stmt.getAsObject();
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
      cards.push(stmt.getAsObject());
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
      cards.push(stmt.getAsObject());
    }
    stmt.free();
    return cards;
  }

  static async getNestedCards(parentId) {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE parent_card_id = ? ORDER BY created_at DESC');
    stmt.bind([parentId]);
    const cards = [];
    while (stmt.step()) {
      cards.push(stmt.getAsObject());
    }
    stmt.free();
    return cards;
  }

  static async getTopLevelCards() {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM cards WHERE parent_card_id IS NULL ORDER BY created_at DESC');
    const cards = [];
    while (stmt.step()) {
      cards.push(stmt.getAsObject());
    }
    stmt.free();
    return cards;
  }

  static async create(cardData) {
    const { name, type, rarity, prompt_text, parent_card_id = null } = cardData;
    const max_knowledge = this.getRarityMaxKnowledge(rarity);

    const db = await this.getDB();
    db.run(`
      INSERT INTO cards (name, type, rarity, prompt_text, max_knowledge, parent_card_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, type, rarity, prompt_text, max_knowledge, parent_card_id]);

    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const { id } = stmt.getAsObject();
    stmt.free();

    saveDatabase();
    return await this.getById(id);
  }

  static async update(id, cardData) {
    const { name, type, rarity, prompt_text, knowledge_level, progression_points, possession_state, parent_card_id } = cardData;

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
      updateFields.push('max_knowledge = ?');
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
    if (parent_card_id !== undefined) {
      updateFields.push('parent_card_id = ?');
      values.push(parent_card_id);
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
    const db = await this.getDB();
    db.run('DELETE FROM cards WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  }

  static async updateKnowledge(id, progressionPoints) {
    const card = await this.getById(id);
    if (!card) return null;

    const newTotal = card.progression_points + progressionPoints;
    const newLevel = Math.min(
      Math.floor(newTotal / 3),
      card.max_knowledge
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
      cards.push(stmt.getAsObject());
    }
    stmt.free();
    return cards;
  }
}

export default Card;
