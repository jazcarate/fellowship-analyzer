import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { LineGraph } from './line-graph';

interface ResourceGraphProps {
  resourceId: number;
  maxValue?: number;
  /** Percentage thresholds to show as horizontal lines (e.g., [25, 50, 75]) */
  thresholds?: number[];
}

export function ResourceGraph({ resourceId, maxValue, thresholds }: ResourceGraphProps) {
  const { dungeon, player, dungeonDuration } = useAnalysis();

  const values = useMemo((): number[] => {
    const numSeconds = Math.ceil(dungeonDuration);
    if (numSeconds === 0) return [];

    const points: Array<{ sum: number; count: number }> = Array.from(
      { length: numSeconds },
      () => ({ sum: 0, count: 0 })
    );

    for (const event of dungeon.events) {
      if (
        event.type === 'RESOURCE_CHANGED' &&
        event.playerId === player.playerId &&
        event.resourceId === resourceId
      ) {
        const second = Math.floor(event.timestamp);
        if (second >= 0 && second < numSeconds) {
          const point = points[second]!;
          point.sum += (event.amount / event.maxAmount) * 100;
          point.count++;
        }
      }
    }

    // Convert to simple array of values
    return points.map(p => p.count > 0 ? p.sum / p.count : 0);
  }, [dungeon.events, player.playerId, resourceId, dungeonDuration]);

  return (
    <LineGraph
      values={values}
      maxValue={maxValue ?? 100}
      thresholds={thresholds}
      smoothWindow={10}
    />
  );
}
