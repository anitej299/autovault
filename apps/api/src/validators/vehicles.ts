import { z } from "zod";
export const id = z.string().uuid();
export const money = z
  .union([z.string(), z.number().finite()])
  .transform(String)
  .refine(
    (s) => /^(0|[1-9]\d{0,11})(\.\d{1,2})?$/.test(s) && /[1-9]/.test(s),
    "Use a positive amount with at most two decimal places",
  );
export const vehicle = z
  .object({
    make: z.string().trim().min(1).max(80),
    model: z.string().trim().min(1).max(100),
    category: z.string().trim().min(1).max(50),
    price: money,
    quantity: z.number().int().min(0).max(2147483647),
  })
  .strict();
export type VehicleInput = z.infer<typeof vehicle>;
import { Prisma } from "@prisma/client";
const rangeMoney = z.string().regex(/^(0|[1-9]\d{0,11})(\.\d{1,2})?$/);
export const search = z
  .object({
    make: z.string().trim().max(80).optional(),
    model: z.string().trim().max(100).optional(),
    category: z.string().trim().max(50).optional(),
    minPrice: rangeMoney.optional(),
    maxPrice: rangeMoney.optional(),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(12),
    sort: z.enum(["newest", "priceAsc", "priceDesc", "make"]).default("newest"),
  })
  .strict()
  .refine(
    (s) =>
      !s.minPrice ||
      !s.maxPrice ||
      new Prisma.Decimal(s.minPrice).lte(s.maxPrice),
    "Minimum price must not exceed maximum price",
  );
export type Search = z.infer<typeof search>;
export const purchase = z
  .object({ quantity: z.number().int().positive().max(2147483647).default(1) })
  .strict();
export const restock = z
  .object({ quantity: z.number().int().positive().max(2147483647) })
  .strict();
