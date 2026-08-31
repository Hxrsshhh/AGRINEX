"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gauge,
  HelpCircle,
  Info,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
  Timer,
  Truck,
  Users,
  Wheat,
  X,
  QrCode,
} from "lucide-react";

const RECENT_QUEUE = [
  { token: "AGR-TK-4706", status: "Completed", time: "10:34 AM" },
  { token: "AGR-TK-4707", status: "Processing", time: "10:42 AM" },
  { token: "AGR-TK-4708", status: "Waiting", time: "10:48 AM" },
  { token: "AGR-TK-4709", status: "You", time: "10:51 AM" },
];

export default function QueuePage() {
  const [queuePosition, setQueuePosition] = useState(8);
  const [aheadCount, setAheadCount] = useState(7);
  const [estimatedWait, setEstimatedWait] = useState(22);
  const [lastUpdated, setLastUpdated] = useState("10:51 AM");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queueStatus, setQueueStatus] = useState("waiting");
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const refreshQueue = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      showToast("Queue status updated");
    }, 600);
  };

  return (
    <div className="relative h-full w-full flex flex-col min-h-0 overflow-hidden select-none">
      {/* Background Ambience Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-lime-500/10 blur-[140px]" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white dark:bg-emerald-500 dark:text-slate-950 px-4 py-2.5 text-xs font-bold shadow-2xl backdrop-blur-md border border-white/10"
          >
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <header className="shrink-0 flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Live Procurement Queue
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              XYZ Procurement Centre • Rampur Sub-Yard (Kamrup)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 text-xs">
            <span className="text-[10px] text-slate-400 font-medium">Sync:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{lastUpdated}</span>
          </div>

          <button
            type="button"
            onClick={refreshQueue}
            aria-label="Refresh queue"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-850 transition"
          >
            <RefreshCw
              className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main Viewport Content Card */}
      <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white/60 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 overflow-hidden">
        
        {/* Top Accent Strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-lime-500/20" />

        {/* 2-Column Responsive Dashboard Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 overflow-y-auto lg:overflow-hidden">
          
          {/* Left Column: Live Turn & Activity (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3 min-h-0">
            
            {/* Live Queue Hero Display */}
            <div className="relative rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-4 sm:p-5 text-white shadow-xl shadow-emerald-950/20 overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-md">
                  Active Status
                </span>
                <span className="font-mono text-xs font-bold bg-black/20 px-2.5 py-1 rounded-lg">
                  Token: AGR-TK-4709
                </span>
              </div>

              <div className="relative mt-2 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl sm:text-7xl font-black tracking-tight leading-none">
                      {queuePosition}
                    </span>
                    <span className="text-xs uppercase font-bold text-emerald-200">
                      Position
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-100 font-medium">
                    {aheadCount > 0
                      ? `${aheadCount} farmers ahead in queue`
                      : "You are next to enter the weighbridge"}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Timer className="h-4 w-4 text-emerald-200" />
                  <span className="text-xl font-black mt-0.5">{estimatedWait}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">
                    min wait
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-semibold text-emerald-100 mb-1">
                  <span>Queue Flow</span>
                  <span>{queuePosition <= 2 ? "Ready at gate" : "Moving regularly"}</span>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={false}
                    animate={{
                      width: `${Math.max(10, 100 - queuePosition * 7)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-2 shrink-0">
              <QueueMetric icon={Users} label="Ahead" value={aheadCount} />
              <QueueMetric icon={Timer} label="Est. Wait" value={estimatedWait} suffix="m" />
              <QueueMetric icon={Gauge} label="Load" value="68%" />
              <QueueMetric icon={Scale} label="Avg Time" value="4m" />
            </div>

            {/* Queue Progression Stream */}
            <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-slate-200/70 bg-slate-50/70 dark:border-white/10 dark:bg-slate-800/40 p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70 dark:border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Token Activity
                </p>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Feed
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 my-auto">
                {RECENT_QUEUE.map((item) => (
                  <div
                    key={item.token}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      item.status === "You"
                        ? "bg-emerald-500/15 border-emerald-500/40 shadow-sm"
                        : "bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/5"
                    }`}
                  >
                    <p className="font-mono text-xs font-black">#{item.token.slice(-4)}</p>
                    <p
                      className={`text-[10px] font-bold mt-0.5 ${
                        item.status === "Completed"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : item.status === "Processing"
                          ? "text-amber-500"
                          : item.status === "You"
                          ? "text-emerald-600 font-extrabold dark:text-emerald-300"
                          : "text-slate-400"
                      }`}
                    >
                      {item.status}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Verified Details & Status (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 min-h-0">
            
            {/* Token Badge */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Farmer Verification</p>
                  <p className="font-mono text-sm font-black text-slate-800 dark:text-white">AGR-TK-4709</p>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                <QrCode className="h-4 w-4" />
              </div>
            </div>

            {/* Booking Details Compact Grid */}
            <div className="rounded-xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-3 shrink-0">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Booking Specification</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <QueueDetail icon={CalendarDays} label="Arrival Date" value="12 Sep 2026" />
                <QueueDetail icon={Clock3} label="Slot Window" value="10:00 - 11:00 AM" />
                <QueueDetail icon={Wheat} label="Crop / Produce" value="Paddy (25 Q)" />
                <QueueDetail icon={Truck} label="Transport" value="Tractor-Trolley" />
                <QueueDetail icon={Navigation} label="Assigned Gate" value="Gate #2" highlight />
                <QueueDetail icon={Scale} label="Target Weight" value="25.0 Qtl" />
              </div>
            </div>

            {/* Centre Capacity Gauge */}
            <div className="rounded-xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-3 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sub-Yard Operations</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">68% Load</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68%" }} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg text-center">
                  <p className="text-[9px] text-slate-400">In Queue</p>
                  <p className="text-xs font-bold">38 Trucks</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg text-center">
                  <p className="text-[9px] text-slate-400">Clearance Avg</p>
                  <p className="text-xs font-bold">45 min</p>
                </div>
              </div>
            </div>

            {/* Instructions Strip */}
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 shrink-0">
              <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Keep the gate pass and weigh slip ready. Turn on your vehicle when called to <strong>Gate 2</strong>.
              </p>
            </div>

          </div>

        </div>

        {/* Unified Bottom Action Bar */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200/70 bg-slate-50/90 dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">Automatic updates active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Help Desk
            </button>

            <button
              type="button"
              onClick={() => showToast("Navigation routing to Gate 2 active.")}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
            >
              <Navigation className="h-3.5 w-3.5" />
              Navigate Gate 2
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="absolute right-3.5 top-3.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-3">
                <HelpCircle className="h-5 w-5" />
              </div>

              <h3 className="text-base font-black">Procurement Help Desk</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Reach out if your serial token has stalled or there is an issue with your slot.
              </p>

              <div className="space-y-2">
                <HelpOption icon={Phone} title="Helpline" description="1800-419-0123" />
                <HelpOption icon={MapPin} title="In-Yard Desk" description="Reception Window #1" />
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="mt-4 w-full h-8 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   HELPER SUB-COMPONENTS
============================================================ */

function QueueMetric({ icon: Icon, label, value, suffix }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-2.5">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        <Icon className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase truncate">{label}</span>
      </div>
      <p className="text-base font-black text-slate-800 dark:text-white">
        {value}
        {suffix && <span className="text-xs text-slate-400 font-medium ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}

function QueueDetail({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50/80 dark:bg-slate-900/50">
      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] text-slate-400 leading-none">{label}</p>
        <p
          className={`text-[11px] font-bold truncate leading-tight mt-0.5 ${
            highlight ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function HelpOption({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-xs font-bold">{title}</p>
        <p className="text-[10px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}