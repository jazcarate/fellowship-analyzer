import type { Dungeon } from '../types';
import { DungeonCard } from '../components/dungeon-card';

interface DungeonListPageProps {
  path?: string;
  dungeons: Dungeon[];
  onReset: () => void;
}

export function DungeonListPage({ dungeons, onReset }: DungeonListPageProps) {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
            Fellowship Log Analyzer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {dungeons.length} {dungeons.length === 1 ? 'dungeon' : 'dungeons'} found
          </p>
        </div>
        <button onClick={onReset}>
          Upload New Log
        </button>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {dungeons.map(dungeon => (
          <DungeonCard
            key={dungeon.id}
            dungeon={dungeon}
          />
        ))}
      </div>
    </div>
  );
}
