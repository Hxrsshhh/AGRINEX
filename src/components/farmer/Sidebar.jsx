"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  LayoutDashboard,
  Calendar,
  Users,
  Scale,
  DollarSign,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  X,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

/* =========================================================
   PROCUREMENT MENU
========================================================= */

const menuItems = [
  { name: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
  { name: "Book Slot", href: "/farmer/book-slot", icon: Calendar },
  { name: "My Bookings", href: "/farmer/my-bookings", icon: Calendar },
  { name: "Queue", href: "/farmer/queue", icon: Users },
  { name: "Payments", href: "/farmer/payments", icon: DollarSign },
  { name: "Notifications", href: "/farmer/notifications", icon: Bell, badge: "2" },
];

/* =========================================================
   ACCOUNT MENU
========================================================= */

const accountItems = [
  { name: "Profile", href: "/farmer/profile", icon: User },
  { name: "Settings", href: "/farmer/settings", icon: Settings },
  { name: "Help & Support", href: "/farmer/help", icon: HelpCircle },
];

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({
  open = false,
  onClose = () => {},
}) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/farmer/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await signOut({ callbackUrl: "/signin" });
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 top-16 z-[70] appearance-none bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside
        aria-label="Farmer navigation"
        className={`
          fixed top-16 left-0 bottom-0 z-[80] w-56 flex flex-col overflow-hidden select-none
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl
          border-r border-slate-200/90 dark:border-white/10
          shadow-2xl shadow-emerald-950/5 dark:shadow-black/50
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* TOP ACCENT LINE */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        {/* MOBILE HEADER */}
        <div className="shrink-0 lg:hidden flex items-center justify-between h-14 px-3.5 border-b border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                AGRINEX
              </p>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                Farmer Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NAVIGATION CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 hover:scrollbar-thumb-emerald-500">
          
          {/* SECTION: PROCUREMENT */}
          <div className="px-2 mb-1.5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Procurement
            </p>
          </div>

          <nav aria-label="Procurement links" className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group relative flex items-center gap-2.5 min-h-9 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]
                    ${
                      active
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active
                        ? "text-white"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-500"
                    }`}
                  />

                  <span className="flex-1 truncate">{item.name}</span>

                  {item.badge && (
                    <span
                      className={`
                        min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center text-[9px] font-black
                        ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* DIVIDER */}
          <div className="my-3 mx-2 border-t border-slate-200/80 dark:border-white/5" />

          {/* SECTION: ACCOUNT */}
          <div className="px-2 mb-1.5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Account
            </p>
          </div>

          <nav aria-label="Account links" className="space-y-1">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group flex items-center gap-2.5 min-h-9 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]
                    ${
                      active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-500"
                    }`}
                  />

                  <span className="flex-1 truncate">{item.name}</span>

                  {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="shrink-0 p-2.5 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
          
          {/* PREFERRED CENTRE BADGE */}
          <div className="p-2.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                  Preferred Centre
                </p>
                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">
                  XYZ Mandi
                </p>
              </div>
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full min-h-8 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}