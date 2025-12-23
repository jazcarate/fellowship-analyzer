import { html } from 'https://esm.sh/htm/preact';

/**
 * @param {Object} props
 * @param {import('../insights/cooldown-insight.js').CooldownInsight} props.insight
 * @param {number} props.dungeonDuration - in seconds
 */
export function CooldownTimeline({ insight, dungeonDuration }) {
    const metric = insight; // Alias for backwards compatibility during refactor
    const getColor = (/** @type {'available'|'cooldown'|'wasted'} */ type) => {
        switch (type) {
            case 'available': return '#9ca3af';
            case 'cooldown': return '#fbbf24';
            case 'wasted': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const getLabel = (/** @type {'available'|'cooldown'|'wasted'} */ type) => {
        switch (type) {
            case 'available': return 'Available';
            case 'cooldown': return 'Cooldown';
            case 'wasted': return 'Wasted (could have used earlier)';
            default: return type;
        }
    };

    const formatTime = (/** @type {number} */ seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const scoreColor = metric.score >= 80 ? '#10b981' : metric.score >= 60 ? '#fbbf24' : '#ef4444';
    const ability = getAbility(metric.abilityId);

    return html`
        <div style=${{ marginBottom: '30px' }}>
            <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style=${{ margin: 0 }}>
                    <img src=${ability.icon} alt=${ability.name}
                        style=${{ width: '24px', height: '24', borderRadius: '25%', border: `3px solid` }}/>
                    ${ability.name}
                </h3>
                <div style=${{
            fontSize: '24px',
            fontWeight: 'bold',
            color: scoreColor,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
                    <span>${metric.score}/100</span>
                    <span style=${{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
                        (${metric.actualUses}/${metric.totalPossibleUses} uses)
                    </span>
                </div>
            </div>

            <div style=${{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <p style=${{ margin: '5px 0' }}>
                    Cooldown: ${metric.actualCooldown}s
                    ${metric.actualCooldown !== metric.baseCooldown && html`
                        <span style=${{ color: '#10b981' }}> (reduced from ${metric.baseCooldown}s)</span>
                    `}
                </p>
                ${metric.wastedTime > 0 && html`
                    <p style=${{ margin: '5px 0', color: '#ef4444' }}>
                        Wasted time: ${formatTime(metric.wastedTime)}
                        (${Math.floor(metric.wastedTime / metric.actualCooldown)} missed uses)
                    </p>
                `}
            </div>

            <!-- Timeline visualization -->
            <div style=${{
            position: 'relative',
            height: '40px',
            background: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '15px'
        }}>
                ${metric.timeline.map((window, idx) => {
            const widthPercent = ((window.end - window.start) / dungeonDuration) * 100;
            const leftPercent = (window.start / dungeonDuration) * 100;

            return html`
                        <div
                            key=${idx}
                            title="${getLabel(window.type)}: ${formatTime(window.start)} - ${formatTime(window.end)}"
                            style=${{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    height: '100%',
                    background: getColor(window.type),
                    cursor: 'help',
                    transition: 'opacity 0.2s'
                }}
                            onMouseOver=${(/** @type {MouseEvent} */ e) => {
                    const target = /** @type {HTMLElement} */ (e.currentTarget);
                    target.style.opacity = '0.8';
                }}
                            onMouseOut=${(/** @type {MouseEvent} */ e) => {
                    const target = /** @type {HTMLElement} */ (e.currentTarget);
                    target.style.opacity = '1';
                }}
                        ></div>
                    `;
        })}
            </div>

            <!-- Legend -->
            <div style=${{ display: 'flex', gap: '20px', fontSize: '12px', color: '#666' }}>
                <div style=${{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style=${{ width: '16px', height: '16px', background: '#9ca3af', borderRadius: '2px' }}></div>
                    <span>Available</span>
                </div>
                <div style=${{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style=${{ width: '16px', height: '16px', background: '#fbbf24', borderRadius: '2px' }}></div>
                    <span>Cooldown</span>
                </div>
                <div style=${{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style=${{ width: '16px', height: '16px', background: '#ef4444', borderRadius: '2px' }}></div>
                    <span>Wasted</span>
                </div>
            </div>

            <!-- Usage timeline marks -->
            ${metric.usages.length > 0 && html`
                <div style=${{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                    <p style=${{ marginBottom: '8px', fontWeight: '500' }}>Ability Uses:</p>
                    <div style=${{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        ${metric.usages.map((usage, idx) => {
            const relativeTime = (usage.timestamp - metric.usages[0].timestamp) / 1000;
            return html`
                                <span
                                    key=${idx}
                                    style=${{
                    padding: '4px 8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    fontSize: '11px'
                }}
                                >
                                    ${idx === 0 ? '0:00' : formatTime(relativeTime)}
                                </span>
                            `;
        })}
                    </div>
                </div>
            `}
        </div>
    `;
}
