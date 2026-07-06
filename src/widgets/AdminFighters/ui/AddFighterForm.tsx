'use client';
import { addClub } from '@/entities/club';
import { addFighter } from '@/entities/fighter';
import { Category, Club } from '@/shared/lib/prisma/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Loader2 } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Props {
  tournamentId: string;
  clubs: Club[];
  categories: (Category & { label: string })[];
  onSuccess: () => void;
  onClubCreated: (club: Club) => void;
}

type FormValues = {
  name: string;
  club: string;
  birthday: string;
  weight: string;
  age: string;
};

export default function AddFighterForm({
  tournamentId,
  clubs,
  categories,
  onSuccess,
  onClubCreated,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [suggestions, setSuggestions] = useState<Club[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const clubRef = useRef<HTMLInputElement>(null);
  const birthdayRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  const ageOptions = [...new Set(categories.map(c => c.age))].sort();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      club: '',
      birthday: '',
      weight: '',
      age: '',
    },
  });

  const age = watch('age');
  const weight = watch('weight');
  const club = watch('club');

  const matchedCategory = (() => {
    if (!age || !weight) return null;
    const w = parseFloat(weight);
    if (isNaN(w)) return null;

    const catsInAge = categories
      .filter(c => c.age === age)
      .sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));

    const absoluteCat = catsInAge.find(c => c.weight.indexOf('+') >= 0);
    if (absoluteCat?.weight && parseFloat(absoluteCat?.weight || '0') < w) {
      return absoluteCat;
    }

    return catsInAge.find(c => w <= parseFloat(c.weight)) || null;
  })();

  const focusField = (field: keyof FormValues) => {
    const refs = {
      name: nameRef,
      club: clubRef,
      birthday: birthdayRef,
      weight: weightRef,
      age: { current: null },
    };

    setTimeout(() => {
      const targetRef = refs[field];
      if (targetRef && 'current' in targetRef && targetRef.current) {
        (targetRef.current as HTMLInputElement).focus();
      }
    }, 0);
  };

  const formatBirthday = (value: string): string => {
    // 1. Очищаем от всего, кроме цифр и точек
    let clean = value.replace(/[^0-9.]/g, '');

    // 2. Разбиваем по точкам, чтобы контролировать сегменты
    const parts = clean.split('.');

    // Ограничиваем количество сегментов (ДД . ММ . ГГГГ -> максимум 3 части)
    if (parts.length > 3) {
      clean = parts.slice(0, 3).join('.');
    }

    // 3. Магия автоподстановки и разрешения ручного ввода точек:
    const digits = clean.replace(/\D/g, '').slice(0, 8);
    let result = '';

    if (digits.length > 0) {
      result += digits.slice(0, 2);
    }
    // Ставим точку, если ввели больше 2 цифр ИЛИ если пользователь сам поставил точку после первых цифр
    if (digits.length > 2 || (parts[0]?.length === 2 && value.endsWith('.'))) {
      result += '.' + digits.slice(2, 4);
    }
    // То же самое для года
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

  const handleBirthdayChange = (
    value: string,
    onChangeField: (v: string) => void,
  ) => {
    const formatted = formatBirthday(value);
    onChangeField(formatted);

    const parsed = parseBirthday(formatted);
    if (parsed) {
      const calculatedAge = calculateAge(parsed);
      const group = getAgeGroup(calculatedAge, ageOptions);
      if (group) {
        setValue('age', group, { shouldValidate: true });
      }
    }
  };

  const handleClubChange = (
    value: string,
    onChangeField: (v: string) => void,
  ) => {
    onChangeField(value);

    if (value.length > 0) {
      const filtered = clubs.filter(c =>
        c.title.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const onKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof FormValues,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields: (keyof FormValues)[] = [
        'name',
        'club',
        'birthday',
        'weight',
      ];
      const idx = fields.indexOf(field);
      if (idx < fields.length - 1) {
        focusField(fields[idx + 1]);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const getOrCreateClub = async (title: string): Promise<number> => {
    const existing = clubs.find(
      c => c.title.toLowerCase() === title.toLowerCase(),
    );
    if (existing) return existing.id;
    const created = await addClub({ title, tournamentId });
    onClubCreated({ id: created.id, title, tournamentId: tournamentId });
    return created.id;
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.name.trim()) return toast.error('Введите имя бойца');
    if (!data.club.trim()) return toast.error('Введите клуб');
    if (!data.age) return toast.error('Выберите возрастную группу');
    if (!data.weight.trim() || isNaN(Number(data.weight)))
      return toast.error('Введите корректный вес');
    if (!matchedCategory) return toast.error('Нет подходящей категории');

    const parsedBirthday = parseBirthday(data.birthday);

    setAdding(true);
    try {
      const clubId = await getOrCreateClub(data.club.trim());
      await addFighter({
        name: data.name.trim(),
        clubId,
        weight: parseFloat(data.weight.trim()),
        categoryId: matchedCategory.id,
        tournamentId,
        order: 0,
        birthday: parsedBirthday || new Date(),
      });

      toast.success(`${data.name} добавлен`);
      reset();
      setSuggestions([]);
      setShowSuggestions(false);
      onSuccess();
      focusField('name');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при добавлении';
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='p-4 border rounded-lg space-y-3 bg-card text-card-foreground'
    >
      <h3 className='font-medium text-sm text-muted-foreground'>
        Быстрое добавление бойца
      </h3>
      <div className='flex gap-3 flex-wrap items-end'>
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-muted-foreground'>
            ФИО
          </label>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Введите имя бойца' }}
            render={({ field }) => (
              <Input
                {...field}
                ref={nameRef}
                placeholder='ФИО'
                onKeyDown={e => onKeyDown(e, 'name')}
                className='w-56'
                disabled={adding}
              />
            )}
          />
        </div>

        <div className='flex flex-col gap-1 relative'>
          <label className='text-xs font-medium text-muted-foreground'>
            Клуб
          </label>
          <Controller
            name='club'
            control={control}
            rules={{ required: 'Введите клуб' }}
            render={({ field }) => (
              <>
                <Input
                  {...field}
                  ref={clubRef}
                  placeholder='Клуб'
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    // 1. Обновляем состояние в react-hook-form
                    field.onChange(e.target.value);
                    // 2. Запускаем твой крутой поиск подсказок
                    handleClubChange(e.target.value, () => {});
                  }}
                  onKeyDown={e => onKeyDown(e, 'club')}
                  onFocus={() => field.value && setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className='w-36'
                  disabled={adding}
                  autoComplete='off'
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className='absolute top-full left-0 right-0 z-20 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto mt-1'>
                    {suggestions.map(c => (
                      <button
                        key={c.id}
                        type='button'
                        className='w-full text-left px-3 py-1.5 text-sm hover:bg-muted text-popover-foreground'
                        onMouseDown={() => {
                          // При клике на подсказку жестко прописываем значение в форму
                          setValue('club', c.title, { shouldValidate: true });
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && suggestions.length === 0 && club.trim() && (
                  <div className='absolute top-full left-0 right-0 z-20 bg-popover border rounded-md shadow-md mt-1 p-2 text-xs text-muted-foreground'>
                    Будет создан новый:{' '}
                    <span className='font-semibold text-foreground'>
                      {club}
                    </span>
                  </div>
                )}
              </>
            )}
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-muted-foreground'>
            Дата рождения
          </label>
          <Controller
            name='birthday'
            control={control}
            rules={{ required: 'Введите дату рождения' }}
            render={({ field }) => (
              <Input
                {...field}
                ref={birthdayRef}
                placeholder='ДД.ММ.ГГГГ'
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleBirthdayChange(e.target.value, field.onChange)
                }
                onKeyDown={e => onKeyDown(e, 'birthday')}
                className='w-28'
                disabled={adding}
                maxLength={10}
              />
            )}
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-muted-foreground'>
            Возраст
          </label>
          <Controller
            name='age'
            control={control}
            rules={{ required: 'Выберите возрастную группу' }}
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value}
                onValueChange={value => {
                  field.onChange(value);
                  // После выбора группы автоматически переводим фокус на инпут веса
                  focusField('weight');
                }}
                disabled={adding}
              >
                <SelectTrigger className='h-9 w-28 text-foreground bg-background'>
                  <SelectValue placeholder='Группа' />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* ВЕС */}
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-muted-foreground'>
            Вес (кг)
          </label>
          <Controller
            name='weight'
            control={control}
            rules={{ required: 'Введите вес' }}
            render={({ field }) => (
              <Input
                {...field}
                ref={weightRef}
                placeholder='70.5'
                onKeyDown={e => onKeyDown(e, 'weight')}
                className='w-20'
                disabled={adding}
              />
            )}
          />
        </div>

        {matchedCategory && (
          <div className='h-9 flex items-center px-3 bg-muted text-muted-foreground rounded-md text-xs font-medium border border-dashed max-w-xs truncate'>
            Категория:{' '}
            {matchedCategory.label ||
              `${matchedCategory.age} / ${matchedCategory.weight}кг`}
          </div>
        )}

        <Button
          type='submit'
          disabled={adding || isSubmitting}
          className='ml-auto'
        >
          {adding ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}
