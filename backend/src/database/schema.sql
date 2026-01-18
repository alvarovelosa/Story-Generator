-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('Character', 'Location', 'World', 'Time', 'Mood')),
  rarity TEXT NOT NULL CHECK(rarity IN ('Common', 'Bronze', 'Silver', 'Gold')),
  prompt_text TEXT NOT NULL,
  knowledge_level INTEGER DEFAULT 0,
  max_knowledge INTEGER NOT NULL,
  progression_points INTEGER DEFAULT 0,
  possession_state BOOLEAN DEFAULT 0,
  parent_card_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parent_card_id) REFERENCES cards(id) ON DELETE SET NULL
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT DEFAULT 'New Story',
  active_cards TEXT DEFAULT '[]', -- JSON array of card IDs
  story_memory TEXT DEFAULT '{}', -- JSON object
  quest_progress TEXT DEFAULT '{}', -- JSON object
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story history table
CREATE TABLE IF NOT EXISTS story_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  turn_number INTEGER NOT NULL,
  player_input TEXT NOT NULL,
  llm_response TEXT NOT NULL,
  system_prompt TEXT,
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_parent ON cards(parent_card_id);
CREATE INDEX IF NOT EXISTS idx_story_session ON story_history(session_id);
