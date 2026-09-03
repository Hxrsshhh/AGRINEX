"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Calendar, Users, DollarSign, Bell,
  User, Settings, HelpCircle, LogOut, MapPin, X, Loader2, Sparkles
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "Procurement",
    items: [
      { name: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
      { name: "Book Slot", href: "/farmer/book-slot", icon: Calendar },
      { name: "My Bookings", href: "/farmer/my-bookings", icon: Calendar },
      { name: "Queue", href: "/farmer/queue", icon: Users },
      { name: "Payments", href: "/farmer/payments", icon: DollarSign },
      { name: "Notifications", href: "/farmer/notifications", icon: Bell, badge: "2" },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Profile", href: "/farmer/profile", icon: User },
      { name: "Settings", href: "/farmer/settings", icon: Settings },
      { name: "Help & Support", href: "/farmer/help", icon: HelpCircle },
    ],
  },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await signOut({ callbackUrl: "/signin" }).catch(() => setLoggingOut(false));
  };

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-xs lg:hidden" />}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-56 flex-col border-r border-slate-200/90 bg-white/80 backdrop-blur-2xl transition-transform duration-200 select-none dark:border-white/10 dark:bg-slate-900/80 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-1 w-full bg-linear-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        {/* Mobile Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200/80 px-3 lg:hidden dark:border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white">Farmer Portal</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={15} /></button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
          {NAV_SECTIONS.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-2 text-[8px] font-black uppercase tracking-wider text-slate-400">{sec.title}</span>
              {sec.items.map(({ name, href, icon: Icon, badge }) => {
                const active = pathname === href || (href !== "/farmer/dashboard" && pathname?.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-white" : "text-slate-400"} />
                    <span className="flex-1 truncate">{name}</span>
                    {badge && (
                      <span className={`rounded-full px-1.5 py-0.2 text-[8px] font-black ${active ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"}`}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info & Logout */}
        <div className="shrink-0 p-2.5 border-t border-slate-200/80 dark:border-white/5 space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2">
            <MapPin size={14} className="text-emerald-500 shrink-0" />
            <div className="truncate">
              <p className="text-[7px] font-bold uppercase text-slate-400">Assigned Mandi</p>
              <p className="text-[9px] font-black text-slate-800 dark:text-slate-200 truncate">XYZ Mandi</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-bold text-rose-600 hover:bg-rose-500/15 disabled:opacity-50 transition"
          >
            {loggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}