class GameMap {
  constructor() {
    // Define map dimensions and scale
    this.MAP_WIDTH = 2048;  // Base map width
    this.MAP_HEIGHT = 1536; // Base map height
    this.TILE_SIZE = 32;    // Base tile size
    
    // Initialize map images
    this.mapImage = new Image();
    this.mapImage.src = '/assets/map/Elendor.png';
    
    this.collisionMap = new Image();
    this.collisionMap.src = '/assets/map/TerrainBlock.png';
    
    this.movementMap = new Image();
    this.movementMap.src = '/assets/map/TerrainMovement.png';
    
    // Initialize state
    this.isLoaded = false;
    this.collisionData = null;
    this.movementData = null;
    
    // Define safe spawn areas (coordinates where we know it's safe)
    this.safeSpawns = [
      { x: 1024, y: 768 },  // Center of map
      { x: 1536, y: 384 },  // Top-right village
      { x: 512, y: 1152 }   // Bottom-left area
    ];

    // Set initial boundaries
    this.mapBounds = {
      minX: this.TILE_SIZE * 2,
      minY: this.TILE_SIZE * 2,
      maxX: this.MAP_WIDTH - this.TILE_SIZE * 2,
      maxY: this.MAP_HEIGHT - this.TILE_SIZE * 2
    };

    // Load all images and initialize data
    this.loadAssets();
  }

  async loadAssets() {
    try {
      await Promise.all([
        this.loadImage(this.mapImage),
        this.loadImage(this.collisionMap),
        this.loadImage(this.movementMap)
      ]);

      console.log('Map assets loaded successfully');
      this.initializeCollisionData();
      this.initializeMovementData();
      this.isLoaded = true;

      // Verify map dimensions
      if (this.mapImage.width !== this.MAP_WIDTH || this.mapImage.height !== this.MAP_HEIGHT) {
        console.warn('Main map dimensions mismatch:', {
          expected: { width: this.MAP_WIDTH, height: this.MAP_HEIGHT },
          actual: { width: this.mapImage.width, height: this.mapImage.height }
        });
      }
    } catch (error) {
      console.error('Failed to load map assets:', error);
    }
  }

  loadImage(img) {
    return new Promise((resolve, reject) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
      }
    });
  }

  initializeCollisionData() {
    const canvas = document.createElement('canvas');
    canvas.width = this.MAP_WIDTH;
    canvas.height = this.MAP_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    // Scale collision map to match main map size
    ctx.drawImage(this.collisionMap, 0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    this.collisionData = ctx.getImageData(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT).data;
    
    console.log('Collision data initialized:', {
      width: this.MAP_WIDTH,
      height: this.MAP_HEIGHT,
      dataLength: this.collisionData.length
    });
  }

  initializeMovementData() {
    const canvas = document.createElement('canvas');
    canvas.width = this.MAP_WIDTH;
    canvas.height = this.MAP_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    // Scale movement map to match main map size
    ctx.drawImage(this.movementMap, 0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    this.movementData = ctx.getImageData(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT).data;
  }

  isCollision(x, y) {
    if (!this.isLoaded || !this.collisionData) {
      return true;
    }

    // Check map boundaries
    if (x < this.mapBounds.minX || x > this.mapBounds.maxX || 
        y < this.mapBounds.minY || y > this.mapBounds.maxY) {
      return true;
    }

    // Get pixel position
    const pixelX = Math.floor(x);
    const pixelY = Math.floor(y);
    
    // Ensure coordinates are within bounds
    if (pixelX < 0 || pixelX >= this.MAP_WIDTH || 
        pixelY < 0 || pixelY >= this.MAP_HEIGHT) {
      return true;
    }

    // Calculate pixel index in the collision data array
    const index = (pixelY * this.MAP_WIDTH + pixelX) * 4;
    
    if (index < 0 || index >= this.collisionData.length) {
      return true;
    }

    // Get color values
    const red = this.collisionData[index];
    const green = this.collisionData[index + 1];
    const blue = this.collisionData[index + 2];
    
    // Return true for collision if pixel is dark (close to black)
    return (red + green + blue) / 3 < 128;
  }

  getMovementSpeed(x, y) {
    if (!this.isLoaded || !this.movementData) {
      return 1;
    }

    // Get pixel position
    const pixelX = Math.floor(x);
    const pixelY = Math.floor(y);
    
    // Ensure coordinates are within bounds
    if (pixelX < 0 || pixelX >= this.MAP_WIDTH || 
        pixelY < 0 || pixelY >= this.MAP_HEIGHT) {
      return 1;
    }

    // Calculate pixel index
    const index = (pixelY * this.MAP_WIDTH + pixelX) * 4;
    
    if (index < 0 || index >= this.movementData.length) {
      return 1;
    }

    const red = this.movementData[index];
    
    // Determine movement speed based on color
    if (red > 200) return 1.5;     // Fast (red areas)
    if (red < 50) return 0.5;      // Slow (dark areas)
    return 1.0;                    // Normal (white/gray areas)
  }

  getRandomSafeSpawn() {
    const spawn = this.safeSpawns[Math.floor(Math.random() * this.safeSpawns.length)];
    return {
      x: spawn.x,
      y: spawn.y
    };
  }

  render(ctx, cameraX, cameraY) {
    if (!this.isLoaded) return;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Calculate drawing position
    const drawX = -cameraX + canvasWidth / 2;
    const drawY = -cameraY + canvasHeight / 2;

    // Draw the map
    ctx.drawImage(this.mapImage, drawX, drawY);
  }

  getMapBounds() {
    return this.mapBounds;
  }
}

export default GameMap; 