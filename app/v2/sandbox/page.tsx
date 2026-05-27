import Eyebrow from '@/components/ui/Eyebrow';
import Marginalia from '@/components/ui/Marginalia';
import DiamondMarker from '@/components/ui/DiamondMarker';
import MonoCaption from '@/components/ui/MonoCaption';
import SectionRule from '@/components/ui/SectionRule';

export default function SandboxPage() {
  return (
    <main
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 48px 120px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
          marginBottom: '64px',
        }}
      >
        — UI Primitives Sandbox · [0.3]
      </p>

      {/* ── Eyebrow ── */}
      <section style={{ marginBottom: '64px' }}>
        <p style={labelStyle}>— Eyebrow</p>
        <Eyebrow
          num="02"
          title="Selected Work"
          rightAction={{ href: '/work', label: 'All work →' }}
        />
        <div style={{ marginTop: '16px' }}>
          <Eyebrow num="05" title="Credentials" />
        </div>
      </section>

      <div style={{ marginBottom: '64px' }}><SectionRule /></div>

      {/* ── Marginalia ── */}
      <section style={{ marginBottom: '64px', position: 'relative', minHeight: '80px' }}>
        <p style={labelStyle}>— Marginalia (visible above 1100px, right of the title)</p>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
          }}
        >
          Hierarchical ACO-Firefly Hybridization
        </p>
        <Marginalia>the piece I&apos;d lead an interview with</Marginalia>
      </section>

      <div style={{ marginBottom: '64px' }}><SectionRule /></div>

      {/* ── DiamondMarker ── */}
      <section style={{ marginBottom: '64px' }}>
        <p style={labelStyle}>— Diamond Markers</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {(['flagship', 'standard', 'archive'] as const).map((tier) => (
            <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DiamondMarker tier={tier} />
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                }}
              >
                {tier}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginBottom: '64px' }}><SectionRule /></div>

      {/* ── MonoCaption ── */}
      <section style={{ marginBottom: '64px' }}>
        <p style={labelStyle}>— Mono Caption</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MonoCaption prefix="—">Tier 01 · 5 months</MonoCaption>
          <MonoCaption>2024 · Q3</MonoCaption>
          <MonoCaption prefix="→">Next.js · TypeScript · Postgres</MonoCaption>
        </div>
      </section>

      <div style={{ marginBottom: '64px' }}><SectionRule /></div>

      {/* ── SectionRule ── */}
      <section style={{ marginBottom: '64px' }}>
        <p style={labelStyle}>— Section Rule</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SectionRule />
          <SectionRule label="or" />
          <SectionRule label="§ archive" />
        </div>
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '10px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--ink-faint)',
  marginBottom: '20px',
};
