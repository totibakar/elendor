class SpawnManager {
  constructor() {
    this.spawnPoints = [];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.isLoaded = false;
  }

  async loadSpawnPoints() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        
        // Scan for black pixels (RGB: 0,0,0)
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const index = (y * img.width + x) * 4;
            const red = imageData.data[index];
            const green = imageData.data[index + 1];
            const blue = imageData.data[index + 2];
            
            if (red === 0 && green === 0 && blue === 0) {
              // Found a spawn point
              this.spawnPoints.push({ x, y });
              // Skip next 4 pixels since spawn points are 5x5
              x += 4;
            }
          }
        }
        
        this.isLoaded = true;
        resolve();
      };
      img.onerror = reject;
      img.src = '/assets/map/Spawn.png';
    });
  }

  getRandomSpawnPoint() {
    if (!this.isLoaded || this.spawnPoints.length === 0) {
      // Return default spawn point if no spawn points are loaded
      return { x: 100, y: 100 };
    }
    
    const randomIndex = Math.floor(Math.random() * this.spawnPoints.length);
    return this.spawnPoints[randomIndex];
  }
}

export const spawnManager = new SpawnManager();
export default SpawnManager; 