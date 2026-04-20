// types/installerAvailability.ts

export interface InstallerAvailability {
  id: string;

  installerId: string;

  date: string; // ISO datetime
  available: boolean;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface InstallerAvailabilityCreate {
  installerId: string;
  date: string;

  available?: boolean;
  notes?: string;
}

export interface InstallerAvailabilityUpdate {
  date?: string;
  available?: boolean;
  notes?: string;
}

export type InstallerAvailabilityOut = InstallerAvailability;