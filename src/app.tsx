import { useState, useEffect } from 'preact/hooks';
import { LocationProvider, Router, Route } from 'preact-iso';
import type { Dungeon } from './types';
import { parseLog } from './parser';
import { getLogText, storeLogText, clearLogText } from './storage';
import { UploadPage } from './pages/upload';
import { DungeonListPage } from './pages/dungeon-list';
import { PlayerAnalysisPage } from './pages/player-analysis';
import './style.css';

export function App() {
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStoredLog = async () => {
      try {
        const storedLog = await getLogText();
        if (storedLog) {
          setLoading(true);
          const parsedDungeons = parseLog(storedLog);
          console.log('Parsed dungeons:', parsedDungeons);
          setDungeons(parsedDungeons);
          setLoading(false);
        }
      } catch (err) {
        console.error('Could not load stored log:', err);
        setLoading(false);
      }
    };

    loadStoredLog();
  }, []);

  const handleFileSelect = async (text: string) => {
    setLoading(true);

    try {
      await storeLogText(text);
    } catch (err) {
      console.error('Could not store log:', err);
    }

    const parsedDungeons = parseLog(text);

    if (parsedDungeons.length === 0) {
      alert("There are no dungeons in this combat log");
    }

    setDungeons(parsedDungeons);
    console.log('Parsed dungeons:', parsedDungeons);
    setLoading(false);
  };

  const resetApp = async () => {
    try {
      await clearLogText();
    } catch (err) {
      console.error('Could not clear log:', err);
    }
    setDungeons([]);
  };

  return (
    <div class="container">
      {loading && (
        <div style={{
          maxWidth: '600px',
          margin: '100px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'var(--surface)',
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div class="spinner"></div>
          <p style={{ marginTop: '20px', fontSize: '16px', color: 'var(--text-secondary)' }}>
            Parsing combat log...
          </p>
        </div>
      )}

      {!loading && dungeons.length === 0 && (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '60px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
            Fellowship Log Analyzer
          </h1>
          <UploadPage onFileSelect={handleFileSelect} />
        </div>
      )}

      {!loading && dungeons.length > 0 && (
        <LocationProvider>
          <Router>
            <Route path="/" component={() => <DungeonListPage dungeons={dungeons} onReset={resetApp} />} />
            <Route path="/dungeon/:dungeonId/player/:playerId" component={(props) => <PlayerAnalysisPage {...props} dungeons={dungeons} />} />
          </Router>
        </LocationProvider>
      )}
    </div>
  );
}
