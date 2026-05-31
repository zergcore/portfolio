export default function AvailabilityPill() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ink-dim)',
        marginBottom: '48px',
        paddingTop: '16px',
        borderTop: '1px solid var(--rule)',
        width: 'fit-content',
        paddingRight: '24px',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#4ade80',
          boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span>{'— Open for senior frontend & AI-eng roles'}</span>
      <span style={{ opacity: 0.5 }} aria-hidden="true">·</span>
      <span style={{ color: 'var(--accent)' }}>Q2 2026</span>
    </div>
  );
}
