'use server';

import { prisma } from '@/shared/config';

export async function deleteTournament(id: string) {
  try {
    const data = await prisma.tournament.delete({
      where: {
        id,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось удалить турнир');
  }
}
