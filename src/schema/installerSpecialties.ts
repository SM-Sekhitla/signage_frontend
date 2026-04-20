// schemas/installerSpecialties.ts

import { z } from "zod";

// Base schema
export const installerSpecialtySchema = z.object({
  id: z.string(),

  installerId: z.string(),
  specialty: z.string(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create schema
export const installerSpecialtyCreateSchema =
  installerSpecialtySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Update schema
export const installerSpecialtyUpdateSchema =
  installerSpecialtyCreateSchema.partial();

// Inferred types (optional if you want to derive instead)
export type InstallerSpecialty = z.infer<typeof installerSpecialtySchema>;
export type InstallerSpecialtyCreate = z.infer<typeof installerSpecialtyCreateSchema>;
export type InstallerSpecialtyUpdate = z.infer<typeof installerSpecialtyUpdateSchema>;