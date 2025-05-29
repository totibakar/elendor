import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Arena.css';
import GameMap from '../systems/GameMap';
import Player from '../systems/Player';

const Arena = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showSaveLoadMenu, setShowSaveLoadMenu] = useState(false);
  const [showTicTacToe, setShowTicTacToe] = useState(false);
  const [gameState, setGameState] = useState({
    hp: 100,
    hunger: 100,
    stamina: 100,
    gold: 0,
    day: 1,
    time: '6:00 AM',
    discoveredRelics: new Array(8).fill(false)
  });

  // Game state variables
  const gameRef = useRef({
    player: null,
    map: null,
    gameLoop: null,
    lastTime: 0,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      shift: false
    },
    cameraX: 0,
    cameraY: 0
  });

  useEffect(() => {
    console.log('Arena component mounted');
    initializeGame();
    return () => {
      console.log('Arena component unmounting');
      if (gameRef.current.gameLoop) {
        cancelAnimationFrame(gameRef.current.gameLoop);
      }
    };
  }, []);

  const initializeGame = () => {
    console.log('Initializing game');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth - 300; // Subtract UI panel width
    canvas.height = window.innerHeight - 60; // Subtract header height
    console.log('Canvas size set:', { width: canvas.width, height: canvas.height });

    // Initialize game objects
    const characterClass = localStorage.getItem('characterClass') || 'Mage';
    console.log('Character class loaded:', characterClass);

    // Initialize map first
    gameRef.current.map = new GameMap();
    
    // Wait for map to load before spawning player
    const checkMapLoaded = setInterval(() => {
      if (gameRef.current.map.isLoaded) {
        clearInterval(checkMapLoaded);
        
        // Get a safe spawn point from the map
        const spawnPoint = gameRef.current.map.getRandomSafeSpawn();
        console.log('Spawning player at:', spawnPoint);
        
        // Create player at safe location
        gameRef.current.player = new Player(spawnPoint.x, spawnPoint.y, characterClass);
        gameRef.current.cameraX = spawnPoint.x;
        gameRef.current.cameraY = spawnPoint.y;
        
        // Start game loop
        startGameLoop();
      }
    }, 100);

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Add resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth - 300;
      canvas.height = window.innerHeight - 60;
      console.log('Canvas resized:', { width: canvas.width, height: canvas.height });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      clearInterval(checkMapLoaded);
    };
  };

  const handleKeyDown = (event) => {
    const { keys } = gameRef.current;
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        keys.up = true;
        break;
      case 's':
      case 'arrowdown':
        keys.down = true;
        break;
      case 'a':
      case 'arrowleft':
        keys.left = true;
        break;
      case 'd':
      case 'arrowright':
        keys.right = true;
        break;
      case 'shift':
        if (gameState.stamina > 0) {
          keys.shift = true;
          gameRef.current.player.isRunning = true;
        }
        break;
      case 'escape':
        setShowPauseMenu(prev => !prev);
        break;
    }
  };

  const handleKeyUp = (event) => {
    const { keys } = gameRef.current;
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        keys.up = false;
        break;
      case 's':
      case 'arrowdown':
        keys.down = false;
        break;
      case 'a':
      case 'arrowleft':
        keys.left = false;
        break;
      case 'd':
      case 'arrowright':
        keys.right = false;
        break;
      case 'shift':
        keys.shift = false;
        gameRef.current.player.isRunning = false;
        break;
    }
  };

  const startGameLoop = () => {
    console.log('Starting game loop');
    let lastFrameTime = 0;
    let accumulatedTime = 0;
    const fixedTimeStep = 1000 / 60; // 60 FPS

    const loop = (currentTime) => {
      if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
      }

      // Calculate time since last frame
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      
      // Prevent spiral of death with large delta times
      const maxDeltaTime = 250; // max 250ms (4 FPS)
      const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
      
      accumulatedTime += clampedDeltaTime;

      // Update game state at a fixed time step
      while (accumulatedTime >= fixedTimeStep) {
        if (!showPauseMenu) {
          update(fixedTimeStep / 1000); // Convert to seconds
          updateGameState(fixedTimeStep / 1000);
        }
        accumulatedTime -= fixedTimeStep;
      }

      // Render at screen refresh rate
      if (!showPauseMenu) {
        render();
      }

      gameRef.current.gameLoop = requestAnimationFrame(loop);
    };

    gameRef.current.gameLoop = requestAnimationFrame(loop);
  };

  const update = (deltaTime) => {
    const { player, keys, map } = gameRef.current;

    // Calculate movement direction
    let dx = 0;
    let dy = 0;
    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707; // 1/√2
      dy *= 0.707;
    }

    // Move player
    player.move(dx, dy, map);
    player.update();

    // Update camera position to follow player
    gameRef.current.cameraX = player.x;
    gameRef.current.cameraY = player.y;

    // Update game state
    updateGameState(deltaTime);
  };

  const updateGameState = (deltaTime) => {
    setGameState(prev => {
      const newState = { ...prev };

      // Update stamina
      if (gameRef.current.player.isRunning) {
        newState.stamina = Math.max(0, prev.stamina - deltaTime * 20);
        if (newState.stamina === 0) {
          gameRef.current.player.isRunning = false;
          gameRef.current.keys.shift = false;
        }
      } else if (newState.stamina < 100) {
        newState.stamina = Math.min(100, prev.stamina + deltaTime * 10);
      }

      // Update hunger
      newState.hunger = Math.max(0, prev.hunger - deltaTime * 0.5);
      if (newState.hunger === 0) {
        newState.hp = Math.max(0, prev.hp - deltaTime * 2);
      }

      // Update game time (1 game minute = 1 real second)
      const totalMinutes = (
        parseInt(prev.time.split(':')[0]) * 60 + 
        parseInt(prev.time.split(':')[1])
      );
      const newTotalMinutes = totalMinutes + deltaTime;
      
      const hours = Math.floor(newTotalMinutes / 60) % 24;
      const minutes = Math.floor(newTotalMinutes % 60);
      
      newState.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Update day when crossing midnight
      if (hours === 0 && parseInt(prev.time.split(':')[0]) === 23) {
        newState.day += 1;
      }

      return newState;
    });
  };

  const render = () => {
    try {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
      const { map, player, cameraX, cameraY } = gameRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render map
      map.render(ctx, cameraX, cameraY);

    // Render player
      player.render(ctx, cameraX, cameraY);
    } catch (error) {
      console.error('Error in render loop:', error);
    }
  };

  // Handle D-pad button clicks
  const handleDpadClick = (direction) => {
    const { keys } = gameRef.current;
    switch (direction) {
      case 'up':
        keys.up = true;
        setTimeout(() => keys.up = false, 100);
        break;
      case 'down':
        keys.down = true;
        setTimeout(() => keys.down = false, 100);
        break;
      case 'left':
        keys.left = true;
        setTimeout(() => keys.left = false, 100);
        break;
      case 'right':
        keys.right = true;
        setTimeout(() => keys.right = false, 100);
        break;
    }
  };

  return (
    <div>
      <header id="gameHeader">
        <h1>Elendor: Jejak Relik Nusantara</h1>
      </header>

      <main id="gameContainer">
        <div id="game-display-wrapper">
          <div id="gameArea">
            <canvas ref={canvasRef} id="gameCanvas"></canvas>
            
            <div id="hp-hunger-frame">
              <div id="hp-bar" style={{ width: `${gameState.hp}%` }}></div>
              <div id="hunger-bar" style={{ width: `${gameState.hunger}%` }}></div>
            </div>

            <div id="stamina-frame">
              <div id="stamina-bar" style={{ width: `${gameState.stamina}%` }}></div>
            </div>

            <div id="player-gold">
              <span id="gold-value">{gameState.gold}</span>
            </div>

            <div id="game-time">
              <span id="time-value">Day {gameState.day} - {gameState.time}</span>
            </div>

            <div id="relic-display">
              {gameState.discoveredRelics.map((discovered, index) => (
                <div 
                  key={index}
                  className="relic-slot"
                  title={`Relic ${index + 1} (${discovered ? 'Discovered' : 'Undiscovered'})`}
                  style={{ opacity: discovered ? 1 : 0.5 }}
                />
              ))}
            </div>
          </div>
        </div>

        <aside id="uiPanel">
          <h2>UI Panel</h2>
          <div id="pads-container">
            <div id="dpad-container" className="pad-container">
              <div className="pad-label">Movement</div>
              <button id="dpad-up" className="dpad-button" onClick={() => handleDpadClick('up')}>▲</button>
              <div className="dpad-middle-row">
                <button id="dpad-left" className="dpad-button" onClick={() => handleDpadClick('left')}>◀</button>
                <button id="dpad-right" className="dpad-button" onClick={() => handleDpadClick('right')}>▶</button>
              </div>
              <button id="dpad-down" className="dpad-button" onClick={() => handleDpadClick('down')}>▼</button>
            </div>
            
            <div id="action-pad-container" className="pad-container">
              <div className="pad-label">Actions</div>
              <button id="dpad-e" className="dpad-button action-button">E</button>
              <div className="action-middle-row">
                <button id="dpad-m" className="dpad-button action-button">M</button>
                <button id="dpad-stats" className="dpad-button action-button">S</button>
                <button id="dpad-r" className="dpad-button action-button" 
                  onMouseDown={() => {
                    if (gameState.stamina > 0) {
                      gameRef.current.keys.shift = true;
                      gameRef.current.player.isRunning = true;
                    }
                  }}
                  onMouseUp={() => {
                    gameRef.current.keys.shift = false;
                    gameRef.current.player.isRunning = false;
                  }}
                >R</button>
              </div>
              <button id="dpad-pause" className="dpad-button action-button" onClick={() => setShowPauseMenu(true)}>P</button>
            </div>
          </div>
        </aside>

        {showPauseMenu && (
          <div id="pause-menu">
            <div id="pause-content">
              <h3>Game Dijeda</h3>
              <div className="volume-controls">
                <div className="volume-slider">
                  <label htmlFor="main-volume">Main Volume</label>
                  <input type="range" id="main-volume" min="0" max="100" defaultValue="100" />
                </div>
                <div className="volume-slider">
                  <label htmlFor="music-volume">Music Volume</label>
                  <input type="range" id="music-volume" min="0" max="100" defaultValue="100" />
                </div>
                <div className="volume-slider">
                  <label htmlFor="ui-volume">UI Volume</label>
                  <input type="range" id="ui-volume" min="0" max="100" defaultValue="100" />
                </div>
              </div>
              <ul id="pause-options">
                <li onClick={() => setShowPauseMenu(false)}>Lanjutkan [Esc]</li>
                <li onClick={() => setShowSaveLoadMenu(true)}>Simpan Game</li>
                <li onClick={() => setShowSaveLoadMenu(true)}>Muat Game</li>
                <li onClick={() => window.location.reload()}>Mulai Ulang</li>
                <li onClick={() => navigate('/')}>Menu Utama</li>
                <li onClick={() => window.close()}>Keluar</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Arena; 