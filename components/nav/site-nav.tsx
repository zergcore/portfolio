import Link from 'next/link';
import NavLinks from './nav-links';
import styles from './site-nav.module.css';

export default function SiteNav() {
  return (
    <nav className={styles.nav}>
      <Link href="/v2" className={styles.logo}>
        {'<zr/>'}
      </Link>
      <NavLinks />
    </nav>
  );
}
