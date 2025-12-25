import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { getAbility } from '../../constants';
import { Time } from '../time';

interface CooldownGraphProps {
  abilityId: number;
}

export function CooldownGraph({ abilityId }: CooldownGraphProps) {
  const { dungeon, player, dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

  const ability = getAbility(abilityId);
  const cooldown = ability.getCooldown({ player });

  const usages = useMemo(() => {
    return dungeon.events
      .filter(e =>
        e.type === 'ABILITY_ACTIVATED' &&
        e.playerId === player.playerId &&
        e.abilityId === abilityId
      )
      .map(e => ({
        timestamp: e.timestamp,
        relativeTime: (e.timestamp - dungeon.startTime) / 1000
      }));
  }, [dungeon, player, abilityId]);

  const possibleUses = Math.floor(dungeonDuration / cooldown);
  const actualUses = usages.length;
  const wastedTime = (possibleUses - actualUses) * cooldown;
  const efficiency = possibleUses > 0 ? Math.round((actualUses / possibleUses) * 100) : 0;

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Efficiency</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: efficiency >= 80 ? '#10b981' : efficiency >= 60 ? '#f59e0b' : '#ef4444'
          }}>
            {efficiency}%
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Uses</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            {actualUses}/{possibleUses}
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Wasted Time</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
            {Math.floor(wastedTime)}s
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <div
          style={{
            position: 'relative',
            height: '60px',
            background: '#f3f4f6',
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
          onMouseLeave={() => setHoveredTime(null)}
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
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  height: '100%',
                  background: '#fbbf24',
                  opacity: 0.3
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
                  width: '3px',
                  height: '100%',
                  background: '#2563eb',
                  pointerEvents: 'none'
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
                width: '2px',
                height: '100%',
                background: '#ef4444',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginTop: '10px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '2px' }} />
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', background: '#fbbf24', borderRadius: '2px' }} />
            <span>Cooldown</span>
          </div>
        </div>
      </div>

      {/* Usage list */}
      {usages.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
            Ability Uses:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {usages.map((usage, idx) => (
              <span
                key={idx}
                style={{
                  padding: '4px 8px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredTime(usage.relativeTime)}
                onMouseLeave={() => setHoveredTime(null)}
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
