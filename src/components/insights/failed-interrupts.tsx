import { useMemo } from 'preact/hooks';
import { INTERRUPTIBLE_ABILITIES } from '../../constants/interruptible-abilities';
import { DamageNumber } from '../damage-number';
import { Time } from '../time';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';

interface CastInstance {
  startTime: number;
  endTime: number;
  interrupted: boolean;
  damage: number;
  sourceName: string;
  interruptAvailable: boolean;
}

interface AbilityCasts {
  casts: CastInstance[];
}

export function FailedInterruptsInsight() {
  const { dungeon, player, setHoveredTime } = useAnalysis();

  const castsByAbility = useMemo(() => {
    const casts: Record<number, AbilityCasts> = {};
    const activeCasts: Record<string, { abilityId: number; startTime: number; damage: number }> = {};

    let lastInterruptTime: number | null = null;
    const interruptAbilityId = player.hero.interrupt!.abilityId;
    const interruptCooldown = player.hero.interrupt!.cooldown;

    for (const event of dungeon.events) {
      if (
        event.type === 'ABILITY_ACTIVATED' &&
        event.sourceId === player.playerId &&
        event.abilityId === interruptAbilityId
      ) {
        lastInterruptTime = event.timestamp;
      }

      if (event.type === 'ABILITY_ACTIVATED') {
        const ability = INTERRUPTIBLE_ABILITIES[event.abilityId];
        if (!ability) continue;

        // Start tracking this cast
        activeCasts[event.sourceId] = {
          abilityId: event.abilityId,
          startTime: event.timestamp,
          damage: 0
        };
      } else if (event.type === 'ABILITY_DAMAGE') {
        const activeCast = activeCasts[event.sourceId];
        if (activeCast && event.abilityId === activeCast.abilityId) {
          // Accumulate damage during the cast
          activeCast.damage += event.amountUnmitigated;
        }
      } else if (event.type === 'ABILITY_INTERRUPT' || event.type === 'ABILITY_CAST_SUCCESS') {
        const cast = activeCasts[event.sourceId];
        if (!cast) continue;

        // Check if interrupt was available at cast start
        const interruptAvailable =
          interruptAbilityId !== undefined &&
          (lastInterruptTime === null || cast.startTime - lastInterruptTime >= interruptCooldown);

        // Record the completed cast
        if (!casts[cast.abilityId]) {
          casts[cast.abilityId] = { casts: [] };
        }

        const abilityCasts = casts[cast.abilityId];
        if (abilityCasts) {
          abilityCasts.casts.push({
            startTime: cast.startTime,
            endTime: event.timestamp,
            interrupted: event.type === 'ABILITY_INTERRUPT',
            damage: cast.damage,
            sourceName: event.sourceName,
            interruptAvailable
          });
        }

        // Clear the active cast
        delete activeCasts[event.sourceId];
      }
    }

    return casts;
  }, [dungeon.events, player.playerId, player.hero.interrupt]);

  const entries = Object.entries(castsByAbility);
  if (entries.length === 0) {
    return null;
  }

  return (
    <InsightCard>
      <InsightCard.Title>Interruptible Casts</InsightCard.Title>
      <InsightCard.Description>
        Interrupting enemy casts prevents significant damage and dangerous effects.
        Interrupts save the team from taking unnecessary damage.
        <span style={{ display: 'block', marginTop: '4px', color: '#f97316' }}>
          ⚠ Orange highlight indicates the interrupt skill was available.
        </span>
        <span style={{ display: 'block', marginTop: '4px', color: '#4ade80' }}>
          ✓ Green background indicates the cast was interrupted (but still dealt damage).
        </span>
      </InsightCard.Description>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {entries.map(([abilityId, { casts }]) => {
          const ability = INTERRUPTIBLE_ABILITIES[parseInt(abilityId)]!;
          const damagingCasts = casts.filter(c => c.damage > 0);
          const failedCasts = damagingCasts.filter(c => !c.interrupted);
          const interruptedWithDamage = damagingCasts.filter(c => c.interrupted);
          const totalDamage = damagingCasts.reduce((sum, c) => sum + c.damage, 0);
          const cleanInterrupts = casts.filter(c => c.interrupted && c.damage === 0).length;

          if (damagingCasts.length === 0) {
            return null;
          }

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
                  {damagingCasts.length} {damagingCasts.length === 1 ? 'cast' : 'casts'}
                  {failedCasts.length > 0 && (
                    <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                      ({failedCasts.length} failed)
                    </span>
                  )}
                  {interruptedWithDamage.length > 0 && (
                    <span style={{ color: '#4ade80', marginLeft: '8px' }}>
                      ({interruptedWithDamage.length} interrupted ⚡)
                    </span>
                  )}
                  {cleanInterrupts > 0 && (
                    <span style={{ color: '#10b981', marginLeft: '8px' }}>
                      ({cleanInterrupts} clean ✓)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {damagingCasts.map((cast, idx) => {
                  const duration = cast.endTime - cast.startTime;

                  // Determine styling based on interrupt status
                  let background: string;
                  let border: string;

                  if (cast.interrupted) {
                    // Interrupted but dealt damage - green
                    background = '#dcfce7';
                    border = '2px solid #4ade80';
                  } else if (cast.interruptAvailable) {
                    // Failed with interrupt available - orange
                    background = '#ffedd5';
                    border = '2px solid #f97316';
                  } else {
                    // Failed but interrupt not available - red
                    background = '#fee';
                    border = '1px solid #fcc';
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        background,
                        border,
                        padding: '6px 10px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={() => setHoveredTime(cast.startTime)}
                    >
                      <Time seconds={cast.startTime} /> •{' '}
                      <DamageNumber damage={cast.damage} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {' '}
                        ({duration.toFixed(1)}s)
                      </span>
                      {cast.interrupted && (
                        <span style={{ marginLeft: '4px', color: '#4ade80', fontWeight: '600' }}>
                          ⚡
                        </span>
                      )}
                      {!cast.interrupted && cast.interruptAvailable && (
                        <span style={{ marginLeft: '4px', color: '#f97316', fontWeight: '600' }}>
                          ⚠
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </InsightCard>
  );
}
