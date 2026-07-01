import { TournamentTimelines } from '@/widgets/Timelines';

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <div className='flex items-center gap-10'>
        <h2 className='font-bold text-xl'>Расписание турнира</h2>
      </div>
      <TournamentTimelines isAdmin tournamentId={id} />
    </div>
  );
}
