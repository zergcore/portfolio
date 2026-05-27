import type { ReactNode } from 'react';

interface MonoCaptionProps {
  prefix?: string;
  children: ReactNode;
  className?: string;
}

export default function MonoCaption({ prefix, children, className }: MonoCaptionProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: 'var(--ink-dim)',
      }}
    >
      {prefix && (
        <span style={{ color: 'var(--ink-faint)', marginRight: '8px' }}>{prefix}</span>
      )}
      {children}
    </span>
  );
}
