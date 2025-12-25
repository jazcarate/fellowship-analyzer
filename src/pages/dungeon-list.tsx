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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Dungeons</h2>
        <button onClick={onReset} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Upload New Log
        </button>
      </div>
      <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
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
