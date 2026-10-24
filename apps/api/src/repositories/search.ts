import { Prisma } from "@prisma/client";
import { db } from "./db.js";
import type { Search } from "../validators/vehicles.js";
export async function findVehicles(input: Search) {
  const where: Prisma.VehicleWhereInput = {};
  for (const key of ["make", "model", "category"] as const) {
    if (input[key]) where[key] = { contains: input[key], mode: "insensitive" };
  }
  if (input.minPrice || input.maxPrice)
    where.price = { gte: input.minPrice, lte: input.maxPrice };
  const sorting: Record<
    Search["sort"],
    Prisma.VehicleOrderByWithRelationInput
  > = {
    newest: { createdAt: "desc" },
    priceAsc: { price: "asc" },
    priceDesc: { price: "desc" },
    make: { make: "asc" },
  };
  const [items, total] = await db.$transaction(
    [
      db.vehicle.findMany({
        where,
        orderBy: [sorting[input.sort], { id: "asc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      db.vehicle.count({ where }),
    ],
    { isolationLevel: "RepeatableRead" },
  );
  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  };
}
export async function inventorySummary() {
  const [row] = await db.$queryRaw<
    {
      listings: bigint;
      units: bigint;
      outOfStock: bigint;
      value: Prisma.Decimal;
    }[]
  >`SELECT COUNT(*) AS listings, COALESCE(SUM(quantity),0)::bigint AS units, COUNT(*) FILTER (WHERE quantity=0) AS "outOfStock", COALESCE(SUM(price*quantity),0) AS value FROM "Vehicle"`;
  return {
    listings: Number(row.listings),
    units: Number(row.units),
    outOfStock: Number(row.outOfStock),
    value: row.value.toFixed(2),
  };
}
