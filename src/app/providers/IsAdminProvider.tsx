'use client';
import { ReactNode } from 'react';

export default function IsAdminProvider({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
