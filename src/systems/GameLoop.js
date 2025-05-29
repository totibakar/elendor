class GameLoop {
  constructor(updateCallback, renderCallback) {
    this.update = updateCallback;
    this.render = renderCallback;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.frameId = null;
    this.isRunning = false;
    this.fps = 60;
    this.timeStep = 1000 / this.fps;
    this.accumulator = 0;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.frameId = requestAnimationFrame(this.loop.bind(this));
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.frameId !== null) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Prevent spiral of death
    if (this.deltaTime > 0.25) this.deltaTime = 0.25;

    this.accumulator += this.deltaTime;

    // Fixed time step updates
    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
    }

    // Render at animation frame rate
    this.render(this.deltaTime);

    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }

  getDeltaTime() {
    return this.deltaTime;
  }

  setFPS(newFPS) {
    this.fps = newFPS;
    this.timeStep = 1000 / this.fps;
  }

  isActive() {
    return this.isRunning;
  }
}

export default GameLoop; 