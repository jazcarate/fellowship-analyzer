import { InsightCard } from '../components/insight-card';
import { CooldownGraph } from '../components/graphs/cooldown-graph';
import { ResourceGraph } from '../components/graphs/resource-graph';
import { DamageGraph } from '../components/graphs/damage-graph';
import { CombinedGraph } from '../components/graphs/combined-graph';

export function HelenaInsights() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <InsightCard>
        <InsightCard.Title>Cooldown Usage</InsightCard.Title>
        <InsightCard.Description>
          Grand Melee is an important cooldown. You should press it often to maximize your damage output and utility.
        </InsightCard.Description>
        <CooldownGraph abilityId={1465} />
      </InsightCard>

      <InsightCard>
        <InsightCard.Title>Toughness Mitigation</InsightCard.Title>
        <InsightCard.Description>
          Helena's success is in managing your Toughness and having high values when damage intake is high.
          Coordinate your toughness peaks with incoming damage spikes.
        </InsightCard.Description>
        <CombinedGraph>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#666' }}>
              Toughness Over Time
            </div>
            <ResourceGraph resourceId={3} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#666' }}>
              Damage Intake
            </div>
            <DamageGraph windowSize={1000} />
          </div>
        </CombinedGraph>
      </InsightCard>

      <InsightCard>
        <InsightCard.Title>Preventable Damage</InsightCard.Title>
        <InsightCard.Description>
          Even though Helena is a tank, every point of damage you can avoid will make your healer happy.
          Watch for dangerous mechanics and use your mobility to avoid unnecessary damage.
        </InsightCard.Description>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          background: '#f9fafb',
          borderRadius: '6px',
          border: '2px dashed #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Preventable damage tracking coming soon...
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
            This will show damage from avoidable mechanics
          </p>
        </div>
      </InsightCard>
    </div>
  );
}
