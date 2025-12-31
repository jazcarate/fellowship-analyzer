export interface Position {
  x: number;
  y: number;
}

export interface Hero {
  name: string;
  color: string;
  icon: string;
  order: number;
  tank?: true;
  interrupt?: {
    abilityId: number;
    cooldown: number;
  };
  dispel?: {
    abilityId: number;
    cooldown: number;
  };
}

export interface DungeonModifier {
  name: string;
  description: string;
  bonus: string | null;
  icon: string;
}

export interface Player {
  playerId: string;
  playerName: string;
  isSelf: boolean;
  hero: Hero;
  itemLevel: number;
  talents: number[];
}

export interface Ability {
  name: string;
  icon: string;
  getCooldown: (context: { player: Player }) => number;
}

export interface Buff {
  name: string;
  icon: string;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DungeonMap {
  bounds: Bounds;
  image: string | null;
}

export interface DungeonConfig {
  name: string;
  maps: Record<number, DungeonMap>;
}

export interface MapInfo {
  bounds: Bounds;
}


export interface EventWithSource {
  sourceId: string;
  sourcePosition: Position;
  sourceName: string;
  sourceCurrentHP: number;
  sourceMaxHP: number;
}

export interface EventWithTarget {
  targetId: string;
  targetName: string;
  targetPosition: Position;
  targetCurrentHP: number;
  targetMaxHP: number;
}


export interface AbilityActivatedEvent extends EventWithSource {
  timestamp: number; // Seconds relative to dungeon start
  type: 'ABILITY_ACTIVATED';
  abilityId: number;
  abilityName: string;
}

export interface ResourceChangedEvent {
  timestamp: number; // Seconds relative to dungeon start
  type: 'RESOURCE_CHANGED';
  playerId: string;
  resourceId: number;
  change: number;
  amount: number;
  maxAmount: number;
}

export interface DamageEvent extends EventWithSource, EventWithTarget {
  timestamp: number; // Seconds relative to dungeon start
  type: 'SWING_DAMAGE' | 'ABILITY_DAMAGE' | 'ABILITY_PERIODIC_DAMAGE';
  amount: number;
  amountUnmitigated: number;
  abilityId: number;
  abilityName: string;
}

export interface AllyDeathEvent {
  timestamp: number; // Seconds relative to dungeon start
  type: 'ALLY_DEATH';
  playerId: string;
}

export interface EffectEvent extends EventWithSource {
  timestamp: number; // Seconds relative to dungeon start
  type: 'EFFECT_APPLIED' | 'EFFECT_REMOVED' | 'EFFECT_REFRESHED';
  effectId: number;
  effectName: string;
  effectType: 'BUFF' | 'DEBUFF';
}

export interface InterruptEvent {
  timestamp: number; // Seconds relative to dungeon start
  type: 'ABILITY_INTERRUPT';
  abilityId: number;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
}

export interface CastSuccessfulEvent extends EventWithSource {
  timestamp: number; // Seconds relative to dungeon start
  type: 'ABILITY_CAST_SUCCESS';
  abilityId: number;
}

export interface DispelEvent {
  timestamp: number; // Seconds relative to dungeon start
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  type: 'ABILITY_DISPEL';
  abilityId: number;
  effectId: number;
}

export type DungeonEvent = AbilityActivatedEvent | ResourceChangedEvent | DamageEvent | AllyDeathEvent | EffectEvent | InterruptEvent | CastSuccessfulEvent | DispelEvent;

/**
 * @param {DungeonEvent} event
 * @returns {event is DungeonEvent & EventWithSource}
 */
export function hasSource(event: DungeonEvent): event is DungeonEvent & EventWithSource {
  return 'sourcePosition' in event;
}

/**
 * @param {DungeonEvent} event
 * @returns {event is DungeonEvent & EventWithTarget}
 */
export function hasTarget(event: DungeonEvent): event is DungeonEvent & EventWithTarget {
  return 'targetPosition' in event;
}

export interface Dungeon {
  id: string;
  dungeonId: number;
  name: string;
  difficulty: number;
  modifierIds: number[];
  startTime: number; // Absolute timestamp (milliseconds) when dungeon was played
  endTime: number; // Seconds relative to startTime
  completed: boolean;
  players: Player[];
  events: DungeonEvent[]; // All event timestamps are relative seconds from startTime
  maps: Record<number, MapInfo>;
}
