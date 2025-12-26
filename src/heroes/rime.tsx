import { InsightCard } from '../components/insight-card';

export function RimeInsights() {
  return (
    <div>
      <InsightCard>
        <InsightCard.Title>Winter Orbs</InsightCard.Title>
        <InsightCard.Description>
          Winter Orbs are meant to be used. You should never have more than 4 orbs for extended periods.
        </InsightCard.Description>
        {/* TODO: Replace with threshold graph showing time spent above 4 orbs */}
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--offwhite-color)',
          borderRadius: '4px',
          border: '2px dashed var(--border)'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Winter Orb threshold tracking coming soon...
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            This will show time spent holding too many orbs
          </p>
        </div>
      </InsightCard>
    </div>
  );
}
