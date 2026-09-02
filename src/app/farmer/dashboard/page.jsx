"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar,
  Users,
  Scale,
  DollarSign,
  Bell,
  ChevronRight,
  Sparkles,
  RefreshCw,
  MapPin,
  Clock,
  ArrowRight,
  QrCode,
  Download,
  X,
  Plus,
  ShieldCheck,
} from "lucide-react";

const NEARBY_CENTRES = [
  {
    id: "xyz",
    name: "XYZ Mandi",
    distance: "4.2 km",
    queue: 42,
    wait: "~48 min",
    capacity: "72%",
    status: "Open",
    recommended: false,
  },
  {
    id: "abc",
    name: "ABC Centre",
    distance: "6.1 km",
    queue: 18,
    wait: "~20 min",
    capacity: "35%",
    status: "Open",
    recommended: true,
  },
  {
    id: "def",
    name: "DEF Centre",
    distance: "9.8 km",
    queue: 76,
    wait: "~90 min",
    capacity: "88%",
    status: "Busy",
    recommended: false,
  },
];

const PROCUREMENT_STEPS = [
  { id: "booking", label: "Booking Confirmed", shortLabel: "Booking", status: "completed", icon: "✓" },
  { id: "verification", label: "Gate Verified", shortLabel: "Verification", status: "completed", icon: "✓" },
  { id: "weighing", label: "Weighing", shortLabel: "Weighing", status: "active", icon: "●" },
  { id: "quality", label: "Quality Check", shortLabel: "Quality", status: "upcoming", icon: "○" },
  { id: "procurement", label: "Procurement", shortLabel: "Procurement", status: "upcoming", icon: "○" },
  { id: "payment", label: "Payment", shortLabel: "Payment", status: "upcoming", icon: "○" },
];

function DashboardContent() {
  const [aheadCount, setAheadCount] = useState(12);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showTrackQueueModal, setShowTrackQueueModal] = useState(false);
  const [showBookSlotModal, setShowBookSlotModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleSyncQueue = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAheadCount((prev) => (prev > 1 ? prev - 1 : 12));
      setIsRefreshing(false);
      showToast("Live queue synced successfully");
    }, 600);
  };

  return (
    <div className="h-full w-full max-w-[1600px] flex flex-col min-h-0 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg overflow-hidden select-none">
      
      {/* ACCENT LINE */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

      <div className="flex-1 min-h-0 flex flex-col p-3.5 sm:p-5 overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="shrink-0 pb-3 border-b border-slate-200/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Harvest Season 2026</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Good Morning, Rajesh 👋
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Live mandi appointment telemetry and procurement queue status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBookSlotModal(true)}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>BOOK NEW SLOT</span>
          </button>
        </header>

        {/* SCROLLABLE INNER DASHBOARD */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 hover:scrollbar-thumb-emerald-500">
          
          {/* TOP 4 STAT TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <StatCard
              title="Upcoming Appointment"
              value="10:30 AM"
              sub="12 Sept 2026"
              icon={Clock}
              iconColor="text-emerald-500"
              subColor="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              title="Queue Token"
              value="#47"
              sub="Gate Pass Active"
              icon={Users}
              iconColor="text-cyan-500"
              valueColor="text-cyan-600 dark:text-cyan-400"
            />
            <StatCard
              title="Procurement"
              value="Weighing"
              sub="In Progress (Bay 2)"
              icon={Scale}
              iconColor="text-amber-500"
              valueColor="text-amber-500"
              subColor="text-amber-600/80 dark:text-amber-400/80"
            />
            <StatCard
              title="Payment"
              value="₹42,500"
              sub="Pending DBT Payment"
              icon={DollarSign}
              iconColor="text-lime-500"
              valueColor="text-lime-600 dark:text-lime-400"
            />
          </div>

          {/* LIVE QUEUE & APPOINTMENT CARDS */}
          <div className="grid md:grid-cols-2 gap-3">
            
            {/* LIVE QUEUE CARD */}
            <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      LIVE QUEUE
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncQueue}
                    className="h-6 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
                    <span>Sync</span>
                  </button>
                </div>

                <div className="my-2.5 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                    Your Assigned Token
                  </span>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-lime-500 my-0.5">
                    Token #47
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>👥 {aheadCount} farmers ahead</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-amber-500">⏳ ~45 min wait</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Recommended Arrival
                  </span>
                  <div className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                    10:05 AM
                  </div>
                </div>
              </div>

              <div className="pt-2.5">
                <button
                  type="button"
                  onClick={() => setShowTrackQueueModal(true)}
                  className="w-full h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <span>Track Queue Live</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* UPCOMING APPOINTMENT CARD */}
            <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      UPCOMING APPOINTMENT
                    </h3>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Confirmed
                  </span>
                </div>

                <div className="my-2.5 space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Date & Slot</span>
                    <span className="font-black text-slate-900 dark:text-white">12 Sept 2026 • 10:30 AM</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">XYZ Mandi (Main Yard)</span>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                      4.2 km
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                      <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 block">Produce</span>
                      <p className="font-black text-slate-900 dark:text-white mt-0.5">🌾 Paddy (25 Q)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                      <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 block">Vehicle</span>
                      <p className="font-black text-slate-900 dark:text-white mt-0.5">🚜 BR-01-AB-1234</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(true)}
                  className="w-full h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200/80 dark:border-white/10 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <span>View Details & Gate Pass</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* PROCUREMENT TIMELINE */}
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5 mb-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Procurement Progress
              </h3>
              <span className="text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                Phase 3 Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {PROCUREMENT_STEPS.map((step) => {
                const isCompleted = step.status === "completed";
                const isActive = step.status === "active";

                return (
                  <div
                    key={step.id}
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold"
                        : isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-white/5 text-slate-400 opacity-60"
                    }`}
                  >
                    <span className="text-xs font-black mb-0.5">{step.icon}</span>
                    <span className="text-[11px] font-bold block truncate w-full">{step.shortLabel}</span>
                    <span className="text-[8px] uppercase tracking-wider block text-slate-400">
                      {isCompleted ? "Done" : isActive ? "Active" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WEIGHING & NOTICE */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Current Weighing
                  </h3>
                </div>
                <span className="text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 block">Weighbridge</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">Bay 02</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 block">Estimated</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">25 Q</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-500/10">
                  <Bell className="w-3.5 h-3.5 text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Notice
                  </h3>
                </div>
                <p className="text-[11px] font-bold text-slate-900 dark:text-white mt-2">
                  Arrive according to your recommended window: 10:05 AM.
                </p>
              </div>
              <span className="text-[9px] text-slate-400 mt-1">Keep your QR Gate Pass ready at check-in.</span>
            </div>
          </div>

          {/* NEARBY CENTRES */}
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5 mb-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Nearby Procurement Centres
              </h3>
              <span className="text-[10px] text-slate-400">Live Congestion View</span>
            </div>

            <div className="grid md:grid-cols-3 gap-2.5">
              {NEARBY_CENTRES.map((centre) => (
                <div
                  key={centre.id}
                  className={`p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border transition-all flex flex-col justify-between ${
                    centre.recommended ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : "border-slate-200/60 dark:border-white/5"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{centre.name}</span>
                      </h4>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        {centre.distance}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>Queue: <strong className="text-slate-900 dark:text-white">{centre.queue}</strong></span>
                      <span>Wait: <strong className="text-amber-500">{centre.wait}</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Selected ${centre.name}`);
                      setShowBookSlotModal(true);
                    }}
                    className="mt-2.5 w-full h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition active:scale-95"
                  >
                    Select Centre
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* GATE PASS MODAL */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-4 text-center"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-xs font-black text-slate-900 dark:text-white">Digital Gate Pass</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-[9px] font-mono font-bold text-slate-500">Token #47 • Bay 02</p>
                <div className="mx-auto my-2 h-28 w-28 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <QrCode className="h-20 w-20 text-slate-900" />
                </div>
                <p className="text-[9px] text-slate-400">Scan at Mandi check-in gate.</p>
              </div>

              <div className="mt-3 space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Gate Pass downloaded");
                    setShowAppointmentModal(false);
                  }}
                  className="w-full h-8 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" /> Download Pass
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRACK QUEUE MODAL */}
      <AnimatePresence>
        {showTrackQueueModal && (
          <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-4 text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-1.5">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white">Live Queue Radar</h3>
              <p className="text-[10px] text-slate-400">XYZ Mandi • Scale #02</p>

              <div className="my-2.5 space-y-1.5 text-xs text-left">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                  <span className="text-slate-400">Current:</span>
                  <span className="font-black text-emerald-500">Token #35</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                  <span className="text-slate-400">Your Turn:</span>
                  <span className="font-black text-slate-900 dark:text-white">Token #47 ({aheadCount} ahead)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrackQueueModal(false)}
                className="w-full h-8 rounded-lg bg-emerald-600 text-white font-black text-xs transition active:scale-95"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOK SLOT MODAL */}
      <AnimatePresence>
        {showBookSlotModal && (
          <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-4"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-white/10 mb-2.5">
                <h3 className="text-xs font-black text-slate-900 dark:text-white">Book Procurement Slot</h3>
                <button
                  type="button"
                  onClick={() => setShowBookSlotModal(false)}
                  className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Crop</label>
                  <select className="w-full h-8 px-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 font-bold outline-none">
                    <option>Paddy (PR-126)</option>
                    <option>Wheat (Sharbati)</option>
                    <option>Maize (Yellow)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Volume (Q)</label>
                    <input
                      type="number"
                      defaultValue={25}
                      className="w-full h-8 px-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</label>
                    <input
                      type="date"
                      defaultValue="2026-09-12"
                      className="w-full h-8 px-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Vehicle License</label>
                  <input
                    type="text"
                    defaultValue="BR-01-AB-1234"
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 font-bold uppercase outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Slot booked! Token #48 generated");
                    setShowBookSlotModal(false);
                  }}
                  className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition active:scale-95"
                >
                  Confirm Slot
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookSlotModal(false)}
                  className="px-3 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-semibold"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, iconColor = "text-emerald-500", valueColor = "text-slate-900 dark:text-white", subColor = "text-slate-400" }) {
  return (
    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between text-slate-400 text-[9px] font-bold uppercase tracking-wider">
        <span className="truncate">{title}</span>
        <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
      </div>
      <div className="mt-1.5">
        <div className={`text-lg sm:text-xl font-black ${valueColor}`}>{value}</div>
        <p className={`text-[9px] font-semibold mt-0.5 ${subColor}`}>{sub}</p>
      </div>
    </div>
  );
}

export default function FarmerDashboard() {
  return <DashboardContent />;
}