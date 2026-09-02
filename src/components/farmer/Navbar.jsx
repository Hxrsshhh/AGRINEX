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
    setTheme(
      resolvedTheme === "dark"
        ? "light"
        : "dark"
    );
  };
  const user = session?.user;

  const userName =
    user?.name?.trim() ||
    "Farmer";
  const firstName =
    userName !== "Farmer"
      ? userName.split(" ")[0]
      : "Farmer";

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
        bg-white/95
        dark:bg-[#0a1016]/95
        text-slate-900
        dark:text-slate-100
        backdrop-blur-xl
        border-b
        border-slate-200
        dark:border-slate-800
        shadow-sm
        dark:shadow-black/20
        transition-colors
        duration-300
      "
    >
      <div
        className="
          h-full
          px-4
          sm:px-6
          flex
          items-center
          justify-between
        "
      >
       

        <div className="flex items-center gap-3">

       

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="
              lg:hidden
              p-2
              rounded-xl
              bg-slate-100
              dark:bg-slate-800
              text-slate-700
              dark:text-slate-200
              hover:bg-emerald-500/10
              dark:hover:bg-emerald-500/10
              hover:text-emerald-600
              dark:hover:text-emerald-400
              transition-all
              duration-200
            "
          >
            <Menu className="w-5 h-5" />
          </button>


          <Link
            href="/"
            className="
              flex
              items-center
              gap-2.5
              group
            "
          >

          

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-gradient-to-br
                from-emerald-500
                to-lime-500
                p-[2px]
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
                  dark:bg-[#060b10]
                  flex
                  items-center
                  justify-center
                "
              >
                <Sprout
                  className="
                    w-5
                    h-5
                    text-emerald-400
                  "
                />
              </div>
            </div>

          

            <div className="hidden sm:block">
              <div
                className="
                  text-lg
                  font-black
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                AGRI
                <span
                  className="
                    text-emerald-500
                    dark:text-emerald-400
                  "
                >
                  NEX
                </span>
              </div>

              <p
                className="
                  text-[9px]
                  font-medium
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Smart Procurement
              </p>
            </div>
          </Link>
        </div>

        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-2
          "
        >

          <Link
            href="/farmer/notifications"
            aria-label="Notifications"
            className="
              relative
              p-2.5
              rounded-xl
              text-slate-600
              dark:text-slate-300
              hover:bg-slate-100
              dark:hover:bg-slate-800
              hover:text-emerald-600
              dark:hover:text-emerald-400
              transition-all
              duration-200
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
                dark:ring-[#0a1016]
              "
            />
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="
              hidden
              sm:flex
              p-2.5
              rounded-xl
              text-slate-600
              dark:text-slate-300
              bg-transparent
              hover:bg-slate-100
              dark:hover:bg-slate-800
              hover:text-emerald-600
              dark:hover:text-emerald-400
              transition-all
              duration-200
            "
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun
                  className="
                    w-4
                    h-4
                    text-amber-400
                  "
                />
              ) : (
                <Moon
                  className="
                    w-4
                    h-4
                    text-slate-700
                    dark:text-slate-200
                  "
                />
              )
            ) : (
              <Moon
                className="
                  w-4
                  h-4
                  text-slate-700
                  dark:text-slate-200
                "
              />
            )}
          </button>

          <div
            className="
              flex
              items-center
              gap-2
              px-2
              py-1.5
              rounded-xl
              bg-slate-100
              dark:bg-slate-800
              text-slate-800
              dark:text-slate-100
              border
              border-transparent
              hover:border-slate-200
              dark:hover:border-slate-700
              transition-all
              duration-200
            "
          >

            <div
              className="
                w-7
                h-7
                rounded-lg
                bg-gradient-to-br
                from-emerald-500
                to-lime-500
                flex
                items-center
                justify-center
                text-white
                text-[10px]
                font-black
                shadow-sm
                shadow-emerald-500/20
                overflow-hidden
              "
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={userName}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
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
                font-bold
                text-slate-800
                dark:text-slate-100
                max-w-[120px]
                truncate
              "
            >
              {status === "loading"
                ? "Loading..."
                : firstName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}