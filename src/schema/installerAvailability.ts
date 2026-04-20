// schemas/installerAvailability.ts

import { z } from "zod";

// Base schema
export const installerAvailabilitySchema = z.object({
  id: z.string(),

  installerId: z.string(),

  date: z.string().datetime(),
  available: z.boolean(),

  notes: z.string().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create schema
export const installerAvailabilityCreateSchema =
  installerAvailabilitySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Update schema
export const installerAvailabilityUpdateSchema =
  installerAvailabilityCreateSchema.partial();

// Types (inferred)
export type InstallerAvailability = z.infer<
  typeof installerAvailabilitySchema
>;

export type InstallerAvailabilityCreate = z.infer<
  typeof installerAvailabilityCreateSchema
>;

export type InstallerAvailabilityUpdate = z.infer<
  typeof installerAvailabilityUpdateSchema
>;