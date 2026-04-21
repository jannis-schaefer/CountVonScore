import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { ThemeProvider } from './context/ThemeContext';
import { useServiceWorker } from './hooks/useServiceWorker';
import './App.css';
import './styles/layout.css';
import './styles/generic.css';
import './styles/starRealms.css';

// Pages
import { HomeMenu } from './pages/HomeMenu';
import { ModeSelection } from './pages/ModeSelection';
import { SharedDeviceMode } from './pages/SharedDeviceMode';
import { MultiplayerMode } from './pages/MultiplayerMode';
import { Settings } from './pages/Settings';

function AppContent() {
  const { loadGame } = useGameStore();
  useServiceWorker();

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  return (
    <Routes>
      <Route path="/" element={<HomeMenu />} />
      <Route path="/new-game" element={<ModeSelection />} />
      <Route path="/shared" element={<SharedDeviceMode />} />
      <Route path="/multiplayer" element={<MultiplayerMode />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
