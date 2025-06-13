class LocationManager {
  constructor() {
    this.locationMap = null;
    this.locations = {
      'ed2024': 'Lakers City',
      'ad1416': 'Woodville City',
      'ad2d2f': 'Managarmr Central City',
      '0015ff': 'Wheatlived Village',
      '2a2a2e': 'Fishmell Village',
      '555ec6': 'Stonedust Castle',
      '0e0e15': 'Beautiful Harbor',
      '0a0d2f': 'Wizard Tower',
      '676b97': 'Stronghold Maul',
      '202133': 'Dwarf Kingdom',
      '1f2248': 'Elven Kingdom'
    };
  }

  async loadLocationMap() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        this.locationMap = ctx;
        resolve();
      };
      img.onerror = reject;
      img.src = '/assets/map/WorldLocations.png';
    });
  }

  checkLocation(x, y) {
    if (!this.locationMap) return null;

    // Get the color at the player's position
    const pixel = this.locationMap.getImageData(x, y, 1, 1).data;
    const color = this.rgbToHex(pixel[0], pixel[1], pixel[2]);

    // Return the location name if the color matches
    return this.locations[color] || null;
  }

  rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }
}

export const locationManager = new LocationManager(); 