'use server';
import { prisma } from '@/shared/config';
import { cache } from 'react';

export const getAllTournaments = cache(async (type: 'next' | 'prev') => {
  try {
    const now = new Date().toISOString();
    const data = await prisma.tournament.findMany({
      where: {
        startDate: type === 'next' ? { gte: now } : { lt: now },
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось загрузить турниры');
  }
});
