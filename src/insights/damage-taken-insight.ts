import type { Dungeon, Player } from '../types';

export interface DamageWindow {
  startTime: number;
  endTime: number;
  totalDamage: number;
}

export interface DamageTakenInsight {
  type: 'damage-taken';
  windows: DamageWindow[];
  peakDamage: number;
  averageDamage: number;
  totalDamage: number;
  windowSize: number;
}

export function analyzeDamageTaken(
  dungeon: Dungeon,
  player: Player,
  windowSizeMs: number = 1000
): DamageTakenInsight {
  const playerId = player.playerId;
  const damageEvents: Array<{ timestamp: number; amount: number }> = [];

  for (const event of dungeon.events) {
    if ((event.type === 'SWING_DAMAGE' ||
      event.type === 'ABILITY_DAMAGE' ||
      event.type === 'ABILITY_PERIODIC_DAMAGE') &&
      event.targetId === playerId) {

      damageEvents.push({
        timestamp: event.timestamp,
        amount: event.amount
      });
    }
  }

  damageEvents.sort((a, b) => a.timestamp - b.timestamp);

  if (damageEvents.length === 0) {
    return {
      type: 'damage-taken',
      windows: [],
      peakDamage: 0,
      averageDamage: 0,
      totalDamage: 0,
      windowSize: windowSizeMs
    };
  }

  const windows: DamageWindow[] = [];
  const startTime = dungeon.startTime;
  const endTime = dungeon.startTime + (dungeon.endTime * 1000);

  let currentWindowStart = startTime;

  while (currentWindowStart < endTime) {
    const windowEnd = currentWindowStart + windowSizeMs;

    let windowDamage = 0;
    for (const event of damageEvents) {
      if (event.timestamp >= currentWindowStart && event.timestamp < windowEnd) {
        windowDamage += event.amount;
      }
    }

    if (windowDamage > 0) {
      windows.push({
        startTime: currentWindowStart,
        endTime: windowEnd,
        totalDamage: windowDamage
      });
    }

    currentWindowStart = windowEnd;
  }

  let totalDamage = 0;
  let peakDamage = 0;

  for (const window of windows) {
    totalDamage += window.totalDamage;
    if (window.totalDamage > peakDamage) {
      peakDamage = window.totalDamage;
    }
  }

  const averageDamage = windows.length > 0 ? totalDamage / windows.length : 0;

  return {
    type: 'damage-taken',
    windows,
    peakDamage,
    averageDamage,
    totalDamage,
    windowSize: windowSizeMs
  };
}
