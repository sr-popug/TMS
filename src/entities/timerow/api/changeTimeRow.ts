'use server';

import { prisma } from '@/shared/config';
import { TimeRow } from '@/shared/lib/prisma/client';

export const changeTimeRows = async (changedTimeRow: Omit<TimeRow, 'id'>[]) => {
  try {
    await prisma.timeRow.deleteMany({
      where: {
        tournamentId: changedTimeRow[0].tournamentId,
      },
    });
    const data = await prisma.timeRow.createMany({
      data: changedTimeRow,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось изменить расписание');
  }
};
