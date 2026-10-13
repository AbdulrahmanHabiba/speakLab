import prisma from './prisma';

export async function getBooklets() {
  return prisma.booklet.findMany({
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          blocks: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getBookletBySlug(slug: string) {
  return prisma.booklet.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          blocks: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
}

export async function getSessions() {
  return prisma.session.findMany({
    include: {
      corrections: true,
      vocabulary: true,
      quizzes: true,
    },
    orderBy: { number: 'asc' },
  });
}

export async function getSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: {
      corrections: true,
      vocabulary: true,
      quizzes: true,
    },
  });
}

export async function getGrammarGuides() {
  return prisma.grammarGuide.findMany({
    orderBy: { order: 'asc' },
  });
}

export async function getHseGuide(slug: string = 'working-at-heights') {
  return prisma.hseGuide.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  });
}
