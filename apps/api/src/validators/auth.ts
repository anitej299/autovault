import { z } from "zod";
export const password = z
  .string()
  .min(12)
  .max(72)
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^a-zA-Z0-9]/, "Include a symbol")
  .refine((s) => Buffer.byteLength(s, "utf8") <= 72, "Maximum 72 UTF-8 bytes");
export const email = z.string().trim().toLowerCase().email().max(254);
export const registration = z.object({ email, password }).strict();
export const login = z
  .object({ email, password: z.string().min(1).max(72) })
  .strict();
