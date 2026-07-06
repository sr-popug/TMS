'use client';
import { changeFighter } from '@/entities/fighter';
import { Category, Club } from '@/shared/lib/prisma/client';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Loader2 } from 'lucide-react';
import { ChangeEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FighterWithRelations } from '../types';

interface Props {
  fighter: FighterWithRelations;
  clubs: Club[];
  categories: Category[];
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export default function EditFighterModal({
  fighter,
  clubs,
  categories,
  open,
  onSuccess,
  onClose,
}: Props) {
  const initBirthday = () => {
    const d = new Date(fighter.birthday);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const [name, setName] = useState(fighter.name);
  const [clubId, setClubId] = useState(fighter.club?.id || 0);
  const [categoryId, setCategoryId] = useState(fighter.category?.id || '');
  const [weight, setWeight] = useState(String(fighter.weight));
  const [birthdayStr, setBirthdayStr] = useState(initBirthday());
  const [saving, setSaving] = useState(false);

  const ageOptions = useMemo(() => {
    return [...new Set(categories.map(c => c.age))].sort();
  }, [categories]);

  const formatBirthday = (value: string): string => {
    let clean = value.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');

    if (parts.length > 3) {
      clean = parts.slice(0, 3).join('.');
    }

    const digits = clean.replace(/\D/g, '').slice(0, 8);
    let result = '';

    if (digits.length > 0) result += digits.slice(0, 2);
    if (digits.length > 2 || (parts[0]?.length === 2 && value.endsWith('.'))) {
      result += '.' + digits.slice(2, 4);
    }
    if (digits.length > 4 || (parts[1]?.length === 2 && value.endsWith('.'))) {
      result += '.' + digits.slice(4, 8);
    }

    return result;
  };

  const parseBirthday = (value: string): Date | null => {
    const parts = value.split('.');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    )
      return null;
    return date;
  };

  const calculateAge = (birthday: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
    return age;
  };

  const getAgeGroup = (age: number, availableGroups: string[]): string => {
    const exact = availableGroups.find(
      g => g.endsWith('+') && age >= parseInt(g),
    );
    if (exact) return exact;

    const range = availableGroups.find(g => {
      const [min, max] = g.split('-').map(Number);
      return age >= min && age <= max;
    });
    return range || '';
  };

  const autoSelectCategory = (
    currentBirthdayStr: string,
    currentWeightStr: string,
  ) => {
    const parsed = parseBirthday(currentBirthdayStr);
    if (!parsed) return;

    const calculatedAge = calculateAge(parsed);
    const group = getAgeGroup(calculatedAge, ageOptions);

    if (group) {
      const w = parseFloat(currentWeightStr);
      if (!isNaN(w)) {
        const catsInAge = categories.filter(c => c.age === group);

        const normalCats = catsInAge
          .filter(c => !c.weight.includes('+'))
          .sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));

        const absoluteCat = catsInAge.find(c => c.weight.includes('+'));
        const targetCategory = normalCats.find(c => w <= parseFloat(c.weight));

        if (targetCategory) {
          setCategoryId(targetCategory.id);
        } else if (absoluteCat) {
          setCategoryId(absoluteCat.id);
        }
      }
    }
  };

  const handleBirthdayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatBirthday(value);
    setBirthdayStr(formatted);

    autoSelectCategory(formatted, weight);
  };

  // Слушатель изменения веса
  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeight(value);
    // Запускаем подбор сразу с новым значением веса
    autoSelectCategory(birthdayStr, value);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Введите имя');

    const parsedBirthday = parseBirthday(birthdayStr);
    if (!parsedBirthday) return toast.error('Введите корректную дату рождения');

    setSaving(true);
    try {
      await changeFighter({
        id: fighter.id,
        name: name.trim(),
        clubId: clubId || null,
        categoryId: categoryId || null,
        weight: parseFloat(weight) || 0,
        birthday: parsedBirthday,
        tournamentId: fighter.tournamentId,
        order: fighter.order,
      });

      toast.success('Боец обновлён');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при обновлении';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md bg-card text-card-foreground'>
        <DialogHeader>
          <DialogTitle>Редактирование бойца</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {/* ИМЯ */}
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>
              Имя
            </label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Имя Фамилия'
              disabled={saving}
            />
          </div>

          {/* ВЕС (Переключен на кастомный обработчик) */}
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>
              Вес (кг)
            </label>
            <Input
              value={weight}
              onChange={handleWeightChange}
              placeholder='70.5'
              disabled={saving}
            />
          </div>

          {/* ДАТА РОЖДЕНИЯ */}
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>
              Дата рождения
            </label>
            <Input
              value={birthdayStr}
              onChange={handleBirthdayChange}
              placeholder='ДД.ММ.ГГГГ'
              maxLength={10}
              disabled={saving}
            />
          </div>

          {/* КЛУБ */}
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>
              Клуб
            </label>
            <Select
              value={String(clubId)}
              onValueChange={v => setClubId(Number(v))}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder='Выберите клуб' />
              </SelectTrigger>
              <SelectContent>
                {clubs.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* КАТЕГОРИЯ */}
          <div className='space-y-1'>
            <label className='text-xs font-medium text-muted-foreground'>
              Категория
            </label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder='Выберите категория'>
                  {categoryId &&
                    (() => {
                      const selectedCat = categories.find(
                        c => c.id === categoryId,
                      );
                      return selectedCat
                        ? `${selectedCat.age} / ${selectedCat.weight} кг`
                        : 'Выберите категорию';
                    })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map(age => (
                  <SelectGroup key={age}>
                    <SelectLabel className='text-muted-foreground text-xs font-bold'>
                      {age}
                    </SelectLabel>
                    {categories
                      .filter(c => c.age === age)
                      .map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.age} / {c.weight} кг
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex gap-2 justify-end mt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button type='button' onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
