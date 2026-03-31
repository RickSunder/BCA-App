import { z } from 'zod';

export const projectRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  crop: z.string().min(1, 'Crop is required'),
  requestType: z.enum(['BC', 'MABC', 'EBREED'], {
    errorMap: () => ({ message: 'Select a valid request type' }),
  }),
  requestedBy: z.string().min(1, 'Requested by is required'),
  parentLine: z.string().default(''),
  traitOfInterest: z.string().default(''),
});

export const projectSchema = z.object({
  owner: z.string().default(''),
  stage: z.enum(['Initiated', 'Sowing', 'Crossing', 'Transplant', 'Selfing', 'Completed'], {
    errorMap: () => ({ message: 'Select a valid stage' }),
  }),
});

export type ProjectRequestInput = z.infer<typeof projectRequestSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
