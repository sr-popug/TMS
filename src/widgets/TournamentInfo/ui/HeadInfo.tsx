import { Tournament } from '@/shared/lib/prisma/client';
import { FormattedDate } from '@/shared/ui';

export default function HeadInfo({ tournament }: { tournament: Tournament }) {
  return (
    <header className='flex gap-4 justify-between mt-5 mb-10'>
      <div>
        <h1 className='text-2xl lg:text-3xl font-bold'>{tournament.name}</h1>
        <p className='text-ghost text-sm'>{tournament.description || ''}</p>
      </div>
      <p className='dates flex flex-col text-primary-custom'>
        <FormattedDate tournament={tournament} />
        <span className='text-nowrap'>{tournament.place}</span>
      </p>
    </header>
  );
}
