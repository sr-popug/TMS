'use server';

import { prisma } from '@/shared/config';
import { Club } from '@/shared/lib/prisma/client';

export const addClub = async (club: Omit<Club, 'id'>) => {
  try {
    const data = await prisma.club.create({
      data: club,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось добавить клуб');
  }
};
