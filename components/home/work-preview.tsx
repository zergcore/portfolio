import Link from 'next/link';
import { getAllProjects } from '@/lib/content/projects';
import Eyebrow from '@/components/ui/Eyebrow';
import WorkPreviewRow from './work-preview-row';
import styles from './work-preview.module.css';

export default async function WorkPreview() {
  const all = await getAllProjects();

  // Featured projects only, sorted by sort_order; index 0 → Hero tier, 1–2 → Production tier
  const rows = all
    .filter((p) => p.is_featured)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 3);

  const totalCount = all.filter((p) => p.is_featured).length;

  return (
    <section className={styles.section} id="work">
      <Eyebrow
        num="02"
        title="Selected Work"
        rightAction={{ href: '/v2/work', label: 'All work →' }}
      />

      <div className={styles.grid}>
        {rows.map((project, i) => (
          <WorkPreviewRow key={project.id} project={project} index={i} />
        ))}
      </div>

      <div className={styles.footer}>
        <Link href="/v2/work" className={styles.viewAll}>
          Read all case studies →
        </Link>
        <span className={styles.footerMeta}>
          — {rows.length} featured above
          {totalCount > rows.length && ` · ${totalCount - rows.length} more in the archive`}
        </span>
      </div>
    </section>
  );
}
