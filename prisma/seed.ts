import { prisma } from '@/shared/config';
import { Match } from '@/shared/lib/prisma/client';

async function main() {
  await prisma.match.deleteMany();
  await prisma.fighter.deleteMany();
  await prisma.category.deleteMany();
  await prisma.timeRow.deleteMany();
  await prisma.club.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: 'Администратор',
      roles: ['admin'],
    },
  });

  const tournaments = await Promise.all([
    prisma.tournament.create({
      data: {
        name: 'UFC 300',
        description: 'Юбилейный турнир UFC 300.',
        info: 'Лас-Вегас, США. T-Mobile Arena.',
        place: 'Лас-Вегас, США',
        startDate: new Date('2024-04-13'),
        endDate: new Date('2024-04-13'),
      },
    }),
    prisma.tournament.create({
      data: {
        name: 'UFC 302',
        description: 'Махачев vs Порье.',
        info: 'Ньюарк, США. Prudential Center.',
        place: 'Ньюарк, США',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-01'),
      },
    }),
    prisma.tournament.create({
      data: {
        name: 'UFC 308',
        description: 'Топурия vs Холлоуэй.',
        info: 'Абу-Даби, ОАЭ. Etihad Arena.',
        place: 'Абу-Даби, ОАЭ',
        startDate: new Date('2024-10-26'),
        endDate: new Date('2024-10-26'),
      },
    }),
    prisma.tournament.create({
      data: {
        name: 'TMS Grand Prix 2026',
        description: 'Главный турнир года TMS.',
        info: 'Москва, Россия. ВТБ Арена.',
        place: 'Москва, Россия',
        startDate: new Date('2026-12-05'),
        endDate: new Date('2026-12-20'),
      },
    }),
  ]);

  for (const t of tournaments) {
    await prisma.timeRow.createMany({
      data: [
        {
          tournamentId: t.id,
          date: t.startDate,
          timeline: '08:00',
          event: 'Взвешивание',
        },
        {
          tournamentId: t.id,
          date: t.startDate,
          timeline: '10:00',
          event: 'Медосмотр',
        },
        {
          tournamentId: t.id,
          date: t.startDate,
          timeline: '17:00',
          event: 'Предварительный кард',
        },
        {
          tournamentId: t.id,
          date: t.startDate,
          timeline: '19:00',
          event: 'Основной кард',
        },
      ],
    });
  }

  const clubNames = [
    'ЦСКА',
    'Ахмат',
    'Eagles MMA',
    'Динамо',
    'Горец',
    'Jackson Wink',
    'American Top Team',
  ];

  const clubs: { id: number; tournamentId: string | null }[] = [];
  for (const t of tournaments) {
    for (const title of clubNames.slice(0, 3 + Math.floor(Math.random() * 4))) {
      const club = await prisma.club.create({
        data: {
          title,
          tournament: { connect: { id: t.id } },
        },
      });
      clubs.push(club);
    }
  }

  const categories: {
    id: string;
    tournamentId: string | null;
    age: string;
    weight: string;
  }[] = [];

  for (const t of tournaments) {
    const ages = ['18-25', '26-35'];
    const weights = ['61.2', '70.3', '77.1', '83.9'];

    for (const age of ages) {
      for (const weight of weights) {
        const cat = await prisma.category.create({
          data: {
            tournament: { connect: { id: t.id } },
            age,
            weight,
          },
        });
        categories.push(cat);
      }
    }
  }

  const fighterNames = [
    'Александр Волков',
    'Ислам Махачев',
    'Пётр Ян',
    'Джон Джонс',
    'Конор Макгрегор',
    'Хабиб Нурмагомедов',
    'Шон Стрикленд',
    'Камзат Чимаев',
    'Илия Топурия',
    'Макс Холлоуэй',
    'Дастин Порье',
    'Чарльз Оливейра',
  ];

  const fighters: {
    id: number;
    categoryId: string | null;
    tournamentId: string | null;
  }[] = [];

  for (const cat of categories) {
    const tClubs = clubs.filter(c => c.tournamentId === cat.tournamentId);
    const num = 4;
    const shuffled = [...fighterNames].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, num);

    for (let i = 0; i < selected.length; i++) {
      const club = tClubs[Math.floor(Math.random() * tClubs.length)];

      const fighter = await prisma.fighter.create({
        data: {
          tournament: { connect: { id: cat.tournamentId! } },
          category: { connect: { id: cat.id } },
          club: club ? { connect: { id: club.id } } : undefined,
          order: i + 1,
          name: selected[i],
          weight: parseFloat(cat.weight) - 2 + Math.random() * 4,
          birthday: new Date(1990 + Math.floor(Math.random() * 10), 0, 1),
        },
      });
      fighters.push(fighter);
    }
  }

  const allMatches: Omit<Match, 'id'>[] = [];

  for (const cat of categories) {
    const f = fighters.filter(x => x.categoryId === cat.id);
    for (let i = 0; i < f.length; i += 2) {
      if (i + 1 < f.length) {
        allMatches.push({
          tournamentId: cat.tournamentId!,
          categoryId: cat.id,
          round: 1,
          number: i / 2 + 1,
          fighter1Id: f[i].id,
          fighter2Id: f[i + 1].id,
          winner: Math.random() > 0.5 ? f[i].id : f[i + 1].id,
        });
      }
    }
  }

  await prisma.match.createMany({ data: allMatches });

  console.log('Турниров:', tournaments.length);
  console.log('Клубов:', clubs.length);
  console.log('Категорий:', categories.length);
  console.log('Бойцов:', fighters.length);
  console.log('Матчей:', allMatches.length);
  console.log('Готово!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
