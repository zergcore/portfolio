import Link from 'next/link';
import type { ApiBlogPost } from '@/lib/api';
import styles from './writing-preview.module.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatShort(isoDate: string | null): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

interface Props {
  essay: ApiBlogPost;
}

export default function FeaturedEssayCard({ essay }: Props) {
  const title = typeof essay.title === 'string' ? essay.title : essay.title.en;
  const dek = typeof essay.excerpt === 'string' ? essay.excerpt : essay.excerpt.en;
  const tag = essay.tags?.[0];

  return (
    <article className={styles.featured}>
      <div className={styles.featuredEyebrow}>
        <span className={styles.featuredMarker} aria-hidden="true" />
        — Latest essay · {formatShort(essay.published_at)}
      </div>
      <Link href={`/v2/writing/${essay.slug}`} prefetch className={styles.featuredTitle}>
        {title}
      </Link>
      {dek && <p className={styles.featuredDek}>{dek}</p>}
      <div className={styles.featuredMeta}>
        {tag && (
          <>
            <span>{tag}</span>
            <span className={styles.sep}>·</span>
          </>
        )}
        <Link href={`/v2/writing/${essay.slug}`} prefetch className={styles.readLink}>
          read the essay ↗
        </Link>
      </div>
    </article>
  );
}
