import React, { useMemo, useState } from "react";
import type { DataContextType } from "@/types/dataContextType";

// Import your individual contexts
import { BookingProvider, useBookings } from "./BookingContext";
import { UserProvider, useUsers } from "./UserContext";
import { ProfileProvider, useProfile } from "./ProfileContext";
import { PortfolioProvider, usePortfolio } from "./PortfolioItemsContext";
import { InstallerAvailabilityProvider, useInstallerAvailability } from "./InstallerAvailabilityContext";
import { InstallerSpecialtiesProvider, useInstallerSpecialties } from "./InstallerSpecialtiesContext";
import { SpecialtyProvider, useSpecialties } from "./SpecialtyContext";

const DataContext = React.createContext<DataContextType | undefined>(undefined);

// -------------------- BRIDGE --------------------
const DataContextBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const bookingCtx = useBookings();
  const userCtx = useUsers();
  const profileCtx = useProfile();
  const portfolioCtx = usePortfolio();
  const availabilityCtx = useInstallerAvailability();
  const installerSpecialtyCtx = useInstallerSpecialties();
  const specialtyCtx = useSpecialties();

  React.useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([
          // preload calls if needed
          // bookingCtx.fetchAll?.(),
          // userCtx.fetchAll?.(),
        ]);
      } catch (err) {
        console.error("App bootstrap failed:", err);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const contextValue = useMemo<DataContextType>(() => ({
    isBootstrapping,

    /* ---------------- BOOKINGS ---------------- */
    bookings: {
      data: bookingCtx.bookings,

      isLoading: bookingCtx.isLoading,
      isCreating: bookingCtx.isCreating,
      isUpdating: bookingCtx.isUpdating,
      isDeleting: bookingCtx.isDeleting,

      createError: bookingCtx.createError,
      updateError: bookingCtx.updateError,
      deleteError: bookingCtx.deleteError,

      add: bookingCtx.addBooking,
      update: bookingCtx.updateBooking,
      delete: bookingCtx.deleteBooking,

      get: bookingCtx.getBooking,
      getByInstaller: bookingCtx.getByInstaller,
      getByClient: bookingCtx.getByClient,

      search: bookingCtx.searchBookings,
    },

    /* ---------------- INSTALLER AVAILABILITY ---------------- */
    installerAvailability: {
      data: availabilityCtx.availability,

      isLoading: availabilityCtx.isLoading,
      isCreating: availabilityCtx.isCreating,
      isUpdating: availabilityCtx.isUpdating,
      isDeleting: availabilityCtx.isDeleting,

      createError: availabilityCtx.createError,
      updateError: availabilityCtx.updateError,
      deleteError: availabilityCtx.deleteError,

      add: availabilityCtx.addAvailability,
      update: availabilityCtx.updateAvailability,
      delete: availabilityCtx.deleteAvailability,

      get: availabilityCtx.getAvailability,
      getByInstaller: availabilityCtx.getByInstaller,

      search: availabilityCtx.searchAvailability,
    },

    /* ---------------- INSTALLER SPECIALTIES ---------------- */
    installerSpecialties: {
      data: installerSpecialtyCtx.specialties,

      isLoading: installerSpecialtyCtx.isLoading,
      isCreating: installerSpecialtyCtx.isCreating,
      isUpdating: installerSpecialtyCtx.isUpdating,
      isDeleting: installerSpecialtyCtx.isDeleting,

      createError: installerSpecialtyCtx.createError,
      updateError: installerSpecialtyCtx.updateError,
      deleteError: installerSpecialtyCtx.deleteError,

      add: installerSpecialtyCtx.addSpecialty,
      update: installerSpecialtyCtx.updateSpecialty,
      delete: installerSpecialtyCtx.deleteSpecialty,

      getByInstaller: installerSpecialtyCtx.getByInstaller,

      search: installerSpecialtyCtx.searchSpecialties,
    },

    /* ---------------- PROFILES ---------------- */
    profiles: {
      data: profileCtx.profile,

      isLoading: profileCtx.isLoading,
      isCreating: profileCtx.isCreating,
      isUpdating: profileCtx.isUpdating,
      isDeleting: profileCtx.isDeleting,

      createError: profileCtx.createError,
      updateError: profileCtx.updateError,
      deleteError: profileCtx.deleteError,

      get: profileCtx.getProfile,
      getByUser: profileCtx.getProfileByUser,

      create: profileCtx.createProfile,
      update: profileCtx.updateProfile,
      delete: profileCtx.deleteProfile,

      search: profileCtx.searchProfiles,
    },

    /* ---------------- PORTFOLIO ITEMS ---------------- */
    portfolioItems: {
      data: portfolioCtx.items,

      isLoading: portfolioCtx.isLoading,
      isCreating: portfolioCtx.isCreating,
      isUpdating: portfolioCtx.isUpdating,
      isDeleting: portfolioCtx.isDeleting,

      createError: portfolioCtx.createError,
      updateError: portfolioCtx.updateError,
      deleteError: portfolioCtx.deleteError,

      add: portfolioCtx.addItem,
      update: portfolioCtx.updateItem,
      delete: portfolioCtx.deleteItem,

      getByInstaller: portfolioCtx.getByInstaller,

      search: portfolioCtx.searchItems,
    },

    /* ---------------- SPECIALTIES ---------------- */
    specialties: {
      data: specialtyCtx.specialties,

      isLoading: specialtyCtx.isLoading,
      isCreating: specialtyCtx.isCreating,
      isUpdating: specialtyCtx.isUpdating,
      isDeleting: specialtyCtx.isDeleting,

      createError: specialtyCtx.createError,
      updateError: specialtyCtx.updateError,
      deleteError: specialtyCtx.deleteError,

      add: specialtyCtx.addSpecialty,
      update: specialtyCtx.updateSpecialty,
      delete: specialtyCtx.deleteSpecialty,

      search: specialtyCtx.searchSpecialties,
    },

    /* ---------------- USERS ---------------- */
    users: {
      data: userCtx.users,

      stats: userCtx.stats,

      isLoading: userCtx.isLoading,
      isCreating: userCtx.isCreating,
      isUpdating: userCtx.isUpdating,
      isDeleting: userCtx.isDeleting,

      createError: userCtx.createError,
      updateError: userCtx.updateError,
      deleteError: userCtx.deleteError,

      get: userCtx.getUser,

      create: userCtx.createUser,
      update: userCtx.updateUser,
      delete: userCtx.deleteUser,

      updateRole: userCtx.updateUserRole,
      changePassword: userCtx.changePassword,

      search: userCtx.searchUsers,
    },

  }), [
    isBootstrapping,
    bookingCtx,
    availabilityCtx,
    installerSpecialtyCtx,
    profileCtx,
    portfolioCtx,
    specialtyCtx,
    userCtx,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// -------------------- PROVIDER --------------------
export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserProvider>
    <SpecialtyProvider>
      <InstallerSpecialtiesProvider>
        <InstallerAvailabilityProvider>
          <ProfileProvider>
            <PortfolioProvider>
              <BookingProvider>
                <DataContextBridge>{children}</DataContextBridge>
              </BookingProvider>
            </PortfolioProvider>
          </ProfileProvider>
        </InstallerAvailabilityProvider>
      </InstallerSpecialtiesProvider>
    </SpecialtyProvider>
  </UserProvider>
);

// -------------------- HOOK --------------------
export const useData = () => {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within AppDataProvider");
  return ctx;
};