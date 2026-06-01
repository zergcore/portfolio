import { getProfile } from '@/lib/content/profile';
import styles from './contact-section.module.css';

export default async function ContactSection() {
  const profile = await getProfile();

  const calendarHref = profile?.meeting_url ?? (profile?.email ? `mailto:${profile.email}` : 'mailto:');
  const emailHref    = profile?.email ? `mailto:${profile.email}` : 'mailto:';
  const linkedinHref = profile?.linkedin_url ?? null;
  const githubHref   = profile?.github_url ?? null;
  const whatsappHref = profile?.whatsapp_number ? `https://wa.me/${profile.whatsapp_number}` : null;

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
        <a href={calendarHref} className={styles.primaryLink}>
          Book a 30-min call →
        </a>
        <span className={styles.linkSep} aria-hidden="true">·</span>
        <a href={emailHref} className={styles.secondaryLink}>↗ email</a>
        {linkedinHref && (
          <>
            <span className={styles.linkSep} aria-hidden="true">·</span>
            <a
              href={linkedinHref}
              className={styles.secondaryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ linkedin
            </a>
          </>
        )}
        {githubHref && (
          <>
            <span className={styles.linkSep} aria-hidden="true">·</span>
            <a
              href={githubHref}
              className={styles.secondaryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ github
            </a>
          </>
        )}
        {whatsappHref && (
          <>
            <span className={styles.linkSep} aria-hidden="true">·</span>
            <a
              href={whatsappHref}
              className={styles.secondaryLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ whatsapp
              <span className={styles.whatsappAnnotation}>(LATAM)</span>
            </a>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <span>— Time zone: UTC−4 · overlap with US / EU mornings</span>
        <span>— No recruiter spam, please · I&rsquo;ll know</span>
      </div>
    </section>
  );
}
