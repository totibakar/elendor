class AssetLoader {
  constructor() {
    this.assets = {
      maps: {
        world: null,
        collision: null,
        movement: null,
        spawn: null,
        location: null,
        liveLocation: null,
        playerIcon: null
      },
      sprites: {
        idle: [],
        walk: [],
        run: [],
        sit: []
      },
      audio: {
        openMap: null,
        closeMap: null,
        background: null,
        walk: null,
        run: null,
        hover: null
      }
    };

    this.loadingStatus = {
      maps: false,
      sprites: false,
      audio: false
    };

    this.animFramesConfig = { 
      idle: { count: 8, perDirection: 2 }, 
      walk: { count: 36, perDirection: 9 }, 
      run: { count: 32, perDirection: 8 },
      sit: { count: 4, perDirection: 1 }
    };
  }

  async loadAll() {
    try {
      await Promise.all([
        this.loadMaps(),
        this.loadSprites(),
        this.loadAudio()
      ]);
      return true;
    } catch (error) {
      console.error('Error loading assets:', error);
      return false;
    }
  }

  async loadMaps() {
    const mapPaths = {
      world: 'assets/map/Elendor.png',
      collision: 'assets/map/TerrainBlock.png',
      movement: 'assets/map/TerrainMovement.png',
      spawn: 'assets/map/Spawn.png',
      location: 'assets/map/Locations.png',
      liveLocation: 'assets/map/LiveLocation.png',
      playerIcon: 'assets/mapplayericon.png'
    };

    try {
      const loadPromises = Object.entries(mapPaths).map(([key, path]) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            this.assets.maps[key] = img;
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to load ${key} map at ${path}`));
          img.src = path;
        });
      });

      await Promise.all(loadPromises);
      this.loadingStatus.maps = true;
      return true;
    } catch (error) {
      console.error('Error loading maps:', error);
      return false;
    }
  }

  async loadSprites() {
    const characterClass = localStorage.getItem('characterClass') || '0';
    const baseSpritePath = this.getSpritePath(characterClass);
    
    try {
      for (const [action, config] of Object.entries(this.animFramesConfig)) {
        this.assets.sprites[action] = [];
        for (let i = 1; i <= config.count; i++) {
          const img = new Image();
          const path = `${baseSpritePath}/${action}/${i}.png`;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Failed to load sprite ${path}`));
            img.src = path;
          });
          this.assets.sprites[action].push(img);
        }
      }
      
      this.loadingStatus.sprites = true;
      return true;
    } catch (error) {
      console.error('Error loading sprites:', error);
      return false;
    }
  }

  async loadAudio() {
    const audioPaths = {
      openMap: 'assets/sound/openmap.mp3',
      closeMap: 'assets/sound/closemap.mp3',
      background: 'assets/sound/bgm.mp3',
      walk: 'assets/sound/walk.mp3',
      run: 'assets/sound/run.mp3',
      hover: 'assets/sound/hover.mp3'
    };

    try {
      const loadPromises = Object.entries(audioPaths).map(([key, path]) => {
        return new Promise((resolve, reject) => {
          const audio = new Audio(path);
          audio.oncanplaythrough = () => {
            this.assets.audio[key] = audio;
            if (key === 'background') {
              audio.loop = true;
              audio.volume = 0.5;
            }
            resolve();
          };
          audio.onerror = () => reject(new Error(`Failed to load audio ${path}`));
        });
      });

      await Promise.all(loadPromises);
      this.loadingStatus.audio = true;
      return true;
    } catch (error) {
      console.error('Error loading audio:', error);
      return false;
    }
  }

  getSpritePath(characterClass) {
    const classes = {
      '0': 'MagePC',
      '1': 'MercenaryPC',
      '2': 'RangerPC',
      '3': 'soldier'
    };
    return `assets/${classes[characterClass]}`;
  }

  isFullyLoaded() {
    return Object.values(this.loadingStatus).every(status => status === true);
  }

  getAsset(type, key) {
    return this.assets[type][key];
  }
}

export default AssetLoader; 