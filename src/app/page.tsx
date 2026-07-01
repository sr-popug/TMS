import { TournamentList } from '@/widgets/TournamentList';

export default function Home() {
  return (
    <section>
      <TournamentList type='next' header='Ближайшие турниры' />
      <TournamentList type='prev' header='Прошедшие турниры' />
    </section>
  );
}
