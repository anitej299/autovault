import { beforeEach, afterAll, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { app } from "../src/app.js";
const db = new PrismaClient();
let user: string, admin: string, vehicleId: string, userId: string;
beforeEach(async () => {
  await db.purchase.deleteMany();
  await db.vehicle.deleteMany();
  await db.user.deleteMany();
  const u = await db.user.create({
    data: { email: "buyer@test.com", passwordHash: "unused" },
  });
  const a = await db.user.create({
    data: { email: "admin@test.com", passwordHash: "unused", role: "ADMIN" },
  });
  const sign = (id: string) =>
    jwt.sign({ sub: id }, process.env.JWT_SECRET!, {
      issuer: "autovault",
      audience: "autovault-web",
    });
  user = sign(u.id);
  userId = u.id;
  admin = sign(a.id);
  vehicleId = (
    await db.vehicle.create({
      data: {
        make: "Tata",
        model: "Harrier",
        category: "SUV",
        price: "1800000.25",
        quantity: 3,
      },
    })
  ).id;
});
afterAll(() => db.$disconnect());
const purchase = (body: object = {}) =>
  request(app)
    .post("/api/vehicles/" + vehicleId + "/purchase")
    .auth(user, { type: "bearer" })
    .send(body);
it("defaults to one and records exact price and buyer", async () => {
  const r = await purchase();
  expect(r.status).toBe(201);
  expect(r.body.vehicle.quantity).toBe(2);
  const p = await db.purchase.findFirstOrThrow();
  expect(p.userId).toBe(userId);
  expect(p.unitPrice.toFixed(2)).toBe("1800000.25");
  expect(p.quantity).toBe(1);
});
it("purchases multiple units", async () => {
  const r = await purchase({ quantity: 2 });
  expect(r.status).toBe(201);
  expect(r.body.vehicle.quantity).toBe(1);
});
it.each([0, 1])(
  "rejects purchase above available stock %s",
  async (quantity) => {
    await db.vehicle.update({ where: { id: vehicleId }, data: { quantity } });
    expect((await purchase({ quantity: 2 })).status).toBe(409);
    expect(await db.purchase.count()).toBe(0);
  },
);
it("allows exactly one concurrent purchase of last unit", async () => {
  await db.vehicle.update({ where: { id: vehicleId }, data: { quantity: 1 } });
  const responses = await Promise.all([purchase(), purchase()]);
  expect(responses.map((r) => r.status).sort()).toEqual([201, 409]);
  expect(
    (await db.vehicle.findUniqueOrThrow({ where: { id: vehicleId } })).quantity,
  ).toBe(0);
  expect(await db.purchase.count()).toBe(1);
});
it("rolls back stock when purchase persistence fails", async () => {
  await db.$executeRawUnsafe(
    `CREATE FUNCTION reject_test_purchase() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'injected test failure'; END; $$ LANGUAGE plpgsql`,
  );
  await db.$executeRawUnsafe(
    `CREATE TRIGGER reject_purchase BEFORE INSERT ON "Purchase" FOR EACH ROW EXECUTE FUNCTION reject_test_purchase()`,
  );
  try {
    expect((await purchase()).status).toBe(500);
    expect(
      (await db.vehicle.findUniqueOrThrow({ where: { id: vehicleId } }))
        .quantity,
    ).toBe(3);
    expect(await db.purchase.count()).toBe(0);
  } finally {
    await db.$executeRawUnsafe('DROP TRIGGER reject_purchase ON "Purchase"');
    await db.$executeRawUnsafe("DROP FUNCTION reject_test_purchase()");
  }
});
it("restocks as admin", async () => {
  const r = await request(app)
    .post("/api/vehicles/" + vehicleId + "/restock")
    .auth(admin, { type: "bearer" })
    .send({ quantity: 4 });
  expect(r.status).toBe(200);
  expect(r.body.quantity).toBe(7);
});
it("forbids USER restock", async () => {
  expect(
    (
      await request(app)
        .post("/api/vehicles/" + vehicleId + "/restock")
        .auth(user, { type: "bearer" })
        .send({ quantity: 1 })
    ).status,
  ).toBe(403);
});
it.each([0, -1, 1.5, "2"])(
  "rejects invalid purchase/restock quantity %s",
  async (quantity) => {
    expect((await purchase({ quantity })).status).toBe(400);
    expect(
      (
        await request(app)
          .post("/api/vehicles/" + vehicleId + "/restock")
          .auth(admin, { type: "bearer" })
          .send({ quantity })
      ).status,
    ).toBe(400);
  },
);
it("returns 404 for nonexistent purchase and restock", async () => {
  vehicleId = randomUUID();
  expect((await purchase()).status).toBe(404);
  expect(
    (
      await request(app)
        .post("/api/vehicles/" + vehicleId + "/restock")
        .auth(admin, { type: "bearer" })
        .send({ quantity: 1 })
    ).status,
  ).toBe(404);
});
it("preserves purchase history by rejecting referenced vehicle deletion", async () => {
  await purchase();
  expect(
    (
      await request(app)
        .delete("/api/vehicles/" + vehicleId)
        .auth(admin, { type: "bearer" })
    ).status,
  ).toBe(409);
  expect(await db.purchase.count()).toBe(1);
});

it("reports missing vehicle JSON for purchases", async () => {
  vehicleId = randomUUID();
  const r = await purchase();
  expect(r.status).toBe(404);
  expect(r.body.error.message).toBe("Vehicle not found");
});
it("rejects restock overflow without changing stock", async () => {
  await db.vehicle.update({
    where: { id: vehicleId },
    data: { quantity: 2147483647 },
  });
  const r = await request(app)
    .post("/api/vehicles/" + vehicleId + "/restock")
    .auth(admin, { type: "bearer" })
    .send({ quantity: 1 });
  expect(r.status).toBe(409);
  expect(
    (await db.vehicle.findUniqueOrThrow({ where: { id: vehicleId } })).quantity,
  ).toBe(2147483647);
});
it("rejects unknown purchase fields and malformed identifiers", async () => {
  expect((await purchase({ quantity: 1, price: "1" })).status).toBe(400);
  vehicleId = "bad";
  expect((await purchase()).status).toBe(400);
});
