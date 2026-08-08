import { useState, useRef } from 'react';
import Header from './components/Header';
import StatusView from './components/StatusView';
import SettingsView, { SettingsViewRef } from './components/SettingsView';
import StatusFooter from './components/StatusFooter';
import SettingsFooter from './components/SettingsFooter';
import { useBot } from './hooks/useBot';
import './styles.css'; // eslint-disable-line

type ViewType = 'status' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('status');
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [currentMinEarnings, setCurrentMinEarnings] = useState(0);
  const [currentMaxEarnings, setCurrentMaxEarnings] = useState(0);

  const settingsRef = useRef<SettingsViewRef>(null);
  const bot = useBot();

  const handleSettingsSaved = (minEarnings: number, maxEarnings: number) => {
    setCurrentMinEarnings(minEarnings);
    setCurrentMaxEarnings(maxEarnings);
    setCurrentView('status');
  };

  return (
    <div className="flex flex-col h-screen bg-gh-bg">
      <Header />

      <main className="flex-1 px-6 flex items-center justify-center overflow-hidden">
        {currentView === 'status' ? (
          <StatusView
            status={bot.status}
            title={bot.title}
            message={bot.message}
            actionLogs={bot.logs}
            currentEarnings={currentMinEarnings}
            maxEarnings={currentMaxEarnings}
          />
        ) : (
          <SettingsView
            ref={settingsRef}
            onSave={handleSettingsSaved}
            onMousePosition={(x, y) => { setMouseX(x); setMouseY(y); }}
          />
        )}
      </main>

      {currentView === 'status' ? (
        <StatusFooter
          status={bot.status}
          onToggle={bot.toggle}
          onSettings={() => setCurrentView('settings')}
        />
      ) : (
        <SettingsFooter
          mouseX={mouseX}
          mouseY={mouseY}
          onCancel={() => setCurrentView('status')}
          onSave={() => settingsRef.current?.saveSettings()}
        />
      )}
    </div>
  );
}

export default App;
