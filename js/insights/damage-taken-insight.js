/**
 * @typedef {Object} DamageWindow
 * @property {number} startTime - Window start timestamp
 * @property {number} endTime - Window end timestamp
 * @property {number} totalDamage - Total damage in this window
 */

/**
 * @typedef {Object} DamageTakenInsight
 * @property {'damage-taken'} type
 * @property {DamageWindow[]} windows
 * @property {number} peakDamage - Highest damage in any window
 * @property {number} averageDamage - Average damage per window
 * @property {number} totalDamage - Total damage taken
 * @property {number} windowSize - Window size in milliseconds
 */

/**
 * @param {Dungeon} dungeon
 * @param {Combatant} player
 * @param {number} windowSizeMs - Window size in milliseconds (default 1000ms = 1 second)
 * @returns {DamageTakenInsight}
 */
export function analyzeDamageTaken(dungeon, player, windowSizeMs = 1000) {
    const playerId = player.playerId;
    const damageEvents = [];

    // Collect all damage events where player is the target
    for (const event of dungeon.events) {
        if ((event.type === 'SWING_DAMAGE'
            || event.type === 'ABILITY_DAMAGE'
            || event.type === 'ABILITY_PERIODIC_DAMAGE')
            && event.targetPlayerId === playerId) {

            damageEvents.push({
                timestamp: event.timestamp,
                amount: event.amount
            });
        }
    }

    // Sort by timestamp
    damageEvents.sort((a, b) => a.timestamp - b.timestamp);

    if (damageEvents.length === 0) {
        return {
            type: 'damage-taken',
            windows: [],
            peakDamage: 0,
            averageDamage: 0,
            totalDamage: 0,
            windowSize: windowSizeMs
        };
    }

    // Create windows
    const windows = [];
    const startTime = dungeon.startTime;
    const endTime = dungeon.endTime || Date.now();

    let currentWindowStart = startTime;

    while (currentWindowStart < endTime) {
        const windowEnd = currentWindowStart + windowSizeMs;

        // Sum damage in this window
        let windowDamage = 0;
        for (const event of damageEvents) {
            if (event.timestamp >= currentWindowStart && event.timestamp < windowEnd) {
                windowDamage += event.amount;
            }
        }

        if (windowDamage > 0) {
            windows.push({
                startTime: currentWindowStart,
                endTime: windowEnd,
                totalDamage: windowDamage
            });
        }

        currentWindowStart = windowEnd;
    }

    // Calculate statistics
    let totalDamage = 0;
    let peakDamage = 0;

    for (const window of windows) {
        totalDamage += window.totalDamage;
        if (window.totalDamage > peakDamage) {
            peakDamage = window.totalDamage;
        }
    }

    const averageDamage = windows.length > 0 ? totalDamage / windows.length : 0;

    return {
        type: 'damage-taken',
        windows,
        peakDamage,
        averageDamage,
        totalDamage,
        windowSize: windowSizeMs
    };
}
