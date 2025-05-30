import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [playerName, setPlayerName] = useState(() => {
    const saved = localStorage.getItem('playerName');
    return saved || '';
  });
  
  const [selectedCharacter, setSelectedCharacter] = useState(() => {
    const saved = localStorage.getItem('selectedCharacter');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [characterStats, setCharacterStats] = useState(() => {
    const saved = localStorage.getItem('characterStats');
    return saved ? JSON.parse(saved) : null;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('playerName', playerName);
  }, [playerName]);

  useEffect(() => {
    if (selectedCharacter) {
      localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
    }
  }, [selectedCharacter]);

  useEffect(() => {
    if (characterStats) {
      localStorage.setItem('characterStats', JSON.stringify(characterStats));
    }
  }, [characterStats]);

  const clearGameData = () => {
    setPlayerName('');
    setSelectedCharacter(null);
    setCharacterStats(null);
    localStorage.removeItem('playerName');
    localStorage.removeItem('selectedCharacter');
    localStorage.removeItem('characterStats');
  };

  const value = {
    playerName,
    setPlayerName,
    selectedCharacter,
    setSelectedCharacter,
    characterStats,
    setCharacterStats,
    clearGameData
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext; 