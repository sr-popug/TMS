'use server';
import { prisma } from '@/shared/config';

export const resetAllGrids = async (tournamentId: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: { tournamentId },
      select: { id: true },
    });

    for (const cat of categories) {
      await prisma.match.deleteMany({ where: { categoryId: cat.id } });
      await prisma.fighter.updateMany({
        where: { categoryId: cat.id },
        data: { order: 0 },
      });
    }
  } catch (err) {
    console.log(err);
    throw Error('Не удалось сбросить сетки ');
  }
};
