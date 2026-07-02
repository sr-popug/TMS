'use client';
import { changeCategories, getCategories } from '@/entities/category';
import { Category } from '@/shared/lib/prisma/client';
import { useLoadingStore } from '@/shared/model';
import { MiniLoader } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AgeCategory } from '../types';
import CategoryElement from './CategoryElement';

const MMA_PRESET: { age: string; weights: string[] }[] = [
  {
    age: '12-13',
    weights: ['32', '36', '40', '44', '48', '52', '57', '62', '67'],
  },
  {
    age: '14-15',
    weights: ['36', '40', '44', '48', '52', '57', '62', '67', '73', '80'],
  },
  {
    age: '16-17',
    weights: ['48', '52', '57', '61.2', '65.8', '70.3', '77.1', '83.9', '93'],
  },
  {
    age: '18-20',
    weights: [
      '52.2',
      '56.7',
      '61.2',
      '65.8',
      '70.3',
      '77.1',
      '83.9',
      '93',
      '120.2',
      '120.2+',
    ],
  },
  {
    age: '18+',
    weights: [
      '52.2',
      '56.7',
      '61.2',
      '65.8',
      '70.3',
      '77.1',
      '83.9',
      '93',
      '120.2',
      '120.2+',
    ],
  },
];
export default function AdminCategories({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { hideLoading, showLoading } = useLoadingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [preset, setPreset] = useState<string>('custom');
  const [categories, setCategories] = useState<AgeCategory[]>([
    {
      id: crypto.randomUUID(),
      age: '',
      weights: [{ id: crypto.randomUUID(), weight: '' }],
    },
  ]);

  useEffect(() => {
    let ignore = false;

    getCategories(tournamentId)
      .then(data => {
        if (ignore) return;

        if (!data.length) {
          setIsLoading(false);
          return;
        }

        const grouped = data.reduce<Record<string, Category[]>>((acc, item) => {
          if (!acc[item.age]) acc[item.age] = [];
          acc[item.age].push(item);
          return acc;
        }, {});

        const newCategories: AgeCategory[] = Object.entries(grouped).map(
          ([age, items]) => ({
            id: crypto.randomUUID(),
            age,
            weights: items.map(item => ({
              id: item.id,
              weight: item.weight,
            })),
          }),
        );

        setCategories(newCategories);
        setIsLoading(false);
      })
      .catch(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [tournamentId]);

  const applyPreset = (key: string) => {
    if (key === 'custom') return;

    const presetData = MMA_PRESET;
    const newCategories: AgeCategory[] = presetData.map(group => ({
      id: crypto.randomUUID(),
      age: group.age,
      weights: group.weights.map(w => ({
        id: crypto.randomUUID(),
        weight: w,
      })),
    }));

    setCategories(newCategories);
    setPreset(key);
    toast.success('Пресет применён');
  };

  const addAgeCategory = () => {
    setCategories(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        age: '',
        weights: [{ id: crypto.randomUUID(), weight: '' }],
      },
    ]);
    setPreset('custom');
  };

  const handleSubmit = () => {
    showLoading();
    const isValid = categories.every(
      cat => cat.age.trim() && cat.weights.every(w => w.weight.trim()),
    );

    if (!isValid) {
      hideLoading();
      toast.error('Заполните все поля');
      return;
    }

    const resultCategories: Omit<Category, 'id'>[] = [];
    categories.forEach(el => {
      el.weights.forEach(weight => {
        resultCategories.push({
          age: el.age || '',
          weight: weight.weight || '',
          tournamentId: tournamentId || '',
        });
      });
    });

    changeCategories(resultCategories)
      .then(() => {
        hideLoading();
        toast.success('Категории сохранены');
      })
      .catch(err => {
        hideLoading();
        toast.error(err.message);
      });
  };

  if (isLoading) {
    return <MiniLoader />;
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>Пресет:</span>
        <Select value={preset} onValueChange={applyPreset}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Пресет' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='custom'>Свой</SelectItem>
              <SelectItem value='mma'>ММА</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {categories.map(category => (
        <CategoryElement
          setCategories={setCategories}
          categories={categories}
          category={category}
          key={category.id}
        />
      ))}

      <Button
        type='button'
        variant='outline'
        onClick={addAgeCategory}
        className='w-full'
      >
        <Plus className='h-4 w-4 mr-2' /> Добавить возрастную категорию
      </Button>

      <Button type='button' onClick={handleSubmit} className='w-full'>
        Сохранить категории
      </Button>
    </div>
  );
}
