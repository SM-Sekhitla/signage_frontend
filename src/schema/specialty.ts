// schemas/specialty.ts

import { z } from "zod";

// Base schema
export const specialtySchema = z.object({
  id: z.string(),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .refine((v) => v.trim().length > 0, {
      message: "Name is required",
    }),

  isActive: z.boolean(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  deletedAt: z.string().datetime().nullable().optional(),
});

// Create schema
export const specialtyCreateSchema = specialtySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  isActive: true, // backend default
});

// Update schema
export const specialtyUpdateSchema = specialtySchema
  .partial()
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Inferred types (optional but recommended)
export type Specialty = z.infer<typeof specialtySchema>;
export type SpecialtyCreate = z.infer<typeof specialtyCreateSchema>;
export type SpecialtyUpdate = z.infer<typeof specialtyUpdateSchema>;