import type { ReactNode } from 'react';
import styles from './Marginalia.module.css';

interface MarginaliaProps {
  children: ReactNode;
  className?: string;
}

export default function Marginalia({ children, className }: MarginaliaProps) {
  return (
    <div className={`${styles.marginalia}${className ? ` ${className}` : ''}`}>
      <span className={styles.arrow} aria-hidden="true" />
      {children}
    </div>
  );
}
