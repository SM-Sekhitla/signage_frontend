import { Booking, BookingCreate, BookingUpdate } from "./booking";
import {
  InstallerAvailability,
  InstallerAvailabilityCreate,
  InstallerAvailabilityUpdate,
} from "./installerAvailability";
import {
  InstallerSpecialty,
  InstallerSpecialtyCreate,
  InstallerSpecialtyUpdate,
} from "./installerSpecialties";
import {
  PortfolioItem,
  PortfolioItemCreate,
  PortfolioItemUpdate,
} from "./portfolioItems";
import { Profile, ProfileCreate, ProfileUpdate } from "./profile";
import { Specialty, SpecialtyCreate, SpecialtyUpdate } from "./specialty";
import { User, UserCreate, UserUpdate } from "./user";

export interface DataContextType {
  isBootstrapping: boolean;

  /* ---------------- BOOKINGS ---------------- */
  bookings: {
    data: Booking[];

    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    createError: unknown;
    updateError: unknown;
    deleteError: unknown;

    add: (booking: BookingCreate) => Promise<Booking>;
    update: (id: string, booking: BookingUpdate) => Promise<Booking>;
    delete: (id: string) => Promise<void>;

    get: (id: string) => Promise<Booking | null>;
    getByInstaller: (installerId: string) => Promise<Booking[]>;
    getByClient: (clientId: string) => Promise<Booking[]>;

    search: (query: string) => Booking[];
  };

  /* ---------------- INSTALLER AVAILABILITY ---------------- */
  installerAvailability: {
    data: InstallerAvailability[];

    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    createError: unknown;
    updateError: unknown;
    deleteError: unknown;

    add: (data: InstallerAvailabilityCreate) => Promise<InstallerAvailability>;
    update: (
      id: string,
      data: InstallerAvailabilityUpdate
    ) => Promise<InstallerAvailability>;
    delete: (id: string) => Promise<void>;

    get: (id: string) => Promise<InstallerAvailability | null>;
    getByInstaller: (installerId: string) => Promise<InstallerAvailability[]>;

    search: (query: string) => InstallerAvailability[];
  };

  /* ---------------- INSTALLER SPECIALTIES ---------------- */
  installerSpecialties: {
    data: InstallerSpecialty[];

    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    createError: unknown;
    updateError: unknown;
    deleteError: unknown;

    add: (
      data: InstallerSpecialtyCreate
    ) => Promise<InstallerSpecialty>;

    update: (
      id: string,
      data: InstallerSpecialtyUpdate
    ) => Promise<InstallerSpecialty>;

    delete: (id: string) => Promise<void>;

    getByInstaller: (installerId: string) => Promise<InstallerSpecialty[]>;

    search: (query: string) => InstallerSpecialty[];
  };

  /* ---------------- PROFILES ---------------- */
  profiles: {
    data: Profile | null;

    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    createError: unknown;
    updateError: unknown;
    deleteError: unknown;

    get: (id: string) => Promise<Profile | null>;
    getByUser: (userId: string) => Promise<Profile | null>;

    create: (data: ProfileCreate) => Promise<Profile>;
    update: (id: string, data: ProfileUpdate) => Promise<Profile>;
    delete: (id: string) => Promise<void>;

    search: (query: string) => Profile[];
  };

  /* ---------------- PORTFOLIO ITEMS ---------------- */
  portfolioItems: {
    data: PortfolioItem[];

    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    createError: unknown;
    updateError: unknown;
    deleteError: unknown;

    add: (item: PortfolioItemCreate) => Promise<PortfolioItem>;
    update: (
      id: string,
      item: PortfolioItemUpdate
    ) => Promise<PortfolioItem>;
    delete: (id: string) => Promise<void>;

    getByInstaller: (installerId: string) => Promise<PortfolioItem[]>;

    search: (query: string) => PortfolioItem[];
  };

  /* ---------------- SPECIALTIES (MASTER TABLE) ---------------- */
  specialties: {
    data: Specialty[];

    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    createError: unknown;
    updateError: unknown;
    deleteError: unknown;

    add: (data: SpecialtyCreate) => Promise<Specialty>;
    update: (id: string, data: SpecialtyUpdate) => Promise<Specialty>;
    delete: (id: string) => Promise<void>;

    search: (query: string) => Specialty[];
  };

  /* ---------------- USERS ---------------- */
  users: {
    data: User[];

    stats: any[];

    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    createError: unknown;
    updateError: unknown;
    deleteError: unknown;

    get: (id: string) => Promise<User | null>;

    create: (data: UserCreate) => Promise<User>;
    update: (id: string, data: UserUpdate) => Promise<User>;
    delete: (id: string) => Promise<void>;

    updateRole: (id: string, role: string) => Promise<User>;
    changePassword: (id: string, newPassword: string) => Promise<User>;

    search: (query: string) => User[];
  };
}