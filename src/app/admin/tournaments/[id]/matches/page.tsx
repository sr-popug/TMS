// Проверь путь к своей призме
import { prisma } from '@/shared/config';
import { MatchList } from '@/widgets/Matches';

export const dynamic = 'force-dynamic'; // Отключаем статическое кэширование страницы

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 🎯 Вытягиваем все матчи этого турнира со всеми нужными связями
  const matches = await prisma.match.findMany({
    where: {
      tournamentId: id,
    },
    include: {
      category: true,
      fighter1: {
        include: { club: true },
      },
      fighter2: {
        include: { club: true },
      },
    },
    // Опционально: можно сразу отсортировать по коврам и слотам, если они уже есть
    orderBy: [{ tatami: 'asc' }, { slotNumber: 'asc' }],
  });

  return (
    <article>
      <h2 className='font-bold text-xl mb-2 '>Поединки</h2>
      {/* 🎯 Передаем реальные матчи вместо пустого массива */}
      <MatchList tournamentId={id} initialMatches={matches || []} />
    </article>
  );
}
