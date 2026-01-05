import { useMemo } from 'preact/hooks';
import { DISPELLABLE_ABILITIES } from '../../constants/dispellable-abilities';
import { Time } from '../common/time';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';
import { DungeonGraph } from '../graphs/dungeon-graph';
import { trackEffects } from '../../utils/effect-tracker';
import { DamageNumber } from '../common/damage-number';

interface DebuffInstance {
  startTime: number;
  endTime: number;
  dispelled: boolean;
  targetName: string;
  dispelAvailable: boolean;
  damageDealt: number;
}

interface AbilityDebuffs {
  effectName: string;
  debuffs: DebuffInstance[];
}

export function FailedDispelsInsight() {
  const { dungeon, player, setHoveredTime } = useAnalysis();

  const { debuffsByAbility, dispelTimes, problematicEffectTimes } = useMemo(() => {
    const { completedEffects } = trackEffects(dungeon, player);

    const debuffs: Record<number, AbilityDebuffs> = {};
    const dispelTimes: number[] = [];
    const problematicEffectTimes: { start: number; end: number }[] = [];

    for (const effect of completedEffects) {
      if (!DISPELLABLE_ABILITIES.has(effect.effectId)) continue;
      if (effect.effectType !== 'DEBUFF') continue;
      if (effect.endTime === null) continue;

      const isProblematic = !effect.dispelled || effect.damageDealt > 0;

      if (isProblematic) {
        problematicEffectTimes.push({
          start: effect.startTime,
          end: effect.endTime
        });
      }

      if (!debuffs[effect.effectId]) {
        debuffs[effect.effectId] = {
          effectName: effect.effectName,
          debuffs: []
        };
      }

      debuffs[effect.effectId]!.debuffs.push({
        startTime: effect.startTime,
        endTime: effect.endTime,
        dispelled: effect.dispelled,
        targetName: effect.targetName,
        dispelAvailable: effect.dispelAvailable,
        damageDealt: effect.damageDealt
      });
    }

    for (const event of dungeon.events) {
      if (
        event.type === 'ABILITY_ACTIVATED' &&
        event.sourceId === player.playerId &&
        player.hero.dispel?.abilityId &&
        event.abilityId === player.hero.dispel.abilityId
      ) {
        dispelTimes.push(event.timestamp);
      }
    }

    return { debuffsByAbility: debuffs, dispelTimes, problematicEffectTimes };
  }, [dungeon, player]);

  const entries = Object.entries(debuffsByAbility);

  if (entries.length === 0) {
    return (
      <InsightCard positive>
        <InsightCard.Title>Dispel Opportunities</InsightCard.Title>
        <InsightCard.Description>
          No dangerous debuffs that required dispelling - great job staying clear of debuffs!
        </InsightCard.Description>
      </InsightCard>
    );
  }

  return (
    <InsightCard>
      <InsightCard.Title>Dispel Opportunities</InsightCard.Title>
      <InsightCard.Description>
        Dangerous debuffs that should be dispelled to prevent damage and death. Orange borders show when dispel was available but not used.
      </InsightCard.Description>

      <div style={{ marginTop: '16px' }}>
        <DungeonGraph>
          <DungeonGraph.Highlight
            name="Dispels"
            color="#10b981"
            times={dispelTimes.map(time => ({ start: time }))}
          />
          <DungeonGraph.Highlight
            name="Problematic Effects"
            color="#dc2626"
            times={problematicEffectTimes}
          />
        </DungeonGraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {entries.map(([effectId, { effectName, debuffs }]) => {
          const problematicDebuffs = debuffs.filter(d => !d.dispelled || d.damageDealt > 0);
          const successfulDispels = debuffs.filter(d => d.dispelled && d.damageDealt === 0).length;

          if (problematicDebuffs.length === 0) {
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
                  {problematicDebuffs.length} requiring attention
                  {successfulDispels > 0 && (
                    <span style={{ color: '#10b981', marginLeft: '8px' }}>
                      ({successfulDispels} dispelled successfully)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {problematicDebuffs.map((debuff, idx) => {
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
                      {debuff.damageDealt > 0 && (
                        <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: '600' }}>
                          <DamageNumber damage={debuff.damageDealt} />
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
