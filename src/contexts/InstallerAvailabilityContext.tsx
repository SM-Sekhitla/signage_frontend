import React, { createContext, useContext, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import API from "@/utils/api";
import {
  installerAvailabilitySchema,
  installerAvailabilityCreateSchema,
  installerAvailabilityUpdateSchema,
} from "@/schema/installerAvailability";
import {
  InstallerAvailability,
  InstallerAvailabilityCreate,
  InstallerAvailabilityUpdate,
} from "@/types/installerAvailability";

// 🔑 Query Keys
export const availabilityKeys = {
  all: ["availability"] as const,
  lists: () => [...availabilityKeys.all, "list"] as const,
  list: (installerId?: string) =>
    [...availabilityKeys.lists(), { installerId }] as const,
  detail: (id: string) =>
    [...availabilityKeys.all, "detail", id] as const,
};

// 📦 Context Type
interface AvailabilityContextType {
  availability: InstallerAvailability[];
  isLoading: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  createError: unknown;
  updateError: unknown;
  deleteError: unknown;

  addAvailability: (
    data: InstallerAvailabilityCreate
  ) => Promise<InstallerAvailability>;

  updateAvailability: (
    id: string,
    data: InstallerAvailabilityUpdate
  ) => Promise<InstallerAvailability>;

  deleteAvailability: (id: string) => Promise<void>;

  getAvailability: (id: string) => Promise<InstallerAvailability | null>;
  getByInstaller: (installerId: string) => Promise<InstallerAvailability[]>;

  searchAvailability: (query: string) => InstallerAvailability[];
}

const AvailabilityContext = createContext<
  AvailabilityContextType | undefined
>(undefined);

export const useInstallerAvailability = () => {
  const ctx = useContext(AvailabilityContext);
  if (!ctx) {
    throw new Error("useInstallerAvailability must be used within InstallerAvailabilityProvider");
  }
  return ctx;
};

export const InstallerAvailabilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // 🔹 FETCH ALL
  const { data: availability = [], isLoading } = useQuery({
    queryKey: availabilityKeys.lists(),
    queryFn: async () => {
      const res = await API.get("/installer-availability/");
      return installerAvailabilitySchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  // 🔹 CREATE
  const {
    mutateAsync: createMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (data: InstallerAvailabilityCreate) => {
      installerAvailabilityCreateSchema.parse(data);
      const res = await API.post("/installer-availability/", data);
      return installerAvailabilitySchema.parse(res.data);
    },

    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      const previous = queryClient.getQueryData<InstallerAvailability[]>(
        availabilityKeys.lists()
      );

      const optimistic: InstallerAvailability = {
        ...newEntry,
        id: `temp-${Date.now()}`,
        available: newEntry.available ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        availabilityKeys.lists(),
        (old: InstallerAvailability[] = []) => [...old, optimistic]
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(availabilityKeys.lists(), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });

  // 🔹 UPDATE
  const {
    mutateAsync: updateMutation,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: InstallerAvailabilityUpdate;
    }) => {
      installerAvailabilityUpdateSchema.parse(data);
      const res = await API.put(`/installer-availability/${id}`, data);
      return installerAvailabilitySchema.parse(res.data);
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      const previous = queryClient.getQueryData<InstallerAvailability[]>(
        availabilityKeys.lists()
      );

      queryClient.setQueryData(
        availabilityKeys.lists(),
        (old: InstallerAvailability[] = []) =>
          old.map((a) =>
            a.id === id ? { ...a, ...data } : a
          )
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(availabilityKeys.lists(), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });

  // 🔹 DELETE
  const {
    mutateAsync: deleteMutation,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/installer-availability/${id}`);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      const previous = queryClient.getQueryData<InstallerAvailability[]>(
        availabilityKeys.lists()
      );

      queryClient.setQueryData(
        availabilityKeys.lists(),
        (old: InstallerAvailability[] = []) =>
          old.filter((a) => a.id !== id)
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(availabilityKeys.lists(), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });

  // 🔹 EXTRA FETCHERS
  const getAvailability = async (id: string) => {
    try {
      const res = await API.get(`/installer-availability/${id}`);
      return installerAvailabilitySchema.parse(res.data);
    } catch {
      return null;
    }
  };

  const getByInstaller = async (installerId: string) => {
    const res = await API.get(
      `/installer-availability/installer/${installerId}`
    );
    return installerAvailabilitySchema.array().parse(res.data);
  };

  // 🔹 ACTIONS
  const addAvailability = async (data: InstallerAvailabilityCreate) => {
    return await createMutation(data);
  };

  const updateAvailability = async (
    id: string,
    data: InstallerAvailabilityUpdate
  ) => {
    return await updateMutation({ id, data });
  };

  const deleteAvailability = async (id: string) => {
    await deleteMutation(id);
  };

  // 🔹 SEARCH
  const searchAvailability = useCallback(
    (query: string): InstallerAvailability[] => {
      if (!query) return availability;

      const q = query.toLowerCase();

      return availability.filter(
        (a) =>
          a.installerId.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q)
      );
    },
    [availability]
  );

  return (
    <AvailabilityContext.Provider
      value={{
        availability,
        isLoading,

        isCreating,
        isUpdating,
        isDeleting,

        createError,
        updateError,
        deleteError,

        addAvailability,
        updateAvailability,
        deleteAvailability,

        getAvailability,
        getByInstaller,

        searchAvailability,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  );
};