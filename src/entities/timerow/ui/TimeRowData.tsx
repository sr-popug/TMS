import { getTimeRows } from '../api/getTimeRows';

export default async function TimeRowData({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const timeRows = await getTimeRows(tournamentId);
  if (!timeRows.length) {
    return <p className='mb-5 text-ghost'>Расписание не найдено </p>;
  }
  return 123;
}
