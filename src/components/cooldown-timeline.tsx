import { useAnalysis } from '../contexts/analysis-context';
import { getAbility } from '../constants';
import type { CooldownInsight } from '../insights/cooldown-insight';

interface CooldownTimelineProps {
  insight: CooldownInsight;
  dungeonDuration: number;
}

export function CooldownTimeline({ insight, dungeonDuration }: CooldownTimelineProps) {
  const { hoveredTime, setHoveredTime } = useAnalysis();

  const getColor = (type: 'available' | 'cooldown' | 'wasted'): string => {
    switch (type) {
      case 'available': return '#9ca3af';
      case 'cooldown': return '#fbbf24';
      case 'wasted': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const getLabel = (type: 'available' | 'cooldown' | 'wasted'): string => {
    switch (type) {
      case 'available': return 'Available';
      case 'cooldown': return 'Cooldown';
      case 'wasted': return 'Wasted (could have used earlier)';
      default: return type;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scoreColor = insight.score >= 80 ? '#10b981' : insight.score >= 60 ? '#fbbf24' : '#ef4444';
  const ability = getAbility(insight.abilityId);

  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={ability.icon}
            alt={ability.name}
            style={{ width: '24px', height: '24px', borderRadius: '25%', border: '3px solid' }}
          />
          {ability.name}
        </h3>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: scoreColor,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{insight.score}/100</span>
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
            ({insight.actualUses}/{insight.totalPossibleUses} uses)
          </span>
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
        <p style={{ margin: '5px 0' }}>
          Cooldown: {insight.actualCooldown}s
          {insight.actualCooldown !== insight.baseCooldown && (
            <span style={{ color: '#10b981' }}> (reduced from {insight.baseCooldown}s)</span>
          )}
        </p>
        {insight.wastedTime > 0 && (
          <p style={{ margin: '5px 0', color: '#ef4444' }}>
            Wasted time: {formatTime(insight.wastedTime)}
            ({Math.floor(insight.wastedTime / insight.actualCooldown)} missed uses)
          </p>
        )}
      </div>

      <div
        style={{
          position: 'relative',
          height: '40px',
          background: '#f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '15px',
          cursor: 'crosshair'
        }}
        onMouseMove={(e) => {
          const target = e.currentTarget;
          const rect = target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = x / rect.width;
          const time = percent * dungeonDuration;
          setHoveredTime(time);
        }}
      >
        {hoveredTime !== null && (
          <div style={{
            position: 'absolute',
            left: `${(hoveredTime / dungeonDuration) * 100}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#2563eb',
            pointerEvents: 'none',
            zIndex: 10
          }} />
        )}

        {insight.timeline.map((window, idx) => {
          const widthPercent = ((window.end - window.start) / dungeonDuration) * 100;
          const leftPercent = (window.start / dungeonDuration) * 100;

          return (
            <div
              key={idx}
              title={`${getLabel(window.type)}: ${formatTime(window.start)} - ${formatTime(window.end)}`}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: '100%',
                background: getColor(window.type),
                transition: 'opacity 0.2s'
              }}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#666' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', background: '#9ca3af', borderRadius: '2px' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', background: '#fbbf24', borderRadius: '2px' }} />
          <span>Cooldown</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', background: '#ef4444', borderRadius: '2px' }} />
          <span>Wasted</span>
        </div>
      </div>

      {insight.usages.length > 0 && (
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          <p style={{ marginBottom: '8px', fontWeight: '500' }}>Ability Uses:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {insight.usages.map((usage, idx) => {
              const relativeTime = (usage.timestamp - insight.usages[0]!.timestamp) / 1000;
              return (
                <span
                  key={idx}
                  style={{
                    padding: '4px 8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  {idx === 0 ? '0:00' : formatTime(relativeTime)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
