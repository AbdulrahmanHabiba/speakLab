import Link from 'next/link';
import { getHseGuide } from '@/lib/db';
import { fallGuide as fallbackGuide } from '@/lib/hse-fall-guide';
import { AudioButton } from '@/components/audio/AudioButton';

export const dynamic = 'force-dynamic';

export default async function Study() {
  let guide = fallbackGuide;

  try {
    const dbGuide = await getHseGuide('working-at-heights');
    if (dbGuide) {
      guide = {
        title: dbGuide.title,
        arabicTitle: dbGuide.arabicTitle,
        sections: dbGuide.sections.map((s) => ({
          id: s.sectionKey,
          heading: s.heading,
          arHeading: s.arHeading,
          en: s.en,
          ar: s.ar,
          reference: s.reference ?? '',
          url: s.url ?? '',
        })),
        scenario: {
          title: dbGuide.scenarioTitle ?? fallbackGuide.scenario.title,
          arTitle: dbGuide.scenarioArTitle ?? fallbackGuide.scenario.arTitle,
          en: dbGuide.scenarioEn ?? fallbackGuide.scenario.en,
          ar: dbGuide.scenarioAr ?? fallbackGuide.scenario.ar,
        },
      };
    }
  } catch (err) {
    console.error('Failed to fetch HSE guide from Prisma:', err);
  }

  return (
    <main className="reading-layout" style={{ maxWidth: 1050 }}>
      <Link href="/library/working-at-heights" className="backlink">
        ← Working at Heights
      </Link>
      <header className="hse-cover">
        <span className="overline">HSE / OSHA STUDY BOOKLET</span>
        <h1>{guide.title}</h1>
        <p lang="ar" dir="rtl">
          {guide.arabicTitle}
        </p>
        <small>
          {guide.sections.length} source-linked chapters · EN Primary / Arabic explanation
        </small>
      </header>
      <p className="hse-note">
        Study guide only. Check OSHA, work-specific conditions, manufacturer guidance and local rules
        before field use.{' '}
        <span lang="ar" dir="rtl">
          هذا الكتيب للمذاكرة، ولا يحل محل المعايير الأصلية أو تقييم مخاطر الموقع.
        </span>
      </p>
      <nav className="hse-toc">
        {guide.sections.map((s) => (
          <a key={s.id} href={'#' + s.id}>
            {s.heading}
          </a>
        ))}
      </nav>
      {guide.sections.map((s, i) => (
        <section className="hse-chapter" id={s.id} key={s.id}>
          <span className="overline">CHAPTER {i + 1}</span>
          <h2>{s.heading}</h2>
          <div className="hse-pair">
            <div className="hse-language">
              <div className="flex items-center justify-between gap-2 mb-2">
                <small>ENGLISH · MAIN TEXT</small>
                <AudioButton text={s.en} size="sm" showSlowToggle />
              </div>
              <p>{s.en}</p>
            </div>
            <div lang="ar" dir="rtl" className="hse-language hse-ar">
              <small>الشرح بالعربية</small>
              <h3>{s.arHeading}</h3>
              <p>{s.ar}</p>
            </div>
          </div>
          {s.id === 'guardrails' && (
            <figure className="hse-diagram">
              <svg
                viewBox="0 0 620 230"
                role="img"
                aria-label="Top rail 42 inches plus or minus 3 inches, midrail halfway"
              >
                <rect x="30" y="200" width="560" height="12" fill="#64748b" />
                <path
                  d="M160 200V35M480 200V35M160 35H480M160 118H480"
                  stroke="#60a5fa"
                  strokeWidth="9"
                  fill="none"
                />
                <path
                  d="M95 35V200m-8-155 8-10 8 10m-16 145 8 10 8-10"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                  fill="none"
                />
                <text x="9" y="110" fill="white" fontSize="16">
                  42 in ± 3 in
                </text>
                <text x="255" y="25" fill="white" fontSize="15">
                  Top rail
                </text>
                <text x="265" y="108" fill="white" fontSize="15">
                  Midrail
                </text>
              </svg>
              <figcaption>Conceptual diagram · Not to scale · OSHA 1926.502(b)</figcaption>
            </figure>
          )}
          {s.url && (
            <a className="hse-source" target="_blank" rel="noopener noreferrer" href={s.url}>
              ↗ OSHA reference: {s.reference}
            </a>
          )}
        </section>
      ))}
      {guide.scenario && (
        <section className="hse-chapter">
          <span className="overline">FIELD APPLICATION</span>
          <h2>{guide.scenario.title}</h2>
          <div className="hse-pair">
            <div className="hse-language">
              <div className="flex items-center justify-between gap-2 mb-2">
                <small>ENGLISH · APPLICATION</small>
                <AudioButton text={guide.scenario.en} size="sm" showSlowToggle />
              </div>
              <p>{guide.scenario.en}</p>
            </div>
            <div lang="ar" dir="rtl" className="hse-language hse-ar">
              <h3>{guide.scenario.arTitle}</h3>
              <p>{guide.scenario.ar}</p>
            </div>
          </div>
        </section>
      )}
      <p className="hse-note">
        No interview questions are attributed to Aramco, Petrojet or other employers without a verifiable source.
      </p>
    </main>
  );
}