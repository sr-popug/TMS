import { TournamentList } from '@/widgets/TournamentList';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/admin');
  return (
    <section>
      <TournamentList type='next' header='Ближайшие турниры' />
      <TournamentList type='prev' header='Прошедшие турниры' />
    </section>
  );
}
