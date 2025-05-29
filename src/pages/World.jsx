import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_LOCATIONS } from '../constants/defaultLocations';

const WorldContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #1a0f2b;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  height: 60px;
  background: #2c1810;
  border-bottom: 2px solid #8b4513;
  color: #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'MedievalSharp', cursive;
`;

const GameArea = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 60px);
  display: flex;
  background: #1a0f2b;
`;

const MapFrame = styled.div`
  position: relative;
  width: 80%;
  height: 100%;
  background: #2c1810;
  border-right: 2px solid #8b4513;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`;

const MapContainer = styled.div`
  position: relative;
  width: 800px;
  height: 600px;
  border: 8px solid #8b4513;
  border-radius: 8px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  background: #2c1810;
  margin: auto;
`;

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url('/assets/map/Elendor.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  transform-origin: center;
`;

const Character = styled.div`
  position: absolute;
  width: 24px;  // Changed from 32px to 24px
  height: 32px; // Maintained 32px height
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
  z-index: 2;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate3d(0, 0, 0) scale(1);
  backface-visibility: hidden;
  transition: left 0.05s linear, top 0.05s linear;
  will-change: transform, background-image, left, top;
  zoom: reset;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  
  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    transform: translate3d(0, 0, 0) scale(1);
    zoom: 1;
  }
`;

const UIContainer = styled.div`
  width: 20%;
  height: 100%;
  background: #2c1810;
  border-left: 2px solid #8b4513;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  overflow-y: auto;

  /* Styling the scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b4513;
    border-radius: 4px;
    
    &:hover {
      background: #a25616;
    }
  }
`;

const StatsPanel = styled.div`
  position: relative;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;

  > div {
    display: flex;
    flex-direction: column;
    gap: 8px;

    > div:first-child {
      color: #ffd700;
      font-size: 16px;
      text-align: left;
      text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
    }
  }
`;

const DetailedStatsPanel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 20%;
  height: 100%;
  background: #2c1810;
  border-left: 2px solid #8b4513;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 100;
  transform: ${props => props.show ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;

  /* Styling the scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b4513;
    border-radius: 4px;
    
    &:hover {
      background: #a25616;
    }
  }
`;

const StatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #ffd700;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 16px;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const CloseStatsButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ffd700;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #fff;
  }
`;

const EquipmentSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #8b4513;
`;

const EquipmentTitle = styled.div`
  font-size: 18px;
  color: #ffd700;
  margin-bottom: 10px;
`;

const EquipmentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  color: #fff;
`;

const ControlsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: auto;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #8b4513;
  border-radius: 8px;
  align-items: center;
`;

const DPad = styled.div`
  position: relative;
  width: 120px; // Absolute size
  height: 120px; // Absolute size
  display: grid;
  grid-template: repeat(3, 1fr) / repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
`;

const DPadButton = styled.button`
  background: linear-gradient(to bottom, #8b4513, #5c2d0e);
  border: 2px solid #ffd700;
  color: #ffd700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  min-width: 0;
  min-height: 0;
  padding: 0;
  
  &:hover {
    background: linear-gradient(to bottom, #a25616, #6d3610);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
    background: linear-gradient(to bottom, #5c2d0e, #3d1e09);
  }

  &:disabled {
    background: #2c1810;
    border-color: #5c2d0e;
    cursor: default;
  }
`;

const ActionButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 200px;
  padding: 5px;
`;

const ActionButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled(DPadButton)`
  width: 40px; // Absolute size
  height: 40px; // Absolute size
  font-size: 20px;
  font-weight: bold;
  font-family: 'MedievalSharp', cursive;

  &.active {
    background: linear-gradient(to bottom, #a25616, #6d3610);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    border-color: #ffd700;
    transform: scale(1.05);
  }
`;

const ButtonLabel = styled.div`
  color: #ffd700;
  font-size: 11px;
  text-align: center;
  font-family: 'MedievalSharp', cursive;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
`;

const StatBar = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #8b4513;
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.value}%;
    background: ${props => props.color};
    transition: width 0.3s ease;
    box-shadow: 0 0 10px ${props => props.color};
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: grid;
  grid-template: repeat(2, 1fr) / repeat(2, 1fr);
  gap: 10px;
  z-index: 3;
`;

// Add animation configuration after imports
const ANIMATION_CONFIG = {
  idle: { frames: 2, frameTime: 500 },    // 2 frames per direction, slower
  walk: { frames: 9, frameTime: 100 },    // 9 frames per direction, medium speed
  run: { frames: 8, frameTime: 80 }       // 8 frames per direction, fast
};

const DIRECTION_MAP = {
  up: 1,
  left: 3,
  down: 5,
  right: 7
};

const ANIMATION_SPEEDS = {
  idle: 1000,  // 1s per frame
  walk: 80,    // 80ms per frame
  run: 60      // 60ms per frame - faster for running
};

const IDLE_FRAMES = {
  up: [1, 2],
  left: [3, 4],
  down: [5, 6],
  right: [7, 8]
};

const WALK_FRAMES = {
  up: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  left: [10, 11, 12, 13, 14, 15, 16, 17, 18],
  down: [19, 20, 21, 22, 23, 24, 25, 26, 27],
  right: [28, 29, 30, 31, 32, 33, 34, 35, 36]
};

const RUN_FRAMES = {
  up: [1, 2, 3, 4, 5, 6, 7, 8],       // run1-8 for up
  left: [9, 10, 11, 12, 13, 14, 15, 16],   // run9-16 for left
  down: [17, 18, 19, 20, 21, 22, 23, 24],  // run17-24 for down
  right: [25, 26, 27, 28, 29, 30, 31, 32]  // run25-32 for right
};

const LONG_IDLE_FRAMES = {
  up: 1,      // sit1.png for up
  left: 2,    // sit2.png for left
  down: 3,    // sit3.png for down
  right: 4    // sit4.png for right
};

const IDLE_TIMEOUT = 6000; // 6 seconds

const PauseOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PauseMenu = styled.div`
  position: relative;
  width: 400px;
  background: url('/assets/ui/scroll.png'), #2c1810;
  background-size: cover;
  border: 4px solid #8b4513;
  border-radius: 15px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: floatIn 0.3s ease-out;
  box-shadow: 0 0 30px rgba(139, 69, 19, 0.5);

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: url('/assets/ui/seal.png') no-repeat center;
    background-size: contain;
  }

  @keyframes floatIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const PauseTitle = styled.h2`
  color: #ffd700;
  font-family: 'MedievalSharp', cursive;
  font-size: 36px;
  text-align: center;
  margin: 0 0 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
`;

const PauseButton = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(to bottom, #8b4513, #5c2d0e);
  border: 2px solid #ffd700;
  border-radius: 8px;
  color: #ffd700;
  font-family: 'MedievalSharp', cursive;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: scale(1.05);
    background: linear-gradient(to bottom, #a25616, #6d3610);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const InventoryPanel = styled.div`
  position: relative;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 40px);
  gap: 6px;
  padding: 6px;
  background: rgba(128, 128, 128, 0.3);
  border: 2px solid #5c2d0e;
  border-radius: 2px;
  margin: 0 auto;
`;

const InventorySlot = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(139, 69, 19, 0.3);
  border: 2px solid #3d1e09;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  
  &:hover {
    background: rgba(139, 69, 19, 0.5);
    border-color: #8b4513;
  }

  img {
    max-width: 36px;
    max-height: 36px;
    image-rendering: pixelated;
  }
`;

const ArmorAndPlayerSection = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 8px;
`;

const ArmorGrid = styled.div`
  display: grid;
  grid-template-rows: repeat(4, 40px);
  gap: 6px;
  padding: 6px;
  background: rgba(128, 128, 128, 0.3);
  border: 2px solid #5c2d0e;
  border-radius: 2px;
  width: 52px; // 40px slot + 6px padding * 2
`;

const PlayerPreview = styled.div`
  width: 117px; // Previous width (111.25px) + 5%
  height: 175.5px; // Previous height (167px) + 5%
  background: rgba(128, 128, 128, 0.3);
  border: 2px solid #5c2d0e;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    height: 138px; // Previous height (131.25px) + 5%
    width: auto;
    image-rendering: pixelated;
  }
`;

const InventoryTitle = styled.div`
  color: #ffd700;
  font-size: 16px;
  text-align: center;
  margin-bottom: 4px;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #2c1810;
  color: #ffd700;
  border: 2px solid #8b4513;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'MedievalSharp', cursive;
  z-index: 100;
  transition: all 0.2s ease;

  &:hover {
    background: #3d2315;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }

  &.active {
    background: #8b4513;
    border-color: #ffd700;
  }
`;

const MarkerTools = styled.div`
  position: absolute;
  top: 60px;
  left: 10px;
  background: rgba(44, 24, 16, 0.9);
  border: 2px solid #8b4513;
  padding: 10px;
  border-radius: 4px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
`;

const CoordinateDisplay = styled.div`
  position: absolute;
  top: 10px;
  left: 200px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd700;
  padding: 5px 10px;
  border-radius: 4px;
  font-family: monospace;
  z-index: 10;
  border: 1px solid #8b4513;
`;

const LocationMarker = styled.div`
  position: absolute;
  width: 32px;
  height: 32px;
  background: rgba(255, 215, 0, 0.3);
  border: 2px solid #ffd700;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 5;
  
  &:hover {
    background: rgba(255, 215, 0, 0.5);
  }

  &::after {
    content: '${props => props.label}';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    color: #ffd700;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    font-size: 12px;
  }
`;

const ExportButton = styled.button`
  position: absolute;
  top: 10px;
  left: 150px;
  background: #2c1810;
  color: #ffd700;
  border: 2px solid #8b4513;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'MedievalSharp', cursive;
  z-index: 100;
  transition: all 0.2s ease;
  display: ${props => props.show ? 'block' : 'none'};

  &:hover {
    background: #3d2315;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  top: 10px;
  left: 300px;
  background: #8b4513;
  color: #ffd700;
  border: 2px solid #ffd700;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'MedievalSharp', cursive;
  z-index: 100;
  transition: all 0.2s ease;
  display: ${props => props.show ? 'block' : 'none'};

  &:hover {
    background: #a25616;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
`;

const World = () => {
  const { selectedCharacter, characterStats, playerName } = useGame();
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [direction, setDirection] = useState('down');
  const [movement, setMovement] = useState('idle');
  const [frame, setFrame] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStats, setCurrentStats] = useState(characterStats);
  const [useSecondFrame, setUseSecondFrame] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [runFrame, setRunFrame] = useState(0);
  const walkTimer = useRef(null);
  const runTimer = useRef(null);
  
  const characterRef = useRef(null);
  const mapRef = useRef(null);
  const keysPressed = useRef({});
  
  const BASE_MOVEMENT_SPEED = 2.25; // Adjusted for new sprite size (24x32)
  const [loadedSprites, setLoadedSprites] = useState(new Set());
  const spriteCacheRef = useRef({});
  const [isLongIdle, setIsLongIdle] = useState(false);
  const lastMovementTime = useRef(Date.now());
  const longIdleTimer = useRef(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const mapContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunToggled, setIsRunToggled] = useState(false);
  const isShiftPressed = useRef(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [currentStamina, setCurrentStamina] = useState(characterStats.stamina);
  const staminaTimer = useRef(null);
  const STAMINA_DRAIN_RATE = 5; // Stamina points drained per second while sprinting
  const STAMINA_REGEN_RATE = 3; // Stamina points regenerated per second while not sprinting
  const [currentHunger, setCurrentHunger] = useState(characterStats.hunger);
  const hungerTimer = useRef(null);
  const HUNGER_DECREASE_RATE = 0.75; // Hunger points decreased per 30 seconds
  const [showInventory, setShowInventory] = useState(false);
  const [inventory, setInventory] = useState({
    main: Array(16).fill(null), // 4x4 grid
    armor: Array(4).fill(null) // head, chest, legs, feet
  });
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [markers, setMarkers] = useState([]);
  const [devMarkers, setDevMarkers] = useState([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState('shop');
  const [markerName, setMarkerName] = useState('');

  const markerTypes = {
    shop: { label: 'Shop', color: '#ffd700' },
    inn: { label: 'Inn', color: '#4caf50' },
    quest: { label: 'Quest', color: '#2196f3' },
    dungeon: { label: 'Dungeon', color: '#f44336' }
  };

  const handleMouseMove = useCallback((e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setMousePos({ x, y });
  }, []);

  const handleMapClick = useCallback((e) => {
    if (!isMarkingMode || !mapContainerRef.current) return;
    
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    if (markerName.trim()) {
      const newMarker = {
        id: Date.now().toString(),
        x,
        y,
        type: selectedMarkerType,
        name: markerName
      };
      setMarkers(prev => [...prev, newMarker]);
      setMarkerName('');
    }
  }, [isMarkingMode, selectedMarkerType, markerName]);

  const removeMarker = (markerId) => {
    setMarkers(prev => prev.filter(marker => marker.id !== markerId));
  };

  const clearAllMarkers = () => {
    if (window.confirm('Are you sure you want to clear all markers?')) {
      setMarkers([]);
    }
  };

  const exportMarkers = () => {
    const markersJson = JSON.stringify(markers, null, 2);
    
    // Create blob and download
    const blob = new Blob([markersJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game_locations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also log to console for easy copying
    console.log('Game Locations JSON:');
    console.log(markersJson);
  };

  // Idle animation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setUseSecondFrame(prev => !prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Optimized preload function
  const preloadSprite = async (path) => {
    if (loadedSprites.has(path)) return spriteCacheRef.current[path];
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setLoadedSprites(prev => new Set([...prev, path]));
        spriteCacheRef.current[path] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = path;
    });
  };

  // Preload all sprites for current state and direction
  const preloadSprites = async (characterClass, state, direction) => {
    if (typeof window === 'undefined') return;

    const getBaseDir = (state) => `/assets/${characterClass}PC/${characterClass}${state.charAt(0).toUpperCase() + state.slice(1)}`;
    const loadPromises = [];

    if (state === 'idle') {
      const baseDir = getBaseDir('idle');
      const [frame1, frame2] = IDLE_FRAMES[direction];
      loadPromises.push(
        preloadSprite(`${baseDir}/idle${frame1}.png`),
        preloadSprite(`${baseDir}/idle${frame2}.png`)
      );
      
      // Also preload sit sprites
      const sitBaseDir = `/assets/${characterClass}PC/${characterClass}Sit`;
      const sitFrame = LONG_IDLE_FRAMES[direction];
      loadPromises.push(preloadSprite(`${sitBaseDir}/sit${sitFrame}.png`));
    } else if (state === 'walk') {
      const baseDir = getBaseDir('walk');
      WALK_FRAMES[direction].forEach(frameNum => {
        loadPromises.push(preloadSprite(`${baseDir}/walk${frameNum}.png`));
      });
    } else if (state === 'run') {
      const baseDir = getBaseDir('run');
      RUN_FRAMES[direction].forEach(frameNum => {
        loadPromises.push(preloadSprite(`${baseDir}/run${frameNum}.png`));
      });
    }

    // Also preload the next likely sprites (adjacent directions)
    const adjacentDirections = {
      up: ['left', 'right'],
      down: ['left', 'right'],
      left: ['up', 'down'],
      right: ['up', 'down']
    };

    adjacentDirections[direction].forEach(adjDir => {
      if (state === 'idle') {
        const baseDir = getBaseDir('idle');
        const [frame1, frame2] = IDLE_FRAMES[adjDir];
        loadPromises.push(
          preloadSprite(`${baseDir}/idle${frame1}.png`),
          preloadSprite(`${baseDir}/idle${frame2}.png`)
        );
      }
    });

    await Promise.all(loadPromises);
  };

  // Animation handlers with RAF
  useEffect(() => {
    let animationFrameId;
    let lastFrameTime = 0;
    
    const animate = (timestamp) => {
      if (!lastFrameTime) lastFrameTime = timestamp;
      const deltaTime = timestamp - lastFrameTime;
      
      if (movement === 'walk' && deltaTime >= ANIMATION_SPEEDS.walk) {
        setWalkFrame(prev => (prev + 1) % 9);
        lastFrameTime = timestamp;
      } else if (movement === 'run' && deltaTime >= ANIMATION_SPEEDS.run) {
        setRunFrame(prev => (prev + 1) % 8);
        lastFrameTime = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    if (movement === 'walk' || movement === 'run') {
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [movement]);

  // Preload sprites when state changes
  useEffect(() => {
    if (!selectedCharacter) return;
    preloadSprites(selectedCharacter.name, movement, direction);
  }, [selectedCharacter, movement, direction]);

  // Function to handle long idle state
  const handleLongIdle = useCallback(() => {
    if (longIdleTimer.current) {
      clearTimeout(longIdleTimer.current);
    }

    // Reset long idle timer whenever there's movement
    if (movement === 'idle') {
      longIdleTimer.current = setTimeout(() => {
        console.log('Setting long idle to true'); // Debug log
        setIsLongIdle(true);
      }, IDLE_TIMEOUT);
    } else {
      setIsLongIdle(false);
    }
  }, [movement]);

  // Update long idle state when movement changes
  useEffect(() => {
    console.log('Movement changed to:', movement); // Debug log
    handleLongIdle();
    
    return () => {
      if (longIdleTimer.current) {
        clearTimeout(longIdleTimer.current);
      }
    };
  }, [movement, handleLongIdle]);

  // Debug log for sprite changes
  useEffect(() => {
    console.log('Current sprite:', getCharacterSprite());
    console.log('Is long idle:', isLongIdle);
  }, [isLongIdle, movement, direction]);

  const getCharacterSprite = () => {
    if (!selectedCharacter) return '';
    
    const characterClass = selectedCharacter.name;
    
    // If in long idle state, use the sit sprite
    if (isLongIdle && movement === 'idle') {
      const baseDir = `/assets/${characterClass}PC/${characterClass}Sit`;
      const frame = LONG_IDLE_FRAMES[direction];
      const spritePath = `${baseDir}/sit${frame}.png`;
      console.log('Using sit sprite:', spritePath); // Debug log
      return spritePath;
    }
    
    switch (movement) {
      case 'run':
        const runBaseDir = `/assets/${characterClass}PC/${characterClass}Run`;
        const runFrames = RUN_FRAMES[direction];
        return `${runBaseDir}/run${runFrames[runFrame]}.png`;
      case 'walk':
        const walkBaseDir = `/assets/${characterClass}PC/${characterClass}Walk`;
        const walkFrames = WALK_FRAMES[direction];
        return `${walkBaseDir}/walk${walkFrames[walkFrame]}.png`;
      default: // normal idle
        const idleBaseDir = `/assets/${characterClass}PC/${characterClass}Idle`;
        const [firstFrame, secondFrame] = IDLE_FRAMES[direction];
        return `${idleBaseDir}/idle${useSecondFrame ? secondFrame : firstFrame}.png`;
    }
  };

  useEffect(() => {
    if (!selectedCharacter) {
      navigate('/');
      return;
    }
    setCurrentStats(characterStats);
    setCurrentStamina(characterStats.stamina);
    setCurrentHunger(characterStats.hunger);
  }, [selectedCharacter, characterStats, navigate]);

  // Handle pause/unpause
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Handle restart
  const handleRestart = () => {
    setPosition({ x: 100, y: 100 }); // Reset to initial position
    setDirection('down');
    setMovement('idle');
    setIsRunning(false);
    setIsPaused(false);
  };

  // Handle exit to main menu
  const handleExitToMainMenu = () => {
    navigate('/');
  };

  // Handle run toggle button
  const toggleRun = () => {
    setIsRunToggled(prev => !prev);
  };

  // Add keyboard event handlers for pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'shift') {
        isShiftPressed.current = true;
      }
      if (e.key.toLowerCase() === 'escape') {
        togglePause();
      }
      if (e.key.toLowerCase() === 'r') {
        toggleRun();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      if (e.key.toLowerCase() === 'shift') {
        isShiftPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update isRunning based on either shift or toggle
  useEffect(() => {
    setIsRunning(isShiftPressed.current || isRunToggled);
  }, [isShiftPressed.current, isRunToggled]);

  // Handle stamina regeneration and drain
  useEffect(() => {
    if (staminaTimer.current) {
      clearInterval(staminaTimer.current);
    }

    staminaTimer.current = setInterval(() => {
      if (movement === 'run' && (isShiftPressed.current || isRunToggled)) {
        // Drain stamina while sprinting
        setCurrentStamina(prev => {
          const newStamina = Math.max(0, prev - STAMINA_DRAIN_RATE / 10);
          if (newStamina === 0) {
            // Force walk if stamina is depleted
            setIsRunToggled(false);
          }
          return newStamina;
        });
      } else {
        // Regenerate stamina when not sprinting
        setCurrentStamina(prev => Math.min(characterStats.stamina, prev + STAMINA_REGEN_RATE / 10));
      }
    }, 100); // Update every 100ms for smooth transitions

    return () => {
      if (staminaTimer.current) {
        clearInterval(staminaTimer.current);
      }
    };
  }, [movement, isRunToggled, characterStats.stamina]);

  // Handle hunger decrease
  useEffect(() => {
    if (hungerTimer.current) {
      clearInterval(hungerTimer.current);
    }

    hungerTimer.current = setInterval(() => {
      setCurrentHunger(prev => {
        const newHunger = Math.max(0, prev - HUNGER_DECREASE_RATE);
        // Update currentStats to reflect hunger change
        setCurrentStats(prev => ({
          ...prev,
          hunger: newHunger
        }));
        return newHunger;
      });
    }, 30000); // 30 seconds

    return () => {
      if (hungerTimer.current) {
        clearInterval(hungerTimer.current);
      }
    };
  }, []);

  // Update current stats when character stats change
  useEffect(() => {
    setCurrentStats(characterStats);
    setCurrentStamina(characterStats.stamina);
    setCurrentHunger(characterStats.hunger);
  }, [characterStats]);

  // Modify the existing game loop to check stamina before allowing sprint
  useEffect(() => {
    let lastFrameTime = 0;
    let animationFrameId;

    const gameLoop = (timestamp) => {
      if (isPaused) {
        return;
      }

      if (!lastFrameTime) lastFrameTime = timestamp;
      const deltaTime = timestamp - lastFrameTime;
      
      if (deltaTime >= 16.67) {
        const keys = keysPressed.current;
        let newX = position.x;
        let newY = position.y;
        let newDirection = direction;
        let isMoving = false;
        
        // Only allow sprint if there's enough stamina
        const canSprint = currentStamina > 0;
        const speed = (canSprint && (isShiftPressed.current || isRunToggled)) ? 
          BASE_MOVEMENT_SPEED * 1.6 : BASE_MOVEMENT_SPEED;

        if (keys['w'] || keys['arrowup']) {
          newY -= speed;
          newDirection = 'up';
          isMoving = true;
        }
        if (keys['s'] || keys['arrowdown']) {
          newY += speed;
          newDirection = 'down';
          isMoving = true;
        }
        if (keys['a'] || keys['arrowleft']) {
          newX -= speed;
          newDirection = 'left';
          isMoving = true;
        }
        if (keys['d'] || keys['arrowright']) {
          newX += speed;
          newDirection = 'right';
          isMoving = true;
        }

        setPosition({ x: newX, y: newY });
        setDirection(newDirection);
        
        // Update movement state based on stamina availability
        setMovement(isMoving ? 
          (canSprint && (isShiftPressed.current || isRunToggled) ? 'run' : 'walk') 
          : 'idle'
        );
        
        lastFrameTime = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (!isPaused) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [direction, position, isRunToggled, isPaused, currentStamina]);

  // Calculate and update map dimensions
  useEffect(() => {
    const updateMapDimensions = () => {
      if (mapContainerRef.current) {
        const container = mapContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Load the map image to get its natural dimensions
        const img = new Image();
        img.src = '/assets/map/Elendor.png';
        img.onload = () => {
          const imageRatio = img.naturalWidth / img.naturalHeight;
          const containerRatio = containerWidth / containerHeight;
          
          let width, height;
          if (containerRatio > imageRatio) {
            // Container is wider than image ratio
            height = containerHeight;
            width = height * imageRatio;
          } else {
            // Container is taller than image ratio
            width = containerWidth;
            height = width / imageRatio;
          }
          
          setMapDimensions({ width, height });
        };
      }
    };

    updateMapDimensions();
    window.addEventListener('resize', updateMapDimensions);
    
    return () => {
      window.removeEventListener('resize', updateMapDimensions);
    };
  }, []);

  // Function to handle inventory slot click
  const handleSlotClick = (section, index) => {
    console.log(`Clicked ${section} slot ${index}`);
    // Add item handling logic here
  };

  if (!selectedCharacter) {
    return <WorldContainer>Loading...</WorldContainer>;
  }

  return (
    <WorldContainer>
      <Header>Elendor - {playerName}</Header>
      <GameArea>
        <MapFrame>
          <ToggleButton 
            className={isMarkingMode ? 'active' : ''} 
            onClick={() => setIsMarkingMode(!isMarkingMode)}
          >
            {isMarkingMode ? 'Finish Marking' : 'Mark Locations'}
          </ToggleButton>

          <ExportButton 
            show={isMarkingMode}
            onClick={exportMarkers}
          >
            Export Locations
          </ExportButton>

          <ClearButton
            show={isMarkingMode && markers.length > 0}
            onClick={clearAllMarkers}
          >
            Clear All Markers
          </ClearButton>

          {isMarkingMode && (
            <MarkerTools>
              <select 
                value={selectedMarkerType}
                onChange={(e) => setSelectedMarkerType(e.target.value)}
                style={{
                  padding: '5px',
                  background: '#2c1810',
                  color: '#ffd700',
                  border: '1px solid #8b4513'
                }}
              >
                {Object.entries(markerTypes).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                type="text"
                value={markerName}
                onChange={(e) => setMarkerName(e.target.value)}
                placeholder="Location name"
                style={{
                  padding: '5px',
                  background: '#2c1810',
                  color: '#ffd700',
                  border: '1px solid #8b4513'
                }}
              />
              <div style={{ color: '#ffd700', fontSize: '12px', marginTop: '10px' }}>
                • Click marker to remove it
              </div>
              <div style={{ color: '#ffd700', fontSize: '12px' }}>
                • Use 'Clear All Markers' to remove everything
              </div>
            </MarkerTools>
          )}

          <MapContainer 
            ref={mapContainerRef}
            onMouseMove={handleMouseMove}
            onClick={handleMapClick}
          >
            <Map>
              <Character
                ref={characterRef}
                x={position.x}
                y={position.y}
                style={{
                  backgroundImage: `url("${getCharacterSprite()}")`,
                }}
              />
              
              {markers.map(marker => (
                <LocationMarker
                  key={marker.id}
                  style={{
                    left: marker.x,
                    top: marker.y,
                    background: `${markerTypes[marker.type].color}40`,
                    borderColor: markerTypes[marker.type].color
                  }}
                  label={marker.name}
                  onClick={() => isMarkingMode && removeMarker(marker.id)}
                />
              ))}

              {isMarkingMode && (
                <CoordinateDisplay>
                  X: {mousePos.x}, Y: {mousePos.y}
                </CoordinateDisplay>
              )}
            </Map>
          </MapContainer>
        </MapFrame>
        
        <UIContainer>
          <StatsPanel>
            <div>
              <div>HP</div>
              <StatBar value={(currentStats.hp / 100) * 100} color="#ff4444" />
            </div>
            <div>
              <div>Hunger</div>
              <StatBar value={(currentHunger / 100) * 100} color="#ffaa44" />
            </div>
            <div>
              <div>Stamina</div>
              <StatBar value={(currentStamina / characterStats.stamina) * 100} color="#44ff44" />
            </div>
          </StatsPanel>

          <DetailedStatsPanel show={showDetailedStats}>
            <CloseStatsButton onClick={() => setShowDetailedStats(false)}>×</CloseStatsButton>
            <h2 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Character Stats</h2>
            
            <StatRow>
              <StatLabel>
                Health Points
                <span>{Math.round(currentStats.hp)}/100</span>
              </StatLabel>
              <StatBar value={(currentStats.hp / 100) * 100} color="#ff4444" />
            </StatRow>
            
            <StatRow>
              <StatLabel>
                Stamina
                <span>{Math.round(currentStamina)}/{characterStats.stamina}</span>
              </StatLabel>
              <StatBar value={(currentStamina / characterStats.stamina) * 100} color="#44ff44" />
            </StatRow>
            
            <StatRow>
              <StatLabel>
                Hunger
                <span>{Math.round(currentHunger)}/100</span>
              </StatLabel>
              <StatBar value={(currentHunger / 100) * 100} color="#ffaa44" />
            </StatRow>

            <EquipmentSection>
              <EquipmentTitle>Equipment</EquipmentTitle>
              <EquipmentRow>
                <span>Weapon</span>
                <span>{selectedCharacter.weapon || 'None'}</span>
              </EquipmentRow>
              <EquipmentRow>
                <span>Armor</span>
                <span>{selectedCharacter.armor || 'None'}</span>
              </EquipmentRow>
            </EquipmentSection>
          </DetailedStatsPanel>

          {showInventory && (
            <InventoryPanel>
              <InventoryTitle>Inventory</InventoryTitle>
              
              <ArmorAndPlayerSection>
                <ArmorGrid>
                  {inventory.armor.map((item, index) => (
                    <InventorySlot 
                      key={`armor-${index}`}
                      onClick={() => handleSlotClick('armor', index)}
                    >
                      {item && <img src={item.icon} alt={item.name} />}
                    </InventorySlot>
                  ))}
                </ArmorGrid>

                <PlayerPreview>
                  <img src={getCharacterSprite()} alt="Player" />
                </PlayerPreview>
              </ArmorAndPlayerSection>

              <InventoryGrid>
                {inventory.main.map((item, index) => (
                  <InventorySlot 
                    key={`main-${index}`}
                    onClick={() => handleSlotClick('main', index)}
                  >
                    {item && <img src={item.icon} alt={item.name} />}
                  </InventorySlot>
                ))}
              </InventoryGrid>
            </InventoryPanel>
          )}

          <ControlsPanel>
            <DPad>
              <DPadButton disabled />
              <DPadButton 
                onTouchStart={() => keysPressed.current['w'] = true} 
                onTouchEnd={() => keysPressed.current['w'] = false}
              >
                ↑
              </DPadButton>
              <DPadButton disabled />
              <DPadButton 
                onTouchStart={() => keysPressed.current['a'] = true} 
                onTouchEnd={() => keysPressed.current['a'] = false}
              >
                ←
              </DPadButton>
              <DPadButton disabled />
              <DPadButton 
                onTouchStart={() => keysPressed.current['d'] = true} 
                onTouchEnd={() => keysPressed.current['d'] = false}
              >
                →
              </DPadButton>
              <DPadButton disabled />
              <DPadButton 
                onTouchStart={() => keysPressed.current['s'] = true} 
                onTouchEnd={() => keysPressed.current['s'] = false}
              >
                ↓
              </DPadButton>
              <DPadButton disabled />
            </DPad>

            <ActionButtonGrid>
              <ActionButtonWrapper>
                <ActionButton onClick={() => keysPressed.current['e'] = true}>
                  E
                </ActionButton>
                <ButtonLabel>Interact</ButtonLabel>
              </ActionButtonWrapper>
              <ActionButtonWrapper>
                <ActionButton onClick={() => setShowInventory(prev => !prev)}>
                  I
                </ActionButton>
                <ButtonLabel>Inventory {showInventory ? '(ON)' : '(OFF)'}</ButtonLabel>
              </ActionButtonWrapper>
              <ActionButtonWrapper>
                <ActionButton onClick={() => setShowDetailedStats(prev => !prev)}>
                  S
                </ActionButton>
                <ButtonLabel>Stats {showDetailedStats ? '(ON)' : '(OFF)'}</ButtonLabel>
              </ActionButtonWrapper>
              <ActionButtonWrapper>
                <ActionButton onClick={() => keysPressed.current['m'] = true}>
                  M
                </ActionButton>
                <ButtonLabel>Map</ButtonLabel>
              </ActionButtonWrapper>
              <ActionButtonWrapper>
                <ActionButton 
                  onClick={toggleRun}
                  className={isRunToggled ? 'active' : ''}
                >
                  R
                </ActionButton>
                <ButtonLabel>Run {isRunToggled ? '(ON)' : '(OFF)'}</ButtonLabel>
              </ActionButtonWrapper>
              <ActionButtonWrapper>
                <ActionButton onClick={togglePause}>
                  P
                </ActionButton>
                <ButtonLabel>Pause</ButtonLabel>
              </ActionButtonWrapper>
            </ActionButtonGrid>
          </ControlsPanel>
        </UIContainer>

        {isPaused && (
          <PauseOverlay>
            <PauseMenu>
              <PauseTitle>Game Paused</PauseTitle>
              <PauseButton onClick={togglePause}>Resume</PauseButton>
              <PauseButton onClick={handleRestart}>Restart</PauseButton>
              <PauseButton onClick={handleExitToMainMenu}>Exit to Main Menu</PauseButton>
            </PauseMenu>
          </PauseOverlay>
        )}
      </GameArea>
    </WorldContainer>
  );
};

export default World; 