import { AdminCategories } from '@/widgets/AdminCategories';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <article>
      <h2 className='font-bold text-xl mb-2'>Изменить Категории</h2>
      <AdminCategories tournamentId={id} />
    </article>
  );
}
