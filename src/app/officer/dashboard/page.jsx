"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Leaf,
  MapPin,
  ShoppingBasket,
  User,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

const STATS = [
  { label: "Farmers", value: "128", icon: Users, c: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
  { label: "Bookings", value: "24", icon: CalendarDays, c: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
  { label: "Pending", value: "07", icon: Clock3, c: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  { label: "Queue", value: "05", icon: ClipboardList, c: "text-orange-600 bg-orange-50 dark:bg-orange-950/40" },
  { label: "Procured", value: "1.2T", icon: Leaf, c: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  { label: "Completed", value: "18", icon: CheckCircle2, c: "text-green-600 bg-green-50 dark:bg-green-950/40" },
  { label: "Dues", value: "₹45.2K", icon: Wallet, c: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
];

const BOOKINGS = [
  { id: "#BK1024", name: "Ramesh Kumar", time: "10:30 AM", status: "Confirmed" },
  { id: "#BK1025", name: "Suresh Singh", time: "11:00 AM", status: "Confirmed" },
  { id: "#BK1026", name: "Anita Devi", time: "11:30 AM", status: "Pending" },
  { id: "#BK1027", name: "Mohan Das", time: "12:00 PM", status: "Confirmed" },
];

const ACTIONS = [
  { icon: UserCheck, text: "3 farmers waiting for verification", btn: "Review" },
  { icon: ShoppingBasket, text: "2 procurement requests need approval", btn: "Review" },
  { icon: Wallet, text: "4 payments pending verification", btn: "View" },
];

const ALERTS = [
  { text: "New booking received", time: "5 min ago", c: "bg-blue-500" },
  { text: "Farmer #FR102 arrived", time: "8 min ago", c: "bg-emerald-500" },
  { text: "Queue capacity reaching limit", time: "12 min ago", c: "bg-amber-500" },
];

export default function OfficerDashboard() {
  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-5 select-none space-y-5">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-wider">Officer Control Panel</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Good Morning, Officer 👋</h1>
          <p className="text-[10px] text-slate-400">Real-time procurement & queue monitoring</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 w-fit">
          <CalendarDays size={13} />
          <span>Today</span>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.c}`}><s.icon size={15} /></div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-[8px] text-slate-400 font-bold mt-0.5 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 4 Operations Panels */}
      <section className="grid gap-4 xl:grid-cols-2">
        {/* Bookings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs"><CalendarDays size={14} className="text-emerald-500" /> Recent Bookings</div>
            <button className="text-[9px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">View All <ChevronRight size={10} /></button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {BOOKINGS.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 text-[9px]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><User size={12} /></div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white leading-tight">{b.name}</p>
                    <span className="text-[7px] text-slate-400">{b.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-slate-400">{b.time}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[7px] font-bold ${b.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs"><ClipboardList size={14} className="text-emerald-500" /> Queue Operations</div>
            <button className="text-[9px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">Manage Queue <ChevronRight size={10} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2 my-3">
            {[
              { label: "Current Token", val: "#104", status: "Processing", c: "text-emerald-500" },
              { label: "Next Token", val: "#105", status: "Waiting", c: "text-amber-500" },
            ].map((t) => (
              <div key={t.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <span className="text-[8px] font-bold text-slate-400 uppercase">{t.label}</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{t.val}</p>
                <div className={`flex items-center gap-1 text-[8px] font-bold ${t.c} mt-1`}>
                  <span className={`h-1.5 w-1.5 rounded-full bg-current`} /> {t.status}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
            <div className="flex justify-between items-center rounded-lg border border-slate-200 dark:border-slate-800 p-2"><span>In Weighing</span><span>01</span></div>
            <div className="flex justify-between items-center rounded-lg border border-slate-200 dark:border-slate-800 p-2"><span>In Line</span><span>04</span></div>
          </div>
        </div>

        {/* Procurement Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs"><ShoppingBasket size={14} className="text-emerald-500" /> Procurement Summary</div>
            <span className="text-[8px] text-slate-400 font-bold">Live Target</span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-3">
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Procured Today</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">1,240 <span className="text-xs font-normal text-slate-400">kg</span></p>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Valuation</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">₹72,450</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 p-2.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">Completed</span>
              <span className="font-black text-emerald-600">18 tx</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50/70 dark:bg-amber-950/20 p-2.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">Pending</span>
              <span className="font-black text-amber-600">07 tx</span>
            </div>
          </div>
        </div>

        {/* Centre Capacity Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs"><MapPin size={14} className="text-emerald-500" /> Centre Operations</div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black text-emerald-600">Active</span>
          </div>
          <div className="my-3">
            <div className="flex justify-between text-[9px] font-bold mb-1">
              <span className="text-slate-400 uppercase">Yard Capacity</span>
              <span className="text-slate-800 dark:text-slate-200">80% Full</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[80%]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[8px] text-center">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2"><p className="text-slate-400">Slots</p><p className="font-black text-slate-800 dark:text-slate-200">24/30</p></div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2"><p className="text-slate-400">Queue</p><p className="font-black text-slate-800 dark:text-slate-200">05</p></div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2"><p className="text-slate-400">Staff</p><p className="font-black text-slate-800 dark:text-slate-200">04/05</p></div>
          </div>
        </div>
      </section>

      {/* Action Items & Alerts */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/60">
          <p className="text-[9px] font-bold uppercase text-slate-400 pb-2">Pending Actions</p>
          {ACTIONS.map((a) => (
            <div key={a.text} className="flex items-center justify-between py-2 text-[9px]">
              <div className="flex items-center gap-2">
                <a.icon size={13} className="text-amber-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">{a.text}</span>
              </div>
              <button className="flex items-center gap-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[8px] font-bold hover:bg-slate-200">{a.btn} <ArrowUpRight size={9} /></button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/60">
          <p className="text-[9px] font-bold uppercase text-slate-400 pb-2">Recent Broadcasts</p>
          {ALERTS.map((al) => (
            <div key={al.text} className="flex items-center justify-between py-2 text-[9px]">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${al.c}`} />
                <span className="font-bold text-slate-700 dark:text-slate-300">{al.text}</span>
              </div>
              <span className="text-[8px] text-slate-400">{al.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}