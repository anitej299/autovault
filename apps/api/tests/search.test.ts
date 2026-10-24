import { beforeEach, afterAll, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { app } from "../src/app.js";
const db = new PrismaClient();
let token: string;
beforeEach(async () => {
  await db.purchase.deleteMany();
  await db.vehicle.deleteMany();
  await db.user.deleteMany();
  const u = await db.user.create({
    data: { email: "search@test.com", passwordHash: "unused" },
  });
  token = jwt.sign({ sub: u.id }, process.env.JWT_SECRET!, {
    issuer: "autovault",
    audience: "autovault-web",
  });
  await db.vehicle.createMany({
    data: [
      {
        make: "Tata",
        model: "Harrier",
        category: "SUV",
        price: "1800000",
        quantity: 3,
      },
      {
        make: "Tata",
        model: "Tiago",
        category: "Hatchback",
        price: "600000",
        quantity: 0,
      },
      {
        make: "Honda",
        model: "City",
        category: "Sedan",
        price: "1200000",
        quantity: 2,
      },
    ],
  });
});
afterAll(() => db.$disconnect());
const get = (q: string) =>
  request(app)
    .get("/api/vehicles/search?" + q)
    .auth(token, { type: "bearer" });
it.each([
  ["make=ta", 2],
  ["model=ARR", 1],
  ["category=sed", 1],
  ["minPrice=600000&maxPrice=1200000", 2],
  ["make=tata&category=suv&minPrice=1800000&maxPrice=1800000", 1],
  ["make=missing", 0],
])("filters %s", async (q, n) => {
  const r = await get(q as string);
  expect(r.status).toBe(200);
  expect(r.body.total).toBe(n);
  expect(r.body.items).toHaveLength(n as number);
});
it.each([
  "minPrice=2&maxPrice=1",
  "minPrice=-1",
  "page=0",
  "pageSize=101",
  "sort=unsafe",
  "maxPrice=NaN",
])("rejects invalid query %s", async (q) =>
  expect((await get(q)).status).toBe(400),
);
it("paginates with stable price sorting", async () => {
  const r = await get("page=2&pageSize=1&sort=priceAsc");
  expect(r.status).toBe(200);
  expect(r.body.items[0].model).toBe("City");
  expect(r.body).toMatchObject({
    page: 2,
    pageSize: 1,
    total: 3,
    totalPages: 3,
  });
});
it("provides exact global inventory summary", async () => {
  const r = await request(app)
    .get("/api/vehicles/summary")
    .auth(token, { type: "bearer" });
  expect(r.status).toBe(200);
  expect(r.body).toEqual({
    listings: 3,
    units: 5,
    outOfStock: 1,
    value: "7800000.00",
  });
});
