import { html } from 'https://esm.sh/htm/preact';
import { DungeonCard } from '../components/dungeon-card.js';

/**
 * @param {Object} props
 * @param {Dungeon[]} props.dungeons
 * @param {(dungeon: Dungeon, player: Combatant) => void} props.onPlayerSelect
 */
export function DungeonListPage({ dungeons, onPlayerSelect }) {
    return html`
        <div>
            <h2 style=${{ marginBottom: '15px', marginTop: 0 }}>Dungeons</h2>
            <div style=${{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
                ${dungeons.map(dungeon => html`
                    <${DungeonCard}
                        key=${dungeon.id}
                        dungeon=${dungeon}
                        onPlayerSelect=${onPlayerSelect}
                    />
                `)}
            </div>
        </div>
    `;
}
