// schemas/profile.ts

import { z } from "zod";

// Base schema
export const profileSchema = z.object({
  id: z.string(),

  bio: z.string().optional(),
  companyLogo: z.string().url().optional(),
  companyName: z.string().optional(),
  companyPortfolioUrl: z.string().url().optional(),
  contactNumber: z.string().optional(),

  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .refine((v) => v.trim().length > 0, {
      message: "Name is required",
    }),

  profilePhoto: z.string().url().optional(),
  province: z.string().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create schema
export const profileCreateSchema = profileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update schema
export const profileUpdateSchema =
  profileCreateSchema.partial();

// Inferred types (optional but recommended)
export type Profile = z.infer<typeof profileSchema>;
export type ProfileCreate = z.infer<typeof profileCreateSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;