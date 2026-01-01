import type { Player } from '../../types';
import { getModifier } from '../../constants/maps';

interface PlayerBadgeProps {
  player: Player;
}

export function PlayerBadge({ player }: PlayerBadgeProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: '#f3f4f6',
      borderRadius: '6px',
      border: `2px solid ${player.hero.color}`,
      fontSize: '13px'
    }}>
      {player.hero.icon && (
        <img
          src={player.hero.icon}
          alt={player.hero.name}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: `2px solid ${player.hero.color}`
          }}
        />
      )}
      <span style={{ fontWeight: '500' }}>{player.playerName}</span>
      <span style={{ color: '#666' }}>({player.hero.name})</span>
    </div>
  );
}

interface ModifierBadgeProps {
  modId: number;
}

export function ModifierBadge({ modId }: ModifierBadgeProps) {
  const modifier = getModifier(modId);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: '#e5e7eb',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#374151'
      }}
      title={modifier.description}
    >
      {modifier.icon && (
        <img
          src={modifier.icon}
          alt={modifier.name}
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '2px'
          }}
        />
      )}
      <span>{modifier.name}</span>
    </div>
  );
}



interface DungeonLevelBadgeProps {
  level: number;
}

export function DungeonLevelBadge({ level }: DungeonLevelBadgeProps) {
  const getDungeonLevel = (level: number) => {
    if (level >= 1 && level <= 7) {
      return { tier: 'Contender', icon: '/assets/leagues/contender.png', rank: level };
    } else if (level >= 8 && level <= 14) {
      return { tier: 'Adept', icon: '/assets/leagues/adept.png', rank: level - 7 };
    } else if (level >= 15 && level <= 21) {
      return { tier: 'Champion', icon: '/assets/leagues/champion.png', rank: level - 14 };
    } else if (level >= 22 && level <= 28) {
      return { tier: 'Paragon', icon: '/assets/leagues/paragon.png', rank: level - 21 };
    } else {
      return { tier: 'Eternal', icon: '/assets/leagues/eternal.png', rank: level - 28 };
    }
  }

  const { tier, rank, icon } = getDungeonLevel(level);
  return (
    <span
      title={`${tier} ${rank}`}
    >
      <img
        src={icon}
        alt={tier}
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '2px'
        }}
      />
      <span>{rank}</span>
    </span>
  );
}