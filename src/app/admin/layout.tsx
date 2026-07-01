import { IsAdminProvider } from '../providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <IsAdminProvider>{children}</IsAdminProvider>;
}
