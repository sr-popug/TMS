import { FormattedDate, Line } from '@/shared/ui';
import Link from 'next/link';
import { getAllTournaments } from '../api/getAllTournaments';
import { TournamentTableProps } from '../types/TournamentTableProps';

export async function TournamentTableData({
  type,
  isAdmin,
}: TournamentTableProps) {
  const tournaments = await getAllTournaments(type);

  if (!tournaments.length) {
    return <p className='mb-10 text-ghost'>Ничего не найдено</p>;
  }

  return (
    <>
      <Line />
      {tournaments.map(tournament => (
        <div key={tournament.id}>
          <Link
            href={`${isAdmin ? '/admin' : ''}/tournaments/${tournament.id}`}
            className='block mt-3 md:grid md:grid-cols-[600px_minmax(100px,_1fr)] gap-4'
          >
            <div className='md:grid md:grid-cols-[300px_300px] md:text-foreground text-primary-custom flex justify-between md:mb-0 mb-2 '>
              <FormattedDate tournament={tournament} />
              <p className=''>{tournament.place}</p>
            </div>
            <strong className=''>{tournament.name}</strong>
          </Link>
          <div className='mt-3'>
            <Line />
          </div>
        </div>
      ))}
    </>
  );
}
