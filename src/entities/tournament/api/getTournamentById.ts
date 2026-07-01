'use server';

import { prisma } from '@/shared/config';
import { cache } from 'react';

export const getTournamentById = cache(async (id: string) => {
  try {
    const data = await prisma.tournament.findUnique({
      where: {
        id,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Турнир не найден');
  }
});
