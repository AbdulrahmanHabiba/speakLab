import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { starterSessions } from '@/lib/seed';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        corrections: true,
        vocabulary: true,
        quizzes: true,
      },
      orderBy: { number: 'asc' },
    });

    if (sessions.length > 0) {
      return NextResponse.json({
        source: 'database',
        sessions,
      });
    }

    return NextResponse.json({
      source: 'fallback',
      sessions: starterSessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({
      source: 'fallback',
      sessions: starterSessions,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, date, number, title, section, level, summary, questions, corrections, vocabulary, quizzes } = body;

    const newSession = await prisma.session.create({
      data: {
        id,
        date,
        number,
        title,
        section,
        level,
        summary,
        questions: questions || [],
        corrections: corrections
          ? {
              create: corrections.map((c: any) => ({
                said: c.said,
                better: c.better,
                why: c.why,
                grammar: c.grammar,
              })),
            }
          : undefined,
        vocabulary: vocabulary
          ? {
              create: vocabulary.map((v: any) => ({
                word: v.word,
                arabic: v.arabic,
                example: v.example,
              })),
            }
          : undefined,
        quizzes: quizzes
          ? {
              create: quizzes.map((q: any) => ({
                id: q.id,
                prompt: q.prompt,
                options: q.options,
                answer: q.answer,
                why: q.why,
                hint: q.hint,
              })),
            }
          : undefined,
      },
      include: {
        corrections: true,
        vocabulary: true,
        quizzes: true,
      },
    });

    return NextResponse.json({ success: true, session: newSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}
