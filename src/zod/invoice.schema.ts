import { z } from "zod";

export const InvoiceSchema = z.object({
  invoice_id: z.number().optional(),
  invoice_number: z.string().min(1, "Invoice Number is required"),
  job_id: z
    .string()
    .or(z.number())
    .transform((val) => Number(val)),
  date_entered: z.coerce.date().nullable().optional(),
  date_due: z.coerce.date().nullable().optional(),
  paid_at: z.coerce.date().nullable().optional(),
  no_charge: z.boolean().default(false),
  comments: z.string().optional().nullable(),
});

export type InvoiceFormInput = z.input<typeof InvoiceSchema>;
