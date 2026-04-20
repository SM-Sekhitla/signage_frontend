import { bookingSchema, bookingCreateSchema, bookingUpdateSchema } from "@/schema/booking";
import { z } from "zod";


// Types (inferred)
export type Booking = z.infer<typeof bookingSchema>;
export type BookingCreate = z.infer<typeof bookingCreateSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;