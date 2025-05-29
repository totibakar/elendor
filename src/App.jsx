import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainMenu from './pages/MainMenu.jsx';
import Arena from './pages/Arena.jsx';
import Combat from './pages/Combat.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/combat" element={<Combat />} />
      </Routes>
    </Router>
  );
}

export default App; 