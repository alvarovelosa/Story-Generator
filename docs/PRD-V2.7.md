# GAMIFIED AI CHAT PLATFORM
## Product Requirements Document (PRD) — **V2.7**
*Prototype Foundation for Transparent Iteration and Vibe Coding*

---

## EXECUTIVE SUMMARY

**Product Vision:** An AI-powered interactive storytelling platform where narrative prompts are organized as collectible cards that players unlock through play, and where card relationships form a reusable information graph that drives prompting.

**Target Users:** 
- Primary: Interactive fiction players and worldbuilders who want structured storytelling with progression
- Secondary: Developers/admins who need transparent control, debugging, and rapid iteration

**Key Success Metrics:** 
- Card unlock rate (unique cards unlocked per 30-minute session)
- Return rate (users continuing stories across sessions)
- Story coherence over long sessions (token efficiency + memory compression effectiveness)
- Builder debug adoption (use of Script Runner, prompt preview, manual triggers)

---

## PROBLEM & OPPORTUNITY

**Problem Statement:** Pure chat-based AI storytelling often becomes incoherent over long sessions and lacks persistent, rewarding structure. Users face blank-slate fatigue with each conversation.

**Opportunity:** Cards + scripts + prompt-building create a repeatable gameplay loop. Memory compression and hierarchical loading keep prompts lean without losing continuity. Auto-Cards make progression feel organic rather than mechanical.

**Strategic Fit:** This is a **prototype to validate core mechanics** (auto-cards, card graph hierarchy, script runner, prompt building, memory compression), not a hardened MVP.

---

## USER PERSONAS & USE CASES

**Primary Persona: Story Explorer**
- Wants emergent narrative with mechanical progression
- Values discovering new content through gameplay
- Enjoys both creating and consuming story worlds
- ADHD-friendly: prefers quick start (MC + Location) with optional flavor

**Secondary Persona: Worldbuilder/Admin**
- Creates comprehensive story settings with characters, locations, lore
- Uses Builder frontend to design card collections and debug systems
- Needs transparent access to internals (prompts, scripts, memory state)
- Rapidly iterates through play-test-refine cycles

**Top User Stories:**
1. As a player, I want to unlock **unique cards** from story events so progress feels earned and my library grows organically
2. As a player, I want to pick a Main Character + Location + optional flavor, then start a story immediately (minimal friction)
3. As a worldbuilder, I want to **play inside Builder** and see internal state (active cards, final prompt, script logs, memory) to iterate quickly
4. As a worldbuilder, I want a Settings tab to switch LLM providers/models and save model favorites without code changes
5. As a user, I want cards to reference other cards via links, tags, triggers, and parent/child relationships so information is reusable and composable

---

## PRODUCT REQUIREMENTS

### Card System Core

#### Card Types (Fixed)

**5 Core Types:**

1. **Character** – Individuals/personas (includes relationships + goals)
   - Rarity Tiers: C (Common generic archetypes) → B (Bronze specific roles) → S (Silver named individuals) → G (Gold fully realized characters)
   - Knowledge Levels: 1 (name/basic traits) → Max (full backstory, secrets, complex relationships)

2. **Location** – Physical spaces
   - Special: Common tier = intentional vagueness for LLM randomization ("A tavern" → LLM fills details)
   - Rarity Tiers: C (generic "A forest") → B (specific "Dark pine forest") → S (named "Blackwood Forest") → G (immersive "Blackwood at dusk, mist rising")
   - Knowledge Levels: Not yet tiered; single prompt text per card

3. **World** – Complete backdrop container
   - Contains: Species/races (elves, orcs, androids), Factions/groups (guilds, kingdoms, corps), Culture/society norms (taboos, customs), Magic/tech/power system rules, Current goals/quests/situations
   - Rarity Tiers: C → B → S → G (richness of detail)
   - Knowledge Levels: Progressive unlock of world mechanics

4. **Time** – Temporal context
   - Covers: Time of day (morning, afternoon, night) and era (medieval, cyberpunk, near-future)
   - Defined Tiers: C (simple labels like "Morning") and B (eras like "Medieval era"); S/G reserved for future
   - Knowledge Levels: Not yet tiered

5. **Mood** – Emotional/atmospheric setting
   - Examples: Cozy, Tense, Romantic, Comedic, Grimdark
   - Rarity Tiers: Not yet defined; prototype can start simple
   - Knowledge Levels: Not applicable (mood is ambient, not progressive)

#### Card Data Structure

**Card Object Schema:**

```json
{
  "card_id": "unique_id_string",
  "name": "Maria the Smuggler",
  "type": "character",
  "rarity": "silver",
  "source": "system | default | user | auto_generated",
  "knowledge_level": 2,
  "max_knowledge_level": 5,
  "possession_state": true,
  "prompt_content": {
    "level_1": "A skilled smuggler operating in the port district.",
    "level_2": "Maria has connections to the Black Sail gang and knows secret routes through warehouses.",
    "level_3": "...",
    "level_max": "Full detailed prompt with backstory, motivations, quirks, speech patterns..."
  },
  "compressed_prompt": "Smuggler with gang ties and warehouse knowledge.",
  "tags": ["criminal", "port_district", "ally"],
  "triggers": [
    {"name": "smuggling_mentioned", "action": "increment_knowledge"},
    {"name": "joins_player", "action": "set_possession"}
  ],
  "links": [
    {"card_id": "black_sail_faction", "type": "belongs_to"},
    {"card_id": "rusty_anchor_tavern", "type": "frequent_location"}
  ],
  "parent_card_ids": ["black_sail_faction_gold"],
  "child_card_ids": ["maria_rival_bronze"],
  "unlock_conditions": {
    "trigger": "mention_smugglers",
    "context": "User discussed smuggling operations"
  },
  "metadata": {
    "created_date": "timestamp",
    "times_used": 15,
    "last_used": "timestamp"
  }
}
```

**Key Fields Explained:**
- `source`: Determines permissions (system = read-only, user = full edit, auto_generated = auto-created from stories)
- `knowledge_level` / `max_knowledge_level`: Tracks progressive unlock of details
- `possession_state`: Boolean for items/characters (do I have this? can I use it?)
- `tags[]`: For filtering, searching, organization
- `triggers[]`: Declarative rules (if X happens, do Y)
- `links[]`: References to related cards; navigable in UI
- `parent_card_ids[]`: Multi-parent support; card can appear under multiple contexts
- `compressed_prompt`: Used by optimizer when parent is compressed

#### Card Sources (3 Pools)

**Game Cards:**
- App-provided starter library
- Always available, broad coverage of common archetypes
- Source: `system` or `default`
- Permissions: Read-only (system) or editable (default)

**Evolved Cards:**
- Auto-generated from story interactions via Auto-Cards script
- Unique/specific versions that unlock through play
- Source: `auto_generated`
- Permissions: Can edit once unlocked, no delete

**Custom Cards:**
- Manually created by user
- Total control over all fields
- Source: `user`
- Permissions: Full CRUD

**All three pools mix together** when building scenes.

### System Cards (Built-In, Undeletable)

**Purpose:** Provide non-specific, reusable building blocks (generic templates) that are always available to combine with more specific cards.

**System Card Characteristics:**
- Read-only (cannot be edited directly)
- Cannot be deleted
- Clone-to-edit workflow: Duplicate System Card → becomes `source: user` → now editable
- Always present in library, available for selection
- Designed for reuse under multiple parent contexts (multi-parent by default)

**System Card Registry:**

| Type | System Cards | Purpose |
|------|--------------|---------|
| **Location** | Swamp, Beach | Generic but specific enough to be useful; LLM can randomize details or use literally |
| **Time** | Morning, Afternoon | Quick temporal framing without era-specific detail |
| **World** | Lunch (food), Boat (vehicle), Car (vehicle) | Generic objects/props that can appear in any world context |

**UI Behavior:**
- System Cards display a "System/Locked" badge
- Available actions: View, Clone (creates editable user copy)
- Disabled actions: Delete, Edit (must clone to modify)

**Acceptance Criteria:**
- System Cards are always in the library and selectable
- User can clone any System Card into a custom editable version
- Cloned cards appear as `source: user` in the library
- Original System Cards never change or disappear

**Definition of Done:**
- User can select "Swamp" System Card in a scene, and/or clone it to create "Poisoned Swamp of Lorn" (editable)
- Builder shows System Card originals as locked; UI prevents accidental deletion

---

### Card Progression System

#### Knowledge Levels

**Concept:** Each card has Knowledge Level (1 → Max) that unlocks progressively as you use/explore the card in stories.

**Knowledge Level Mapping:**

```
Level 1:    Basic info only
            Example: "Sword of Doom — A legendary blade"
            
Level 2:    One key trait/power/detail
            Example: "...glows red when undead are near"
            
Level 3:    Additional context/backstory
            Example: "...forged in the First Age, belongs to House Vorn"
            
Max Level:  Full prompt content, secrets, hidden relationships
            Example: "Full history + 3 powers + weaknesses + how to destroy it"
```

**Progression Trigger:**
- Story interaction detected (card mentioned, used, explored) → progression points
- Formula: `knowledge_level = min(floor(progression_points / 3), max_knowledge_level)`
- Max level varies by rarity: Common 2, Bronze 3, Silver 4, Gold 5

**Progression Points Earned By:**
- Mentioning card subject in conversation → +1 point
- Asking questions about card topic → +2 points
- Major story event involving card → +3 points
- Detailed exploration of card elements → +2 points

**Prompt Impact:** LLM system prompt includes `prompt_content[knowledge_level]` for each active card.

#### Possession State

**Concept:** Two independent states—you can *know about* something without *having* it.

**States:**
- **Knowledge** ✓ = You know the card exists at current Knowledge Level
  - Can reference it in stories
  - See info up to current Knowledge Level
  
- **Possession** ✓ = You actually have/own it
  - Can use in scene setup
  - Can equip (items) or summon (characters)

**Card Type Mapping:**

| Card Type | Knowledge | Possession | Notes |
|-----------|-----------|-----------|-------|
| Character | ✓ | ✓ | Usually both; can be "know of them, can't summon yet" |
| Location | ✓ | ✗ | Can't own a place; Knowledge only |
| World | ✓ | ✗ | You understand the lore; can't own abstract rules |
| Item/Object | ✓ | ✓ | Know about the sword; don't own it until you find it |
| Mood | ✗ | ✗ | Ambient; not tracked per card |

**Progression:**
1. Gain Knowledge through story interaction (auto-cards or manual unlock)
2. Gain Possession through deeper story events (e.g., "you obtain the sword", "character joins your crew")

**Definition of Done:** Builder can manually set Knowledge/Possession states for testing; Player sees indicators on cards (locked icon for unavailable, checkmark for possessed).

---

### Card Relationships

#### Links (Semantic/Navigational)

**Purpose:** Explicit references between cards for navigation, context, and discovery.

**Link Structure:**
```json
{
  "from_card_id": "maria_character",
  "to_card_id": "black_sail_faction",
  "link_type": "belongs_to",
  "description": "Maria is a member of the Black Sail gang"
}
```

**Link Types (Examples):**
- `belongs_to`: Character → Faction
- `located_in`: Location → larger Location
- `relates_to`: any → any (generic relation)
- `conflicts_with`: Character ↔ Character/Faction
- `uses`: Character → Item
- `rules`: World → affects (Location, Character, etc.)

**UI Behavior:** Card detail page shows related cards as "See also" section; users can navigate between linked cards.

**Acceptance Criteria:** Builder can create/edit/delete links; Player sees link suggestions in card detail view.

#### Hierarchy (Parent/Child Graph)

**Concept:** Cards can contain nested cards, forming a **DAG (Directed Acyclic Graph)**, not a strict tree.

**Graph Rules:**
1. Any card can have children (not Gold-only)
2. Children can be any rarity or type (cross-type is OK)
3. Any card can have multiple parents (multi-parent support)
4. **Cycles must be prevented** (no A → B → A)
5. **Traversal must be bounded** (depth/size limits to prevent runaway prompts)

**Example: Gold Faction as Container**

```
Black Sail Faction (Gold World)
├─ Captain Redtide (Silver Character)
├─ Maria the Smuggler (Silver Character)
├─ Hideout Tavern (Silver Location)
├─ Pirate Code (Bronze World: rules)
└─ Treasure Map (Common Item)
```

When "Black Sail Faction" is active:
- Nested cards become available in player library
- Prompt optimizer compresses the Gold card to essence ("notorious pirate faction")
- Only the specific cards player is using load in full detail
- Siblings stay available but compressed

**Nesting Rules:**
- A Common "Swamp" System Card can appear under multiple specific swamp locations
- A Silver Character can be "hidden inside" a Gold Location (e.g., hermit in a cave)
- A Bronze Time card could theoretically be inside a Gold Historical Event (future design)

**Acceptance Criteria:**
- Builder UI shows parent/child relationships as expandable tree
- Child cards cannot be activated unless parent is active
- Cycles are blocked at creation time with clear error message
- Depth limit prevents prompts from loading too deep

**Definition of Done:** User selects Gold Faction → all nested cards become visible and selectable in Player library.

---

### Prompt Assembly & Optimization

#### System Prompt Builder

**Purpose:** Dynamically construct the LLM system prompt from active cards in real-time, following a priority order.

**Assembly Order:**

1. **World Card** (if selected)
   - Sets foundational rules, species, factions, current situation
   - Loaded at full detail unless compressed due to hierarchy

2. **Location Card**
   - Establishes physical context
   - If Common, randomization instruction included

3. **Time Card**
   - Adds temporal context (time of day, era)
   - Sets mood/lighting

4. **Mood Card**
   - Sets emotional/atmospheric tone
   - Applied last so it overrides base tone

5. **Character Cards**
   - Main Character (MC) injected first
   - Supporting characters injected in order
   - Each injects based on current Knowledge Level
   - Relationships embedded within character cards

**Prompt Concatenation Logic:**

```
FINAL_SYSTEM_PROMPT = 
  BASE_INSTRUCTIONS +
  WORLD_CARD.prompt_content[knowledge] +
  LOCATION_CARD.prompt_content[knowledge] +
  TIME_CARD.prompt_content[knowledge] +
  MOOD_CARD.prompt_content[knowledge] +
  MC_CHARACTER.prompt_content[knowledge] +
  foreach(SUPPORTING_CHARACTER) {
    CHARACTER.prompt_content[knowledge]
  }
```

**Randomization Handling:**

For Common Location cards only:
```
IF card.type == "location" AND card.rarity == "common":
  prompt_text = f"Setting: {card.name}. Generate specific details appropriate to the world and mood."
ELSE:
  prompt_text = card.prompt_content[card.knowledge_level]
```

**Acceptance Criteria:**
- Builder shows exact system prompt preview before sending to LLM
- Token count displayed and updated in real-time
- Prompt changes when active cards change

#### Hierarchical Prompt Optimization

**Purpose:** Keep prompts lean over long sessions by compressing parent cards when child cards are the focus, and handling multi-parent contexts intelligently.

**Optimization Rules:**

1. **Focus-Based Loading:** When a child card becomes the active focus, load that node richly (full detail) and compress its ancestors to essence (~100 tokens).

2. **Multi-Parent Handling:** If a card has multiple parents, select the active context path and compress other parent paths to minimal references.

3. **Sibling Handling:** Keep siblings available in memory (for linking/discovery) but don't load full details unless needed.

4. **Depth Limits:** Traversal capped at max_depth (e.g., 3 levels) to prevent runaway context.

**Example:**

```
Mystwood Forest (Gold Location, 800 tokens full)
├─ The Glade (Silver, 300 tokens full)
├─ Ancient Ruins (Silver, 300 tokens full)
└─ Forest Path (Common, 100 tokens full)

Scenario 1: Player is in "The Glade"
  → Mystwood (compressed to ~100 tokens "mysterious magical forest")
  → The Glade (full 300 tokens with rich detail)
  → Memory notes (recently visited Ancient Ruins, never visited Forest Path)
  → Total: ~400 tokens (60% reduction vs loading full tree)

Scenario 2: Player moves to "Ancient Ruins"
  → Mystwood (compressed to ~100 tokens)
  → Ancient Ruins (full 300 tokens)
  → Memory updates (has now visited both major locations)
  → Total: ~400 tokens (same lean profile)
```

**Acceptance Criteria:**
- Token usage stays stable even after 20+ turns
- Prompt preview shows which cards are compressed vs loaded
- Story coherence doesn't degrade with compression

**Definition of Done:** Long session (30+ turns) maintains story continuity with tokens bounded under LLM context limit.

---

### Auto-Card Generation System

**Purpose:** Automatically generate Evolved cards based on story interactions using script-based pattern detection, inspired by AI Dungeon's Auto-Cards.

#### Implementation Approach

**Core Mechanism:**
- **Event-Driven Scripting:** Monitor story content for narrative patterns rather than simple keyword matching
- **Context-Aware Generation:** Analyze story context to determine card type, rarity, and initial Knowledge Level
- **Script Hooks:** Embedded triggers that fire when specific story conditions are met

#### Card Generation Triggers

**Character Cards:**
- **Pattern:** NPC mentioned 3+ times with distinct personality traits
- **Trigger:** Generate Bronze/Silver character card with extracted traits
- **Example:** Story mentions "the mysterious cloaked merchant who always speaks in riddles" → Generates Silver Character "The Riddling Merchant"

**Location Cards:**
- **Pattern:** Place described with specific atmospheric details
- **Trigger:** Generate location card matching detail level
- **Example:** "abandoned lighthouse on the northern cliffs, waves crashing below" → Generates Silver Location "Northern Cliffs Lighthouse"

**World Cards:**
- **Pattern:** Consistent world rules established (magic system, factions, species)
- **Trigger:** Generate World card documenting discovered lore
- **Example:** Multiple references to "fire magic being forbidden by the Crown" → Generates World card with cultural rule

**Item Cards (via World):**
- **Pattern:** Significant object with described properties
- **Trigger:** Generate with Knowledge Level 1, Possession = false initially
- **Example:** "the legendary Sword of Doom that glows red" → Generates Item card at Knowledge 1; unlocks Possession when "obtains sword" detected

#### Knowledge Level Progression

**Increment Conditions:**
- Card-related story interaction detected → +1 progression point
- Every N progression points → +1 Knowledge Level
- Formula: `knowledge_level = floor(progression_points / 3)`
- Max level varies by card rarity (Common 2, Bronze 3, Silver 4, Gold 5)

**Progression Points Earned By:**
- Mentioning card subject in conversation → +1
- Asking questions about card topic → +2
- Major story event involving card → +3
- Detailed exploration of card elements → +2

#### Possession State Changes

**Trigger Patterns (Script Detection):**
- "you obtain [item]" / "you find [item]" → possession = true
- "[character] joins you" / "[character] becomes your ally" → possession = true
- "you arrive at [location]" → Knowledge +1 (locations don't have possession)
- "you lose [item]" / "[character] leaves" → possession = false

#### Technical Integration

**Script Architecture:**
```
Story Output → Auto-Cards Script Engine → Pattern Analysis
    ↓
[Does pattern match any trigger?]
    ↓
YES: Generate card / Update existing
NO: Continue monitoring
    ↓
Update User Card Library
    ↓
Show unlock notification (if new card)
```

**Data Flow:**
1. User sends message → LLM generates response
2. Response text passes through Auto-Cards analyzer
3. Script checks for generation triggers and progression patterns
4. Database updates: new cards created or existing cards updated
5. UI notifies user of changes ("New card unlocked!" or "Knowledge increased!")

**Configuration (Tunable Parameters):**
```json
{
  "generation_threshold": {
    "character_mentions": 3,
    "location_detail_level": "medium",
    "world_rule_consistency": 2
  },
  "knowledge_progression": {
    "points_per_level": 3,
    "max_levels_by_rarity": {
      "common": 2,
      "bronze": 3,
      "silver": 4,
      "gold": 5
    }
  },
  "possession_keywords": [
    "obtain", "find", "acquire", "pick up",
    "joins", "allies with", "becomes companion"
  ]
}
```

**Prototype Implementation Notes:**

*Phase 1 (MVP):*
- Start with simple pattern matching for character/location mentions
- Manual trigger override in Builder frontend for testing
- Basic keyword detection for possession changes

*Phase 2 (Enhanced):*
- Implement full Auto-Cards script adaptation
- Semantic analysis using LLM to detect narrative patterns
- Context-aware rarity assignment based on story importance

**Testing Approach:**
- Builder frontend includes "Force Generate Card" button to test generation logic
- Debug mode shows all pattern matches detected in story
- Card preview before adding to library (accept/reject/edit generated cards)

**Acceptance Criteria:**
- Cards can be auto-generated and appear in Player library
- Builder shows why each card was generated
- Manual force-generation works for testing

**Definition of Done:** User plays a story, mentions a character 3+ times, and that character automatically becomes a Unified Silver card that can be used in future stories.

---

### Story Memory Compression System

**Purpose:** Maintain narrative continuity while keeping prompts lean by tracking only essential story state instead of full conversation history.

#### Implementation

**Core Concept:** Instead of feeding the LLM 50 turns of full chat history, track only the most recent key events (~5 events), current location, active quest progress, and relevant state changes.

**Memory Structure:**
```javascript
{
  currentLocation: "The Glade",
  recentEvents: [
    "Found a glowing crystal in a hidden grove",
    "NPC warned about the ancient guardian",
    "Discovered secret passage leading south",
    "Met the hermit at the cave entrance",
    "Inventory: sword, torch, key"
  ],
  questProgress: {
    active_quest: "Find the amulet",
    progress: 50,
    notes: "Still need to locate the temple"
  },
  activeCards: {
    character: "Elf Ranger (Knowledge 2)",
    location: "The Glade (Knowledge 1)",
    world: "Forest Realm (magic rules, hermit lore)"
  },
  storyMemory: {
    established_facts: ["crystal is magical", "guardian is ancient and powerful"],
    character_relationships: ["hermit is suspicious but helpful"]
  }
}
```

#### How It Works Per Turn

**Turn Flow:**

1. Build full context from active cards (could be large)
2. Generate LLM response with full context + story memory
3. Extract key events from response → update story memory
4. Clear heavy context, keep only compressed memory for next turn
5. Next turn builds new full context + lightweight memory

**Example Token Savings:**

```
Without compression:
  - Gold location full prompt: 800 tokens
  - 50 turns of chat history: 2,000 tokens
  - Characters + World: 600 tokens
  - Total: 3,400 tokens (exceeds many LLM limits)

With compression:
  - Gold location full prompt: 800 tokens
  - Story memory (5 events + quest): 150 tokens
  - Characters + World: 600 tokens
  - Total: 1,550 tokens (under context limit, cleaner)
  
Same narrative continuity, ~55% token reduction
```

#### Memory Aging

**Max Events Tracked:** Configurable (default 5)
- Oldest event pushed out when new event added
- Critical facts "pinned" to prevent loss (Builder can mark as important)

**Refresh Triggers:**
- After LLM response, extract new key events
- Every N turns, Builder can review and manually adjust memory
- If story becomes incoherent, Builder can inspect/fix memory state

**Acceptance Criteria:**
- Story stays coherent for 20+ turns
- Token usage stays stable (no growth over turns)
- Builder can inspect and manually edit memory state

**Definition of Done:** User plays for 30 turns; story remains coherent and character consistent; token budget never exceeded.

---

### Script Runner (Core Turn Pipeline)

**Purpose:** Orchestrate a deterministic pipeline per turn (build prompt → call model → run analyzers → update state).

#### Pipeline Architecture

**Deterministic Execution Order:**

1. **Prompt Building** - Assemble system prompt from active cards + memory
2. **LLM Call** - Send to configured model provider
3. **Auto-Cards Analysis** - Detect patterns, generate/update cards
4. **Knowledge Progression** - Update Knowledge Levels based on interactions
5. **Memory Update** - Extract key events, update story memory
6. **State Persistence** - Save turn state to database
7. **UI Events** - Emit notifications (new card unlocked, knowledge up, etc.)

**Configuration:**
- Scripts can be toggled on/off per run (for testing)
- Scripts execute in order; failure in one doesn't corrupt others
- Each script produces structured logs (input, output, decisions made)

**Logging Format:**
```json
{
  "turn": 5,
  "timestamp": "2026-01-18T21:30:00Z",
  "scripts_executed": [
    {
      "name": "prompt_builder",
      "status": "success",
      "inputs": { "active_cards": 4, "memory_events": 5 },
      "outputs": { "final_prompt_tokens": 1200 }
    },
    {
      "name": "auto_cards",
      "status": "success",
      "inputs": { "story_text": "..." },
      "outputs": { "cards_generated": 1, "knowledge_increments": 2 }
    },
    {
      "name": "memory_compression",
      "status": "success",
      "inputs": { "raw_events": 15 },
      "outputs": { "retained_events": 5, "tokens_saved": 200 }
    }
  ]
}
```

**Acceptance Criteria:**
- Each script can be disabled without breaking the pipeline
- Builder shows ordered list of scripts + what changed
- Debug logs are readable and actionable

**Definition of Done:** Builder runs a turn and sees exactly which scripts fired, in what order, and what state changed.

---

### Builder Frontend (Play + Debug Tool)

**Purpose:** Create, manage, test, and debug all card content while playing sessions as an admin.

#### Core Features

**1. Card Management**
- Create Game Cards (starter content)
- Design Custom Cards manually
- Preview card prompt output at each Knowledge Level
- Edit existing cards (user source only)
- Delete Custom Cards
- Clone System Cards to create editable versions

**2. Play Mode**
- Run playable sessions using same runtime as Player frontend
- Send player action → receive model response (full loop)
- Display active cards, active focus node, generated prompt

**3. Debug Panels (Minimum)**
- **Active Cards Panel** - Show selected cards + their current Knowledge/Possession state
- **Prompt Preview** - Exact system prompt being sent to LLM (+ token count)
- **Script Logs** - Ordered list of scripts executed this turn + output
- **Memory State** - Current story memory (events, quest progress, established facts)
- **Card Updates** - Cards generated/updated this turn + why
- **Quest State** - Active quests, progress, milestones

**4. Settings Tab**
- **LLM Provider Selection:** Dropdown with presets (OpenAI, Claude, Gemini, OpenRouter, KoboldCPP)
- **Model Selection:** Per-provider dropdown (e.g., gpt-4-turbo, claude-3-opus)
- **API Configuration:** API key input, base URL override (for OpenRouter/KoboldCPP)
- **Test Connection:** Button to verify credentials work
- **Model Favorites:** Star/unstar button; pinned favorites section; "favorites only" filter
- **Active Indicator:** Shows current active provider/model

**5. System Card Registry**
- View all System Cards (locked badge, no delete/edit)
- Clone any System Card
- Documentation for each System Card (purpose, common uses)

**6. Testing Tools**
- **Force Generate Button** - Manually trigger Auto-Cards for any story pattern
- **Manual Card Unlock** - Directly set Knowledge/Possession state for any card
- **Memory Inspector** - View and edit story memory live
- **Script Toggles** - Enable/disable scripts per run
- **Reset Button** - Clear all user progression (for fresh test)

#### Acceptance Criteria
- Developer can reproduce/diagnose odd story output by inspecting the exact prompt, memory, and scripts fired
- Builder runs the exact same runtime as Player (no divergence)
- All settings persist after refresh
- Play and debug experience is fluid and ADHD-friendly (not overwhelming)

#### Definition of Done
- Builder can play a full 10-turn session with visible debug info
- Switching provider/model changes the next turn's model call without code
- Model favorites persist across sessions
- System Cards are clearly marked as undeletable and cloneable

---

### Dual Frontend Architecture

#### Player Frontend (Story Experience)

**Purpose:** The actual user-facing chat/story interface.

**Features:**

1. **Card Selection Flow**
   - Step 1: Pick Main Character (MC) from available cards (Game/Evolved/Custom)
   - Step 2: Pick Starting Location
   - Step 3: Add Flavor (Optional) - Time, Mood, World, Additional Characters

2. **Chat Interface**
   - Active cards displayed (visual reminder of context)
   - LLM conversation (user input → model response)
   - Story history

3. **Card Library**
   - Browse owned cards (filter by type/rarity/source)
   - View Knowledge Level progress bars
   - See Possession status indicators
   - Read unlocked card details (up to current Knowledge Level)

4. **Progression Feedback**
   - "New card unlocked!" notifications
   - Knowledge Level up indicators
   - Collection progress tracking

#### Builder Frontend (Admin Interface)

*[See above: Builder Frontend section]*

#### Technical Architecture

```
┌────────────────────┐         ┌─────────────────┐
│  BUILDER FRONTEND  │         │ PLAYER FRONTEND │
│  (Admin Interface) │         │ (User Interface)│
└─────────┬──────────┘         └────────┬────────┘
          │                             │
          │        REST API / GraphQL   │
          └──────────┬──────────────────┘
                     ▼
          ┌──────────────────────┐
          │   SHARED BACKEND     │
          │   - Card Database    │
          │   - Unlock Engine    │
          │   - Prompt Assembly  │
          │   - LLM Integration  │
          │   - Script Runner    │
          └──────────────────────┘
```

Both frontends share the same database and backend logic. Builder edits cards; Player consumes them. Builder runs sessions to test; Player runs sessions normally.

---

## TECHNICAL REQUIREMENTS

### Data Integrity & Graph Safety

**Cycle Prevention:**
- Enforce DAG constraints at card creation and when modifying parent relationships
- Block A → B → C → A patterns with clear error messages
- Cycle detection runs at both client (Builder) and server (backend)

**Traversal Limits:**
- Max depth: 3 levels (prevent infinite loops in nested hierarchies)
- Max siblings loaded: 10 (prevent runaway context from too many nested cards)
- Token ceiling: Never exceed LLM context limit (use hierarchical compression if needed)

### LLM Abstraction Layer

**Purpose:** Unify provider calls (OpenAI, Claude, Gemini, OpenRouter, KoboldCPP) behind one interface.

**Interface:**
```
class LLMProvider:
  - name: "openai" | "claude" | "gemini" | "openrouter" | "koboldcpp"
  - model: "gpt-4-turbo" | "claude-3-opus" | "..."
  - api_key: string (if needed)
  - base_url: string (for local/OpenRouter)
  - temperature: float (0.0–2.0)
  - max_tokens: int
  
  method call(system_prompt, user_message) → model_response
```

**Settings Persistence:**
- Currently active provider/model stored in local storage (prototype OK)
- Favorites per provider persisted
- Fallback: Default to OpenAI if no provider configured

**Acceptance Criteria:**
- Switching provider mid-session works
- Failed auth/connection returns clear error without crashing
- All major providers supported (OpenAI, Claude, Gemini, OpenRouter, KoboldCPP)

### Observability & Debugging

**Per-Turn Debug Artifacts:**
- Final system prompt (before sending to LLM)
- Selected LLM provider/model
- Scripts executed + order
- State diffs (cards before/after, memory before/after)
- LLM response + token counts

**Storage:**
- Store debug logs per session in database (queryable by turn number)
- Accessible in Builder debug panel
- Exportable for post-mortem analysis

**Acceptance Criteria:**
- Builder can inspect any past turn and see exact prompt + scripts + response
- Debug logs don't bloat storage (rotation/cleanup after N days)

---

## SCOPE & CONSTRAINTS

### In Scope for V2.7 Prototype

- Card system (5 types, C/B/S/G rarity, Knowledge/Possession states)
- System Cards (read-only, clone-to-edit, undeletable)
- Card graph with multi-parent DAG support
- Tags, Triggers, Links on cards
- Script Runner with P0 scripts (Auto-Cards, Memory Compression, Prompt Building, Optimization)
- Builder frontend with play + debug capabilities
- Player frontend with card selection + chat
- LLM provider switching + model favorites
- Story Memory Compression system
- Hierarchical Prompt Optimization
- System Cards multi-parent reuse by design

### Out of Scope

- Multiplayer chat rooms
- Card trading between users
- Marketplace or monetization
- Heavy world simulation (weather systems, economy, etc.)
- Elaborate onboarding/tutorial (can be minimal for prototype)
- Mobile app (web first)
- Voice chat or audio generation
- Image generation (text-only for now)

### Constraints

**Token Budget:**
- Absolute max: 4,000 tokens (leave buffer for response generation)
- Target: <1,500 tokens for prompt + memory combined
- Use hierarchical compression if exceeding target

**Context Window:**
- Optimize for 4K context (design must work on smaller models)
- Do not assume 128K+ context available

**Story Coherence:**
- Target: Coherent stories for 20+ turns minimum
- Memory compression must not drop critical plot points
- Builder can manually pin important facts to preserve them

**Performance:**
- Prompt assembly <500ms
- Card selection UI responsive (no lag)
- Script Runner per-turn <2s (excluding LLM call time)

---

## OPEN QUESTIONS & RISKS

### Unresolved Decisions

1. **Auto-Cards Trigger Granularity:** Should keyword matching be in script config (tunable per project) or hardcoded? (Current: tunable)
2. **Memory Pinning:** Should critical facts auto-pin, or require manual selection? (Current: manual; auto-detect in Phase 2)
3. **Nested Card Discoverability:** Before unlocking a Gold parent, should nested cards be hidden (spoiler protection) or hinted? (Current: hidden until parent active)
4. **Session Branching:** If player loads old session, can they take different actions, or is replay deterministic? (Current: undecided; out of scope for prototype)

### Known Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| **Graph complexity (DAG traversal)** | Enforce max depth limit; test with 100+ nested cards; bounded traversal limits |
| **Memory compression loses important details** | Manual pinning in Builder; review memory state each turn in debug panel |
| **LLM provider API rate limits** | Implement backoff/retry logic; warn Builder when approaching limits |
| **Prompt bloat over long sessions** | Monitor token count per turn; auto-compress if approaching limit |
| **Script execution failures** | Fail gracefully; log errors; isolate script failure so one doesn't break others |
| **Multi-parent cycles** | Cycle detection at creation time; prevent with validation |
| **System Card mutation (accidental edit)** | Enforce read-only at DB layer; clone-to-edit is only edit path |

---

## SUCCESS CRITERIA

### Definition of Done (Prototype Complete)

1. **Card System Working**
   - User can create/edit all 5 card types
   - System Cards are undeletable and cloneable
   - Cards persist in database
   - C/B/S/G rarity and Knowledge/Possession states functional

2. **Play Loop Working**
   - User picks MC + Location + flavor
   - Cards combine into system prompt
   - LLM generates response
   - Story continues for 20+ turns

3. **Auto-Cards Functional**
   - Cards auto-generate from story patterns
   - Knowledge Levels increment
   - Possession states change
   - "New card unlocked!" notifications appear

4. **Builder Debug Accessible**
   - Builder can run same session as Player
   - Prompt preview shows exact system prompt
   - Script logs visible
   - Memory state inspectable

5. **Memory Compression Working**
   - Token usage stable over 20+ turns
   - Story coherence maintained
   - Older events compressed; recent events fresh

6. **Hierarchical Optimization Working**
   - Gold containers with nested cards function
   - Prompt compresses parents when child is focus
   - Multi-parent contexts handled correctly

### Testing Checklist

- [ ] Create 10 Game Cards (2-3 per type) with Knowledge Level content
- [ ] Play 3 different stories; unlock 5+ Evolved cards per story
- [ ] Verify Knowledge Levels increment and Possession states change
- [ ] Build a Gold Faction with 5 nested members; test nested selection
- [ ] Run a 30-turn story; verify tokens stay under 2K
- [ ] Test LLM provider switching (2+ providers)
- [ ] Verify System Cards can be cloned and edited
- [ ] Inspect Builder debug panel; verify all info is accurate
- [ ] Test cycle prevention (attempt A → B → A; should fail)
- [ ] Verify story memory stays coherent across 20+ turns

---

## APPENDIX: KEY DEFINITIONS

**Evolved Cards:** Cards that are auto-generated from story interactions. Start as generic (Bronze/Silver) and gain Knowledge Levels as used. Distinct from Game Cards (pre-made) and Custom Cards (user-created).

**Auto-Cards:** The system that detects narrative patterns in story text and automatically generates or updates Evolved cards.

**Gold Container Cards:** Highest rarity tier cards that function as parent cards containing nested sub-cards, enabling entire subsystems (factions, religions, complex locations) without bloating main prompts.

**Knowledge Level:** A progression metric (0–5) that unlocks deeper card details as players explore story elements repeatedly. Level 1 = basic info; Max = secrets and full detail.

**Possession State:** A boolean tracking whether the player "has" a character as companion or item in inventory. Distinct from Knowledge (knowing about something).

**Story Memory Compression:** A system that maintains narrative continuity by tracking only key events (~5 events) rather than full conversation history, dramatically reducing token usage while maintaining coherence.

**Hierarchical Prompt Optimization:** Automatic compression of Gold parent cards when nested children are the story focus, reducing token usage while maintaining access to detailed sub-content. Works for any parent/child relationship, not Gold-only.

**System Cards:** Built-in, non-specific, reusable prompt templates (e.g., "Swamp", "Morning", "Boat") that are always available, read-only, and cannot be deleted. Can be cloned to create editable user copies.

**DAG (Directed Acyclic Graph):** A hierarchy structure that allows multi-parent relationships without cycles. Used for card nesting so one card (e.g., "Swamp") can appear under multiple parent locations.

**Prompt Sanitization:** In this project, primarily refers to "prompt slimming" via story-memory compression (removing old history), not security filtering. Security filtering is optional/out of scope for prototype.

---

## DOCUMENT METADATA

- **Document Title:** GAMIFIED AI CHAT PLATFORM — PRD V2.7
- **Stage:** Prototype (Concept Validation)
- **Created:** January 2026
- **Last Updated:** January 18, 2026
- **Revision:** V2.7 (integrated System Cards, multi-parent DAG, hierarchical optimization, LLM provider switching)
- **Status:** Ready for Implementation & Export

---

**End of PRD V2.7**

*This is a working prototype document. All systems are designed for transparent iteration and vibe coding principles. The Builder frontend exposes all mechanics for rapid testing and refinement. Everything is designed to be changed as you learn what works.*
