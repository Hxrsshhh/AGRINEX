"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, CalendarDays, Check, CheckCheck, ChevronRight, Clock3,
  CreditCard, Info, MapPin, PackageCheck, Trash2, UserCheck,
  Users, AlertTriangle, X
} from "lucide-react";

const TYPE_ICONS = {
  BOOKING: { icon: CalendarDays, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
  ARRIVAL: { icon: UserCheck, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  QUEUE: { icon: Users, color: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
  PROCUREMENT: { icon: PackageCheck, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
  PAYMENT: { icon: CreditCard, color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
  CAPACITY: { icon: AlertTriangle, color: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" },
  ADMIN: { icon: Info, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

const INITIAL_NOTIFICATIONS = [
  { id: "N001", type: "BOOKING", title: "New booking received", message: "Ramesh Kumar has created a new booking for Paddy procurement.", time: "2 min ago", read: false, priority: "NORMAL", bookingId: "BK1024", farmerId: "FR1024", farmer: "Ramesh Kumar" },
  { id: "N002", type: "ARRIVAL", title: "Farmer has arrived", message: "Suresh Singh has arrived at XYZ Farmer Centre.", time: "8 min ago", read: false, priority: "NORMAL", bookingId: "BK1025", farmerId: "FR1025", farmer: "Suresh Singh" },
  { id: "N003", type: "QUEUE", title: "Queue updated", message: "Token #105 has moved to processing.", time: "15 min ago", read: true, priority: "NORMAL", bookingId: "BK1025", farmerId: "FR1025", farmer: "Suresh Singh" },
  { id: "N004", type: "PROCUREMENT", title: "Procurement request received", message: "A new procurement request requires officer attention.", time: "24 min ago", read: false, priority: "HIGH", bookingId: "BK1026", farmerId: "FR1026", farmer: "Anita Devi" },
  { id: "N005", type: "PAYMENT", title: "Payment pending", message: "Payment for booking BK1023 is still pending verification.", time: "42 min ago", read: false, priority: "HIGH", bookingId: "BK1023", farmerId: "FR1023", farmer: "Mohan Das" },
  { id: "N006", type: "CAPACITY", title: "Centre capacity warning", message: "Today's queue has reached 85% of the centre's recommended capacity.", time: "1 hr ago", read: true, priority: "HIGH" },
  { id: "N007", type: "ADMIN", title: "Important admin notification", message: "Procurement centre operating guidelines have been updated.", time: "2 hrs ago", read: true, priority: "HIGH" },
  { id: "N008", type: "BOOKING", title: "New booking received", message: "Priya Devi has created a booking for Wheat procurement.", time: "Yesterday", read: true, priority: "NORMAL", bookingId: "BK1030", farmerId: "FR1030", farmer: "Priya Devi" },
];

export default function OfficerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedId, setSelectedId] = useState(INITIAL_NOTIFICATIONS[0].id);
  const [filter, setFilter] = useState("ALL");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter((n) => n.priority === "HIGH").length;
  const selected = notifications.find((n) => n.id === selectedId);

  const filtered = useMemo(() => {
    if (filter === "UNREAD") return notifications.filter((n) => !n.read);
    if (filter === "HIGH") return notifications.filter((n) => n.priority === "HIGH");
    return notifications;
  }, [notifications, filter]);

  const markAsRead = (id) => setNotifications((curr) => curr.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearNotification = (id) => {
    const remaining = notifications.filter((n) => n.id !== id);
    setNotifications(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id || null);
  };

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 select-none">
      <div className="mx-auto flex h-full max-w-[1500px] flex-col p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <header className="mb-3 flex shrink-0 items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Officer Operations</span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">Notifications</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[8px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <MapPin size={12} className="text-emerald-500" /> XYZ Farmer Centre
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              <Bell size={13} />
              {unreadCount > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />}
            </div>
          </div>
        </header>

        {/* Stats Strip */}
        <div className="mb-3 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Total", val: notifications.length, icon: Bell, c: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
            { label: "Unread", val: unreadCount, icon: Clock3, c: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
            { label: "Priority", val: highPriorityCount, icon: AlertTriangle, c: "text-red-500 bg-red-50 dark:bg-red-950/40" },
            { label: "Read", val: notifications.length - unreadCount, icon: CheckCheck, c: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.c}`}><s.icon size={13} /></div>
              <div>
                <p className="text-[7px] text-slate-400">{s.label}</p>
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Workspace Panel */}
        <section className="flex flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
          {/* List Column */}
          <div className="flex flex-1 flex-col min-h-0 border-r border-slate-100 dark:border-slate-800">
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-100 px-3 dark:border-slate-800">
              <div className="flex gap-1.5">
                {[
                  { id: "ALL", label: "All", count: notifications.length },
                  { id: "UNREAD", label: "Unread", count: unreadCount },
                  { id: "HIGH", label: "Priority", count: highPriorityCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[8px] font-bold transition ${
                      filter === tab.id ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    {tab.label} <span className="text-[7px] opacity-75">({tab.count})</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setNotifications((curr) => curr.map((n) => ({ ...n, read: true })))}
                disabled={unreadCount === 0}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[7px] font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"
              >
                <CheckCheck size={10} /> Mark all read
              </button>
            </div>

            {/* Scrollable Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((n) => {
                const IconConfig = TYPE_ICONS[n.type] || TYPE_ICONS.ADMIN;
                const IconComponent = IconConfig.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => { setSelectedId(n.id); if (!n.read) markAsRead(n.id); }}
                    className={`flex cursor-pointer items-start gap-2.5 p-3 transition ${
                      selectedId === n.id ? "bg-emerald-50/50 dark:bg-emerald-950/20" : n.read ? "hover:bg-slate-50/60 dark:hover:bg-slate-800/40" : "bg-blue-50/30 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${IconConfig.color}`}>
                      <IconComponent size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] truncate ${n.read ? "font-semibold text-slate-700 dark:text-slate-300" : "font-black text-slate-900 dark:text-white"}`}>{n.title}</span>
                        <span className="text-[7px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[8px] text-slate-500 dark:text-slate-400">{n.message}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex gap-1">
                          {n.priority === "HIGH" && <span className="rounded bg-red-100 dark:bg-red-950/40 px-1 text-[6px] font-black text-red-600">PRIORITY</span>}
                          {n.bookingId && <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 text-[6px] font-bold text-slate-500">{n.bookingId}</span>}
                        </div>
                        {!n.read && (
                          <button onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="text-[7px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">
                            <Check size={8} /> Read
                          </button>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={12} className={`shrink-0 mt-2 ${selectedId === n.id ? "text-emerald-500" : "text-slate-300"}`} />
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
                  <Bell size={20} className="mb-1 opacity-50" />
                  <p className="text-[9px]">No notifications found</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Column */}
          <aside className="hidden lg:flex lg:w-[320px] flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/20">
            {selected ? (
              <div className="flex h-full flex-col justify-between p-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[8px] font-black uppercase text-emerald-600">Notification Detail</span>
                    <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white">{selected.title}</p>
                    <span className="text-[7px] text-slate-400">{selected.time}</span>
                    <p className="mt-2 text-[8px] leading-relaxed text-slate-600 dark:text-slate-300">{selected.message}</p>
                  </div>
                  {(selected.bookingId || selected.farmer) && (
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-[8px] dark:border-slate-800 dark:bg-slate-900 space-y-1">
                      {selected.bookingId && <div className="flex justify-between"><span className="text-slate-400">Booking</span><span className="font-bold">{selected.bookingId}</span></div>}
                      {selected.farmer && <div className="flex justify-between"><span className="text-slate-400">Farmer</span><span className="font-bold">{selected.farmer}</span></div>}
                      {selected.farmerId && <div className="flex justify-between"><span className="text-slate-400">Farmer ID</span><span className="font-bold">{selected.farmerId}</span></div>}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {selected.bookingId && (
                    <button
                      onClick={() => router.push(`/officer/bookings?bookingId=${selected.bookingId}`)}
                      className="col-span-2 flex h-7 items-center justify-center gap-1 rounded-lg bg-emerald-600 text-[8px] font-bold text-white hover:bg-emerald-700"
                    >
                      <ChevronRight size={10} /> View Booking
                    </button>
                  )}
                  <button onClick={() => clearNotification(selected.id)} className="flex h-7 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 text-[8px] font-bold text-red-600 hover:bg-red-100">
                    <Trash2 size={10} /> Clear
                  </button>
                  <button onClick={() => setSelectedId(null)} className="flex h-7 items-center justify-center rounded-lg border border-slate-200 text-[8px] font-bold text-slate-500 hover:bg-slate-100">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center p-4 text-slate-400 text-[9px]">
                Select a notification to view full details.
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}