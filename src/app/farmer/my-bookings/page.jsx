"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Calendar, Clock, MapPin, Wheat, Truck, QrCode, Download,
  Eye, Ticket, Users, Timer, CheckCircle2, XCircle, X,
  AlertCircle, RefreshCw, ShieldCheck, FileCheck2, Navigation, Hash,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: AlertCircle },
  CONFIRMED: { label: "Confirmed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  CHECKED_IN: { label: "Checked In", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: CheckCircle2 },
  COMPLETED: { label: "Completed", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20", icon: FileCheck2 },
  CANCELLED: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", icon: XCircle },
  EXPIRED: { label: "Expired", className: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20", icon: AlertCircle },
};

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const getCentreName = (booking) => booking?.centre?.name || booking?.centreId?.name || booking?.centreName || "Procurement Centre";
const getCommodityName = (booking) => booking?.commodity?.name || booking?.commodityId?.name || booking?.commodityName || "—";
const getCentreId = (booking) => booking?.centre?.centreId || booking?.centreId?.centreId || "—";
const getSlotTime = (booking) => {
  const slot = booking?.slot || booking?.slotId;
  return !slot ? "—" : (slot.startTime && slot.endTime ? `${slot.startTime} – ${slot.endTime}` : (booking?.timeSlot || "—"));
};
const getQueuePosition = (booking) => booking?.queuePosition ?? booking?.queue?.position ?? booking?.position ?? "—";
const getWaitingTime = (booking) => booking?.estimatedWaitMin ?? booking?.queue?.estimatedWaitMin ?? 0;
const getQuantity = (booking) => booking?.expectedQuantity ?? booking?.quantity ?? 0;
const getVehicleNumber = (booking) => booking?.vehicleNumber || booking?.vehicle?.number || "—";
const getVehicleType = (booking) => booking?.vehicleType || booking?.vehicle?.type || "";

export default function MyBookingsPage() {
  const { status: sessionStatus } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gatePassBooking, setGatePassBooking] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);

  const fetchBookings = async (showRefresh = false) => {
    try {
      showRefresh ? setRefreshing(true) : setLoading(true);
      setError("");
      const response = await fetch("/api/procurement/bookings", { method: "GET", cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to fetch bookings");
      setBookings(Array.isArray(result.data) ? result.data : Array.isArray(result.bookings) ? result.bookings : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(err.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") fetchBookings();
  }, [sessionStatus]);

  const filteredBookings = bookings.filter((booking) => {
    const bookingStatus = String(booking.status || "").toUpperCase();
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [
      String(booking.bookingId || ""),
      String(booking.tokenNumber || ""),
      getCentreName(booking),
      getCommodityName(booking),
      getVehicleNumber(booking),
    ].some((field) => field.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "ALL" || bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const downloadGatePass = (booking) => {
    const content = `AGRINEX PROCUREMENT GATE PASS\n========================================\nBooking ID:\n${booking.bookingId || "—"}\nToken Number:\n${booking.tokenNumber || "—"}\nCentre:\n${getCentreName(booking)}\nCentre ID:\n${getCentreId(booking)}\nCrop:\n${getCommodityName(booking)}\nQuantity:\n${getQuantity(booking)} Q\nDate:\n${formatDate(booking.date || booking.selectedDate || booking.slot?.date)}\nTime Slot:\n${getSlotTime(booking)}\nVehicle Type:\n${getVehicleType(booking) || "—"}\nVehicle Number:\n${getVehicleNumber(booking)}\nQueue Position:\n${getQueuePosition(booking)}\nEstimated Waiting Time:\n${getWaitingTime(booking)} minutes\nBooking Status:\n${booking.status || "—"}\n========================================\nAGRINEX\nDigital Procurement Reservation\n========================================\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `AGRINEX-GatePass-${booking.bookingId || "booking"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (sessionStatus === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading farmer account...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <div className="h-screen w-full flex items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950">
        <div className="text-center max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-lg">
          <ShieldCheck className="mx-auto h-11 w-11 text-emerald-500 mb-3" />
          <h2 className="text-base font-black text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please sign in to view your procurement bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100/60 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950 flex flex-col justify-center items-center p-3 sm:p-5 antialiased selection:bg-emerald-500/20 selection:text-emerald-700">
      <div className="w-full max-w-6xl h-full max-h-[82vh] flex flex-col min-h-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-emerald-950/5 dark:shadow-black/40 overflow-hidden relative">

        {/* TOP ACCENT LINE */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 overflow-hidden">

          {/* HEADER SECTION */}
          <header className="shrink-0 pb-4 border-b border-slate-200/80 dark:border-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      My Bookings
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {filteredBookings.length} Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    View and manage your verified procurement appointments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchBookings(true)}
                disabled={refreshing}
                className="h-9 px-3.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-500" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="mt-3.5 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search booking ID, token, centre, crop or vehicle..."
                  className="h-9 w-full pl-9 pr-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`h-9 shrink-0 px-3 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all ${statusFilter === status
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/25"
                        : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    {status === "ALL" ? "All" : status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* LIST CONTAINER WITH SCROLLBAR */}
          <div className="flex-1 min-h-0 pt-3">
            <div className="h-full overflow-y-auto pr-1.5 space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 hover:scrollbar-thumb-emerald-500 transition-colors">

              {loading && (
                <div className="h-full flex items-center justify-center min-h-[280px]">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <p className="text-xs font-semibold text-slate-500">Loading procurement reservations...</p>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="h-full flex items-center justify-center min-h-[280px]">
                  <div className="text-center max-w-sm p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                    <div className="mx-auto h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-2.5 text-rose-500">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Unable to load bookings</h3>
                    <p className="text-xs text-slate-500 mt-1">{error}</p>
                    <button
                      type="button"
                      onClick={() => fetchBookings()}
                      className="mt-3.5 h-8 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-sm"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && filteredBookings.length === 0 && (
                <div className="h-full flex items-center justify-center min-h-[280px]">
                  <div className="text-center p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-white/5 max-w-sm">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Ticket className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">No bookings found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {bookings.length === 0
                        ? "You have not made any procurement bookings yet."
                        : "No booking matches your active search or filter selection."}
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && filteredBookings.length > 0 && filteredBookings.map((booking, index) => {
                const status = String(booking.status || "PENDING").toUpperCase();
                const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={booking._id || booking.bookingId || index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(index * 0.04, 0.2) }}
                    className="group rounded-2xl border border-slate-200/90 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 shadow-sm hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all p-3.5 flex flex-col gap-3"
                  >
                    {/* CARD TOP ROW */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                              {booking.bookingId || "Booking"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusInfo.className}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                            <Hash className="h-3 w-3 text-slate-400" />
                            Token: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{booking.tokenNumber || "—"}</span>
                          </p>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center gap-2 self-end lg:self-center">
                        <button
                          type="button"
                          onClick={() => setDetailBooking(booking)}
                          className="h-8 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setGatePassBooking(booking)}
                          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition"
                        >
                          <QrCode className="h-3.5 w-3.5" /> Gate Pass
                        </button>
                      </div>
                    </div>

                    {/* INFORMATION TILES GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      <BookingInfo icon={MapPin} label="Centre" value={getCentreName(booking)} />
                      <BookingInfo icon={Wheat} label="Crop" value={getCommodityName(booking)} />
                      <BookingInfo icon={Truck} label="Quantity" value={`${getQuantity(booking)} Q`} />
                      <BookingInfo icon={Calendar} label="Date" value={formatDate(booking.date || booking.selectedDate || booking.slot?.date)} />
                      <BookingInfo icon={Clock} label="Time Slot" value={getSlotTime(booking)} />
                      <BookingInfo icon={Truck} label="Vehicle" value={getVehicleNumber(booking)} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* POPUP: BOOKING DETAIL VIEW */}
      <AnimatePresence>
        {detailBooking && (
          <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Booking Details</h2>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{detailBooking.bookingId || "—"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailBooking(null)}
                  className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <DetailItem icon={Ticket} label="Booking ID" value={detailBooking.bookingId || "—"} />
                  <DetailItem icon={Hash} label="Token Number" value={detailBooking.tokenNumber || "—"} />
                  <DetailItem icon={Navigation} label="Centre ID" value={getCentreId(detailBooking)} />
                  <DetailItem icon={Users} label="Queue Position" value={`#${getQueuePosition(detailBooking)}`} />
                  <DetailItem icon={Timer} label="Estimated Wait" value={`${getWaitingTime(detailBooking)} min`} />
                  <DetailItem icon={Truck} label="Vehicle Type" value={getVehicleType(detailBooking) || "—"} />
                  <DetailItem icon={Truck} label="Vehicle Number" value={getVehicleNumber(detailBooking)} />
                  <DetailItem icon={Wheat} label="Quantity" value={`${getQuantity(detailBooking)} Q`} />
                  <DetailItem icon={Calendar} label="Booking Date" value={formatDate(detailBooking.date || detailBooking.selectedDate || detailBooking.slot?.date)} />
                  <DetailItem icon={Clock} label="Time Slot" value={getSlotTime(detailBooking)} />
                  <DetailItem icon={MapPin} label="Procurement Centre" value={getCentreName(detailBooking)} />
                  <DetailItem icon={Wheat} label="Commodity" value={getCommodityName(detailBooking)} />
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Created: {formatDateTime(detailBooking.createdAt)}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Status: {detailBooking.status || "CONFIRMED"}
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => downloadGatePass(detailBooking)}
                  className="h-9 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1.5 hover:bg-emerald-500/20 transition"
                >
                  <Download className="h-4 w-4" /> Download Pass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = detailBooking;
                    setDetailBooking(null);
                    setGatePassBooking(target);
                  }}
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <QrCode className="h-4 w-4" /> View QR Gate Pass
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP: DIGITAL GATE PASS VIEW */}
      <AnimatePresence>
        {gatePassBooking && (
          <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl p-5"
            >
              <div className="border-b border-slate-200/80 dark:border-white/10 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Digital Gate Pass</h2>
                    <p className="text-[9px] text-slate-400">AGRINEX Procurement Reservation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGatePassBooking(null)}
                  className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-center">
                  <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Token Number</p>
                  <p className="mt-1 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{gatePassBooking.tokenNumber || "—"}</p>
                  <div className="mx-auto mt-3.5 h-36 w-36 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-inner">
                    <QrCode className="h-28 w-28 text-slate-900" />
                  </div>
                  <p className="mt-2.5 text-[9px] text-slate-400">Scan this QR code at the procurement gate.</p>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <ModalInfo label="Booking ID" value={gatePassBooking.bookingId || "—"} />
                  <ModalInfo label="Status" value={gatePassBooking.status || "—"} />
                  <ModalInfo label="Centre" value={getCentreName(gatePassBooking)} />
                  <ModalInfo label="Crop" value={getCommodityName(gatePassBooking)} />
                  <ModalInfo label="Quantity" value={`${getQuantity(gatePassBooking)} Q`} />
                  <ModalInfo label="Date" value={formatDate(gatePassBooking.date || gatePassBooking.selectedDate || gatePassBooking.slot?.date)} />
                  <ModalInfo label="Time Slot" value={getSlotTime(gatePassBooking)} />
                  <ModalInfo label="Vehicle" value={getVehicleNumber(gatePassBooking)} />
                </div>

                <button
                  type="button"
                  onClick={() => downloadGatePass(gatePassBooking)}
                  className="mt-4 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Download className="h-4 w-4" /> Download Gate Pass
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingInfo({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/30 p-2">
      <div className="flex items-center gap-1 text-slate-400">
        <Icon className="h-3 w-3 shrink-0 text-emerald-500" />
        <span className="text-[8px] uppercase font-bold truncate">{label}</span>
      </div>
      <p className="mt-1 text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{value}</p>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5 p-2.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="text-[8px] uppercase font-bold tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 break-words">{value}</p>
    </div>
  );
}

function ModalInfo({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 p-2.5">
      <p className="text-[8px] uppercase font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-[10px] font-black text-slate-800 dark:text-slate-200 break-words">{value}</p>
    </div>
  );
}