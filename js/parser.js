/**
 * @typedef {Object} AbilityActivatedEvent
 * @property {number} timestamp
 * @property {'ABILITY_ACTIVATED'} type
 * @property {string} playerId
 * @property {number} abilityId
 */

/**
 * @typedef {Object} ResourceChangedEvent
 * @property {number} timestamp
 * @property {'RESOURCE_CHANGED'} type
 * @property {string} playerId
 * @property {number} resourceId
 * @property {number} amount
 * @property {number} maxAmount
 */

/**
 * @typedef {Object} DamageEvent
 * @property {number} timestamp
 * @property {'SWING_DAMAGE'|'ABILITY_DAMAGE'|'ABILITY_PERIODIC_DAMAGE'} type
 * @property {string} sourcePlayerId
 * @property {string} targetPlayerId
 * @property {number} amount
 */

/**
 * @typedef {AbilityActivatedEvent | ResourceChangedEvent | DamageEvent} DungeonEvent
 */

/**
 * @typedef {Object} Combatant
 * @property {string} playerId
 * @property {string} playerName
 * @property {boolean} isLeader
 * @property {Hero} hero
 * @property {number} itemLevel
 * @property {number[]} talents
 */

/**
 * @typedef {Object} Dungeon
 * @property {string} id
 * @property {string} name
 * @property {number} difficulty
 * @property {Array<number>} modifierIds
 * @property {number} startTime
 * @property {number|null} endTime
 * @property {boolean} completed
 * @property {Array<Combatant>} roster
 * @property {Array<DungeonEvent>} events
 */

class LogParser {
    constructor() {
        /** @type {Array<Dungeon>} */
        this.dungeons = [];

        /** @type {Dungeon|null} */
        this.currentDungeon = null;
    }

    /**
     * @param {string} logText
     * @returns {Array<Dungeon>}
     */
    parse(logText) {
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

        // Process last line if there's no trailing newline
        if (buffer.trim()) {
            this.processLine(buffer);
        }

        return this.dungeons;
    }

    /**
     * @param {string} line
     */
    processLine(line) {
        const trimmed = line.trim();
        if (!trimmed) return;

        const parts = trimmed.split('|');
        if (parts.length < 2) return;

        const timestamp = new Date(parts[0]).getTime();
        const type = parts[1];
        const params = parts.slice(2);

        this.processEvent(timestamp, type, params);
    }

    /**
     * @param {number} timestamp
     * @param {string} type
     * @param {Array<string>} params
     */
    processEvent(timestamp, type, params) {
        // Handle session-level events
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
        }

        // Handle dungeon events
        if (!this.currentDungeon) return;

        const dungeonEvent = this.parseDungeonEvent(timestamp, type, params);
        if (dungeonEvent) {
            this.currentDungeon.events.push(dungeonEvent);
        }
    }

    /**
     * @param {number} timestamp
     * @param {string} type
     * @param {Array<string>} params
     * @returns {DungeonEvent|null}
     */
    parseDungeonEvent(timestamp, type, params) {
        switch (type) {
            case 'ABILITY_ACTIVATED':
                return this.parseAbilityActivated(timestamp, params);

            case 'RESOURCE_CHANGED':
                return this.parseResourceChanged(timestamp, params);

            case 'SWING_DAMAGE':
            case 'ABILITY_DAMAGE':
            case 'ABILITY_PERIODIC_DAMAGE':
                return this.parseDamage(timestamp, type, params);

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
            case 'UNIT_DESTROYED':
            case 'ENCOUNTER_START':
            case 'ENCOUNTER_END':
            case 'MAP_CHANGE':
            case 'WORLD_MARKER_PLACED':
            case 'WORLD_MARKER_REMOVED':
                // TODO: Add these event types
                return null;
            default:
                console.warn("unknown event type: " + type, params);
                return null;
        }
    }

    /**
     * @param {number} timestamp
     * @param {Array<string>} _params
     */
    handleZoneChange(timestamp, _params) {
        // Zone change ends current dungeon
        if (this.currentDungeon && !this.currentDungeon.completed) {
            this.currentDungeon.endTime = timestamp;
        }
        this.currentDungeon = null;
    }

    /**
     * @param {number} timestamp
     * @param {Array<string>} params
     */
    handleDungeonStart(timestamp, params) {
        // DUNGEON_START - "Silken Hollow"|24|18|[6,4,15,16,21]|0
        const dungeonName = params[0]?.replace(/"/g, '') || 'Unknown Dungeon';
        const difficulty = parseInt(params[2]) || 0; // TODO Leagues

        const modifierIds = toArray(params[3])

        this.currentDungeon = {
            id: `dungeon-${this.dungeons.length}`,
            name: dungeonName,
            difficulty,
            modifierIds,
            startTime: timestamp,
            endTime: null,
            completed: false,
            roster: [],
            events: []
        };

        this.dungeons.push(this.currentDungeon);
    }

    /**
     * @param {number} timestamp
     * @param {Array<string>} _params
     */
    handleDungeonEnd(timestamp, _params) {
        if (this.currentDungeon) {
            this.currentDungeon.endTime = timestamp;
            this.currentDungeon.completed = true;
            this.currentDungeon = null;
        }
    }

    /**
     * @param {number} _timestamp
     * @param {Array<string>} params
     */
    handleCombatantInfo(_timestamp, params) {
        if (!this.currentDungeon) return;

        const playerId = params[1] || '';
        const playerName = params[2]?.replace(/"/g, '') || 'Unknown';
        const isLeader = params[3] === '1';
        const hero = getHero(parseInt(params[4]));
        const itemLevel = parseFloat(params[5]) || 0;
        const talents = toArray(params[7])

        const existing = this.currentDungeon.roster.find(c => c.playerId === playerId);
        if (existing) return;

        this.currentDungeon.roster.push({
            playerId,
            playerName,
            isLeader,
            hero,
            itemLevel,
            talents
        });
        this.currentDungeon.roster.sort((h1, h2) => h1.hero.order - h2.hero.order)
    }

    /**
     * @param {number} timestamp
     * @param {Array<string>} params
     * @returns {AbilityActivatedEvent}
     */
    parseAbilityActivated(timestamp, params) {
        const playerId = params[0] || '';
        const abilityId = parseInt(params[2]);

        return {
            timestamp,
            type: 'ABILITY_ACTIVATED',
            playerId,
            abilityId,
        };
    }

    /**
     * @param {number} timestamp
     * @param {Array<string>} params
     * @returns {ResourceChangedEvent}
     */
    parseResourceChanged(timestamp, params) {
        // RESOURCE_CHANGED format: sourcePlayerId|sourceName|targetPlayerId|targetName|resourceId|amount|maxAmount|...
        const playerId = params[2] || '';
        const resourceId = parseInt(params[4]);
        const amount = parseFloat(params[5]);
        const maxAmount = parseFloat(params[6]);

        return {
            timestamp,
            type: 'RESOURCE_CHANGED',
            playerId,
            resourceId,
            amount,
            maxAmount
        };
    }

    /**
     * @param {number} timestamp
     * @param {'SWING_DAMAGE'|'ABILITY_DAMAGE'|'ABILITY_PERIODIC_DAMAGE'} type
     * @param {Array<string>} params
     * @returns {DamageEvent}
     */
    parseDamage(timestamp, type, params) {
        // Damage format: sourcePlayerId|sourceName|targetPlayerId|targetName|abilityId|abilityName|...|amount|...
        const sourcePlayerId = params[0] || '';
        const targetPlayerId = params[2] || '';

        // For SWING_DAMAGE, amount is at index 7
        // For ABILITY_DAMAGE and ABILITY_PERIODIC_DAMAGE, amount is at index 8
        const amountIndex = type === 'SWING_DAMAGE' ? 7 : 8;
        const amount = parseInt(params[amountIndex]) || 0;

        return {
            timestamp,
            type,
            sourcePlayerId,
            targetPlayerId,
            amount
        };
    }
}


/**
 * @param {string|null} param
 * @returns {number[]}
 */
function toArray(param) {
    return (param || '[]')
        .replace(/[\[\]]/g, '')
        .split(',')
        .filter(s => s.trim())
        .map(s => parseInt(s.trim()));
}