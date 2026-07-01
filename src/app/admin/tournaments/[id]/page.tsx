import { getTournamentById } from '@/entities/tournament';
import { MainInfo } from '@/widgets/TournamentInfo';

export default async function Page({
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
    <div>
      <MainInfo tournament={tournament} isAdmin />
    </div>
  );
}
