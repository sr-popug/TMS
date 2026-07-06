'use server';

import { prisma } from '@/shared/config';
import { revalidatePath } from 'next/cache';
import { getMatchesWithCategory } from './getMatchesWithCategory';

export const scheduleMatches = async (
  tournamentId: string,
  tatamiCount: number,
) => {
  try {
    if (tatamiCount < 1)
      throw new Error('Количество ковров должно быть больше 0');

    // 1. Сброс старого распределения
    await prisma.match.updateMany({
      where: { tournamentId },
      data: { tatami: null, slotNumber: null },
    });

    // 2. Получаем матчи
    const matches = await getMatchesWithCategory(tournamentId);
    if (matches.length === 0) return;
    const filteredMatches = matches.filter(el => {
      if (el.category?.fighters.length && el.category?.fighters.length > 1) {
        return el;
      }
    });
    const sortedMatches = [...filteredMatches].sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;

      const aAge = a.category?.age || '';
      const bAge = b.category?.age || '';
      if (aAge !== bAge) return aAge.localeCompare(bAge);

      const aWeight = a.categoryId || '';
      const bWeight = b.categoryId || '';
      if (aWeight !== bWeight) return aWeight.localeCompare(bWeight);

      const aHasFighters = a.fighter1Id && a.fighter2Id ? 1 : 0;
      const bHasFighters = b.fighter1Id && b.fighter2Id ? 1 : 0;
      if (bHasFighters !== aHasFighters) return bHasFighters - aHasFighters;

      return a.number - b.number;
    });

    const tatamiSlots: Record<number, number> = {};
    const timeline: Record<number, Record<number, number[]>> = {};

    for (let t = 1; t <= tatamiCount; t++) {
      tatamiSlots[t] = 1;
      timeline[t] = {};
    }

    let currentRound = sortedMatches[0]?.round || 1;
    let ageTatamiMap: Record<string, number> = {};

    const isFighterBusy = (
      fighterIds: number[],
      slot: number,
      tatami: number,
    ): boolean => {
      for (let s = slot - 1; s <= slot + 1; s++) {
        const busyIds = timeline[tatami][s] || [];
        if (fighterIds.some(id => busyIds.includes(id))) return true;
      }
      return false;
    };

    for (const match of sortedMatches) {
      if (match.round !== currentRound) {
        currentRound = match.round;
        ageTatamiMap = {};
      }

      const ageGroup = match.category?.age || 'without_age';
      const currentFighterIds = [match.fighter1Id, match.fighter2Id].filter(
        Boolean,
      ) as number[];

      let targetTatami = 1;

      if (ageTatamiMap[ageGroup]) {
        targetTatami = ageTatamiMap[ageGroup];
      } else {
        let minMatches = Infinity;
        for (let t = 1; t <= tatamiCount; t++) {
          if (tatamiSlots[t] < minMatches) {
            minMatches = tatamiSlots[t];
            targetTatami = t;
          }
        }
        ageTatamiMap[ageGroup] = targetTatami;
      }

      let currentSlot = tatamiSlots[targetTatami];

      while (isFighterBusy(currentFighterIds, currentSlot, targetTatami)) {
        currentSlot++;
      }

      if (currentFighterIds.length > 0) {
        timeline[targetTatami][currentSlot] = currentFighterIds;
      }

      await prisma.match.update({
        where: { id: match.id },
        data: {
          tatami: targetTatami,
          slotNumber: currentSlot,
        },
      });

      if (currentSlot >= tatamiSlots[targetTatami]) {
        tatamiSlots[targetTatami] = currentSlot + 1;
      }
    }

    revalidatePath('/', 'layout');
  } catch (err) {
    console.error('Ошибка в экшене scheduleMatches:', err);
    throw new Error('Не удалось сгенерировать расписание');
  }
};
