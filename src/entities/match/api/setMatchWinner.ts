'use server';

import { prisma } from '@/shared/config';
import { revalidatePath } from 'next/cache';

export const setMatchWinner = async (matchId: string, winnerId: number) => {
  try {
    // 1. Ищем текущий матч
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new Error('Матч не найден');

    // Если победитель тот же самый, ничего не делаем
    if (match.winner === winnerId) return;

    const previousWinnerId = match.winner;

    // 2. Записываем нового победителя в текущий поединок
    await prisma.match.update({
      where: { id: matchId },
      data: { winner: winnerId },
    });

    // 3. Ищем матчи следующего раунда для этой категории
    const nextRoundMatches = await prisma.match.findMany({
      where: {
        categoryId: match.categoryId,
        round: match.round + 1,
      },
      orderBy: { number: 'asc' },
    });

    if (nextRoundMatches.length > 0) {
      const nextMatchIndex = Math.floor((match.number - 1) / 2);
      const nextMatch = nextRoundMatches[nextMatchIndex];

      if (nextMatch) {
        const isFirstInPair = match.number % 2 === 1;

        // Определяем, какое поле обновлять в следующем матче
        const fieldToUpdate = isFirstInPair ? 'fighter1Id' : 'fighter2Id';

        // 🎯 ЗАЩИТА: Если мы меняем решение (был один победитель, стал другой),
        // нужно проверить, не прошел ли старый победитель еще дальше по сетке, и очистить те бои
        if (previousWinnerId) {
          await clearFutureMatches(nextMatch.id, previousWinnerId);
        }

        // Записываем свежего победителя в следующий круг
        await prisma.match.update({
          where: { id: nextMatch.id },
          data: { [fieldToUpdate]: winnerId },
        });
      }
    }

    // 🎯 Сбрасываем кэш, чтобы фронтенд сразу увидел изменения
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error('Ошибка в setMatchWinner:', err);
    throw new Error('Не удалось сохранить победителя');
  }
};

/**
 * Рекурсивная функция для очистки сетки вперед, если админ передумал и изменил результат боя.
 * Она убирает старого победителя из всех последующих раундов, если он успел туда записаться.
 */
async function clearFutureMatches(matchId: string, oldWinnerId: number) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const dataToUpdate: {
    fighter1Id?: number | null;
    fighter2Id?: number | null;
    winner?: number | null;
  } = {};
  if (match.fighter1Id === oldWinnerId) dataToUpdate.fighter1Id = null;
  if (match.fighter2Id === oldWinnerId) dataToUpdate.fighter2Id = null;

  // Если старый боец был записан в этот матч как победитель, сбрасываем и его победу тоже
  if (match.winner === oldWinnerId) dataToUpdate.winner = null;

  if (Object.keys(dataToUpdate).length > 0) {
    await prisma.match.update({
      where: { id: matchId },
      data: dataToUpdate,
    });

    // Если у этого матча тоже был изменен/сброшен победитель, рекурсивно идем в следующий раунд
    if (match.winner === oldWinnerId) {
      const nextRoundMatches = await prisma.match.findMany({
        where: { categoryId: match.categoryId, round: match.round + 1 },
        orderBy: { number: 'asc' },
      });
      const nextMatchIndex = Math.floor((match.number - 1) / 2);
      const nextMatch = nextRoundMatches[nextMatchIndex];

      if (nextMatch) {
        await clearFutureMatches(nextMatch.id, oldWinnerId);
      }
    }
  }
}
