'use server';
import { prisma } from '@/shared/config';

export const getGridMatches = async (categoryId: string) => {
  return prisma.match.findMany({
    where: { categoryId },
    orderBy: [{ round: 'asc' }, { number: 'asc' }],
    include: {
      fighter1: {
        include: { club: true },
      },
      fighter2: {
        include: { club: true },
      },
    },
  });
};
