import { useMemo } from 'preact/hooks';
import { useAnalysis } from '../../contexts/analysis-context';
import { getBuff } from '../../constants/heroes';
import { DungeonGraph } from '../graphs/dungeon-graph';

interface BuffUptimeAnalysisProps {
  buffId: number;
  highlightRefresh?: boolean;
}

interface BuffPeriod {
  start: number;
  end: number;
}

export function BuffUptimeAnalysis({ buffId, highlightRefresh = false }: BuffUptimeAnalysisProps) {
  const { dungeon, player, dungeonDuration } = useAnalysis();

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
        if (event.type === 'EFFECT_APPLIED') {
          currentPeriodStart = event.timestamp;
        } else if (event.type === 'EFFECT_REFRESHED') {
          refreshTimes.push(event.timestamp);
        } else if (event.type === 'EFFECT_REMOVED') {
          if (currentPeriodStart !== null) {
            buffPeriods.push({
              start: currentPeriodStart,
              end: event.timestamp
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
  }, [dungeon.events, player.playerId, buffId, dungeonDuration]);

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
        <DungeonGraph highlights={[
          { name: "Buff active", color: '#22c55e', times: periods },
          { name: "Refreshed", showPill: true, color: '#3b82f6', times: refreshTimes.map(start => ({ start })) }
        ]} />
      </div>
    </div>
  );
}
