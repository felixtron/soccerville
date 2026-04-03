"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  CalendarDays,
  Store,
  UserCog,
  Bell,
  DollarSign,
  CreditCard,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/torneos", label: "Torneos", icon: Trophy },
  { href: "/admin/equipos", label: "Equipos", icon: Users },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/admin/espacios", label: "Espacios", icon: Store },
  { href: "/admin/pagos", label: "Pagos", icon: DollarSign },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog },
  { href: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/admin/stripe", label: "Stripe", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 h-10 w-10 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0a0a0a] text-white z-50 flex flex-col transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <Image
              src="/images/svm.png"
              alt="Soccerville"
              width={36}
              height={36}
              className="h-8 w-8 object-contain shrink-0"
            />
            {!collapsed && (
              <span className="font-display text-lg uppercase tracking-tight truncate">
                Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 hidden lg:flex"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Cerrar sesion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
