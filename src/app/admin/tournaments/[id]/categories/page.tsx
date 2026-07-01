import { getTournamentById } from '@/entities/tournament';
import { ChangeCategories } from '@/widgets/ChangeCategories';

export default async function CategoryPage({
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
      <h2 className='font-bold text-xl mb-2'>Изменить Категории</h2>
      <ChangeCategories tournamentId={id} />
    </article>
  );
}
