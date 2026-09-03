"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  ArrowDown, ArrowUp, Bell, Check, CheckCircle2, ChevronRight,
  Clock3, MapPin, Play, RefreshCw, SkipForward, UserCheck,
  Users, Zap, XCircle
} from "lucide-react";

const fetcher = (url) => fetch(url, { cache: "no-store", credentials: "include" }).then((r) => r.json());

const fmtTime = (v) => {
  if (!v) return "—";
  const [h, m] = String(v).split(":");
  if (!m) return v;
  const hr = Number(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const getInitials = (n = "Farmer") => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const STATUS_CONFIG = {
  WAITING: { label: "Waiting", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500" },
  CALLED: { label: "Called", cls: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400", dot: "bg-cyan-500" },
  PROCESSING: { label: "Processing", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", dot: "bg-blue-500" },
  SKIPPED: { label: "Skipped", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", dot: "bg-slate-400" },
  COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400", dot: "bg-red-500" },
};

export default function QueuePage() {
  const [selectedId, setSelectedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastAction, setLastAction] = useState("Connecting to live queue...");

  const { data, error, isLoading, isValidating, mutate } = useSWR("/api/officer/queue", fetcher, {
    refreshInterval: 3000,
    keepPreviousData: true,
  });

  const queue = data?.queue || [];
  const stats = data?.stats || {};
  const centre = data?.centre || null;

  const activeQueue = useMemo(
    () => queue.filter((i) => !["COMPLETED", "SKIPPED", "CANCELLED"].includes(i.status)).sort((a, b) => a.position - b.position),
    [queue]
  );

  const selectedFarmer = queue.find((i) => i.id === selectedId) || activeQueue[0] || null;
  const currentProcessing = queue.find((i) => i.status === "PROCESSING");

  const runAction = async (queueItem, action) => {
    if (!queueItem) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/officer/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ queueId: queueItem.id, action }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Action failed");
      setSelectedId(result.queueId || queueItem.id);
      setLastAction(result.message || "Queue updated");
      await mutate();
    } catch (err) {
      setLastAction(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const callNext = () => runAction(currentProcessing || activeQueue[0], "CALL_NEXT");

  if (error && !data) {
    return (
      <main className="flex h-[91vh] items-center justify-center p-4">
        <div className="w-full max-w-xs rounded-2xl border border-red-200 bg-white p-5 text-center shadow-xs dark:border-red-900 dark:bg-slate-900">
          <XCircle size={22} className="mx-auto text-red-500" />
          <h2 className="mt-2 text-xs font-black">Queue unavailable</h2>
          <p className="mt-1 text-[8px] text-slate-400">{error.message}</p>
          <button onClick={() => mutate()} className="mt-3 w-full rounded-lg bg-emerald-600 py-1.5 text-[8px] font-black text-white">Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[91vh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 select-none p-3 sm:p-4 flex flex-col">
      {/* Header */}
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className={`h-1.5 w-1.5 rounded-full ${error ? "bg-red-500" : "bg-emerald-500"}`} />
            <span className="text-[8px] font-black uppercase tracking-wider">Live Operations</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Queue Management</h1>
        </div>

        <div className="flex items-center gap-2">
          {centre && (
            <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[8px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <MapPin size={11} className="text-emerald-500" /> {centre.name}
            </div>
          )}
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[7px] font-black text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30">
            <span className={`h-1 w-1 rounded-full ${isValidating ? "animate-pulse bg-amber-500" : "bg-emerald-500"}`} />
            {isValidating ? "SYNCING" : "LIVE"}
          </span>
          <button onClick={() => mutate()} disabled={isValidating} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw size={11} className={isValidating ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Stats Matrix */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 shrink-0">
        {[
          { label: "In Queue", val: stats.total || activeQueue.length, icon: Users, c: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
          { label: "Waiting", val: stats.waiting || 0, icon: Clock3, c: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
          { label: "Processing", val: stats.processing || 0, icon: Zap, c: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Completed", val: stats.completed || 0, icon: CheckCircle2, c: "text-purple-500 bg-purple-50 dark:bg-purple-950/40" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.c}`}><s.icon size={13} /></div>
            <div>
              <p className="text-[7px] text-slate-400">{s.label}</p>
              <p className="text-sm font-black leading-none text-slate-900 dark:text-white">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Call Next Action Banner */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Bell size={13} />
            {currentProcessing && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
          </div>
          <div className="truncate">
            <p className="text-[8px] font-black text-slate-900 dark:text-white truncate">{lastAction}</p>
            <p className="text-[7px] text-slate-400">
              {currentProcessing ? `Processing Token ${currentProcessing.token}` : "No farmer currently processing"}
            </p>
          </div>
        </div>
        <button
          onClick={callNext}
          disabled={actionLoading || !activeQueue.some((i) => i.status === "WAITING" && i.arrived)}
          className="flex h-7 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[8px] font-black text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          <Bell size={10} /> Call Next
        </button>
      </div>

      {/* Main Workspace Queue Grid */}
      <div className="flex flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Left Queue List */}
        <div className="flex flex-1 flex-col min-h-0 border-r border-slate-100 dark:border-slate-800">
          <div className="hidden lg:grid grid-cols-[36px_1.5fr_0.8fr_0.8fr_1fr_auto] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[7px] font-black uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
            <span>#</span><span>Farmer</span><span>Token</span><span>Time</span><span>Status</span><span />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {activeQueue.map((item, idx) => {
              const selected = selectedFarmer?.id === item.id;
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.WAITING;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex flex-col gap-2 p-2.5 transition cursor-pointer ${
                    selected ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div className="grid grid-cols-[28px_minmax(0,1fr)_auto] lg:grid-cols-[36px_1.5fr_0.8fr_0.8fr_1fr_20px] items-center gap-2 text-[9px]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[8px]">
                      {String(item.position || idx + 1).padStart(2, "0")}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        {getInitials(item.farmer?.name)}
                      </div>
                      <div className="truncate">
                        <p className="font-black text-slate-900 dark:text-white truncate">{item.farmer?.name}</p>
                        <span className="text-[7px] text-slate-400">{item.farmerId}</span>
                      </div>
                    </div>

                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.token}</span>
                    <span className="hidden lg:block text-slate-400 text-[8px]">{fmtTime(item.slot?.startTime)}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-bold ${statusCfg.cls}`}>
                      <span className={`h-1 w-1 rounded-full ${statusCfg.dot}`} /> {statusCfg.label}
                    </span>
                    <ChevronRight size={12} className={`hidden lg:block ${selected ? "text-emerald-500" : "text-slate-300"}`} />
                  </div>

                  {/* Inline Shift / Quick Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/40 text-[7px]">
                    <div className="flex gap-1">
                      <button
                        disabled={idx === 0 || actionLoading}
                        onClick={(e) => { e.stopPropagation(); runAction(item, "MOVE_UP"); }}
                        className="rounded border border-slate-200 px-1.5 py-0.5 font-bold hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ArrowUp size={9} />
                      </button>
                      <button
                        disabled={idx === activeQueue.length - 1 || actionLoading}
                        onClick={(e) => { e.stopPropagation(); runAction(item, "MOVE_DOWN"); }}
                        className="rounded border border-slate-200 px-1.5 py-0.5 font-bold hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ArrowDown size={9} />
                      </button>
                    </div>

                    <div className="flex gap-1">
                      {item.status === "WAITING" && !item.arrived && (
                        <button onClick={(e) => { e.stopPropagation(); runAction(item, "ARRIVED"); }} className="rounded bg-emerald-600 px-2 py-0.5 font-bold text-white">Arrived</button>
                      )}
                      {item.status === "WAITING" && item.arrived && (
                        <button onClick={(e) => { e.stopPropagation(); runAction(item, "START"); }} className="rounded bg-emerald-600 px-2 py-0.5 font-bold text-white">Start</button>
                      )}
                      {item.status === "PROCESSING" && (
                        <button onClick={(e) => { e.stopPropagation(); runAction(item, "COMPLETE"); }} className="rounded bg-emerald-600 px-2 py-0.5 font-bold text-white">Complete</button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); runAction(item, "SKIP"); }} className="rounded border px-2 py-0.5 font-bold text-slate-500">Skip</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {activeQueue.length === 0 && !isLoading && (
              <div className="flex h-48 flex-col items-center justify-center text-slate-400 text-[8px]">
                <CheckCircle2 size={20} className="mb-1 text-emerald-500" /> Queue is clear
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Farmer Details */}
        <aside className="hidden lg:flex lg:w-64 flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/20 p-3 text-[8px]">
          {selectedFarmer ? (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div>
                <span className="text-[7px] font-black uppercase tracking-wider text-emerald-600">Selected Entry</span>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{selectedFarmer.farmer?.name}</p>
                <span className="text-slate-400 font-bold">{selectedFarmer.farmerId} • {selectedFarmer.village}</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 space-y-1">
                <div className="flex justify-between"><span>Token</span><span className="font-bold">{selectedFarmer.token}</span></div>
                <div className="flex justify-between"><span>Position</span><span className="font-bold">#{selectedFarmer.position}</span></div>
                <div className="flex justify-between"><span>Commodity</span><span className="font-bold">{selectedFarmer.commodity?.name || "—"}</span></div>
                <div className="flex justify-between"><span>Quantity</span><span className="font-bold">{selectedFarmer.expectedQuantity || 0} Qtl</span></div>
                <div className="flex justify-between"><span>Appointment</span><span className="font-bold">{fmtTime(selectedFarmer.slot?.startTime)}</span></div>
                <div className="flex justify-between"><span>Arrival</span><span className="font-bold text-emerald-600">{selectedFarmer.arrived ? "Arrived" : "Pending"}</span></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400 text-center">Select an entry from the live feed</div>
          )}
        </aside>
      </div>
    </main>
  );
}