'use client';
import { getGridMatches } from '@/entities/match';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, Swords } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import GridTree from './GridTree';

interface FighterInfo {
  id: number;
  name: string;
  club: { title: string } | null;
  order: number;
}

interface MatchInfo {
  id: string;
  round: number;
  number: number;
  fighter1: FighterInfo | null;
  fighter2: FighterInfo | null;
  winner: number | null;
}

export default function GridPage({
  categoryId,

  tournamentId,
}: {
  categoryId: string;

  tournamentId: string;
}) {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    getGridMatches(categoryId).then(data => {
      console.log('matches:', JSON.stringify(data, null, 2));
      if (!ignore) {
        setMatches(data as MatchInfo[]);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [categoryId]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Swords className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4 mr-1' /> Назад
        </Button>
      </div>

      <GridTree matches={matches} />
    </div>
  );
}
