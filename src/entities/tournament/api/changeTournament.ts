'use server';

import { prisma } from '@/shared/config';
import { Tournament } from '@/shared/lib/prisma/client';

export async function changeTournament(data: Tournament) {
  try {
    const tournament = await prisma.tournament.update({
      where: {
        id: data.id,
      },
      data: data,
    });
    return tournament;
  } catch (error) {
    console.error(error);

    throw new Error('Не удалось изменить турнир');
  }
}
