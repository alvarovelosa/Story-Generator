# Quick Start Guide

## Setup (First Time Only)

### 1. Configure OpenAI API Key
Edit `backend/.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 2. Install Dependencies
Already done! But if needed in the future:
```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running the Application

### Option 1: Run Both Together (Recommended)
From the root directory:
```bash
npm run dev
```

### Option 2: Run Separately
**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## First Steps

### 1. Builder Mode
1. Navigate to **Builder** tab
2. You'll see 4 starter cards already created
3. Click **"+ Create Card"** to make your own:
   - Enter a name (e.g., "Grumpy Merchant")
   - Select type (Character, Location, World, Time, or Mood)
   - Choose rarity (Common, Bronze, Silver, Gold)
   - Write the prompt text that describes this card
4. Click **"Create Card"**

### 2. Player Mode
1. Navigate to **Player** tab
2. Click **"+ New Session"** to start a story
3. Click **"+ Add Cards"** in the right panel
4. Select cards to activate (they will shape your story)
5. Type your first action in the input box
6. Press **Send** and watch the AI respond!

## Example Workflow

1. **Create a World Card** (e.g., "Space Station Setting")
2. **Create a Location Card** (e.g., "Command Center")
3. **Create a Character Card** (e.g., "Captain Sarah Chen")
4. **Go to Player Mode**
5. **Activate those 3 cards**
6. **Type**: "I walk into the command center"
7. **The AI will respond** based on all your active cards!

## Key Features

- **Dynamic Prompts**: Active cards automatically build the AI's instructions
- **Story Memory**: System tracks key events to maintain continuity
- **Rarity System**: Higher rarity = more detailed cards
- **Multiple Sessions**: Save different stories separately

## Tips

- Start with 3-5 cards activated
- Use World cards to set rules and atmosphere
- Use Location + Time cards to set the scene
- Use Character cards to populate your story
- Use Mood cards to control the tone

## Troubleshooting

**Backend won't start:**
- Make sure your OpenAI API key is set in `backend/.env`
- Check that port 3000 is not in use

**Frontend won't start:**
- Check that port 5173 is not in use

**No cards appearing:**
- Database was initialized with 4 starter cards
- Check backend console for errors

**Story generation fails:**
- Verify OpenAI API key is valid
- Check backend console for error messages
- Ensure you have API credits

## Next Steps

Check the main README.md for:
- Full feature list
- API documentation
- Development roadmap (Auto-Cards, Knowledge Progression, etc.)
