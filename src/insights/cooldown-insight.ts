import type { Dungeon, Player } from '../types';

export interface CooldownUsage {
  timestamp: number;
  nextAvailable: number;
}

export interface CooldownWindow {
  start: number;
  end: number;
  type: 'available' | 'cooldown' | 'wasted';
}

export interface CooldownInsight {
  type: 'cooldown';
  abilityId: number;
  baseCooldown: number;
  actualCooldown: number;
  usages: CooldownUsage[];
  totalPossibleUses: number;
  actualUses: number;
  wastedTime: number;
  timeline: CooldownWindow[];
  score: number;
}

export function analyzeCooldown(
  dungeon: Dungeon,
  player: Player,
  abilityId: number,
  baseCooldown: number,
  cooldownReductionTalents: number[] = [],
  cooldownReduction: number = 0
): CooldownInsight {
  const hasCooldownReduction = cooldownReductionTalents.some(talentId =>
    player.talents?.includes(talentId)
  );

  const actualCooldown = hasCooldownReduction
    ? baseCooldown - cooldownReduction
    : baseCooldown;

  const usages: CooldownUsage[] = [];
  const playerId = player.playerId;

  for (const event of dungeon.events) {
    if (event.type === 'ABILITY_ACTIVATED') {
      const eventPlayerId = event.playerId;
      const eventAbilityId = event.abilityId;

      if (eventPlayerId === playerId && eventAbilityId === abilityId) {
        usages.push({
          timestamp: event.timestamp,
          nextAvailable: event.timestamp + actualCooldown * 1000
        });
      }
    }
  }

  const timeline: CooldownWindow[] = [];
  const dungeonStart = dungeon.startTime;
  const dungeonEnd = dungeon.endTime || Date.now();
  const dungeonDuration = (dungeonEnd - dungeonStart) / 1000;

  if (usages.length === 0) {
    timeline.push({
      start: 0,
      end: dungeonDuration,
      type: 'wasted'
    });
  } else {
    let currentTime = 0;

    for (const usage of usages) {
      const usageTime = (usage.timestamp - dungeonStart) / 1000;
      const nextAvailableTime = (usage.nextAvailable - dungeonStart) / 1000;

      if (usageTime > currentTime) {
        const availableWindow = usageTime - currentTime;
        if (availableWindow >= actualCooldown) {
          timeline.push({
            start: currentTime,
            end: usageTime - actualCooldown,
            type: 'wasted'
          });
          timeline.push({
            start: usageTime - actualCooldown,
            end: usageTime,
            type: 'available'
          });
        } else {
          timeline.push({
            start: currentTime,
            end: usageTime,
            type: 'available'
          });
        }
      }

      const cooldownEnd = Math.min(nextAvailableTime, dungeonDuration);
      if (cooldownEnd > usageTime) {
        timeline.push({
          start: usageTime,
          end: cooldownEnd,
          type: 'cooldown'
        });
      }

      currentTime = cooldownEnd;
    }

    if (currentTime < dungeonDuration) {
      const remainingTime = dungeonDuration - currentTime;
      if (remainingTime >= actualCooldown) {
        timeline.push({
          start: currentTime,
          end: dungeonDuration - actualCooldown,
          type: 'wasted'
        });
        timeline.push({
          start: dungeonDuration - actualCooldown,
          end: dungeonDuration,
          type: 'available'
        });
      } else {
        timeline.push({
          start: currentTime,
          end: dungeonDuration,
          type: 'available'
        });
      }
    }
  }

  const wastedTime = timeline
    .filter(w => w.type === 'wasted')
    .reduce((sum, w) => sum + (w.end - w.start), 0);

  const totalPossibleUses = Math.floor(dungeonDuration / actualCooldown) + 1;
  const actualUses = usages.length;

  const usageRatio = totalPossibleUses > 0 ? actualUses / totalPossibleUses : 0;
  const score = Math.round(usageRatio * 100);

  return {
    type: 'cooldown',
    abilityId,
    baseCooldown,
    actualCooldown,
    usages,
    totalPossibleUses,
    actualUses,
    wastedTime,
    timeline,
    score
  };
}
