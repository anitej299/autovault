import { useState } from "react";
import { Routes, Route, Navigate, NavLink, Outlet } from "react-router-dom";
import {
  CarFront,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  ArrowUpRight,
  UserRound,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/Auth";
import { AuthPage } from "./pages/AuthPage";
import { InventoryPage } from "./pages/InventoryPage";
function Shell() {
  const { session, setSession } = useAuth();
  const [mobile, setMobile] = useState(false);
  const client = useQueryClient();
  if (!session) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-800 bg-[#0d1625] px-5 py-8 lg:flex">
        <NavLink className="brand px-3" to="/inventory">
          <CarFront className="text-blue-400" />
          AutoVault<span className="text-blue-400">.</span>
        </NavLink>
        <p className="mb-4 mt-14 px-3 text-[10px] tracking-[.2em] text-slate-500">
          WORKSPACE
        </p>
        <NavLink
          to="/inventory"
          className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}
        >
          <LayoutDashboard size={18} />
          Inventory
        </NavLink>
        {session.user.role === "ADMIN" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              "nav-link " + (isActive ? "active" : "")
            }
          >
            <ShieldCheck size={18} />
            Management
          </NavLink>
        )}
        <div className="mt-auto rounded-xl border border-blue-400/10 bg-blue-400/5 p-4">
          <ArrowUpRight size={23} className="text-blue-400" />
          <p className="mt-3 text-sm font-medium">The road is yours.</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Discover a collection made for your next chapter.
          </p>
        </div>
      </aside>
      <div className="lg:ml-60">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-3 border-b border-slate-800 bg-[#0b1220]/95 px-5 backdrop-blur-md lg:px-10">
          <div className="flex items-center gap-3">
            <button
              className="icon-button lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span className="text-sm text-slate-400">
              Workspace <span className="mx-2 text-slate-600">/</span>{" "}
              <span className="text-slate-200">AutoVault</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-200">{session.user.email}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                {session.user.role === "ADMIN" ? "Administrator" : "Member"}
              </p>
            </div>
            <span className="rounded-full bg-blue-400/10 p-2 text-blue-300">
              <UserRound size={18} />
            </span>
            <button
              aria-label="Log out"
              className="icon-button"
              onClick={() => {
                setSession(null);
                client.clear();
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        {mobile && (
          <nav
            aria-label="Mobile navigation"
            className="border-b border-slate-800 bg-slate-900 p-4 lg:hidden"
          >
            <NavLink
              className="nav-link"
              to="/inventory"
              onClick={() => setMobile(false)}
            >
              Inventory
            </NavLink>
            {session.user.role === "ADMIN" && (
              <NavLink
                className="nav-link"
                to="/admin"
                onClick={() => setMobile(false)}
              >
                Management
              </NavLink>
            )}
          </nav>
        )}
        <main id="main" className="mx-auto max-w-[1600px] p-5 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
function Admin() {
  const { session } = useAuth();
  return session?.user.role === "ADMIN" ? (
    <InventoryPage management />
  ) : (
    <Navigate to="/inventory" replace />
  );
}
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage registering />} />
        <Route element={<Shell />}>
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/inventory" replace />} />
      </Routes>
    </AuthProvider>
  );
}
