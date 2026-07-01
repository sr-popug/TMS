import { TournamentTable } from '@/entities/tournament';

interface Props {
  type: 'next' | 'prev';
  header: string;
  isAdmin?: boolean;
}

export default function TournamentList({ type, header, isAdmin }: Props) {
  return (
    <article>
      <h2 className='text-3xl font-bold mb-6'>{header}</h2>
      <TournamentTable isAdmin={isAdmin || false} type={type} />
    </article>
  );
}
