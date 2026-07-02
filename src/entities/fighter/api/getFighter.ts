'use server';

import { prisma } from '@/shared/config';

export const getFighter = async (id: number) => {
  try {
    const data = await prisma.fighter.findUnique({
      where: {
        id,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось получить данные спортсмена');
  }
};
