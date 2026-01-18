import { initDatabase, saveDatabase } from '../database/db.js';

class Session {
  static async getDB() {
    return await initDatabase();
  }

  static async getAll() {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC');
    const sessions = [];
    while (stmt.step()) {
      const session = stmt.getAsObject();
      session.active_cards = JSON.parse(session.active_cards);
      session.story_memory = JSON.parse(session.story_memory);
      session.quest_progress = JSON.parse(session.quest_progress);
      sessions.push(session);
    }
    stmt.free();
    return sessions;
  }

  static async getById(id) {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
    stmt.bind([id]);
    let session = null;
    if (stmt.step()) {
      session = stmt.getAsObject();
      session.active_cards = JSON.parse(session.active_cards);
      session.story_memory = JSON.parse(session.story_memory);
      session.quest_progress = JSON.parse(session.quest_progress);
    }
    stmt.free();
    return session;
  }

  static async create(name = 'New Story') {
    const db = await this.getDB();
    db.run(`
      INSERT INTO sessions (name, active_cards, story_memory, quest_progress)
      VALUES (?, '[]', '{}', '{}')
    `, [name]);

    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const { id } = stmt.getAsObject();
    stmt.free();

    saveDatabase();
    return await this.getById(id);
  }

  static async update(id, sessionData) {
    const { name, active_cards, story_memory, quest_progress } = sessionData;

    let updateFields = [];
    let values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (active_cards !== undefined) {
      updateFields.push('active_cards = ?');
      values.push(JSON.stringify(active_cards));
    }
    if (story_memory !== undefined) {
      updateFields.push('story_memory = ?');
      values.push(JSON.stringify(story_memory));
    }
    if (quest_progress !== undefined) {
      updateFields.push('quest_progress = ?');
      values.push(JSON.stringify(quest_progress));
    }

    if (updateFields.length === 0) return await this.getById(id);

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const db = await this.getDB();
    db.run(`
      UPDATE sessions
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, values);

    saveDatabase();
    return await this.getById(id);
  }

  static async delete(id) {
    const db = await this.getDB();
    db.run('DELETE FROM sessions WHERE id = ?', [id]);
    saveDatabase();
    return { success: true };
  }

  static async addActiveCard(id, cardId) {
    const session = await this.getById(id);
    if (!session) return null;

    if (!session.active_cards.includes(cardId)) {
      session.active_cards.push(cardId);
      return await this.update(id, { active_cards: session.active_cards });
    }

    return session;
  }

  static async removeActiveCard(id, cardId) {
    const session = await this.getById(id);
    if (!session) return null;

    session.active_cards = session.active_cards.filter(cid => cid !== cardId);
    return await this.update(id, { active_cards: session.active_cards });
  }
}

export default Session;
