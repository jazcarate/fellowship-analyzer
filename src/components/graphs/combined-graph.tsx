import type { ComponentChildren } from 'preact';

interface CombinedGraphProps {
  children: ComponentChildren;
}

export function CombinedGraph({ children }: CombinedGraphProps) {
  return (
    <div style={{
      display: 'grid',
      gap: '20px'
    }}>
      {children}
    </div>
  );
}
