'use server';
import { prisma } from '@/shared/config';

export const getGrids = async (tournamentId: string) => {
  const categories = await prisma.category.findMany({
    where: { tournamentId },
    include: {
      fighters: {
        orderBy: { order: 'asc' },
      },
      matches: {
        orderBy: [{ round: 'asc' }, { number: 'asc' }],
        include: {
          fighter1: true,
          fighter2: true,
        },
      },
    },
  });

  return categories
    .filter(c => c.fighters.length >= 1)
    .map(c => ({
      categoryId: c.id,
      categoryLabel: `${c.age} / ${c.weight} кг`,
      fightersCount: c.fighters.length,
      rounds: c.matches.length
        ? Math.max(...c.matches.map(m => m.round))
        : Math.floor(
            Math.log2(Math.pow(2, Math.floor(Math.log2(c.fighters.length)))),
          ),
      matchesCount:
        c.matches.length ||
        Math.pow(2, Math.floor(Math.log2(c.fighters.length))) - 1,
      hasMatches: c.matches.length > 0,
    }))
    .sort((a, b) => b.fightersCount - a.fightersCount);
};
