import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { ThemeProvider } from './context/ThemeContext';
import { PlayerCardLayoutProvider } from './context/PlayerCardLayoutContext';
import { useServiceWorker } from './hooks/useServiceWorker';
import './App.css';
import './styles/layout.css';
// Theme CSS files - automatically discovered from src/styles/themes/
// Add new themes by creating .css files in that folder with @theme-id, @theme-label, @theme-description metadata
// Then run: npm run generate-themes
import './styles/themes/generic.css';
import './styles/themes/starRealms.css';

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
      <PlayerCardLayoutProvider>
        <Router>
          <AppContent />
        </Router>
      </PlayerCardLayoutProvider>
    </ThemeProvider>
  );
}

export default App;
