import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { LineGraph } from './line-graph';

export function DamageMitigationGraph() {
  const { player, dungeon, dungeonDuration } = useAnalysis();

  const values = useMemo((): number[] => {
    const numSeconds = Math.ceil(dungeonDuration);
    if (numSeconds === 0) return [];

    const damageBySecond: Array<{ amount: number; amountUnmitigated: number }> = Array.from(
      { length: numSeconds },
      () => ({ amount: 0, amountUnmitigated: 0 })
    );

    for (const event of dungeon.events) {
      if (
        (event.type !== 'ABILITY_DAMAGE' && event.type !== 'ABILITY_PERIODIC_DAMAGE') ||
        event.targetId !== player.playerId
      ) {
        continue;
      }

      const second = Math.floor(event.timestamp);
      if (second >= 0 && second < numSeconds) {
        const data = damageBySecond[second]!;
        data.amount += event.amount;
        data.amountUnmitigated += event.amountUnmitigated;
      }
    }

    return damageBySecond.map(data => {
      return data.amountUnmitigated > 0
        ? ((data.amountUnmitigated - data.amount) / data.amountUnmitigated) * 100
        : 0;
    });
  }, [dungeon.events, player.playerId, dungeonDuration]);

  return (
    <LineGraph
      values={values}
      maxValue={100}
      lineColor="#10b981"
      fillColor="#86efac"
      smoothWindow={10}
    />
  );
}
