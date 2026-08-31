"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Check,
  CheckCircle2,
  Truck,
  Download,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  X,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Scale,
  Users,
  Wheat,
  ShieldCheck,
  Timer,
  Navigation,
  CircleCheck,
  Leaf,
  BadgeCheck,
  Gauge,
  Phone,
  Tractor,
} from "lucide-react";

const PROCUREMENT_CENTRES = [
  {
    id: "xyz-centre",
    name: "XYZ Procurement Centre",
    subtext: "Main Yard • 4.2 km away",
    location: "Rampur Sub-Yard, Kamrup",
    status: "Open",
    queue: 38,
    wait: "45 min",
    capacity: 68,
    isNearby: true,
    isLowQueue: false,
    distance: "4.2 km",
  },
  {
    id: "abc-centre",
    name: "ABC Procurement Centre",
    subtext: "APMC Complex • 6.1 km away",
    location: "Boko Main APMC Yard",
    status: "Open",
    queue: 18,
    wait: "20 min",
    capacity: 35,
    isNearby: true,
    isLowQueue: true,
    distance: "6.1 km",
  },
  {
    id: "def-centre",
    name: "DEF Grain Hub",
    subtext: "Mandi Yard 2 • 9.8 km away",
    location: "Chaygaon Mandi Complex",
    status: "Open",
    queue: 54,
    wait: "75 min",
    capacity: 85,
    isNearby: false,
    isLowQueue: false,
    distance: "9.8 km",
  },
  {
    id: "ghi-centre",
    name: "GHI Kisan Seva Kendra",
    subtext: "North Gate • 12.4 km away",
    location: "Palasbari Rural Yard",
    status: "Open",
    queue: 12,
    wait: "15 min",
    capacity: 28,
    isNearby: false,
    isLowQueue: true,
    distance: "12.4 km",
  },
];

const CROPS = [
  { id: "paddy", name: "Paddy", icon: "🌾", variety: "PR-126 / Basmati" },
  { id: "wheat", name: "Wheat", icon: "🌾", variety: "Sharbati / Lok-1" },
  { id: "maize", name: "Maize", icon: "🌽", variety: "Hybrid Yellow" },
  { id: "mustard", name: "Mustard", icon: "🌱", variety: "Pusa Bold" },
];

const VEHICLE_TYPES = [
  { id: "tractor", label: "Tractor", icon: Tractor },
  { id: "tractor_trolley", label: "Tractor + Trolley", icon: Truck },
  { id: "mini_truck", label: "Mini Truck", icon: Truck },
  { id: "truck", label: "Truck", icon: Truck },
];

const SEPTEMBER_2026_DAYS = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  let status = "available";
  if ([6, 13, 20, 27].includes(day)) status = "closed";
  else if ([11, 12, 18, 25].includes(day)) status = "few";
  else if ([15, 22].includes(day)) status = "full";
  return { day, status };
});

const TIME_SLOTS = [
  { slot: "08:00 – 09:00 AM", status: "12 available", count: 12, isFull: false },
  { slot: "09:00 – 10:00 AM", status: "8 available", count: 8, isFull: false },
  { slot: "10:00 – 11:00 AM", status: "3 left", count: 3, isFull: false },
  { slot: "11:00 – 12:00 PM", status: "6 available", count: 6, isFull: false },
  { slot: "02:00 – 03:00 PM", status: "15 available", count: 15, isFull: false },
  { slot: "03:00 – 04:00 PM", status: "9 available", count: 9, isFull: false },
  { slot: "04:00 – 05:00 PM", status: "Full", count: 0, isFull: true },
];

const STEPS = [
  { number: 1, label: "Centre", icon: MapPin },
  { number: 2, label: "Produce", icon: Wheat },
  { number: 3, label: "Schedule", icon: CalendarIcon },
  { number: 4, label: "Details", icon: Truck },
  { number: 5, label: "Review", icon: CheckCircle2 },
];

export default function BookingPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [centreSearch, setCentreSearch] = useState("");
  const [centreFilter, setCentreFilter] = useState("all");

  const [booking, setBooking] = useState({
    centreId: "xyz-centre",
    cropId: "paddy",
    quantity: 25,
    selectedDate: 12,
    timeSlot: "10:00 – 11:00 AM",
    farmerName: "Rajesh Kumar",
    farmerId: "AGR-FRM-10245",
    farmerLocation: "Rampur, Kamrup, Assam",
    farmerPhone: "+91 98765 43210",
    vehicleType: "tractor_trolley",
    vehicleNumber: "AS-01-AB-1234",
    confirmedConsent: true,
  });

  const [toast, setToast] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("AGR-TK-4709");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const updateBooking = (updates) => {
    setBooking((prev) => ({ ...prev, ...updates }));
  };

  const selectedCentre =
    PROCUREMENT_CENTRES.find((c) => c.id === booking.centreId) || PROCUREMENT_CENTRES[0];

  const selectedCrop =
    CROPS.find((c) => c.id === booking.cropId) || CROPS[0];

  const selectedVehicle =
    VEHICLE_TYPES.find((v) => v.id === booking.vehicleType) || VEHICLE_TYPES[1];

  const filteredCentres = useMemo(() => {
    return PROCUREMENT_CENTRES.filter((centre) => {
      const search = centreSearch.toLowerCase().trim();
      const matchesSearch =
        !search ||
        centre.name.toLowerCase().includes(search) ||
        centre.location.toLowerCase().includes(search);

      if (!matchesSearch) return false;
      if (centreFilter === "nearby") return centre.isNearby;
      if (centreFilter === "open") return centre.status === "Open";
      if (centreFilter === "low_queue") return centre.isLowQueue;
      return true;
    });
  }, [centreSearch, centreFilter]);

  const changeQuantity = (amount) => {
    updateBooking({ quantity: Math.max(1, booking.quantity + amount) });
  };

  const validateStep = () => {
    if (activeStep === 1 && !booking.centreId) {
      showToast("Please select a procurement centre.");
      return false;
    }
    if (activeStep === 2) {
      if (!booking.cropId) {
        showToast("Please select your crop.");
        return false;
      }
      if (!booking.quantity || booking.quantity < 1) {
        showToast("Please enter a valid quantity.");
        return false;
      }
    }
    if (activeStep === 3) {
      if (!booking.selectedDate) {
        showToast("Please select an arrival date.");
        return false;
      }
      if (!booking.timeSlot) {
        showToast("Please select a time slot.");
        return false;
      }
    }
    if (activeStep === 4) {
      if (!booking.vehicleType) {
        showToast("Please select a vehicle type.");
        return false;
      }
      if (!booking.vehicleNumber.trim()) {
        showToast("Please enter the vehicle registration number.");
        return false;
      }
    }
    if (activeStep === 5 && !booking.confirmedConsent) {
      showToast("Please confirm the booking declaration.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (activeStep < 5) {
      setActiveStep((prev) => prev + 1);
      return;
    }
    const token = `AGR-TK-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedToken(token);
    setShowSuccess(true);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="relative h-min-full w-full flex flex-col min-h-0 overflow-hidden select-none">


      {/* Top Header & Wizard Steps */}
      <header className="shrink-0 flex flex-col gap-2 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Leaf className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Book Procurement Slot
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Reserve your verified Mandi entry window and eliminate wait times.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700 dark:text-slate-200">APMC Portal Active</span>
          </div>
        </div>

        {/* Wizard Stepper Strip */}
        <div className="relative flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200/80 bg-white/60 dark:border-white/10 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="absolute left-6 right-6 top-1/2 h-[2px] -translate-y-1/2 bg-slate-200 dark:bg-slate-800" />
          <motion.div
            className="absolute left-6 top-1/2 h-[2px] -translate-y-1/2 bg-emerald-500"
            initial={false}
            animate={{ width: `${((activeStep - 1) / 4) * 88}%` }}
          />

          {STEPS.map((step) => {
            const active = activeStep === step.number;
            const completed = activeStep > step.number;
            const Icon = step.icon;

            return (
              <button
                key={step.number}
                type="button"
                disabled={step.number > activeStep}
                onClick={() => step.number <= activeStep && setActiveStep(step.number)}
                className="relative z-10 flex items-center gap-2 bg-transparent disabled:cursor-default"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                    active
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-105"
                      : completed
                      ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  {completed ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span
                  className={`hidden md:inline-block text-xs font-bold ${
                    active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : completed
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Form Content Container */}
      <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white/60 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-lime-500/20" />

        {/* Step Body (Scrollable inside container only if viewport is very tight) */}
        <div className="flex-1 min-h-0 p-3.5 sm:p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: CHOOSE CENTRE */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="h-full flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      value={centreSearch}
                      onChange={(e) => setCentreSearch(e.target.value)}
                      placeholder="Search centre, location or yard..."
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      ["all", "All"],
                      ["nearby", "Nearby"],
                      ["open", "Open"],
                      ["low_queue", "Low Queue"],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCentreFilter(id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          centreFilter === id
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1">
                  {filteredCentres.map((centre) => {
                    const selected = booking.centreId === centre.id;
                    return (
                      <div
                        key={centre.id}
                        onClick={() => updateBooking({ centreId: centre.id })}
                        className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between ${
                          selected
                            ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm"
                            : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-emerald-500/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                selected
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                                {centre.name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{centre.location}</p>
                            </div>
                          </div>
                          {selected && (
                            <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 my-2">
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg text-center">
                            <p className="text-[9px] text-slate-400">Queue</p>
                            <p className="text-xs font-black">{centre.queue} trucks</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg text-center">
                            <p className="text-[9px] text-slate-400">Wait</p>
                            <p className="text-xs font-black text-amber-500">{centre.wait}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg text-center">
                            <p className="text-[9px] text-slate-400">Distance</p>
                            <p className="text-xs font-black">{centre.distance}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open Now
                          </span>
                          <span>Cap: {centre.capacity}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CROPS & QUANTITY */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="h-full flex flex-col justify-between gap-3"
              >
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Select Crop</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CROPS.map((crop) => {
                      const selected = booking.cropId === crop.id;
                      return (
                        <div
                          key={crop.id}
                          onClick={() => updateBooking({ cropId: crop.id })}
                          className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                            selected
                              ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40"
                              : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5"
                          }`}
                        >
                          <span className="text-2xl">{crop.icon}</span>
                          <p className="text-xs font-black mt-1">{crop.name}</p>
                          <p className="text-[9px] text-slate-400">{crop.variety}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Adjuster */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-slate-800/40 p-3.5 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Produce Volume (Quintals)</span>
                  <div className="flex items-center gap-6 my-2">
                    <button
                      type="button"
                      onClick={() => changeQuantity(-1)}
                      className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 font-black text-base shadow-sm hover:border-emerald-400"
                    >
                      -
                    </button>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">{booking.quantity}</span>
                      <span className="text-xs font-bold text-emerald-600">QTL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => changeQuantity(1)}
                      className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 font-black text-base shadow-sm hover:border-emerald-400"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {[10, 20, 25, 35, 50, 75].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => updateBooking({ quantity: q })}
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          booking.quantity === q
                            ? "bg-emerald-600 text-white"
                            : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                        }`}
                      >
                        {q} Q
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Gross weight will be logged at the yard weighbridge with auto-receipting.</span>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SCHEDULE DATE & TIME */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="h-full flex flex-col justify-between gap-3"
              >
                {/* Mini Calendar View */}
                <div className="rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black">September 2026</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Few
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                      <span key={d} className="text-[9px] font-bold text-slate-400 uppercase py-0.5">
                        {d}
                      </span>
                    ))}
                    <span />
                    {SEPTEMBER_2026_DAYS.map(({ day, status }) => {
                      const selected = booking.selectedDate === day;
                      const disabled = status === "closed" || status === "full";
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={disabled}
                          onClick={() => updateBooking({ selectedDate: day })}
                          className={`h-6 rounded-md text-[10px] font-bold transition-all ${
                            selected
                              ? "bg-emerald-600 text-white font-black"
                              : disabled
                              ? "opacity-25 cursor-not-allowed bg-slate-100 dark:bg-slate-800"
                              : status === "few"
                              ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                              : "bg-slate-50 dark:bg-slate-900/40 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Arrival Window</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const selected = booking.timeSlot === slot.slot;
                      return (
                        <button
                          key={slot.slot}
                          type="button"
                          disabled={slot.isFull}
                          onClick={() => updateBooking({ timeSlot: slot.slot })}
                          className={`p-2 rounded-xl border text-left text-xs transition-all ${
                            selected
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                              : slot.isFull
                              ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-transparent"
                              : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-emerald-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[11px]">{slot.slot}</span>
                            {selected && <Check className="h-3 w-3 text-emerald-600 shrink-0" />}
                          </div>
                          <span
                            className={`text-[9px] font-semibold mt-0.5 block ${
                              slot.count <= 3 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {slot.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: VEHICLE & FARMER INFO */}
            {activeStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="h-full flex flex-col justify-between gap-3"
              >
                {/* Farmer Credential Pill */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                      RK
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black">{booking.farmerName}</span>
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{booking.farmerId} • {booking.farmerLocation}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                    Verified ID
                  </span>
                </div>

                {/* Transport Select */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Transport Type</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {VEHICLE_TYPES.map((v) => {
                      const selected = booking.vehicleType === v.id;
                      const Icon = v.icon;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => updateBooking({ vehicleType: v.id })}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            selected
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vehicle Plate Input */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Vehicle License Number</p>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={booking.vehicleNumber}
                      onChange={(e) => updateBooking({ vehicleNumber: e.target.value.toUpperCase() })}
                      placeholder="AS-01-AB-1234"
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs font-mono font-bold tracking-wider outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300">
                  <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Number plate recognition is used at Gate 2 for seamless automated check-in.</span>
                </div>
              </motion.div>
            )}

            {/* STEP 5: REVIEW & SUMMARY */}
            {activeStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="h-full flex flex-col justify-between gap-3"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <SummaryTile icon={MapPin} label="Centre" value={selectedCentre.name} />
                  <SummaryTile icon={Wheat} label="Crop" value={`${selectedCrop.name} (${booking.quantity} Q)`} />
                  <SummaryTile icon={CalendarIcon} label="Slot" value={`${booking.selectedDate} Sep 2026`} />
                  <SummaryTile icon={Clock} label="Window" value={booking.timeSlot} />
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Farmer Account</span>
                    <span className="font-bold text-slate-800 dark:text-white">{booking.farmerName} ({booking.farmerId})</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Vehicle Details</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedVehicle.label} • {booking.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Assigned Gate</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Gate #2 (Direct Weighbridge)</span>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={booking.confirmedConsent}
                    onChange={(e) => updateBooking({ confirmedConsent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-emerald-600 rounded shrink-0"
                  />
                  <div className="text-[11px] leading-tight text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-white">I confirm the shipment information</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Produce will match the declared moisture and quality parameters for direct procurement.
                    </p>
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unified Bottom Action Bar */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200/70 bg-slate-50/90 dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">Encrypted Gov APMC Reservation</span>
          </div>

          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
            >
              {activeStep < 5 ? (
                <>
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirm & Reserve
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
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
              className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5 shadow-2xl text-center"
            >
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="absolute right-3.5 top-3.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h3 className="text-base font-black">Slot Confirmed</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
                Your gate pass has been allocated for {selectedCentre.name}.
              </p>

              {/* Digital Pass Token Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 mb-3">
                <p className="text-[9px] uppercase font-bold text-slate-400">Token Number</p>
                <p className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">{generatedToken}</p>
                <div className="my-2 flex justify-center">
                  <div className="p-2 bg-white rounded-lg border">
                    <QrCode className="h-16 w-16 text-slate-900" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Scan at Gate 2 entrance</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  showToast("Gate pass downloaded to device.");
                  setShowSuccess(false);
                }}
                className="w-full h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="h-3.5 w-3.5" />
                Download Gate Pass
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

function SummaryTile({ icon: Icon, label, value }) {
  return (
    <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-800/40">
      <div className="flex items-center gap-1 text-slate-400 mb-1">
        <Icon className="h-3 w-3 text-emerald-500" />
        <span className="text-[9px] uppercase font-bold truncate">{label}</span>
      </div>
      <p className="text-xs font-black truncate">{value}</p>
    </div>
  );
}