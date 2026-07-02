'use server';

import { prisma } from '@/shared/config';
import { Category } from '@/shared/lib/prisma/client';

export const changeCategories = async (
  changedCategory: Omit<Category, 'id'>[],
) => {
  try {
    const tournamentId = changedCategory[0]?.tournamentId;
    if (!tournamentId) throw new Error('Нет tournamentId');

    const existing = await prisma.category.findMany({
      where: { tournamentId },
      include: { fighters: true },
    });

    // Строим мапу: ключ "age_weight" → категория
    const existingMap = new Map<string, Category>();
    for (const c of existing) {
      existingMap.set(`${c.age}_${c.weight}`, c);
    }

    // Строим мапу из новых данных
    const newMap = new Map<string, Omit<Category, 'id'> & { id?: string }>();
    for (const c of changedCategory) {
      newMap.set(`${c.age}_${c.weight}`, c);
    }

    // Категории на удаление (есть в базе, нет в новых)
    const toDelete = existing.filter(c => !newMap.has(`${c.age}_${c.weight}`));

    // Категории на создание (есть в новых, нет в базе)
    const toCreate = changedCategory.filter(
      c => !existingMap.has(`${c.age}_${c.weight}`),
    );

    // Отвязываем бойцов от удаляемых
    if (toDelete.length) {
      await prisma.fighter.updateMany({
        where: { categoryId: { in: toDelete.map(c => c.id) } },
        data: { categoryId: null },
      });

      await prisma.category.deleteMany({
        where: { id: { in: toDelete.map(c => c.id) } },
      });
    }

    // Создаём новые
    if (toCreate.length) {
      await prisma.category.createMany({
        data: toCreate.map(c => ({
          age: c.age,
          weight: c.weight,
          tournamentId,
        })),
      });
    }

    // Если ничего не изменилось — просто выходим
    if (!toDelete.length && !toCreate.length) {
      return { message: 'Изменений нет' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('Не удалось изменить категории');
  }
};
