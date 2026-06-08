import Image from 'next/image';
import type { ApiProject } from '@/lib/api';
import { getLocalizedText } from '@/lib/api';
import styles from './project-image.module.css';

export type ProjectImageContext = 'hero' | 'row' | 'archive';

const SIZES: Record<ProjectImageContext, string> = {
  hero: '(max-width: 1100px) 100vw, 50vw',
  row: '(max-width: 900px) 100vw, 50vw',
  archive: '(max-width: 900px) 100vw, 33vw',
};

function getPrimaryImageUrl(project: ApiProject): string | null {
  return (
    project.images?.find((img) => img.is_primary)?.url ??
    project.image_url ??
    null
  );
}

interface Props {
  project: ApiProject;
  context: ProjectImageContext;
  priority?: boolean;
}

export default function ProjectImage({ project, context, priority = false }: Props) {
  const src = getPrimaryImageUrl(project);
  const title = getLocalizedText(project.title, 'en');

  if (!src) {
    return (
      <div className={styles.frame} role="img" aria-label={title}>
        <div className={styles.fallback}>
          <span className={styles.fallbackTitle}>{title}</span>
          <span className={styles.fallbackCaption}>— no image yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <Image
        src={src}
        alt={title}
        fill
        sizes={SIZES[context]}
        priority={priority}
        className={styles.img}
      />
    </div>
  );
}
