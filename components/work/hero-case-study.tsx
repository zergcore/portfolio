import { getHeroProject } from '@/lib/content/projects';
import { getLocalizedText } from '@/lib/api';
import Marginalia from '@/components/ui/Marginalia';
import styles from './hero-case-study.module.css';

function splitMetric(text: string): { value: string; label: string } {
  // Extract a leading numeric/keyword metric from an outcome string
  const m = text.match(/^([+\-]?\d[\d,.]*[%×x]?|\bpeer\b|\bsolo\b|\bzero\b|\bmillions?\b)\s*[-–—·,]?\s*(.+)/i);
  if (m) return { value: m[1].trim(), label: m[2].replace(/\.$/, '').trim() };
  const words = text.split(' ');
  return { value: words[0], label: words.slice(1).join(' ').replace(/\.$/, '') };
}

export default async function HeroCaseStudy() {
  const project = await getHeroProject();

  const title = getLocalizedText(project.title, 'en');
  const subtitle = project.role ? getLocalizedText(project.role, 'en') : null;
  const problem = project.problem ? getLocalizedText(project.problem, 'en') : null;
  const solutionBody = project.approach?.[0]
    ? getLocalizedText(project.approach[0].body, 'en')
    : null;
  const outcomes = project.outcomes?.en ?? [];
  const skills = project.skills?.map((s) => getLocalizedText(s.name, 'en')) ?? [];
  const year = project.timeline?.match(/^\d{4}/)?.[0] ?? project.timeline ?? '';
  const contextTags = (project.tags ?? []).filter((t) => t !== 'hero');
  const metrics = outcomes.slice(0, 3).map(splitMetric);

  return (
    <article className={styles.heroCase}>
      <div className={styles.heroEyebrow}>
        <span className={styles.marker} aria-hidden="true" />
        <span>
          <span className={styles.featured}>— Hero project</span>
          {' · the one I\'d lead an interview with'}
        </span>
      </div>

      <div className={styles.heroGrid}>
        {/* TEXT COLUMN */}
        <div className={styles.heroText}>
          <h2 className={styles.heroTitle}>
            {title}
            {subtitle && <span className={styles.subtitle}>— {subtitle}</span>}
          </h2>

          <div className={styles.heroContext}>
            {year && (
              <>
                <span className={styles.ctxYear}>{year}</span>
                <span className={styles.ctxSep} aria-hidden="true">·</span>
              </>
            )}
            {contextTags.map((tag, i) => (
              <span key={`${tag}-${i}`}>
                {tag}
                {i < contextTags.length - 1 && (
                  <span className={styles.ctxSep} aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </div>

          {problem && <p className={styles.heroIntro}>{problem}</p>}
          {solutionBody && <p className={styles.heroIntro}>{solutionBody}</p>}

          {metrics.length > 0 && (
            <div className={styles.heroMetrics}>
              {metrics.map((m, i) => (
                <div key={i} className={styles.heroMetric}>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className={styles.metricLabel}>— {m.label}</span>
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div className={styles.heroStack}>
              <span className={styles.stackLabel}>— Stack</span>
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

          <div className={styles.heroLinks}>
            <a
              href={`/work/${project.slug}`}
              className={`${styles.heroLink} ${styles.primary}`}
            >
              Read the case study →
            </a>
            {project.github_url && (
              <a
                href={project.github_url}
                className={styles.heroLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ code
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                className={styles.heroLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ live
              </a>
            )}
          </div>

          <Marginalia>the piece I&apos;d lead an interview with</Marginalia>
        </div>

        {/* DIAGRAM COLUMN — SVG diagram built in [2.3] */}
        <div className={styles.heroDiagram}>
          <div className={styles.diagramCaption}>
            — Architecture diagram ·{' '}
            <span className={styles.diagramEm}>
              SVG diagram coming in the next iteration
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
