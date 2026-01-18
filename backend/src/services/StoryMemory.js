class StoryMemory {
  constructor(memoryData = {}) {
    this.currentLocation = memoryData.currentLocation || null;
    this.recentEvents = memoryData.recentEvents || [];
    this.establishedFacts = memoryData.establishedFacts || [];
    this.questProgress = memoryData.questProgress || {};
    this.maxEvents = 5;
  }

  addEvent(eventDescription, importance = 'normal') {
    const event = {
      description: eventDescription,
      importance,
      timestamp: Date.now()
    };

    // Critical events become established facts
    if (importance === 'critical') {
      this.establishedFacts.push(eventDescription);
    }

    this.recentEvents.push(event);

    // Keep only last N events
    if (this.recentEvents.length > this.maxEvents) {
      this.recentEvents.shift();
    }
  }

  setLocation(location) {
    this.currentLocation = location;
  }

  addEstablishedFact(fact) {
    if (!this.establishedFacts.includes(fact)) {
      this.establishedFacts.push(fact);
    }
  }

  buildMemoryPrompt() {
    let prompt = '\n=== STORY MEMORY ===\n';

    if (this.currentLocation) {
      prompt += `Current Location: ${this.currentLocation}\n`;
    }

    if (this.establishedFacts.length > 0) {
      prompt += '\nEstablished Facts:\n';
      prompt += this.establishedFacts.map(f => `- ${f}`).join('\n');
    }

    if (this.recentEvents.length > 0) {
      prompt += '\n\nRecent Events:\n';
      prompt += this.recentEvents.map(e => `- ${e.description}`).join('\n');
    }

    if (Object.keys(this.questProgress).length > 0) {
      prompt += '\n\nActive Quests:\n';
      for (let [questName, progress] of Object.entries(this.questProgress)) {
        prompt += `- ${questName}: ${progress}%\n`;
      }
    }

    return prompt;
  }

  toJSON() {
    return {
      currentLocation: this.currentLocation,
      recentEvents: this.recentEvents,
      establishedFacts: this.establishedFacts,
      questProgress: this.questProgress
    };
  }

  static fromJSON(data) {
    return new StoryMemory(data);
  }
}

export default StoryMemory;
