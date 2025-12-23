import { html } from 'https://esm.sh/htm/preact';
import { CombatantBadge, ModifierBadge } from './badges.js';

/**
 * @param {Object} props
 * @param {Dungeon} props.dungeon
 * @param {(dungeon: Dungeon, player: Combatant) => void} props.onPlayerSelect
 */
export function DungeonCard({ dungeon, onPlayerSelect }) {
    return html`
        <div
            style=${{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            borderLeft: `4px solid ${dungeon.completed ? '#10b981' : '#f59e0b'}`
        }}
        >
            <div style=${{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '10px'
        }}>
                <h3 style=${{ color: '#2563eb', margin: 0 }}>${dungeon.name}</h3>
                <span style=${{
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
            background: '#e5e7eb',
            color: '#374151'
        }}>
                    ${dungeon.completed ? '✓ Completed' : 'x Not Completed'}
                </span>
            </div>

            <div style=${{ marginTop: '15px', marginBottom: '10px' }}>
                <p style=${{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
                    Click a player to analyze:
                </p>
                <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    ${dungeon.roster.map(combatant => html`
                        <div
                            key=${combatant.playerId}
                            onClick=${(/** @type {MouseEvent} */ e) => {
                e.stopPropagation();
                onPlayerSelect(dungeon, combatant);
            }}
                            style=${{ cursor: 'pointer' }}
                            onMouseOver=${(/** @type {MouseEvent} */ e) => {
                const target = /** @type {HTMLElement} */ (e.currentTarget);
                target.style.opacity = '0.8';
            }}
                            onMouseOut=${(/** @type {MouseEvent} */ e) => {
                const target = /** @type {HTMLElement} */ (e.currentTarget);
                target.style.opacity = '1';
            }}
                        >
                            <${CombatantBadge} combatant=${combatant} />
                        </div>
                    `)}
                </div>
            </div>

            ${dungeon.modifierIds.length > 0 && html`
                <div style=${{ marginTop: '15px' }}>
                    <div style=${{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                        Modifiers:
                    </div>
                    <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        ${dungeon.modifierIds.map(modId => html`
                            <${ModifierBadge} key=${modId} modId=${modId} />
                        `)}
                    </div>
                </div>
            `}

            <div style=${{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
                <span>Level: ${dungeon.difficulty}</span>
                <span> • </span>
                <span>${new Date(dungeon.startTime).toLocaleString()}</span>
                ${dungeon.endTime && html`
                    <span> • </span>
                    <span>Duration: ${Math.floor((dungeon.endTime - dungeon.startTime) / 60000)}m ${Math.floor(((dungeon.endTime - dungeon.startTime) % 60000) / 1000)}s</span>
                `}
            </div>
        </div>
    `;
}
