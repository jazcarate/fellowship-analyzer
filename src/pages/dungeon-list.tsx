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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '32px' }}>Fellowship Log Analyzer</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            {dungeons.length} {dungeons.length === 1 ? 'dungeon' : 'dungeons'} found
          </p>
        </div>
        <button onClick={onReset} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Upload New Log
        </button>
      </div>
      <div style={{ display: 'grid', gap: '20px' }}>
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
