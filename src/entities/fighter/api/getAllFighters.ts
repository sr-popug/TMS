'use server';

import { prisma } from '@/shared/config';

export const getAllFighters = async (tournamentId: string) => {
  try {
    const data = await prisma.fighter.findMany({
      where: {
        tournamentId,
      },
      include: {
        category: true,
        club: true,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось получить данные спортсмена');
  }
};
