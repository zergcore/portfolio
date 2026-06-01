interface SectionRuleProps {
  label?: string;
  className?: string;
}

export default function SectionRule({ label, className }: SectionRuleProps) {
  if (!label) {
    return (
      <div
        className={className}
        role="separator"
        style={{ height: '1px', background: 'var(--rule)', width: '100%' }}
      />
    );
  }

  return (
    <div
      className={className}
      role="separator"
      style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
    >
      <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
    </div>
  );
}
