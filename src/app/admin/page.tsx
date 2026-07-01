import { TournamentList } from '@/widgets/TournamentList';
import Link from 'next/link';

export default function Home() {
  return (
    <section>
      <Link
        className='block w-full py-1 rounded-sm border border-ghost bg-card mb-5 text-center'
        href={'/admin/tournaments/create'}
      >
        Создать турнир
      </Link>
      <TournamentList isAdmin type='next' header='Ближайшие турниры' />
      <TournamentList isAdmin type='prev' header='Прошедшие турниры' />
    </section>
  );
}
