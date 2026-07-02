'use server';

import { prisma } from '@/shared/config';

export const resetGrid = async (categoryId: string) => {
  await prisma.match.deleteMany({
    where: { categoryId },
  });

  await prisma.fighter.updateMany({
    where: { categoryId },
    data: { order: 0 },
  });
};
