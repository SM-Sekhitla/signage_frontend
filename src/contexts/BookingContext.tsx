import React, { createContext, useContext, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import API from "@/utils/api";
import {
  bookingSchema,
  bookingCreateSchema,
  bookingUpdateSchema,
} from "@/schema/booking";
import {
  Booking,
  BookingCreate,
  BookingUpdate,
} from "@/types/booking";

// 🔑 Query Keys (scalable)
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters: any) => [...bookingKeys.lists(), filters] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
};

// 📦 Context Type
interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  createError: unknown;
  updateError: unknown;
  deleteError: unknown;

  addBooking: (booking: BookingCreate) => Promise<Booking>;
  updateBooking: (id: string, booking: BookingUpdate) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<void>;

  getBooking: (id: string) => Promise<Booking | null>;
  getByInstaller: (installerId: string) => Promise<Booking[]>;
  getByClient: (clientId: string) => Promise<Booking[]>;

  searchBookings: (query: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // 🔹 FETCH ALL
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: async () => {
      const res = await API.get("/bookings/");
      return bookingSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  // 🔹 CREATE
  const {
    mutateAsync: createBookingMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: async (booking: BookingCreate) => {
      bookingCreateSchema.parse(booking);
      const res = await API.post("/bookings/", booking);
      return bookingSchema.parse(res.data);
    },

    onMutate: async (newBooking) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.lists() });

      const previous = queryClient.getQueryData<Booking[]>(
        bookingKeys.lists()
      );

      const optimistic: Booking = {
        ...newBooking,
        id: `temp-${Date.now()}`,
        status: "accepted",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(bookingKeys.lists(), (old: Booking[] = []) => [
        ...old,
        optimistic,
      ]);

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(bookingKeys.lists(), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });

  // 🔹 UPDATE (NOTE: PUT not PATCH)
  const {
    mutateAsync: updateBookingMutation,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: async ({
      id,
      booking,
    }: {
      id: string;
      booking: BookingUpdate;
    }) => {
      bookingUpdateSchema.parse(booking);
      const res = await API.put(`/bookings/${id}`, booking);
      return bookingSchema.parse(res.data);
    },

    onMutate: async ({ id, booking }) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.all });

      const previous = queryClient.getQueryData<Booking[]>(
        bookingKeys.lists()
      );

      queryClient.setQueryData(bookingKeys.lists(), (old: Booking[] = []) =>
        old.map((b) => (b.id === id ? { ...b, ...booking } : b))
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(bookingKeys.lists(), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });

  // 🔹 DELETE
  const {
    mutateAsync: deleteBookingMutation,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/bookings/${id}`);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.all });

      const previous = queryClient.getQueryData<Booking[]>(
        bookingKeys.lists()
      );

      queryClient.setQueryData(bookingKeys.lists(), (old: Booking[] = []) =>
        old.filter((b) => b.id !== id)
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(bookingKeys.lists(), ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });

  // 🔹 EXTRA FETCHERS (aligned with backend routes)

  const getBooking = async (id: string): Promise<Booking | null> => {
    try {
      const res = await API.get(`/bookings/${id}`);
      return bookingSchema.parse(res.data);
    } catch {
      return null;
    }
  };

  const getByInstaller = async (installerId: string) => {
    const res = await API.get(`/bookings/installer/${installerId}`);
    return bookingSchema.array().parse(res.data);
  };

  const getByClient = async (clientId: string) => {
    const res = await API.get(`/bookings/client/${clientId}`);
    return bookingSchema.array().parse(res.data);
  };

  // 🔹 ACTIONS
  const addBooking = async (booking: BookingCreate) => {
    return await createBookingMutation(booking);
  };

  const updateBooking = async (id: string, booking: BookingUpdate) => {
    return await updateBookingMutation({ id, booking });
  };

  const deleteBooking = async (id: string) => {
    await deleteBookingMutation(id);
  };

  // 🔹 SEARCH
  const searchBookings = useCallback(
    (query: string): Booking[] => {
      if (!query) return bookings;

      const q = query.toLowerCase();

      return bookings.filter(
        (b) =>
          b.projectTitle.toLowerCase().includes(q) ||
          b.projectDescription?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q) ||
          b.province?.toLowerCase().includes(q)
      );
    },
    [bookings]
  );

  return (
    <BookingContext.Provider
      value={{
        bookings,
        isLoading,

        isCreating,
        isUpdating,
        isDeleting,

        createError,
        updateError,
        deleteError,

        addBooking,
        updateBooking,
        deleteBooking,

        getBooking,
        getByInstaller,
        getByClient,

        searchBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};