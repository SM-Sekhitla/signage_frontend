// types/user.ts

export type Role = "USER" | "ADMIN" | "INSTALLER";

export type AccountStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "DELETED";

export interface User {
  id: string;

  name: string;
  email?: string;

  roles: Role[];

  status: AccountStatus;
  emailVerified: boolean;
  enabled: boolean;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  // NOTE: password intentionally excluded
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;

  roles?: Role[];
}

export interface UserUpdate {
  name?: string;
  email?: string;

  roles?: Role[];
  status?: AccountStatus;

  emailVerified?: boolean;
  enabled?: boolean;
}

export interface ChangePasswordRequest {
  new_password: string;
}

export interface EmailRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
}