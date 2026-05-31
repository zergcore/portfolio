import styles from './contact-section.module.css';

export default function ContactSection() {
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL ?? 'mailto:';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '1234567890';

  const emailHref = contactEmail ? `mailto:${contactEmail}` : 'mailto:';

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowNum}>§ 04</span>
        <span>Contact</span>
        <span className={styles.eyebrowSep} aria-hidden="true" />
        <span className={styles.eyebrowMeta}>— replies in &lt; 24h on weekdays</span>
      </div>

      <h2 className={styles.headline}>
        If any of this is{' '}
        <span className={styles.headlineEm}>useful to you,</span>
        <br />
        the door&rsquo;s open.
      </h2>

      <p className={styles.dek}>
        I&rsquo;m picky about projects but generous with conversations.
        Open to staff-level frontend, AI-eng, or anything where the architectural
        decisions actually matter. Quickest path is the booking link below.
      </p>

      <div className={styles.links}>
        <a href={calendarUrl} className={styles.primaryLink}>
          Book a 30-min call →
        </a>
        <span className={styles.linkSep} aria-hidden="true">·</span>
        <a href={emailHref} className={styles.secondaryLink}>↗ email</a>
        <span className={styles.linkSep} aria-hidden="true">·</span>
        <a
          href="https://linkedin.com/in/zaidibethramos"
          className={styles.secondaryLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ linkedin
        </a>
        <span className={styles.linkSep} aria-hidden="true">·</span>
        <a
          href="https://github.com/zergcore"
          className={styles.secondaryLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ github
        </a>
        <span className={styles.linkSep} aria-hidden="true">·</span>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          className={styles.secondaryLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ whatsapp
          <span className={styles.whatsappAnnotation}>(LATAM)</span>
        </a>
      </div>

      <div className={styles.footer}>
        <span>— Time zone: UTC−4 · overlap with US / EU mornings</span>
        <span>— No recruiter spam, please · I&rsquo;ll know</span>
      </div>
    </section>
  );
}
