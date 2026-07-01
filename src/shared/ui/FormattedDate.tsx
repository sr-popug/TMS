import { Tournament } from '../lib/prisma/client';
import getDate from '../lib/scripts/getDate';

export default function FormattedDate({
  tournament,
}: {
  tournament: Tournament;
}) {
  return (
    <span className=''>
      {tournament.startDate.getMonth() == tournament.endDate?.getMonth()
        ? tournament.startDate.getDay()
        : getDate(tournament.startDate).split(' ').slice(0, 2).join(' ')}
      {tournament.endDate ? ' - ' + getDate(tournament.endDate) : ''}
    </span>
  );
}
