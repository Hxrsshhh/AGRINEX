"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  CalendarDays, Clock3, Plus, RefreshCw, Search, Package, Users,
  CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  Edit3, Ban, Eye, Loader2, BarChart3, Power, Save, X
} from "lucide-react";

const fetcher = (url) => fetch(url, { credentials: "include", cache: "no-store" }).then((r) => r.json());
const toDateStr = (d = new Date()) => new Date(d).toISOString().split("T")[0];
const fmtNum = (n) => new Intl.NumberFormat("en-IN").format(Number(n || 0));

const fmtTime = (t) => {
  if (!t) return "--";
  const [h, m] = String(t).split(":");
  if (isNaN(h)) return t;
  const hr = Number(h);
  return `${hr % 12 || 12}:${m || "00"} ${hr >= 12 ? "PM" : "AM"}`;
};

const STATUS_MAP = {
  AVAILABLE: { label: "OPEN", cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  FULL: { label: "FULL", cls: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  CLOSED: { label: "CLOSED", cls: "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300", dot: "bg-slate-500" },
  COMPLETED: { label: "COMPLETED", cls: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", dot: "bg-cyan-500" },
};

export default function OfficerSlotsPage() {
  const [selectedDate, setSelectedDate] = useState(toDateStr());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState("");

  // Modals: null | { type: 'create' | 'edit' | 'reschedule' | 'bookings', slot?: Object }
  const [activeModal, setActiveModal] = useState(null);
  const [form, setForm] = useState({ date: toDateStr(), startTime: "09:00", endTime: "10:00", capacity: "20", commodityId: "" });
  const [bookingData, setBookingData] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data, error, isLoading, isValidating, mutate } = useSWR(`/api/officer/slots?date=${selectedDate}`, fetcher, {
    refreshInterval: 3000,
    keepPreviousData: true,
  });

  const slots = data?.data?.slots || [];
  const centre = data?.data?.centre || null;
  const officer = data?.data?.officer || null;
  const commodities = data?.data?.commodities || [];
  const stats = data?.data?.stats || {};

  const filteredSlots = useMemo(() => {
    const q = search.trim().toLowerCase();
    return slots.filter((s) => {
      const matchQ = !q || [s.commodity?.name, s.commodity?.code, s.startTime, s.endTime].some((v) => String(v || "").toLowerCase().includes(q));
      const matchSt = statusFilter === "ALL" || s.status === statusFilter;
      return matchQ && matchSt;
    });
  }, [slots, search, statusFilter]);

  const openFormModal = (type, slot = null) => {
    setActiveModal({ type, slot });
    setForm({
      date: slot?.date ? toDateStr(slot.date) : selectedDate,
      startTime: slot?.startTime || "09:00",
      endTime: slot?.endTime || "10:00",
      capacity: String(slot?.capacity || 20),
      commodityId: slot?.commodity?._id || slot?.commodity?.id || commodities[0]?._id || "",
    });
  };

  const handleSaveSlot = async () => {
    if (!form.commodityId || !form.startTime || !form.endTime || Number(form.capacity) < 1) {
      return alert("Please fill all valid slot parameters.");
    }
    const isCreate = activeModal.type === "create";
    setActionLoading("SAVE");
    try {
      const res = await fetch("/api/officer/slots", {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(isCreate ? {} : { slotId: activeModal.slot.id, action: activeModal.type === "reschedule" ? "RESCHEDULE" : "UPDATE" }),
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: Number(form.capacity),
          commodityId: form.commodityId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Operation failed");
      setActiveModal(null);
      await mutate();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const performAction = async (slot, action) => {
    if (action === "CLOSE" && slot.bookedCount > 0 && !confirm(`This slot has ${slot.bookedCount} booking(s). Close anyway?`)) return;
    if (action === "CANCEL" && !confirm("Deactivate and cancel this slot?")) return;
    setActionLoading(`${action}-${slot.id}`);
    try {
      const res = await fetch("/api/officer/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slotId: slot.id, action }),
      });
      if (!res.ok) throw new Error((await res.json())?.message || "Update failed");
      await mutate();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const viewBookings = async (slot) => {
    setActiveModal({ type: "bookings", slot });
    setBookingLoading(true);
    try {
      const res = await fetch(`/api/officer/slots/bookings?slotId=${slot.id}`, { credentials: "include", cache: "no-store" });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to load bookings");
      setBookingData(result?.data || null);
    } catch (err) {
      alert(err.message);
      setActiveModal(null);
    } finally {
      setBookingLoading(false);
    }
  };

  const shiftDate = (days) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + days);
    setSelectedDate(toDateStr(d));
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-slate-400 text-xs font-bold">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-500" /> Loading Operational Slots...
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-4 p-3 sm:p-5 select-none">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Clock3 className="h-4 w-4" />
            <span className="text-[9px] font-black uppercase tracking-wider">Centre Operations</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">Slot Management</h1>
          <p className="text-[10px] text-slate-400 font-bold">{centre?.name || "Assigned Centre"} • {officer?.name || "Officer"}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => openFormModal("create")}
            className="flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-[9px] font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Create Slot
          </button>
        </div>
      </header>

      {/* Date Stepper Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button onClick={() => shiftDate(-1)} className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-500 dark:border-slate-700"><ChevronLeft size={13} /></button>
          <div className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-black text-slate-800 dark:text-white">
            <CalendarDays size={13} className="text-emerald-500" />
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <button onClick={() => shiftDate(1)} className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-500 dark:border-slate-700"><ChevronRight size={13} /></button>
          <button onClick={() => setSelectedDate(toDateStr())} className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Today</button>
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-7 rounded-lg border px-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900" />
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "Total Slots", val: stats.totalSlots || 0, sub: "Scheduled today", icon: Clock3, c: "text-cyan-500" },
          { label: "Open Slots", val: stats.availableSlots || 0, sub: "Intake ready", icon: CheckCircle2, c: "text-emerald-500" },
          { label: "Booked", val: stats.bookedCount || 0, sub: "Farmers allocated", icon: Users, c: "text-violet-500" },
          { label: "Remaining", val: stats.availableCapacity || 0, sub: "Available capacity", icon: BarChart3, c: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
              <s.icon size={13} className={s.c} />
            </div>
            <p className="mt-1 text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">{fmtNum(s.val)}</p>
            <p className="mt-0.5 text-[8px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commodity or slot timing..."
            className="h-8 w-full rounded-lg bg-slate-50 pl-7 pr-3 text-[9px] font-bold outline-none dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {["ALL", "AVAILABLE", "FULL", "CLOSED"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-[8px] font-bold uppercase transition shrink-0 ${
                statusFilter === f ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {f === "ALL" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Slots List Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredSlots.map((s) => {
            const st = STATUS_MAP[s.status] || STATUS_MAP.CLOSED;
            const booked = Number(s.bookedCount || 0);
            const cap = Number(s.capacity || 1);
            const util = Math.min(100, Math.round((booked / cap) * 100));
            const free = Math.max(0, cap - booked);

            return (
              <div key={s.id} className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3 sm:p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                    <Clock3 size={12} />
                    <span className="text-[7px] uppercase">Slot</span>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                      </h3>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[7px] font-black uppercase ${st.cls}`}>
                        <span className={`h-1 w-1 rounded-full ${st.dot}`} /> {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold mt-0.5">
                      <Package size={11} className="text-emerald-500" />
                      <span>{s.commodity?.name || "Commodity"}</span>
                      {s.commodity?.code && <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.2 text-[8px]">{s.commodity.code}</span>}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full xl:max-w-xs text-[8px]">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-400">{fmtNum(booked)} / {fmtNum(cap)} booked</span>
                    <span className="text-emerald-600 font-black">{free} free</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${util >= 100 ? "bg-rose-500" : util >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${util}%` }} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button onClick={() => viewBookings(s)} className="rounded-lg border px-2.5 py-1 text-[8px] font-bold text-slate-600 hover:border-cyan-500 dark:border-slate-700 dark:text-slate-300">
                    <Eye size={10} className="inline mr-1" /> Bookings
                  </button>
                  {["AVAILABLE", "FULL"].includes(s.status) && (
                    <>
                      <button onClick={() => openFormModal("edit", s)} className="rounded-lg border px-2 py-1 text-[8px] font-bold text-slate-600 hover:border-emerald-500 dark:border-slate-700 dark:text-slate-300"><Edit3 size={10} /></button>
                      <button onClick={() => openFormModal("reschedule", s)} className="rounded-lg border px-2 py-1 text-[8px] font-bold text-amber-600 hover:border-amber-500 dark:border-slate-700"><CalendarDays size={10} /></button>
                    </>
                  )}
                  {s.status === "CLOSED" && (
                    <button onClick={() => performAction(s, "OPEN")} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[8px] font-bold text-white">Open</button>
                  )}
                  {s.status === "AVAILABLE" && (
                    <button onClick={() => performAction(s, "CLOSE")} className="rounded-lg bg-slate-700 px-2.5 py-1 text-[8px] font-bold text-white">Close</button>
                  )}
                  {s.status === "AVAILABLE" && booked < cap && (
                    <button onClick={() => performAction(s, "MARK_FULL")} className="rounded-lg border border-rose-500/20 text-rose-600 px-2 py-1 text-[8px] font-bold">Full</button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredSlots.length === 0 && (
            <div className="flex h-44 flex-col items-center justify-center text-slate-400 text-[9px]">
              <Clock3 size={22} className="mb-1 opacity-50" /> No slots found for this selection
            </div>
          )}
        </div>
      </div>

      {/* Unified Create / Edit / Reschedule Modal */}
      {["create", "edit", "reschedule"].includes(activeModal?.type) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black capitalize">{activeModal.type} Slot</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
            </div>

            <div className="space-y-2 text-[9px]">
              <label className="block">
                <span className="text-[7px] uppercase font-bold text-slate-400">Commodity</span>
                <select value={form.commodityId} onChange={(e) => setForm({ ...form, commodityId: e.target.value })} className="mt-0.5 h-8 w-full rounded-lg border px-2 font-bold dark:border-slate-700 dark:bg-slate-800">
                  {commodities.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[7px] uppercase font-bold text-slate-400">Date</span>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-0.5 h-8 w-full rounded-lg border px-2 font-bold dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[7px] uppercase font-bold text-slate-400">Start Time</span>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="mt-0.5 h-8 w-full rounded-lg border px-2 font-bold dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label className="block">
                  <span className="text-[7px] uppercase font-bold text-slate-400">End Time</span>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="mt-0.5 h-8 w-full rounded-lg border px-2 font-bold dark:border-slate-700 dark:bg-slate-800" />
                </label>
              </div>
              <label className="block">
                <span className="text-[7px] uppercase font-bold text-slate-400">Capacity (Min {activeModal.slot?.bookedCount || 1})</span>
                <input type="number" min={activeModal.slot?.bookedCount || 1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="mt-0.5 h-8 w-full rounded-lg border px-2 font-bold dark:border-slate-700 dark:bg-slate-800" />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="flex-1 rounded-lg border py-1.5 text-[8px] font-bold">Cancel</button>
              <button onClick={handleSaveSlot} disabled={Boolean(actionLoading)} className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[8px] font-bold text-white hover:bg-emerald-700">
                {actionLoading ? "Saving..." : "Save Slot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {activeModal?.type === "bookings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[85vh] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-black">Slot Bookings</h3>
                <p className="text-[8px] text-slate-400">{fmtTime(activeModal.slot?.startTime)} – {fmtTime(activeModal.slot?.endTime)}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {bookingLoading ? (
                <div className="flex h-36 items-center justify-center text-slate-400"><Loader2 className="animate-spin" size={16} /></div>
              ) : !bookingData?.bookings?.length ? (
                <p className="text-center text-slate-400 text-[9px] py-10">No bookings for this slot</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[9px]">
                  {bookingData.bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{b.farmer?.name}</p>
                        <span className="text-[7px] text-slate-400">{b.bookingId} • {b.farmer?.mobile}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-800 dark:text-slate-200">{b.expectedQuantity} Qtl</span>
                        <span className="block text-[7px] text-emerald-600 uppercase font-bold">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}