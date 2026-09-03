"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Building2, MapPin, Clock3, Users, PackageCheck, ShieldCheck,
  RefreshCw, Power, AlertTriangle, XCircle, CheckCircle2, Loader2,
  Phone, Mail, CalendarDays, Activity, X
} from "lucide-react";

const fetcher = (url) => fetch(url, { credentials: "include", cache: "no-store" }).then((r) => r.json());
const fmtNum = (n) => new Intl.NumberFormat("en-IN").format(Number(n || 0));

const fmtTime = (t) => {
  if (!t) return "--";
  const [h, m] = t.split(":").map(Number);
  return isNaN(h) ? t : `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const STATUS_MAP = {
  ACTIVE: { label: "OPEN", desc: "Centre is operating normally", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500" },
  INACTIVE: { label: "CLOSED", desc: "Centre is currently closed", icon: XCircle, cls: "bg-slate-500/10 text-slate-600 border-slate-500/20", dot: "bg-slate-500" },
  TEMPORARILY_CLOSED: { label: "TEMP CLOSED", desc: "Temporarily closed for safety/weather", icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-600 border-amber-500/20", dot: "bg-amber-500" },
  FULL: { label: "CAPACITY FULL", desc: "Today's intake limit reached", icon: PackageCheck, cls: "bg-rose-500/10 text-rose-600 border-rose-500/20", dot: "bg-rose-500" },
};

export default function OfficerCentrePage() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data, error, isLoading, isValidating, mutate } = useSWR(`/api/officer/centre?date=${today}`, fetcher, {
    refreshInterval: 3000,
    keepPreviousData: true,
  });

  const [actionLoading, setActionLoading] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");

  const centre = data?.data?.centre;
  const officer = data?.data?.officer;
  const capacity = data?.data?.capacity;

  const rawStatus = centre?.status || "ACTIVE";
  const statusKey = capacity?.isFull && rawStatus === "ACTIVE" ? "FULL" : rawStatus;
  const currentStatus = STATUS_MAP[statusKey] || STATUS_MAP.ACTIVE;
  const StatusIcon = currentStatus.icon;

  const dailyCap = Number(capacity?.dailyCapacity ?? centre?.dailyCapacity ?? 0);
  const usedCap = Number(capacity?.usedCapacity ?? 0);
  const availCap = Math.max(0, dailyCap - usedCap);
  const capPct = dailyCap > 0 ? Math.min(100, Math.round((usedCap / dailyCap) * 100)) : 0;

  const updateStatus = async (status, reason = null) => {
    setActionLoading(status);
    try {
      const res = await fetch("/api/officer/centre", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) throw new Error((await res.json())?.message || "Failed to update status");
      setShowCloseModal(false);
      setCloseReason("");
      await mutate();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  if (isLoading && !centre) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
        <span className="text-xs font-bold">Loading Centre Operations...</span>
      </div>
    );
  }

  if ((error || !centre) && !isLoading) {
    return (
      <div className="mx-auto mt-12 max-w-sm rounded-2xl border border-rose-200 bg-white p-6 text-center dark:border-rose-900/40 dark:bg-slate-900">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
        <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">Failed to load centre details</p>
        <p className="mt-1 text-xs text-slate-400">{error?.message || "No centre assigned to this account"}</p>
        <button onClick={() => mutate()} className="mt-4 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-4 p-3 sm:p-5 select-none">
      {/* Top Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Building2 className="h-4 w-4" />
            <span className="text-[9px] font-black uppercase tracking-wider">Centre Desk</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">{centre.name}</h1>
          <p className="text-[10px] text-slate-400 font-bold">{centre.centreId} • {currentStatus.desc}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-bold dark:border-slate-800 dark:bg-slate-900">
            <span className={`h-1.5 w-1.5 rounded-full ${isValidating ? "animate-pulse bg-amber-500" : "bg-emerald-500"}`} />
            {isValidating ? "Syncing" : "Live"}
          </span>
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Hero Strip & Capacity Cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "Daily Intake", val: fmtNum(dailyCap), sub: "Configured target", icon: PackageCheck, c: "text-emerald-600" },
          { label: "Used Capacity", val: fmtNum(usedCap), sub: `${capPct}% utilised`, icon: Activity, c: "text-cyan-600" },
          { label: "Available", val: fmtNum(availCap), sub: statusKey === "FULL" ? "Limit reached" : "Intake open", icon: Users, c: statusKey === "FULL" ? "text-rose-600" : "text-amber-500" },
          { label: "Line Capacity", val: fmtNum(centre.processingCapacity), sub: "Simultaneous checkouts", icon: ShieldCheck, c: "text-violet-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
              <s.icon className={`h-3.5 w-3.5 ${s.c}`} />
            </div>
            <p className="mt-1 text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">{s.val}</p>
            <p className="mt-0.5 text-[8px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Centre Specs & Contact (7 Cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Facility Details</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-black ${currentStatus.cls}`}>
                <span className={`h-1 w-1 rounded-full ${currentStatus.dot}`} /> {currentStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px]">
              {[
                { label: "Village / Pin", val: `${centre.address?.village || "--"}, ${centre.address?.pincode || ""}`, icon: MapPin },
                { label: "District / State", val: `${centre.address?.district || "--"}, ${centre.address?.state || ""}`, icon: MapPin },
                { label: "Operating Time", val: `${fmtTime(centre.operatingHours?.openingTime)} – ${fmtTime(centre.operatingHours?.closingTime)}`, icon: Clock3 },
                { label: "Direct Phone", val: centre.contactNumber || "--", icon: Phone },
                { label: "Centre Mail", val: centre.email || "--", icon: Mail },
                { label: "Live Officer", val: officer?.name || "Assigned Officer", icon: Users },
              ].map((d) => (
                <div key={d.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-800/40">
                  <div className="flex items-center gap-1 text-[7px] font-bold uppercase text-slate-400 mb-0.5">
                    <d.icon className="h-2.5 w-2.5 text-emerald-500" /> {d.label}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{d.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Utilisation Gauge */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-slate-800 dark:text-slate-200">Daily Intake Gauge</span>
              <span className="text-slate-400 text-[10px]">{fmtNum(usedCap)} / {fmtNum(dailyCap)} Units</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${capPct >= 100 ? "bg-rose-500" : capPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${capPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[8px] text-slate-400 font-bold">
              <span>0% Empty</span>
              <span className="text-slate-700 dark:text-slate-300 font-black">{capPct}% Intake Completed</span>
              <span>100% Full</span>
            </div>
          </div>
        </section>

        {/* Operational State Controls (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-slate-900 dark:text-white">
              <Power className="h-4 w-4 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider">Operational Mode</h2>
            </div>
            <p className="text-[9px] text-slate-400 mb-3">Adjust live procurement status visible across booking queues.</p>

            <div className="space-y-2">
              {/* Activate */}
              <button
                disabled={actionLoading || statusKey === "ACTIVE"}
                onClick={() => updateStatus("ACTIVE")}
                className="w-full flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 transition hover:bg-emerald-500/10 disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500 p-1.5 text-white"><Power className="h-3.5 w-3.5" /></div>
                  <div className="text-left"><p className="text-[10px] font-black">Open Centre</p><p className="text-[8px] text-slate-400">Regular intake active</p></div>
                </div>
                {statusKey === "ACTIVE" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </button>

              {/* Temp Close */}
              <button
                disabled={Boolean(actionLoading)}
                onClick={() => setShowCloseModal(true)}
                className="w-full flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 transition hover:bg-amber-500/10 disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-500 p-1.5 text-white"><AlertTriangle className="h-3.5 w-3.5" /></div>
                  <div className="text-left"><p className="text-[10px] font-black">Temporary Pause</p><p className="text-[8px] text-slate-400">Halt for rain, safety, etc.</p></div>
                </div>
                {statusKey === "TEMPORARILY_CLOSED" && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
              </button>

              {/* Inactive */}
              <button
                disabled={Boolean(actionLoading) || statusKey === "INACTIVE"}
                onClick={() => updateStatus("INACTIVE")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-slate-600 p-1.5 text-white"><XCircle className="h-3.5 w-3.5" /></div>
                  <div className="text-left"><p className="text-[10px] font-black">Close Centre</p><p className="text-[8px] text-slate-400">Shut gate operations</p></div>
                </div>
                {statusKey === "INACTIVE" && <CheckCircle2 className="h-4 w-4 text-slate-500" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-[8px] text-slate-400 dark:bg-slate-800/50">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>State toggles sync instantaneously with the farmer dispatch matrix.</span>
          </div>
        </section>
      </div>

      {/* Modal: Temporary Closure Reason */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white">Temporary Close</span>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
            </div>
            <p className="mt-2 text-[9px] text-slate-400">State a reason visible to dispatch operators and queued farmers.</p>
            <textarea
              rows={3}
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="e.g. Inclement weather, moisture meter recalibration..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950"
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setShowCloseModal(false)} className="flex-1 rounded-xl border py-1.5 text-[9px] font-bold">Cancel</button>
              <button
                disabled={!closeReason.trim() || actionLoading === "TEMPORARILY_CLOSED"}
                onClick={() => updateStatus("TEMPORARILY_CLOSED", closeReason.trim())}
                className="flex-1 rounded-xl bg-amber-500 py-1.5 text-[9px] font-bold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {actionLoading === "TEMPORARILY_CLOSED" ? "Pausing..." : "Confirm Pause"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}