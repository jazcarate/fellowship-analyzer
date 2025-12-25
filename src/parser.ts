import type {
  Position,
  AbilityActivatedEvent,
  ResourceChangedEvent,
  DamageEvent,
  DungeonEvent,
  Dungeon
} from './types';
import { getDungeonConfig, getHero } from './constants';

function toArray(param: string | null): number[] {
  return (param || '[]')
    .replace(/[\[\]]/g, '')
    .split(',')
    .filter(s => s.trim())
    .map(s => parseInt(s.trim()));
}

export class LogParser {
  private dungeons: Dungeon[] = [];
  private currentDungeon: Dungeon | null = null;

  parse(logText: string): Dungeon[] {
    let buffer = '';

    for (let i = 0; i < logText.length; i++) {
      const char = logText[i];

      if (char === '\n') {
        this.processLine(buffer);
        buffer = '';
      } else {
        buffer += char;
      }
    }

    if (buffer.trim()) {
      this.processLine(buffer);
    }

    return this.dungeons;
  }

  private processLine(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parts = trimmed.split('|');
    if (parts.length < 2) return;

    const timestamp = new Date(parts[0]!).getTime();
    this.processEvent(timestamp, parts[1]!, parts);
  }

  private processEvent(timestamp: number, type: string, params: string[]): void {
    switch (type) {
      case 'ZONE_CHANGE':
        this.handleZoneChange(timestamp, params);
        return;
      case 'DUNGEON_START':
        this.handleDungeonStart(timestamp, params);
        return;
      case 'DUNGEON_END':
        this.handleDungeonEnd(timestamp, params);
        return;
      case 'COMBATANT_INFO':
        this.handleCombatantInfo(timestamp, params);
        return;
      case 'MAP_CHANGE':
        // TODO Remove after all maps are accounted for
        if (this.currentDungeon && !getDungeonConfig(this.currentDungeon.dungeonId)?.maps[parseInt(params[2]!)]) {
          console.log("MAP_CHANGE", this.currentDungeon, params);
        }
        // Ignore
        return;
    }

    if (!this.currentDungeon) return;

    const dungeonEvent = this.parseDungeonEvent(timestamp, type, params);
    if (dungeonEvent) {
      this.currentDungeon.events.push(dungeonEvent);
    }
  }

  private parseDungeonEvent(timestamp: number, type: string, params: string[]): DungeonEvent | null {
    switch (type) {
      case 'ABILITY_ACTIVATED':
        return this.parseAbilityActivated(timestamp, params);

      case 'RESOURCE_CHANGED':
        return this.parseResourceChanged(timestamp, params);

      case 'SWING_DAMAGE':
      case 'ABILITY_DAMAGE':
      case 'ABILITY_PERIODIC_DAMAGE':
        return this.parseDamage(timestamp, type as 'SWING_DAMAGE' | 'ABILITY_DAMAGE' | 'ABILITY_PERIODIC_DAMAGE', params);

      case 'ABILITY_LIFESTEAL_HEAL':
      case 'DAMAGE_ABSORBED':
      case 'ABILITY_CHANNEL_FAIL':
      case 'ABILITY_CHANNEL_START':
      case 'ABILITY_CHANNEL_SUCCESS':
      case 'ABILITY_CAST_START':
      case 'ABILITY_CAST_SUCCESS':
      case 'ABILITY_CAST_FAIL':
      case 'ABILITY_INTERRUPT':
      case 'ABILITY_PERIODIC_HEAL':
      case 'ABILITY_HEAL':
      case 'ABILITY_DISPEL':
      case 'EFFECT_APPLIED':
      case 'EFFECT_REMOVED':
      case 'EFFECT_REFRESHED':
      case 'UNIT_DEATH':
      case 'ALLY_DEATH':
      case 'RESURRECT':
      case 'UNIT_DESTROYED':
      case 'ENCOUNTER_START':
      case 'ENCOUNTER_END':
      case 'WORLD_MARKER_PLACED':
      case 'WORLD_MARKER_REMOVED':
      case 'MARKER_PLACED':
      case 'MARKER_REMOVED':
        return null;
      default:
        console.warn("Unknown event type: " + type, params);
        return null;
    }
  }

  private handleZoneChange(timestamp: number, params: string[]): void {
    // 2025-12-16T20:35:52.561+01:00|ZONE_CHANGE|"The Stronghold"|17|1|
    if (this.currentDungeon && !this.currentDungeon.completed) {
      this.currentDungeon.endTime = timestamp;
    }

    const dungeonName = params[2]?.replace(/"/g, '') || 'Unknown Dungeon';
    const dungeonId = parseInt(params[3]!);

    if (dungeonId === 17) { //The Stronghold
      this.currentDungeon = null;
      return;
    }

    const difficulty = parseInt(params[4]!) || 0;

    this.currentDungeon = {
      id: `dungeon-${this.dungeons.length}`,
      dungeonId,
      name: dungeonName,
      difficulty,
      modifierIds: [],
      startTime: -1,
      endTime: null,
      completed: false,
      players: [],
      events: [],
      maps: {}
    };

    this.dungeons.push(this.currentDungeon);
  }

  private handleDungeonStart(timestamp: number, params: string[]): void {
    // 2025-12-16T20:06:28.695+01:00|DUNGEON_START|"Silken Hollow"|24|18|[6,4,15,16,21]|0
    const dungeonId = parseInt(params[3]!);

    if (!this.currentDungeon || dungeonId !== this.currentDungeon?.dungeonId) {
      console.warn("Starting a dungeon that never zone changed?");
      return;
    }

    this.currentDungeon.modifierIds = toArray(params[5]!);
    this.currentDungeon.startTime = timestamp;
  }

  private handleDungeonEnd(timestamp: number, _params: string[]): void {
    // 2025-12-16T20:18:21.250+01:00|DUNGEON_END|"Silken Hollow"|24|18|[6,4,15,16,21]|1|708396|402.035706|1|0
    // TODO: Some of these params should tell if the dungeon was completed
    if (this.currentDungeon) {
      this.currentDungeon.endTime = timestamp;
      this.currentDungeon.completed = true;
      this.currentDungeon = null;
    }
  }

  private handleCombatantInfo(_timestamp: number, params: string[]): void {
    // 2025-12-16T20:22:17.416+01:00|COMBATANT_INFO|01K7SS7P909W5SAPVCK4ZTFWM7|Player-1502085872|".Florius"|1|22|154.3|[188401,0,6133,1407,0,0,2202,320,1055,740,674]|[215,217,220,221,222,210,211]|[0,0,0,0,0,240]|[(3934,150,3,2,8,0,0,[(1,108),(2,36),(14,68),(23,158),(26,806)]),(3859,120,2,4,8,0,0,[(1,43),(14,90),(23,110)]),(3861,150,3,2,8,0,0,[(1,96),(2,32),(14,90),(15,110),(26,754)]),(3869,300,6,0,0,3,48,[(1,182),(2,61),(10,27),(15,150),(26,324)]),(3833,150,3,2,8,0,0,[(1,131),(2,44),(10,124),(15,151),(26,937)]),(3847,150,3,2,8,0,0,[(1,60),(2,20),(10,57),(15,69),(26,442)]),(3941,150,3,2,8,0,0,[(1,72),(2,24),(15,83),(23,68),(26,469)]),(3957,150,3,2,8,0,0,[(1,119),(2,40),(15,138),(23,113),(26,859)]),(3962,150,3,2,8,0,0,[(1,84),(2,28),(14,97),(23,79),(26,520)]),(3845,150,3,2,8,0,0,[(1,32),(10,112),(14,20)]),(3953,150,3,2,8,0,0,[(1,32),(14,20),(15,112)]),(1492,120,2,4,8,0,0,[(2,37),(15,77),(23,94)]),(112,120,2,4,8,0,0,[(2,37),(14,120),(23,52)]),(3986,150,3,2,8,0,0,[(1,143),(2,48),(14,135),(15,165)])]|6|[(159,1,1),(46,1,0),(2,1,1),(45,1,0),(40,1,1),(41,1,0),(43,1,1),(5,1,0),(37,1,0),(29,1,0),(36,1,0),(48,1,0),(32,1,0)]|[]
    if (!this.currentDungeon) return;

    const playerId = params[3]!;
    const playerName = params[4]?.replace(/"/g, '') || 'Unknown';
    const isSelf = params[5] === '1';
    const hero = getHero(parseInt(params[6]!));
    const itemLevel = parseFloat(params[7]!) || 0;
    const talents = toArray(params[8]!);

    const existing = this.currentDungeon.players.find(c => c.playerId === playerId);
    if (existing) return;

    this.currentDungeon.players.push({
      playerId,
      playerName,
      isSelf,
      hero,
      itemLevel,
      talents
    });
    this.currentDungeon.players.sort((h1, h2) => h1.hero.order - h2.hero.order);
  }

  private parseAbilityActivated(timestamp: number, params: string[]): AbilityActivatedEvent {
    // 2025-12-16T20:25:59.973+01:00|ABILITY_ACTIVATED|Player-1502085872|".Florius"|977|"Shield Slam"|1|Npc-3743416768-162|"Tundra Stalker"|181006|181006|19173|31557.210938|-908.531250|2.835938|[(3,29815.28,29815.28),(4,84.94,100.00)]
    const playerId = params[2]!;
    const abilityId = parseInt(params[4]!);
    const y = parseFloat(params[12]!);
    const x = parseFloat(params[13]!);

    return {
      timestamp,
      type: 'ABILITY_ACTIVATED',
      playerId,
      abilityId,
      position: { x, y }
    };
  }

  private parseResourceChanged(timestamp: number, params: string[]): ResourceChangedEvent {
    // 2025-12-16T20:25:59.974+01:00|RESOURCE_CHANGED|Player-1502085872|".Florius"|Player-1502085872|".Florius"|3|0.00|29815.28|29815.28|5963.06|0|"-"
    const playerId = params[2]!;
    const resourceId = parseInt(params[6]!);
    const amount = parseFloat(params[7]!);
    const maxAmount = parseFloat(params[9]!);
    const y = parseFloat(params[10]!);
    const x = parseFloat(params[11]!);

    return {
      timestamp,
      type: 'RESOURCE_CHANGED',
      playerId,
      resourceId,
      amount,
      maxAmount,
      position: { x, y }
    };
  }

  private parseDamage(
    timestamp: number,
    type: 'SWING_DAMAGE' | 'ABILITY_DAMAGE' | 'ABILITY_PERIODIC_DAMAGE',
    params: string[]
  ): DamageEvent {
    // 2025-12-16T20:26:07.424+01:00|SWING_DAMAGE           |Player-1502085872|".Florius"|Npc-3612344384-163|"Deceitful Scholar"|978 |"Attack"         |0  |747 |0|-1|0|747 |Physical|Hit|175455|181006|0|31431.734375|4102.023438|0.757812|[]|1122112|1122859|0|31913.015625|4616.414062|3.962873|[]
    // 2025-12-16T20:26:07.888+01:00|ABILITY_DAMAGE         |Player-1502085872|".Florius"|Npc-3612344384-163|"Deceitful Scholar"|985 |"Shield Throw"   |0  |4996|0|-1|0|4996|Physical|Hit|172269|181006|0|31659.281250|4288.632812|1.554688|[(3,23215.89,29621.44),(4,88.29,100.00)]|1117116|1122859|0|31913.015625|4616.414062|4.056623|[]
    // 2025-12-16T20:26:10.161+01:00|ABILITY_PERIODIC_DAMAGE|Player-1502085872|".Florius"|Npc-3651666496-162|"Tundra Stalker"   |1276|"Sweeping Strike"|981|922 |0|-1|0|922 |Physical|Hit|161893|181006|0|32051.695312|4539.734375|2.929688|[(3,15684.34,29555.26),(4,89.45,100.00)]|560946|574035|0|31618.070312|4379.828125|0.351562|[]

    const sourceId = params[2]!;
    const sourceName = params[3]!.replace(/"/g, '');
    const targetId = params[4]!;
    const targetName = params[5]!.replace(/"/g, '');

    const amount = parseInt(params[9]!); // TODO: Is this number mitigated?

    const sourceY = parseFloat(params[19]!);
    const sourceX = parseFloat(params[20]!);
    const targetY = parseFloat(params[26]!);
    const targetX = parseFloat(params[27]!);

    const sourcePosition: Position = { x: sourceX, y: sourceY };
    const targetPosition: Position = { x: targetX, y: targetY };

    return {
      timestamp,
      type,
      sourceId,
      sourceName,
      targetId,
      targetName,
      amount,
      sourcePosition,
      targetPosition
    };
  }
}
