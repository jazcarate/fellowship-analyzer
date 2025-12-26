import type { ComponentChildren } from 'preact';

interface InsightCardProps {
  children: ComponentChildren;
}

export function InsightCard({ children }: InsightCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      marginBottom: '20px'
    }}>
      {children}
    </div>
  );
}

interface InsightCardTitleProps {
  children: ComponentChildren;
}

InsightCard.Title = function InsightCardTitle({ children }: InsightCardTitleProps) {
  return (
    <h3 style={{
      fontSize: '18px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      color: 'var(--text-primary)'
    }}>
      {children}
    </h3>
  );
};

interface InsightCardDescriptionProps {
  children: ComponentChildren;
}

InsightCard.Description = function InsightCardDescription({ children }: InsightCardDescriptionProps) {
  return (
    <p style={{
      fontSize: '14px',
      lineHeight: '1.5',
      color: 'var(--text-secondary)',
      margin: '0 0 20px 0'
    }}>
      {children}
    </p>
  );
};
