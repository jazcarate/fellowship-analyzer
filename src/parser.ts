import type {
  Position,
  AbilityActivatedEvent,
  ResourceChangedEvent,
  DamageEvent,
  AllyDeathEvent,
  EffectEvent,
  DispelEvent,
  DungeonEvent,
  Dungeon,
  CastEvent
} from './types';
import { getDungeonConfig } from './constants/maps';
import { getHero } from './constants/heroes';

function toArray(param: string | null): number[] {
  return (param || '[]')
    .replace(/[\[\]]/g, '')
    .split(',')
    .filter(s => s.trim())
    .map(s => parseInt(s.trim()));
}

export function parseLog(logText: string): Dungeon[] {
  const dungeons: Dungeon[] = [];
  let currentDungeon: Dungeon | null = null;

  function processLine(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parts = trimmed.split('|');
    if (parts.length < 2) return;

    const timestamp = new Date(parts[0]!).getTime();
    processEvent(timestamp, parts[1]!, parts);
  }

  function processEvent(timestamp: number, type: string, params: string[]): void {
    switch (type) {
      case 'ZONE_CHANGE':
        handleZoneChange(timestamp, params);
        return;
      case 'DUNGEON_START':
        handleDungeonStart(timestamp, params);
        return;
      case 'DUNGEON_END':
        handleDungeonEnd(timestamp, params);
        return;
      case 'COMBATANT_INFO':
        handleCombatantInfo(timestamp, params);
        return;
      case 'MAP_CHANGE':
        // TODO Remove after all maps are accounted for
        if (currentDungeon && !getDungeonConfig(currentDungeon.dungeonId)?.maps[parseInt(params[2]!)]) {
          console.log("MAP_CHANGE", currentDungeon, params, `${currentDungeon.dungeonId}: {
    name: '${currentDungeon.name}',
    maps: {
      ${params[2]!}: {
        bounds: {
          minX: ${params[6]},
          maxX: ${params[7]},
          minY: ${params[4]},
          maxY: ${params[5]}
        },
        image: '/assets/maps/${currentDungeon.name}-${params[3]}.webp'
      }
    }
          }`);
        }
        // Ignore
        return;
    }

    if (!currentDungeon) return;

    const dungeonEvent = parseDungeonEvent(timestamp, type, params);
    if (dungeonEvent) {
      currentDungeon.events.push(dungeonEvent);
    }
  }

  function parseDungeonEvent(timestamp: number, type: string, params: string[]): DungeonEvent | null {
    if (!currentDungeon || currentDungeon.startTime === -1) return null;

    // Convert to relative seconds
    const relativeSeconds = (timestamp - currentDungeon.startTime) / 1000;

    switch (type) {
      case 'ABILITY_ACTIVATED':
        return parseAbilityActivated(relativeSeconds, params);

      case 'RESOURCE_CHANGED':
        return parseResourceChanged(relativeSeconds, params);

      case 'SWING_DAMAGE':
      case 'ABILITY_DAMAGE':
      case 'ABILITY_PERIODIC_DAMAGE':
        return parseDamage(relativeSeconds, type as 'SWING_DAMAGE' | 'ABILITY_DAMAGE' | 'ABILITY_PERIODIC_DAMAGE', params);

      case 'ALLY_DEATH':
        return parseAllyDeath(relativeSeconds, params);

      case 'EFFECT_APPLIED':
      case 'EFFECT_REFRESHED':
      case 'EFFECT_REMOVED':
        return parseEffect(relativeSeconds, type, params);

      case 'ABILITY_DISPEL':
        return parseDispel(relativeSeconds, params);

      case 'ABILITY_CHANNEL_START':
      case 'ABILITY_CAST_START':
      case 'ABILITY_CAST_SUCCESS':
      case 'ABILITY_CHANNEL_SUCCESS':
      case 'ABILITY_CAST_FAIL':
      case 'ABILITY_CHANNEL_FAIL':
        return parseCastEvent(relativeSeconds, type, params);
      case 'ABILITY_INTERRUPT':
        return null; // Handled by ABILITY_CAST_FAIL and ABILITY_CHANNEL_FAIL

      case 'DAMAGE_ABSORBED':
        return null; // Handled in the parseEffect.

      case 'ABILITY_LIFESTEAL_HEAL':
      case 'ABILITY_PERIODIC_HEAL':
      case 'ABILITY_HEAL':
      case 'UNIT_DEATH':
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

  function handleZoneChange(timestamp: number, params: string[]): void {
    // 2025-12-16T20:35:52.561+01:00|ZONE_CHANGE|"The Stronghold"|17|1|
    if (currentDungeon && currentDungeon.completion === 'not_completed' && currentDungeon.startTime !== -1) {
      // Set endTime to either the last event timestamp or the zone change time
      const lastEventTime = currentDungeon.events.length > 0
        ? currentDungeon.events[currentDungeon.events.length - 1]!.timestamp
        : (timestamp - currentDungeon.startTime) / 1000;
      currentDungeon.endTime = Math.max(lastEventTime, (timestamp - currentDungeon.startTime) / 1000);
    }

    const dungeonName = parseString(params[2]!);
    const dungeonId = parseInt(params[3]!);

    if (dungeonId === 17) { //The Stronghold
      currentDungeon = null;
      return;
    }

    const difficulty = parseInt(params[4]!) || 0;

    currentDungeon = {
      id: `dungeon-${dungeons.length}`,
      dungeonId,
      name: dungeonName,
      difficulty,
      modifierIds: [],
      startTime: -1,
      endTime: 0,
      completion: 'not_completed',
      players: [],
      events: [],
      maps: {}
    };

    dungeons.push(currentDungeon);
  }

  function handleDungeonStart(timestamp: number, params: string[]): void {
    // 2025-12-16T20:06:28.695+01:00|DUNGEON_START|"Silken Hollow"|24|18|[6,4,15,16,21]|0
    const dungeonId = parseInt(params[3]!);

    if (!currentDungeon || dungeonId !== currentDungeon?.dungeonId) {
      console.warn("Starting a dungeon that never zone changed?");
      return;
    }

    currentDungeon.modifierIds = toArray(params[5]!);
    currentDungeon.startTime = timestamp;
  }

  function handleDungeonEnd(timestamp: number, params: string[]): void {
    // 2025-12-16T20:18:21.250+01:00|DUNGEON_END|"Silken Hollow"|24|18|[6,4,15,16,21]|1|708396|402.035706|1|0
    if (currentDungeon && currentDungeon.startTime !== -1) {
      currentDungeon.endTime = parseInt(params[7]!) / 1000;
      currentDungeon.completion = params[6] !== '1' ? 'not_completed'
        : params[9] === '1' ? 'timed'
        : 'completed';
      currentDungeon = null;
    }
  }

  function handleCombatantInfo(_timestamp: number, params: string[]): void {
    // 2025-12-16T20:22:17.416+01:00|COMBATANT_INFO|01K7SS7P909W5SAPVCK4ZTFWM7|Player-1502085872|".Florius"|1|22|154.3|[188401,0,6133,1407,0,0,2202,320,1055,740,674]|[215,217,220,221,222,210,211]|[0,0,0,0,0,240]|[(3934,150,3,2,8,0,0,[(1,108),(2,36),(14,68),(23,158),(26,806)]),(3859,120,2,4,8,0,0,[(1,43),(14,90),(23,110)]),(3861,150,3,2,8,0,0,[(1,96),(2,32),(14,90),(15,110),(26,754)]),(3869,300,6,0,0,3,48,[(1,182),(2,61),(10,27),(15,150),(26,324)]),(3833,150,3,2,8,0,0,[(1,131),(2,44),(10,124),(15,151),(26,937)]),(3847,150,3,2,8,0,0,[(1,60),(2,20),(10,57),(15,69),(26,442)]),(3941,150,3,2,8,0,0,[(1,72),(2,24),(15,83),(23,68),(26,469)]),(3957,150,3,2,8,0,0,[(1,119),(2,40),(15,138),(23,113),(26,859)]),(3962,150,3,2,8,0,0,[(1,84),(2,28),(14,97),(23,79),(26,520)]),(3845,150,3,2,8,0,0,[(1,32),(10,112),(14,20)]),(3953,150,3,2,8,0,0,[(1,32),(14,20),(15,112)]),(1492,120,2,4,8,0,0,[(2,37),(15,77),(23,94)]),(112,120,2,4,8,0,0,[(2,37),(14,120),(23,52)]),(3986,150,3,2,8,0,0,[(1,143),(2,48),(14,135),(15,165)])]|6|[(159,1,1),(46,1,0),(2,1,1),(45,1,0),(40,1,1),(41,1,0),(43,1,1),(5,1,0),(37,1,0),(29,1,0),(36,1,0),(48,1,0),(32,1,0)]|[]
    if (!currentDungeon) return;

    const playerId = params[3]!;
    const playerName = parseString(params[4]!);
    const isSelf = params[5] === '1';
    const hero = getHero(parseInt(params[6]!));
    const itemLevel = parseFloat(params[7]!) || 0;
    const talents = toArray(params[8]!);

    const existing = currentDungeon.players.find(c => c.playerId === playerId);
    if (existing) return;

    currentDungeon.players.push({
      playerId,
      playerName,
      isSelf,
      hero,
      itemLevel,
      talents
    });
    currentDungeon.players.sort((h1, h2) => h1.hero.order - h2.hero.order);
  }

  function parseAbilityActivated(timestamp: number, params: string[]): AbilityActivatedEvent {
    // 2025-12-16T20:25:59.973+01:00|ABILITY_ACTIVATED|Player-1502085872|".Florius"|977|"Shield Slam"|1|Npc-3743416768-162|"Tundra Stalker"|181006|181006|19173|31557.210938|-908.531250|2.835938|[(3,29815.28,29815.28),(4,84.94,100.00)]
    const sourceId = params[2]!;
    const sourceName = parseString(params[3]!);

    const abilityId = parseInt(params[4]!);
    const abilityName = parseString(params[5]!);
    const y = parseFloat(params[12]!);
    const x = parseFloat(params[13]!);

    const sourceCurrentHP = parseInt(params[10]!);;
    const sourceMaxHP = parseInt(params[11]!);

    return {
      timestamp,
      type: 'ABILITY_ACTIVATED',
      abilityId,
      abilityName,
      sourceId,
      sourceName,
      sourcePosition: { x, y },
      sourceCurrentHP,
      sourceMaxHP
    };
  }

  function parseResourceChanged(timestamp: number, params: string[]): ResourceChangedEvent {
    // 2025-12-16T20:25:59.974+01:00|RESOURCE_CHANGED|Player-1502085872|".Florius"|Player-1502085872|".Florius"|3|0.00|29815.28|29815.28|5963.06|0|"-"
    const playerId = params[2]!;
    const resourceId = parseInt(params[6]!);
    const change = parseFloat(params[7]!);
    const amount = parseFloat(params[8]!);
    const maxAmount = parseFloat(params[9]!);

    return {
      timestamp,
      type: 'RESOURCE_CHANGED',
      playerId,
      resourceId,
      change,
      amount,
      maxAmount,
    };
  }

  function parseAllyDeath(timestamp: number, params: string[]): AllyDeathEvent {
    // 2025-12-16T21:56:39.618+01:00|ALLY_DEATH|Player-1775765168|".Florius"|Npc-4044358528-138|"Corrupted Totemic"|644|"Attack"|0|0.500000
    const playerId = params[2]!;

    return {
      timestamp,
      type: 'ALLY_DEATH',
      playerId,
    };
  }

  function parseEffect(timestamp: number, type: 'EFFECT_APPLIED' | 'EFFECT_REMOVED' | 'EFFECT_REFRESHED', params: string[]): EffectEvent {
    // 2025-12-26T20:23:36.271+01:00|EFFECT_REMOVED  |Player-2225604656|".Florius"|Player-2225604656|".Florius"|1282|"Shields Up"|0.000000 |0|BUFF|107198|213045|0|-6977.031250|8139.320312|3.533185|[(3,28879.49,32977.82),(4,91.42,100.00)]|984|"Shields Up"|-1
    // 2025-12-26T20:23:24.245+01:00|EFFECT_APPLIED  |Player-2225604656|".Florius"|Player-2225604656|".Florius"|1282|"Shields Up"|12.000000|1|BUFF|110094|213045|0|-7814.015625|8213.390625|3.830060|[]|984|"Shields Up"|0
    // 2025-12-26T20:24:30.819+01:00|EFFECT_REFRESHED|Player-2225604656|".Florius"|Player-2225604656|".Florius"|1282|"Shields Up"|12.000000|1|BUFF|111024|213045|0|742.546875  |3411.359375|5.126935|[]|984|"Shields Up"|0|Player-2225604656|".Florius"

    // Target is the one that _has_ the event
    const sourceId = params[4]!;
    const sourceName = parseString(params[5]!);
    const effectId = parseInt(params[6]!);
    const effectName = parseString(params[7]!);
    const effectType = params[10]! as 'BUFF' | 'DEBUFF';

    const sourceCurrentHP = parseInt(params[11]!);
    const sourceMaxHP = parseInt(params[12]!);

    const sourceY = parseFloat(params[14]!);
    const sourceX = parseFloat(params[15]!);

    return {
      timestamp,
      type,
      effectId,
      effectName,
      effectType,
      sourceId,
      sourceName,
      sourcePosition: { x: sourceX, y: sourceY },
      sourceCurrentHP,
      sourceMaxHP,
    };
  }

  function parseDispel(timestamp: number, params: string[]): DispelEvent {
    // 2025-12-16T20:27:46.068+01:00|ABILITY_DISPEL|Player-651690720|"b l @"|Player-46662368|"Haugen"|1054|"Cure Ailment"|866|"Shadebloom Poison"|15.561952|DEBUFF

    const sourceId = params[2]!;
    const sourceName = parseString(params[3]!);
    const targetId = params[4]!;
    const targetName = parseString(params[5]!);
    const abilityId = parseInt(params[6]!);
    const effectId = parseInt(params[8]!);

    return {
      timestamp,
      type: 'ABILITY_DISPEL',
      sourceId,
      sourceName,
      targetId,
      targetName,
      abilityId,
      effectId
    };
  }

  function castSubtype(type: CastEvent["type"]): CastEvent["subtype"] {
    switch (type) {
      case 'ABILITY_CHANNEL_START':
      case 'ABILITY_CAST_START':
        return 'start';
      case 'ABILITY_CHANNEL_SUCCESS':
      case 'ABILITY_CAST_SUCCESS':
        return 'success';
      case 'ABILITY_CAST_FAIL':
      case 'ABILITY_CHANNEL_FAIL':
        return 'fail';
    }
  }

  function parseCastEvent(timestamp: number,
    type: 'ABILITY_CAST_SUCCESS' | 'ABILITY_CHANNEL_START' | 'ABILITY_CAST_START' | 'ABILITY_CAST_FAIL' | 'ABILITY_CHANNEL_SUCCESS' | 'ABILITY_CHANNEL_FAIL',
    params: string[]): CastEvent {
    // #|                            0|                      1|                 2|                  3|   4|                    5|  6|                 7|                             8|     9|     10| 11|           12|          13|      14| 15|                           16
    // 0|2025-12-26T16:16:18.948+01:00|ABILITY_CAST_SUCCESS   |Npc-3611820096-163|"Deceitful Scholar"| 731|"Arcane Strike"      |  0|UnrecognizedType-0|"0"                           | 14310|1272382|  0| 31626.343750| 4404.554688|0.343750|[] 
    // 1|2025-12-16T20:22:53.925+01:00|ABILITY_CHANNEL_START  |Npc-3572498480-163|"Deceitful Scholar"| 730|"Rune of Detonation" |  0|UnrecognizedType-0|"0"                           |904297|1122859|  0| 27103.015625| -423.585938|5.478498|[] |                     6.150000
    // 2|2025-12-16T20:22:54.825+01:00|ABILITY_CHANNEL_FAIL   |Npc-3572498480-163|"Deceitful Scholar"| 730|"Rune of Detonation" |  0|UnrecognizedType-0|"0"                           |891676|1122859|  0| 27103.015625| -423.585938|5.478498|[] |"AbilityFailed.CastCancelled"
    // 3|2025-12-16T20:16:50.970+01:00|ABILITY_CHANNEL_SUCCESS|Player-1070073328 |"Devilimp"         |1027|"Freezing Torrent"   |  1|Npc-3926917136-92 |"Vexira, Mother of Nightmares"| 91239|  91239|  0| 40371.304688|-6050.046875|0.882812|[] 
    // 4|2025-12-16T20:06:29.998+01:00|ABILITY_CAST_START     |Player-4208985616 |".Florius"         |1795|"Mount Haunted Broom"|  0|UnrecognizedType-0|"0"                           |171466| 171466|  0|-13861.453125| 3084.789062|5.072248|[] |                     1.500000
    // 5|2025-12-16T20:07:08.143+01:00|ABILITY_CAST_FAIL      |Npc-2333606560-132|"Bully Basher"     | 626|"Together Stronk!"   |  0|UnrecognizedType-0|"0"                           |347921| 827910|  0|-12983.156250|-2998.523438|3.939435|[] |"AbilityFailed.CastCancelled"

    const sourceId = params[2]!;
    const sourceName = parseString(params[3]!);
    const abilityId = parseInt(params[4]!);
    const abilityName = parseString(params[5]!);
    const sourceCurrentHP = parseInt(params[9]!);
    const sourceMaxHP = parseInt(params[10]!);
    const y = parseFloat(params[12]!);
    const x = parseFloat(params[13]!);

    return {
      timestamp,
      type,
      subtype: castSubtype(type),
      abilityId,
      abilityName,
      sourceId,
      sourceName,
      sourcePosition: { x, y },
      sourceCurrentHP,
      sourceMaxHP
    };
  }

  function parseDamage(
    timestamp: number,
    type: 'SWING_DAMAGE' | 'ABILITY_DAMAGE' | 'ABILITY_PERIODIC_DAMAGE',
    params: string[]
  ): DamageEvent {
    // 2025-12-16T20:26:07.424+01:00|SWING_DAMAGE           |Player-1502085872|".Florius"|Npc-3612344384-163|"Deceitful Scholar"|978 |"Attack"         |0  |747 |0|-1|0|747 |Physical|Hit|175455|181006|0|31431.734375|4102.023438|0.757812|[]|1122112|1122859|0|31913.015625|4616.414062|3.962873|[]
    // 2025-12-16T20:26:07.888+01:00|ABILITY_DAMAGE         |Player-1502085872|".Florius"|Npc-3612344384-163|"Deceitful Scholar"|985 |"Shield Throw"   |0  |4996|0|-1|0|4996|Physical|Hit|172269|181006|0|31659.281250|4288.632812|1.554688|[(3,23215.89,29621.44),(4,88.29,100.00)]|1117116|1122859|0|31913.015625|4616.414062|4.056623|[]
    // 2025-12-16T20:26:10.161+01:00|ABILITY_PERIODIC_DAMAGE|Player-1502085872|".Florius"|Npc-3651666496-162|"Tundra Stalker"   |1276|"Sweeping Strike"|981|922 |0|-1|0|922 |Physical|Hit|161893|181006|0|32051.695312|4539.734375|2.929688|[(3,15684.34,29555.26),(4,89.45,100.00)]|560946|574035|0|31618.070312|4379.828125|0.351562|[]

    const sourceId = params[2]!;
    const sourceName = parseString(params[3]!);
    const targetId = params[4]!;
    const targetName = parseString(params[5]!);

    const abilityId = parseInt(params[type === 'ABILITY_PERIODIC_DAMAGE' ? 8 : 6]!);
    const abilityName = parseString(params[7]!);

    const amount = parseInt(params[9]!);
    //const absorbed = parseInt(params[10]!);
    //const blocked = parseInt(params[12]!); // TODO Maybe?
    const amountUnmitigated = parseInt(params[13]!);

    const sourceY = parseFloat(params[19]!);
    const sourceX = parseFloat(params[20]!);
    const targetY = parseFloat(params[26]!);
    const targetX = parseFloat(params[27]!);

    const sourcePosition: Position = { x: sourceX, y: sourceY };
    const targetPosition: Position = { x: targetX, y: targetY };

    const sourceCurrentHP = parseInt(params[16]!);
    const sourceMaxHP = parseInt(params[17]!);
    const targetCurrentHP = parseInt(params[23]!);
    const targetMaxHP = parseInt(params[24]!);

    const event: DamageEvent = {
      timestamp,
      type,
      sourceId,
      sourceName,
      targetId,
      targetName,
      amount,
      amountUnmitigated,
      sourcePosition,
      targetPosition,
      abilityId,
      abilityName,
      sourceCurrentHP,
      sourceMaxHP,
      targetCurrentHP,
      targetMaxHP
    };

    return event;
  }

  // Main parsing loop
  let buffer = '';
  for (let i = 0; i < logText.length; i++) {
    const char = logText[i];

    if (char === '\n') {
      processLine(buffer);
      buffer = '';
    } else {
      buffer += char;
    }
  }

  if (buffer.trim()) {
    processLine(buffer);
  }

  // Finalize any incomplete dungeon by setting endTime to the last event timestamp
  if (dungeons.length > 0) {
    const finalDungeon = dungeons[dungeons.length - 1]!;
    if (finalDungeon.startTime !== -1 && finalDungeon.events.length > 0) {
      const lastEventTime = finalDungeon.events[finalDungeon.events.length - 1]!.timestamp;
      finalDungeon.endTime = Math.max(finalDungeon.endTime, lastEventTime);
    }
  }

  return dungeons;
}

function parseString(s: string): string {
  return s.replace(/"/g, '');
}