import { PrismaClient } from '@prisma/client';
import { starterSessions, grammar } from '../src/lib/seed';
import { booklets } from '../src/lib/booklets';
import { fallGuide } from '../src/lib/hse-fall-guide';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seed Process for SpeakLab ---');

  // 1. Seed Sessions, Corrections, Vocabulary, Quizzes
  console.log('Seeding sessions and related data...');
  for (const session of starterSessions) {
    await prisma.session.upsert({
      where: { id: session.id },
      update: {
        date: session.date,
        number: session.number,
        title: session.title,
        section: session.section,
        level: session.level,
        summary: session.summary,
        questions: session.questions,
      },
      create: {
        id: session.id,
        date: session.date,
        number: session.number,
        title: session.title,
        section: session.section,
        level: session.level,
        summary: session.summary,
        questions: session.questions,
        corrections: {
          create: session.corrections.map((c) => ({
            said: c.said,
            better: c.better,
            why: c.why,
            grammar: c.grammar,
          })),
        },
        vocabulary: {
          create: session.vocabulary.map((v) => ({
            word: v.word,
            arabic: v.arabic,
            example: v.example,
          })),
        },
        quizzes: {
          create: session.quizzes.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options,
            answer: q.answer,
            why: q.why,
            hint: q.hint,
          })),
        },
      },
    });
  }

  // 2. Seed Grammar Guides
  console.log('Seeding grammar guides...');
  for (let i = 0; i < grammar.length; i++) {
    const g = grammar[i];
    await prisma.grammarGuide.upsert({
      where: { id: g.id },
      update: {
        title: g.title,
        ar: g.ar,
        use: g.use,
        form: g.form,
        signals: g.signals,
        examples: g.examples,
        tip: g.tip,
        order: i,
      },
      create: {
        id: g.id,
        title: g.title,
        ar: g.ar,
        use: g.use,
        form: g.form,
        signals: g.signals,
        examples: g.examples,
        tip: g.tip,
        order: i,
      },
    });
  }

  // 3. Seed Booklets and Lessons
  console.log('Seeding booklets and lessons...');
  for (const b of booklets) {
    const booklet = await prisma.booklet.upsert({
      where: { slug: b.slug },
      update: {
        track: b.track,
        title: b.title,
        subtitle: b.subtitle,
        level: b.level,
        accent: b.accent,
        image: b.image,
      },
      create: {
        slug: b.slug,
        track: b.track,
        title: b.title,
        subtitle: b.subtitle,
        level: b.level,
        accent: b.accent,
        image: b.image,
      },
    });

    for (let lIdx = 0; lIdx < b.lessons.length; lIdx++) {
      const l = b.lessons[lIdx];
      const lesson = await prisma.bookletLesson.upsert({
        where: {
          bookletId_slug: {
            bookletId: booklet.id,
            slug: l.slug,
          },
        },
        update: {
          title: l.title,
          minutes: l.minutes,
          order: lIdx,
        },
        create: {
          bookletId: booklet.id,
          slug: l.slug,
          title: l.title,
          minutes: l.minutes,
          order: lIdx,
        },
      });

      // Clear existing blocks before adding to prevent duplicates
      await prisma.lessonBlock.deleteMany({
        where: { lessonId: lesson.id },
      });

      if (l.blocks && l.blocks.length > 0) {
        await prisma.lessonBlock.createMany({
          data: l.blocks.map((block, bIdx) => ({
            lessonId: lesson.id,
            type: block.type,
            title: block.title,
            text: block.text,
            items: block.items || [],
            image: block.image,
            source: block.source,
            order: bIdx,
          })),
        });
      }
    }
  }

  // 4. Seed HSE Fall Guide
  console.log('Seeding HSE guide...');
  const hseGuide = await prisma.hseGuide.upsert({
    where: { slug: 'working-at-heights' },
    update: {
      title: fallGuide.title,
      arabicTitle: fallGuide.arabicTitle,
      scenarioTitle: fallGuide.scenario?.title,
      scenarioArTitle: fallGuide.scenario?.arTitle,
      scenarioEn: fallGuide.scenario?.en,
      scenarioAr: fallGuide.scenario?.ar,
    },
    create: {
      slug: 'working-at-heights',
      title: fallGuide.title,
      arabicTitle: fallGuide.arabicTitle,
      scenarioTitle: fallGuide.scenario?.title,
      scenarioArTitle: fallGuide.scenario?.arTitle,
      scenarioEn: fallGuide.scenario?.en,
      scenarioAr: fallGuide.scenario?.ar,
    },
  });

  await prisma.hseSection.deleteMany({
    where: { guideId: hseGuide.id },
  });

  if (fallGuide.sections && fallGuide.sections.length > 0) {
    await prisma.hseSection.createMany({
      data: fallGuide.sections.map((s, idx) => ({
        guideId: hseGuide.id,
        sectionKey: s.id,
        heading: s.heading,
        arHeading: s.arHeading,
        en: s.en,
        ar: s.ar,
        reference: s.reference,
        url: s.url,
        order: idx,
      })),
    });
  }

  console.log('--- Seed Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
