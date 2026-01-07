import type { Dungeon } from '../types';
import { DungeonCard } from '../components/dungeon-card';
import { Header } from '../components/common/header';

interface DungeonListPageProps {
  dungeons: Array<Dungeon & { logFilename: string }>;
  onFileSelect: (files: File[], navigate?: () => void) => Promise<void>;
}

export function DungeonListPage({ dungeons, onFileSelect }: DungeonListPageProps) {
  return (
    <div>
      <Header onFileSelect={onFileSelect} showUpload={true} />

      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          {dungeons.length} {dungeons.length === 1 ? 'dungeon' : 'dungeons'} found
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {dungeons.map((dungeon, dix) => (
          <DungeonCard
            key={dix}
            dungeon={dungeon}
          />
        ))}
      </div>
    </div>
  );
}
