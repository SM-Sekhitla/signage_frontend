import { z } from "zod";

// Enum
export const bookingStatusSchema = z.enum([
  "accepted",
  "declined",
  "completed",
  "cancelled",
]);

// Base schema
export const bookingSchema = z.object({
  id: z.string(),

  address: z.string().optional(),
  drawingsUrl: z.string().url(),

  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  preferredDate: z.string().datetime().optional(),

  projectTitle: z.string(),
  projectDescription: z.string().optional(),
  province: z.string().optional(),

  purchaseOrderUrl: z.string().url().optional(),
  workOrderUrl: z.string().url().optional(),

  status: bookingStatusSchema,

  clientId: z.string().optional(),
  installerId: z.string().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create schema
export const bookingCreateSchema = bookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true, // backend default
});

// Update schema
export const bookingUpdateSchema = bookingCreateSchema
  .partial()
  .extend({
    status: bookingStatusSchema.optional(),
  });
