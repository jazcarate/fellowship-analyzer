import { InsightCard } from '../components/insight-card';
import { useAnalysis } from '../contexts/analysis-context';

export function PlaceholderInsights() {

  const { player } = useAnalysis();

  return (
    <InsightCard>
      <InsightCard.Title>Coming Soon…</InsightCard.Title>
      <InsightCard.Description>
        No insights available for {player.hero.name}.
      </InsightCard.Description>
    </InsightCard>
  );
}
