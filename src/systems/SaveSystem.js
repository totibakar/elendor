class SaveSystem {
  constructor() {
    this.maxSlots = 5;
    this.savePrefix = 'elendor_save_';
  }

  getAllSaves() {
    const saves = [];
    for (let i = 0; i < this.maxSlots; i++) {
      const saveKey = `${this.savePrefix}${i}`;
      const saveData = localStorage.getItem(saveKey);
      if (saveData) {
        try {
          const parsedData = JSON.parse(saveData);
          saves.push({
            slot: i,
            name: parsedData.name,
            date: new Date(parsedData.timestamp),
            data: parsedData
          });
        } catch (error) {
          console.error(`Error parsing save data for slot ${i}:`, error);
        }
      }
    }
    return saves;
  }

  saveGame(slot, name, gameState) {
    if (slot < 0 || slot >= this.maxSlots) {
      throw new Error('Invalid save slot');
    }

    const saveData = {
      name,
      timestamp: Date.now(),
      version: '1.0',
      player: {
        name: gameState.playerName,
        class: gameState.characterClass,
        x: gameState.playerX,
        y: gameState.playerY,
        hp: gameState.hp,
        maxHp: gameState.maxHp,
        hunger: gameState.hunger,
        stamina: gameState.stamina,
        gold: gameState.gold,
        inventory: gameState.inventory,
        equipment: gameState.equipment,
        discoveredRelics: gameState.discoveredRelics
      },
      world: {
        day: gameState.day,
        time: gameState.time,
        completedQuests: gameState.completedQuests,
        unlockedLocations: gameState.unlockedLocations,
        visitedLocations: gameState.visitedLocations
      }
    };

    try {
      localStorage.setItem(`${this.savePrefix}${slot}`, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  }

  loadGame(slot) {
    if (slot < 0 || slot >= this.maxSlots) {
      throw new Error('Invalid save slot');
    }

    const saveData = localStorage.getItem(`${this.savePrefix}${slot}`);
    if (!saveData) {
      throw new Error('No save data found in this slot');
    }

    try {
      const parsedData = JSON.parse(saveData);
      
      // Version check and migration if needed
      if (parsedData.version !== '1.0') {
        console.warn('Save data version mismatch, attempting migration...');
        // Implement version migration here if needed
      }

      return {
        playerName: parsedData.player.name,
        characterClass: parsedData.player.class,
        playerX: parsedData.player.x,
        playerY: parsedData.player.y,
        hp: parsedData.player.hp,
        maxHp: parsedData.player.maxHp,
        hunger: parsedData.player.hunger,
        stamina: parsedData.player.stamina,
        gold: parsedData.player.gold,
        inventory: parsedData.player.inventory,
        equipment: parsedData.player.equipment,
        discoveredRelics: parsedData.player.discoveredRelics,
        day: parsedData.world.day,
        time: parsedData.world.time,
        completedQuests: parsedData.world.completedQuests,
        unlockedLocations: parsedData.world.unlockedLocations,
        visitedLocations: parsedData.world.visitedLocations
      };
    } catch (error) {
      console.error('Error loading save data:', error);
      throw new Error('Failed to load save data');
    }
  }

  deleteSave(slot) {
    if (slot < 0 || slot >= this.maxSlots) {
      throw new Error('Invalid save slot');
    }

    try {
      localStorage.removeItem(`${this.savePrefix}${slot}`);
      return true;
    } catch (error) {
      console.error('Error deleting save:', error);
      return false;
    }
  }

  hasSave(slot) {
    if (slot < 0 || slot >= this.maxSlots) {
      return false;
    }
    return localStorage.getItem(`${this.savePrefix}${slot}`) !== null;
  }

  getNextAvailableSlot() {
    for (let i = 0; i < this.maxSlots; i++) {
      if (!this.hasSave(i)) {
        return i;
      }
    }
    return -1; // No slots available
  }

  clearAllSaves() {
    try {
      for (let i = 0; i < this.maxSlots; i++) {
        localStorage.removeItem(`${this.savePrefix}${i}`);
      }
      return true;
    } catch (error) {
      console.error('Error clearing all saves:', error);
      return false;
    }
  }
}

export default SaveSystem; 