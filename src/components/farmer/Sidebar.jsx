"use client";

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
} from "lucide-react";

/* =========================================================
   PROCUREMENT MENU
========================================================= */

const menuItems = [
  {
    name: "Dashboard",
    href: "/farmer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Bookings",
    href: "/farmer/book-slot",
    icon: Calendar,
  },
  {
    name: "Queue",
    href: "/farmer/queue",
    icon: Users,
  },
  {
    name: "Procurement",
    href: "/farmer/procurement",
    icon: Scale,
  },
  {
    name: "Payments",
    href: "/farmer/payments",
    icon: DollarSign,
  },
  {
    name: "Notifications",
    href: "/farmer/notifications",
    icon: Bell,
    badge: "2",
  },
];

/* =========================================================
   ACCOUNT MENU
========================================================= */

const accountItems = [
  {
    name: "Profile",
    href: "/farmer/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/farmer/settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: "/farmer/help",
    icon: HelpCircle,
  },
];

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  /* -------------------------------------------------------
     ACTIVE ROUTE
  ------------------------------------------------------- */

  const isActive = (href) => {
    if (href === "/farmer/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}

      {open && (
        <div
          onClick={onClose}
          className="
            fixed
            inset-0
            top-16
            z-[70]

            bg-slate-950/40
            dark:bg-black/60

            backdrop-blur-sm

            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          top-16
          left-0
          bottom-0

          z-[80]

          w-56

          bg-white
          dark:bg-[#0a1016]

          text-slate-900
          dark:text-slate-100

          border-r
          border-slate-200
          dark:border-slate-800

          flex
          flex-col

          shadow-sm
          dark:shadow-black/20

          transition-transform
          duration-300

          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ===================================================
            MOBILE CLOSE
        ==================================================== */}

        <div
          className="
            lg:hidden

            flex
            justify-end

            p-3

            border-b
            border-slate-100
            dark:border-slate-800
          "
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="
              p-2
              rounded-xl

              bg-slate-100
              dark:bg-slate-800

              text-slate-600
              dark:text-slate-300

              hover:bg-slate-200
              dark:hover:bg-slate-700

              hover:text-emerald-600
              dark:hover:text-emerald-400

              transition-all
              duration-200
            "
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ===================================================
            SCROLLABLE NAVIGATION
        ==================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto

            p-4

            scrollbar-thin
            scrollbar-thumb-slate-300
            dark:scrollbar-thumb-slate-700

            scrollbar-track-transparent
          "
        >
          {/* =================================================
              PROCUREMENT TITLE
          ================================================== */}

          <p
            className="
              px-3
              mb-3

              text-[10px]
              uppercase
              tracking-widest
              font-black

              text-slate-400
              dark:text-slate-500
            "
          >
            Procurement
          </p>

          {/* =================================================
              PROCUREMENT LINKS
          ================================================== */}

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group

                    flex
                    items-center
                    gap-3

                    px-3
                    py-2.5

                    rounded-xl

                    text-xs
                    font-bold

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-emerald-600
                          dark:bg-emerald-600

                          text-white
                          dark:text-white

                          shadow-lg
                          shadow-emerald-600/20

                          hover:bg-emerald-700
                          dark:hover:bg-emerald-500
                        `
                        : `
                          text-slate-600
                          dark:text-slate-400

                          hover:bg-slate-100
                          dark:hover:bg-slate-800

                          hover:text-slate-900
                          dark:hover:text-slate-100
                        `
                    }
                  `}
                >
                  {/* ICON */}

                  <Icon
                    className={`
                      w-4
                      h-4
                      shrink-0

                      transition-colors

                      ${
                        active
                          ? "text-white"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400"
                      }
                    `}
                  />

                  {/* NAME */}

                  <span className="flex-1">{item.name}</span>

                  {/* BADGE */}

                  {item.badge && (
                    <span
                      className={`
                        min-w-5
                        h-5
                        px-1

                        rounded-full

                        flex
                        items-center
                        justify-center

                        text-[9px]
                        font-black

                        ${
                          active
                            ? `
                              bg-white/20
                              dark:bg-white/20

                              text-white
                            `
                            : `
                              bg-emerald-500/10
                              dark:bg-emerald-400/10

                              text-emerald-600
                              dark:text-emerald-400
                            `
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

          {/* =================================================
              DIVIDER
          ================================================== */}

          <div
            className="
              my-6

              border-t
              border-slate-200
              dark:border-slate-800
            "
          />

          {/* =================================================
              ACCOUNT TITLE
          ================================================== */}

          <p
            className="
              px-3
              mb-3

              text-[10px]
              uppercase
              tracking-widest
              font-black

              text-slate-400
              dark:text-slate-500
            "
          >
            Account
          </p>

          {/* =================================================
              ACCOUNT LINKS
          ================================================== */}

          <nav className="space-y-1">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group

                    flex
                    items-center
                    gap-3

                    px-3
                    py-2.5

                    rounded-xl

                    text-xs
                    font-bold

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-emerald-500/10
                          dark:bg-emerald-400/10

                          text-emerald-600
                          dark:text-emerald-400

                          border
                          border-emerald-500/10
                          dark:border-emerald-400/10
                        `
                        : `
                          text-slate-600
                          dark:text-slate-400

                          hover:bg-slate-100
                          dark:hover:bg-slate-800

                          hover:text-slate-900
                          dark:hover:text-slate-100
                        `
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-4
                      h-4

                      ${
                        active
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400"
                      }
                    `}
                  />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ===================================================
            SIDEBAR FOOTER
        ==================================================== */}

        <div
          className="
            shrink-0

            p-4

            border-t
            border-slate-200
            dark:border-slate-800

            bg-white
            dark:bg-[#0a1016]
          "
        >
          {/* =================================================
              PREFERRED CENTRE
          ================================================== */}

          <div
            className="
              p-3

              rounded-2xl

              bg-emerald-500/5
              dark:bg-emerald-400/5

              border
              border-emerald-500/10
              dark:border-emerald-400/10
            "
          >
            <div
              className="
              flex
              items-center
              gap-2
            "
            >
              {/* LOCATION ICON */}

              <div
                className="
                  w-8
                  h-8

                  shrink-0

                  rounded-xl

                  bg-emerald-500/10
                  dark:bg-emerald-400/10

                  flex
                  items-center
                  justify-center
                "
              >
                <MapPin
                  className="
                    w-4
                    h-4

                    text-emerald-500
                    dark:text-emerald-400
                  "
                />
              </div>

              {/* CENTRE */}

              <div className="min-w-0">
                <p
                  className="
                    text-[9px]

                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Preferred Centre
                </p>

                <p
                  className="
                    text-[10px]
                    font-black

                    text-slate-800
                    dark:text-slate-200

                    truncate
                  "
                >
                  XYZ Mandi
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              LOGOUT
          ================================================== */}

         <button
  type="button"
  onClick={() => signOut({ callbackUrl: "/signin" })}
  className="
    mt-3
    w-full
    flex
    items-center
    gap-2
    px-3
    py-2.5
    rounded-xl
    text-xs
    font-bold
    text-rose-500
    dark:text-rose-400
    hover:bg-rose-500/10
    dark:hover:bg-rose-400/10
    transition-all
    duration-200
  "
>
  <LogOut className="w-4 h-4" />
  <span>Logout</span>
</button>
        </div>
      </aside>
    </>
  );
}
