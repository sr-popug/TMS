import { GridsList } from '@/widgets/AdminGrids';

export default async function GridsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <article>
      <h2 className='font-bold text-xl mb-2'>Сетки</h2>
      <GridsList tournamentId={id} />
    </article>
  );
}
