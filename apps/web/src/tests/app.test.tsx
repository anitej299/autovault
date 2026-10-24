import { beforeEach, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../App";
const vehicle = {
  id: "00000000-0000-4000-8000-000000000001",
  make: "Tata",
  model: "Harrier",
  category: "SUV",
  price: "1800000.00",
  quantity: 2,
};
let stock = 2;
let fail = false;
const mockFetch = vi.fn(async (url: string, options?: RequestInit) => {
  let body: any;
  if (url.includes("/summary"))
    body = {
      listings: 1,
      units: stock,
      outOfStock: stock === 0 ? 1 : 0,
      value: "3600000.00",
    };
  else if (url.includes("/purchase")) {
    if (fail)
      return {
        ok: false,
        status: 409,
        json: async () => ({ error: { message: "Insufficient stock" } }),
      };
    stock -= JSON.parse(options?.body as string).quantity;
    body = { vehicle: { ...vehicle, quantity: stock } };
  } else if (url.includes("/auth/"))
    body = {
      token: "token",
      user: { id: "1", email: "driver@example.com", role: "USER" },
    };
  else
    body = {
      items: [{ ...vehicle, quantity: stock }],
      total: 1,
      page: 1,
      pageSize: 12,
      totalPages: 1,
    };
  return { ok: true, status: 200, json: async () => body };
});
beforeEach(() => {
  sessionStorage.clear();
  stock = 2;
  fail = false;
  mockFetch.mockClear();
  vi.stubGlobal("fetch", mockFetch);
});
function mount(role?: string, path = "/inventory") {
  if (role)
    sessionStorage.setItem(
      "autovault.session",
      JSON.stringify({
        token: "token",
        user: { id: "1", email: "driver@example.com", role },
      }),
    );
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
it("redirects protected routes to login", async () => {
  mount();
  expect(
    await screen.findByRole("heading", { name: "Welcome back." }),
  ).toBeInTheDocument();
});
it("validates login fields", async () => {
  mount(undefined, "/login");
  await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  expect(mockFetch).not.toHaveBeenCalled();
});
it("validates registration password", async () => {
  mount(undefined, "/register");
  await userEvent.type(screen.getByLabelText("Email address"), "a@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "weak");
  await userEvent.click(screen.getByRole("button", { name: "Create account" }));
  expect(await screen.findByText(/12 characters/i)).toBeInTheDocument();
});
it("logs in and renders inventory", async () => {
  mount(undefined, "/login");
  await userEvent.type(
    screen.getByLabelText("Email address"),
    "driver@example.com",
  );
  await userEvent.type(screen.getByLabelText("Password"), "SecurePass123!");
  await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(
    await screen.findByRole("heading", { name: "Tata Harrier" }),
  ).toBeInTheDocument();
});
it("renders live inventory and hides admin controls for users", async () => {
  mount("USER");
  expect(
    await screen.findByRole("heading", { name: "Tata Harrier" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Add vehicle" }),
  ).not.toBeInTheDocument();
});
it("shows admin management controls", async () => {
  mount("ADMIN", "/admin");
  expect(
    await screen.findByRole("button", { name: "Add vehicle" }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole("button", { name: "Edit Tata Harrier" }),
  ).toBeInTheDocument();
});
it("submits filters to API", async () => {
  mount("USER");
  await screen.findByRole("heading", { name: "Tata Harrier" });
  await userEvent.type(screen.getByLabelText("Make"), "Tata");
  await userEvent.click(screen.getByRole("button", { name: "Apply filters" }));
  await waitFor(() =>
    expect(
      mockFetch.mock.calls.some(([url]) => url.includes("make=Tata")),
    ).toBe(true),
  );
});
it("disables purchase for zero stock", async () => {
  stock = 0;
  mount("USER");
  expect(
    await screen.findByRole("button", { name: "Out of stock" }),
  ).toBeDisabled();
});
it("confirms purchase and refreshes authoritative stock", async () => {
  mount("USER");
  await userEvent.click(
    await screen.findByRole("button", { name: "Purchase Tata Harrier" }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm purchase" }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Purchase confirmed",
  );
  await waitFor(() =>
    expect(screen.getByText("1 available")).toBeInTheDocument(),
  );
});
it("shows API purchase failure", async () => {
  fail = true;
  mount("USER");
  await userEvent.click(
    await screen.findByRole("button", { name: "Purchase Tata Harrier" }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Confirm purchase" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Insufficient stock",
  );
});
it("opens and closes mobile navigation", async () => {
  mount("USER");
  await userEvent.click(
    await screen.findByRole("button", { name: "Toggle navigation" }),
  );
  expect(
    screen.getByRole("button", { name: "Toggle navigation" }),
  ).toHaveAttribute("aria-expanded", "true");
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle navigation" }),
  );
  expect(
    screen.getByRole("button", { name: "Toggle navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
});
