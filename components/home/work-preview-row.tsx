import Link from 'next/link';
import type { ApiProject } from '@/lib/api';
import styles from './work-preview-row.module.css';

interface Props {
  project: ApiProject;
  /** 0-based index — determines tier label and № display */
  index: number;
}

export default function WorkPreviewRow({ project, index }: Props) {
  const tier = index === 0 ? 'Hero' : 'Production';
  const num = String(index + 1).padStart(2, '0');
  const title = project.title.en;
  const dek = project.description.en;

  // Prefer skill names; fall back to tags if no skills are associated
  const stack =
    project.skills.length > 0
      ? project.skills.map((s) => s.name.en)
      : (project.tags ?? []);

  const metric = project.outcomes?.en?.[0] ?? null;

  return (
    <Link
      href={`/v2/work/${project.slug}`}
      prefetch
      className={styles.row}
    >
      <div className={styles.num}>
        № {num}
        <span className={styles.tier}>— {tier}</span>
      </div>

      <div className={styles.main}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.dek}>{dek}</p>
      </div>

      <div className={styles.stackMetric}>
        {stack.length > 0 && (
          <div className={styles.stack}>
            {stack.map((tech, i) => (
              <span key={tech}>
                {tech}
                {i < stack.length - 1 && (
                  <span className={styles.techSep} aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </div>
        )}
        {metric && <div className={styles.metric}>{metric}</div>}
      </div>

      <span className={styles.arrow} aria-hidden="true">→</span>
    </Link>
  );
}
