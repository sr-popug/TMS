'use server';

import { prisma } from '@/shared/config';
import { Tournament } from '@/shared/lib/prisma/client';

export async function addTournament(data: Omit<Tournament, 'id'>) {
  try {
    const tournament = await prisma.tournament.create({
      data: data,
    });
    return tournament;
  } catch (error) {
    console.error(error);

    throw new Error('Не удалось создать турнир');
  }
}
