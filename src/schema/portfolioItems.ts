// schemas/portfolioItems.ts

import { z } from "zod";

// Base schema
export const portfolioItemSchema = z.object({
  id: z.string(),

  installerId: z.string(),

  imageUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create schema
export const portfolioItemCreateSchema = portfolioItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update schema
export const portfolioItemUpdateSchema =
  portfolioItemCreateSchema.partial();

// Inferred types (optional)
export type PortfolioItem = z.infer<typeof portfolioItemSchema>;
export type PortfolioItemCreate = z.infer<
  typeof portfolioItemCreateSchema
>;
export type PortfolioItemUpdate = z.infer<
  typeof portfolioItemUpdateSchema
>;