import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { getAbility } from '../../constants/heroes';
import { Time } from '../time';
import { Information } from '../information';
import { DungeonGraph } from './dungeon-graph';

interface CooldownGraphProps {
  abilityId: number;
}

export function CooldownGraph({ abilityId }: CooldownGraphProps) {
  const { dungeon, player, dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

  const ability = getAbility(abilityId);
  const ultimatumReduction = dungeon.modifierIds.includes(16) ? 0.9 : 1.0;
  const cooldown = ability.getCooldown({ player }) * ultimatumReduction;

  const usages = useMemo(() => {
    return dungeon.events
      .filter(e =>
        e.type === 'ABILITY_ACTIVATED' &&
        e.sourceId === player.playerId &&
        e.abilityId === abilityId
      )
      .map(e => ({
        timestamp: e.timestamp,
        relativeTime: e.timestamp
      }));
  }, [dungeon.events, player.playerId, abilityId]);

  const wastedOpportunities = useMemo(() => {
    const wasted: number[] = [];
    let nextAvailable = 0;

    for (let i = 0; i < usages.length; i++) {
      const usage = usages[i]!;

      while (nextAvailable + cooldown <= usage.relativeTime) {
        wasted.push(nextAvailable);
        nextAvailable += cooldown;
      }

      nextAvailable = usage.relativeTime + cooldown;
    }

    while (nextAvailable + cooldown <= dungeonDuration) {
      wasted.push(nextAvailable);
      nextAvailable += cooldown;
    }

    return wasted;
  }, [usages, cooldown, dungeonDuration]);

  const maxPossibleUses = Math.floor(dungeonDuration / cooldown) + 1;

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '15px'
      }}>
        {ability.icon && (
          <img
            src={ability.icon}
            alt={ability.name}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              border: '2px solid var(--border)'
            }}
          />
        )}
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            {ability.name}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '2px'
          }}>
            {usages.length} / {maxPossibleUses}
            <Information title='Based on the dungeon duration, if this ability was used off cooldown, it could have been used this number of times.' />
            uses • <Time seconds={cooldown} /> cooldown
          </div>
        </div>
      </div>

      <DungeonGraph highlights={[
        { name: "Used", showPill: true, color: 'purple', times: usages.map(u => ({ start: u.relativeTime })) },
        { name: "On Cooldown", color: '#fbbf24', times: usages.map(u => ({ start: u.relativeTime, end: u.relativeTime + cooldown })) },
        {
          name: "Wasted", color: '#ef4444', times: wastedOpportunities.map(w => ({ start: w, end: w + cooldown })),
          information: 'This ability could have been used at any point during these windows, and it would still have been available for the next time it was actually used.'
        },

      ]} />
    </div>
  );
}
