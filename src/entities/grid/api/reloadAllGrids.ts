'use server';

import { prisma } from '@/shared/config';
import { generateGrid } from './generateGrid';

export const reloadAllGrids = async (tournamentId: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        tournamentId,
        fighters: { some: {} },
      },
      select: { id: true },
    });

    if (categories.length === 0) return;

    const categoryIds = categories.map(cat => cat.id);

    await prisma.match.deleteMany({
      where: { categoryId: { in: categoryIds } },
    });

    await prisma.fighter.updateMany({
      where: { categoryId: { in: categoryIds } },
      data: { order: 0 },
    });

    for (const cat of categories) {
      await generateGrid(cat.id);
    }
  } catch (err) {
    console.error(err);
    throw new Error('Не удалось перезагрузить сетки');
  }
};
