"use client";

import React, { useState, useCallback } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck, CalendarDays, CheckCircle2, ChevronRight, Clock3, Gauge,
  HelpCircle, Info, MapPin, Navigation, Phone, RefreshCw, Scale, ShieldCheck,
  Timer, Truck, Users, Wheat, X, AlertCircle, Sparkles
} from "lucide-react";

const fetcher = async (url) => {
  const response = await fetch(url, { method: "GET", cache: "no-store", headers: { "Cache-Control": "no-cache" } });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Failed to fetch queue");
  return data;
};

export default function QueuePage() {
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState("");

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/procurement/queue", fetcher,
    { refreshInterval: 5000, revalidateOnFocus: true, revalidateOnReconnect: true, dedupingInterval: 2000, shouldRetryOnError: true, errorRetryCount: 3, errorRetryInterval: 3000 }
  );

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2500);
  }, []);

  const refreshQueue = async () => {
    try {
      await mutate();
      showToast("Queue status updated");
    } catch {
      showToast("Unable to update queue");
    }
  };

  if (isLoading) return <QueueLoading />;
  if (error) return <QueueError message={error.message} onRetry={refreshQueue} />;
  if (!data?.hasBooking) return <NoBooking />;
  if (!data?.hasQueue) return <QueueNotCreated onRefresh={refreshQueue} isRefreshing={isValidating} />;

  const queue = data.data;
  const { centre, commodity, slot, capacity } = queue;
  const queuePosition = queue.position;
  const aheadCount = queue.farmersAhead ?? 0;
  const estimatedWait = queue.estimatedWaitMin ?? 0;
  const queueStatus = queue.status;
  const tokenNumber = queue.tokenNumber || "N/A";

  const centreName = centre?.name || centre?.centreId || "Procurement Centre";
  const centreLocation = [centre?.address?.district, centre?.address?.state].filter(Boolean).join(", ");
  const commodityName = commodity?.name || "Commodity";
  const quantity = queue.booking?.expectedQuantity ?? 0;
  const quantityUnit = commodity?.unit || "QUINTAL";
  const vehicleLabel = formatVehicleType(queue.booking?.vehicleType);
  const vehicleNumber = queue.booking?.vehicleNumber || "Not available";
  const slotDate = formatDate(slot?.date);
  const slotWindow = [slot?.startTime, slot?.endTime].filter(Boolean).join(" - ");
  const assignedGate = "Gate #2";
  const lastUpdated = formatTime(new Date());
  const statusConfig = getQueueStatusConfig(queueStatus);
  const recentActivity = Array.isArray(queue.recentActivity) ? queue.recentActivity : [];

  return (
    <div className="h-full w-full overflow-hidden flex flex-col justify-center items-center p-2 sm:p-4 select-none antialiased">
      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[500] px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-7xl h-full min-h-[92vh] max-h-[94vh] flex flex-col min-h-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-emerald-950/5 dark:shadow-black/50 overflow-hidden relative">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 lg:p-7 overflow-hidden">
          {/* HEADER */}
          <header className="shrink-0 pb-4 border-b border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Live APMC Telemetry Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  Live Procurement Queue
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {centreName}{centreLocation ? ` • ${centreLocation}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-800/60 px-3 py-1.5 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="text-[10px] text-slate-400 font-medium">Sync:</span>
                <span>{lastUpdated}</span>
              </div>
              <button
                type="button"
                onClick={refreshQueue}
                disabled={isValidating}
                aria-label="Refresh queue"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${isValidating ? "animate-spin text-emerald-500" : ""}`} />
              </button>
            </div>
          </header>

          {/* DASHBOARD SPLIT */}
          <div className="flex-1 min-h-0 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto lg:overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3.5 min-h-0">
              {/* HERO QUEUE BANNER */}
              <div className="relative rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-4 sm:p-5 text-white shadow-xl shadow-emerald-950/20 overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 h-44 w-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex items-center justify-between gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md ${statusConfig.badge}`}>
                    {statusConfig.label}
                  </span>
                  <span className="font-mono text-xs font-bold bg-black/25 px-2.5 py-1 rounded-xl border border-white/10">
                    Token: {tokenNumber}
                  </span>
                </div>

                <div className="relative mt-2 flex items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl sm:text-6xl font-black tracking-tight leading-none">
                        {queuePosition ?? "—"}
                      </span>
                      <span className="text-xs uppercase font-black text-emerald-200 tracking-wider">Position</span>
                    </div>
                    <p className="mt-1 text-xs text-emerald-100 font-medium">
                      {getQueueMessage(queueStatus, aheadCount)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center h-18 w-18 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                    <Timer className="h-4 w-4 text-emerald-200" />
                    <span className="text-xl font-black mt-0.5">{estimatedWait}</span>
                    <span className="text-[8px] uppercase font-black tracking-widest text-emerald-200">min wait</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-semibold text-emerald-100 mb-1">
                    <span>Queue Flow</span>
                    <span>{getQueueFlowText(queueStatus, queuePosition)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-white rounded-full" initial={false} animate={{ width: `${getProgressWidth(queuePosition)}%` }} transition={{ duration: 0.4 }} />
                  </div>
                </div>
              </div>

              {/* 4 METRIC TILES */}
              <div className="grid grid-cols-4 gap-2.5 shrink-0">
                <QueueMetric icon={Users} label="Ahead" value={aheadCount} />
                <QueueMetric icon={Timer} label="Est. Wait" value={estimatedWait} suffix="m" />
                <QueueMetric icon={Gauge} label="Load" value={`${capacity?.loadPercent ?? 0}%`} />
                <QueueMetric icon={Scale} label="Avg Time" value={capacity?.averageWaitMin ? `${capacity.averageWaitMin}m` : "—"} />
              </div>

              {/* RECENT ACTIVITY */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 p-3.5 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Current Token Activity
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 my-auto">
                  {recentActivity.slice(0, 4).map((item) => (
                    <QueueActivity key={String(item.id)} item={item} />
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="col-span-4 text-center py-6 text-xs text-slate-400">
                      No queue activity yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 min-h-0 overflow-hidden">
              {/* TOKEN BANNER */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 p-3 shrink-0 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Farmer Verification</p>
                    <p className="font-mono text-sm font-black text-slate-900 dark:text-white truncate">{tokenNumber}</p>
                  </div>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              {/* BOOKING DETAILS */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 p-3 shrink-0 shadow-sm">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-2">Booking Specification</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <QueueDetail icon={CalendarDays} label="Arrival Date" value={slotDate || "—"} />
                  <QueueDetail icon={Clock3} label="Slot Window" value={slotWindow || "—"} />
                  <QueueDetail icon={Wheat} label="Crop / Produce" value={`${commodityName} (${quantity} ${quantityUnit})`} />
                  <QueueDetail icon={Truck} label="Transport" value={vehicleLabel} />
                  <QueueDetail icon={Navigation} label="Assigned Gate" value={assignedGate} highlight />
                  <QueueDetail icon={Scale} label="Target Weight" value={`${quantity} ${quantityUnit}`} />
                </div>
              </div>

              {/* CAPACITY */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 p-3 shrink-0 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Sub-Yard Operations</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{capacity?.loadPercent ?? 0}% Load</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-emerald-500 rounded-full" initial={false} animate={{ width: `${capacity?.loadPercent ?? 0}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-50/80 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-200/60 dark:border-white/5">
                    <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">In Queue</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{capacity?.activeQueueCount ?? 0} Farmers</p>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/50 p-2 rounded-xl text-center border border-slate-200/60 dark:border-white/5">
                    <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Avg Wait</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{capacity?.averageWaitMin ?? 0} min</p>
                  </div>
                </div>
              </div>

              {/* VEHICLE & INSTRUCTION */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 p-2.5 shrink-0 shadow-sm flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Vehicle Number</p>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{vehicleNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 shrink-0">
                <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                  Keep gate pass and weigh slip ready. Turn on your vehicle when called to <strong>{assignedGate}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <footer className="shrink-0 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Automatic updates every 5 seconds
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition active:scale-95"
              >
                <HelpCircle className="h-3.5 w-3.5" /> Help Desk
              </button>
              <button
                type="button"
                onClick={() => showToast(`Navigation to ${assignedGate} activated`)}
                className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[11px] font-black text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <Navigation className="h-3.5 w-3.5" /> Navigate {assignedGate} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* HELP MODAL */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-[400] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 15 }} className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-2xl">
              <button type="button" onClick={() => setShowHelp(false)} className="absolute right-3.5 top-3.5 h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500">
                <X className="h-4 w-4" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-3">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Procurement Help Desk</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Reach out if your queue has stalled or there is an issue with your slot.</p>
              <div className="space-y-2">
                <HelpOption icon={Phone} title="Helpline" description="1800-419-0123" />
                <HelpOption icon={MapPin} title="In-Yard Desk" description="Reception Window #1" />
              </div>
              <button type="button" onClick={() => setShowHelp(false)} className="mt-4 w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition active:scale-95">
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QueueActivity({ item }) {
  const status = item.status;
  const statusClass = status === "COMPLETED" ? "text-emerald-600 dark:text-emerald-400" : status === "PROCESSING" ? "text-amber-500" : status === "CALLED" ? "text-blue-500" : item.isYou ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400";
  return (
    <div className={`p-2 rounded-xl border text-center transition-all ${item.isYou ? "bg-emerald-500/15 border-emerald-500/40 shadow-sm" : "bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/5"}`}>
      <p className="font-mono text-xs font-black text-slate-800 dark:text-white">#{String(item.tokenNumber || "").slice(-4)}</p>
      <p className={`text-[10px] font-bold mt-0.5 ${statusClass}`}>{item.isYou ? "You" : formatQueueStatus(status)}</p>
      <p className="text-[8px] uppercase font-bold text-slate-400 mt-0.5">Pos. {item.position}</p>
    </div>
  );
}

function QueueMetric({ icon: Icon, label, value, suffix }) {
  return (
    <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        <Icon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="text-[9px] font-black uppercase tracking-wider truncate">{label}</span>
      </div>
      <p className="text-base font-black text-slate-800 dark:text-white">
        {value}{suffix && <span className="text-xs text-slate-400 font-medium ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}

function QueueDetail({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 min-w-0">
      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400 leading-none">{label}</p>
        <p className={`text-[11px] font-bold truncate mt-0.5 ${highlight ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-slate-700 dark:text-slate-200"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function HelpOption({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-black text-slate-800 dark:text-white">{title}</p>
        <p className="text-[10px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function QueueLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading live queue...</p>
      </div>
    </div>
  );
}

function QueueError({ message, onRetry }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-3xl border border-red-200/80 bg-white/90 p-6 text-center dark:border-red-500/20 dark:bg-slate-900 shadow-2xl">
        <div className="mx-auto h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h2 className="mt-3 text-base font-black text-slate-900 dark:text-white">Unable to load queue</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{message || "Something went wrong while loading queue data."}</p>
        <button type="button" onClick={onRetry} className="mt-4 h-9 px-5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md transition active:scale-95">
          Try Again
        </button>
      </div>
    </div>
  );
}

function NoBooking() {
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-center dark:border-white/10 dark:bg-slate-900 shadow-2xl">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <Wheat className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-base font-black text-slate-900 dark:text-white">No Active Booking</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">You currently do not have an active procurement booking in the queue.</p>
      </div>
    </div>
  );
}

function QueueNotCreated({ onRefresh, isRefreshing }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-3xl border border-amber-200/80 bg-white/90 p-6 text-center dark:border-amber-500/20 dark:bg-slate-900 shadow-2xl">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Timer className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-base font-black text-slate-900 dark:text-white">Queue Entry Pending</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your booking exists, but the queue entry has not been initialized yet.</p>
        <button type="button" onClick={onRefresh} disabled={isRefreshing} className="mt-4 h-9 px-5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md transition active:scale-95 disabled:opacity-60">
          {isRefreshing ? "Checking..." : "Check Again"}
        </button>
      </div>
    </div>
  );
}

function formatDate(val) {
  if (!val) return "";
  try { return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return ""; }
}

function formatTime(val) {
  try { return new Date(val).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); } catch { return "—"; }
}

function formatVehicleType(val) {
  return !val ? "—" : String(val).replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatQueueStatus(val) {
  return !val ? "Unknown" : String(val).replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function getQueueStatusConfig(status) {
  switch (status) {
    case "CALLED": return { label: "Called", badge: "bg-blue-500/20 text-blue-100" };
    case "PROCESSING": return { label: "Processing", badge: "bg-amber-500/20 text-amber-100" };
    case "COMPLETED": return { label: "Completed", badge: "bg-white/20 text-white" };
    case "SKIPPED": case "CANCELLED": return { label: status === "SKIPPED" ? "Skipped" : "Cancelled", badge: "bg-red-500/20 text-red-100" };
    default: return { label: "Waiting", badge: "bg-white/15 text-emerald-100" };
  }
}

function getQueueMessage(status, aheadCount) {
  if (status === "PROCESSING") return "Your procurement is currently being processed.";
  if (status === "CALLED") return "Please proceed to the assigned gate.";
  if (status === "COMPLETED") return "Your procurement has been completed.";
  if (status === "SKIPPED") return "Your queue turn was skipped.";
  if (status === "CANCELLED") return "Your queue entry has been cancelled.";
  return aheadCount > 0 ? `${aheadCount} ${aheadCount === 1 ? "farmer" : "farmers"} ahead in queue` : "You are next to enter the weighbridge";
}

function getQueueFlowText(status, position) {
  if (status === "PROCESSING") return "Processing now";
  if (status === "CALLED") return "Proceed to gate";
  if (status === "COMPLETED") return "Completed";
  return position === 1 ? "Ready at gate" : "Moving regularly";
}

function getProgressWidth(position) {
  return !position ? 100 : Math.max(10, Math.min(100, 100 - (position - 1) * 7));
}