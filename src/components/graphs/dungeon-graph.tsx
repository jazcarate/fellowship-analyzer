import { useAnalysis } from '../../contexts/analysis-context';
import { Time } from '../time';
import { Information } from '../information';

interface Highlight {
    color?: string;
    name: string;
    information?: string;
    showPill?: boolean
    times: { start: number, end?: number }[];
}

interface DungeonGraphProps {
    highlights: Highlight[];
}

export function DungeonGraph({ highlights }: DungeonGraphProps) {
    const { dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

    return (
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
                {highlights.map((highlight, hid) => highlight.times.map((time, tid) => {
                    const startPercent = (time.start / dungeonDuration) * 100;
                    const width = time.end ?
                        `${((time.end - time.start) / dungeonDuration) * 100}%` :
                        '3px';

                    return (
                        <div
                            key={`hilight-${hid}-${tid}`}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: `${startPercent}%`,
                                width: `${width}`,
                                height: '100%',
                                background: `${highlight.color ?? 'var(--highlight-color)'}`,
                                opacity: 0.4,
                                zIndex: `${time.end ? '0' : '1'}`
                            }}
                        />
                    );
                }))}

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
                {highlights.map((highlight, hid) => (
                    <div key={`legend-${hid}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            background: `${highlight.color ?? 'var(--highlight-color)'}`,
                            borderRadius: '2px'
                        }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{highlight.name}</span>
                        {highlight.information && <Information title={highlight.information} />}
                    </div>))}
            </div>

            {highlights.map((highlight, hid) => {
                if (!highlight.showPill) return null;

                return (<div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: 'var(--text-primary)'
                    }}>
                        {highlight.name}:
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                    }}>
                        {highlight.times.map((time, idx) => (
                            <span
                                key={idx}
                                style={{
                                    padding: '4px 8px',
                                    background: '#ffe8cc',
                                    color: `${highlight.color ?? 'var(--highlight-color)'}`,
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseEnter={(e) => {
                                    setHoveredTime(time.start);
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0px)';
                                }}
                            >
                                <Time seconds={time.start} />
                            </span>
                        ))}
                    </div>
                </div>)
            })}
        </div>
    );
}
