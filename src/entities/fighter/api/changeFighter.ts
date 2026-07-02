'use server';

import { prisma } from '@/shared/config';
import { Fighter } from '@/shared/lib/prisma/client';

export const changeFighter = async (fighter: Fighter) => {
  try {
    const data = await prisma.fighter.update({
      where: {
        id: fighter.id,
      },
      data: fighter,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось изменить данные спортсмена');
  }
};
