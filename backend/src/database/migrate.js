import { initDatabase, saveDatabase } from './db.js';

/**
 * Migration script to add new columns to existing database
 * Run this manually if the database already exists
 */
async function migrate() {
  console.log('Starting database migration...');

  const db = await initDatabase();

  // List of migrations to apply
  const migrations = [
    {
      name: 'Add parent_card_ids column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='parent_card_ids'`,
      sql: `ALTER TABLE cards ADD COLUMN parent_card_ids TEXT DEFAULT '[]'`
    },
    {
      name: 'Add tags column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='tags'`,
      sql: `ALTER TABLE cards ADD COLUMN tags TEXT DEFAULT '[]'`
    },
    {
      name: 'Add triggers column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='triggers'`,
      sql: `ALTER TABLE cards ADD COLUMN triggers TEXT DEFAULT '[]'`
    },
    {
      name: 'Add linked_card_ids column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='linked_card_ids'`,
      sql: `ALTER TABLE cards ADD COLUMN linked_card_ids TEXT DEFAULT '[]'`
    },
    {
      name: 'Add compressed_prompt column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='compressed_prompt'`,
      sql: `ALTER TABLE cards ADD COLUMN compressed_prompt TEXT`
    },
    {
      name: 'Migrate parent_card_id to parent_card_ids',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='parent_card_id'`,
      sql: async (db) => {
        // Get all cards with parent_card_id set
        const stmt = db.prepare('SELECT id, parent_card_id FROM cards WHERE parent_card_id IS NOT NULL');
        const updates = [];
        while (stmt.step()) {
          const { id, parent_card_id } = stmt.getAsObject();
          updates.push({ id, parent_card_id });
        }
        stmt.free();

        // Update each card to use parent_card_ids array
        for (const { id, parent_card_id } of updates) {
          db.run('UPDATE cards SET parent_card_ids = ? WHERE id = ?', [
            JSON.stringify([parent_card_id]),
            id
          ]);
          console.log(`  Migrated card ${id}: parent_card_id ${parent_card_id} -> parent_card_ids [${parent_card_id}]`);
        }

        return updates.length > 0;
      }
    },
    {
      name: 'Create llm_settings table',
      check: `SELECT name FROM sqlite_master WHERE type='table' AND name='llm_settings'`,
      sql: `CREATE TABLE IF NOT EXISTS llm_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        active_provider TEXT DEFAULT 'openai',
        active_model TEXT DEFAULT 'gpt-4-turbo-preview',
        providers_config TEXT DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'Create script_settings table',
      check: `SELECT name FROM sqlite_master WHERE type='table' AND name='script_settings'`,
      sql: `CREATE TABLE IF NOT EXISTS script_settings (
        name TEXT PRIMARY KEY,
        enabled BOOLEAN DEFAULT 1,
        execution_order INTEGER,
        config TEXT DEFAULT '{}'
      )`
    },
    // V2.7 migrations
    {
      name: 'Add source column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='source'`,
      sql: `ALTER TABLE cards ADD COLUMN source TEXT DEFAULT 'user'`
    },
    {
      name: 'Add max_knowledge_level column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='max_knowledge_level'`,
      sql: `ALTER TABLE cards ADD COLUMN max_knowledge_level INTEGER DEFAULT 2`
    },
    {
      name: 'Add unlock_conditions column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='unlock_conditions'`,
      sql: `ALTER TABLE cards ADD COLUMN unlock_conditions TEXT DEFAULT '{}'`
    },
    {
      name: 'Add times_used column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='times_used'`,
      sql: `ALTER TABLE cards ADD COLUMN times_used INTEGER DEFAULT 0`
    },
    {
      name: 'Add last_used column',
      check: `SELECT name FROM pragma_table_info('cards') WHERE name='last_used'`,
      sql: `ALTER TABLE cards ADD COLUMN last_used TIMESTAMP`
    },
    {
      name: 'Update existing cards knowledge_level default',
      check: `SELECT 1 WHERE 0`, // Always run
      sql: `UPDATE cards SET knowledge_level = 1 WHERE knowledge_level = 0`
    },
    {
      name: 'Set max_knowledge_level based on rarity',
      check: `SELECT 1 WHERE 0`, // Always run
      sql: async (db) => {
        db.run(`UPDATE cards SET max_knowledge_level = 2 WHERE rarity = 'Common'`);
        db.run(`UPDATE cards SET max_knowledge_level = 3 WHERE rarity = 'Bronze'`);
        db.run(`UPDATE cards SET max_knowledge_level = 4 WHERE rarity = 'Silver'`);
        db.run(`UPDATE cards SET max_knowledge_level = 5 WHERE rarity = 'Gold'`);
        return true;
      }
    }
  ];

  let appliedCount = 0;

  for (const migration of migrations) {
    try {
      // Check if migration is needed
      const checkStmt = db.prepare(migration.check);
      const exists = checkStmt.step();
      checkStmt.free();

      if (!exists || (migration.name.includes('Migrate') && exists)) {
        console.log(`Applying: ${migration.name}...`);

        if (typeof migration.sql === 'function') {
          const applied = await migration.sql(db);
          if (applied) appliedCount++;
        } else {
          db.run(migration.sql);
          appliedCount++;
        }

        console.log(`  Done: ${migration.name}`);
      } else {
        console.log(`Skipping: ${migration.name} (already applied)`);
      }
    } catch (error) {
      // Some migrations may fail if column already exists, that's okay
      if (error.message.includes('duplicate column name')) {
        console.log(`Skipping: ${migration.name} (column already exists)`);
      } else {
        console.error(`Error applying ${migration.name}:`, error.message);
      }
    }
  }

  saveDatabase();
  console.log(`\nMigration complete! Applied ${appliedCount} migrations.`);
}

// Run migration if executed directly
migrate().catch(console.error);

export default migrate;
