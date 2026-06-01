export default function HeroHeadline() {
  return (
    <h1
      style={{
        fontFamily: 'var(--serif)',
        fontWeight: 400,
        fontSize: 'clamp(56px, 10vw, 160px)',
        lineHeight: 0.9,
        letterSpacing: '-0.035em',
        color: 'var(--ink)',
        marginBottom: '48px',
        maxWidth: '1100px',
      }}
    >
      I build the{' '}
      <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>boring</span>
      <br />
      infrastructure that
      <br />
      makes{' '}
      <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>shipping</span>
      {' '}possible.
    </h1>
  );
}
