'use server';
import { prisma } from '@/shared/config';

export async function getMatchesWithCategory(tournamentId: string) {
  return await prisma.match.findMany({
    where: { tournamentId },
    include: {
      category: {
        include: {
          fighters: true,
        },
      },
    },
  });
}
