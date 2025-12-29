import { useAnalysis } from '../contexts/analysis-context';

export function PlaceholderInsights() {

  const { player } = useAnalysis();

  return (
    <div style={{
      background: 'var(--surface)',
      padding: '40px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      textAlign: 'center'
    }}>
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
        No insights available for {player.hero.name}.
      </p>
    </div>
  );
}
