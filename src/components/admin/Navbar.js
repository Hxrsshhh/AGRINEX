"use client";

import { Menu, Search, RefreshCw, Bell, ChevronDown } from "lucide-react";

export default function Navbar({ onMenuClick, onRefresh, isRefreshing = false }) {
  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 select-none">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Branding & Mobile Menu */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuClick} className="p-1.5 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600">
            <Menu size={18} />
          </button>
          <div className="truncate">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">Administration Dashboard</h2>
            <p className="text-[9px] text-slate-400 truncate">System-wide AGRINEX operations</p>
          </div>
        </div>

        {/* Right: Actions, Search & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden md:flex items-center w-48 lg:w-56 h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input type="text" placeholder="Search..." className="w-full ml-2 bg-transparent outline-none text-[11px] placeholder:text-slate-400" />
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
          </button>

          <button className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900">
            <Bell size={13} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-white font-black text-[10px]">
              A
            </div>
            <div className="hidden lg:block leading-tight text-left">
              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">Admin</p>
              <p className="text-[8px] text-slate-400">Master Console</p>
            </div>
            <ChevronDown size={11} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}