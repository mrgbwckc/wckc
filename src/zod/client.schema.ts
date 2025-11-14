import { z } from "zod";

export const ClientSchema = z.object({
  id: z.number().optional(),
  designer: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().min(2),
  street: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  email1: z.email().or(z.literal("")).optional(),
  email2: z.email().or(z.literal("")).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ClientType = z.infer<typeof ClientSchema>;

export const ClientInputSchema = ClientSchema.omit({
  id: true,
  designer: true,
  createdAt: true,
  updatedAt: true,
});
export type ClientInput = z.infer<typeof ClientInputSchema>;
