import { getAllEssays } from '@/lib/content/essays';
import Eyebrow from '@/components/ui/Eyebrow';
import FeaturedEssayCard from './featured-essay-card';
import EssayListItem from './essay-list-item';
import styles from './writing-preview.module.css';

export default async function WritingPreview() {
  const all = await getAllEssays();
  const featured = all[0] ?? null;
  const recent = all.slice(1, 4);

  return (
    <section className={styles.section} id="writing">
      <Eyebrow num="03" title="Writing" rightAction={{ href: '/v2/writing', label: 'All essays →' }} />
      {!featured ? (
        <p className={styles.empty}>— first essay coming soon</p>
      ) : (
        <div className={styles.grid}>
          <FeaturedEssayCard essay={featured} />
          {recent.length > 0 && (
            <div>
              <div className={styles.recentEyebrow}>— Also recent</div>
              <div className={styles.recentList}>
                {recent.map(e => (
                  <EssayListItem key={e.id} essay={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
