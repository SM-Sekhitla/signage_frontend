import React, { createContext, useContext, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import API from "@/utils/api";

import {
  portfolioItemSchema,
  portfolioItemCreateSchema,
  portfolioItemUpdateSchema,
} from "@/schema/portfolioItems";

import {
  PortfolioItem,
  PortfolioItemCreate,
  PortfolioItemUpdate,
} from "@/types/portfolioItems";

// 🔑 Query Keys
export const portfolioKeys = {
  all: ["portfolio-items"] as const,
  lists: () => [...portfolioKeys.all, "list"] as const,
  byInstaller: (installerId: string) =>
    [...portfolioKeys.all, "installer", installerId] as const,
  detail: (id: string) =>
    [...portfolioKeys.all, "detail", id] as const,
};

// 📦 Context Type
interface PortfolioContextType {
  items: PortfolioItem[];
  isLoading: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  createError: unknown;
  updateError: unknown;
  deleteError: unknown;

  addItem: (item: PortfolioItemCreate) => Promise<PortfolioItem>;
  updateItem: (id: string, item: PortfolioItemUpdate) => Promise<PortfolioItem>;
  deleteItem: (id: string) => Promise<void>;

  getByInstaller: (installerId: string) => Promise<PortfolioItem[]>;

  searchItems: (query: string) => PortfolioItem[];
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

// 🔌 Hook
export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolio must be used within PortfolioProvider");
  }
  return ctx;
};

// 🏗 Provider
export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // 🔹 FETCH ALL
  const { data: items = [], isLoading } = useQuery({
    queryKey: portfolioKeys.lists(),
    queryFn: async () => {
      const res = await API.get("/portfolio-items/");
      return portfolioItemSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  // 🔹 CREATE
  const {
    mutateAsync: createMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (item: PortfolioItemCreate) => {
      portfolioItemCreateSchema.parse(item);

      const res = await API.post("/portfolio-items/", item);
      return portfolioItemSchema.parse(res.data);
    },

    onSuccess: (newItem) => {
      queryClient.setQueryData(
        portfolioKeys.lists(),
        (old: PortfolioItem[] = []) => [...old, newItem]
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
      item,
    }: {
      id: string;
      item: PortfolioItemUpdate;
    }) => {
      portfolioItemUpdateSchema.parse(item);

      const res = await API.put(`/portfolio-items/${id}`, item);
      return portfolioItemSchema.parse(res.data);
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(
        portfolioKeys.lists(),
        (old: PortfolioItem[] = []) =>
          old.map((i) => (i.id === updated.id ? updated : i))
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
      await API.delete(`/portfolio-items/${id}`);
    },

    onSuccess: (_, id) => {
      queryClient.setQueryData(
        portfolioKeys.lists(),
        (old: PortfolioItem[] = []) =>
          old.filter((i) => i.id !== id)
      );
    },
  });

  // 🔹 GET BY INSTALLER
  const getByInstaller = async (installerId: string) => {
    const res = await API.get(
      `/portfolio-items/installer/${installerId}`
    );
    return portfolioItemSchema.array().parse(res.data);
  };

  // 🔹 ACTIONS
  const addItem = async (item: PortfolioItemCreate) => {
    return await createMutation(item);
  };

  const updateItem = async (
    id: string,
    item: PortfolioItemUpdate
  ) => {
    return await updateMutation({ id, item });
  };

  const deleteItem = async (id: string) => {
    await deleteMutation(id);
  };

  // 🔹 SEARCH
  const searchItems = useCallback(
    (query: string): PortfolioItem[] => {
      if (!query) return items;

      const q = query.toLowerCase();

      return items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.installerId.toLowerCase().includes(q)
      );
    },
    [items]
  );

  return (
    <PortfolioContext.Provider
      value={{
        items,
        isLoading,

        isCreating,
        isUpdating,
        isDeleting,

        createError,
        updateError,
        deleteError,

        addItem,
        updateItem,
        deleteItem,

        getByInstaller,

        searchItems,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};