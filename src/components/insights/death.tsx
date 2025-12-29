import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';
import { Time } from '../time';
import type { AllyDeathEvent } from '../../types';

export function DeathInsight() {
  const { dungeon, player, setHoveredTime } = useAnalysis();

  const deaths = useMemo(() => {
    return dungeon.events
      .filter((e): e is AllyDeathEvent =>
        e.type === 'ALLY_DEATH' &&
        e.playerId === player.playerId
      )
      .map(e => ({
        timestamp: e.timestamp,
        relativeTime: e.timestamp
      }));
  }, [dungeon.events, player.playerId]);

  // Don't render anything if no deaths
  if (deaths.length === 0) {
    return null;
  }

  return (
    <InsightCard>
      <InsightCard.Title>Deaths</InsightCard.Title>
      <InsightCard.Description>
        You died {deaths.length} {deaths.length === 1 ? 'time' : 'times'} during this dungeon run.
      </InsightCard.Description>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {deaths.map((death, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px',
              background: 'var(--offwhite-color)',
              borderRadius: '4px',
              borderLeft: '4px solid var(--error)',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseEnter={(e) => {
              setHoveredTime(death.relativeTime);
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'var(--error)' }}>
              <Time seconds={death.relativeTime} />
            </div>
          </div>
        ))}
      </div>
    </InsightCard>
  );
}
