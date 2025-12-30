import { useLocation } from 'preact-iso';
import type { Dungeon } from '../types';
import { PlayerBadge, ModifierBadge, DungeonLevelBadge } from './badges';
import { Time } from './time';

interface DungeonCardProps {
  dungeon: Dungeon;
}

export function DungeonCard({ dungeon }: DungeonCardProps) {
  const duration = dungeon.endTime;
  const { route } = useLocation();

  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        borderLeft: `4px solid ${dungeon.completed ? '#10b981' : '#f59e0b'}`
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '10px'
      }}>
        <h3 style={{ color: '#2563eb', margin: 0 }}>{dungeon.name}</h3>
        <span style={{
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '4px',
          background: '#e5e7eb',
          color: '#374151'
        }}>
          {dungeon.completed ? '✓ Completed' : 'x Not Completed'}
        </span>
      </div>

      <div style={{ marginTop: '15px', marginBottom: '10px' }}>
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0', fontWeight: '500' }}>
          Players:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {dungeon.players.map(player => (
            <div
              key={player.playerId}
              style={{
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                borderRadius: '6px'
              }}
              onClick={() => route(`/dungeon/${dungeon.id}/player/${player.playerId}`)}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = 'none';
              }}
            >
              <PlayerBadge player={player} />
            </div>
          ))}
        </div>
      </div>

      {dungeon.modifierIds.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
            Modifiers:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {dungeon.modifierIds.map(modId => (
              <ModifierBadge key={modId} modId={modId} />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
        <DungeonLevelBadge level={dungeon.difficulty} />
        <span> • </span>
        <Time seconds={duration} />
        <span> • </span>
        <span>{new Date(dungeon.startTime).toLocaleString()}</span>
      </div>
    </div>
  );
}
