import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';


export function DungeonPercentageInsight() {
  const { dungeon } = useAnalysis();

  if (dungeon.modifierIds.includes(19)) return null; // Shadow Lord's Trial

  const percentage = useMemo((): number => {
    let max = 0;
    for (const event of dungeon.events) {
      if (event.type === 'UNIT_DEATH') {
        max = Math.max(max, event.percentage);
      }
    }
    return max;
  }, [dungeon.events]);

  if (percentage <= 1.0) return null;


  return (
    <InsightCard>
      <InsightCard.Title>Dungeon percentage completion</InsightCard.Title>
      <InsightCard.Description>
        The more enemies you have to defeat, the longer the dungeon time. Consider your route to reduce the over-percentage completion.
      </InsightCard.Description>

      <p>The dungeon percentage was over by <span style={{ color: '#dc2626' }}>{(percentage - 1).toFixed(3)}</span>%</p>
    </InsightCard>
  );
}
