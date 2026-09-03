"use client";

import Link from "next/link";
import {
  ArrowLeft, Phone, MapPin, ShieldCheck, CheckCircle2,
  Clock3, CalendarDays, ClipboardList, ShoppingBasket,
  Wallet, Wheat, Sprout, LandPlot, AlertCircle, ExternalLink
} from "lucide-react";

const FARMER = {
  id: "FR1024",
  name: "Ramesh Kumar",
  mobile: "9876543210",
  village: "Chas",
  district: "Bokaro",
  state: "Jharkhand",
  status: "Verified",
  registeredOn: "12 Jan 2026",
  verifiedOn: "13 Jan 2026",
  land: { total: "4.5 Acres", irrigated: "3.2 Acres", rainfed: "1.3 Acres" },
  crops: [
    { name: "Wheat", area: "2.5 Acres", season: "Rabi" },
    { name: "Rice", area: "1.5 Acres", season: "Kharif" },
    { name: "Vegetables", area: "0.5 Acres", season: "Year Round" },
  ],
  activity: {
    bookings: 18, completedBookings: 16, queueVisits: 21,
    procurement: "842 kg", procurementValue: "₹48,620",
    payments: "₹48,620", pendingPayment: "₹0",
  },
};

export default function FarmerDetailsPage() {
  return (
    <div className="h-[calc(100vh-70px)] overflow-hidden p-3 sm:p-5 select-none flex flex-col">
      {/* Top Header */}
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/officer/farmers"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400">
              <span>Farmers</span> <span>/</span> <span className="text-emerald-600">{FARMER.id}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Farmer Profile</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle2 size={13} /> {FARMER.status}
        </div>
      </header>

      {/* Main 2-Column Grid */}
      <div className="grid flex-1 min-h-0 gap-3 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
        {/* Left Column: Farmer Bio & Crops (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0 overflow-y-auto pr-0.5">
          {/* Identity & Basic Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  RK
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{FARMER.name}</h2>
                  <p className="text-[8px] text-slate-400 font-bold">Farmer ID: {FARMER.id}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-700 dark:bg-emerald-950/40">
                <ShieldCheck size={11} /> Verified Account
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-[9px]">
              {[
                { icon: Phone, label: "Mobile", val: FARMER.mobile },
                { icon: MapPin, label: "Village", val: FARMER.village },
                { icon: MapPin, label: "District", val: FARMER.district },
                { icon: MapPin, label: "State", val: FARMER.state },
                { icon: CalendarDays, label: "Registered", val: FARMER.registeredOn },
                { icon: ShieldCheck, label: "Verified", val: FARMER.verifiedOn },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-1 text-[7px] text-slate-400 uppercase font-bold mb-0.5">
                    <c.icon size={11} /> {c.label}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.val}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Land Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black">
              <LandPlot size={14} className="text-emerald-500" /> Land Holdings
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[9px]">
              {Object.entries(FARMER.land).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                  <span className="text-[8px] uppercase text-slate-400 font-bold capitalize">{k}</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Crops Registered */}
          <section className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black">
              <Sprout size={14} className="text-emerald-500" /> Registered Produce
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-1">
              {FARMER.crops.map((crop) => (
                <div key={crop.name} className="flex items-center justify-between py-2 text-[9px]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><Wheat size={12} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{crop.name}</p>
                      <span className="text-[7px] text-slate-400">{crop.season}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-700 dark:text-slate-300">{crop.area}</p>
                    <span className="text-[7px] text-slate-400">Cultivated</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Activity, History & Totals (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0 overflow-y-auto pr-0.5">
          {/* Metrics Matrix */}
          <section className="grid grid-cols-2 gap-2">
            {[
              { label: "Bookings", val: FARMER.activity.bookings, sub: `${FARMER.activity.completedBookings} done`, icon: CalendarDays, c: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
              { label: "Visits", val: FARMER.activity.queueVisits, sub: "Queue entries", icon: ClipboardList, c: "text-purple-500 bg-purple-50 dark:bg-purple-950/40" },
              { label: "Procured", val: FARMER.activity.procurement, sub: FARMER.activity.procurementValue, icon: ShoppingBasket, c: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
              { label: "Settled", val: FARMER.activity.payments, sub: `${FARMER.activity.pendingPayment} due`, icon: Wallet, c: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.c} mb-1.5`}><m.icon size={13} /></div>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{m.label}</p>
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mt-0.5">{m.val}</p>
                <p className="text-[7px] text-slate-400 mt-0.5">{m.sub}</p>
              </div>
            ))}
          </section>

          {/* Activity Logs (Bookings & Visits combined) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black">
              <span>Recent Centre Visits</span>
              <button className="flex items-center gap-0.5 text-[8px] text-emerald-600 font-bold hover:underline">
                View logs <ExternalLink size={9} />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-1">
              {[
                { title: "#BK1024", sub: "Wheat • 280 kg", date: "01 Sep 2026", status: "Completed" },
                { title: "Token #104", sub: "Weighbridge clearance", date: "Today • 10:30", status: "Completed" },
                { title: "#BK0987", sub: "Rice • 190 kg", date: "26 Aug 2026", status: "Completed" },
                { title: "Token #087", sub: "Gate pass processed", date: "26 Aug • 11:20", status: "Completed" },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-[9px]">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{log.title}</p>
                    <span className="text-[7px] text-slate-400">{log.sub}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] text-slate-400">{log.date}</p>
                    <span className="font-bold text-emerald-600 text-[8px]">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Read-Only Notice */}
          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[8px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
            <AlertCircle size={13} className="shrink-0 mt-0.5 text-slate-400" />
            <span>Registration records are read-only for field officers. Profile alterations require mandi administrative clearance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}