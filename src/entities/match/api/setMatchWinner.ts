'use server';
import { prisma } from '@/shared/config';

export const setMatchWinner = async (matchId: string, winnerId: number) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { category: true },
  });
  if (!match) throw new Error('Матч не найден');

  await prisma.match.update({
    where: { id: matchId },
    data: { winner: winnerId },
  });
  const nextRoundMatches = await prisma.match.findMany({
    where: {
      categoryId: match.categoryId,
      round: match.round + 1,
    },
    orderBy: { number: 'asc' },
  });

  if (nextRoundMatches.length > 0) {
    const nextMatchIndex = Math.floor((match.number - 1) / 2);
    const nextMatch = nextRoundMatches[nextMatchIndex];

    if (nextMatch) {
      const isFirstInPair = match.number % 2 === 1;
      await prisma.match.update({
        where: { id: nextMatch.id },
        data: isFirstInPair
          ? { fighter1Id: winnerId }
          : { fighter2Id: winnerId },
      });
    }
  }
};
