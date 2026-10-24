import type { Prisma, Vehicle } from "@prisma/client";
import { db } from "./db.js";
import { HttpError } from "../utils/errors.js";
export async function withLockedVehicle<T>(
  id: string,
  action: (tx: Prisma.TransactionClient, vehicle: Vehicle) => Promise<T>,
) {
  return db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      Vehicle[]
    >`SELECT * FROM "Vehicle" WHERE id=${id}::uuid FOR UPDATE`;
    if (!rows[0]) throw new HttpError(404, "Vehicle not found");
    return action(tx, rows[0]);
  });
}
