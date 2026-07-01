'use client';
import { changeCategories, getCategories } from '@/entities/categories';
import { Category } from '@/shared/lib/prisma/client';
import { useLoadingStore } from '@/shared/model';
import { MiniLoader } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AgeCategory } from '../types';
import CategoryElement from './CategoryElement';

export default function ChangeCategories({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { hideLoading, showLoading } = useLoadingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<AgeCategory[]>([
    {
      id: crypto.randomUUID(),
      age: '',
      weights: [
        {
          id: crypto.randomUUID(),
          weight: '',
        },
      ],
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
          if (!acc[item.age]) {
            acc[item.age] = [];
          }
          acc[item.age].push(item);
          return acc;
        }, {});

        const newCategories: AgeCategory[] = Object.entries(grouped).map(
          ([age, items]) => ({
            id: crypto.randomUUID(),
            age,
            weights: items.map(item => ({
              id: crypto.randomUUID(),
              weight: item.weight,
            })),
          }),
        );

        setCategories(newCategories);
        setIsLoading(false);
      })
      .catch(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [tournamentId]);

  const addAgeCategory = () => {
    setCategories(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        age: '',
        weights: [
          {
            id: crypto.randomUUID(),
            weight: '',
          },
        ],
      },
    ]);
  };

  const handleSubmit = () => {
    showLoading();
    const isValid = categories.every(
      cat => cat.age.trim() && cat.weights.every(w => w.weight.trim()),
    );

    if (!isValid) {
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
