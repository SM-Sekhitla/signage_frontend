import React, { createContext, useContext, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import API from "@/utils/api";

import {
  installerSpecialtySchema,
  installerSpecialtyCreateSchema,
  installerSpecialtyUpdateSchema,
} from "@/schema/installerSpecialties";

import {
  InstallerSpecialty,
  InstallerSpecialtyCreate,
  InstallerSpecialtyUpdate,
} from "@/types/installerSpecialties";

// 🔑 Query Keys
export const specialtyKeys = {
  all: ["installer-specialties"] as const,
  lists: () => [...specialtyKeys.all, "list"] as const,
  byInstaller: (installerId: string) =>
    [...specialtyKeys.all, "installer", installerId] as const,
  detail: (id: string) =>
    [...specialtyKeys.all, "detail", id] as const,
};

// 📦 Context Type
interface InstallerSpecialtiesContextType {
  specialties: InstallerSpecialty[];
  isLoading: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  createError: unknown;
  updateError: unknown;
  deleteError: unknown;

  addSpecialty: (
    data: InstallerSpecialtyCreate
  ) => Promise<InstallerSpecialty>;

  updateSpecialty: (
    id: string,
    data: InstallerSpecialtyUpdate
  ) => Promise<InstallerSpecialty>;

  deleteSpecialty: (id: string) => Promise<void>;

  getByInstaller: (installerId: string) => Promise<InstallerSpecialty[]>;

  searchSpecialties: (query: string) => InstallerSpecialty[];
}

const InstallerSpecialtiesContext = createContext<
  InstallerSpecialtiesContextType | undefined
>(undefined);

// 🔌 Hook
export const useInstallerSpecialties = () => {
  const ctx = useContext(InstallerSpecialtiesContext);
  if (!ctx) {
    throw new Error(
      "useInstallerSpecialties must be used within InstallerSpecialtiesProvider"
    );
  }
  return ctx;
};

// 🏗 Provider
export const InstallerSpecialtiesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const queryClient = useQueryClient();

  // 🔹 FETCH ALL
  const { data: specialties = [], isLoading } = useQuery({
    queryKey: specialtyKeys.lists(),
    queryFn: async () => {
      const res = await API.get("/installer-specialties/");
      return installerSpecialtySchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  // 🔹 CREATE
  const {
    mutateAsync: createMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (data: InstallerSpecialtyCreate) => {
      installerSpecialtyCreateSchema.parse(data);

      const res = await API.post("/installer-specialties/", data);
      return installerSpecialtySchema.parse(res.data);
    },

    onSuccess: (newItem) => {
      queryClient.setQueryData(
        specialtyKeys.lists(),
        (old: InstallerSpecialty[] = []) => [...old, newItem]
      );
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
      data: InstallerSpecialtyUpdate;
    }) => {
      installerSpecialtyUpdateSchema.parse(data);

      const res = await API.put(`/installer-specialties/${id}`, data);
      return installerSpecialtySchema.parse(res.data);
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(
        specialtyKeys.lists(),
        (old: InstallerSpecialty[] = []) =>
          old.map((s) => (s.id === updated.id ? updated : s))
      );
    },
  });

  // 🔹 DELETE
  const {
    mutateAsync: deleteMutation,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/installer-specialties/${id}`);
    },

    onSuccess: (_, id) => {
      queryClient.setQueryData(
        specialtyKeys.lists(),
        (old: InstallerSpecialty[] = []) =>
          old.filter((s) => s.id !== id)
      );
    },
  });

  // 🔹 GET BY INSTALLER (server call)
  const getByInstaller = async (installerId: string) => {
    const res = await API.get(
      `/installer-specialties/installer/${installerId}`
    );
    return installerSpecialtySchema.array().parse(res.data);
  };

  // 🔹 ACTIONS
  const addSpecialty = async (data: InstallerSpecialtyCreate) => {
    return await createMutation(data);
  };

  const updateSpecialty = async (
    id: string,
    data: InstallerSpecialtyUpdate
  ) => {
    return await updateMutation({ id, data });
  };

  const deleteSpecialty = async (id: string) => {
    await deleteMutation(id);
  };

  // 🔹 SEARCH (client-side)
  const searchSpecialties = useCallback(
    (query: string): InstallerSpecialty[] => {
      if (!query) return specialties;

      const q = query.toLowerCase();

      return specialties.filter(
        (s) =>
          s.installerId.toLowerCase().includes(q) ||
          s.specialty.toLowerCase().includes(q)
      );
    },
    [specialties]
  );

  return (
    <InstallerSpecialtiesContext.Provider
      value={{
        specialties,
        isLoading,

        isCreating,
        isUpdating,
        isDeleting,

        createError,
        updateError,
        deleteError,

        addSpecialty,
        updateSpecialty,
        deleteSpecialty,

        getByInstaller,

        searchSpecialties,
      }}
    >
      {children}
    </InstallerSpecialtiesContext.Provider>
  );
};