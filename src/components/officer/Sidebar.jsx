"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, Calendar1, CalendarDays, ClipboardList, FileText,
  LayoutDashboard, Leaf, MapPin, Settings, ShoppingBasket,
  User, Users, Wallet, X
} from "lucide-react";

const SECTIONS = [
  {
    items: [{ label: "Dashboard", href: "/officer/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", href: "/officer/bookings", icon: CalendarDays },
      { label: "Queue", href: "/officer/queue", icon: ClipboardList },
      { label: "Procurement", href: "/officer/procurement", icon: ShoppingBasket },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Centre", href: "/officer/centre", icon: MapPin },
      { label: "Slots", href: "/officer/slots", icon: Calendar1 },
    ],
  },
  {
    title: "Finance & Reports",
    items: [
      { label: "Payments", href: "/officer/payments", icon: Wallet },
      { label: "Reports", href: "/officer/reports", icon: FileText },
    ],
  },
  {
    divider: true,
    items: [
      { label: "Alerts", href: "/officer/alerts", icon: Bell, badge: "5" },
      { label: "Profile", href: "/officer/profile", icon: User },
      { label: "Settings", href: "/officer/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const close = () => setSidebarOpen(false);

  return (
    <>
      {sidebarOpen && <div onClick={close} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 select-none flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Branding Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Link href="/officer/dashboard" onClick={close} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Leaf size={16} />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-slate-900 dark:text-white">AGRINEX</h1>
              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Officer Desk</span>
            </div>
          </Link>
          <button onClick={close} className="p-1 text-slate-400 hover:text-slate-600 lg:hidden"><X size={18} /></button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-3">
          {SECTIONS.map((sec, idx) => (
            <div key={idx} className={sec.divider ? "border-t border-slate-100 pt-3 dark:border-slate-800 space-y-1" : "space-y-1"}>
              {sec.title && <p className="px-2.5 pb-1 text-[8px] font-black uppercase tracking-wider text-slate-400">{sec.title}</p>}
              {sec.items.map(({ label, href, icon: Icon, badge }) => {
                const active = pathname === href || (href !== "/officer/dashboard" && pathname?.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold transition ${active
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      }`}
                  >
                    <Icon size={15} className={active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                    <span className="flex-1 truncate">{label}</span>
                    {badge && (
                      <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-1.5 py-0.2 text-[8px] font-black text-red-600 dark:text-red-400">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Centre Operational Gauge */}
        <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/70 p-2.5 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between text-[9px] font-black text-emerald-700 dark:text-emerald-400">
              <span>Operational</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-emerald-100 dark:bg-emerald-900 overflow-hidden">
              <div className="h-full bg-emerald-500 w-[80%] rounded-full" />
            </div>
            <p className="mt-1 text-[8px] text-slate-400">80% intake capacity used</p>
          </div>
        </div>
      </aside>
    </>
  );
}