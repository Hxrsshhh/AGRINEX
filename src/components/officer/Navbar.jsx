"use client";

import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
} from "lucide-react";

import Link from "next/link";

export default function Navbar({
  setSidebarOpen,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:px-6">

      {/* Left Side */}
      <div className="flex items-center gap-3">

        {/* Mobile Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex dark:border-slate-700 dark:bg-slate-800">
          <Search
            size={15}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-48 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            AGRINEX
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <Link
          href="/officer/alerts"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </Link>

        {/* Profile */}
        <Link
          href="/officer/profile"
          className="flex items-center gap-2.5"
        >
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Officer Name
            </p>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Centre Officer
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            <User size={17} />
          </div>

          <ChevronDown
            size={15}
            className="hidden text-slate-400 sm:block"
          />
        </Link>
      </div>
    </header>
  );
}