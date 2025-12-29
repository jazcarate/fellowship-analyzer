import { InsightCard } from '../components/insight-card';
import { CooldownGraph } from '../components/graphs/cooldown-graph';
import { ResourceGraph } from '../components/graphs/resource-graph';
import { DamageGraph } from '../components/graphs/damage-graph';
import { BuffUptimeGraph } from '../components/graphs/buff-uptime-graph';

export function HelenaInsights() {
  return (
    <>
      <InsightCard>
        <InsightCard.Title>Cooldown Usage</InsightCard.Title>
        <InsightCard.Description>
          Grand Melee is an important cooldown. You should press it often to maximize your damage output and utility.
        </InsightCard.Description>
        <CooldownGraph abilityId={1465} />
      </InsightCard>

      <InsightCard>
        <InsightCard.Title>Shields Up Uptime</InsightCard.Title>
        <InsightCard.Description>
          Shields Up is Helena's key defensive buff that increases Block chance.
          Refreshing the buff before it expires wastes the cooldown unless your Toughness is critically low.
        </InsightCard.Description>
        <BuffUptimeGraph buffId={1282} highlightRefresh />
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
    </>
  );
}
