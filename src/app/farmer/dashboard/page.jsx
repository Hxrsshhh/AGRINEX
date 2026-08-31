
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar,
  Users,
  Scale,
  DollarSign,
  Bell,
  User,
  LogOut,
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
  {
    id: "booking",
    label: "Booking Confirmed",
    shortLabel: "Booking",
    status: "completed",
    icon: "✓",
  },
  {
    id: "verification",
    label: "Gate Verified",
    shortLabel: "Verification",
    status: "completed",
    icon: "✓",
  },
  {
    id: "weighing",
    label: "Weighing",
    shortLabel: "Weighing",
    status: "active",
    icon: "●",
  },
  {
    id: "quality",
    label: "Quality Check",
    shortLabel: "Quality",
    status: "upcoming",
    icon: "○",
  },
  {
    id: "procurement",
    label: "Procurement",
    shortLabel: "Procurement",
    status: "upcoming",
    icon: "○",
  },
  {
    id: "payment",
    label: "Payment",
    shortLabel: "Payment",
    status: "upcoming",
    icon: "○",
  },
];

function DashboardContent() {
  // Live Queue & Telemetry State
  const [aheadCount, setAheadCount] = useState(12);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showTrackQueueModal, setShowTrackQueueModal] = useState(false);
  const [showBookSlotModal, setShowBookSlotModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 2500);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-white">
      <main className="w-full p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ========================================================= */}
        {/* GREETING HEADER + BOOK NEW SLOT CTA                       */}
        {/* ========================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold mb-1.5">
              <Sparkles className="w-3 h-3 text-emerald-500" />

              <span>Harvest Procurement Season 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Good Morning, Rajesh 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Here's your procurement overview and live mandi appointment
              status.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBookSlotModal(true)}
            className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />

            <span>BOOK NEW SLOT</span>
          </motion.button>
        </div>

        {/* ========================================================= */}
        {/* TOP STATISTICS                                            */}
        {/* ========================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">

          {/* Upcoming Appointment */}

          <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Upcoming Appointment</span>

              <Clock className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="mt-2.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                10:30 AM
              </div>

              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                12 Sept 2026
              </p>
            </div>
          </div>

          {/* Queue Token */}

          <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Queue Token</span>

              <Users className="w-4 h-4 text-cyan-500" />
            </div>

            <div className="mt-2.5">
              <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
                #47
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Gate Pass Active
              </p>
            </div>
          </div>

          {/* Procurement Status */}

          <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Procurement</span>

              <Scale className="w-4 h-4 text-amber-500" />
            </div>

            <div className="mt-2.5">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">
                Weighing
              </div>

              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-semibold mt-0.5">
                In Progress (Bay 2)
              </p>
            </div>
          </div>

          {/* Payment */}

          <div className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-lime-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Payment</span>

              <DollarSign className="w-4 h-4 text-lime-500" />
            </div>

            <div className="mt-2.5">
              <div className="text-2xl sm:text-3xl font-black text-lime-600 dark:text-lime-400">
                ₹42,500
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Pending DBT Payment
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LIVE QUEUE + UPCOMING APPOINTMENT                        */}
        {/* ========================================================= */}

        <div className="grid md:grid-cols-2 gap-5">

          {/* LIVE QUEUE */}

          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />

                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>

                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                    LIVE QUEUE
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleSyncQueue}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isRefreshing ? "animate-spin text-emerald-500" : ""
                    }`}
                  />

                  <span>Sync</span>
                </button>
              </div>

              <div className="my-4 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Your Assigned Token
                </span>

                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-lime-500 my-1">
                  Token #47
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-bold mt-2 flex-wrap">
                  <span className="text-slate-700 dark:text-slate-300">
                    👥 <strong>{aheadCount} farmers ahead</strong>
                  </span>

                  <span className="text-slate-400">•</span>

                  <span className="text-amber-500">
                    ⏳ <strong>~45 min wait</strong>
                  </span>
                </div>
              </div>

              {/* Recommended Arrival */}

              <div className="p-3 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Recommended Arrival
                </span>

                <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                  10:05 AM
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Based on your current queue position
                </p>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setShowTrackQueueModal(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Track Queue Live</span>

                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* UPCOMING APPOINTMENT */}

          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />

                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                    UPCOMING APPOINTMENT
                  </h3>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Confirmed
                </span>
              </div>

              <div className="my-4 space-y-2.5">

                {/* Date */}

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Date & Slot
                  </span>

                  <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    12 Sept 2026 • 10:30 AM
                  </p>
                </div>

                {/* Centre */}

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Procurement Centre
                    </span>

                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      XYZ Procurement Centre (Main Yard)
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                    4.2 km
                  </span>
                </div>

                {/* Crop + Quantity */}

                <div className="grid grid-cols-2 gap-2.5">

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Produce
                    </span>

                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      🌾 Paddy
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Quantity
                    </span>

                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      25 Quintals
                    </p>
                  </div>

                </div>

                {/* Vehicle */}

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Vehicle
                  </span>

                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    🚜 Tractor • BR-01-AB-1234
                  </p>
                </div>

              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAppointmentModal(true)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>View Details & Gate Pass</span>

                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PROCUREMENT PROGRESS                                     */}
        {/* ========================================================= */}

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 gap-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Procurement Progress
              </h3>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live verification and weighbridge stages for Token #47
              </p>
            </div>

            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 shrink-0">
              Phase 3 Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PROCUREMENT_STEPS.map((step) => {
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";

              return (
                <div
                  key={step.id}
                  title={step.label}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500"
                      : isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-1.5 ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isActive
                          ? "bg-amber-500 text-slate-950 animate-pulse"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {step.icon}
                  </div>

                  <span className="text-xs font-bold block">
                    {step.shortLabel}
                  </span>

                  <span className="text-[9px] uppercase tracking-wider block mt-0.5">
                    {isCompleted
                      ? "Done"
                      : isActive
                        ? "Active"
                        : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* WEIGHING STATUS                                           */}
        {/* ========================================================= */}

        <div className="grid md:grid-cols-2 gap-5">

          {/* Current Weighing */}

          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-500" />

                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Current Weighing
                </h3>
              </div>

              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                  Weighbridge
                </span>

                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Bay 02
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                  Estimated
                </span>

                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  25 Q
                </p>
              </div>

            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
              Final quantity will be updated after digital weighment.
            </p>
          </div>

          {/* Important Notice */}

          <div className="p-5 sm:p-6 rounded-3xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-md">
            <div className="flex items-center gap-2 pb-3 border-b border-emerald-500/10">
              <Bell className="w-4 h-4 text-emerald-500" />

              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Important Notice
              </h3>
            </div>

            <div className="mt-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Your procurement appointment is confirmed.
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Arrive according to your live queue recommendation and keep
                your digital gate pass ready for verification.
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                Recommended arrival: 10:05 AM
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* NEARBY PROCUREMENT CENTRES                                */}
        {/* ========================================================= */}

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Nearby Procurement Centres
              </h3>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Compare live queue congestion and choose nearest mandi
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                showToast("Refreshed nearby centre queue telemetry")
              }
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Live View</span>

              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {NEARBY_CENTRES.map((centre) => (
              <div
                key={centre.id}
                className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border transition-all flex flex-col justify-between ${
                  centre.recommended
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700/70 hover:border-emerald-500/40"
                }`}
              >
                <div>

                  {/* Centre header */}

                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />

                      <span>{centre.name}</span>
                    </h4>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      {centre.distance}
                    </span>
                  </div>

                  {/* Recommended */}

                  {centre.recommended && (
                    <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full mb-2">
                      ⭐ Recommended
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs mt-3">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Vehicles in Queue:</span>

                      <strong className="text-slate-900 dark:text-white">
                        {centre.queue}
                      </strong>
                    </div>

                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Average Wait:</span>

                      <strong className="text-amber-500">
                        {centre.wait}
                      </strong>
                    </div>

                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Yard Capacity:</span>

                      <strong className="text-cyan-500">
                        {centre.capacity}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Selected ${centre.name} for slot booking`);

                    setShowBookSlotModal(true);
                  }}
                  className="mt-4 w-full py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Select Centre
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* APPOINTMENT / GATE PASS MODAL                            */}
        {/* ========================================================= */}

        <AnimatePresence>
          {showAppointmentModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative text-slate-900 dark:text-white text-center"
              >
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6" />
                </div>

                <h3 className="text-base font-black">
                  Gate Pass & Appointment
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Token #47 • Weighbridge Bay 02
                </p>

                <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-500/30 text-center">
                  <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl shadow-md flex items-center justify-center mb-2">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>

                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    AGR-TK-4709-2026
                  </p>

                  <p className="text-[11px] text-slate-500 mt-0.5">
                    12 Sept 2026 • 10:30 AM • XYZ Mandi
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-left">

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                        Produce
                      </span>

                      <span className="text-xs font-bold">
                        Paddy
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                        Quantity
                      </span>

                      <span className="text-xs font-bold">
                        25 Quintals
                      </span>
                    </div>

                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Gate Pass PDF downloaded");
                      setShowAppointmentModal(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />

                    <span>Download Pass PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* TRACK QUEUE MODAL                                        */}
        {/* ========================================================= */}

        <AnimatePresence>
          {showTrackQueueModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative text-slate-900 dark:text-white text-center"
              >
                <button
                  type="button"
                  onClick={() => setShowTrackQueueModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>

                <h3 className="text-base font-black">
                  Live Queue Radar
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  XYZ Mandi • Main Scale #02
                </p>

                <div className="my-4 space-y-2 text-xs">

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                    <span className="text-slate-400">
                      Current Token at Scale:
                    </span>

                    <span className="font-bold text-emerald-500">
                      Token #35
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                    <span className="text-slate-400">
                      Your Position:
                    </span>

                    <span className="font-bold text-slate-900 dark:text-white">
                      Token #47 ({aheadCount} ahead)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                    <span className="text-slate-400">
                      Estimated Scale Entry:
                    </span>

                    <span className="font-bold text-amber-500">
                      ~45 Minutes
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 flex justify-between">
                    <span className="text-slate-400">
                      Recommended Arrival:
                    </span>

                    <span className="font-bold text-cyan-500">
                      10:05 AM
                    </span>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setShowTrackQueueModal(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* BOOK NEW SLOT MODAL                                      */}
        {/* ========================================================= */}

        <AnimatePresence>
          {showBookSlotModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative text-slate-900 dark:text-white"
              >
                <button
                  type="button"
                  onClick={() => setShowBookSlotModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-black">
                      Book New Procurement Slot
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Reserve mandi weighment time
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Select Crop
                    </label>

                    <select className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                      <option>
                        Paddy (PR-126 / Basmati)
                      </option>

                      <option>
                        Wheat (Sharbati / Lok-1)
                      </option>

                      <option>
                        Maize (Hybrid Yellow)
                      </option>

                      <option>
                        Mustard (Pusa Bold)
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Volume (Quintals)
                      </label>

                      <input
                        type="number"
                        defaultValue={25}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Date
                      </label>

                      <input
                        type="date"
                        defaultValue="2026-09-12"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>

                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Select Time Window
                    </label>

                    <select className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                      <option>
                        10:00 – 11:00 AM (3 slots remaining)
                      </option>

                      <option>
                        08:00 – 09:00 AM (12 slots remaining)
                      </option>

                      <option>
                        02:00 – 03:00 PM (15 slots remaining)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Vehicle Registration
                    </label>

                    <input
                      type="text"
                      defaultValue="BR-01-AB-1234"
                      placeholder="Enter vehicle number"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase"
                    />
                  </div>

                </div>

                <div className="mt-5 flex gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      showToast("Slot booked! Token #48 generated");
                      setShowBookSlotModal(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                  >
                    Confirm & Issue Token
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBookSlotModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* LOGOUT CONFIRMATION MODAL                                */}
        {/* ========================================================= */}

        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center text-slate-900 dark:text-white"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-3">
                  <LogOut className="w-6 h-6" />
                </div>

                <h3 className="text-base font-black">
                  Confirm Logout
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to log out of your AGRINEX farmer
                  account?
                </p>

                <div className="mt-5 flex gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setShowLogoutModal(false);
                      showToast("Logged out successfully");
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Yes, Log Out
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* TOAST                                                    */}
        {/* ========================================================= */}

        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-2xl border border-slate-700 dark:border-slate-200"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default function FarmerDashboard() {
  return <DashboardContent />;
}
