import { getTournamentById } from '@/entities/tournament';
import { ChangeTournamentForm } from '@/widgets/ChangeTournamentForm';

export default async function ChangeDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) {
    return '';
  }
  return (
    <article>
      <h2 className='text-2xl lg:text-3xl font-bold'>
        Изменить данные турнира
      </h2>
      <ChangeTournamentForm tournament={tournament} />
    </article>
  );
}
