'use server';

import { prisma } from '@/shared/config';
import { cache } from 'react';

export const getTimeRows = cache(async (id: string) => {
  try {
    const data = await prisma.timeRow.findMany({
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
