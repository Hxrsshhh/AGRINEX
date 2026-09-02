"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

import {
  Sprout,
  Bell,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const user = session?.user;
  const userName = user?.name?.trim() || "Farmer";
  const firstName = userName !== "Farmer" ? userName.split(" ")[0] : "Farmer";

  const initials =
    userName !== "Farmer"
      ? userName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      : "F";

  return (
    <header
      className="
        fixed
        top-0
        left-0
        right-0
        z-[100]
        h-16
        bg-white/80
        dark:bg-slate-900/80
        text-slate-900
        dark:text-slate-100
        backdrop-blur-2xl
        border-b
        border-slate-200/90
        dark:border-white/10
        shadow-sm
        dark:shadow-black/30
        transition-colors
        duration-300
        select-none
      "
    >
      {/* TOP ACCENT LINE */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

      <div className="h-[calc(100%-2px)] px-4 sm:px-6 flex items-center justify-between">
        {/* BRAND & MOBILE TRIGGER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="
              lg:hidden
              p-2
              rounded-xl
              bg-slate-100/80
              dark:bg-slate-800/60
              border
              border-slate-200/80
              dark:border-white/5
              text-slate-700
              dark:text-slate-200
              hover:text-emerald-600
              dark:hover:text-emerald-400
              hover:border-emerald-500/30
              transition-all
              active:scale-95
            "
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-gradient-to-br
                from-emerald-500
                to-lime-500
                p-[1.5px]
                shadow-md
                shadow-emerald-500/20
                group-hover:scale-105
                transition-transform
                duration-200
              "
            >
              <div
                className="
                  w-full
                  h-full
                  rounded-[10px]
                  bg-slate-950
                  dark:bg-slate-900
                  flex
                  items-center
                  justify-center
                "
              >
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                AGRI
                <span className="text-emerald-500 dark:text-emerald-400">
                  NEX
                </span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
                Smart Procurement
              </p>
            </div>
          </Link>
        </div>

        {/* CONTROLS & PROFILE */}
        <div className="flex items-center gap-2">
          {/* NOTIFICATION TRIGGER */}
          <Link
            href="/farmer/notifications"
            aria-label="Notifications"
            className="
              relative
              p-2
              rounded-xl
              text-slate-600
              dark:text-slate-400
              bg-slate-100/70
              dark:bg-slate-800/50
              border
              border-slate-200/80
              dark:border-white/5
              hover:text-emerald-600
              dark:hover:text-emerald-400
              hover:border-emerald-500/30
              transition-all
              active:scale-95
            "
          >
            <Bell className="w-4 h-4" />
            <span
              className="
                absolute
                top-1.5
                right-1.5
                w-2
                h-2
                rounded-full
                bg-emerald-500
                ring-2
                ring-white
                dark:ring-slate-900
              "
            />
          </Link>

          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="
              hidden
              sm:flex
              p-2
              rounded-xl
              text-slate-600
              dark:text-slate-400
              bg-slate-100/70
              dark:bg-slate-800/50
              border
              border-slate-200/80
              dark:border-white/5
              hover:text-emerald-600
              dark:hover:text-emerald-400
              hover:border-emerald-500/30
              transition-all
              active:scale-95
            "
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              )
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            )}
          </button>

          {/* USER CARD CHIP */}
          <div
            className="
              flex
              items-center
              gap-2
              px-2
              py-1
              rounded-2xl
              bg-slate-100/70
              dark:bg-slate-800/50
              border
              border-slate-200/80
              dark:border-white/5
              hover:border-emerald-500/30
              transition-all
            "
          >
            <div
              className="
                w-7
                h-7
                rounded-xl
                bg-emerald-600
                text-white
                flex
                items-center
                justify-center
                text-[10px]
                font-black
                shadow-sm
                shadow-emerald-600/20
                overflow-hidden
              "
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <span
              className="
                hidden
                sm:block
                text-xs
                font-black
                text-slate-800
                dark:text-slate-100
                max-w-[120px]
                truncate
                pr-1
              "
            >
              {status === "loading" ? "Loading..." : firstName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}