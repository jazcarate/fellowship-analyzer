import type { Dungeon, Player } from '../types';

export interface TrackedEffect {
  effectId: number;
  effectName: string;
  effectType: 'BUFF' | 'DEBUFF';
  targetId: string;
  targetName: string;
  startTime: number;
  endTime: number | null;
  dispelled: boolean;
  damageDealt: number;
  dispelAvailable: boolean;
}

export interface EffectSnapshot {
  effects: TrackedEffect[];
}

export function trackEffects(dungeon: Dungeon, player: Player): {
  activeEffects: Record<string, TrackedEffect[]>;
  completedEffects: TrackedEffect[];
} {
  const activeEffects: Record<string, Record<string, TrackedEffect>> = {};
  const completedEffects: TrackedEffect[] = [];

  let lastDispelTime: number | null = null;
  const dispelAbilityId = player.hero.dispel?.abilityId;
  const dispelCooldown = player.hero.dispel?.cooldown || 0;

  for (const event of dungeon.events) {
    // Track when player uses their dispel
    if (
      event.type === 'ABILITY_ACTIVATED' &&
      event.sourceId === player.playerId &&
      dispelAbilityId &&
      event.abilityId === dispelAbilityId
    ) {
      lastDispelTime = event.timestamp;
    }

    // Track when effects are applied
    if (event.type === 'EFFECT_APPLIED') {
      const targetId = event.sourceId;
      const key = `${targetId}-${event.effectId}`;

      if (!activeEffects[targetId]) {
        activeEffects[targetId] = {};
      }

      const dispelAvailable =
        dispelAbilityId !== undefined &&
        (lastDispelTime === null || event.timestamp - lastDispelTime >= dispelCooldown);

      activeEffects[targetId]![key] = {
        effectId: event.effectId,
        effectName: event.effectName,
        effectType: event.effectType,
        targetId: event.sourceId,
        targetName: event.sourceId,
        startTime: event.timestamp,
        endTime: null,
        dispelled: false,
        damageDealt: 0,
        dispelAvailable
      };
    }

    // Track damage dealt by periodic effects
    if (event.type === 'ABILITY_PERIODIC_DAMAGE') {
      const targetId = event.targetId;
      if (!activeEffects[targetId]) continue;

      for (const effect of Object.values(activeEffects[targetId]!)) {
        if (effect.effectId === event.abilityId) {
          effect.damageDealt += event.amount;
        }
      }
    }

    // Track when effects are dispelled
    if (event.type === 'ABILITY_DISPEL') {
      const targetId = event.targetId;
      const key = `${targetId}-${event.effectId}`;

      if (activeEffects[targetId]?.[key]) {
        activeEffects[targetId]![key]!.dispelled = true;
      }
    }

    // Track when effects are removed
    if (event.type === 'EFFECT_REMOVED') {
      const targetId = event.sourceId;
      const key = `${targetId}-${event.effectId}`;

      if (activeEffects[targetId]?.[key]) {
        const effect = activeEffects[targetId]![key]!;
        effect.endTime = event.timestamp;

        completedEffects.push(effect);
        delete activeEffects[targetId]![key];
      }
    }
  }

  const activeEffectsByTarget: Record<string, TrackedEffect[]> = {};
  for (const [targetId, effects] of Object.entries(activeEffects)) {
    activeEffectsByTarget[targetId] = Object.values(effects);
  }

  return {
    activeEffects: activeEffectsByTarget,
    completedEffects
  };
}

export function getEffectsAtTime(
  trackedEffects: TrackedEffect[],
  timestamp: number
): TrackedEffect[] {
  return trackedEffects.filter(
    effect =>
      effect.startTime <= timestamp &&
      (effect.endTime === null || effect.endTime >= timestamp)
  );
}
