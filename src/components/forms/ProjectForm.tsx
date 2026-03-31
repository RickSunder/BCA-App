'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectSchema } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { Project } from '@/types';

type FormValues = z.infer<typeof projectSchema>;

interface Props {
  defaultValues?: Partial<Project>;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STAGE_OPTIONS = [
  { value: 'Initiated', label: 'Initiated' },
  { value: 'Sowing', label: 'Sowing' },
  { value: 'Crossing', label: 'Crossing' },
  { value: 'Transplant', label: 'Transplant' },
  { value: 'Selfing', label: 'Selfing' },
  { value: 'Completed', label: 'Completed' },
];

export default function ProjectForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      owner: defaultValues?.owner ?? '',
      stage: defaultValues?.stage ?? 'Initiated',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Owner" {...register('owner')} />
      <Select
        label="Stage"
        options={STAGE_OPTIONS}
        error={errors.stage?.message}
        {...register('stage')}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save
        </Button>
      </div>
    </form>
  );
}
