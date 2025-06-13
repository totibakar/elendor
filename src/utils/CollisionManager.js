class CollisionManager {
  constructor() {
    this.collisionMap = null;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.isLoaded = false;
    this.mapWidth = 0;
    this.mapHeight = 0;
  }

  async loadCollisionMap() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.mapWidth = img.width;
        this.mapHeight = img.height;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.collisionMap = this.ctx.getImageData(0, 0, img.width, img.height);
        this.isLoaded = true;
        resolve();
      };
      img.onerror = reject;
      img.src = '/assets/map/Collision.png';
    });
  }

  isColliding(x, y) {
    if (!this.isLoaded) return false;

    // Ensure coordinates are within bounds
    x = Math.max(0, Math.min(Math.floor(x), this.mapWidth - 1));
    y = Math.max(0, Math.min(Math.floor(y), this.mapHeight - 1));

    // Get the pixel data at the character's position
    const index = (y * this.mapWidth + x) * 4;
    const red = this.collisionMap.data[index];
    const green = this.collisionMap.data[index + 1];
    const blue = this.collisionMap.data[index + 2];

    // Check if the pixel is black (RGB: 0,0,0)
    return red === 0 && green === 0 && blue === 0;
  }

  // Check collision for character's bounding box with improved accuracy
  checkCollision(x, y, width, height) {
    if (!this.isLoaded) return false;

    // Check multiple points around the character for better accuracy
    const points = [
      // Corners
      { x: x, y: y }, // Top-left
      { x: x + width, y: y }, // Top-right
      { x: x, y: y + height }, // Bottom-left
      { x: x + width, y: y + height }, // Bottom-right
      
      // Mid points
      { x: x + width/2, y: y }, // Top-middle
      { x: x + width/2, y: y + height }, // Bottom-middle
      { x: x, y: y + height/2 }, // Left-middle
      { x: x + width, y: y + height/2 }, // Right-middle
      
      // Center point
      { x: x + width/2, y: y + height/2 } // Center
    ];

    // Check each point for collision
    return points.some(point => this.isColliding(point.x, point.y));
  }
}

export const collisionManager = new CollisionManager();
export default CollisionManager; 