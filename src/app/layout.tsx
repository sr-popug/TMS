import { cn } from '@/shared/lib/utils';
import { Footer, Header, Loader } from '@/shared/ui';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { RootProvider } from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'TCS - Система контроля турниров по единоборствам',
  description: 'Сложная система контроля турниров по единоборствам.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='ru'
      className={cn('font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <body className='bg-background'>
        <RootProvider>
          <Header />
          <main className='mx-auto max-w-350 px-2 w-full min-h-[calc(100vh-158px)]'>
            {children}
          </main>
          <Footer />
          <Toaster theme='dark' position='bottom-right' />
        </RootProvider>
        <Loader />
      </body>
    </html>
  );
}
