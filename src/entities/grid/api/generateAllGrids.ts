'use server';
import { prisma } from '@/shared/config';
import { generateGrid } from './generateGrid';

export const generateAllGrids = async (tournamentId: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        tournamentId,
        fighters: { some: {} },
      },
      select: { id: true, matches: { select: { id: true } } },
    });

    const toGenerate = categories.filter(c => c.matches.length === 0);

    for (const cat of toGenerate) {
      await generateGrid(cat.id);
    }
  } catch (err) {
    console.log(err);
    throw Error('Не удалось сгенирировать сетки');
  }
};
