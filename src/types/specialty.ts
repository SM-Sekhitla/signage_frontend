// types/specialty.ts

export interface Specialty {
  id: string;

  name: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  deletedAt?: string | null;
}

export interface SpecialtyCreate {
  name: string;
}

export interface SpecialtyUpdate {
  name?: string;
  isActive?: boolean;
}

export type SpecialtyOut = Specialty;