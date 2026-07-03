'use server';

import { prisma } from '@/shared/config';
import { revalidatePath } from 'next/cache';

export const updateMatchTatami = async (
  matchId: string,
  tatami: number,
  slotNumber: number,
) => {
  try {
    await prisma.match.update({
      where: { id: matchId },
      data: { tatami, slotNumber },
    });
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error(err);
    throw new Error('Не удалось переместить поединок');
  }
};
