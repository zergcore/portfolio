import styles from './Eyebrow.module.css';

interface EyebrowProps {
  num: string;
  title: string;
  rightAction?: { href: string; label: string };
  className?: string;
}

export default function Eyebrow({ num, title, rightAction, className }: EyebrowProps) {
  return (
    <div className={`${styles.eyebrow}${className ? ` ${className}` : ''}`}>
      <span className={styles.num}>§ {num}</span>
      <span className={styles.title}>{title}</span>
      <span className={styles.sep} aria-hidden="true" />
      {rightAction && (
        <a href={rightAction.href} className={styles.action}>
          {rightAction.label}
        </a>
      )}
    </div>
  );
}
