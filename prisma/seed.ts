import { prisma } from '@/shared/config';

async function main() {
  console.log('🚀 Начинаем заполнение базы данных (Seed)...');

  // Очистка БД в правильном порядке (с учетом внешних ключей)
  await prisma.match.deleteMany({});
  await prisma.fighter.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.timeRow.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Старые данные успешно удалены.');

  const clubNames = ['Альфа', 'Титан', 'Спарта', 'Вымпел', 'Легион', 'Самурай'];
  const ageGroups = ['10-11', '12-13', '14-15', '16-17', '18+'];

  const weightGroups = [40, 50, 60, 70, null];

  const tournamentData = [
    {
      name: 'Зимний кубок Вызова 2026',
      description: 'Ежегодный зимний турнир по карате',
      info: 'Правила WKF. Полный контакт.',
      place: 'Москва, ДС Лужники',
      startDate: new Date('2026-01-15T09:00:00Z'),
      endDate: new Date('2026-01-17T18:00:00Z'),
    },
    {
      name: 'Чемпионат Области (Весна 2026)',
      description: 'Отборочный этап на Чемпионат России',
      info: 'Обязательное наличие страховки и допусков.',
      place: 'Санкт-Петербург, Сибур Арена',
      startDate: new Date('2026-03-22T10:00:00Z'),
      endDate: new Date('2026-03-24T17:00:00Z'),
    },
    {
      name: 'Летний Фестиваль Единоборств',
      description: 'Межрегиональный дружеский турнир',
      info: 'Для всех уровней подготовки.',
      place: 'Сочи, Спортивный комплекс Юг-Спорт',
      startDate: new Date('2026-06-10T09:00:00Z'),
      endDate: new Date('2026-06-12T19:00:00Z'),
    },
    {
      name: 'Осенний Прорыв 2026',
      description: 'Главный осенний старт сезона',
      info: 'Трансляция на Матч ТВ.',
      place: 'Казань, Дворец Единоборств Ак Барс',
      startDate: new Date('2026-09-18T08:00:00Z'),
      endDate: new Date('2026-09-20T20:00:00Z'),
    },
    {
      name: 'Финал Года / Grand Prix 2026',
      description: 'Итоговый турнир сильнейших бойцов',
      info: 'Только топ-8 рейтинга.',
      place: 'Екатеринбург, Академия Единоборств РМК',
      startDate: new Date('2026-12-05T11:00:00Z'),
      endDate: new Date('2026-12-07T18:00:00Z'),
    },
  ];

  for (const t of tournamentData) {
    console.log(`\n📦 Создаем турнир: "${t.name}"`);

    const tournament = await prisma.tournament.create({
      data: {
        name: t.name,
        description: t.description,
        info: t.info,
        place: t.place,
        startDate: t.startDate,
        endDate: t.endDate,
      },
    });

    const createdClubs = [];
    for (const clubName of clubNames) {
      const club = await prisma.club.create({
        data: {
          title: `СК "${clubName}"`,
          tournamentId: tournament.id,
        },
      });
      createdClubs.push(club);
    }

    await prisma.timeRow.createMany({
      data: [
        {
          tournamentId: tournament.id,
          date: t.startDate,
          timeline: '09:00 - 10:30',
          event: 'Взвешивание и мандатная комиссия',
        },
        {
          tournamentId: tournament.id,
          date: t.startDate,
          timeline: '11:00 - 18:00',
          event: 'Предварительные поединки',
        },
      ],
    });

    // Создаем категории. Преобразуем веса в строковый формат для хранения, если поле в схеме строковое
    // (например: "40", "50", "70+")
    const createdCategories = [];
    for (const age of ageGroups) {
      for (const wGroup of weightGroups) {
        const weightString = wGroup ? String(wGroup) : '70+';
        const cat = await prisma.category.create({
          data: {
            tournamentId: tournament.id,
            age,
            weight: weightString,
          },
        });
        createdCategories.push({
          id: cat.id,
          age,
          maxWeight: wGroup,
        });
      }
    }

    console.log(
      `🔹 Генерируем участников с плотным распределением (по 9 человек на категорию)...`,
    );

    // Чтобы в категориях было по 9 человек, мы не берем случайную категорию для каждого бойца.
    // Вместо этого мы выберем 4 случайные категории на турнир и заполним их "до краев".
    const targetCategories: {
      id: string;
      age: string;
      maxWeight: number | null;
    }[] = [];
    while (targetCategories.length < 4) {
      const randCat =
        createdCategories[Math.floor(Math.random() * createdCategories.length)];
      if (!targetCategories.some(c => c.id === randCat.id)) {
        targetCategories.push(randCat);
      }
    }

    const firstName = [
      'Александр',
      'Дмитрий',
      'Максим',
      'Сергей',
      'Андрей',
      'Алексей',
      'Илья',
      'Кирилл',
      'Артем',
      'Егор',
    ];
    const lastName = [
      'Иванов',
      'Петров',
      'Смирнов',
      'Сергеев',
      'Волков',
      'Кузнецов',
      'Попов',
      'Васильев',
      'Соколов',
      'Новиков',
    ];

    let fighterGlobalOrder = 1;

    // Итерируемся по выбранным категориям и создаем ровно по 9 бойцов в каждой
    for (const cat of targetCategories) {
      for (let f = 1; f <= 9; f++) {
        const randomClub =
          createdClubs[Math.floor(Math.random() * createdClubs.length)];
        const fullName = `${lastName[Math.floor(Math.random() * lastName.length)]} ${firstName[Math.floor(Math.random() * firstName.length)]} #${fighterGlobalOrder}`;

        // Генерируем вес, который строго подходит под выбранную категорию
        let exactWeight = 0;
        if (cat.maxWeight === null) {
          exactWeight = 71 + Math.random() * 15; // Для категории "70+" вес 71-86 кг
        } else {
          const minLimit = cat.maxWeight - 10;
          exactWeight = minLimit + Math.random() * 9.5; // Гарантированно попадает в диапазон (например, 30.5 - 39.5 для "до 40")
        }

        await prisma.fighter.create({
          data: {
            name: fullName,
            birthday: new Date(2010 + Math.floor(Math.random() * 6), 0, 1),
            weight: parseFloat(exactWeight.toFixed(1)), // Красивое округление веса (например, 43.4)
            order: fighterGlobalOrder,
            tournamentId: tournament.id,
            categoryId: cat.id,
            clubId: randomClub.id,
          },
        });

        fighterGlobalOrder++;
      }

      // 6. Создаем тестовые матчи для этой наполненной категории
      const fightersInCat = await prisma.fighter.findMany({
        where: { categoryId: cat.id },
        take: 4, // Возьмем первых 4 бойцов для создания пары стартовых матчей
      });

      if (fightersInCat.length >= 4) {
        // Матч 1
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            categoryId: cat.id,
            round: 1,
            number: 1,
            fighter1Id: fightersInCat[0].id,
            fighter2Id: fightersInCat[1].id,
            slotNumber: 1,
            tatami: 1,
          },
        });
        // Матч 2
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            categoryId: cat.id,
            round: 1,
            number: 2,
            fighter1Id: fightersInCat[2].id,
            fighter2Id: fightersInCat[3].id,
            slotNumber: 2,
            tatami: 1,
          },
        });
      }
    }
  }

  console.log(
    '\n✨ Наполнение базы данных успешно завершено! Созданы заполненные категории (по 9 человек) и сгенерированы тестовые матчи.',
  );
}

main()
  .catch(e => {
    console.error('❌ Ошибка во время выполнения сида:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
