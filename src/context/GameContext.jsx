import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterStats, setCharacterStats] = useState(null);

  const value = {
    playerName,
    setPlayerName,
    selectedCharacter,
    setSelectedCharacter,
    characterStats,
    setCharacterStats,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext; 