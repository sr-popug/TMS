'use server';

import { prisma } from '@/shared/config';
import { Match } from '@/shared/lib/prisma/client';

export const generateGrid = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      fighters: { orderBy: { order: 'asc' } },
      matches: true,
    },
  });

  if (!category) throw new Error('Категория не найдена');
  const count = category.fighters.length;
  if (count < 1) throw new Error('Нет бойцов');
  if (category.matches.length > 0) throw new Error('Сетка уже сгенерирована');

  const fighters = [...category.fighters].sort(() => Math.random() - 0.5);
  for (let i = 0; i < fighters.length; i++) {
    await prisma.fighter.update({
      where: { id: fighters[i].id },
      data: { order: i },
    });
  }

  // Сценарий 1: 1 боец
  if (count === 1) {
    await prisma.match.create({
      data: {
        categoryId,
        tournamentId: category.tournamentId,
        round: 1,
        number: 1,
        fighter1Id: fighters[0].id,
        fighter2Id: null,
        winner: fighters[0].id,
        tatami: null, // 🎯 Добавлено
        slotNumber: null, // 🎯 Добавлено
      },
    });
    return;
  }

  // Сценарий 2: 2 бойца
  if (count === 2) {
    await prisma.match.create({
      data: {
        categoryId,
        tournamentId: category.tournamentId,
        round: 1,
        number: 1,
        fighter1Id: fighters[0].id,
        fighter2Id: fighters[1].id,
        winner: null,
        tatami: null, // 🎯 Добавлено
        slotNumber: null, // 🎯 Добавлено
      },
    });
    return;
  }

  // Сценарий 3: 3 бойца (Круговая / туры)
  if (count === 3) {
    const matchesToCreate: Omit<Match, 'id'>[] = [
      {
        categoryId,
        tournamentId: category.tournamentId,
        round: 1,
        number: 1,
        fighter1Id: fighters[0].id,
        fighter2Id: fighters[1].id,
        winner: null,
        tatami: null, // 🎯 Добавлено
        slotNumber: null, // 🎯 Добавлено
      },
      {
        categoryId,
        tournamentId: category.tournamentId,
        round: 1,
        number: 2,
        fighter1Id: fighters[1].id,
        fighter2Id: fighters[2].id,
        winner: null,
        tatami: null, // 🎯 Добавлено
        slotNumber: null, // 🎯 Добавлено
      },
      {
        categoryId,
        tournamentId: category.tournamentId,
        round: 1,
        number: 3,
        fighter1Id: fighters[0].id,
        fighter2Id: fighters[2].id,
        winner: null,
        tatami: null, // 🎯 Добавлено
        slotNumber: null, // 🎯 Добавлено
      },
    ];

    await prisma.match.createMany({ data: matchesToCreate });
    return;
  }

  // Сценарий 4: 4+ бойцов (Олимпийская система с "вылетами" и "пропусками" - bye)
  const totalSlots = Math.pow(2, Math.ceil(Math.log2(count)));
  const totalRounds = Math.log2(totalSlots);

  const matchesInFirstRound = count - totalSlots / 2;
  const fightersInFirstRoundCount = matchesInFirstRound * 2;

  const firstRoundFighters = fighters.slice(0, fightersInFirstRoundCount);
  const byeFighters = fighters.slice(fightersInFirstRoundCount);

  const matchesToCreate: Omit<Match, 'id'>[] = [];

  // Раунд 1
  for (let i = 0; i < matchesInFirstRound; i++) {
    matchesToCreate.push({
      categoryId,
      tournamentId: category.tournamentId,
      round: 1,
      number: i + 1,
      fighter1Id: firstRoundFighters[i * 2].id,
      fighter2Id: firstRoundFighters[i * 2 + 1].id,
      winner: null,
      tatami: null, // 🎯 Добавлено
      slotNumber: null, // 🎯 Добавлено
    });
  }

  // Раунд 2
  const round2MatchesCount = totalSlots / 4;
  let byeIdx = 0;

  for (let i = 0; i < round2MatchesCount; i++) {
    const expectedFirstRoundMatch1 = i * 2 + 1;
    const expectedFirstRoundMatch2 = i * 2 + 2;

    const hasWinner1 = expectedFirstRoundMatch1 <= matchesInFirstRound;
    const hasWinner2 = expectedFirstRoundMatch2 <= matchesInFirstRound;

    const fighter1Id = hasWinner1 ? null : byeFighters[byeIdx++]?.id || null;
    const fighter2Id = hasWinner2 ? null : byeFighters[byeIdx++]?.id || null;

    matchesToCreate.push({
      categoryId,
      tournamentId: category.tournamentId,
      round: 2,
      number: i + 1,
      fighter1Id,
      fighter2Id,
      winner: null,
      tatami: null, // 🎯 Добавлено
      slotNumber: null, // 🎯 Добавлено
    });
  }

  // Раунд 3 и далее
  let currentRoundMatchesCount = round2MatchesCount;
  for (let round = 3; round <= totalRounds; round++) {
    currentRoundMatchesCount = currentRoundMatchesCount / 2;

    for (let i = 0; i < currentRoundMatchesCount; i++) {
      matchesToCreate.push({
        categoryId,
        tournamentId: category.tournamentId,
        round,
        number: i + 1,
        fighter1Id: null,
        fighter2Id: null,
        winner: null,
        tatami: null, // 🎯 Добавлено
        slotNumber: null, // 🎯 Добавлено
      });
    }
  }

  await prisma.match.createMany({ data: matchesToCreate });
};
