import { useMemo } from 'preact/hooks';
import { AVOIDABLE_ABILITIES } from '../../constants/avoidable-abilities';
import { DamageNumber } from '../damage-number';
import { Time } from '../time';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';

interface DamageWindow {
  startTime: number;
  totalDamage: number;
  count: number;
}

const WINDOW_THRESHOLD = 60; // Seconds

export function AvoidableDamageInsight() {
  const { player, dungeon, setHoveredTime } = useAnalysis();

  const damageByAbility = useMemo(() => {
    const windows: Record<number, DamageWindow[]> = {}; // Second -> Windows sorted by time

    for (const event of dungeon.events) {
      if (
        (event.type !== 'ABILITY_DAMAGE' && event.type !== 'ABILITY_PERIODIC_DAMAGE') ||
        event.targetId !== player.playerId
      ) {
        continue;
      }

      const ability = AVOIDABLE_ABILITIES[event.abilityId];
      if (!ability) {
        continue;
      }

      const eventTimeSeconds = (event.timestamp - dungeon.startTime) / 1000;

      const openWindow = windows[ability.id];
      if (openWindow) {
        const lastWindow = openWindow.at(-1)!;
        if (lastWindow.startTime + WINDOW_THRESHOLD >= eventTimeSeconds) {
          lastWindow.totalDamage += event.amount;
          lastWindow.count++;
        } else {
          openWindow.push({
            startTime: eventTimeSeconds,
            totalDamage: event.amount,
            count: 1
          });
        }
      } else {
        windows[ability.id] = [{
          startTime: eventTimeSeconds,
          totalDamage: event.amount,
          count: 1
        }];
      }
    }

    return windows;
  }, [dungeon.events, dungeon.startTime, player.playerId]);

  const entires = Object.entries(damageByAbility);
  if (entires.length === 0) {
    return null;
  }

  return (
    <InsightCard>
      <InsightCard.Title>Avoidable Damage</InsightCard.Title>
      <InsightCard.Description>
        Every point of damage avoided makes the run smoother.
        Watch for dangerous mechanics and use mobility to avoid unnecessary damage.
      </InsightCard.Description>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {entires.map(([abilityId, windows]) => {
          const ability = AVOIDABLE_ABILITIES[parseInt(abilityId)]!;
          const totalDamage = windows.reduce((sum, w) => sum + w.totalDamage, 0);

          return (
            <div
              key={abilityId}
              style={{
                background: 'var(--card-background)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  {ability.name}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total: <DamageNumber damage={totalDamage} /> damage across{' '}
                  {windows.length} {windows.length === 1 ? 'instance' : 'instances'}
                </div>
                {ability.note && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      marginTop: '8px',
                      fontStyle: 'italic'
                    }}
                  >
                    {ability.note}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {windows.map((window, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#fee',
                      border: '1px solid #fcc',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={() => setHoveredTime(window.startTime)}
                  >
                    <Time seconds={window.startTime} /> •{' '}
                    <DamageNumber damage={window.totalDamage} />
                    {window.count > 1 && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {' '}
                        (×{window.count})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </InsightCard>
  );
}
