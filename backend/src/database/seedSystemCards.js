import { initDatabase, saveDatabase } from './db.js';
import Card from '../models/Card.js';

/**
 * System Cards - Built-in, undeletable starter cards
 *
 * All cards are:
 * - source: 'system' (read-only, undeletable)
 * - rarity: 'Common'
 * - knowledge_level: 1
 * - Designed for LLM flexibility with broad descriptions
 */

const SYSTEM_CARDS = [
  // ============ LOCATIONS - Nature ============
  {
    name: 'Swamp',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A murky wetland with dark water, tangled vegetation, and an atmosphere of mystery.',
    tags: ['nature', 'water', 'outdoor']
  },
  {
    name: 'Beach',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A sandy shore where land meets sea, with waves and open sky.',
    tags: ['nature', 'water', 'outdoor']
  },
  {
    name: 'Forest',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Dense woods with trees, undergrowth, and dappled light.',
    tags: ['nature', 'outdoor']
  },
  {
    name: 'Cave',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A dark underground tunnel or cavern, cool and enclosed.',
    tags: ['nature', 'indoor', 'underground']
  },
  {
    name: 'River',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Flowing water cutting through the landscape, banks lined with vegetation.',
    tags: ['nature', 'water', 'outdoor']
  },
  {
    name: 'Mountain',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A rocky peak rising above the surrounding terrain, rugged and imposing.',
    tags: ['nature', 'outdoor', 'elevated']
  },

  // ============ LOCATIONS - Traditional/Rural ============
  {
    name: 'Tavern',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A local pub where travelers and locals gather for drink and conversation.',
    tags: ['building', 'indoor', 'social']
  },
  {
    name: 'Road',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A dirt path connecting places, traveled by foot, horse, or cart.',
    tags: ['outdoor', 'travel']
  },
  {
    name: 'Castle',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A stone fortress with walls, towers, and an air of authority.',
    tags: ['building', 'indoor', 'fortified']
  },
  {
    name: 'Village',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A small settlement with simple homes and a close-knit community.',
    tags: ['outdoor', 'settlement', 'rural']
  },
  {
    name: 'Market',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Busy stalls where merchants sell goods and crowds browse wares.',
    tags: ['outdoor', 'social', 'commerce']
  },
  {
    name: 'Alley',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A narrow lane between buildings, shadowed and less traveled.',
    tags: ['outdoor', 'urban']
  },

  // ============ LOCATIONS - Modern City ============
  {
    name: 'Street',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'An urban road with sidewalks, traffic, and city life.',
    tags: ['outdoor', 'urban', 'modern']
  },
  {
    name: 'Cafe',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A coffee spot where people meet, work, or relax over drinks.',
    tags: ['building', 'indoor', 'social', 'modern']
  },
  {
    name: 'Apartment',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A city home in a multi-unit building, personal living space.',
    tags: ['building', 'indoor', 'residential', 'modern']
  },
  {
    name: 'Park',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Green space in the city with trees, paths, and open areas.',
    tags: ['outdoor', 'urban', 'nature', 'modern']
  },
  {
    name: 'Office',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A work building with desks, meetings, and professional atmosphere.',
    tags: ['building', 'indoor', 'work', 'modern']
  },
  {
    name: 'Highway',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A fast road for vehicles, connecting distant places.',
    tags: ['outdoor', 'travel', 'modern']
  },
  {
    name: 'City Square',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'An open plaza in the urban center, a gathering point.',
    tags: ['outdoor', 'urban', 'social', 'modern']
  },
  {
    name: 'Shop',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A retail store selling goods to customers.',
    tags: ['building', 'indoor', 'commerce', 'modern']
  },
  {
    name: 'School',
    type: 'Location',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'A learning building with classrooms and students.',
    tags: ['building', 'indoor', 'education', 'modern']
  },

  // ============ TIME ============
  {
    name: 'Morning',
    type: 'Time',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Early daylight hours. The day begins, fresh and new.',
    tags: ['daytime']
  },
  {
    name: 'Afternoon',
    type: 'Time',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Midday light. The sun is high, activity in full swing.',
    tags: ['daytime']
  },
  {
    name: 'Night',
    type: 'Time',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Dark hours. Stars or city lights, a different world emerges.',
    tags: ['nighttime']
  },
  {
    name: 'Dawn',
    type: 'Time',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'First light. The transition from night to day, quiet and hopeful.',
    tags: ['transition']
  },
  {
    name: 'Dusk',
    type: 'Time',
    rarity: 'Common',
    source: 'system',
    prompt_text: 'Fading sun. The transition from day to night, shadows lengthening.',
    tags: ['transition']
  }
];

/**
 * Seed system cards into the database
 * Only adds cards that don't already exist
 */
async function seedSystemCards() {
  console.log('Seeding system cards...');

  const db = await initDatabase();
  let addedCount = 0;
  let skippedCount = 0;

  for (const cardData of SYSTEM_CARDS) {
    // Check if card already exists by name and type and source
    const stmt = db.prepare('SELECT id FROM cards WHERE name = ? AND type = ? AND source = ?');
    stmt.bind([cardData.name, cardData.type, 'system']);
    const exists = stmt.step();
    stmt.free();

    if (exists) {
      console.log(`  Skipping: ${cardData.name} (${cardData.type}) - already exists`);
      skippedCount++;
      continue;
    }

    // Create the card
    await Card.create({
      ...cardData,
      knowledge_level: 1
    });
    console.log(`  Added: ${cardData.name} (${cardData.type})`);
    addedCount++;
  }

  // Force save to disk
  saveDatabase();

  // Verify the cards were added
  const verifyStmt = db.prepare('SELECT COUNT(*) as count FROM cards WHERE source = ?');
  verifyStmt.bind(['system']);
  verifyStmt.step();
  const { count } = verifyStmt.getAsObject();
  verifyStmt.free();

  console.log(`\nSystem cards seeded! Added: ${addedCount}, Skipped: ${skippedCount}`);
  console.log(`Total system cards in DB: ${count}`);

  // Save again to ensure it's flushed
  saveDatabase();
}

// Run if executed directly
seedSystemCards()
  .then(() => {
    console.log('Seeding complete. Waiting for database flush...');
    // Give time for the save to complete
    setTimeout(() => {
      console.log('Done. Exiting...');
      process.exit(0);
    }, 1000);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

export { SYSTEM_CARDS, seedSystemCards };
export default seedSystemCards;
