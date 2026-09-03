"use client";

import Link from "next/link";
import { Bell, ChevronDown, Menu, Search, User } from "lucide-react";

export default function Navbar({ setSidebarOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:px-6 select-none">
      {/* Left: Mobile Trigger, Search, Logo */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="w-44 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
        </div>

        <span className="md:hidden font-black text-sm text-slate-900 dark:text-white">AGRINEX</span>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/officer/alerts"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </Link>

        <Link href="/officer/profile" className="flex items-center gap-2">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Officer Name</p>
            <p className="text-[8px] text-slate-400">Centre Officer</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            <User size={15} />
          </div>
          <ChevronDown size={12} className="hidden sm:block text-slate-400" />
        </Link>
      </div>
    </header>
  );
}