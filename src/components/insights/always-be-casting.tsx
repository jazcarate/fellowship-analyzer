import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';
import { DungeonGraph } from '../graphs/dungeon-graph';

interface CastGap {
  startTime: number;
  endTime: number;
  duration: number;
}

const GAP_THRESHOLD = 2.0; // seconds

export function AlwaysBeCastingInsight() {
  const { dungeon, player } = useAnalysis();

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
          Excellent! No significant gaps in ability usage detected. Consistent action was maintained throughout the dungeon.
        </InsightCard.Description>
      </InsightCard>
    );
  }

  return (
    <InsightCard>
      <InsightCard.Title>Always Be Casting</InsightCard.Title>
      <InsightCard.Description>
        Maximize damage and effectiveness by minimizing downtime between abilities.
        Gaps longer than {GAP_THRESHOLD} seconds indicate periods where more activity was possible.
      </InsightCard.Description>

      <p>Downtime: {(100 - uptime).toFixed(1)}%</p>

      <div style={{ marginTop: '16px' }}>
        <DungeonGraph>
          <DungeonGraph.Highlight
            name="Downtime"
            color="#ef4444"
            times={gaps.map(gap => ({ start: gap.startTime, end: gap.endTime }))}
            information={`Periods of ${GAP_THRESHOLD}+ seconds without casting abilities`}
          />
        </DungeonGraph>
      </div>
    </InsightCard>
  );
}
