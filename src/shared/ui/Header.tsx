import { Search } from '@/widgets/Search';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className='mb-3 p-2 border-b border-outline border-ghost '>
      <div className='cont mx-auto max-w-350 flex justify-between items-center'>
        <div className='flex gap-4 items-center'>
          <Link href='/' className='sm:block hidden'>
            <Image src={'/TMS.svg'} alt='logo' width={66} height={38} />
          </Link>
          <Search />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
