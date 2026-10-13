import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [bookletsCount, sessionsCount] = await Promise.all([
      prisma.booklet.count(),
      prisma.session.count(),
    ]);

    return NextResponse.json({
      service: 'speaklab',
      status: 'ok',
      database: {
        status: 'connected',
        provider: 'neon-postgres',
        counts: {
          booklets: bookletsCount,
          sessions: sessionsCount,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        service: 'speaklab',
        status: 'degraded',
        database: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}