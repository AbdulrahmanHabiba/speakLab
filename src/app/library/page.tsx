import Link from 'next/link';
import { getBooklets } from '@/lib/db';
import { booklets as fallbackBooklets } from '@/lib/booklets';
import { ArrowRight, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Library() {
  let list = fallbackBooklets;
  try {
    const dbBooklets = await getBooklets();
    if (dbBooklets && dbBooklets.length > 0) {
      list = dbBooklets.map((b) => ({
        slug: b.slug,
        track: b.track,
        title: b.title,
        subtitle: b.subtitle,
        level: b.level,
        accent: b.accent,
        image: b.image,
        lessons: b.lessons.map((l) => ({
          slug: l.slug,
          title: l.title,
          minutes: l.minutes,
          blocks: l.blocks.map((bl) => ({
            type: bl.type as any,
            title: bl.title ?? undefined,
            text: bl.text,
            items: bl.items,
            image: bl.image ?? undefined,
            source: bl.source ?? undefined,
          })),
        })),
      }));
    }
  } catch (err) {
    console.error('Failed to fetch booklets from Prisma, using fallback:', err);
  }

  return (
    <div className="reading-layout">
      <span className="overline">YOUR STUDY LIBRARY</span>
      <h1 className="page-title">Learn deeply. Practice confidently.</h1>
      <p className="dashboard-intro">
        Read guided booklets, explore field examples, and prepare for real conversations and work scenarios.
        Practice comes after understanding.
      </p>
      <div className="library-grid">
        {list.map((b) => (
          <Link href={'/library/' + b.slug} className="booklet-card" key={b.slug}>
            <img src={b.image} alt="" />
            <div>
              <span className="overline">
                {b.track} · {b.level}
              </span>
              <h2>{b.title}</h2>
              <p>{b.subtitle}</p>
              <span className="booklet-meta">
                <BookOpen size={16} />
                {b.lessons.length} lessons <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
