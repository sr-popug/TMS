import { Tournament } from '@/shared/lib/prisma/client';
import Link from 'next/link';
import { DeleteTournament } from './DeleteTournament';

export default function MainInfo({
  tournament,
  isAdmin,
}: {
  tournament: Tournament;
  isAdmin: boolean | undefined;
}) {
  return (
    <section className=''>
      <h2 className='font-bold text-xl'>Основная информация о турнире</h2>
      <div
        className='tournament font-light mt-3'
        dangerouslySetInnerHTML={{ __html: tournament.info }}
      ></div>
      {isAdmin && (
        <Link
          className='hover:bg-ghost block py-2 px-8 bg-card border-ghost border rounded-md mt-3 text-center text-md'
          href={`/admin/tournaments/${tournament.id}/change`}
        >
          Изменить основную информацию
        </Link>
      )}
      {isAdmin && <DeleteTournament id={tournament.id} />}
    </section>
  );
}
