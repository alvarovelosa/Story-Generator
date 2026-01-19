-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('Character', 'Location', 'World', 'Time', 'Mood')),
  rarity TEXT NOT NULL CHECK(rarity IN ('Common', 'Bronze', 'Silver', 'Gold')),
  source TEXT NOT NULL DEFAULT 'user' CHECK(source IN ('system', 'default', 'user', 'auto_generated')),
  prompt_text TEXT NOT NULL,
  knowledge_level INTEGER DEFAULT 1,
  max_knowledge_level INTEGER DEFAULT 2,
  progression_points INTEGER DEFAULT 0,
  possession_state BOOLEAN DEFAULT 0,
  parent_card_ids TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  triggers TEXT DEFAULT '[]',
  linked_card_ids TEXT DEFAULT '[]',
  compressed_prompt TEXT,
  unlock_conditions TEXT DEFAULT '{}',
  times_used INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT DEFAULT 'New Story',
  active_cards TEXT DEFAULT '[]',
  story_memory TEXT DEFAULT '{}',
  quest_progress TEXT DEFAULT '{}',
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

-- LLM settings table
CREATE TABLE IF NOT EXISTS llm_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active_provider TEXT DEFAULT 'openai',
  active_model TEXT DEFAULT 'gpt-4-turbo-preview',
  providers_config TEXT DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Script settings table
CREATE TABLE IF NOT EXISTS script_settings (
  name TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT 1,
  execution_order INTEGER,
  config TEXT DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_story_session ON story_history(session_id);
