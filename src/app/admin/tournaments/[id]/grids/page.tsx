import { GridsList } from '@/widgets/AdminGrids';

export default async function GridsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <article>
      <h2 className='font-bold text-xl '>Сетки</h2>
      <p className='mb-2 text-ghost'>
        Рекомендуется генерировать сетки уже после добавления всех спортсменов,
        иначе, при добавлении новых придется перезагружать сетку категории
      </p>
      <GridsList tournamentId={id} />
    </article>
  );
}
