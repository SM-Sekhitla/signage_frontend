// schemas/user.ts

import { z } from "zod";

/* -----------------------------
   Enums
------------------------------ */

export const roleEnum = z.enum([
  "USER",
  "ADMIN",
  "INSTALLER",
]);

export const accountStatusEnum = z.enum([
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "DELETED",
]);

/* -----------------------------
   Base User
------------------------------ */

export const userSchema = z.object({
  id: z.string(),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .refine((v) => v.trim().length > 0, {
      message: "Name is required",
    }),

  email: z.string().email().transform((v) => v.toLowerCase()),

  roles: z.array(roleEnum).default(["USER"]),

  status: accountStatusEnum,
  emailVerified: z.boolean(),
  enabled: z.boolean(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  deletedAt: z.string().datetime().nullable().optional(),
});

/* -----------------------------
   Create
------------------------------ */

export const userCreateSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .refine((v) => v.trim().length > 0),

  email: z.string().email(),

  password: z.string().min(6),

  roles: z.array(roleEnum).optional(),
});

/* -----------------------------
   Update
------------------------------ */

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  email: z.string().email().optional(),

  roles: z.array(roleEnum).optional(),

  status: accountStatusEnum.optional(),

  emailVerified: z.boolean().optional(),
  enabled: z.boolean().optional(),
});

/* -----------------------------
   Auth / Password flows
------------------------------ */

export const changePasswordSchema = z.object({
  new_password: z.string().min(8),
});

export const emailRequestSchema = z.object({
  email: z.string().email(),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
});

export const resetPasswordSchema = z.object({
  reset_token: z.string(),
  new_password: z.string().min(8),
});

/* -----------------------------
   Inferred Types
------------------------------ */

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type EmailRequest = z.infer<typeof emailRequestSchema>;
export type OTPVerifyRequest = z.infer<typeof otpVerifySchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;