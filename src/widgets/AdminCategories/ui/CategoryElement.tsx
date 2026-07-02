import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Plus, X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { AgeCategory } from '../types';
interface Props {
  categories: AgeCategory[];
  setCategories: Dispatch<SetStateAction<AgeCategory[]>>;
  category: AgeCategory;
}

export default function CategoryElement({
  categories,
  setCategories,
  category,
}: Props) {
  const removeAgeCategory = (categoryId: string) => {
    if (categories.length === 1) {
      toast.error('Должна быть хотя бы одна возрастная категория');
      return;
    }
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const updateAge = (categoryId: string, age: string) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === categoryId ? { ...cat, age } : cat)),
    );
  };

  const addWeightCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              weights: [
                ...cat.weights,
                {
                  id: crypto.randomUUID(),
                  weight: '',
                },
              ],
            }
          : cat,
      ),
    );
  };

  const removeWeightCategory = (categoryId: string, weightId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              weights:
                cat.weights.length === 1
                  ? cat.weights
                  : cat.weights.filter(w => w.id !== weightId),
            }
          : cat,
      ),
    );

    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.weights.length === 1) {
      toast.error('Должна быть хотя бы одна весовая категория');
    }
  };

  const updateWeight = (
    categoryId: string,
    weightId: string,
    weight: string,
  ) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              weights: cat.weights.map(w =>
                w.id === weightId ? { ...w, weight } : w,
              ),
            }
          : cat,
      ),
    );
  };
  return (
    <div key={category.id} className='border rounded-lg p-4 space-y-3'>
      <div className='flex items-center gap-2'>
        <Input
          value={category.age}
          onChange={e => updateAge(category.id, e.target.value)}
          placeholder='Возраст (например: 18-25)'
          className='max-w-60'
        />
        <Button
          type='button'
          variant='destructive'
          size='sm'
          onClick={() => removeAgeCategory(category.id)}
          disabled={categories.length === 1}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      <div className='space-y-2 pl-4'>
        <p className='text-sm text-muted-foreground font-medium'>
          Весовые категории:
        </p>
        {category.weights.map(weight => (
          <div key={weight.id} className='flex items-center gap-2'>
            <Input
              value={weight.weight}
              onChange={e =>
                updateWeight(category.id, weight.id, e.target.value)
              }
              placeholder='Вес (например: 70)'
              className='max-w-40'
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => removeWeightCategory(category.id, weight.id)}
              disabled={category.weights.length === 1}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ))}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => addWeightCategory(category.id)}
        >
          <Plus className='h-3 w-3 mr-1' /> Добавить вес
        </Button>
      </div>
    </div>
  );
}
