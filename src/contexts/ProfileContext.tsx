import React, { createContext, useContext, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import API from "@/utils/api";

import {
  profileSchema,
  profileCreateSchema,
  profileUpdateSchema,
} from "@/schema/profile";

import {
  Profile,
  ProfileCreate,
  ProfileUpdate,
} from "@/types/profile";

// 🔑 Query Keys
export const profileKeys = {
  all: ["profiles"] as const,
  detail: (id: string) => ["profiles", id] as const,
  byUser: (userId: string) =>
    ["profiles", "user", userId] as const,
};

// 📦 Context Type
interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  createError: unknown;
  updateError: unknown;
  deleteError: unknown;

  getProfile: (id: string) => Promise<Profile | null>;
  getProfileByUser: (userId: string) => Promise<Profile | null>;

  createProfile: (data: ProfileCreate) => Promise<Profile>;
  updateProfile: (id: string, data: ProfileUpdate) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;

  searchProfiles: (query: string) => Profile[];
}

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

// 🔌 Hook
export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
};

// 🏗 Provider
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // 🔹 FETCH (generic cache, optional usage)
  const { data: profile = null, isLoading } = useQuery({
    queryKey: profileKeys.all,
    queryFn: async () => {
      // optional base fetch (you can remove if unused)
      return null;
    },
  });

  // 🔹 CREATE
  const {
    mutateAsync: createMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (data: ProfileCreate) => {
      profileCreateSchema.parse(data);

      const res = await API.post("/profiles/", data);
      return profileSchema.parse(res.data);
    },

    onSuccess: (newProfile) => {
      queryClient.setQueryData(
        profileKeys.all,
        newProfile
      );

      queryClient.setQueryData(
        profileKeys.detail(newProfile.id),
        newProfile
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
      data: ProfileUpdate;
    }) => {
      profileUpdateSchema.parse(data);

      const res = await API.put(`/profiles/${id}`, data);
      return profileSchema.parse(res.data);
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.all });

      const previous = queryClient.getQueryData<Profile>(
        profileKeys.detail(id)
      );

      if (previous) {
        queryClient.setQueryData(
          profileKeys.detail(id),
          {
            ...previous,
            ...data,
          }
        );
      }

      return { previous };
    },

    onError: (_err, vars, ctx) => {
      if (ctx?.previous && vars?.id) {
        queryClient.setQueryData(
          profileKeys.detail(vars.id),
          ctx.previous
        );
      }
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(
        profileKeys.detail(updated.id),
        updated
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
      await API.delete(`/profiles/${id}`);
    },

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: profileKeys.detail(id),
      });

      queryClient.setQueryData(profileKeys.all, null);
    },
  });

  // 🔹 GET PROFILE BY ID
  const getProfile = async (id: string) => {
    try {
      const res = await API.get(`/profile/${id}`);
      return profileSchema.parse(res.data);
    } catch {
      return null;
    }
  };

  // 🔹 GET BY USER ID
  const getProfileByUser = async (userId: string) => {
    try {
      const res = await API.get(`/profile/user/${userId}`);
      return profileSchema.parse(res.data);
    } catch {
      return null;
    }
  };

  // 🔹 ACTIONS
  const createProfile = async (data: ProfileCreate) => {
    return await createMutation(data);
  };

  const updateProfile = async (
    id: string,
    data: ProfileUpdate
  ) => {
    return await updateMutation({ id, data });
  };

  const deleteProfile = async (id: string) => {
    await deleteMutation(id);
  };

  // 🔹 SEARCH
  const searchProfiles = useCallback(
    (query: string): Profile[] => {
      if (!profile) return [];

      const q = query.toLowerCase();

      return [profile].filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.companyName?.toLowerCase().includes(q) ||
          p.province?.toLowerCase().includes(q)
      );
    },
    [profile]
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,

        isCreating,
        isUpdating,
        isDeleting,

        createError,
        updateError,
        deleteError,

        getProfile,
        getProfileByUser,

        createProfile,
        updateProfile,
        deleteProfile,

        searchProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};