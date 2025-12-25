import type { Dungeon, Player } from '../types';

export interface ToughnessDataPoint {
  timestamp: number;
  amount: number;
  maxAmount: number;
}

export interface ToughnessInsight {
  type: 'toughness';
  dataPoints: ToughnessDataPoint[];
  averageToughness: number;
  minToughness: number;
  maxToughness: number;
}

const TOUGHNESS_RESOURCE_ID = 3;

export function analyzeToughness(dungeon: Dungeon, player: Player): ToughnessInsight {
  const dataPoints: ToughnessDataPoint[] = [];
  const playerId = player.playerId;

  for (const event of dungeon.events) {
    if (event.type === 'RESOURCE_CHANGED' &&
      event.playerId === playerId &&
      event.resourceId === TOUGHNESS_RESOURCE_ID) {

      dataPoints.push({
        timestamp: event.timestamp,
        amount: event.amount,
        maxAmount: event.maxAmount
      });
    }
  }

  let totalToughness = 0;
  let minToughness = Infinity;
  let maxToughness = -Infinity;

  for (const point of dataPoints) {
    totalToughness += point.amount;
    if (point.amount < minToughness) minToughness = point.amount;
    if (point.amount > maxToughness) maxToughness = point.amount;
  }

  const averageToughness = dataPoints.length > 0 ? totalToughness / dataPoints.length : 0;

  return {
    type: 'toughness',
    dataPoints,
    averageToughness,
    minToughness: minToughness === Infinity ? 0 : minToughness,
    maxToughness: maxToughness === -Infinity ? 0 : maxToughness
  };
}
