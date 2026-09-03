"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UserCog, Building2, CalendarDays,
  FileText, Settings, LogOut, Wheat, X
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_GROUPS = [
  {
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Farmers", href: "/admin/farmers", icon: Users },
      { label: "Officers", href: "/admin/officers", icon: UserCog },
      { label: "Centres", href: "/admin/centres", icon: Building2 },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Today's Bookings", href: "/admin/bookings", icon: CalendarDays },
      { label: "Daily Slip", href: "/admin/daily-slip", icon: FileText },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/admin/profile", icon: Settings },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/signin");
    router.refresh();
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 z-50 flex flex-col h-screen w-64 select-none bg-white border-r border-slate-200 dark:border-slate-800 dark:bg-[#0d141b] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-lime-500 p-0.5 shadow-sm shadow-emerald-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Wheat className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-slate-900 dark:text-white">
                AGRI<span className="text-emerald-500">NEX</span>
              </h1>
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Admin Panel</span>
            </div>
          </Link>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 lg:hidden"><X size={18} /></button>
        </div>

        {/* Navigation Feed */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.title && (
                <p className="px-3 pb-1 text-[8px] font-black uppercase tracking-widest text-slate-400">{group.title}</p>
              )}
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                      active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </nav>

        {/* Live Operational Status */}
        <div className="shrink-0 p-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400">System Operational</span>
            </div>
            <p className="mt-0.5 text-[8px] text-slate-400">Services running normally.</p>
          </div>
        </div>
      </aside>
    </>
  );
}