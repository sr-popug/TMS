'use server';

import { prisma } from '@/shared/config';

export const deleteTimeRows = async (id: string) => {
  try {
    const data = await prisma.timeRow.delete({
      where: {
        id,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось удалить строку расписания');
  }
};
