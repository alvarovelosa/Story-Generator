import { initDatabase, saveDatabase } from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  console.log('Initializing database...');

  const db = await initDatabase();

  // Read and execute schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // Execute schema statements
  db.exec(schema);

  console.log('Database schema created successfully!');

  // Insert starter cards
  const starterCards = [
    {
      name: 'Medieval Fantasy Setting',
      type: 'World',
      rarity: 'Gold',
      prompt_text: 'This is a medieval fantasy world with magic, knights, and ancient kingdoms. Magic is rare but powerful, practiced by trained wizards. The land is divided into five kingdoms, each with their own culture and customs. Dragons are legendary creatures, rarely seen but deeply feared.',
      max_knowledge_level: 5
    },
    {
      name: 'Dark and Mysterious',
      type: 'Mood',
      rarity: 'Bronze',
      prompt_text: 'The atmosphere should be dark, mysterious, and slightly ominous. Shadows lurk in corners, and danger feels ever-present. Create tension and suspense in your descriptions.',
      max_knowledge_level: 3
    },
    {
      name: 'Tavern Quarter',
      type: 'Location',
      rarity: 'Silver',
      prompt_text: 'A bustling district filled with inns, taverns, and alehouses. The cobblestone streets are crowded with travelers, merchants, and locals. Lanterns cast a warm glow in the evening. The smell of roasted meat and ale fills the air.',
      max_knowledge_level: 4
    },
    {
      name: 'Evening Time',
      type: 'Time',
      rarity: 'Common',
      prompt_text: 'It is evening, with the sun setting on the horizon. Shadows grow longer and the air cools. People begin to light lanterns and candles.',
      max_knowledge_level: 2
    }
  ];

  try {
    const stmt = db.prepare(`
      INSERT INTO cards (name, type, rarity, prompt_text, max_knowledge_level)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const card of starterCards) {
      stmt.run([card.name, card.type, card.rarity, card.prompt_text, card.max_knowledge_level]);
    }
    stmt.free();

    console.log(`Inserted ${starterCards.length} starter cards`);
  } catch (err) {
    console.log('Starter cards may already exist, skipping insertion');
  }

  // Save database to file
  saveDatabase();
  console.log('Database setup complete!');
}

initializeDatabase().catch(console.error);
