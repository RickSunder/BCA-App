'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectRequestSchema } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { ProjectRequest } from '@/types';

type FormValues = z.infer<typeof projectRequestSchema>;

interface Props {
  defaultValues?: Partial<ProjectRequest>;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const REQUEST_TYPE_OPTIONS = [
  { value: 'BC', label: 'BC' },
  { value: 'MABC', label: 'MABC' },
  { value: 'EBREED', label: 'EBREED' },
];

export default function ProjectRequestForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(projectRequestSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      crop: defaultValues?.crop ?? '',
      requestType: defaultValues?.requestType ?? 'BC',
      requestedBy: defaultValues?.requestedBy ?? '',
      parentLine: defaultValues?.parentLine ?? '',
      traitOfInterest: defaultValues?.traitOfInterest ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Input label="Crop" error={errors.crop?.message} {...register('crop')} />
      <Select
        label="Request Type"
        options={REQUEST_TYPE_OPTIONS}
        error={errors.requestType?.message}
        {...register('requestType')}
      />
      <Input label="Requested By" error={errors.requestedBy?.message} {...register('requestedBy')} />
      <Input label="Parent Line" {...register('parentLine')} />
      <Input label="Trait of Interest" {...register('traitOfInterest')} />
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
