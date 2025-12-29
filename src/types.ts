export interface Position {
  x: number;
  y: number;
}

export interface Hero {
  name: string;
  color: string;
  icon: string;
  order: number;
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
}

export interface EventWithTarget {
  targetId: string;
  targetName: string;
  targetPosition: Position;
}


export interface AbilityActivatedEvent extends EventWithSource {
  timestamp: number;
  type: 'ABILITY_ACTIVATED';
  abilityId: number;
}

export interface ResourceChangedEvent {
  timestamp: number;
  type: 'RESOURCE_CHANGED';
  playerId: string;
  resourceId: number;
  change: number;
  amount: number;
  maxAmount: number;
}

export interface DamageEvent extends EventWithSource, EventWithTarget {
  timestamp: number;
  type: 'SWING_DAMAGE' | 'ABILITY_DAMAGE' | 'ABILITY_PERIODIC_DAMAGE';
  amount: number;
  abilityId: number;
  abilityName: string;
}

export interface AllyDeathEvent {
  timestamp: number;
  type: 'ALLY_DEATH';
  playerId: string;
}

export interface EffectEvent extends EventWithSource {
  timestamp: number;
  type: 'EFFECT_APPLIED' | 'EFFECT_REMOVED' | 'EFFECT_REFRESHED';
  effectId: number;
}

export type DungeonEvent = AbilityActivatedEvent | ResourceChangedEvent | DamageEvent | AllyDeathEvent | EffectEvent;

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
  startTime: number;
  endTime: number | null;
  completed: boolean;
  players: Player[];
  events: DungeonEvent[];
  maps: Record<number, MapInfo>;
}
