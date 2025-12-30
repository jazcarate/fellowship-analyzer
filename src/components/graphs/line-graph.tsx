import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';

interface LineGraphProps {
  /** Array of values to plot (spread evenly across X axis) */
  values: number[];
  /** Maximum value for the y-axis (default: 100) */
  maxValue?: number | undefined;
  /** Percentage thresholds to show as horizontal lines (e.g., [25, 50, 75]) */
  thresholds?: number[] | undefined;
  /** Color for the line (default: '#2563eb') */
  lineColor?: string | undefined;
  /** Color for the fill area (default: '#93c5fd') */
  fillColor?: string | undefined;
  /** Format function for the hovered value display */
  formatValue?: ((value: number) => string) | undefined;
  /** Window size for smoothing (e.g., 5 = average of 5 points). 0 or undefined = no smoothing */
  smoothWindow?: number | undefined;
}

const GRAPH_WIDTH = 100;
const GRAPH_HEIGHT = 80;

export function LineGraph({
  values,
  maxValue = 100,
  thresholds,
  lineColor = '#2563eb',
  fillColor = '#93c5fd',
  formatValue = (v) => `${Math.round(v)}%`,
  smoothWindow = 0
}: LineGraphProps) {
  const { dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

  // Apply smoothing if requested
  const smoothedValues = useMemo(() => {
    if (!smoothWindow || smoothWindow <= 1) return values;

    const halfWindow = Math.floor(smoothWindow / 2);
    return values.map((_, index) => {
      let sum = 0;
      let count = 0;

      for (let offset = -halfWindow; offset <= halfWindow; offset++) {
        const targetIndex = index + offset;
        if (targetIndex >= 0 && targetIndex < values.length) {
          sum += values[targetIndex]!;
          count++;
        }
      }

      return count > 0 ? sum / count : 0;
    });
  }, [values, smoothWindow]);

  if (smoothedValues.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'var(--offwhite-color)',
        borderRadius: '4px',
        color: 'var(--text-secondary)'
      }}>
        No data available
      </div>
    );
  }

  const graphMax = maxValue;
  const graphMaxWithPadding = graphMax * 1.1;

  const pathData = useMemo(() => {
    const points = smoothedValues.map((value, index) => ({
      x: (index / (smoothedValues.length - 1)) * GRAPH_WIDTH,
      y: GRAPH_HEIGHT - (value / graphMaxWithPadding) * GRAPH_HEIGHT
    }));
    return points.length > 0
      ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
      : '';
  }, [smoothedValues, graphMaxWithPadding]);

  const hoveredValue = useMemo(() => {
    if (hoveredTime == null) return 0;
    const timePercent = hoveredTime / dungeonDuration;
    const index = Math.floor(timePercent * smoothedValues.length);
    return smoothedValues[Math.min(index, smoothedValues.length - 1)] ?? 0;
  }, [hoveredTime, dungeonDuration, smoothedValues]);

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
                stroke={lineColor}
                strokeWidth="0.3"
                vectorEffect="non-scaling-stroke"
                opacity="0.4"
              />
            );
          })}
          <path
            d={`${pathData} L ${GRAPH_WIDTH},${GRAPH_HEIGHT} L 0,${GRAPH_HEIGHT} Z`}
            fill={fillColor}
            opacity="0.3"
          />
          <path
            d={pathData}
            fill="none"
            stroke={lineColor}
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
        {formatValue(hoveredValue)}
      </div>
    </div>
  );
}
