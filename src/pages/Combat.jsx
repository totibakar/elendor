import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Combat.css';

const Combat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [combatState, setCombatState] = useState({
    playerHealth: 100,
    enemyHealth: 100,
    playerMaxHealth: 100,
    enemyMaxHealth: 100,
    isPlayerTurn: true,
    combatLog: []
  });

  useEffect(() => {
    // Initialize combat with URL parameters
    const params = new URLSearchParams(location.search);
    const enemy = params.get('enemy') || 'Unknown Enemy';
    const stats = params.get('stats') || '';
    initializeCombat(enemy, stats);
  }, [location]);

  const initializeCombat = (enemy, stats) => {
    // Initialize combat logic here
    // This would be implemented based on your combat system
  };

  const performAttack = (type) => {
    if (!combatState.isPlayerTurn) return;

    const damage = type === 'light' ? 10 : 20;
    const accuracy = type === 'light' ? 0.9 : 0.7;

    if (Math.random() <= accuracy) {
      setCombatState(prev => ({
        ...prev,
        enemyHealth: Math.max(0, prev.enemyHealth - damage),
        isPlayerTurn: false,
        combatLog: [...prev.combatLog, `You dealt ${damage} damage!`]
      }));

      // Check if enemy is defeated
      if (combatState.enemyHealth - damage <= 0) {
        handleVictory();
        return;
      }

      // Enemy turn
      setTimeout(enemyTurn, 1000);
    } else {
      setCombatState(prev => ({
        ...prev,
        isPlayerTurn: false,
        combatLog: [...prev.combatLog, 'Your attack missed!']
      }));
      setTimeout(enemyTurn, 1000);
    }
  };

  const handleBlock = () => {
    if (!combatState.isPlayerTurn) return;
    
    setCombatState(prev => ({
      ...prev,
      isPlayerTurn: false,
      combatLog: [...prev.combatLog, 'You prepare to block the next attack!']
    }));
    setTimeout(enemyTurn, 1000);
  };

  const enemyTurn = () => {
    const damage = Math.floor(Math.random() * 15) + 5;
    
    setCombatState(prev => ({
      ...prev,
      playerHealth: Math.max(0, prev.playerHealth - damage),
      isPlayerTurn: true,
      combatLog: [...prev.combatLog, `Enemy dealt ${damage} damage!`]
    }));

    // Check if player is defeated
    if (combatState.playerHealth - damage <= 0) {
      handleDefeat();
    }
  };

  const handleVictory = () => {
    const params = new URLSearchParams(location.search);
    const gold = parseInt(params.get('gold') || '0') + Math.floor(Math.random() * 50) + 20;
    
    navigate(`/arena?fromCombat=true&gold=${gold}`);
  };

  const handleDefeat = () => {
    navigate('/arena?fromCombat=true');
  };

  return (
    <div id="combat-area">
      <div className="combat-sprites">
        <img 
          id="player-sprite" 
          className="character-sprite" 
          alt="Player"
          src={`/assets/combat/player${location.state?.classIndex || 0}.png`}
        />
        <img 
          id="enemy-sprite" 
          className="character-sprite" 
          alt="Enemy"
          src={`/assets/enemies/${location.state?.enemy || 'default'}.png`}
        />
      </div>

      <div className="health-bars">
        <div className="health-bar">
          <div 
            id="player-health" 
            className="health-fill"
            style={{ width: `${(combatState.playerHealth / combatState.playerMaxHealth) * 100}%` }}
          ></div>
          <div id="player-health-text" className="health-text">
            {combatState.playerHealth}/{combatState.playerMaxHealth}
          </div>
        </div>

        <div className="health-bar">
          <div 
            id="enemy-health" 
            className="health-fill"
            style={{ width: `${(combatState.enemyHealth / combatState.enemyMaxHealth) * 100}%` }}
          ></div>
          <div id="enemy-health-text" className="health-text">
            {combatState.enemyHealth}/{combatState.enemyMaxHealth}
          </div>
        </div>
      </div>

      <div className="combat-log">
        {combatState.combatLog.slice(-5).map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>

      <div className="combat-controls">
        <button 
          id="light-attack" 
          onClick={() => performAttack('light')}
          disabled={!combatState.isPlayerTurn}
        >
          Light Attack
        </button>
        <button 
          id="heavy-attack" 
          onClick={() => performAttack('heavy')}
          disabled={!combatState.isPlayerTurn}
        >
          Heavy Attack
        </button>
        <button 
          id="block" 
          onClick={handleBlock}
          disabled={!combatState.isPlayerTurn}
        >
          Block
        </button>
      </div>
    </div>
  );
};

export default Combat; 