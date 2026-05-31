import styles from './hero-cta.module.css';

export default function HeroCta() {
  return (
    <div>
      <a href="#work" className={styles.cta}>
        See selected work
        <span className={styles.arrow} aria-hidden="true">→</span>
      </a>
      <span className={styles.meta}>
        {'— 3 case studies · 6 essays'}
        <span className={styles.sep} aria-hidden="true">·</span>
        {'or grab the '}
        <a
          href="/resume.pdf"
          className={styles.resumeLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ resume PDF
        </a>
      </span>
    </div>
  );
}
