import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Selected Work — zergcore.dev',
  description: 'Twelve projects. Three worth defending.',
};

export default function WorkPage() {
  return (
    <main className={styles.main}>
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowNum}>§ 02</span>
        <span className={styles.eyebrowTitle}>Selected Work</span>
        <span className={styles.eyebrowSep} aria-hidden="true" />
        <span className={styles.eyebrowMeta}>
          1 hero · 2 production · 4 archive · all curated by hand
        </span>
      </div>

      <div className={styles.titleRow}>
        <h1 className={styles.headline}>
          Twelve projects.<br />
          Three worth<br />
          <em className={styles.headlineItal}>defending.</em>
        </h1>
        <p className={styles.preamble}>
          Sorted by <strong>how proud I am</strong>, not by date.
          {' '}Below the third, things get smaller —{' '}
          <span className={styles.preambleEm}>deliberately</span>.
        </p>
      </div>

      {/* [2.2]–[2.6]: hero case study, production rows, archive index */}

      <aside className={styles.footnote}>
        <div className={styles.footnoteEyebrow}>— A note on this section</div>
        <p>
          {'I\'d rather show you '}
          <span className={styles.footnoteEm}>three projects I can defend</span>
          {' than twelve I have to apologize for. Everything below the hero is '}
          <em className={styles.footnoteInk}>supporting evidence</em>
          {', not headline work — and I\'d rather you knew which is which.'}
        </p>
      </aside>
    </main>
  );
}
