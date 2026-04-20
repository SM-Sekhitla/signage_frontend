// types/installerSpecialties.ts

export interface InstallerSpecialty {
  id: string;

  installerId: string;
  specialty: string;

  createdAt: string;
  updatedAt: string;
}

export interface InstallerSpecialtyCreate {
  installerId: string;
  specialty: string;
}

export interface InstallerSpecialtyUpdate {
  specialty?: string;
}

export type InstallerSpecialtyOut = InstallerSpecialty;