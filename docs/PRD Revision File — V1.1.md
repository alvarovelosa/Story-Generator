# 
Applies to: PRD V1.0 baseline. [conversation_history:1]  
Rule: Only the items in this revision file are considered changed in V1.1. [conversation_history:1]

## Added
- [Frontend Architecture → Builder Frontend] **Settings tab: LLM Connections** to configure runtime provider/model. [conversation_history:1]
  - Providers/presets: OpenAI, Claude, Gemini, OpenRouter, KoboldCPP. [conversation_history:1]
  - Fields: provider selector, model name, API key (where applicable), base URL/endpoint override, “Test connection”, active provider/model indicator, clear error handling. [conversation_history:1]
  - Acceptance: switching provider affects the next story turn without code changes; failures don’t break session state. [conversation_history:1]

- [Frontend Architecture → Builder Frontend → Settings tab] **Model favorites per provider**. [conversation_history:1]
  - UX: star/unstar, pinned Favorites section, “show favorites only” filter. [conversation_history:1]
  - Data: favorites stored per provider; persistence across sessions (local storage acceptable for prototype). [conversation_history:1]
  - Acceptance: favorites persist after refresh; switching providers preserves separate favorites sets. [conversation_history:1]

- [Core Card System] Card metadata: **tags**, **triggers**, and **links (linked cards)**. [conversation_history:1]
  - Tags for organization/filtering. [conversation_history:1]
  - Triggers as declarative conditions that can influence activation/generation/prompting (prototype-simple allowed). [conversation_history:1]
  - Linked cards for explicit relationships + navigation; prompt builder may optionally pull minimal “see also” context. [conversation_history:1]
  - Acceptance: Builder can edit tags/triggers/links; card detail view navigates linked cards. [conversation_history:1]

- [Core Script Systems / Technical Requirements] **Script Runner system** (turn pipeline execution). [conversation_history:1]
  - Capabilities: script registry, enable/disable per run, deterministic execution order, per-script debug logs (inputs/outputs/events). [conversation_history:1]
  - Acceptance: Builder shows which scripts ran, in what order, and state changes; scripts can be toggled off without breaking the run. [conversation_history:1]

- [Core Card System → Parent/Child Relationships] Hierarchy rules expanded:
  - Children can be **same type or different type** (heterogeneous and homogeneous subgraphs). [conversation_history:1]
  - Children can be **any rarity**, including Gold → Gold and Silver → big children (rarity does not constrain structure). [conversation_history:1]
  - Cross-type examples are explicitly allowed (e.g., Character card nested under a Location card). [conversation_history:1]

- [Core Card System → Links & Hierarchy] **Multi-parent relationships (graph/DAG)** so a single info card can appear under multiple contexts (e.g., a common “Swamp” reused under multiple swamp locations). [conversation_history:1]
  - Data model: use `parentCardIds[]` (and `childCardIds[]` or derived reverse index). [conversation_history:1]
  - UX: card detail shows “Parents / Appears in / Used by”; Builder can attach/detach multiple parents. [conversation_history:1]

- [Technical Requirements → Script Runner / Data Integrity] **Cycle detection + safety limits** for graph hierarchies. [conversation_history:1]
  - Block/warn on cycles (A → B → A). [conversation_history:1]
  - Add max traversal depth for prompt loading. [conversation_history:1]

- [Prompt Management System → Hierarchical Prompt Optimization] Generalized optimization:
  - Focus-based loading applies to **any** parent/child relationship (not Gold-only, not type-only). [conversation_history:1]
  - Load “focus node” richly; compress ancestors to essence; keep siblings “available but not loaded” as needed for token control. [conversation_history:1]
  - For multi-parent cards, load by “focus node + selected parent path(s)” and compress other parent contexts to minimal references. [conversation_history:1]

## Removed
- [Rarity System with Hierarchical Depth / Gold Container Cards] Restriction: “Only Gold cards can contain nested sub-cards.” [conversation_history:1]
- [Core Card System → Hierarchy rules] Restriction: “Children must be lower rarity than parent.” [conversation_history:1]
- [Core Card System → Hierarchy rules] Restriction: “Children must be the same type as the parent.” [conversation_history:1]

## Updated
- [Frontend Architecture → Builder Frontend] Builder scope updated:
  - From: “Builder is primarily a card generator.” [conversation_history:1]
  - To: Builder is a **playing tool** with admin oversight and debugging (runs story turns + exposes internals). [conversation_history:1]
  - Acceptance: Builder can run playable sessions and shows debug panels for active cards, script events fired, generated/updated cards, quest progress, story memory state, and final system prompt preview. [conversation_history:1]

- [Core Card System] Hierarchy semantics clarified:
  - Rarity is **richness of information**, not a structural permission system. [conversation_history:1]

- [Prompt Management System → Hierarchical Prompt Optimization] Scope updated:
  - From: “Gold containers trigger compression/expansion.” [conversation_history:1]
  - To: Compression/expansion is driven by **focus and graph relationships**; Gold remains a common convention for “big containers” but not a rule. [conversation_history:1]
