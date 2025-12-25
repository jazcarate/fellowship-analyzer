import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import type { Dungeon } from '../types';
import { AnalysisContext } from '../contexts/analysis-context';
import { HelenaInsights } from '../heroes/helena';
import { Minimap } from '../components/minimap';
import { DungeonLevelBadge } from '../components/badges';

interface PlayerAnalysisPageProps {
  path?: string;
  dungeonId?: string;
  playerId?: string;
  dungeons: Dungeon[];
}

export function PlayerAnalysisPage({ dungeonId, playerId, dungeons }: PlayerAnalysisPageProps) {
  const dungeon = dungeons.find(d => d.id === dungeonId);
  const player = dungeon?.players.find(p => p.playerId === playerId);

  if (!dungeon || !player) {
    return (
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p>Dungeon or player not found</p>
        <button onClick={() => route('/')}>← Back to Dungeon List</button>
      </div>
    );
  }

  const heroColor = player.hero.color;
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const dungeonDuration = dungeon.endTime
    ? (dungeon.endTime - dungeon.startTime) / 1000
    : 0;

  const contextValue = {
    dungeon,
    player,
    dungeonDuration,
    hoveredTime,
    setHoveredTime
  };

  const HeroComponent = (() => {
    switch (player.hero?.name) {
      case 'Helena':
        return HelenaInsights;
      default:
        return null;
    }
  })();

  return (
    <AnalysisContext.Provider value={contextValue}>
      <div>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => route('/')}
                style={{ background: '#6b7280', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                ← Back to Dungeon List
              </button>
            </div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
              {dungeon.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <DungeonLevelBadge level={dungeon.difficulty} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {player.hero.icon && (
                <img
                  src={player.hero.icon}
                  alt={player.hero.name}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: `3px solid ${heroColor}`
                  }}
                />
              )}
              <div>
                <h2 style={{ margin: 0, color: heroColor, fontSize: '24px' }}>
                  {player.hero.name} - {player.playerName}
                </h2>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                  Item Level: {player.itemLevel.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!HeroComponent ? (
          <div style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
              No insights available for {player.hero.name}.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
            <div>
              <HeroComponent />
            </div>
            <div>
              <Minimap />
            </div>
          </div>
        )}
      </div>
    </AnalysisContext.Provider>
  );
}
