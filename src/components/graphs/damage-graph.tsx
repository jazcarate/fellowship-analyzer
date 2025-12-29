import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import type { DamageEvent } from '../../types';

interface DamageGraphProps {
  /** Window size in milliseconds for damage aggregation */
  windowSize?: number;
}

export function DamageGraph({ windowSize = 1000 }: DamageGraphProps) {
  const { dungeon, player, dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

  const damageWindows = useMemo(() => {
    const damageEvents = dungeon.events
      .filter((e): e is DamageEvent =>
        (e.type === 'SWING_DAMAGE' ||
          e.type === 'ABILITY_DAMAGE' ||
          e.type === 'ABILITY_PERIODIC_DAMAGE') &&
        e.targetId === player.playerId
      )
      .map(e => ({
        timestamp: e.timestamp,
        amount: e.amount
      }));

    if (damageEvents.length === 0) return [];

    // Create time windows
    const windows: Array<{ time: number; damage: number }> = [];
    const windowSizeSeconds = windowSize / 1000;

    for (let t = 0; t < dungeonDuration; t += windowSizeSeconds) {
      const windowEvents = damageEvents.filter(
        e => e.timestamp >= t && e.timestamp < t + windowSizeSeconds
      );
      const totalDamage = windowEvents.reduce((sum, e) => sum + e.amount, 0);
      windows.push({ time: t, damage: totalDamage });
    }

    return windows;
  }, [dungeon.events, player.playerId, dungeonDuration, windowSize]);

  if (damageWindows.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'var(--offwhite-color)',
        borderRadius: '4px',
        color: 'var(--text-secondary)'
      }}>
        No damage data available
      </div>
    );
  }

  const totalDamage = damageWindows.reduce((sum, w) => sum + w.damage, 0);
  const avgDamage = totalDamage / damageWindows.length;
  const peakDamage = Math.max(...damageWindows.map(w => w.damage));

  // Create SVG bars
  const width = 100;
  const height = 80;
  const barWidth = width / damageWindows.length;

  const statBoxStyle = {
    background: 'var(--offwhite-color)',
    padding: '8px 12px',
    borderRadius: '4px',
    textAlign: 'center' as const
  };

  const statLabelStyle = {
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: 'var(--text-secondary)',
    marginBottom: '2px'
  };

  const statValueStyle = {
    fontSize: '16px',
    fontWeight: '600' as const
  };

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Total</div>
          <div style={{ ...statValueStyle, color: 'var(--highlight-color)' }}>
            {Math.round(totalDamage).toLocaleString()}
          </div>
        </div>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Average/s</div>
          <div style={{ ...statValueStyle, color: 'var(--warning)' }}>
            {Math.round(avgDamage).toLocaleString()}
          </div>
        </div>
        <div style={statBoxStyle}>
          <div style={statLabelStyle}>Peak/s</div>
          <div style={{ ...statValueStyle, color: 'var(--error)' }}>
            {Math.round(peakDamage).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Graph */}
      <div
        style={{
          position: 'relative',
          height: `${height}px`,
          background: 'var(--offwhite-color)',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const timePercent = x / rect.width;
          setHoveredTime(timePercent * dungeonDuration);
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {damageWindows.map((window, idx) => {
            const barHeight = peakDamage > 0 ? (window.damage / peakDamage) * height : 0;
            const x = (window.time / dungeonDuration) * width;
            const y = height - barHeight;

            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#ef4444"
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* Hover line */}
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
    </div>
  );
}
