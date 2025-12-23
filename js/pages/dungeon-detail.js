import { html } from 'https://esm.sh/htm/preact';
import { CombatantBadge } from '../components/badges.js';

/**
 * @param {Object} props
 * @param {Dungeon} props.dungeon
 * @param {(player: Combatant) => void} props.onPlayerSelect
 * @param {() => void} props.onBack
 */
export function DungeonDetailPage({ dungeon, onPlayerSelect, onBack }) {
    return html`
        <div>
            <div style=${{ marginBottom: '20px' }}>
                <button onClick=${onBack} style=${{ background: '#6b7280' }}>
                    ← Back to Dungeons
                </button>
            </div>

            <h2 style=${{ marginBottom: '15px' }}>${dungeon.name}</h2>

            <div style=${{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                marginBottom: '20px'
            }}>
                <h3 style=${{ marginTop: 0, marginBottom: '15px' }}>Select Player to Analyze</h3>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    ${dungeon.roster.map(player => html`
                        <div
                            key=${player.playerId}
                            onClick=${() => onPlayerSelect(player)}
                            style=${{
                                padding: '10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb'
                            }}
                            onMouseOver=${(/** @type {MouseEvent} */ e) => {
                                const target = /** @type {HTMLElement} */ (e.currentTarget);
                                target.style.background = '#f3f4f6';
                            }}
                            onMouseOut=${(/** @type {MouseEvent} */ e) => {
                                const target = /** @type {HTMLElement} */ (e.currentTarget);
                                target.style.background = '#f9fafb';
                            }}
                        >
                            <${CombatantBadge} combatant=${player} />
                        </div>
                    `)}
                </div>
            </div>

            <div style=${{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
            }}>
                <h3 style=${{ marginTop: 0 }}>Dungeon Overview</h3>
                <div style=${{ fontSize: '14px', color: '#666' }}>
                    <p>Level: ${dungeon.difficulty}</p>
                    <p>Status: ${dungeon.completed ? 'Completed' : 'Not Completed'}</p>
                    ${dungeon.endTime && html`
                        <p>Duration: ${Math.floor((dungeon.endTime - dungeon.startTime) / 60000)}m ${Math.floor(((dungeon.endTime - dungeon.startTime) % 60000) / 1000)}s</p>
                    `}
                </div>
            </div>
        </div>
    `;
}
