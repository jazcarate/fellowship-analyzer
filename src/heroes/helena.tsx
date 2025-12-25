import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../contexts/analysis-context';
import { CooldownTimeline } from '../components/cooldown-timeline';
import { analyzeCooldown } from '../insights/cooldown-insight';
import { analyzeToughness } from '../insights/toughness-insight';
import { analyzeDamageTaken } from '../insights/damage-taken-insight';

export function HelenaInsights() {
  const { dungeon, player, dungeonDuration } = useAnalysis();

  const grandMeleeCooldownInsight = useMemo(() => {
    const grandMeleeBaseCooldown = 120;
    const hasMasterOfWar = player.talents?.includes(222);
    const actualCooldown = hasMasterOfWar ? 96 : 120;
    const cooldownReduction = grandMeleeBaseCooldown - actualCooldown;

    return analyzeCooldown(
      dungeon,
      player,
      1465,
      grandMeleeBaseCooldown,
      [222],
      cooldownReduction
    );
  }, [dungeon, player]);

  const toughnessInsight = useMemo(() => {
    return analyzeToughness(dungeon, player);
  }, [dungeon, player]);

  const damageTakenInsight = useMemo(() => {
    return analyzeDamageTaken(dungeon, player, 1000);
  }, [dungeon, player]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Cooldown Usage</h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Grand Melee is an important cooldown. You should press it often to maximize your damage output and utility.
        </p>
        <CooldownTimeline
          insight={grandMeleeCooldownInsight}
          dungeonDuration={dungeonDuration}
        />
      </div>

      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Toughness Mitigation</h3>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          You should strive to maximise toughness throughout the dungeon to reduce incoming damage and survive dangerous encounters.
        </p>

        <p style={{ color: '#666', fontSize: '14px' }}>
          Average Toughness: {toughnessInsight.averageToughness.toFixed(0)}
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Total Damage Taken: {damageTakenInsight.totalDamage.toLocaleString()}
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Peak Damage (1s window): {damageTakenInsight.peakDamage.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
