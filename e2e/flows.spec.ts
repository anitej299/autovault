import { test, expect } from "@playwright/test";
test("unauthenticated route redirects", async ({ page }) => {
  await page.goto("/inventory");
  await expect(page).toHaveURL(/login/);
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
});
test("register login filter purchase and prevent sold-out purchases", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByLabel("Email address").fill("buyer@e2e.test");
  await page.getByLabel("Password", { exact: true }).fill("BuyerPassword123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("heading", { name: "Tata Harrier" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByLabel("Email address").fill("buyer@e2e.test");
  await page.getByLabel("Password", { exact: true }).fill("BuyerPassword123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("button", { name: "Out of stock", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Make", { exact: true }).fill("Tata");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.getByRole("heading", { name: "Honda City" })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Purchase Tata Harrier", exact: true })
    .click();
  await page.getByLabel("Quantity", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Confirm purchase" }).click();
  await expect(page.getByRole("status")).toContainText("Purchase confirmed");
  await expect(page.getByText("1 available", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 available", { exact: true })).toBeVisible();
});
test("admin creates updates restocks and deletes", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("admin@e2e.test");
  await page.getByLabel("Password", { exact: true }).fill("E2ePassword123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("link", { name: "Management", exact: true }).click();
  await page.getByRole("button", { name: "Add vehicle" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Make", { exact: true }).fill("Skoda");
  await dialog.getByLabel("Model", { exact: true }).fill("Slavia");
  await dialog.getByLabel("Category", { exact: true }).fill("Sedan");
  await dialog.getByLabel("Price (INR)", { exact: true }).fill("1600000.50");
  await dialog.getByLabel("Quantity", { exact: true }).fill("2");
  await dialog.getByRole("button", { name: "Save vehicle" }).click();
  await page.getByRole("button", { name: "Edit Skoda Slavia" }).click();
  await dialog.getByLabel("Model", { exact: true }).fill("Slavia Sport");
  await dialog.getByRole("button", { name: "Save vehicle" }).click();
  await page
    .getByRole("button", { name: "Restock Skoda Slavia Sport" })
    .click();
  await dialog.getByLabel("Quantity", { exact: true }).fill("3");
  await dialog.getByRole("button", { name: "Confirm restock" }).click();
  await expect(
    page
      .locator("article")
      .filter({ hasText: "Slavia Sport" })
      .getByText("5 available"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete Skoda Slavia Sport" }).click();
  await dialog.getByRole("button", { name: "Confirm delete" }).click();
  await expect(
    page.getByRole("heading", { name: "Skoda Slavia Sport" }),
  ).toHaveCount(0);
});
test("mobile navigation and layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("Email address").fill("admin@e2e.test");
  await page.getByLabel("Password", { exact: true }).fill("E2ePassword123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Management" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Inventory management" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
