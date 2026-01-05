import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import type { Dungeon } from '../types';
import { AnalysisContext } from '../contexts/analysis-context';
import { HelenaInsights } from '../heroes/helena';
import { Minimap } from '../components/common/minimap';
import { DungeonLevelBadge } from '../components/common/badges';
import { RimeInsights } from '../heroes/rime';
import { DeathInsight } from '../components/insights/death';
import { AvoidableDamageInsight } from '../components/insights/avoidable-damage';
import { FailedInterruptsInsight } from '../components/insights/failed-interrupts';
import { FailedDispelsInsight } from '../components/insights/failed-dispels';
import { AlwaysBeCastingInsight } from '../components/insights/always-be-casting';
import { PlaceholderInsights } from '../heroes/placeholder';
import { InsightCard } from '../components/insight-card';
import { Header } from '../components/common/header';
import { DungeonPercentageInsight } from '../components/insights/dungeon-percentage';

interface PlayerInsightsPageProps {
  dungeonId?: string;
  playerId?: string;
  dungeons: Dungeon[];
  onFileSelect: (text: string) => void;
}

export function PlayerInsightsPage({ dungeonId, playerId, dungeons, onFileSelect }: PlayerInsightsPageProps) {
  const { route } = useLocation();
  const dungeon = dungeons.find(d => d.id === dungeonId);
  const player = dungeon?.players.find(p => p.playerId === playerId);

  if (!dungeon || !player) {
    return (
      <div>
        <Header onFileSelect={onFileSelect} showUpload={true} />
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <p>Dungeon or player not found</p>
          <button onClick={() => route('/')}>← Back to Dungeon List</button>
        </div>
      </div>
    );
  }

  const heroColor = player.hero.color;
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const dungeonDuration = dungeon.endTime;

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
        <Header onFileSelect={onFileSelect} showUpload={true} />

        <div style={{
          background: 'var(--surface)',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: heroColor }}>
                  {player.hero.name} - {player.playerName}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Item Level: {player.itemLevel.toFixed(1)}
                </p>
              </div>
            </div>
            <h1 style={{ fontSize: '28px', margin: 0 }}>
              {dungeon.name}
              {' '}•{' '}
              <DungeonLevelBadge level={dungeon.difficulty} />
            </h1>
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

            {player.hero.tank && <DungeonPercentageInsight />}

            <AvoidableDamageInsight />

            <AlwaysBeCastingInsight />

            {player.hero.interrupt && <FailedInterruptsInsight />}

            {player.hero.dispel && <FailedDispelsInsight />}
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
