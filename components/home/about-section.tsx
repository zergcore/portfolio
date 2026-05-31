import Link from 'next/link';
import Eyebrow from '@/components/ui/Eyebrow';
import Portrait from './portrait';
import { getProfile } from '@/lib/api';
import styles from './about-section.module.css';

export default async function AboutSection() {
  const profile = await getProfile();
  const portraitSrc = profile?.imageUrl ?? '/zr.jpg';

  return (
    <section className={styles.section} id="about">
      <Eyebrow num="01" title="About" />

      <div className={styles.grid}>
        <Portrait src={portraitSrc} />

        <div>
          <h2 className={styles.title}>
            Engineering<br />
            that <em className={styles.titleItal}>holds up.</em>
          </h2>

          <p className={styles.body}>
            I&apos;m a full-stack engineer who sits where the{' '}
            <strong className={styles.bodyStrong}>backend reliability</strong>{' '}
            conversation meets the{' '}
            <strong className={styles.bodyStrong}>product surface</strong>.
            I write TypeScript and Python during the day, annotate code-generation
            outputs for an LLM lab at night, and spend the weekends on a Ms.C.
            thesis in applied AI.
          </p>

          <p className={styles.body}>
            <em className={styles.bodyItal}>What I care about:</em>{' '}
            data architectures that don&apos;t lie under load, frontend code
            that ages well, and the unglamorous infrastructure decisions that
            keep systems shipping for years after the launch screenshot.
          </p>

          <div className={styles.stat}>
            <span className={styles.statNum}>6+</span>
            <span className={styles.statLabel}>
              — years shipping production
              <span className={styles.statLabelAccent}>
                across 8 companies, 4 industries, 3 countries
              </span>
            </span>
          </div>

          <div className={styles.meta}>
            <span className={styles.metaRow}>
              <span className={styles.metaLabel}>— based in</span>
              <span className={styles.metaValue}>Barquisimeto, Venezuela · UTC-4</span>
            </span>
            <span className={styles.metaRow}>
              <span className={styles.metaLabel}>— working</span>
              <span className={styles.metaValue}>remote · contract or full-time</span>
            </span>
            <span className={styles.metaRow}>
              <span className={styles.metaLabel}>— languages</span>
              <span className={styles.metaValue}>Spanish (native), English (C1)</span>
            </span>
          </div>

          <Link href="/v2/experience" className={styles.cta}>
            Read the full track record
            <span className={styles.ctaArrow} aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
