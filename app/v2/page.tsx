import AvailabilityPill from '@/components/home/availability-pill';
import HeroHeadline from '@/components/home/hero-headline';
import HeroCta from '@/components/home/hero-cta';
import AboutSection from '@/components/home/about-section';
import WorkPreview from '@/components/home/work-preview';
import ContactSection from '@/components/home/contact-section';
import styles from './hero.module.css';

export default function V2Home() {
  return (
    <main>
      <section className={styles.hero}>
        <AvailabilityPill />

        <div className={styles.heroName}>
          {'— '}
          <span className={styles.heroNameAccent}>Zaidibeth Ramos</span>
          {' · Full-stack engineer · Barquisimeto, VE'}
        </div>

        <HeroHeadline />

        <div className={styles.heroSub}>
          <p className={styles.heroDek}>
            Ten years across <strong>eight companies</strong>
            {' — currently deep in a Ms.C. thesis on applied AI and shipping the personal projects that kept getting bumped for client work. '}
            <span className={styles.heroDekEm}>TypeScript, React, Python, Postgres,</span>
            {' and the patience to make them behave.'}
          </p>

          <div className={styles.heroContext}>
            <span className={styles.contextRow}>{'— currently'}</span>
            <span className={styles.contextRow}>
              <span className={styles.contextValue}>personal projects · open source</span>
            </span>
            <span className={styles.contextRow}>
              <span className={styles.contextValue}>Ms.C. thesis · applied AI</span>
            </span>
            <span className={styles.contextRow} style={{ marginTop: '8px' }}>{'— based in'}</span>
            <span className={styles.contextRow}>
              <span className={styles.contextValue}>Barquisimeto · open to remote</span>
            </span>
          </div>
        </div>

        <HeroCta />
      </section>

      <AboutSection />

      <WorkPreview />

      <ContactSection />
    </main>
  );
}
