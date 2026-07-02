import { GridPage } from '@/widgets/GridPage';

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; gridId: string }>;
  searchParams: Promise<{ label?: string }>;
}) {
  const { id, gridId } = await params;
  const { label } = await searchParams;

  return (
    <article>
      <h2 className='font-bold text-xl mb-2'>Сетка {label}</h2>
      <GridPage tournamentId={id} categoryId={gridId} />
    </article>
  );
}
