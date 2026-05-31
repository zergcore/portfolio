import { execSync } from 'child_process';
import Link from 'next/link';
import styles from './footer.module.css';

function getLastUpdated(): string {
  const envDate = process.env.BUILD_DATE;
  if (envDate) return envDate;
  try {
    return execSync('git log -1 --format=%cd --date=format:"%B %Y"', {
      encoding: 'utf8',
    }).trim();
  } catch {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

const NAV_LINKS = [
  { label: 'Work', href: '/v2/work' },
  { label: 'Writing', href: '/v2/writing' },
  { label: 'About', href: '/v2/#about' },
  { label: 'Contact', href: '/v2/contact' },
  { label: '↗ RSS', href: '/feed.xml' },
];

export default function SiteFooter() {
  const lastUpdated = getLastUpdated();

  return (
    <footer className={styles.footer}>
      <div className={styles.colophon}>
        <span className={styles.name}>— Zaidibeth Ramos</span>
        <br />
        {'Built with Next.js 15 · Instrument Serif & Geist · Vercel'}
        <br />
        {'Last updated '}
        <span className={styles.updated}>{lastUpdated}</span>
        {' · '}
        <a
          href="https://github.com/zergcore/portfolio"
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ source on GitHub
        </a>
      </div>

      <nav className={styles.navSecondary}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
