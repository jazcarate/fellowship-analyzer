import { type ComponentChildren, type VNode, toChildArray } from 'preact';
import { useAnalysis } from '../../contexts/analysis-context';
import { Time } from '../common/time';
import { Information } from '../common/information';

interface HighlightProps {
    name: string;
    color?: string;
    information?: string;
    showPills?: boolean;
    times: { start: number; end?: number }[];
}

function Highlight(_props: HighlightProps) {
    return null;
}

interface DungeonGraphProps {
    children: ComponentChildren;
}

export function DungeonGraph({ children }: DungeonGraphProps) {
    const { dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

    const highlights = toChildArray(children)
        .filter((child): child is VNode =>
            typeof child === 'object' && child !== null && 'props' in child
        )
        .map(child => child.props as unknown as HighlightProps);

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
                if (!highlight.showPills) return null;

                return (<div key={`pills-${hid}`}>
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

DungeonGraph.Highlight = Highlight;
