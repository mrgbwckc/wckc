import { z } from "zod";

export const ClientSchema = z.object({
  designer: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().min(2),
  street: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  email1: z.email().optional(),
  email2: z.email().optional(),
});

export type ClientInput = z.infer<typeof ClientSchema>;
