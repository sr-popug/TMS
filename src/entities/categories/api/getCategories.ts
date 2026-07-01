'use server';

import { prisma } from '@/shared/config';
import { cache } from 'react';

export const getCategories = cache(async (id: string) => {
  try {
    const data = await prisma.category.findMany({
      where: {
        tournamentId: id,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Расписание не найдено');
  }
});
