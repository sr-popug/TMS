import { FightersList } from '@/widgets/AdminFighters';

export default async function FightersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <article>
      <h2 className='font-bold text-xl mb-2'>Участники</h2>
      <FightersList tournamentId={id} />
    </article>
  );
}
