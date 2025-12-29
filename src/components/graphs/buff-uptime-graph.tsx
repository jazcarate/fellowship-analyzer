import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { getBuff } from '../../constants/heroes';
import { Time } from '../time';

interface BuffUptimeGraphProps {
  buffId: number;
  highlightRefresh?: boolean;
}

interface BuffPeriod {
  start: number;
  end: number;
}

export function BuffUptimeGraph({ buffId, highlightRefresh = false }: BuffUptimeGraphProps) {
  const { dungeon, player, dungeonDuration, hoveredTime, setHoveredTime } = useAnalysis();

  const buff = getBuff(buffId);

  const { periods, uptimePercentage, refreshTimes } = useMemo(() => {
    const buffPeriods: BuffPeriod[] = [];
    const refreshTimes: number[] = [];
    let currentPeriodStart: number | null = null;

    for (const event of dungeon.events) {
      if (
        (event.type === 'EFFECT_APPLIED' ||
          event.type === 'EFFECT_REMOVED' ||
          event.type === 'EFFECT_REFRESHED') &&
        event.sourceId === player.playerId &&
        event.effectId === buffId
      ) {
        const relativeTime = (event.timestamp - dungeon.startTime) / 1000;

        if (event.type === 'EFFECT_APPLIED') {
          currentPeriodStart = relativeTime;
        } else if (event.type === 'EFFECT_REFRESHED') {
          refreshTimes.push(relativeTime);
        } else if (event.type === 'EFFECT_REMOVED') {
          if (currentPeriodStart !== null) {
            buffPeriods.push({
              start: currentPeriodStart,
              end: relativeTime
            });
            currentPeriodStart = null;
          }
        }
      }
    }

    if (currentPeriodStart !== null) {
      buffPeriods.push({
        start: currentPeriodStart,
        end: dungeonDuration
      });
    }

    const totalUptime = buffPeriods.reduce((sum, period) => sum + (period.end - period.start), 0);
    const uptimePercentage = dungeonDuration > 0 ? (totalUptime / dungeonDuration) * 100 : 0;

    return { periods: buffPeriods, uptimePercentage, refreshTimes };
  }, [dungeon, player, buffId, dungeonDuration]);

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '15px'
      }}>
        {buff.icon && (
          <img
            src={buff.icon}
            alt={buff.name}
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
            {buff.name}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '2px'
          }}>
            {uptimePercentage.toFixed(1)}% uptime
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
          {/* Active buff periods */}
          {periods.map((period, idx) => {
            const startPercent = (period.start / dungeonDuration) * 100;
            const widthPercent = ((period.end - period.start) / dungeonDuration) * 100;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  height: '100%',
                  background: '#22c55e',
                  opacity: 0.6
                }}
              />
            );
          })}

          {/* Period start markers */}
          {periods.map((period, idx) => (
            <div
              key={`start-${idx}`}
              style={{
                position: 'absolute',
                left: `${(period.start / dungeonDuration) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: '#16a34a',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          ))}

          {/* Refresh markers */}
          {highlightRefresh && refreshTimes.map((refreshTime, idx) => (
            <div
              key={`refresh-${idx}`}
              style={{
                position: 'absolute',
                left: `${(refreshTime / dungeonDuration) * 100}%`,
                top: 0,
                bottom: 0,
                width: '3px',
                background: '#3b82f6',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />
          ))}

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
              background: '#22c55e',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Buff Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: 'var(--offwhite-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Buff Inactive</span>
          </div>
          {highlightRefresh && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: '#3b82f6',
                borderRadius: '2px'
              }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Refreshed</span>
            </div>
          )}
        </div>
      </div>

      {highlightRefresh && (
        refreshTimes.length > 0 && (
          <div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--text-primary)'
            }}>
              Refresh Times:
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {refreshTimes.map((refreshTime, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 8px',
                    background: '#dbeafe',
                    color: '#3b82f6',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    transition: 'transform 0.1s'
                  }}
                  onMouseEnter={(e) => {
                    setHoveredTime(refreshTime);
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                >
                  <Time seconds={refreshTime} />
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
