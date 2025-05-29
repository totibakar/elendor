class InteractionSystem {
  constructor() {
    this.locationColorMap = {
      '#0d00ff': 'Kota Willburg',
      '#0c049f': 'Desa Uwu',
      '#02064c': 'Desa Poke',
      '#2f3490': 'Kota Kecil',
      '#5b61de': 'Perkemahan Bandit',
      '#0c1067': 'Reruntuhan Hatiku',
      '#4a51d3': 'Pusat Kota Managarmr',
      '#888ab5': 'Kastil Kerajaan',
      '#5b5c6a': 'Menara Penyihir Sarungman',
      '#aeb2ff': 'Pelabuhan Indah Kapal',
      '#3e4171': 'Markas Tungtungtung Sahur',
      '#111235': 'Goa Monster Ambadala Crocodila',
      '#2d32a5': 'Goa Osas',
      '#232cde': 'Pohon Gede'
    };

    this.locationInteractions = {
      'Kota Willburg': {
        type: 'city',
        shops: ['weapon', 'armor', 'potion'],
        quests: true,
        gambling: true
      },
      'Desa Uwu': {
        type: 'village',
        shops: ['potion'],
        quests: true
      },
      'Desa Poke': {
        type: 'village',
        shops: ['potion'],
        quests: true
      },
      'Kota Kecil': {
        type: 'city',
        shops: ['weapon', 'armor'],
        quests: true
      },
      'Perkemahan Bandit': {
        type: 'hostile',
        combat: true
      },
      'Reruntuhan Hatiku': {
        type: 'dungeon',
        combat: true,
        puzzle: true
      },
      'Pusat Kota Managarmr': {
        type: 'city',
        shops: ['weapon', 'armor', 'potion'],
        quests: true,
        gambling: true
      },
      'Kastil Kerajaan': {
        type: 'castle',
        quests: true,
        special: 'returnRelics'
      }
      // ... more locations
    };

    this.shopInventory = {
      weapon: {
        'Pedang Kayu': { price: 50, damage: 5 },
        'Pedang Besi': { price: 150, damage: 10 },
        'Pedang Emas': { price: 500, damage: 20 }
      },
      armor: {
        'Baju Kayu': { price: 50, defense: 5 },
        'Baju Besi': { price: 150, defense: 10 },
        'Baju Emas': { price: 500, defense: 20 }
      },
      potion: {
        'Potion Kecil': { price: 20, heal: 20 },
        'Potion Sedang': { price: 50, heal: 50 },
        'Potion Besar': { price: 100, heal: 100 }
      }
    };
  }

  getLocationName(color) {
    return this.locationColorMap[color] || null;
  }

  getLocationInteractions(locationName) {
    return this.locationInteractions[locationName] || null;
  }

  handleLocationInteraction(locationName, playerState, onStateChange) {
    const location = this.locationInteractions[locationName];
    if (!location) return;

    switch (location.type) {
      case 'city':
      case 'village':
        return this.handlePeacefulLocation(locationName, location, playerState, onStateChange);
      case 'hostile':
        return this.handleHostileLocation(locationName, location, playerState, onStateChange);
      case 'dungeon':
        return this.handleDungeonLocation(locationName, location, playerState, onStateChange);
      case 'castle':
        return this.handleCastleLocation(locationName, location, playerState, onStateChange);
    }
  }

  handlePeacefulLocation(locationName, location, playerState, onStateChange) {
    return {
      title: `Welcome to ${locationName}`,
      options: [
        ...(location.shops ? location.shops.map(shop => ({
          label: `Visit ${shop.charAt(0).toUpperCase() + shop.slice(1)} Shop`,
          action: () => this.openShop(shop, playerState, onStateChange)
        })) : []),
        ...(location.quests ? [{
          label: 'View Quests',
          action: () => this.showQuests(locationName, playerState, onStateChange)
        }] : []),
        ...(location.gambling ? [{
          label: 'Try Your Luck',
          action: () => this.openGambling(playerState, onStateChange)
        }] : [])
      ]
    };
  }

  handleHostileLocation(locationName, location, playerState, onStateChange) {
    return {
      title: `Entering ${locationName}`,
      options: [
        {
          label: 'Prepare for Combat',
          action: () => this.initiateCombat(locationName, playerState, onStateChange)
        },
        {
          label: 'Leave',
          action: () => null
        }
      ]
    };
  }

  handleDungeonLocation(locationName, location, playerState, onStateChange) {
    return {
      title: `Exploring ${locationName}`,
      options: [
        {
          label: 'Enter Dungeon',
          action: () => this.enterDungeon(locationName, playerState, onStateChange)
        },
        ...(location.puzzle ? [{
          label: 'Solve Puzzle',
          action: () => this.showPuzzle(locationName, playerState, onStateChange)
        }] : []),
        {
          label: 'Leave',
          action: () => null
        }
      ]
    };
  }

  handleCastleLocation(locationName, location, playerState, onStateChange) {
    return {
      title: `Welcome to ${locationName}`,
      options: [
        ...(location.special === 'returnRelics' && playerState.discoveredRelics.some(relic => relic) ? [{
          label: 'Return Relics',
          action: () => this.returnRelics(playerState, onStateChange)
        }] : []),
        {
          label: 'Leave',
          action: () => null
        }
      ]
    };
  }

  openShop(shopType, playerState, onStateChange) {
    const inventory = this.shopInventory[shopType];
    return {
      title: `${shopType.charAt(0).toUpperCase() + shopType.slice(1)} Shop`,
      items: Object.entries(inventory).map(([name, item]) => ({
        name,
        price: item.price,
        stats: item[Object.keys(item).find(key => key !== 'price')],
        canBuy: playerState.gold >= item.price,
        onBuy: () => this.buyItem(shopType, name, item, playerState, onStateChange)
      }))
    };
  }

  buyItem(shopType, itemName, item, playerState, onStateChange) {
    if (playerState.gold < item.price) return false;

    const newState = { ...playerState };
    newState.gold -= item.price;

    switch (shopType) {
      case 'weapon':
        newState.equipment.weapon = itemName;
        newState.damage = item.damage;
        break;
      case 'armor':
        newState.equipment.armor = itemName;
        newState.defense = item.defense;
        break;
      case 'potion':
        if (!newState.inventory.potions) newState.inventory.potions = {};
        newState.inventory.potions[itemName] = (newState.inventory.potions[itemName] || 0) + 1;
        break;
    }

    onStateChange(newState);
    return true;
  }

  showQuests(locationName, playerState, onStateChange) {
    // Quest system implementation
  }

  openGambling(playerState, onStateChange) {
    // Gambling system implementation
  }

  initiateCombat(locationName, playerState, onStateChange) {
    // Combat system implementation
  }

  enterDungeon(locationName, playerState, onStateChange) {
    // Dungeon system implementation
  }

  showPuzzle(locationName, playerState, onStateChange) {
    // Puzzle system implementation
  }

  returnRelics(playerState, onStateChange) {
    // Relic return system implementation
  }
}

export default InteractionSystem; 