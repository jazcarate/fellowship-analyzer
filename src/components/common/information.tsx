interface InformationProps {
    title: string;
}

export function Information({ title }: InformationProps) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: 'var(--offwhite-color)',
                border: '1px solid #d1d5db',
                fontSize: '10px',
                color: '#6b7280',
                cursor: 'help',
                fontWeight: '700',
                fontFamily: 'serif',
                fontStyle: 'italic',
                marginLeft: '4px',
                marginRight: '4px',
                transition: 'all 0.15s ease',
                flexShrink: 0
            }}
            title={title}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = '#e5e7eb';
                el.style.borderColor = '#9ca3af';
                el.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'var(--offwhite-color)';
                el.style.borderColor = '#d1d5db';
                el.style.color = '#6b7280';
            }}
        >
            i
        </span>
    );
}