import Image from 'next/image';
import styles from './portrait.module.css';

interface PortraitProps {
  src: string;
}

export default function Portrait({ src }: PortraitProps) {
  return (
    <div className={styles.portrait}>
      <Image
        src={src}
        alt="Zaidibeth Ramos"
        fill
        sizes="(max-width: 1100px) min(480px, 90vw), 40vw"
        style={{ objectFit: 'cover', objectPosition: 'center top' }}
        priority
      />
      <span className={styles.caption}>
        {'— photograph · '}
        <span className={styles.captionAccent}>barquisimeto</span>
        {' · 2026'}
      </span>
    </div>
  );
}
