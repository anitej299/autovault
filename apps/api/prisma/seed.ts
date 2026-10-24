import "../src/config/env.js";
import { db } from "../src/repositories/db.js";
import bcrypt from "bcrypt";
import { registration } from "../src/validators/auth.js";
if (process.env.NODE_ENV === "production")
  throw new Error("Development seed is disabled in production");
const cars = [
  ["Tata", "Harrier", "SUV", "1849000", 8],
  ["Mahindra", "XUV700", "SUV", "2199000", 5],
  ["Hyundai", "Verna", "Sedan", "1499000", 4],
  ["Maruti Suzuki", "Grand Vitara", "Hybrid", "1875000", 6],
  ["Honda", "City", "Sedan", "1299000", 0],
  ["Kia", "Seltos", "SUV", "1699000", 3],
  ["Tata", "Nexon EV", "Electric", "1749000", 7],
  ["Volkswagen", "Virtus", "Sedan", "1599000", 2],
  ["Hyundai", "i20", "Hatchback", "899000", 9],
] as const;
try {
  for (const [index, car] of cars.entries()) {
    const [make, model, category, price, quantity] = car;
    const id = "10000000-0000-4000-8000-" + String(index + 1).padStart(12, "0");
    await db.vehicle.upsert({
      where: { id },
      update: {},
      create: { id, make, model, category, price, quantity },
    });
  }
  if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
    const input = registration.parse({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    const existing = await db.user.findUnique({
      where: { email: input.email },
    });
    if (existing && existing.role !== "ADMIN")
      throw new Error("Refusing to promote existing public user");
    await db.user.upsert({
      where: { email: input.email },
      update: {},
      create: {
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: "ADMIN",
      },
    });
  }
  console.log(
    "Development inventory seeded. Existing stock and accounts preserved.",
  );
} finally {
  await db.$disconnect();
}
