'use server';
import { prisma } from '@/shared/config';

export const updateFighterOrder = async (fighterId: number, order: number) => {
  try {
    await prisma.fighter.update({
      where: { id: fighterId },
      data: { order },
    });
  } catch (error) {
    console.error(error);
    throw Error('Не удалось обновить номер спортсмена');
  }
};
