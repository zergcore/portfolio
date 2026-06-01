import type { CSSProperties } from 'react';

type Tier = 'flagship' | 'standard' | 'archive';

interface DiamondMarkerProps {
  tier: Tier;
  className?: string;
}

const tierStyle: Record<Tier, CSSProperties> = {
  flagship: { background: 'var(--accent)' },
  standard: { background: 'var(--ink-dim)' },
  archive:  { background: 'transparent', border: '1px solid var(--ink-faint)' },
};

export default function DiamondMarker({ tier, className }: DiamondMarkerProps) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '7px',
        height: '7px',
        flexShrink: 0,
        transform: 'rotate(45deg)',
        ...tierStyle[tier],
      }}
    />
  );
}
