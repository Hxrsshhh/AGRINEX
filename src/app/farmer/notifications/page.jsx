"use client";

import React, { useState } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  Wheat,
  X,
} from "lucide-react";

const ICONS = { queue: Users, booking: CalendarDays, reminder: Clock3, procurement: Wheat, system: Info };

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "queue", title: "Your queue position changed", message: "You are now #8 in the procurement queue. 7 farmers are ahead of you.", time: "5 min ago", unread: true },
  { id: 2, type: "booking", title: "Booking confirmed", message: "Your procurement slot at XYZ Procurement Centre has been confirmed.", time: "32 min ago", unread: true },
  { id: 3, type: "reminder", title: "Procurement slot reminder", message: "Your procurement window is tomorrow from 10:00 – 11:00 AM.", time: "2 hrs ago", unread: true },
  { id: 4, type: "procurement", title: "Paddy procurement is active", message: "Paddy procurement is currently available at your selected centre.", time: "Yesterday", unread: false },
  { id: 5, type: "queue", title: "Queue is moving normally", message: "The average waiting time at XYZ Procurement Centre is currently 22 minutes.", time: "Yesterday", unread: false },
  { id: 6, type: "system", title: "Centre information updated", message: "Procurement centre operating information has been updated.", time: "2 days ago", unread: false },
];

const FILTERS = ["All", "Unread", "Booking", "Queue", "Procurement"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeItem, setActiveItem] = useState(null);

  const filtered = notifications.filter((n) =>
    activeFilter === "All" ? true : activeFilter === "Unread" ? n.unread : n.type === activeFilter.toLowerCase()
  );

  const unreadCount = notifications.filter((n) => n.unread).length;
  const updateItems = (fn) => setNotifications((curr) => fn(curr));

  const markAsRead = (id) => updateItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const deleteItem = (id) => updateItems((list) => list.filter((n) => n.id !== id));

  return (
    <div className="relative flex h-full w-full flex-col min-h-0 select-none overflow-hidden p-3 sm:p-5">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute bottom-5 left-1/3 h-80 w-80 rounded-full bg-lime-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[8px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">Notifications & Alerts</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time status updates and gate pass logs.</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => updateItems((list) => list.map((n) => ({ ...n, unread: false })))}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Mark all read</span>
          </button>
        )}
      </header>

      {/* Main Panel */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 shadow-lg">
        {/* Filter Tab Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/60 bg-slate-50/50 px-3 py-2 dark:border-white/5 dark:bg-slate-950/20">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeFilter === f
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white/80 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-medium text-slate-400">{filtered.length} updates</span>
        </div>

        {/* Content Split */}
        <div className="grid flex-1 min-h-0 grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-y-auto lg:overflow-hidden">
          {/* Notification List */}
          <section className="flex flex-col min-h-0 gap-1.5 overflow-y-auto lg:col-span-8 pr-0.5">
            {filtered.map((item) => {
              const Icon = ICONS[item.type] || Info;
              return (
                <div
                  key={item.id}
                  onClick={() => { markAsRead(item.id); setActiveItem(item); }}
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition ${
                    item.unread
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-slate-200/70 bg-white/60 hover:border-emerald-500/30 dark:border-white/5 dark:bg-slate-800/30"
                  }`}
                >
                  {item.unread && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-emerald-500" />}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.unread ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`truncate text-xs ${item.unread ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>{item.title}</h4>
                      <span className="text-[9px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{item.message}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="rounded p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
                <Bell className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">All caught up</p>
              </div>
            )}
          </section>

          {/* Right Info Sidebar */}
          <aside className="hidden lg:flex lg:col-span-4 flex-col justify-between gap-3 min-h-0">
            <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/50 p-3 dark:border-white/5 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <BellRing className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Active Alerts</span>
              </div>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{unreadCount}</span>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/50 p-3 text-[10px] dark:border-white/5 dark:bg-slate-800/30">
              <span className="font-bold uppercase tracking-wider text-slate-400">Categories</span>
              {[
                { label: "Bookings", desc: "Yard entrance schedules", icon: CalendarDays },
                { label: "Queue Alerts", desc: "Live position updates", icon: Users },
                { label: "Procurement", desc: "Price & moisture logs", icon: Wheat },
                { label: "Gate Control", desc: "Weighing & entry badges", icon: Truck },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2 rounded-lg bg-slate-100/60 p-1.5 dark:bg-slate-900/40">
                  <c.icon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-slate-700 dark:text-slate-300 leading-tight">{c.label}</p>
                    <p className="text-slate-400 text-[9px]">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-slate-600 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Direct token updates trigger real-time priority alerts on your device.</span>
            </div>
          </aside>
        </div>
      </div>

      {/* Preview Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <button onClick={() => setActiveItem(null)} className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </button>
            <h3 className="pr-6 text-sm font-bold text-slate-900 dark:text-white">{activeItem.title}</h3>
            <span className="text-[10px] text-slate-400">{activeItem.time}</span>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{activeItem.message}</p>
            <button
              onClick={() => setActiveItem(null)}
              className="mt-4 w-full rounded-lg bg-slate-900 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}