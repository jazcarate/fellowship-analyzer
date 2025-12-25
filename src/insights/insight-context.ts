import type {
  Dungeon,
  Player,
  DungeonEvent,
  AbilityActivatedEvent,
  ResourceChangedEvent,
  DamageEvent
} from '../types';

export class EventQuery {
  dungeon: Dungeon;
  player: Player;
  events: DungeonEvent[];

  constructor(dungeon: Dungeon, player: Player) {
    this.dungeon = dungeon;
    this.player = player;
    this.events = dungeon.events;
  }

  getAbilityActivations(abilityId: number, playerId: string = this.player.playerId): AbilityActivatedEvent[] {
    return this.events.filter((e): e is AbilityActivatedEvent =>
      e.type === 'ABILITY_ACTIVATED' &&
      e.playerId === playerId &&
      e.abilityId === abilityId
    );
  }

  getResourceChanges(resourceId: number, playerId: string = this.player.playerId): ResourceChangedEvent[] {
    return this.events.filter((e): e is ResourceChangedEvent =>
      e.type === 'RESOURCE_CHANGED' &&
      e.playerId === playerId &&
      e.resourceId === resourceId
    );
  }

  getDamageTaken(playerId: string = this.player.playerId): DamageEvent[] {
    return this.events.filter((e): e is DamageEvent =>
      (e.type === 'SWING_DAMAGE' ||
        e.type === 'ABILITY_DAMAGE' ||
        e.type === 'ABILITY_PERIODIC_DAMAGE') &&
      e.targetId === playerId
    );
  }

  getDamageDealt(playerId: string = this.player.playerId): DamageEvent[] {
    return this.events.filter((e): e is DamageEvent =>
      (e.type === 'SWING_DAMAGE' ||
        e.type === 'ABILITY_DAMAGE' ||
        e.type === 'ABILITY_PERIODIC_DAMAGE') &&
      e.sourceId === playerId
    );
  }

  getEventsInWindow(startTime: number, endTime: number): DungeonEvent[] {
    return this.events.filter(e =>
      e.timestamp >= startTime && e.timestamp <= endTime
    );
  }
}

export interface InsightContext {
  dungeon: Dungeon;
  player: Player;
  query: EventQuery;
  dungeonDuration: number;
  hoveredTime: number | null;
  setHoveredTime: (time: number | null) => void;
}
