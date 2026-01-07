import { useState, useEffect } from 'preact/hooks';
import { LocationProvider, Router, Route } from 'preact-iso';
import type { Dungeon } from './types';
import { parseLog } from './parser';
import { getAllLogFilenames, getLogFile, storeLogFile, clearAllLogs } from './storage';
import { UploadPage } from './pages/upload';
import { DungeonListPage } from './pages/dungeon-list';
import { PlayerInsightsPage } from './pages/player-insights';
import { Header } from './components/common/header';
import './style.css';

export function App() {
  const [logsByFilename, setLogsByFilename] = useState<Record<string, Dungeon[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredLogs = async () => {
      try {
        setLoading(true);
        const filenames = await getAllLogFilenames();
        const logsMap: Record<string, Dungeon[]> = {};

        for (const filename of filenames) {
          const logText = await getLogFile(filename);
          if (logText) {
            const parsedDungeons = parseLog(logText);
            logsMap[filename] = parsedDungeons;
          }
        }

        setLogsByFilename(logsMap);
      } catch (err) {
        console.error('Could not load stored logs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoredLogs();
  }, []);

  const handleFileSelect = async (files: File[], navigate?: () => void) => {
    setLoading(true);

    try {
      // Clear all existing logs first
      await clearAllLogs();

      const logsMap: Record<string, Dungeon[]> = {};

      for (const file of files) {
        const text = await file.text();
        await storeLogFile(file.name, text);
        const parsedDungeons = parseLog(text);

        if (parsedDungeons.length === 0) {
          alert(`No dungeons found in ${file.name}`);
          continue;
        }

        logsMap[file.name] = parsedDungeons;
        console.log(`Parsed ${parsedDungeons.length} dungeons from ${file.name}`);
      }

      setLogsByFilename(logsMap);

      if (navigate) {
        navigate();
      }
    } catch (err) {
      console.error('Could not store logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten all dungeons from all logs with their log filename
  const allDungeons: Array<Dungeon & { logFilename: string }> = [];
  for (const [filename, dungeons] of Object.entries(logsByFilename)) {
    for (const dungeon of dungeons) {
      allDungeons.push({ ...dungeon, logFilename: filename });
    }
  }

  const hasAnyLogs = Object.keys(logsByFilename).length > 0;

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

      {!loading && !hasAnyLogs && (
        <div>
          <Header showUpload={false} />
          <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
            <UploadPage onFileSelect={handleFileSelect} />
          </div>
        </div>
      )}

      {!loading && hasAnyLogs && (
        <LocationProvider>
          <Router>
            <Route path="/" component={() => <DungeonListPage dungeons={allDungeons} onFileSelect={handleFileSelect} />} />
            <Route path="/log/:logFilename/dungeon/:dungeonId/player/:playerId" component={(props) => <PlayerInsightsPage {...props} dungeons={allDungeons} onFileSelect={handleFileSelect} />} />
          </Router>
        </LocationProvider>
      )}
    </div>
  );
}
