'use server';

import { prisma } from '@/shared/config';
import { Category } from '@/shared/lib/prisma/client';

export const changeCategories = async (
  changedCategory: Omit<Category, 'id'>[],
) => {
  try {
    await prisma.category.deleteMany({
      where: {
        tournamentId: changedCategory[0].tournamentId,
      },
    });
    const data = await prisma.category.createMany({
      data: changedCategory,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось изменить категории');
  }
};
