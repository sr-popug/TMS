import { prisma } from '@/shared/config';

async function main() {
  console.log('🚀 Начинаем заполнение базы данных (Seed)...');

  await prisma.match.deleteMany({});
  await prisma.fighter.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.timeRow.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Старые данные успешно удалены.');

  // Создаем тестовые клубы
  const clubNames = ['Альфа', 'Титан', 'Спарта', 'Вымпел', 'Легион', 'Самурай'];

  // Создаем базовые категории для турниров
  const ageGroups = ['10-11 лет', '12-13 лет', '14-15 лет', '16-17 лет'];
  const weightGroups = [
    'до 40 кг',
    'до 50 кг',
    'до 60 кг',
    'до 70 кг',
    '70+ кг',
  ];

  // Инициализируем 5 турниров относительно 4 июля 2026 года
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
    // --- ДАТА СЕГОДНЯ: 4 ИЮЛЯ 2026 ---
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

    // 1. Создаем турнир
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

    // 2. Создаем клубы, привязанные к этому турниру
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

    // 3. Создаем расписание (TimeRow)
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

    // 4. Создаем категории для этого турнира
    const createdCategories = [];
    for (const age of ageGroups) {
      for (const weight of weightGroups) {
        const cat = await prisma.category.create({
          data: {
            tournamentId: tournament.id,
            age,
            weight,
          },
        });
        createdCategories.push(cat);
      }
    }

    // 5. Создаем 20 уникальных участников (Fighters) для этого турнира
    console.log(`🔹 Генерируем 20 участников для турнира...`);
    for (let i = 1; i <= 20; i++) {
      // Случайно распределяем бойца в одну из созданных категорий и клубов
      const randomCategory =
        createdCategories[Math.floor(Math.random() * createdCategories.length)];
      const randomClub =
        createdClubs[Math.floor(Math.random() * createdClubs.length)];

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

      const fullName = `${lastName[Math.floor(Math.random() * lastName.length)]} ${firstName[Math.floor(Math.random() * firstName.length)]} #${i}`;

      await prisma.fighter.create({
        data: {
          name: fullName,
          birthday: new Date(2010 + Math.floor(Math.random() * 6), 0, 1), // 2010 - 2015 года рождения
          weight: 35 + Math.random() * 45, // От 35 до 80 кг
          order: i,
          tournamentId: tournament.id,
          categoryId: randomCategory.id,
          clubId: randomClub.id,
        },
      });
    }

    // 6. Создаем по 2 тестовых стартовых матча (Match) в случайных категориях для затравки интерфейса
    for (let m = 1; m <= 3; m++) {
      const cat = createdCategories[m];

      // Ищем бойцов, которых мы только что закинули в эту категорию
      const fightersInCat = await prisma.fighter.findMany({
        where: { categoryId: cat.id },
        take: 2,
      });

      if (fightersInCat.length >= 2) {
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            categoryId: cat.id,
            round: 1,
            number: m,
            fighter1Id: fightersInCat[0].id,
            fighter2Id: fightersInCat[1].id,
            slotNumber: m,
            tatami: Math.random() > 0.5 ? 1 : 2, // Случайный ковер 1 или 2
          },
        });
      }
    }
  }

  console.log(
    '\n✨ Наполнение базы данных успешно завершено! 5 турниров, по 20 бойцов в каждом, категории и клубы созданы.',
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
