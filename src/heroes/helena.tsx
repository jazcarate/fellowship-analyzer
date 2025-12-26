import { InsightCard } from '../components/insight-card';
import { CooldownGraph } from '../components/graphs/cooldown-graph';
import { ResourceGraph } from '../components/graphs/resource-graph';
import { DamageGraph } from '../components/graphs/damage-graph';
import { DeathCard } from '../components/graphs/death-card';

export function HelenaInsights() {
  return (
    <div>
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
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'var(--text-primary)'
          }}>
            Toughness Over Time
          </div>
          <ResourceGraph resourceId={3} thresholds={[25, 50, 75]} />
        </div>
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'var(--text-primary)'
          }}>
            Damage Intake
          </div>
          <DamageGraph windowSize={1000} />
        </div>
      </InsightCard>

      <DeathCard />

      <InsightCard>
        <InsightCard.Title>Preventable Damage</InsightCard.Title>
        <InsightCard.Description>
          Even though Helena is a tank, every point of damage you can avoid will make your healer happy.
          Watch for dangerous mechanics and use your mobility to avoid unnecessary damage.
        </InsightCard.Description>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--offwhite-color)',
          borderRadius: '4px',
          border: '2px dashed var(--border)'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Preventable damage tracking coming soon...
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            This will show damage from avoidable mechanics
          </p>
        </div>
      </InsightCard>
    </div>
  );
}
