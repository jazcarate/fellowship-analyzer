import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { getAbility } from '../../constants/heroes';
import { Time } from '../time';
import { Information } from '../information';

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
        relativeTime: (e.timestamp - dungeon.startTime) / 1000
      }));
  }, [dungeon, player, abilityId]);

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

      {/* Timeline */}
      <div style={{ marginBottom: '15px' }}>
        <div
          style={{
            position: 'relative',
            height: '60px',
            background: 'var(--offwhite-color)',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const timePercent = x / rect.width;
            setHoveredTime(timePercent * dungeonDuration);
          }}
        >
          {/* Cooldown windows */}
          {usages.map((usage, idx) => {
            const startPercent = (usage.relativeTime / dungeonDuration) * 100;
            const windowEnd = Math.min(usage.relativeTime + cooldown, dungeonDuration);
            const widthPercent = ((windowEnd - usage.relativeTime) / dungeonDuration) * 100;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  height: '100%',
                  background: '#fbbf24',
                  opacity: 0.4
                }}
              />
            );
          })}

          {/* Wasted cooldown windows */}
          {wastedOpportunities.map((wastedTime, idx) => {
            const startPercent = (wastedTime / dungeonDuration) * 100;
            const windowEnd = Math.min(wastedTime + cooldown, dungeonDuration);
            const widthPercent = ((windowEnd - wastedTime) / dungeonDuration) * 100;

            return (
              <div
                key={`wasted-${idx}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  height: '100%',
                  background: '#ef4444',
                  opacity: 0.4
                }}
              />
            );
          })}

          {/* Usage markers */}
          {usages.map((usage, idx) => {
            const leftPercent = (usage.relativeTime / dungeonDuration) * 100;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  background: 'var(--highlight-color)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
                title={`${Math.floor(usage.relativeTime)}s`}
              />
            );
          })}

          {/* Hover indicator */}
          {hoveredTime !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${(hoveredTime / dungeonDuration) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--secondary-color)',
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
          )}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'var(--highlight-color)',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Used</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#fbbf24',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>On Cooldown</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'var(--error)',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Wasted</span>
            <Information title='This ability could have been used at any point during these windows, and it would still have been available for the next time it was actually used.' />
          </div>
        </div>
      </div>

      {usages.length > 0 && (
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            Uses:
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            {usages.map((usage, idx) => (
              <span
                key={idx}
                style={{
                  padding: '4px 8px',
                  background: '#ffe8cc',
                  color: 'var(--highlight-color)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'transform 0.1s'
                }}
                onMouseEnter={(e) => {
                  setHoveredTime(usage.relativeTime);
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                <Time seconds={usage.relativeTime} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
