'use client';
import { Tournament } from '@/shared/lib/prisma/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  isAdmin?: boolean;
  tournament: Tournament;
}
const getLinks = (id: string, isAdmin: boolean) => {
  const prefix = isAdmin ? '/admin' : '';
  const links = [
    {
      title: 'Основная информация',
      href: `${prefix}/tournaments/${id}`,
    },
    {
      title: 'Расписание',
      href: `${prefix}/tournaments/${id}/timeline`,
    },
    {
      title: 'Участники',
      href: `${prefix}/tournaments/${id}/fighters`,
    },
    {
      title: 'Сетки',
      href: `${prefix}/tournaments/${id}/grids`,
    },
    {
      title: 'Поединки',
      href: `${prefix}/tournaments/${id}/fights`,
    },
  ];
  if (isAdmin) {
    links.push({
      title: 'Категории',
      href: `/admin/tournaments/${id}/categories`,
    });
  }
  return links;
};
export default function TournamentHeader({ isAdmin, tournament }: Props) {
  const path = usePathname();
  return (
    <header className='border-b mb-3 border-ghost'>
      <ul className='flex gap-3 justify-between pb-3 '>
        {getLinks(tournament.id, isAdmin || false).map(el => {
          let is_current_page = false;
          console.log(path);
          console.log(el.href);
          if (path === el.href) {
            is_current_page = true;
          }
          return (
            <li
              className={`${is_current_page ? 'text-primary-custom' : ''}`}
              key={el.title}
            >
              <Link href={el.href}>{el.title}</Link>
            </li>
          );
        })}
      </ul>
    </header>
  );
}
