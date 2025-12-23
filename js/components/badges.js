import { html } from 'https://esm.sh/htm/preact';

/**
 * @param {Object} props
 * @param {Combatant} props.combatant
 */
export function CombatantBadge({ combatant }) {
    const heroColor = combatant.hero?.color ?? '#000';
    const heroIcon = combatant.hero?.icon;

    return html`
        <div
            style=${{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '13px',
                background: `${heroColor}20`,
                border: `1px solid ${heroColor}40`
            }}
        >
            ${heroIcon ? html`
                <img
                    src=${heroIcon}
                    alt=${combatant.hero?.name ?? "Unknown"}
                    style=${{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }}
                />
            ` : html`
                <div style=${{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: heroColor
                }}></div>
            `}
            <span style=${{ fontWeight: 500 }}>${combatant.hero?.name ?? "Unknown"}</span>
            <span style=${{ color: '#666' }}>•</span>
            <span>${combatant.playerName}</span>
            <span style=${{ color: '#666', fontSize: '11px' }}>
                (${combatant.itemLevel.toFixed(1)})
            </span>
            ${combatant.isLeader && html`<span style=${{ color: '#f59e0b' }}>★</span>`}
        </div>
    `;
}

/**
 * @param {Object} props
 * @param {number} props.modId
 */
export function ModifierBadge({ modId }) {
    const modifier = getModifier(modId);
    const name = modifier ? modifier.name : `Modifier ${modId}`;
    const icon = modifier?.icon;

    let tooltip = '';
    if (modifier) {
        tooltip = `${modifier.name}\n\n${modifier.description}`;
        if (modifier.bonus) {
            tooltip += `\n\nBONUS: ${modifier.bonus}`;
        }
    } else {
        tooltip = `Modifier ${modId}`;
    }

    return html`
        <div style=${{ position: 'relative', display: 'inline-block' }}>
            <span
                style=${{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontWeight: 500,
                    cursor: 'help',
                    border: '1px solid #fbbf24'
                }}
                title=${tooltip}
            >
                ${icon && html`
                    <img
                        src=${icon}
                        alt=${name}
                        style=${{
                            width: '16px',
                            height: '16px',
                            borderRadius: '3px',
                            objectFit: 'cover'
                        }}
                    />
                `}
                <span>${name}</span>
            </span>
        </div>
    `;
}
