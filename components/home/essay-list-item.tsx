import Link from 'next/link';
import type { ApiBlogPost } from '@/lib/api';
import styles from './writing-preview.module.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatListDate(isoDate: string | null): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()} · ${MONTHS[d.getUTCMonth()]} ${day}`;
}

interface Props {
  essay: ApiBlogPost;
}

export default function EssayListItem({ essay }: Props) {
  const title = typeof essay.title === 'string' ? essay.title : essay.title.en;

  return (
    <Link href={`/v2/writing/${essay.slug}`} prefetch className={styles.listItem}>
      <span className={styles.listDate}>{formatListDate(essay.published_at)}</span>
      <span className={styles.listTitle}>{title}</span>
    </Link>
  );
}
