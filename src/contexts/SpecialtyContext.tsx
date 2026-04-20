import React, { createContext, useContext, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import API from "@/utils/api";

import {
  specialtySchema,
  specialtyCreateSchema,
  specialtyUpdateSchema,
} from "@/schema/specialty";

import {
  Specialty,
  SpecialtyCreate,
  SpecialtyUpdate,
} from "@/types/specialty";

// 🔑 Query Keys
export const specialtyKeys = {
  all: ["specialties"] as const,
  detail: (id: string) => ["specialties", id] as const,
};

// 📦 Context Type
interface SpecialtyContextType {
  specialties: Specialty[];
  isLoading: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  createError: unknown;
  updateError: unknown;
  deleteError: unknown;

  addSpecialty: (data: SpecialtyCreate) => Promise<Specialty>;
  updateSpecialty: (
    id: string,
    data: SpecialtyUpdate
  ) => Promise<Specialty>;
  deleteSpecialty: (id: string) => Promise<void>;

  searchSpecialties: (query: string) => Specialty[];
}

const SpecialtyContext = createContext<SpecialtyContextType | undefined>(
  undefined
);

// 🔌 Hook
export const useSpecialties = () => {
  const ctx = useContext(SpecialtyContext);
  if (!ctx) {
    throw new Error("useSpecialties must be used within SpecialtyProvider");
  }
  return ctx;
};

// 🏗 Provider
export const SpecialtyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // 🔹 FETCH ALL
  const { data: specialties = [], isLoading } = useQuery({
    queryKey: specialtyKeys.all,
    queryFn: async () => {
      const res = await API.get("/specialties/");
      return specialtySchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 10,
  });

  // 🔹 CREATE
  const {
    mutateAsync: createMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (data: SpecialtyCreate) => {
      specialtyCreateSchema.parse(data);

      const res = await API.post("/specialties/", data);
      return specialtySchema.parse(res.data);
    },

    onSuccess: (newItem) => {
      queryClient.setQueryData(
        specialtyKeys.all,
        (old: Specialty[] = []) => [...old, newItem]
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
      data: SpecialtyUpdate;
    }) => {
      specialtyUpdateSchema.parse(data);

      const res = await API.put(`/specialties/${id}`, data);
      return specialtySchema.parse(res.data);
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(
        specialtyKeys.all,
        (old: Specialty[] = []) =>
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
      await API.delete(`/specialties/${id}`);
    },

    onSuccess: (_, id) => {
      queryClient.setQueryData(
        specialtyKeys.all,
        (old: Specialty[] = []) =>
          old.filter((s) => s.id !== id)
      );
    },
  });

  // 🔹 ACTIONS
  const addSpecialty = async (data: SpecialtyCreate) => {
    return await createMutation(data);
  };

  const updateSpecialty = async (
    id: string,
    data: SpecialtyUpdate
  ) => {
    return await updateMutation({ id, data });
  };

  const deleteSpecialty = async (id: string) => {
    await deleteMutation(id);
  };

  // 🔹 SEARCH
  const searchSpecialties = useCallback(
    (query: string): Specialty[] => {
      if (!query) return specialties;

      const q = query.toLowerCase();

      return specialties.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    },
    [specialties]
  );

  return (
    <SpecialtyContext.Provider
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

        searchSpecialties,
      }}
    >
      {children}
    </SpecialtyContext.Provider>
  );
};