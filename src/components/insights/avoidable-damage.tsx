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
  abilityName: string;
  sourceName: string;
}

const WINDOW_THRESHOLD = 60; // Seconds

export function AvoidableDamageInsight() {
  const { player, dungeon, setHoveredTime } = useAnalysis();

  const { windows, abilities } = useMemo(() => {
    const windows: Record<number, DamageWindow[]> = {};
    const abilities: Record<string, { name: string, note: string | undefined }> = {};

    for (const event of dungeon.events) {
      if (
        (event.type !== 'ABILITY_DAMAGE' && event.type !== 'ABILITY_PERIODIC_DAMAGE') ||
        event.targetId !== player.playerId
      ) {
        continue;
      }

      const metadata = AVOIDABLE_ABILITIES[event.abilityId];
      if (!metadata) {
        continue;
      }

      if (metadata.nonTankOnly && player.hero.tank) {
        continue;
      }

      const openWindow = windows[event.abilityId];
      abilities[String(event.abilityId)] = { name: event.abilityName, note: metadata.note };
      if (openWindow) {
        const lastWindow = openWindow.at(-1)!;
        if (lastWindow.startTime + WINDOW_THRESHOLD >= event.timestamp
          && lastWindow.sourceName === event.sourceName) {
          lastWindow.totalDamage += event.amountUnmitigated;
          lastWindow.count++;
        } else {
          openWindow.push({
            startTime: event.timestamp,
            totalDamage: event.amountUnmitigated,
            count: 1,
            abilityName: event.abilityName,
            sourceName: event.sourceName,
          });
        }
      } else {
        windows[event.abilityId] = [{
          startTime: event.timestamp,
          totalDamage: event.amountUnmitigated,
          count: 1,
          abilityName: event.abilityName,
          sourceName: event.sourceName,
        }];
      }
    }

    return { windows, abilities };
  }, [dungeon.events, player, player]);

  const entries = Object.entries(windows);
  if (entries.length === 0) {
    return null;
  }

  return (
    <InsightCard>
      <InsightCard.Title>Avoidable Damage</InsightCard.Title>
      <InsightCard.Description>
        Damage from dangerous mechanics that should be avoided. Use crowd control and mobility to avoid it.
      </InsightCard.Description>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {entries.map(([abilityId, windows]) => {
          const totalDamage = windows.reduce((sum, w) => sum + w.totalDamage, 0);

          return (
            <div key={abilityId}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: '600' }}>
                  {abilities[abilityId]!.name}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <DamageNumber damage={totalDamage} /> total
                </div>
              </div>

              {abilities[abilityId]!.note && (
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  {abilities[abilityId]!.note}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {windows.map((window, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--surface)',
                      border: '2px solid var(--border)',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={() => setHoveredTime(window.startTime)}
                  >
                    {window.sourceName} @
                    <Time seconds={window.startTime} /> - <DamageNumber damage={window.totalDamage} />
                    {' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      ({window.count} {window.count === 1 ? 'hit' : 'hits'})
                    </span>
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
