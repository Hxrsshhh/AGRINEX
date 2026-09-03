"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Sprout, Bell, Sun, Moon, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const user = session?.user;
  const name = user?.name?.trim() || "Farmer";
  const firstName = name.split(" ")[0];
  const initials = name !== "Farmer" ? name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() : "F";

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 select-none">
      {/* Top Accent Strip */}
      <div className="h-0.5 w-full bg-linear-to-r from-emerald-500 via-teal-400 to-lime-500" />

      <div className="h-[calc(100%-2px)] px-4 sm:px-6 flex items-center justify-between">
        {/* Mobile Trigger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden p-1.5 rounded-xl border border-slate-200/80 bg-slate-100/80 text-slate-700 hover:text-emerald-600 dark:border-white/5 dark:bg-slate-800/60 dark:text-slate-200"
          >
            <Menu size={16} />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-lime-500 p-0.5 shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Sprout size={16} className="text-emerald-400" />
              </div>
            </div>
            <div className="hidden sm:block leading-none">
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                AGRI<span className="text-emerald-500">NEX</span>
              </h1>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Smart Procurement</span>
            </div>
          </Link>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            href="/farmer/notifications"
            className="relative p-2 rounded-xl border border-slate-200/80 bg-slate-100/70 text-slate-600 hover:text-emerald-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400"
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hidden sm:flex p-2 rounded-xl border border-slate-200/80 bg-slate-100/70 text-slate-600 hover:text-emerald-600 dark:border-white/5 dark:bg-slate-800/50 dark:text-slate-400"
          >
            {mounted && resolvedTheme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 dark:border-white/5 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black overflow-hidden shadow-xs">
              {user?.image ? <img src={user.image} alt={name} className="w-full h-full object-cover" /> : initials}
            </div>
            <span className="hidden sm:block text-xs font-black text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
              {status === "loading" ? "..." : firstName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}