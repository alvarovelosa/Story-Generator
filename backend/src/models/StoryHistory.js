import { initDatabase, saveDatabase } from '../database/db.js';

class StoryHistory {
  static async getDB() {
    return await initDatabase();
  }

  static async getBySessionId(sessionId) {
    const db = await this.getDB();
    const stmt = db.prepare(`
      SELECT * FROM story_history
      WHERE session_id = ?
      ORDER BY turn_number ASC
    `);
    stmt.bind([sessionId]);
    const history = [];
    while (stmt.step()) {
      history.push(stmt.getAsObject());
    }
    stmt.free();
    return history;
  }

  static async getById(id) {
    const db = await this.getDB();
    const stmt = db.prepare('SELECT * FROM story_history WHERE id = ?');
    stmt.bind([id]);
    let entry = null;
    if (stmt.step()) {
      entry = stmt.getAsObject();
    }
    stmt.free();
    return entry;
  }

  static async create(historyData) {
    const { session_id, turn_number, player_input, llm_response, system_prompt, token_count } = historyData;

    const db = await this.getDB();
    db.run(`
      INSERT INTO story_history (session_id, turn_number, player_input, llm_response, system_prompt, token_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [session_id, turn_number, player_input, llm_response, system_prompt, token_count]);

    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const { id } = stmt.getAsObject();
    stmt.free();

    saveDatabase();
    return await this.getById(id);
  }

  static async getLastTurnNumber(sessionId) {
    const db = await this.getDB();
    const stmt = db.prepare(`
      SELECT MAX(turn_number) as last_turn
      FROM story_history
      WHERE session_id = ?
    `);
    stmt.bind([sessionId]);
    let lastTurn = 0;
    if (stmt.step()) {
      const result = stmt.getAsObject();
      lastTurn = result.last_turn || 0;
    }
    stmt.free();
    return lastTurn;
  }

  static async deleteBySessionId(sessionId) {
    const db = await this.getDB();
    db.run('DELETE FROM story_history WHERE session_id = ?', [sessionId]);
    saveDatabase();
    return { success: true };
  }
}

export default StoryHistory;
