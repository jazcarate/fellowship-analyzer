import type { ComponentChildren } from 'preact';

interface InsightCardProps {
  children: ComponentChildren;
}

export function InsightCard({ children }: InsightCardProps) {
  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
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
      margin: '0 0 10px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: '#333'
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
      margin: '0 0 15px 0',
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.5'
    }}>
      {children}
    </p>
  );
};
