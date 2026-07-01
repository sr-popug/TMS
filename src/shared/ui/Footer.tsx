import Link from 'next/link';

export default async function Footer() {
  return (
    <footer className='mt-10 py-3 px-2 border-t border-ghost text-ghost'>
      <div className='max-w-350 mx-auto flex justify-between lg:flex-row flex-col items-center gap-2'>
        <Link
          href='/report'
          className='underline hover:text-foreground transition-colors'
        >
          Сообщить об ошибке
        </Link>
        <p>TMS {new Date().getFullYear()} © All Rights Reserved</p>
      </div>
    </footer>
  );
}
