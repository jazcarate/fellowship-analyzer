import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';
import type { Dungeon } from './types';
import { LogParser } from './parser';
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
          const parser = new LogParser();
          const parsedDungeons = parser.parse(storedLog);
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

    const parser = new LogParser();
    const parsedDungeons = parser.parse(text);

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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div class="spinner"></div>
          <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>Parsing combat log...</p>
        </div>
      )}

      {!loading && dungeons.length === 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: 0 }}>Fellowship Log Analyzer</h1>
          <UploadPage onFileSelect={handleFileSelect} />
        </div>
      )}

      {!loading && dungeons.length > 0 && (
        <Router>
          <DungeonListPage
            path="/"
            dungeons={dungeons}
            onReset={resetApp}
          />
          <PlayerAnalysisPage
            path="/dungeon/:dungeonId/player/:playerId"
            dungeons={dungeons}
          />
        </Router>
      )}
    </div>
  );
}
