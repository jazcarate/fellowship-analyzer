/**
 * @typedef {Object} CooldownUsage
 * @property {number} timestamp
 * @property {number} nextAvailable - When the ability will be available again
 */

/**
 * @typedef {Object} CooldownWindow
 * @property {number} start
 * @property {number} end
 * @property {'available'|'cooldown'|'wasted'} type
 */

/**
 * @typedef {Object} CooldownInsight
 * @property {'cooldown'} type
 * @property {number} abilityId
 * @property {number} baseCooldown - Base cooldown in seconds
 * @property {number} actualCooldown - Actual cooldown considering talents
 * @property {CooldownUsage[]} usages
 * @property {number} totalPossibleUses
 * @property {number} actualUses
 * @property {number} wastedTime - Total time wasted in seconds
 * @property {CooldownWindow[]} timeline
 * @property {number} score - 0-100 score
 */

/**
 * @param {Dungeon} dungeon
 * @param {Combatant} player
 * @param {number} abilityId
 * @param {number} baseCooldown - in seconds
 * @param {number[]} cooldownReductionTalents - talent IDs that reduce cooldown
 * @param {number} cooldownReduction - amount of reduction in seconds
 * @returns {CooldownInsight}
 */
export function analyzeCooldown(
    dungeon,
    player,
    abilityId,
    baseCooldown,
    cooldownReductionTalents = [],
    cooldownReduction = 0
) {
    // Check if player has cooldown reduction talent
    const hasCooldownReduction = cooldownReductionTalents.some(talentId =>
        player.talents?.includes(talentId)
    );

    const actualCooldown = hasCooldownReduction
        ? baseCooldown - cooldownReduction
        : baseCooldown;

    // Find all ability activations for this player
    const usages = [];
    const playerId = player.playerId;

    for (const event of dungeon.events) {
        if (event.type === 'ABILITY_ACTIVATED') {
            const eventPlayerId = event.playerId;
            const eventAbilityId = event.abilityId;

            if (eventPlayerId === playerId && eventAbilityId === abilityId) {
                usages.push({
                    timestamp: event.timestamp,
                    nextAvailable: event.timestamp + actualCooldown * 1000
                });
            }
        }
    }

    // Calculate timeline windows
    const timeline = /** @type {CooldownWindow[]} */([]);
    const dungeonStart = dungeon.startTime;
    const dungeonEnd = dungeon.endTime || Date.now();
    const dungeonDuration = (dungeonEnd - dungeonStart) / 1000; // in seconds

    if (usages.length === 0) {
        // No usages - entire dungeon was wasted opportunity
        timeline.push({
            start: 0,
            end: dungeonDuration,
            type: 'wasted'
        });
    } else {
        let currentTime = 0;

        for (let i = 0; i < usages.length; i++) {
            const usage = usages[i];
            const usageTime = (usage.timestamp - dungeonStart) / 1000;
            const nextAvailableTime = (usage.nextAvailable - dungeonStart) / 1000;

            // Available window before this usage
            if (usageTime > currentTime) {
                const availableWindow = usageTime - currentTime;
                if (availableWindow >= actualCooldown) {
                    // Wasted time - could have used it earlier
                    timeline.push({
                        start: currentTime,
                        end: usageTime - actualCooldown,
                        type: 'wasted'
                    });
                    timeline.push({
                        start: usageTime - actualCooldown,
                        end: usageTime,
                        type: 'available'
                    });
                } else {
                    timeline.push({
                        start: currentTime,
                        end: usageTime,
                        type: 'available'
                    });
                }
            }

            // Cooldown window after usage
            const cooldownEnd = Math.min(nextAvailableTime, dungeonDuration);
            if (cooldownEnd > usageTime) {
                timeline.push({
                    start: usageTime,
                    end: cooldownEnd,
                    type: 'cooldown'
                });
            }

            currentTime = cooldownEnd;
        }

        // Handle remaining time after last usage
        if (currentTime < dungeonDuration) {
            const remainingTime = dungeonDuration - currentTime;
            if (remainingTime >= actualCooldown) {
                // Could have fit another use
                timeline.push({
                    start: currentTime,
                    end: dungeonDuration - actualCooldown,
                    type: 'wasted'
                });
                timeline.push({
                    start: dungeonDuration - actualCooldown,
                    end: dungeonDuration,
                    type: 'available'
                });
            } else {
                timeline.push({
                    start: currentTime,
                    end: dungeonDuration,
                    type: 'available'
                });
            }
        }
    }

    // Calculate wasted time
    const wastedTime = timeline
        .filter(w => w.type === 'wasted')
        .reduce((sum, w) => sum + (w.end - w.start), 0);

    // Calculate possible uses
    const totalPossibleUses = Math.floor(dungeonDuration / actualCooldown) + 1;
    const actualUses = usages.length;

    // Calculate score (0-100)
    const usageRatio = totalPossibleUses > 0 ? actualUses / totalPossibleUses : 0;
    const score = Math.round(usageRatio * 100);

    return {
        type: 'cooldown',
        abilityId,
        baseCooldown,
        actualCooldown,
        usages,
        totalPossibleUses,
        actualUses,
        wastedTime,
        timeline,
        score
    };
}
