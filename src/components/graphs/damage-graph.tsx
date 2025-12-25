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
        timestamp: (e.timestamp - dungeon.startTime) / 1000,
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
  }, [dungeon, player, dungeonDuration, windowSize]);

  if (damageWindows.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        background: '#f9fafb',
        borderRadius: '6px'
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

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Total</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
            {Math.round(totalDamage).toLocaleString()}
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Average/s</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
            {Math.round(avgDamage).toLocaleString()}
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Peak/s</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
            {Math.round(peakDamage).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Graph */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${height}px`,
          background: '#f9fafb',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const timePercent = x / rect.width;
          setHoveredTime(timePercent * dungeonDuration);
        }}
        onMouseLeave={() => setHoveredTime(null)}
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
              width: '2px',
              height: '100%',
              background: '#1e40af',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}
