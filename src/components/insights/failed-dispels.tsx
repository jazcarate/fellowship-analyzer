import { useMemo } from 'preact/hooks';
import { DISPELLABLE_ABILITIES } from '../../constants/dispellable-abilities';
import { Time } from '../time';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';

interface DebuffInstance {
  startTime: number;
  endTime: number;
  dispelled: boolean;
  targetName: string;
  dispelAvailable: boolean;
}

interface AbilityDebuffs {
  effectName: string;
  debuffs: DebuffInstance[];
}

export function FailedDispelsInsight() {
  const { dungeon, player, setHoveredTime } = useAnalysis();

  const debuffsByAbility = useMemo(() => {
    const debuffs: Record<number, AbilityDebuffs> = {};
    // Track active debuffs per player (players can have multiple debuffs but we track each by effect)
    const activeDebuffs: Record<string, { effectId: number; effectName: string; startTime: number; targetName: string }> = {};

    // Track player's dispel usage
    let lastDispelTime: number | null = null;
    const dispelAbilityId = player.hero.dispel?.abilityId;
    const dispelCooldown = player.hero.dispel?.cooldown || 0;

    for (const event of dungeon.events) {
      // Track when player uses their dispel
      if (
        event.type === 'ABILITY_ACTIVATED' &&
        event.sourceId === player.playerId &&
        dispelAbilityId &&
        event.abilityId === dispelAbilityId
      ) {
        lastDispelTime = event.timestamp;
      }

      // Track when dispellable debuffs are applied
      if (event.type === 'EFFECT_APPLIED') {
        if (!DISPELLABLE_ABILITIES.has(event.effectId)) continue;

        // Track by target + effect combination
        const key = `${event.sourceId}-${event.effectId}`;
        activeDebuffs[key] = {
          effectId: event.effectId,
          effectName: event.effectName,
          startTime: event.timestamp,
          targetName: event.sourceName
        };
      }

      // Track when debuffs are removed (either by dispel or naturally)
      if (event.type === 'EFFECT_REMOVED') {
        const key = `${event.sourceId}-${event.effectId}`;
        const debuff = activeDebuffs[key];
        if (!debuff) continue;

        if (!DISPELLABLE_ABILITIES.has(event.effectId)) continue;

        // Check if this was dispelled (look for a dispel event at the same timestamp)
        const wasDispelled = dungeon.events.some(
          e =>
            e.type === 'ABILITY_DISPEL' &&
            e.effectId === event.effectId &&
            e.targetId === event.sourceId &&
            e.timestamp === event.timestamp
        );

        // Check if dispel was available at debuff start
        const dispelAvailable =
          dispelAbilityId !== undefined &&
          (lastDispelTime === null || debuff.startTime - lastDispelTime >= dispelCooldown);

        // Record the debuff
        if (!debuffs[event.effectId]) {
          debuffs[event.effectId] = {
            effectName: debuff.effectName,
            debuffs: []
          };
        }

        const abilityDebuffs = debuffs[event.effectId];
        if (abilityDebuffs) {
          abilityDebuffs.debuffs.push({
            startTime: debuff.startTime,
            endTime: event.timestamp,
            dispelled: wasDispelled,
            targetName: debuff.targetName,
            dispelAvailable
          });
        }

        // Clear the active debuff
        delete activeDebuffs[key];
      }
    }

    return debuffs;
  }, [dungeon.events, player.playerId, player.hero.dispel]);

  const entries = Object.entries(debuffsByAbility);
  if (entries.length === 0) {
    return null;
  }

  const hasDispel = player.hero.dispel !== undefined;

  return (
    <InsightCard>
      <InsightCard.Title>Dispel Opportunities</InsightCard.Title>
      <InsightCard.Description>
        Dangerous debuffs that should be dispelled to prevent damage and death. Orange borders show when your dispel was available but not used.
      </InsightCard.Description>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {entries.map(([effectId, { effectName, debuffs }]) => {
          const failedDispels = debuffs.filter(d => !d.dispelled);
          const successfulDispels = debuffs.filter(d => d.dispelled).length;

          if (failedDispels.length === 0) {
            return null;
          }

          return (
            <div
              key={effectId}
              style={{
                background: 'var(--card-background)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  {effectName}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {failedDispels.length} not dispelled
                  {successfulDispels > 0 && (
                    <span style={{ color: '#10b981', marginLeft: '8px' }}>
                      ({successfulDispels} dispelled successfully)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {failedDispels.map((debuff, idx) => {
                  const duration = debuff.endTime - debuff.startTime;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: debuff.dispelAvailable ? '#ffedd5' : '#fee',
                        border: debuff.dispelAvailable ? '2px solid #f97316' : '1px solid #fcc',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={() => setHoveredTime(debuff.startTime)}
                    >
                      <Time seconds={debuff.startTime} /> • {debuff.targetName}
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
        })}
      </div>
    </InsightCard>
  );
}
