import { useMemo } from 'preact/hooks';
import { DamageNumber } from '../damage-number';
import { Time } from '../time';
import { useAnalysis } from '../../contexts/analysis-context';
import { InsightCard } from '../insight-card';

interface SecondData {
  totalDamage: number;
  unmitigatedDamage: number;
  mitigationPercent: number;
}

interface PoorMitigationWindow {
  startTime: number;
  endTime: number;
  avgMitigation: number;
  totalDamage: number;
  unmitigatedDamage: number;
}

// Highlight windows where mitigation is this much worse than average
const MITIGATION_THRESHOLD_FACTOR = 0.5; // 50% worse than average

export function AvoidableDamageInsight() {
  const { player, dungeon, setHoveredTime } = useAnalysis();

  const { secondsData, avgMitigation, poorWindows } = useMemo(() => {
    // Group damage by second
    const damageBySecond: Record<number, SecondData> = {};

    for (const event of dungeon.events) {
      if (
        (event.type !== 'ABILITY_DAMAGE' && event.type !== 'ABILITY_PERIODIC_DAMAGE') ||
        event.targetId !== player.playerId
      ) {
        continue;
      }

      const second = Math.floor(event.timestamp);

      if (!damageBySecond[second]) {
        damageBySecond[second] = {
          totalDamage: 0,
          unmitigatedDamage: 0,
          mitigationPercent: 0
        };
      }

      damageBySecond[second].totalDamage += event.amount;
      damageBySecond[second].unmitigatedDamage += event.amountUnmitigated;
    }

    // Calculate mitigation percentage for each second
    const secondsData: SecondData[] = [];
    let totalMitigation = 0;
    let secondsWithDamage = 0;

    for (const [second, data] of Object.entries(damageBySecond)) {
      if (data.unmitigatedDamage > 0) {
        data.mitigationPercent = ((data.unmitigatedDamage - data.totalDamage) / data.unmitigatedDamage) * 100;
        totalMitigation += data.mitigationPercent;
        secondsWithDamage++;
      }
      secondsData[parseInt(second)] = data;
    }

    const avgMitigation = secondsWithDamage > 0 ? totalMitigation / secondsWithDamage : 0;
    const mitigationThreshold = avgMitigation * MITIGATION_THRESHOLD_FACTOR;

    // Find windows where mitigation is significantly below average
    const poorWindows: PoorMitigationWindow[] = [];
    let currentWindow: PoorMitigationWindow | null = null;

    for (const [second, data] of Object.entries(damageBySecond)) {
      const secondNum = parseInt(second);

      // Only consider seconds with significant damage (>100 unmitigated)
      if (data.unmitigatedDamage < 100) continue;

      if (data.mitigationPercent < mitigationThreshold) {
        if (currentWindow && secondNum <= currentWindow.endTime + 2) {
          // Extend current window
          currentWindow.endTime = secondNum;
          currentWindow.totalDamage += data.totalDamage;
          currentWindow.unmitigatedDamage += data.unmitigatedDamage;
          const windowSeconds = currentWindow.endTime - currentWindow.startTime + 1;
          currentWindow.avgMitigation = ((currentWindow.unmitigatedDamage - currentWindow.totalDamage) / currentWindow.unmitigatedDamage) * 100;
        } else {
          // Start new window
          if (currentWindow) {
            poorWindows.push(currentWindow);
          }
          currentWindow = {
            startTime: secondNum,
            endTime: secondNum,
            avgMitigation: data.mitigationPercent,
            totalDamage: data.totalDamage,
            unmitigatedDamage: data.unmitigatedDamage
          };
        }
      }
    }

    if (currentWindow) {
      poorWindows.push(currentWindow);
    }

    return { secondsData, avgMitigation, poorWindows };
  }, [dungeon.events, player.playerId]);

  // Don't show if no significant damage taken
  const totalDamage = Object.values(secondsData).reduce((sum, d) => sum + (d?.totalDamage || 0), 0);
  if (totalDamage < 1000 || poorWindows.length === 0) {
    return null;
  }

  const dungeonDuration = dungeon.endTime;

  return (
    <InsightCard>
      <InsightCard.Title>Damage Mitigation</InsightCard.Title>
      <InsightCard.Description>
        Tracking how well damage is being mitigated. Highlighted areas show periods where mitigation was significantly below your average of {avgMitigation.toFixed(1)}%.
        Low mitigation windows indicate missing defensive cooldowns or poor positioning.
      </InsightCard.Description>

      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Found {poorWindows.length} {poorWindows.length === 1 ? 'window' : 'windows'} with poor mitigation
        </div>

        {/* Mitigation timeline */}
        <div style={{
          position: 'relative',
          height: '60px',
          background: '#dcfce7',
          borderRadius: '4px',
          marginTop: '12px',
          border: '1px solid #86efac',
          overflow: 'hidden'
        }}>
          {/* Draw mitigation level as background gradient */}
          {secondsData.map((data, second) => {
            if (!data || data.unmitigatedDamage < 100) return null;

            const leftPercent = (second / dungeonDuration) * 100;
            const widthPercent = (1 / dungeonDuration) * 100;

            // Color based on mitigation: green (good) to red (bad)
            let color: string;
            if (data.mitigationPercent >= avgMitigation) {
              color = '#86efac'; // Good mitigation
            } else if (data.mitigationPercent >= avgMitigation * 0.7) {
              color = '#fde047'; // Okay mitigation
            } else {
              color = '#fca5a5'; // Poor mitigation
            }

            return (
              <div
                key={second}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  width: `${Math.max(widthPercent, 0.5)}%`,
                  height: '100%',
                  background: color,
                  opacity: 0.7
                }}
              />
            );
          })}

          {/* Highlight poor mitigation windows */}
          {poorWindows.map((window, idx) => {
            const leftPercent = (window.startTime / dungeonDuration) * 100;
            const widthPercent = ((window.endTime - window.startTime + 1) / dungeonDuration) * 100;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  height: '100%',
                  border: '2px solid #ef4444',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  pointerEvents: 'auto'
                }}
                onMouseEnter={(e) => {
                  setHoveredTime(window.startTime);
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                title={`${window.avgMitigation.toFixed(1)}% mitigation (${(window.unmitigatedDamage - window.totalDamage).toFixed(0)} mitigated of ${window.unmitigatedDamage.toFixed(0)})`}
              />
            );
          })}
        </div>

        {/* Time markers */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '4px'
        }}>
          <span><Time seconds={0} /></span>
          <span><Time seconds={dungeonDuration} /></span>
        </div>

        {/* Poor mitigation windows list */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            Low Mitigation Windows:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {poorWindows.map((window, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fee',
                  border: '2px solid #ef4444',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={() => setHoveredTime(window.startTime)}
              >
                <Time seconds={window.startTime} /> • {window.avgMitigation.toFixed(1)}% mitigation
                <span style={{ color: 'var(--text-secondary)' }}>
                  {' '}
                  (<DamageNumber damage={window.totalDamage} /> taken)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InsightCard>
  );
}
