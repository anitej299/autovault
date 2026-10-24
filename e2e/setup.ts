import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
export default async function setup() {
  const db = new PrismaClient({
    datasourceUrl:
      "postgresql://autovault:test_only_password@localhost:5433/autovault_test",
  });
  try {
    await db.purchase.deleteMany();
    await db.vehicle.deleteMany();
    await db.user.deleteMany();
    await db.user.create({
      data: {
        email: "admin@e2e.test",
        passwordHash: await bcrypt.hash("E2ePassword123!", 12),
        role: "ADMIN",
      },
    });
    await db.vehicle.createMany({
      data: [
        {
          make: "Tata",
          model: "Harrier",
          category: "SUV",
          price: "1800000.25",
          quantity: 3,
        },
        {
          make: "Honda",
          model: "City",
          category: "Sedan",
          price: "1200000",
          quantity: 0,
        },
      ],
    });
  } finally {
    await db.$disconnect();
  }
}
