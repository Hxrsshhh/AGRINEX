"use client";

import {
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Leaf,
  MapPin,
  Settings,
  ShoppingBasket,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const pathname = usePathname();

  const navigation = [
    {
      section: null,
      items: [
        {
          label: "Dashboard",
          href: "/officer/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        {
          label: "Bookings",
          href: "/officer/bookings",
          icon: CalendarDays,
        },
        {
          label: "Queue",
          href: "/officer/queue",
          icon: ClipboardList,
        },
        {
          label: "Procurement",
          href: "/officer/procurement",
          icon: ShoppingBasket,
        },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        {
          label: "Farmers",
          href: "/officer/farmers",
          icon: Users,
        },
        {
          label: "Centre",
          href: "/officer/centre",
          icon: MapPin,
        },
      ],
    },
    {
      section: "FINANCE",
      items: [
        {
          label: "Payments",
          href: "/officer/payments",
          icon: Wallet,
        },
      ],
    },
    {
      section: "INSIGHTS",
      items: [
        {
          label: "Reports",
          href: "/officer/reports",
          icon: FileText,
        },
      ],
    },
  ];

  const bottomNavigation = [
    {
      label: "Alerts",
      href: "/officer/alerts",
      icon: Bell,
      badge: "5",
    },
    {
      label: "Profile",
      href: "/officer/profile",
      icon: User,
    },
    {
      label: "Settings",
      href: "/officer/settings",
      icon: Settings,
    },
  ];

  const isActive = (href) => {
    if (href === "/officer/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ================================================================
          MOBILE OVERLAY
      ================================================================ */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================================
          SIDEBAR
      ================================================================ */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-[1100px] w-[245px] flex-col
          border-r border-slate-200
          bg-white
          shadow-sm
          transition-transform duration-300

          dark:border-slate-800
          dark:bg-slate-900

          lg:translate-x-0

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ============================================================
            LOGO
        ============================================================ */}

        <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">

          <Link
            href="/officer/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5"
          >
            {/* Logo Icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Leaf size={19} />
            </div>

            {/* Logo Text */}
            <div>
              <h1 className="text-[18px] font-bold tracking-tight text-slate-900 dark:text-white">
                AGRINEX
              </h1>

              <p className="text-[9px] font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Smart Agriculture
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ============================================================
            NAVIGATION
        ============================================================ */}

        <nav className="flex-1 px-3 py-5">

          {navigation.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={group.section ? "mt-6" : ""}
            >
              {/* Section Heading */}
              {group.section && (
                <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  {group.section}
                </p>
              )}

              {/* Navigation Items */}
              <div className="space-y-1">

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex w-full items-center gap-3
                        rounded-lg px-3 py-2.5
                        text-xs font-medium
                        transition

                        ${
                          active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        }
                      `}
                    >
                      <Icon
                        size={17}
                        className={
                          active
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400 transition group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                        }
                      />

                      <span className="flex-1">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

              </div>
            </div>
          ))}

          {/* ==========================================================
              BOTTOM NAVIGATION
          ========================================================== */}

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">

            <div className="space-y-1">

              {bottomNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex w-full items-center gap-3
                      rounded-lg px-3 py-2.5
                      text-xs font-medium
                      transition

                      ${
                        active
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      }
                    `}
                  >
                    <Icon
                      size={17}
                      className={
                        active
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500"
                      }
                    />

                    <span className="flex-1">
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

            </div>
          </div>

        </nav>

        {/* ============================================================
            CENTRE STATUS
        ============================================================ */}

        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">

          <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Centre Status
              </span>

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

            </div>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Operational
            </p>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900">
              <div className="h-full w-[80%] rounded-full bg-emerald-500" />
            </div>

            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              80% capacity
            </p>

          </div>

        </div>

      </aside>
    </>
  );
}