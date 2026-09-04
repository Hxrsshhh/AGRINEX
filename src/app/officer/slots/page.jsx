"use client";

import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import {
  CalendarDays, Clock3, Plus, RefreshCw, Search, Package, Users,
  CheckCircle2, ChevronLeft, ChevronRight, Edit3, Eye, Loader2,
  BarChart3, X, AlertCircle, Trash2, RotateCcw, Ban
} from "lucide-react";

/* =========================================================
   HELPERS & CONFIG
========================================================= */

const fetcher = async (url) => {
  const res = await fetch(url, { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || data?.error || `Request failed with status ${res.status}`);
  }
  return data;
};

const toDateStr = (d = new Date()) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const fmtNum = (n) => new Intl.NumberFormat("en-IN").format(Number(n || 0));

const fmtTime = (t) => {
  if (!t) return "--";
  const [h, m] = String(t).split(":");
  if (isNaN(Number(h))) return t;
  const hr = Number(h);
  return `${hr % 12 || 12}:${m || "00"} ${hr >= 12 ? "PM" : "AM"}`;
};

const STATUS_MAP = {
  AVAILABLE: { label: "OPEN", cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  FULL: { label: "FULL", cls: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  CLOSED: { label: "CLOSED", cls: "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300", dot: "bg-slate-500" },
  COMPLETED: { label: "COMPLETED", cls: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", dot: "bg-cyan-500" },
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function OfficerSlotsPage() {
  const today = toDateStr();
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  const [form, setForm] = useState({
    date: today,
    startTime: "09:00",
    endTime: "10:00",
    capacity: "20",
    commodityId: "",
  });

  const [bookingData, setBookingData] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [commodities, setCommodities] = useState([]);
  const [commodityLoading, setCommodityLoading] = useState(false);
  const [commodityError, setCommodityError] = useState("");

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/api/officer/slots?date=${encodeURIComponent(selectedDate)}`,
    fetcher,
    { refreshInterval: 5000, keepPreviousData: true, revalidateOnFocus: true }
  );

  const slots = Array.isArray(data?.data?.slots) ? data.data.slots : [];
  const centre = data?.data?.centre || null;
  const officer = data?.data?.officer || null;
  const stats = data?.data?.stats || {};

  useEffect(() => {
    let cancelled = false;
    const loadCommodities = async () => {
      try {
        setCommodityLoading(true);
        setCommodityError("");
        const res = await fetch("/api/officer/commodities", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Failed to load commodities (${res.status})`);
        }
        const list = Array.isArray(result?.data?.commodities)
          ? result.data.commodities
          : Array.isArray(result?.commodities)
          ? result.commodities
          : [];

        if (cancelled) return;
        setCommodities(list);

        if (list.length > 0) {
          setForm((prev) => ({
            ...prev,
            commodityId: list.some((c) => String(c._id) === String(prev.commodityId))
              ? prev.commodityId
              : String(list[0]._id),
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setCommodities([]);
          setCommodityError(err?.message || "Failed to load commodities");
        }
      } finally {
        if (!cancelled) setCommodityLoading(false);
      }
    };
    loadCommodities();
    return () => { cancelled = true; };
  }, []);

  const filteredSlots = useMemo(() => {
    const q = search.trim().toLowerCase();
    return slots.filter((slot) => {
      const matchSearch =
        !q ||
        [slot.commodity?.name, slot.commodity?.code, slot.startTime, slot.endTime].some((val) =>
          String(val || "").toLowerCase().includes(q)
        );
      const matchStatus = statusFilter === "ALL" || slot.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [slots, search, statusFilter]);

  const openFormModal = (type, slot = null) => {
    const firstCommodity = commodities.length > 0 ? String(commodities[0]._id) : "";
    const existingCommodity = slot?.commodity?._id || slot?.commodity?.id || slot?.commodityId || "";

    setActiveModal({ type, slot });
    setForm({
      date: slot?.date ? toDateStr(slot.date) : selectedDate,
      startTime: slot?.startTime || "09:00",
      endTime: slot?.endTime || "10:00",
      capacity: String(slot?.capacity || 20),
      commodityId: existingCommodity ? String(existingCommodity) : firstCommodity,
    });
  };

  const handleSaveSlot = async () => {
    if (!form.commodityId) return alert("Please select a commodity.");
    if (!form.date) return alert("Please select a date.");
    if (!form.startTime || !form.endTime) return alert("Please specify slot timings.");
    if (form.startTime >= form.endTime) return alert("End time must be after start time.");
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) return alert("Capacity must be at least 1.");
    if (!activeModal) return;

    const isCreate = activeModal.type === "create";
    setActionLoading("SAVE");

    try {
      const payload = {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        capacity,
        commodityId: form.commodityId,
      };

      if (!isCreate) {
        payload.slotId = activeModal.slot?.id || activeModal.slot?._id;
        payload.action = activeModal.type === "reschedule" ? "RESCHEDULE" : "UPDATE";
      }

      const res = await fetch("/api/officer/slots", {
        method: isCreate ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || "Operation failed");
      }

      setActiveModal(null);
      await mutate();
    } catch (err) {
      alert(err?.message || "Failed to save slot");
    } finally {
      setActionLoading("");
    }
  };

  const performAction = async (slot, action) => {
    const slotId = slot?.id || slot?._id;
    if (!slotId) return alert("Invalid slot ID.");

    if (action === "CLOSE" && !window.confirm(slot.bookedCount > 0 ? `This slot has ${slot.bookedCount} booking(s). Close it?` : "Close this slot?")) return;
    if (action === "DELETE") {
      if (Number(slot.bookedCount || 0) > 0) return alert("This slot has bookings and cannot be deleted.");
      if (!window.confirm("Permanently delete this slot? This action cannot be undone.")) return;
    }
    if (action === "FULL" && !window.confirm("Mark this slot as FULL?")) return;
    if (action === "UNFULL" && !window.confirm("Make this FULL slot available again?")) return;

    setActionLoading(`${action}-${slotId}`);
    try {
      const isDelete = action === "DELETE";
      const url = isDelete ? `/api/officer/slots?slotId=${encodeURIComponent(slotId)}` : "/api/officer/slots";
      const options = {
        method: isDelete ? "DELETE" : "PATCH",
        credentials: "include",
        headers: { ...(isDelete ? {} : { "Content-Type": "application/json" }), Accept: "application/json" },
        ...(isDelete ? {} : { body: JSON.stringify({ slotId, action }) }),
      };

      const res = await fetch(url, options);
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || `Failed to ${action.toLowerCase()} slot`);
      }
      await mutate();
    } catch (err) {
      alert(err?.message || `Failed to ${action.toLowerCase()} slot`);
    } finally {
      setActionLoading("");
    }
  };

  const viewBookings = async (slot) => {
    const slotId = slot?.id || slot?._id;
    if (!slotId) return alert("Invalid slot ID.");

    setActiveModal({ type: "bookings", slot });
    setBookingData(null);
    setBookingLoading(true);

    try {
      const res = await fetch(`/api/officer/slots/bookings?slotId=${encodeURIComponent(slotId)}`, {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || "Failed to load bookings");
      }
      setBookingData(result?.data || { bookings: result?.bookings || [] });
    } catch (err) {
      alert(err?.message || "Failed to load bookings");
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

  const closeModal = () => {
    setActiveModal(null);
    setBookingData(null);
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-xs font-bold text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        Loading Operational Slots...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50/60 p-3 text-slate-900 select-none dark:bg-[#070c12] dark:text-slate-100 sm:p-5">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-3 overflow-hidden">
        
        {/* HEADER */}
        <header className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Clock3 className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Centre Operations</span>
            </div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">Slot Management</h1>
            <p className="text-[10px] font-bold text-slate-400">
              {centre?.name || "Assigned Centre"} • {officer?.name || "Officer"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => mutate()}
              disabled={isValidating}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
            >
              <RefreshCw className={`h-3 w-3 ${isValidating ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => openFormModal("create")}
              disabled={commodityLoading || commodities.length === 0}
              className="flex h-7 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-[9px] font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              {commodityLoading ? "Loading..." : "Create Slot"}
            </button>
          </div>
        </header>

        {commodityError && (
          <div className="flex shrink-0 items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{commodityError}</span>
            </div>
            <button onClick={() => window.location.reload()} className="rounded bg-amber-500 px-2 py-0.5 text-[8px] font-black text-white">Retry</button>
          </div>
        )}

        {/* DATE CONTROL & STATS BAR */}
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#0e1620]">
            <div className="flex items-center gap-1">
              <button onClick={() => shiftDate(-1)} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-emerald-500 dark:border-slate-700">
                <ChevronLeft size={12} />
              </button>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </span>
              <button onClick={() => shiftDate(1)} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-emerald-500 dark:border-slate-700">
                <ChevronRight size={12} />
              </button>
            </div>
            <button onClick={() => setSelectedDate(today)} className="rounded bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
              Today
            </button>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-[#0e1620]">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase text-slate-400">
              <span>Total Slots</span>
              <Clock3 size={12} className="text-cyan-500" />
            </div>
            <p className="mt-0.5 text-sm font-black">{fmtNum(stats.totalSlots ?? slots.length)}</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-[#0e1620]">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase text-slate-400">
              <span>Open Slots</span>
              <CheckCircle2 size={12} className="text-emerald-500" />
            </div>
            <p className="mt-0.5 text-sm font-black">{fmtNum(stats.availableSlots || 0)}</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-[#0e1620]">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase text-slate-400">
              <span>Allocated</span>
              <Users size={12} className="text-violet-500" />
            </div>
            <p className="mt-0.5 text-sm font-black">{fmtNum(stats.bookedCount || 0)}</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-[#0e1620]">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase text-slate-400">
              <span>Capacity Left</span>
              <BarChart3 size={12} className="text-amber-500" />
            </div>
            <p className="mt-0.5 text-sm font-black">{fmtNum(stats.availableCapacity || 0)}</p>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#0e1620] sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commodity or slot timing..."
              className="h-7 w-full rounded-lg bg-slate-50 pl-7 pr-3 text-[9px] font-bold outline-none dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {["ALL", "AVAILABLE", "FULL", "CLOSED"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`rounded-lg px-2 py-1 text-[8px] font-bold uppercase transition ${
                  statusFilter === filter ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}
              >
                {filter === "ALL" ? "All" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* INTERNAL SCROLLABLE LIST WRAPPER */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0e1620]">
          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredSlots.map((slot) => {
              const status = STATUS_MAP[slot.status] || STATUS_MAP.CLOSED;
              const booked = Number(slot.bookedCount || 0);
              const capacity = Number(slot.capacity || 1);
              const utilization = capacity > 0 ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
              const free = Math.max(0, capacity - booked);
              const slotId = slot.id || slot._id;
              const loading = actionLoading;

              return (
                <div key={String(slotId)} className="flex flex-col justify-between gap-3 p-3 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30 sm:flex-row sm:items-center">
                  
                  {/* Timing & Commodity */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                      <Clock3 size={11} />
                      <span className="text-[6px] uppercase font-black">Slot</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white">
                          {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.2 text-[7px] font-black uppercase ${status.cls}`}>
                          <span className={`h-1 w-1 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                        <Package size={10} className="text-emerald-500" />
                        <span className="truncate">{slot.commodity?.name || "Commodity"}</span>
                        {slot.commodity?.code && (
                          <span className="rounded bg-slate-100 px-1 py-0.2 text-[7px] dark:bg-slate-800">{slot.commodity.code}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="w-full text-[8px] sm:max-w-xs">
                    <div className="mb-0.5 flex justify-between font-bold">
                      <span className="text-slate-400">{fmtNum(booked)} / {fmtNum(capacity)} booked</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{fmtNum(free)} free</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${utilization >= 100 ? "bg-rose-500" : utilization >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => viewBookings(slot)}
                      disabled={Boolean(loading)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-[8px] font-bold text-slate-600 hover:border-cyan-500 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Eye size={10} className="mr-1 inline" /> Bookings
                    </button>

                    {["AVAILABLE", "FULL"].includes(slot.status) && (
                      <>
                        <button
                          onClick={() => openFormModal("edit", slot)}
                          disabled={Boolean(loading)}
                          className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:border-emerald-500 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                        >
                          <Edit3 size={10} />
                        </button>
                        <button
                          onClick={() => openFormModal("reschedule", slot)}
                          disabled={Boolean(loading)}
                          className="rounded-lg border border-slate-200 p-1 text-amber-600 hover:border-amber-500 disabled:opacity-50 dark:border-slate-700"
                        >
                          <CalendarDays size={10} />
                        </button>
                      </>
                    )}

                    {slot.status === "AVAILABLE" && (
                      <>
                        <button
                          onClick={() => performAction(slot, "FULL")}
                          disabled={Boolean(loading)}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/5 px-2 py-1 text-[8px] font-bold text-rose-600 hover:bg-rose-500 hover:text-white disabled:opacity-50"
                        >
                          {loading === `FULL-${slotId}` ? <Loader2 size={10} className="animate-spin" /> : <Ban size={10} />}
                          Full
                        </button>
                        <button
                          onClick={() => performAction(slot, "CLOSE")}
                          disabled={Boolean(loading)}
                          className="flex items-center gap-1 rounded-lg bg-slate-700 px-2 py-1 text-[8px] font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {loading === `CLOSE-${slotId}` ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                          Close
                        </button>
                      </>
                    )}

                    {slot.status === "FULL" && (
                      <>
                        <button
                          onClick={() => performAction(slot, "UNFULL")}
                          disabled={Boolean(loading)}
                          className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[8px] font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                        >
                          {loading === `UNFULL-${slotId}` ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                          Unfull
                        </button>
                        <button
                          onClick={() => performAction(slot, "CLOSE")}
                          disabled={Boolean(loading)}
                          className="flex items-center gap-1 rounded-lg bg-slate-700 px-2 py-1 text-[8px] font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {loading === `CLOSE-${slotId}` ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                          Close
                        </button>
                      </>
                    )}

                    {slot.status === "CLOSED" && (
                      <button
                        onClick={() => performAction(slot, "OPEN")}
                        disabled={Boolean(loading)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[8px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {loading === `OPEN-${slotId}` ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
                        Open
                      </button>
                    )}

                    <button
                      onClick={() => performAction(slot, "DELETE")}
                      disabled={Boolean(loading) || booked > 0}
                      className="flex items-center gap-1 rounded-lg border border-rose-500/20 p-1 text-rose-600 hover:bg-rose-500 hover:text-white disabled:opacity-30"
                    >
                      {loading === `DELETE-${slotId}` ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredSlots.length === 0 && (
              <div className="flex h-40 flex-col items-center justify-center text-[9px] text-slate-400">
                <Clock3 size={20} className="mb-1 opacity-50" />
                No slots found for this date.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT / RESCHEDULE MODAL */}
      {["create", "edit", "reschedule"].includes(activeModal?.type) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <span className="text-xs font-black capitalize text-slate-900 dark:text-white">{activeModal.type} Slot</span>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={13} /></button>
            </div>

            <div className="space-y-2 text-[9px]">
              <label className="block">
                <span className="text-[7px] font-bold uppercase text-slate-400">Commodity</span>
                <select
                  value={form.commodityId}
                  onChange={(e) => setForm((p) => ({ ...p, commodityId: e.target.value }))}
                  disabled={commodityLoading || commodities.length === 0}
                  className="mt-0.5 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">{commodities.length === 0 ? "No active commodities" : "Select commodity"}</option>
                  {commodities.map((c) => (
                    <option key={String(c._id)} value={String(c._id)}>{c.name} {c.code ? `(${c.code})` : ""}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[7px] font-bold uppercase text-slate-400">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="mt-0.5 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[7px] font-bold uppercase text-slate-400">Start Time</span>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                    className="mt-0.5 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-[7px] font-bold uppercase text-slate-400">End Time</span>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                    className="mt-0.5 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[7px] font-bold uppercase text-slate-400">
                  Capacity {activeModal.slot?.bookedCount ? `(Min ${activeModal.slot.bookedCount})` : ""}
                </span>
                <input
                  type="number"
                  min={activeModal.slot?.bookedCount || 1}
                  value={form.capacity}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                  className="mt-0.5 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={closeModal} className="flex-1 rounded-lg border border-slate-200 py-1.5 text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Cancel
              </button>
              <button
                onClick={handleSaveSlot}
                disabled={Boolean(actionLoading) || commodities.length === 0}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-[8px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading === "SAVE" ? <Loader2 size={10} className="animate-spin" /> : "Save Slot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS MODAL */}
      {activeModal?.type === "bookings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">Slot Bookings</h3>
                <p className="text-[8px] text-slate-400">
                  {fmtTime(activeModal.slot?.startTime)} – {fmtTime(activeModal.slot?.endTime)} • {activeModal.slot?.commodity?.name}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={13} /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              {bookingLoading ? (
                <div className="flex h-32 items-center justify-center text-slate-400">
                  <Loader2 className="animate-spin" size={16} />
                </div>
              ) : !bookingData?.bookings?.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <Package size={20} className="mb-1 opacity-50" />
                  <p className="text-[9px] font-bold">No bookings for this slot</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-[9px] dark:divide-slate-800">
                  {bookingData.bookings.map((b) => (
                    <div key={b.id || b._id || b.bookingId} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{b.farmer?.name || "Unknown Farmer"}</p>
                        <span className="text-[7px] text-slate-400">{b.bookingId || "Booking"} • {b.farmer?.mobile || "--"}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-800 dark:text-slate-200">{b.expectedQuantity ?? 0} Qtl</span>
                        <span className="block text-[7px] font-bold uppercase text-emerald-600">{b.status}</span>
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