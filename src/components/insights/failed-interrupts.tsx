import { useMemo } from 'preact/hooks';
import { INTERRUPTIBLE_ABILITIES } from '../../constants/interruptible-abilities';
import { DamageNumber } from '../common/damage-number';
import { Time } from '../common/time';
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
  abilityName: string;
  casts: CastInstance[];
}

export function FailedInterruptsInsight() {
  const { dungeon, player, setHoveredTime } = useAnalysis();

  const castsByAbility = useMemo(() => {
    const casts: Record<number, AbilityCasts> = {};
    const activeCasts: Record<string, { abilityId: number; abilityName: string; startTime: number; damage: number }> = {};

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
      } else if ((event.type === 'ABILITY_CHANNEL_START' || event.type === 'ABILITY_CAST_START')
        && INTERRUPTIBLE_ABILITIES.has(event.abilityId)) {
        activeCasts[event.sourceId] = {
          abilityId: event.abilityId,
          abilityName: event.abilityName,
          startTime: event.timestamp,
          damage: 0
        };

        if (!casts[event.abilityId]) {
          casts[event.abilityId] = {
            abilityName: event.abilityName,
            casts: []
          };
        }
      } else if ((event.type === 'ABILITY_DAMAGE' || event.type === 'ABILITY_PERIODIC_DAMAGE')
        && INTERRUPTIBLE_ABILITIES.has(event.abilityId)) {
        const cast = casts[event.abilityId];
        if (!cast || cast.casts.length == 0) continue;
        cast.casts.at(-1)!.damage += event.amountUnmitigated;
      } else if ((event.type === 'ABILITY_CAST_SUCCESS' || event.type === 'ABILITY_CHANNEL_SUCCESS')
        && INTERRUPTIBLE_ABILITIES.has(event.abilityId)) {
        const cast = activeCasts[event.sourceId];
        if (!cast) continue;

        if (cast.abilityId !== event.abilityId) {
          console.warn("Successful cast of another ability?");
        }

        const interruptAvailable =
          (lastInterruptTime === null || cast.startTime - lastInterruptTime >= interruptCooldown);
        casts[cast.abilityId]!.casts.push({
          startTime: cast.startTime,
          endTime: event.timestamp,
          interrupted: false,
          damage: cast.damage,
          sourceName: event.sourceName,
          interruptAvailable,
        });

        delete activeCasts[event.sourceId];
      } else if ((event.type === 'ABILITY_CAST_FAIL' || event.type === 'ABILITY_CHANNEL_FAIL')
        && INTERRUPTIBLE_ABILITIES.has(event.abilityId)) {
        const cast = activeCasts[event.sourceId];
        if (!cast) continue;

        if (cast.abilityId !== event.abilityId) {
          console.warn("Fail cast of another ability?");
        }
        const interruptAvailable =
          (lastInterruptTime === null || cast.startTime - lastInterruptTime >= interruptCooldown);

        casts[cast.abilityId]!.casts.push({
          startTime: cast.startTime,
          endTime: event.timestamp,
          interrupted: true,
          damage: cast.damage,
          sourceName: event.sourceName,
          interruptAvailable
        });

        delete activeCasts[event.sourceId];
      }
    }

    return casts;
  }, [dungeon.events, player.playerId, player.hero.interrupt]);

  const entries = Object.entries(castsByAbility);

  const relevant = entries.map(([abilityId, { abilityName, casts }]) => {
    // Show casts that either completed OR dealt damage (even if interrupted)
    const relevantCasts = casts.filter(c => !c.interrupted || c.damage > 0);
    if (relevantCasts.length === 0) return null;

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
            {abilityName}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {relevantCasts.map((cast, idx) => {
            const duration = cast.endTime - cast.startTime;

            // Determine styling based on interrupt status
            let background: string;
            let border: string;

            if (cast.interrupted) {
              background = '#dcfce7';
              border = '2px solid #4ade80';
            } else if (cast.interruptAvailable) {
              background = '#ffedd5';
              border = '2px solid #f97316';
            } else {
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
              </div>
            );
          })}
        </div>
      </div>
    );
  }).filter(r => r !== null);

  if (relevant.length === 0) {
    return null;
  }

  return (
    <InsightCard>
      <InsightCard.Title>Interrupt Opportunities</InsightCard.Title>
      <InsightCard.Description>
        Enemy casts that should be interrupted to prevent damage. Orange borders show when your interrupt was available but not used. Green borders show casts that were interrupted but still dealt some damage before completion.
      </InsightCard.Description>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {relevant}
      </div>
    </InsightCard>
  );
}
