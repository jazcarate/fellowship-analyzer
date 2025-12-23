/**
 * @typedef {Object} ToughnessDataPoint
 * @property {number} timestamp
 * @property {number} amount
 * @property {number} maxAmount
 */

/**
 * @typedef {Object} ToughnessInsight
 * @property {'toughness'} type
 * @property {ToughnessDataPoint[]} dataPoints
 * @property {number} averageToughness
 * @property {number} minToughness
 * @property {number} maxToughness
 */

const TOUGHNESS_RESOURCE_ID = 3;

/**
 * @param {Dungeon} dungeon
 * @param {Combatant} player
 * @returns {ToughnessInsight}
 */
export function analyzeToughness(dungeon, player) {
    const dataPoints = [];
    const playerId = player.playerId;

    for (const event of dungeon.events) {
        if (event.type === 'RESOURCE_CHANGED'
            && event.playerId === playerId
            && event.resourceId === TOUGHNESS_RESOURCE_ID) {

            dataPoints.push({
                timestamp: event.timestamp,
                amount: event.amount,
                maxAmount: event.maxAmount
            });
        }
    }

    // Calculate statistics
    let totalToughness = 0;
    let minToughness = Infinity;
    let maxToughness = -Infinity;

    for (const point of dataPoints) {
        totalToughness += point.amount;
        if (point.amount < minToughness) minToughness = point.amount;
        if (point.amount > maxToughness) maxToughness = point.amount;
    }

    const averageToughness = dataPoints.length > 0 ? totalToughness / dataPoints.length : 0;

    return {
        type: 'toughness',
        dataPoints,
        averageToughness,
        minToughness: minToughness === Infinity ? 0 : minToughness,
        maxToughness: maxToughness === -Infinity ? 0 : maxToughness
    };
}
