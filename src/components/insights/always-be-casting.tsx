import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';
import { Time } from '../time';

interface CastGap {
  startTime: number;
  endTime: number;
  duration: number;
}

const GAP_THRESHOLD = 2.0; // seconds

export function AlwaysBeCastingInsight() {
  const { dungeon, player, setHoveredTime } = useAnalysis();

  const { gaps, uptime } = useMemo(() => {
    const gaps: CastGap[] = [];
    let lastCastTime: number | null = null;
    let totalGapTime = 0;

    for (const event of dungeon.events) {
      if (
        event.type === 'ABILITY_ACTIVATED' &&
        event.sourceId === player.playerId
      ) {
        const currentTime = event.timestamp;

        // If we have a previous cast, check the gap
        if (lastCastTime !== null) {
          const gap = currentTime - lastCastTime;

          if (gap >= GAP_THRESHOLD) {
            gaps.push({
              startTime: lastCastTime,
              endTime: currentTime,
              duration: gap
            });
            totalGapTime += gap;
          }
        }

        lastCastTime = currentTime;
      }
    }

    const dungeonDuration = dungeon.endTime;
    const uptime = dungeonDuration > 0
      ? ((dungeonDuration - totalGapTime) / dungeonDuration) * 100
      : 0;

    return { gaps, uptime };
  }, [dungeon.events, dungeon.endTime, player.playerId]);

  if (gaps.length === 0) {
    return (
      <InsightCard>
        <InsightCard.Title>Always Be Casting</InsightCard.Title>
        <InsightCard.Description>
          Excellent! No significant gaps in ability usage detected. You maintained consistent action throughout the dungeon.
        </InsightCard.Description>
      </InsightCard>
    );
  }

  const dungeonDuration = dungeon.endTime;

  return (
    <InsightCard>
      <InsightCard.Title>Always Be Casting</InsightCard.Title>
      <InsightCard.Description>
        Maximize damage and effectiveness by minimizing downtime between abilities.
        Gaps longer than {GAP_THRESHOLD} seconds indicate periods where you could have been more active.
        Your uptime: {uptime.toFixed(1)}%
      </InsightCard.Description>

      <div style={{ marginTop: '16px' }}>
        {/* Color legend */}
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          marginBottom: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '16px', background: '#9ca3af', borderRadius: '2px' }} />
            <span>Casting (good uptime)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '16px', background: '#fca5a5', borderRadius: '2px' }} />
            <span>Not casting (downtime)</span>
          </div>
        </div>

        {/* Timeline bar */}
        <div style={{
          position: 'relative',
          height: '40px',
          background: '#9ca3af',
          borderRadius: '4px',
          overflow: 'hidden',
          cursor: 'crosshair'
        }}>
          {gaps.map((gap, idx) => {
            const leftPercent = (gap.startTime / dungeonDuration) * 100;
            const widthPercent = (gap.duration / dungeonDuration) * 100;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  height: '100%',
                  background: '#fca5a5',
                  cursor: 'pointer',
                  borderLeft: '2px solid #dc2626',
                  borderRight: '2px solid #dc2626'
                }}
                onMouseEnter={() => setHoveredTime(gap.startTime)}
                title={`${gap.duration.toFixed(1)}s gap`}
              />
            );
          })}
        </div>

        {/* Time markers */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '4px'
        }}>
          <span><Time seconds={0} /></span>
          <span><Time seconds={dungeonDuration} /></span>
        </div>
      </div>
    </InsightCard>
  );
}
