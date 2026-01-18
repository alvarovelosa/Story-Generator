# Story Generator - Card-Based AI Storytelling System

An AI-powered interactive storytelling platform where narrative prompts are organized as collectible cards that players unlock organically through gameplay.

## Features

### Phase 1 (Current - Core Foundation)
- ✅ **Card System**: Create and manage 5 card types (Character, Location, World, Time, Mood)
- ✅ **Rarity Tiers**: Common, Bronze, Silver, Gold cards with different detail levels
- ✅ **Builder Frontend**: Create and edit cards with an in-app editor
- ✅ **Player Frontend**: Interactive story interface with card activation
- ✅ **Dynamic Prompts**: System automatically builds LLM prompts from active cards
- ✅ **Story Memory**: Tracks key events and maintains narrative continuity
- ✅ **OpenAI Integration**: GPT-4 powered story generation

### Phase 2 (Coming Soon)
- 🔄 **Auto-Cards**: Automatic card generation from story events
- 🔄 **Knowledge Progression**: Cards unlock deeper details through gameplay
- 🔄 **Quest Tracking**: Monitor and complete story objectives

### Phase 3 (Planned)
- 📋 **Gold Card Hierarchy**: Nested card systems for complex content
- 📋 **Prompt Optimization**: Smart compression for token efficiency
- 📋 **Possession Tracking**: Track character companions and items

## Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   cd "Story Generator"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment**
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

5. **Initialize Database**
   ```bash
   npm run init-db
   ```

### Running the Application

1. **Start Backend Server** (in `/backend` directory)
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:3000

2. **Start Frontend** (in `/frontend` directory, in a new terminal)
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173

3. **Open your browser** and navigate to http://localhost:5173

## Usage Guide

### Builder Mode
1. Navigate to **Builder** tab
2. Click **"+ Create Card"**
3. Fill in:
   - **Name**: Card identifier
   - **Type**: Character, Location, World, Time, or Mood
   - **Rarity**: Common, Bronze, Silver, Gold
   - **Prompt Text**: Instructions for the LLM
4. Click **"Create Card"**

### Player Mode
1. Navigate to **Player** tab
2. Click **"+ New Session"** to start a story
3. Click **"+ Add Cards"** to activate cards
4. Selected cards will influence the story
5. Type your action in the input box and press **Send**
6. The AI will respond based on your active cards and story context

## Project Structure

```
Story Generator/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (PromptBuilder, StoryMemory)
│   │   ├── scripts/         # Utility scripts (Auto-Cards, etc.)
│   │   ├── database/        # SQLite database & schema
│   │   └── server.js        # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Builder & Player pages
│   │   ├── services/        # API client
│   │   ├── store/           # Zustand state management
│   │   └── styles/          # CSS files
│   └── package.json
│
└── docs/                    # Documentation & PRD
```

## API Endpoints

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards/:id` - Get card by ID
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create new session
- `POST /api/sessions/:id/activate-card` - Activate a card
- `POST /api/sessions/:id/deactivate-card` - Deactivate a card

### Story
- `POST /api/story/turn` - Generate next story turn
- `GET /api/story/history/:sessionId` - Get story history
- `GET /api/story/prompt/:sessionId` - Get current system prompt

## Technology Stack

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- OpenAI API (GPT-4)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router

## Environment Variables

```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
DATABASE_PATH=./src/database/story_generator.db
NODE_ENV=development
OPENAI_MODEL=gpt-4-turbo-preview
```

## Development Roadmap

**Week 1-2: Core Foundation** ✅
- Basic card CRUD
- Story generation
- Builder & Player interfaces

**Week 3-4: Auto-Cards & Scripts**
- Pattern detection engine
- Knowledge level progression
- Quest tracking

**Week 5-6: Gold Containers**
- Hierarchical card systems
- Prompt optimization
- Possession state tracking

**Week 7+: Testing & Polish**
- Comprehensive test suite
- Performance optimization
- Bug fixes

## Contributing

This is a prototype project. Contributions welcome!

## License

MIT License

## Support

For issues or questions, please check the documentation in `/docs` or create an issue in the repository.
