// prisma/seed.ts
import { prisma } from '@/shared/config';
import 'dotenv/config';

async function main() {
  // Очистка базы
  await prisma.match.deleteMany();
  await prisma.fighter.deleteMany();
  await prisma.category.deleteMany();
  await prisma.timeRow.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.user.deleteMany();

  // Пользователи
  const admin = await prisma.user.create({
    data: {
      name: 'Администратор',
      roles: ['admin'],
    },
  });

  const coach = await prisma.user.create({
    data: {
      name: 'Тренер Иванов',
      roles: ['coach', 'editor'],
    },
  });

  const organizer = await prisma.user.create({
    data: {
      name: 'Организатор Петров',
      roles: ['organizer'],
    },
  });

  // Турнир
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Чемпионат России 2024',
      description: 'Ежегодный чемпионат по боевым искусствам',
      info: 'Соревнования проводятся по олимпийской системе',
      place: 'Москва, СК "Олимпийский"',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-17'),
    },
  });

  // Расписание
  await prisma.timeRow.createMany({
    data: [
      {
        tournamentId: tournament.id,
        date: new Date('2024-03-15'),
        timeline: '09:00',
        event: 'Регистрация участников',
      },
      {
        tournamentId: tournament.id,
        date: new Date('2024-03-15'),
        timeline: '10:00',
        event: 'Начало соревнований',
      },
      {
        tournamentId: tournament.id,
        date: new Date('2024-03-15'),
        timeline: '12:00',
        event: 'Обеденный перерыв',
      },
      {
        tournamentId: tournament.id,
        date: new Date('2024-03-17'),
        timeline: '18:00',
        event: 'Награждение победителей',
      },
    ],
  });

  // Категории
  const category1 = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      age: '18-25',
      weight: '70',
    },
  });

  const category2 = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      age: '18-25',
      weight: '80',
    },
  });

  const category3 = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      age: '26-35',
      weight: '90',
    },
  });

  // Бойцы
  const fighter1 = await prisma.fighter.create({
    data: {
      categoryId: category1.id,
      order: 1,
      name: 'Иван Иванов',
      birthday: new Date('2000-05-15'),
    },
  });

  const fighter2 = await prisma.fighter.create({
    data: {
      categoryId: category1.id,
      order: 2,
      name: 'Петр Петров',
      birthday: new Date('2001-08-20'),
    },
  });

  const fighter3 = await prisma.fighter.create({
    data: {
      categoryId: category1.id,
      order: 3,
      name: 'Сергей Сергеев',
      birthday: new Date('1999-12-10'),
    },
  });

  const fighter4 = await prisma.fighter.create({
    data: {
      categoryId: category1.id,
      order: 4,
      name: 'Алексей Алексеев',
      birthday: new Date('2000-03-25'),
    },
  });

  const fighter5 = await prisma.fighter.create({
    data: {
      categoryId: category2.id,
      order: 1,
      name: 'Дмитрий Дмитриев',
      birthday: new Date('1998-07-12'),
    },
  });

  const fighter6 = await prisma.fighter.create({
    data: {
      categoryId: category2.id,
      order: 2,
      name: 'Андрей Андреев',
      birthday: new Date('1999-11-30'),
    },
  });

  // Бои
  await prisma.match.createMany({
    data: [
      {
        categoryId: category1.id,
        round: 1,
        number: 1,
        fighter1Id: fighter1.id,
        fighter2Id: fighter2.id,
        winner: fighter1.id,
      },
      {
        categoryId: category1.id,
        round: 1,
        number: 2,
        fighter1Id: fighter3.id,
        fighter2Id: fighter4.id,
        winner: fighter3.id,
      },
      {
        categoryId: category1.id,
        round: 2,
        number: 1,
        fighter1Id: fighter1.id,
        fighter2Id: fighter3.id,
        winner: null,
      },
      {
        categoryId: category2.id,
        round: 1,
        number: 1,
        fighter1Id: fighter5.id,
        fighter2Id: fighter6.id,
        winner: null,
      },
    ],
  });

  console.log('База данных заполнена тестовыми данными');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
