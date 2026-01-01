interface DamageNumberProps {
  damage: number;
}

export function DamageNumber({ damage }: DamageNumberProps) {
  const formatDamage = (value: number): string => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}m`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return <span>{formatDamage(damage)}</span>;
}
