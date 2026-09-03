"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ArrowRight, BadgeCheck, Calendar, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock, History, Loader2, MapPin, Phone,
  RefreshCw, Search, ShieldCheck, Smartphone, User, UserCheck, Users,
  Wheat, X, XCircle, PackageCheck, Ban, ScanLine, RotateCcw,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

const fetcher = (url) => fetch(url, { cache: "no-store", credentials: "include" }).then((res) => res.json());

const toDateStr = (v = new Date()) => new Date(v).toISOString().split("T")[0];
const fmtDate = (v) => (!v ? "--" : new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
const fmtTime = (v) => (!v ? "--" : /^\d{1,2}:\d{2}/.test(v) ? v : new Date(v).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));

const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400", dot: "bg-amber-500" },
  CONFIRMED: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  CHECKED_IN: { label: "Checked In", cls: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400", dot: "bg-cyan-500" },
  COMPLETED: { label: "Completed", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400", dot: "bg-blue-500" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400", dot: "bg-red-500" },
  EXPIRED: { label: "Expired", cls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400", dot: "bg-slate-400" },
};

function StatusBadge({ status }) {
  const c = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-black ${c.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function ModalShell({ title, subtitle, onClose, children, maxW = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className={`w-full ${maxW} max-h-[90dvh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 flex flex-col`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-[8px] text-slate-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={14} /></button>
        </div>
        <div className="overflow-y-auto p-4 flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function OfficerBookingsPage() {
  const router = useRouter();
  const today = toDateStr();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [centreFilter, setCentreFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("TODAY");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modal, setModal] = useState(null); // 'scanner' | 'history' | 'rebook' | { type: 'cancel' | 'no-show', action: string }
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState("");

  const apiUrl = dateFilter === "ALL" ? "/api/officer/bookings" : `/api/officer/bookings?date=${today}`;
  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, { refreshInterval: 5000, keepPreviousData: true });
  const bookings = data?.bookings || [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bookings.filter((b) => {
      const matchSearch = !q || [b.farmer?.name, b.farmer?._id, b.farmer?.mobile, b.bookingId, b.queue?.tokenNumber].some((v) => String(v || "").toLowerCase().includes(q));
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchCentre = centreFilter === "ALL" || b.centre?.name === centreFilter;
      const matchDate = dateFilter === "ALL" || toDateStr(b.date) === today;
      return matchSearch && matchStatus && matchCentre && matchDate;
    });
  }, [bookings, search, statusFilter, centreFilter, dateFilter, today]);

  const centres = useMemo(() => [...new Set(bookings.map((b) => b.centre?.name).filter(Boolean))], [bookings]);

  const updateBooking = async (b, action, extra = {}) => {
    if (!b) return;
    setLoading(true);
    try {
      const res = await fetch("/api/officer/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: b.bookingId, action, ...extra }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Action failed");
      setLastAction(`${action} updated for ${b.farmer?.name || "farmer"}`);
      setModal(null);
      await mutate();
      setSelectedBooking(result.booking || bookings.find((x) => x.bookingId === b.bookingId) || null);
    } catch (err) {
      setLastAction(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQr = async (text) => {
    try {
      const id = JSON.parse(text)?.bookingId || text.trim();
      const match = bookings.find((b) => b.bookingId?.toLowerCase() === id.toLowerCase());
      if (match) {
        setSelectedBooking(match);
        setModal(null);
        setLastAction(`QR identified: ${id}`);
        return;
      }
      const res = await fetch(`/api/officer/bookings?search=${encodeURIComponent(id)}`, { credentials: "include" });
      const d = await res.json();
      const b = d?.bookings?.find((x) => x.bookingId?.toLowerCase() === id.toLowerCase());
      if (!b) throw new Error("Booking not found at your centre");
      setSelectedBooking(b);
      setModal(null);
    } catch (err) {
      setLastAction(err.message);
    }
  };

  return (
    <main className="h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 select-none p-3 sm:p-4 lg:p-5 flex flex-col">
      {/* Header */}
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">Officer Desk</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Procurement Bookings</h1>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setModal("scanner")} className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-[8px] font-black text-white hover:bg-emerald-700">
            <ScanLine size={12} /> Scan QR
          </button>
          <button onClick={() => mutate()} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-500">
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {lastAction && (
        <div className="mb-2.5 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-[8px] font-bold text-emerald-600">
          <div className="flex items-center gap-1.5"><CheckCircle2 size={12} /> {lastAction}</div>
          <X size={12} className="cursor-pointer" onClick={() => setLastAction("")} />
        </div>
      )}

      {/* Stats Counter Strip */}
      <div className="mb-3 grid grid-cols-3 sm:grid-cols-6 gap-2 shrink-0">
        {[
          { label: "Pending", count: bookings.filter((b) => b.status === "PENDING").length, icon: Clock, c: "text-amber-500" },
          { label: "Confirmed", count: bookings.filter((b) => b.status === "CONFIRMED").length, icon: CheckCircle2, c: "text-emerald-500" },
          { label: "Waiting", count: bookings.filter((b) => b.status === "CHECKED_IN" && b.queue?.status === "WAITING").length, icon: Users, c: "text-cyan-500" },
          { label: "Processing", count: bookings.filter((b) => b.queue?.status === "PROCESSING").length, icon: Wheat, c: "text-violet-500" },
          { label: "Completed", count: bookings.filter((b) => b.status === "COMPLETED").length, icon: PackageCheck, c: "text-blue-500" },
          { label: "Cancelled", count: bookings.filter((b) => b.status === "CANCELLED").length, icon: Ban, c: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200/80 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[7px] font-bold uppercase">{s.label}</span>
              <s.icon size={11} className={s.c} />
            </div>
            <p className="mt-0.5 text-base font-black text-slate-900 dark:text-white leading-none">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="mb-3 flex flex-col sm:flex-row gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking ID, farmer, mobile or token..."
            className="h-8 w-full rounded-lg bg-slate-50 pl-7 pr-3 text-[9px] font-bold outline-none dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="flex gap-1.5">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800">
            <option value="TODAY">Today</option>
            <option value="ALL">All Dates</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800">
            <option value="ALL">All Status</option>
            {Object.keys(STATUS_MAP).map((k) => <option key={k} value={k}>{STATUS_MAP[k].label}</option>)}
          </select>
          <select value={centreFilter} onChange={(e) => setCentreFilter(e.target.value)} className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800">
            <option value="ALL">All Centres</option>
            {centres.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Booking Records Feed */}
      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col">
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.map((b) => (
            <div
              key={b._id || b.bookingId}
              onClick={() => setSelectedBooking(b)}
              className="flex cursor-pointer items-center justify-between p-3 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                  {b.farmer?.name?.[0] || "F"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[10px] font-black text-slate-900 dark:text-white">{b.farmer?.name || "Unknown"}</p>
                    <span className="text-[7px] text-emerald-600 font-bold">{b.bookingId}</span>
                  </div>
                  <p className="text-[8px] text-slate-400 truncate mt-0.5">
                    {fmtDate(b.date)} • {fmtTime(b.slot?.startTime || b.startTime)} • {b.commodity?.name || "Produce"} ({b.expectedQuantity ?? "--"} Qtl)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={b.status} />
                <ChevronRight size={13} className="text-slate-300" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400 text-[9px]">
              <Calendar size={20} className="mb-1 opacity-50" /> No records found
            </div>
          )}
        </div>
      </div>

      {/* Drawer: Detailed Booking Sheet */}
      {selectedBooking && (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl border-l border-slate-200 dark:bg-slate-950 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[7px] font-bold uppercase text-emerald-600">Booking Pass</span>
              <h2 className="text-xs font-black">{selectedBooking.bookingId}</h2>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setModal("history")} className="rounded-lg p-1.5 border border-slate-200 text-slate-500"><History size={12} /></button>
              <button onClick={() => setSelectedBooking(null)} className="rounded-lg p-1.5 border border-slate-200 text-slate-500"><X size={12} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3 text-[8px]">
            <div className="flex justify-between items-center rounded-xl bg-slate-50 dark:bg-slate-900 p-2.5">
              <div>
                <span className="text-slate-400 uppercase text-[7px] font-bold">State</span>
                <div><StatusBadge status={selectedBooking.status} /></div>
              </div>
              {selectedBooking.queue?.tokenNumber && (
                <div className="text-right">
                  <span className="text-slate-400 uppercase text-[7px] font-bold">Token</span>
                  <p className="text-sm font-black text-emerald-600">{selectedBooking.queue.tokenNumber}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 space-y-1">
              <span className="font-black text-slate-900 dark:text-white">Farmer Profile</span>
              <div className="flex justify-between text-slate-500"><span>Name</span><span className="font-bold text-slate-800 dark:text-slate-200">{selectedBooking.farmer?.name}</span></div>
              <div className="flex justify-between text-slate-500"><span>Mobile</span><span className="font-bold text-slate-800 dark:text-slate-200">{selectedBooking.farmer?.mobile || "--"}</span></div>
              <div className="flex justify-between text-slate-500"><span>Verified</span><span className="font-bold text-emerald-600">{selectedBooking.farmer?.verification?.isVerified ? "Yes" : "Pending"}</span></div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 space-y-1">
              <span className="font-black text-slate-900 dark:text-white">Appointment Details</span>
              <div className="flex justify-between text-slate-500"><span>Centre</span><span className="font-bold text-slate-800 dark:text-slate-200">{selectedBooking.centre?.name}</span></div>
              <div className="flex justify-between text-slate-500"><span>Date / Slot</span><span className="font-bold text-slate-800 dark:text-slate-200">{fmtDate(selectedBooking.date)} ({fmtTime(selectedBooking.slot?.startTime)})</span></div>
              <div className="flex justify-between text-slate-500"><span>Produce</span><span className="font-bold text-slate-800 dark:text-slate-200">{selectedBooking.commodity?.name} ({selectedBooking.expectedQuantity} Qtl)</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {selectedBooking.status === "PENDING" && (
              <button onClick={() => updateBooking(selectedBooking, "CONFIRM")} className="col-span-2 h-8 rounded-lg bg-emerald-600 text-white font-black text-[8px]">Confirm Booking</button>
            )}
            {selectedBooking.status === "CONFIRMED" && (
              <button onClick={() => updateBooking(selectedBooking, "ARRIVE")} className="col-span-2 h-8 rounded-lg bg-emerald-600 text-white font-black text-[8px]">Check In Farmer</button>
            )}
            {selectedBooking.status === "CHECKED_IN" && (
              <button onClick={() => router.push(`/procurement?bookingId=${selectedBooking.bookingId}`)} className="col-span-2 h-8 rounded-lg bg-emerald-600 text-white font-black text-[8px]">Start Procurement</button>
            )}
            <button onClick={() => setModal("rebook")} className="h-8 rounded-lg border border-slate-200 font-bold text-[8px]">Rebook</button>
            <button onClick={() => setModal({ type: "cancel", action: "CANCEL" })} className="h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 font-bold text-[8px]">Cancel</button>
          </div>
        </aside>
      )}

      {/* QR Scanner Modal */}
      {modal === "scanner" && (
        <ModalShell title="Scan Gate Pass QR" onClose={() => setModal(null)}>
          <div id="qr-reader" className="min-h-[260px] bg-black rounded-xl overflow-hidden" />
          <ScannerHandler onResult={handleQr} />
        </ModalShell>
      )}

      {/* History Timeline Modal */}
      {modal === "history" && selectedBooking && (
        <ModalShell title="Booking Log" subtitle={selectedBooking.bookingId} onClose={() => setModal(null)}>
          <div className="space-y-3 text-[8px] pl-2 border-l border-dashed border-emerald-500">
            <div><p className="font-black">Created</p><span className="text-slate-400">{fmtDate(selectedBooking.createdAt)}</span></div>
            <div><p className="font-black">Status Update</p><span className="text-slate-400">{selectedBooking.status}</span></div>
          </div>
        </ModalShell>
      )}

      {/* Unified Cancellation / No-Show Modal */}
      {modal?.type === "cancel" && (
        <ModalShell title="Cancel Appointment" subtitle="Provide a mandatory reason" onClose={() => setModal(null)}>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Type reason..."
            className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none dark:bg-slate-900"
          />
          <button
            disabled={!reason.trim() || loading}
            onClick={() => updateBooking(selectedBooking, modal.action, { cancellationReason: reason })}
            className="mt-2 w-full rounded-lg bg-red-600 py-1.5 text-[9px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirm Cancellation
          </button>
        </ModalShell>
      )}

      {/* Rebook Modal */}
      {modal === "rebook" && selectedBooking && (
        <ModalShell title="Rebook Farmer" onClose={() => setModal(null)}>
          <RebookContent
            booking={selectedBooking}
            onSuccess={(b) => { setModal(null); mutate(); if (b) setSelectedBooking(b); }}
          />
        </ModalShell>
      )}
    </main>
  );
}

function ScannerHandler({ onResult }) {
  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, (txt) => { scanner.stop().catch(() => {}); onResult(txt); }, () => {});
    return () => { scanner.stop().catch(() => {}); };
  }, [onResult]);
  return null;
}

function RebookContent({ booking, onSuccess }) {
  const [date, setDate] = useState(toDateStr());
  const [slotId, setSlotId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/officer/slots?date=${date}`, { credentials: "include" })
      .then((res) => res.json())
      .then((res) => setSlots((res?.data?.slots || []).filter((s) => s.status === "AVAILABLE")))
      .catch(() => setSlots([]));
  }, [date]);

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/officer/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bookingId: booking.bookingId, action: "REBOOK", slotId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) onSuccess(data.booking);
  };

  return (
    <div className="space-y-2 text-[8px]">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border p-1.5 font-bold dark:bg-slate-900" />
      <div className="max-h-36 overflow-y-auto space-y-1">
        {slots.map((s) => (
          <button
            key={s._id || s.id}
            onClick={() => setSlotId(s._id || s.id)}
            className={`w-full rounded-lg border p-2 text-left ${slotId === (s._id || s.id) ? "border-emerald-500 bg-emerald-50/20" : ""}`}
          >
            {fmtTime(s.startTime)} - {fmtTime(s.endTime)} ({s.availableCapacity || s.capacity} remaining)
          </button>
        ))}
      </div>
      <button disabled={!slotId || loading} onClick={submit} className="w-full rounded-lg bg-emerald-600 py-1.5 font-bold text-white disabled:opacity-50">
        Confirm Rebooking
      </button>
    </div>
  );
}