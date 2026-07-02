'use server';

import { prisma } from '@/shared/config';
import { Fighter } from '@/shared/lib/prisma/client';

export const addFighter = async (fighter: Omit<Fighter, 'id'>) => {
  try {
    const data = await prisma.fighter.create({
      data: fighter,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось добавить спортсмена');
  }
};
