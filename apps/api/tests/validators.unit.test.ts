import { it, expect } from "vitest";
import { registration } from "../src/validators/auth.js";
import { money } from "../src/validators/vehicles.js";
it("bounds bcrypt passwords by UTF-8 bytes, not just characters", () => {
  expect(
    registration.safeParse({
      email: "a@example.com",
      password: "Aa1!" + "é".repeat(34),
    }).success,
  ).toBe(true);
  expect(
    registration.safeParse({
      email: "a@example.com",
      password: "Aa1!" + "é".repeat(35),
    }).success,
  ).toBe(false);
});
it("normalizes surrounding whitespace and email case", () => {
  expect(
    registration.parse({
      email: " A@EXAMPLE.COM ",
      password: "StrongPassword123!",
    }).email,
  ).toBe("a@example.com");
});
it("preserves exact monetary strings at the database precision boundary", () => {
  expect(money.parse("999999999999.99")).toBe("999999999999.99");
  expect(money.safeParse("1000000000000.00").success).toBe(false);
  expect(money.safeParse("1e6").success).toBe(false);
});
