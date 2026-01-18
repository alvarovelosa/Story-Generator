
## **EXECUTIVE SUMMARY**

**Product Vision:** An AI-powered interactive storytelling platform where narrative prompts are organized as collectible cards that players unlock organically through gameplay, creating personalized story experiences with gamified progression.

**Target Users:**

- Primary: Interactive fiction enthusiasts and AI Dungeon players seeking structured yet flexible storytelling
    
- Secondary: Game masters/worldbuilders who want reusable narrative frameworks
    

**Key Success Metrics:**

- Card unlock rate (average cards unlocked per 30-minute session)
    
- Story continuation rate (% of users who return for 2+ sessions)
    
- Builder tool engagement (% of users who create custom cards)
    

---

## **PROBLEM & OPPORTUNITY**

**Problem Statement:**  
Current AI storytelling tools (ChatGPT, AI Dungeon) lack persistent progression systems that reward exploration and provide narrative structure. Users face blank-slate fatigue and stories lack mechanical depth .

**Market Opportunity:**

- Combines collectible card game psychology with AI narrative generation
    
- Bridges gap between free-form AI chat and structured game mechanics
    
- Provides framework for user-generated content that other players can experience
    

**Strategic Fit:**  
This prototype tests whether card-based prompt management can create engaging, repeatable story experiences while solving LLM context management through hierarchical content loading .

---

## **USER PERSONAS & USE CASES**

**Primary Persona: The Story Explorer**

- Wants emergent narratives with mechanical progression
    
- Values discovering new content through gameplay
    
- Enjoys both creating and consuming story worlds
    

**Secondary Persona: The Worldbuilder**

- Creates comprehensive story settings with characters, locs, lore
    
- Uses Builder frontend to design card collections
    
- Shares card packs with other users
    

**Top User Stories:**

1. **As a player**, I want to unlock character cards by encountering them in stories, so I feel progression and can reuse favorite characters in future sessions
    
    - _Acceptance Criteria:_ When NPC appears 3+ times with distinct traits, Bronze/Silver character card auto-generates with extracted personality
        
2. **As a player**, I want my active cards to shape the story without manually re-explaining context, so gameplay flows naturally
    
    - _Acceptance Criteria:_ System prompt dynamically builds from active cards; LLM responses reflect card content without player repeating information
        
3. **As a worldbuilder**, I want to create Gold faction cards that contain multiple related characters/locations, so I can activate entire storylines at once
    
    - _Acceptance Criteria:_ Builder allows parent-child card relationships; nested cards only appear in library when Gold parent is active
        
4. **As a player**, I want to track quest progress within World cards and see stories respond to completion, so goals feel meaningful
    
    - _Acceptance Criteria:_ Quest tracking script monitors story for milestone patterns; can unlock specific cards upon quest completion
        
5. **As a prototype tester**, I want transparent access to see exact prompts sent to LLM and manually trigger card generation, so I can debug and iterate
    
    - _Acceptance Criteria:_ Builder frontend shows live system prompt preview, token counter, and manual Auto-Cards trigger buttons
        

---

## **PRODUCT REQUIREMENTS**

## **Core Card System**

## **Card Types & Structure**

**Priority: P0 (Critical)**

Card types available:

- **Character Cards:** NPC personalities, relationships, backgrounds
    
- **Location Cards:** Settings with atmospheric details
    
- **World Cards:** Lore, rules, cultural context, quests/goals, items
    
- **Time Cards:** Temporal context (era, time of day, season)
    
- **Mood Cards:** Tone directives (dark/whimsical/serious/etc.)
    

Each card contains:

- **Name** (user-facing identifier)
    
- **Type** (one of five types above)
    
- **Rarity** (Common/Bronze/Silver/Gold)
    
- **Prompt Text** (instructions injected into LLM system prompt)
    
- **Knowledge Level** (0-5, determines detail depth available)
    
- **Possession State** (boolean for characters/items - "do I have this?")
    
- **Parent Card ID** (null or reference to Gold container card)
    

_User Benefit:_ Modular prompt building allows infinite story combinations from finite card collection

_Acceptance Criteria:_

- Builder frontend can create/edit all card types
    
- Each card saves with all metadata fields
    
- Cards display visually distinct by rarity (color coding)
    

**Dependencies:** Database schema for card storage

---

## **Rarity System with Hierarchical Depth**

**Priority: P0 (Critical)**

**Rarity Tiers:**

- **Common (gray):** 1-2 sentence prompts, max Knowledge Level 2
    
- **Bronze (brown):** 3-4 sentences, max Knowledge Level 3
    
- **Silver (white/silver):** 5-7 sentences, max Knowledge Level 4
    
- **Gold (gold):** 8+ sentences, max Knowledge Level 5, **can contain nested sub-cards**
    

**Gold Cards as Containers:**  
Gold cards unlock entire subsystems when activated :

- **Gold Location:** Contains nested sub-locations (e.g., "Mystwood Forest" contains "The Glade," "Ancient Ruins," "Forest Path")
    
- **Gold Religion:** Contains priests, temples, rituals, holy items
    
- **Gold Faction:** Contains member characters, hideout locations, faction missions
    
- **Gold Character:** Contains entourage (guards, advisors, family members), associated locations
    

When Gold card is active:

- Nested cards become available in player library
    
- Prompt optimizer compresses Gold parent to essence (~100 tokens)
    
- Only actively used nested cards load in full detail
    
- When Gold card deactivates, nested cards become unavailable
    

_User Benefit:_ Gold cards provide expansion-pack depth without overwhelming prompts; mechanically justifies rarity beyond "better stats"

_Acceptance Criteria:_

- Builder can assign parent-child relationships between Gold and other cards
    
- Player library UI shows nested cards as expandable tree under Gold parents
    
- Nested cards cannot be activated without parent Gold card active
    
- Prompt system automatically compresses Gold parents when nested cards are primary focus
    

**Dependencies:** Prompt optimization script, hierarchical data structure

---

## **Knowledge Level Progression**

**Priority: P0 (Critical)**

Progressive unlock system where repeated story interaction deepens card detail :

**Progression Formula:**

- Progression points earned through story interactions
    
- Every 3 progression points = +1 Knowledge Level
    
- Formula: `knowledge_level = floor(progression_points / 3)`
    
- Max level capped by rarity (Common: 2, Bronze: 3, Silver: 4, Gold: 5)
    

**Point Earning:**

- Mention card subject in conversation: +1 point
    
- Ask questions about card topic: +2 points
    
- Major story event involving card: +3 points
    
- Detailed exploration of card elements: +2 points
    

**Prompt Impact:**  
At Knowledge 0: Only basic facts visible ("mysterious merchant")  
At Knowledge 3: Personality, backstory, motivations revealed  
At Knowledge 5: Deep secrets, complex relationships, hidden abilities unlocked

_User Benefit:_ Creates progression curve; rewards exploration of characters/locations over time

_Acceptance Criteria:_

- Auto-Cards script detects knowledge-earning patterns in story
    
- Card display shows current level and progress to next level
    
- LLM system prompt includes only details available at current knowledge level
    
- Visual feedback when knowledge increases ("You learned more about X!")
    

**Dependencies:** Auto-Cards generation script, prompt builder

---

## **Possession State**

**Priority: P1 (Important)**

Boolean flag tracking whether player "has" a character/item:

- **Characters:** Do they travel with you? Are they allies?
    
- **Items/Weapons:** Do you own/carry them?
    
- **Locations/Time/Mood:** N/A (always available context, no possession)
    

**State Change Triggers:**  
Detected by Auto-Cards script through pattern matching:

- "you obtain [item]" / "you find [item]" → possession = true
    
- "[character] joins you" / "becomes your ally" → possession = true
    
- "you lose [item]" / "[character] leaves" → possession = false
    

_User Benefit:_ Prevents narrative contradictions (can't use sword you don't have); tracks companion availability

_Acceptance Criteria:_

- Cards display possession state visually (checkmark/lock icon)
    
- Script detects common acquisition/loss keywords
    
- LLM prompt reflects possession state ("your companion X" vs "the distant character X")
    
- Builder frontend allows manual possession override for testing
    

**Dependencies:** Auto-Cards pattern detection

---

## **AUTO-CARDS GENERATION SYSTEM**

## **Event-Driven Card Creation**

**Priority: P0 (Critical)**

Automatically generates cards based on story interactions using script-based pattern detection (inspired by AI Dungeon's Auto-Cards system) .

**Core Mechanism:**

- Monitor story content for narrative patterns and events (not simple keyword matching)
    
- Analyze story context to determine appropriate card type, rarity, initial Knowledge Level
    
- Embedded script triggers fire when specific story conditions met
    

**Generation Triggers by Card Type:**

**CHARACTER CARDS:**

- Pattern: NPC mentioned 3+ times with distinct personality traits
    
- Trigger: Generate Bronze/Silver character card with extracted traits
    
- Example: "the mysterious cloaked merchant who always speaks in riddles" → Silver Character "The Riddling Merchant"
    

**LOCATION CARDS:**

- Pattern: Place described with specific atmospheric details
    
- Trigger: Generate location card matching detail level
    
- Example: "abandoned lighthouse on northern cliffs, waves crashing below" → Silver Location "Northern Cliffs Lighthouse"
    

**WORLD CARDS:**

- Pattern: Consistent world rules established (magic systems, factions, species)
    
- Trigger: Generate World card documenting discovered lore
    
- Example: Multiple references to "fire magic forbidden by the Crown" → World card with cultural rule
    

**ITEM CARDS (via World type):**

- Pattern: Significant object with described properties
    
- Trigger: Generate with Knowledge Level 1, Possession = false initially
    
- Example: "legendary Sword of Doom that glows red" → Item card at Knowledge 1, unlocks Possession when "obtains sword" detected
    

_User Benefit:_ Organic card collection growth through play; removes manual card creation burden during gameplay

_Acceptance Criteria:_

- Script runs on each LLM response
    
- New cards appear in library with notification ("New card unlocked!")
    
- Generated cards have appropriate rarity based on narrative prominence
    
- Builder frontend has "Force Generate Card" button for testing trigger logic
    
- Debug mode shows all detected patterns that could trigger generation
    

**Dependencies:** Pattern matching script, LLM response parsing

---

## **Knowledge Level Auto-Progression**

**Priority: P0 (Critical)**

Existing cards automatically gain knowledge through continued story interaction:

**Increment Conditions:**

- Card-related story interaction detected → +1 progression point
    
- Every N progression points → +1 Knowledge Level
    
- Max level varies by card rarity
    

_User Benefit:_ Characters/locations become richer over time without manual intervention

_Acceptance Criteria:_

- Auto-Cards script tracks progression points per card
    
- Level-up triggers prompt text expansion (more details available)
    
- Visual feedback when card levels up
    
- Builder frontend shows progression point thresholds
    

**Dependencies:** Same Auto-Cards script as generation

---

## **Nested Card Auto-Generation**

**Priority: P1 (Important)**

When story generates content related to active Gold container card, system can auto-generate nested child cards:

Example: Gold "Shadow Thieves Guild" is active → story mentions "a young thief in the guild" → auto-generates Bronze character nested under Guild Gold card

_User Benefit:_ Gold cards organically grow subsystems; faction/religion cards populate with members over time

_Acceptance Criteria:_

- Script detects when generated content relates to active Gold parent
    
- New nested card links to parent via Parent Card ID
    
- Nested card only appears when parent is active
    

**Dependencies:** Gold card container system, Auto-Cards script

---

## **PROMPT MANAGEMENT SYSTEM**

## **Dynamic System Prompt Builder**

**Priority: P0 (Critical)**

Constructs LLM system prompt in real-time from active cards :

**Prompt Structure:**

text

`[Base Instructions] - Core storytelling directives - Response format requirements   - Tone/style guidelines [Active Card Prompts - by priority] 1. Mood Cards (override base tone) 2. World Cards (establish rules, active quests) 3. Location + Time Cards (set scene) 4. Character Cards (populate scene) 5. Story Memory (recent events, quest progress) [Current Scene State] - What's happening now - Available actions/directions`

**Priority Ordering Logic:**

- Mood overrides base tone (applied first)
    
- World establishes rules (applied second)
    
- Location + Time set scene (third)
    
- Characters populate scene (fourth)
    
- Story memory ensures consistency (woven throughout)
    

_User Benefit:_ Cards automatically shape story without player re-explaining context each turn

_Acceptance Criteria:_

- Each turn rebuilds system prompt from currently active cards
    
- Card prompt text injected in correct priority order
    
- Knowledge Level determines which prompt details included
    
- Builder frontend shows live preview of exact system prompt being sent to LLM
    
- Token counter displays current prompt size
    

**Dependencies:** Card database, story memory script

---

## **Story Memory Compression**

**Priority: P0 (Critical)**

Maintains narrative continuity while keeping prompts lean by tracking essential story state instead of full conversation history :

**Implementation:**

javascript

``class StoryMemory {   constructor() {    this.currentLocation = null;    this.recentEvents = []; // Last 5 key moments    this.questProgress = {}; // Active quest states    this.maxEvents = 5;  }     addEvent(eventDescription) {    this.recentEvents.push(eventDescription);    if (this.recentEvents.length > this.maxEvents) {      this.recentEvents.shift(); // Drop oldest    }  }     buildPrompt(activeCards, playerAction) {    return `      Location: ${this.currentLocation}      Recent Events: ${this.recentEvents.join(', ')}      Quest Progress: ${this.questProgress}      Active Cards: ${activeCards.map(c => c.compressedPrompt)}      Player Action: ${playerAction}    `;  } }``

**Why This Works:**

- After 50 turns: Traditional = massive prompt with all history
    
- With compression: Only "found X, defeated Y, quest at Z"
    
- Same narrative continuity, fraction of tokens
    
- LLM stays coherent without context overload
    

**Each Turn Flow:**

1. Build full context from active cards
    
2. Generate LLM response with full context + story memory
    
3. Extract key events from response → update story memory
    
4. Clear heavy context, keep only compressed memory for next turn
    

_User Benefit:_ Long sessions remain coherent without exponential token bloat

_Acceptance Criteria:_

- Story memory tracks last 5 key events, current location, quest states
    
- Old conversation history not passed to LLM after being compressed
    
- Builder frontend shows live story memory state
    
- Manual event addition/removal controls for testing
    
- Adjustable maxEvents threshold
    

**Dependencies:** LLM response parsing

---

## **Hierarchical Prompt Optimization**

**Priority: P0 (Critical)**

Automatically compresses Gold container cards when nested sub-cards are active :

**Optimization Pattern:**  
When player is in nested sub-location:

1. Compress parent Gold location to essence (~100 tokens: "dense magical forest")
    
2. Load full detail of specific sub-location they're in
    
3. Track which sub-locations visited in story memory
    

**Token Savings Example:**

text

`Without optimization: - Gold "Mystwood Forest": 800 tokens - Silver "Ancient Ruins": 300 tokens - Total: 1,100 tokens With compression: - Gold compressed: 100 tokens - Silver full: 300 tokens   - Total: 400 tokens (60% reduction!)`

**Applies to All Gold Cards:**

- Gold Faction active + specific member character present = compress faction, load character
    
- Gold Religion active + temple location present = compress religion, load temple
    
- System detects parent-child relationships and adjusts automatically
    

_User Benefit:_ Rich Gold cards don't cause token overflow; natural "zoom in/zoom out" storytelling

_Acceptance Criteria:_

- Script detects when nested card is primary story focus
    
- Gold parent auto-compresses to brief context
    
- Switching between nested cards swaps which is fully loaded
    
- Builder shows compression preview (full vs compressed versions side-by-side)
    

**Dependencies:** Gold container card system, token counter

---

## **CORE SCRIPT SYSTEMS**

## **Script 1: Auto-Cards Generation Script**

**Priority: P0 (Critical)**

The heart of gamification - proves cards unlock organically from stories .

**Functions:**

- Pattern detection for card generation triggers
    
- Knowledge Level progression tracking
    
- Possession state change detection
    
- Nested card generation for Gold parents
    

**Technical Integration:**

text

`Story Output → Auto-Cards Script Engine → Pattern Analysis                                         ↓                          [Match any trigger?]                                        ↓                 YES: Generate/update card | NO: Continue monitoring                                        ↓                          Update Card Database                                        ↓                     Show unlock notification`

_Acceptance Criteria:_

- Runs on every LLM response
    
- Configurable thresholds (mentions needed, detail levels)
    
- Builder can manually trigger for testing
    
- Logs all pattern matches for debugging
    

**Definition of Done:**

- Player can naturally unlock 3+ cards in 30-minute test session
    
- Generated cards have appropriate rarity/type
    
- Knowledge progression visible over multiple interactions
    

---

## **Script 2: Quest/Goal Tracking Script**

**Priority: P0 (Critical)**

Since goals live inside World cards, need basic tracking to prove system responds to story progress .

**Functions:**

- Monitor story for quest milestone patterns
    
- Update quest progress percentages
    
- Trigger events/unlock cards when quests complete
    
- Track multiple simultaneous quests
    

**Example Patterns:**

- Quest: "Find the spy" → tracks mentions of suspects, investigation actions
    
- Quest: "Collect 3 ancient relics" → counts relic acquisitions in story
    
- Quest complete → can unlock specific Gold card or nested content
    

_Acceptance Criteria:_

- World cards with goals show current progress
    
- Story events correctly increment quest milestones
    
- Quest completion triggers unlock notification
    
- Builder can define custom quest completion conditions
    

**Definition of Done:**

- Test quest progresses from 0% → 100% through story actions
    
- Completion unlocks specified reward card
    
- Multiple quests track independently
    

---

## **Script 3: Story Memory Script**

**Priority: P0 (Critical)**

Bare minimum consistency - remembers what was established so LLM doesn't contradict itself .

**Functions:**

- Extracts key events from each story turn
    
- Maintains rolling window of recent events (last 5)
    
- Tracks current location, active quests, established facts
    
- Compresses old history while preserving continuity
    

**Prevents:**

- "Wait, I thought that character died" moments
    
- Forgetting quest objectives mid-session
    
- Contradicting established world rules
    
- Location confusion
    

_Acceptance Criteria:_

- Story maintains consistency across 10+ turn test session
    
- Key events from 5 turns ago still influence current story
    
- Builder shows live story memory state
    
- Manual override to add/remove memory entries
    

**Definition of Done:**

- LLM references past events correctly in responses
    
- No major contradictions during 30-minute test session
    
- Story memory stays under token limit
    

---

## **TECHNICAL REQUIREMENTS**

## **Backend Architecture**

- **Language:** Node.js/Python (flexible for prototype)
    
- **Database:** SQLite for rapid prototyping (card storage, user sessions)
    
- **LLM Integration:** OpenAI API (GPT-4 or similar)
    
- **Scripts:** Modular JavaScript/Python classes (Auto-Cards, Quest Tracking, Story Memory)
    

## **Frontend Architecture**

**Dual Frontend Approach:**

**Builder Frontend (Development/Testing):**

- Transparent view of all system internals
    
- Card CRUD operations
    
- Live system prompt preview
    
- Token counter
    
- Manual script triggers
    
- Debug logs for pattern matching

---

## **Card Generator Tool (Builder Frontend)**

**Priority: P0 (Critical)**

AI-powered card creation system for worldbuilders. Maximum flexibility — user can do everything manually, everything auto-generated, or any mix.

### **Home Screen Entry Points**

- **[+ Character]** **[+ Location]** **[+ World]** **[+ Time]** **[+ Mood]** — Quick-add buttons per card type
- **[Import Card]** / **[Import Pack]** — JSON format for compatibility
- **Chat Box** — Paste anything, chat, iterate with AI

### **Single Card Creation Screen**

**Predefined Fields:**
- Name
- Type
- Rarity
- Prompt text
- Knowledge tiers (based on rarity cap)

**Generation Options:**
- **[✨ Generate]** per field — AI fills that field only
- **[✨ Generate All Empty]** — AI fills all blank fields
- **[✨ Generate Whole Card]** — AI creates complete card from scratch
- **[🔗 Based on Loaded Cards]** — Generate using selected context cards

**Chat/Paste Box:**
- User pastes description or chats with AI
- AI auto-fills fields based on input
- User refines via follow-up messages

### **Context-Aware Generation**

Builder works top-down. Loaded cards provide context for generation:

```
LOADED CARDS (toggleable):
☑️ 🌍 Dark Fantasy Medieval
☑️ 📍 Thieves Quarter  
☐ 👥 Shadow Guild (unchecked = won't influence)
☑️ 👤 Marcus the Fence
        ↓
[+ New Character] ← AI uses checked cards as context
```

User toggles which loaded cards influence generation via checkboxes.

### **Field History**

Every field keeps a history stack:
- AI fills field → value saved to history
- User can dropdown to revert to any previous value
- Non-destructive — nothing is lost

### **Rarity Controls**

```
Rarity: [−] Bronze [+]
```

- User upgrades/downgrades with +/- buttons
- AI auto-adjusts content depth to match new rarity
- Or user edits manually

### **Bulk Generation (Big Dumps)**

When user pastes large content (lore docs, world bibles):

1. AI extracts entities (characters, locations, factions, items, lore)
2. Generates batch of cards
3. Shows batch review screen:

```
GENERATED CARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Grumpy Pete (Bronze)     [▼ expand] [Full] [✓]
   └─ Name: [Grumpy Pete ▼]
   └─ Prompt: [Blacksmith who secretly...] [✨]
   
👤 Silent Mara (Silver)     [▶ collapsed] [Full] [✓]
📍 The Rusty Dagger (Bronze) [▶] [Full] [✓]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Accept All] [Accept Selected]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 "You missed the bard"
💬 "Can you generate a dragon for this world?"
```

- **Inline edit:** Expand any card, edit fields directly
- **Full screen:** Open card in full editor
- **Iterate via chat:** Ask AI to add missed cards or generate new ones

### **Import System**

**Format:** JSON (compatible with external card sources)

**Import Flow:**
1. User imports file
2. System detects if formatted (native) or unformatted (external)
3. If unformatted, shows issues found:
   - Missing fields
   - Unknown fields
   - Token limit violations
4. User chooses:
   - **[Import Raw]** — Import as-is, fix manually
   - **[Auto-Fix]** — AI fills gaps and fixes issues
   - **[Review Each]** — Step through problem cards

**Rule:** Unformatted cards stay in Builder only. Cannot enter gameplay until formatted.

### **Card Validation (Minimum for Gameplay)**

A card is "formatted" and playable when it has:
- Name
- Type
- Rarity
- Prompt text

Everything else is optional until proven otherwise.

_User Benefit:_ Worldbuilders can create entire card packs from lore dumps, manually craft individual cards, or any combination — maximum creative flexibility with AI assistance at every step.

_Acceptance Criteria:_
- All entry points functional (+ buttons, import, chat)
- Per-field and whole-card generation working
- Context toggle influences AI output
- Field history persists and is revertable
- Bulk generation handles large inputs
- Import detects and flags unformatted cards
- Unformatted cards blocked from gameplay

**Dependencies:** LLM API integration, JSON schema for cards

---

**Player Frontend (User Experience):**

- Card library grid view (filtered by type/rarity)
    
- Drag-and-drop card activation
    
- Story chat interface
    
- Unlock notifications
    
- Card detail modal showing knowledge progression
    

## **Performance Requirements**

- LLM response generation: <5 seconds per turn
    
- Auto-Cards script processing: <1 second per response
    
- Card library filtering: instant (<100ms)
    
- System prompt building: <500ms
    

## **Data Storage**

- Card metadata (name, type, rarity, prompt, knowledge, possession, parent_id)
    
- User sessions (active cards, story memory, quest progress)
    
- Story history (compressed events only, not full conversation)
    

---

## **SUCCESS METRICS & KPIs**

## **Primary Metrics**

1. **Card Unlock Rate:** Average cards unlocked per 30-minute session (target: 3-5 cards)
    
2. **Story Continuation Rate:** % of users who return for 2+ sessions with same character/world (target: >60%)
    
3. **Gold Card Engagement:** % of users who activate Gold cards and explore nested content (target: >40%)
    

## **Secondary Metrics**

4. **Knowledge Progression:** Average knowledge level increase per card per session (target: +1 level per 30 min)
    
5. **Quest Completion:** % of started quests that reach 100% (target: >50%)
    
6. **Builder Tool Usage:** % of users who create custom cards (target: >25%)
    
7. **Token Efficiency:** Average prompt size with compression vs without (target: 50%+ reduction at 10+ turns)
    

## **Qualitative Success Indicators**

- Players report feeling progression/growth in their stories
    
- Nested Gold card content feels cohesive and valuable
    
- Auto-generated cards match narrative context appropriately
    
- Story memory prevents major continuity errors
    

---

## **SCOPE & CONSTRAINTS**

## **In Scope for Prototype**

- Five card types (Character, Location, World, Time, Mood)
    
- Four rarity tiers with Gold container functionality
    
- Auto-Cards generation with pattern detection
    
- Knowledge Level progression (0-5 scale)
    
- Possession state tracking
    
- Gold cards with nested sub-cards (hierarchical)
    
- Story memory compression system
    
- Quest/goal tracking within World cards
    
- Dual frontend (Builder + Player)
    
- Three core scripts (Auto-Cards, Quest Tracking, Story Memory)
    
- Hierarchical prompt optimization for Gold containers
    

## **Explicitly Out of Scope**

- Multiplayer/shared worlds
    
- Monetization systems
    
- Mobile apps (web only for prototype)
    
- Advanced relationship tracking between NPCs
    
- Dynamic world state changes (seasons, wars, etc.)
    
- Voice/audio integration
    
- Achievement systems beyond card collection
    
- User account management (local storage sufficient)
    
- Card trading/marketplace
    
- AI-generated card artwork (text-only prototype)
    

## **Technical Constraints**

- LLM API rate limits and costs
    
- Token context window limits (~8k-32k depending on model)
    
- Real-time response generation required (no batch processing)
    
- Single-user prototype (no concurrent session handling needed)
    

## **Timeline & Milestones**

**Phase 1: Core Foundation (Weeks 1-2)**

- Basic card CRUD in Builder frontend
    
- Manual card activation in Player frontend
    
- System prompt builder (no optimization yet)
    
- Simple LLM integration with hardcoded prompt
    

**Phase 2: Auto-Cards & Scripts (Weeks 3-4)**

- Auto-Cards generation script with pattern detection
    
- Quest tracking script
    
- Story memory compression script
    
- Knowledge progression system
    

**Phase 3: Gold Containers & Optimization (Weeks 5-6)**

- Gold card parent-child relationships
    
- Hierarchical prompt optimization
    
- Nested card UI in both frontends
    
- Possession state tracking
    

**Phase 4: Testing & Iteration (Week 7+)**

- 30-minute playtest sessions
    
- Tune Auto-Cards thresholds
    
- Debug continuity issues
    
- Refine prompt compression algorithms
    

---

## **OPEN QUESTIONS & RISKS**

## **Unresolved Decisions**

1. **Auto-Cards Threshold Tuning:** How many NPC mentions before card generation? (Prototype will test 3 as starting point)
    
2. **Knowledge Progression Pace:** Is 3 progression points per level too slow/fast? (Requires playtesting)
    
3. **Gold Card Nesting Depth:** Should nested cards have their own children? (Start with single-level hierarchy, expand if needed)
    
4. **Story Memory Event Extraction:** Manual selection vs AI summarization? (Start manual for transparency, consider AI later)
    

## **Known Risks & Mitigation**

**Risk 1: Auto-Cards generates irrelevant/duplicate cards**

- _Mitigation:_ Builder frontend preview with accept/reject/edit before adding to library; tune pattern detection thresholds through testing
    

**Risk 2: Token limits still exceeded with Gold compression**

- _Mitigation:_ Implement aggressive compression modes; cap number of active cards; prioritize most story-relevant cards
    

**Risk 3: Story memory loses critical context**

- _Mitigation:_ Manual override to pin important events; increase maxEvents threshold if needed; A/B test different compression strategies
    

**Risk 4: LLM doesn't respect card prompts consistently**

- _Mitigation:_ Refine prompt formatting; use stronger system prompt instructions; test different LLM models; add negative examples ("Don't contradict: X")
    

**Risk 5: Hierarchical card system too complex for users**

- _Mitigation:_ Clear UI affordances (expandable trees, visual nesting); tutorial explaining Gold containers; start with simple examples
    

## **Areas Requiring Further Research**

- Optimal LLM model for card-based prompting (GPT-4 vs Claude vs open-source)
    
- User preference for Auto-Cards auto-accept vs manual approval
    
- Whether nested cards should be discoverable before Gold parent is unlocked (spoiler prevention)
    
- Integration with existing storytelling frameworks (Save the Cat, Hero's Journey) for quest structure
    

---

## **APPENDIX: KEY DEFINITIONS**

**Evolved Cards:** The core system where narrative prompts are structured as collectible cards with metadata (rarity, knowledge level, possession state)

**Auto-Cards:** Automatic card generation system that detects narrative patterns and creates/progresses cards without manual intervention

**Gold Container Cards:** Highest rarity tier that functions as parent cards containing nested sub-cards, enabling entire subsystems (factions, religions, complex locations)

**Knowledge Level:** Progression metric (0-5) that unlocks deeper card details as players explore story elements repeatedly

**Story Memory Compression:** System that maintains narrative continuity by tracking key events rather than full conversation history, preventing token bloat

**Hierarchical Prompt Optimization:** Automatic compression of Gold parent cards when nested children are primary story focus, reducing token usage while maintaining depth

**Possession State:** Boolean tracking whether player "has" a character as companion or item in inventory, preventing narrative contradictions

---

**End of PRD**