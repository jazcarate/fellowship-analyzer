import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';

interface ResourceGraphProps {
  resourceId: number;
  maxValue?: number;
  /** Percentage thresholds to show as horizontal lines (e.g., [25, 50, 75]) */
  thresholds?: number[];
}

const GRAPH_WIDTH = 100;
const GRAPH_HEIGHT = 80;

export function ResourceGraph({ resourceId, maxValue, thresholds }: ResourceGraphProps) {
  const { dungeon, player, dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

  const smoothWindow = 10;

  const dataPoints = useMemo(() => {
    const numSeconds = Math.ceil(dungeonDuration);
    if (numSeconds === 0) return [];

    const points: Array<{ sum: number; count: number }> = Array.from(
      { length: numSeconds },
      () => ({ sum: 0, count: 0 })
    );

    for (const event of dungeon.events) {
      if (
        event.type === 'RESOURCE_CHANGED' &&
        event.playerId === player.playerId &&
        event.resourceId === resourceId
      ) {
        const eventTime = (event.timestamp - dungeon.startTime) / 1000;
        const centerSecond = Math.floor(eventTime);
        const halfWindow = Math.floor(smoothWindow / 2);

        for (let offset = -halfWindow; offset <= halfWindow; offset++) {
          const targetSecond = centerSecond + offset;
          if (targetSecond >= 0 && targetSecond < numSeconds) {
            const point = points[targetSecond]!;
            point.sum += (event.amount / event.maxAmount) * 100;
            point.count++;
          }
        }
      }
    }

    return points;
  }, [dungeon, player, resourceId, dungeonDuration, smoothWindow]);

  if (dataPoints.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'var(--offwhite-color)',
        borderRadius: '4px',
        color: 'var(--text-secondary)'
      }}>
        No resource data available
      </div>
    );
  }

  const graphMax = maxValue ?? 100;
  const graphMaxWithPadding = graphMax * 1.1;

  const pathData = useMemo(() => {
    const points = dataPoints.map((p, index) => ({
      x: (index / dungeonDuration) * GRAPH_WIDTH,
      y: GRAPH_HEIGHT - ((p.count > 0 ? p.sum / p.count : 0) / graphMaxWithPadding) * GRAPH_HEIGHT
    }));
    return points.length > 0
      ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
      : '';
  }, [dataPoints, dungeonDuration, graphMaxWithPadding]);

  const hoveredValue = useMemo(() => {
    if (hoveredTime == null) return 0;
    const secondIndex = Math.floor(hoveredTime);
    const point = dataPoints[secondIndex];
    if (!point || point.count === 0) return 0;
    return Math.round(point.sum / point.count);
  }, [hoveredTime, dataPoints]);


  return (
    <div>
      <div
        style={{
          position: 'relative',
          height: `${GRAPH_HEIGHT}px`,
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
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {thresholds?.map(threshold => {
            const y = GRAPH_HEIGHT - (threshold / graphMaxWithPadding) * GRAPH_HEIGHT;
            return (
              <line
                key={threshold}
                x1={0}
                y1={y}
                x2={GRAPH_WIDTH}
                y2={y}
                stroke="#2563eb"
                strokeWidth="0.3"
                vectorEffect="non-scaling-stroke"
                opacity="0.4"
              />
            );
          })}
          <path
            d={`${pathData} L ${GRAPH_WIDTH},${GRAPH_HEIGHT} L 0,${GRAPH_HEIGHT} Z`}
            fill="#93c5fd"
            opacity="0.3"
          />
          <path
            d={pathData}
            fill="none"
            stroke="#2563eb"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

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

      <div style={{
        marginTop: '8px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        minHeight: '20px'
      }}>
        {Math.round(hoveredValue)}%
      </div>
    </div>
  );
}
