import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import type { ResourceChangedEvent } from '../../types';

interface ResourceGraphProps {
  resourceId: number;
}

export function ResourceGraph({ resourceId }: ResourceGraphProps) {
  const { dungeon, player, dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

  const dataPoints = useMemo(() => {
    const points = dungeon.events
      .filter((e): e is ResourceChangedEvent =>
        e.type === 'RESOURCE_CHANGED' &&
        e.playerId === player.playerId &&
        e.resourceId === resourceId
      )
      .map(e => ({
        timestamp: (e.timestamp - dungeon.startTime) / 1000,
        value: e.amount,
        maxValue: e.maxAmount
      }));

    return points;
  }, [dungeon, player, resourceId]);

  if (dataPoints.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        background: '#f9fafb',
        borderRadius: '6px'
      }}>
        No resource data available
      </div>
    );
  }

  const avgValue = dataPoints.reduce((sum, p) => sum + p.value, 0) / dataPoints.length;
  const minValue = Math.min(...dataPoints.map(p => p.value));
  const maxPossible = dataPoints[0]?.maxValue || 100;

  // Create SVG path
  const width = 100; // percentage
  const height = 80; // pixels
  const points = dataPoints.map(p => ({
    x: (p.timestamp / dungeonDuration) * width,
    y: height - (p.value / maxPossible) * height
  }));

  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

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
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Average</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
            {Math.round(avgValue)}
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Minimum</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
            {Math.round(minValue)}
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Maximum</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
            {Math.round(maxPossible)}
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
          {/* Area under curve */}
          <path
            d={`${pathData} L ${width},${height} L 0,${height} Z`}
            fill="#93c5fd"
            opacity="0.3"
          />
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#2563eb"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
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
              background: '#ef4444',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}
