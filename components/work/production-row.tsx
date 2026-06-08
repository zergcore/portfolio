import Image from 'next/image';
import type { ApiProject } from '@/lib/api';
import { getLocalizedText } from '@/lib/api';
import { getAllProjects } from '@/lib/content/projects';
import styles from './production-row.module.css';

function splitMetric(text: string): { value: string; label: string } {
  const m = text.match(
    /^([+\-]?\d[\d,.]*[%×x]?|~\d[\d,.]*[%×x]?|\bpeer\b|\bsolo\b|\bzero\b|\bmillions?\b)\s*[-–—·,]?\s*(.+)/i,
  );
  if (m) return { value: m[1].trim(), label: m[2].replace(/\.$/, '').trim() };
  const words = text.split(' ');
  return { value: words[0], label: words.slice(1).join(' ').replace(/\.$/, '') };
}

interface RowProps {
  project: ApiProject;
  index: number;
  flipped: boolean;
}

function ProductionRow({ project, index, flipped }: RowProps) {
  const title = getLocalizedText(project.title, 'en');
  const description = getLocalizedText(project.description, 'en');
  const problem = project.problem ? getLocalizedText(project.problem, 'en') : null;
  const outcomes = project.outcomes?.en ?? [];
  const skills = project.skills?.map((s) => getLocalizedText(s.name, 'en')) ?? [];
  const timeline = project.timeline ?? '';

  // №02, №03, ... — production starts after the hero (index 0 = №02)
  const numTag = `№ ${String(index + 2).padStart(2, '0')}${timeline ? ` · ${timeline}` : ''}`;

  // Use description as dek if no problem, else problem as body and description as dek
  const dek = problem ?? description;
  const body = problem ? description : null;

  // Inline metric pairs from outcomes (up to 2)
  const metrics = outcomes.slice(0, 2).map(splitMetric);

  // Primary image
  const imageSrc =
    project.images?.find((img) => img.is_primary)?.url ?? project.image_url ?? null;

  return (
    <article className={`${styles.prodRow} ${flipped ? styles.flipped : ''}`}>
      <div className={styles.text}>
        <div className={styles.num}>{numTag}</div>

        <h3 className={styles.title}>{title}</h3>

        {dek && <p className={styles.dek}>{dek}</p>}
        {body && <p className={styles.body}>{body}</p>}

        {metrics.length > 0 && (
          <div className={styles.metric}>
            {metrics.map((m, i) => (
              <span key={i}>
                <span className={styles.metricValue}>{m.value}</span>
                <span>{m.label}</span>
                {i < metrics.length - 1 && (
                  <span className={styles.metricSep} aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div className={styles.stack}>
            {skills.map((s, i) => (
              <span key={`${s}-${i}`}>
                <span className={styles.tech}>{s}</span>
                {i < skills.length - 1 && (
                  <span className={styles.techSep} aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className={styles.links}>
          <a href={`/work/${project.slug}`} className={styles.primary}>
            Read the case study →
          </a>
          {project.live_url && (
            <a
              href={project.live_url}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ live
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ code
            </a>
          )}
        </div>
      </div>

      <div className={`${styles.image} ${flipped ? styles.imageFlipped : ''}`}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 1100px) 100vw, 45vw"
            className={styles.img}
          />
        ) : (
          <div className={styles.fallback}>
            <span className={styles.fallbackTitle}>{title}</span>
            <span className={styles.fallbackCaption}>— no image yet</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default async function ProductionRows() {
  const all = await getAllProjects();
  const projects = all
    .filter((p) => p.tier === 'production')
    .sort((a, b) => a.sort_order - b.sort_order);

  if (projects.length === 0) {
    return (
      <div className={styles.section}>
        <p className={styles.empty}>— No production projects yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.eyebrow}>
        <span className={styles.marker} aria-hidden="true" />
        — Production work · two shipped, in daily use
      </div>

      {projects.map((project, i) => (
        <ProductionRow
          key={project.id}
          project={project}
          index={i}
          flipped={i % 2 !== 0}
        />
      ))}
    </div>
  );
}
