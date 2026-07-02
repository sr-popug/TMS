'use server';

import { prisma } from '@/shared/config';

export const deleteFighter = async (id: number) => {
  try {
    const data = await prisma.fighter.delete({
      where: {
        id,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось удалить спортсмена');
  }
};
