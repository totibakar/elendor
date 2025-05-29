import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import World from './pages/World';
import { GameProvider } from './context/GameContext';
import './App.css';

function App() {
  return (
    <GameProvider>
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
          <Route path="world" element={<World />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </GameProvider>
  );
}

export default App; 