import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import type { Dungeon } from '../types';
import { AnalysisContext } from '../contexts/analysis-context';
import { HelenaInsights } from '../heroes/helena';
import { Minimap } from '../components/minimap';
import { DungeonLevelBadge } from '../components/badges';
import { RimeInsights } from '../heroes/rime';
import { DeathInsight } from '../components/insights/death';
import { AvoidableDamageInsight } from '../components/insights/avoidable-damage';
import { PlaceholderInsights } from '../heroes/placeholder';
import { InsightCard } from '../components/insight-card';

interface PlayerAnalysisPageProps {
  dungeonId?: string;
  playerId?: string;
  dungeons: Dungeon[];
}

export function PlayerAnalysisPage({ dungeonId, playerId, dungeons }: PlayerAnalysisPageProps) {
  const { route } = useLocation();
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
      case 'Rime':
        return RimeInsights;
      default:
        return PlaceholderInsights;
    }
  })();

  return (
    <AnalysisContext.Provider value={contextValue}>
      <div>
        <div style={{
          background: 'var(--surface)',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <button class="back-button" onClick={() => route('/')}>
                ← Back to Dungeon List
              </button>
            </div>
            <h1 style={{ fontSize: '28px', margin: 0 }}>{dungeon.name}</h1>
            <div>
              <DungeonLevelBadge level={dungeon.difficulty} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {player.hero.icon && (
                <img
                  src={player.hero.icon}
                  alt={player.hero.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: `3px solid ${heroColor}`
                  }}
                />
              )}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: heroColor }}>
                  {player.hero.name} - {player.playerName}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Item Level: {player.itemLevel.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '20px'
        }}>
          <div>

            {!player.isSelf && (<InsightCard>
              <InsightCard.Title>Don't be toxic</InsightCard.Title>
              <InsightCard.Description>
                Don't use this tool to shame anyone.
              </InsightCard.Description>
            </InsightCard>)}

            <HeroComponent />

            <DeathInsight />

            <AvoidableDamageInsight />
          </div>
          <div style={{
            position: 'sticky',
            top: '20px',
            alignSelf: 'start'
          }}>
            <Minimap />
          </div>
        </div>
      </div>
    </AnalysisContext.Provider>
  );
}
