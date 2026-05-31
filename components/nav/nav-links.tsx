'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './site-nav.module.css';

interface NavLink {
  label: string;
  href: string;
  hideMobile?: true;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/v2' },
  { label: 'Work', href: '/v2/work' },
  { label: 'Writing', href: '/v2/writing' },
  { label: 'Experience', href: '/v2/experience', hideMobile: true },
  { label: 'Credentials', href: '/v2/credentials', hideMobile: true },
  { label: 'Contact', href: '/v2/contact' },
];

export default function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/v2') return pathname === '/v2' || pathname === '/v2/';
    return pathname.startsWith(href);
  }

  return (
    <div className={styles.links}>
      {NAV_LINKS.map(({ label, href, hideMobile }) => (
        <Link
          key={href}
          href={href}
          className={[
            styles.link,
            isActive(href) ? styles.linkActive : '',
            hideMobile ? styles.hideOnMobile : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </Link>
      ))}
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.resume}
      >
        ↗ Resume
      </a>
    </div>
  );
}
