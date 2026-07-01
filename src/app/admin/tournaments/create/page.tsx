import { CreateTournamentForm } from '@/widgets/CreateTournamentForm';

export default function Page() {
  return (
    <article>
      <h2 className='font-bold text-3xl'>Создать турнир</h2>
      <CreateTournamentForm />
    </article>
  );
}
