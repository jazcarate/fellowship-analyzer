import { html } from 'https://esm.sh/htm/preact';
import { useMemo } from 'https://esm.sh/preact/hooks';
import { analyzeCooldown } from '../insights/cooldown-insight.js';
import { CooldownTimeline } from '../components/cooldown-timeline.js';

/**
 * @param {Object} props
 * @param {Dungeon} props.dungeon
 * @param {Combatant} props.player
 * @param {() => void} props.onBack
 */
export function PlayerAnalysisPage({ dungeon, player, onBack }) {
    const heroColor = player.hero.color;

    // Calculate insights based on hero
    const insights = useMemo(() => {
        const heroId = player.hero?.name;
        const result = [];

        // Helena - Grand Melee
        if (heroId === 'Helena') {
            result.push(
                analyzeCooldown(
                    dungeon,
                    player,
                    1465, // Grand Melee ability ID
                    120, // base cooldown
                    [222], // Master of War talent ID
                    24 // cooldown reduction amount
                )
            );
        }

        return result;
    }, [dungeon, player]);

    const dungeonDuration = dungeon.endTime
        ? (dungeon.endTime - dungeon.startTime) / 1000
        : 0;

    return html`
        <div>
            <div style=${{ marginBottom: '20px' }}>
                <button onClick=${onBack} style=${{ background: '#6b7280' }}>
                    ← Back to Dungeon
                </button>
            </div>

            <div style=${{ marginBottom: '30px' }}>
                <h3 style=${{ margin: '0 0 15px 0', color: '#2563eb', fontSize: '18px' }}>
                    ${dungeon.name} • Level ${dungeon.difficulty}
                </h3>
                <div style=${{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    ${player.hero.icon && html`
                        <img
                            src=${player.hero.icon}
                            alt=${player.hero?.name ?? "Unknown"}
                            style=${{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `3px solid ${heroColor}`
            }}
                        />
                    `}
                    <div>
                        <h2 style=${{ margin: 0, color: heroColor }}>
                            ${player.hero?.name ?? "Unknown"} - ${player.playerName}
                        </h2>
                        <p style=${{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                            Item Level: ${player.itemLevel.toFixed(1)}
                        </p>
                    </div>
                </div>
            </div>

            <div style=${{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
        }}>
                <h3 style=${{ marginTop: 0, marginBottom: '20px' }}>Performance Insights</h3>

                <p>
                    These graphs show when you used your cooldowns and how long you waited to use them again.
                    Grey segments show when the spell was available, yellow segments show when the spell was cooling down.
                    Red segments highlight times when you could have fit a whole extra use of the cooldown.
                </p>

                ${insights.length === 0 && html`
                    <p style=${{ color: '#666' }}>
                        No insights available for ${player.hero?.name ?? 'this hero'}.
                    </p>
                `}

                ${insights.map(insight => html`
                    <${CooldownTimeline}
                        key=${insight.abilityId}
                        insight=${insight}
                        dungeonDuration=${dungeonDuration}
                    />
                `)}
            </div>
        </div>
    `;
}
