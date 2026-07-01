import { getTournamentById } from '@/entities/tournament';
import { HeadInfo, TournamentHeader } from '@/widgets/TournamentInfo';
import { CircleAlert } from 'lucide-react';
import React from 'react';

export default async function layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) {
    return (
      <div className='w-full h-[80vh] text-2xl flex gap-2 items-center justify-center text-red-700 font-bold'>
        <CircleAlert width={30} />
        Турнир не найден
      </div>
    );
  }
  return (
    <article>
      <TournamentHeader isAdmin tournament={tournament} />
      <HeadInfo tournament={tournament} />
      {children}
    </article>
  );
}
