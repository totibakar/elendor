class Player {
  constructor(x, y, characterClass) {
    this.x = x;
    this.y = y;
    this.characterClass = characterClass;
    this.direction = 'down';
    this.isMoving = false;
    this.isRunning = false;
    this.isSitting = false;
    this.frameIndex = 0;
    this.frameCount = 0;
    this.speed = 3;
    this.lastMoveTime = Date.now();
    
    // Create fallback sprite
    this.fallbackSprite = this.createFallbackSprite();
    
    // Initialize sprites object with directional arrays
    this.sprites = {
      idle: {
        up: null,
        down: null,
        left: null,
        right: null
      },
      walk: {
        up: [],
        down: [],
        left: [],
        right: []
      },
      run: {
        up: [],
        down: [],
        left: [],
        right: []
      },
      sit: {
        up: null,
        down: null,
        left: null,
        right: null
      }
    };

    // Load sprites based on character class
    this.loadSprites(characterClass);

    // Start AFK check
    this.startAfkCheck();
  }

  startAfkCheck() {
    setInterval(() => {
      if (!this.isMoving && !this.isSitting && Date.now() - this.lastMoveTime > 10000) {
        this.isSitting = true;
        this.frameIndex = 0;
      }
    }, 1000);
  }

  createFallbackSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 32, 32);
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  getDirectionNumber(direction) {
    switch (direction) {
      case 'up': return 8;
      case 'down': return 5;
      case 'left': return 4;
      case 'right': return 6;
      default: return 5;
    }
  }

  loadSprites(characterClass) {
    const directions = ['up', 'down', 'left', 'right'];
    const baseDir = characterClass === 'Soldier' ? 
      `/assets/soldier` : 
      `/assets/${characterClass}PC`;

    // Load idle sprites
    directions.forEach(dir => {
      const idleImg = new Image();
      const dirNum = this.getDirectionNumber(dir);
      idleImg.src = characterClass === 'Soldier' ?
        `${baseDir}/idle/idle${dirNum}.png` :
        `${baseDir}/${characterClass}Idle/idle${dirNum}.png`;
      
      this.sprites.idle[dir] = idleImg;

      // Load walk animation (8 frames)
      this.sprites.walk[dir] = Array(8).fill().map((_, i) => {
        const img = new Image();
        img.src = characterClass === 'Soldier' ?
          `${baseDir}/walk/walk${i + 1}.png` :
          `${baseDir}/${characterClass}Walk/walk${i + 1}.png`;
        return img;
      });

      // Load run animation (8 frames)
      this.sprites.run[dir] = Array(8).fill().map((_, i) => {
        const img = new Image();
        img.src = characterClass === 'Soldier' ?
          `${baseDir}/run/run${i + 1}.png` :
          `${baseDir}/${characterClass}Run/run${i + 1}.png`;
        return img;
      });

      // Load sit sprite with error handling
      const sitImg = new Image();
      sitImg.onerror = () => {
        console.error(`Failed to load sit sprite for direction ${dir}`);
        this.sprites.sit[dir] = this.sprites.idle[dir]; // Fallback to idle sprite
      };
      sitImg.src = characterClass === 'Soldier' ?
        `${baseDir}/sit/sit${dirNum}.png` :
        `${baseDir}/${characterClass}Sit/sit${dirNum}.png`;
      
      this.sprites.sit[dir] = sitImg;
    });
  }

  move(dx, dy, map) {
    if (!dx && !dy) {
      this.isMoving = false;
      return;
    }

    this.isMoving = true;
    this.isSitting = false;
    this.lastMoveTime = Date.now();

    // Determine direction based on movement
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }

    // Calculate new position
    const speed = this.speed * (this.isRunning ? 1.5 : 1) * map.getMovementSpeed(this.x, this.y);
    const newX = this.x + dx * speed;
    const newY = this.y + dy * speed;

    // Get map boundaries
    const bounds = map.getMapBounds();

    // Check collision and boundaries
    if (!map.isCollision(newX, this.y) && 
        newX >= bounds.minX && newX <= bounds.maxX) {
      this.x = newX;
    }
    if (!map.isCollision(this.x, newY) && 
        newY >= bounds.minY && newY <= bounds.maxY) {
      this.y = newY;
    }
  }

  update() {
    if (this.isMoving || this.isSitting) {
      this.frameCount++;
      const frameDelay = this.isSitting ? 8 : (this.isRunning ? 4 : 6);
      if (this.frameCount >= frameDelay) {
        this.frameCount = 0;
        this.frameIndex = (this.frameIndex + 1) % 8;
      }
    } else {
      this.frameIndex = 0;
    }
  }

  getSprite() {
    try {
      if (this.isSitting) {
        const sitSprite = this.sprites.sit[this.direction];
        // If sit sprite failed to load, use idle sprite as fallback
        return (sitSprite && sitSprite.complete) ? sitSprite : 
               (this.sprites.idle[this.direction] || this.fallbackSprite);
      }

      if (this.isMoving) {
        const animationSprites = this.isRunning ? this.sprites.run : this.sprites.walk;
        return animationSprites[this.direction][this.frameIndex] || this.fallbackSprite;
      }

      return this.sprites.idle[this.direction] || this.fallbackSprite;
    } catch (error) {
      console.error('Error getting sprite:', error);
      return this.fallbackSprite;
    }
  }

  render(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX + ctx.canvas.width / 2;
    const drawY = this.y - cameraY + ctx.canvas.height / 2;
    const sprite = this.getSprite();
    
    try {
      if (sprite && sprite.complete) {
        ctx.drawImage(sprite, drawX - 16, drawY - 16, 32, 32);
      } else {
        ctx.drawImage(this.fallbackSprite, drawX - 16, drawY - 16, 32, 32);
      }
    } catch (error) {
      console.error('Error rendering sprite:', error);
      ctx.drawImage(this.fallbackSprite, drawX - 16, drawY - 16, 32, 32);
    }
  }
}

export default Player; 