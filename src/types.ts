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
  baseCooldown: number;
  getCooldown: (player: Player) => number;
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
  id: number;
  name: string;
  worldBounds: Bounds;
  maps: Record<number, DungeonMap>;
}

export interface MapInfo {
  bounds: Bounds;
}

export interface AbilityActivatedEvent {
  timestamp: number;
  type: 'ABILITY_ACTIVATED';
  playerId: string;
  abilityId: number;
  position: Position;
}

export interface ResourceChangedEvent {
  timestamp: number;
  type: 'RESOURCE_CHANGED';
  playerId: string;
  resourceId: number;
  amount: number;
  maxAmount: number;
  position: Position;
}

export interface DamageEvent {
  timestamp: number;
  type: 'SWING_DAMAGE' | 'ABILITY_DAMAGE' | 'ABILITY_PERIODIC_DAMAGE';
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  amount: number;
  sourcePosition: Position;
  targetPosition: Position;
}

export type DungeonEvent = AbilityActivatedEvent | ResourceChangedEvent | DamageEvent;

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
