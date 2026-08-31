"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Wheat,
  X,
  CheckCircle2,
} from "lucide-react";

/* ============================================================
   PROCUREMENT DATA
============================================================ */

const PROCUREMENT_CENTRES = [
  {
    id: 1,
    name: "XYZ Procurement Centre",
    location: "Rampur Sub-Yard, Kamrup",
    distanceKm: 2.4,
    distance: "2.4 km",
    status: "Open",
    crop: "Paddy",
    priceNum: 2300,
    price: "₹2,300",
    unit: "/ Quintal",
    slots: 18,
    totalSlots: 40,
    nextSlot: "10:00 AM",
    nextSlotTime: "10:00",
    lastBooking: "11:00 AM",
  },
  {
    id: 2,
    name: "Rampur Agricultural Yard",
    location: "Rampur Market, Kamrup",
    distanceKm: 4.8,
    distance: "4.8 km",
    status: "Open",
    crop: "Paddy",
    priceNum: 2300,
    price: "₹2,300",
    unit: "/ Quintal",
    slots: 11,
    totalSlots: 30,
    nextSlot: "11:30 AM",
    nextSlotTime: "11:30",
    lastBooking: "12:30 PM",
  },
  {
    id: 3,
    name: "Kamrup Central Mandi",
    location: "Central Market, Kamrup",
    distanceKm: 7.2,
    distance: "7.2 km",
    status: "Busy",
    crop: "Paddy",
    priceNum: 2280,
    price: "₹2,280",
    unit: "/ Quintal",
    slots: 5,
    totalSlots: 35,
    nextSlot: "1:00 PM",
    nextSlotTime: "13:00",
    lastBooking: "2:00 PM",
  },
  {
    id: 4,
    name: "Boko Grain Processing Hub",
    location: "Boko Main APMC, Kamrup",
    distanceKm: 9.1,
    distance: "9.1 km",
    status: "Open",
    crop: "Wheat",
    priceNum: 2420,
    price: "₹2,420",
    unit: "/ Quintal",
    slots: 22,
    totalSlots: 40,
    nextSlot: "09:30 AM",
    nextSlotTime: "09:30",
    lastBooking: "10:30 AM",
  },
];

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ProcurementPage() {
  const [selectedCrop, setSelectedCrop] = useState("Paddy");
  const [selectedCentre, setSelectedCentre] = useState(PROCUREMENT_CENTRES[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("nearest"); // 'nearest' | 'earliest' | 'highest_price'
  const [showBooking, setShowBooking] = useState(false);
  const [search, setSearch] = useState("");
  const [vehicle, setVehicle] = useState("Tractor + Trolley");
  const [quantity, setQuantity] = useState("25");
  const [toast, setToast] = useState("");

  /* ==========================================================
     FILTER & SORT CENTRES
  ========================================================== */

  const filteredCentres = useMemo(() => {
    const list = PROCUREMENT_CENTRES.filter((centre) => {
      const searchMatch =
        centre.name.toLowerCase().includes(search.toLowerCase()) ||
        centre.location.toLowerCase().includes(search.toLowerCase());

      const cropMatch =
        selectedCrop === "All" || centre.crop === selectedCrop;

      return searchMatch && cropMatch;
    });

    return list.sort((a, b) => {
      if (sortBy === "nearest") return a.distanceKm - b.distanceKm;
      if (sortBy === "highest_price") return b.priceNum - a.priceNum;
      if (sortBy === "earliest") return a.nextSlotTime.localeCompare(b.nextSlotTime);
      return 0;
    });
  }, [search, selectedCrop, sortBy]);

  /* ==========================================================
     TOAST
  ========================================================== */

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /* ==========================================================
     BOOK SLOT
  ========================================================== */

  const openBooking = (centre) => {
    setSelectedCentre(centre);
    setShowBooking(true);
  };

  const confirmBooking = () => {
    setShowBooking(false);
    showToast(`Slot reserved at ${selectedCentre.name}`);
  };

  return (
    <div className="relative h-full w-full flex flex-col min-h-0 overflow-hidden select-none">
      {/* Ambience Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-lime-500/10 blur-[140px]" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-[300] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white dark:bg-emerald-500 dark:text-slate-950 px-4 py-2.5 text-xs font-bold shadow-2xl backdrop-blur-md border border-white/10">
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Wheat className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Mandi Procurement Centers
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Locate active MSP collection centers and book your delivery window.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 text-xs">
          <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-bold text-slate-700 dark:text-slate-200">12 September 2026</span>
        </div>
      </header>

      {/* Main Viewport Container */}
      <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white/60 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 overflow-hidden">
        
        {/* Top Accent Strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-lime-500/20" />

        {/* Toolbar & Filters */}
        <div className="shrink-0 flex flex-col gap-2 p-3 border-b border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mandi or location..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="h-8 appearance-none rounded-lg border border-slate-200/80 bg-white/80 px-3 pr-8 text-xs font-bold outline-none dark:border-white/10 dark:bg-slate-900/60"
                >
                  <option value="All">All Crops</option>
                  <option value="Paddy">Paddy</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize</option>
                  <option value="Mustard">Mustard</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                  showFilters
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Sort & Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filter Strip */}
          {showFilters && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/50 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Sort:</span>
              {[
                ["nearest", "Nearest First"],
                ["earliest", "Earliest Slot"],
                ["highest_price", "Best Price"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSortBy(id)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                    sortBy === id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                      : "bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard 2-Column Split */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 overflow-y-auto lg:overflow-hidden">
          
          {/* Main List Section (8 cols) */}
          <section className="lg:col-span-8 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {filteredCentres.length} Centres available
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Live Mandi Status
              </span>
            </div>

            {/* Scrollable Center Cards inside container */}
            <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-0.5">
              {filteredCentres.map((centre) => (
                <CentreCard
                  key={centre.id}
                  centre={centre}
                  onBook={() => openBooking(centre)}
                  onSelect={() => setSelectedCentre(centre)}
                  selected={selectedCentre.id === centre.id}
                />
              ))}
            </div>
          </section>

          {/* Right Sidebar: Selected Centre Focus (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-800/40 p-3.5 min-h-0">
            <div className="space-y-3 min-h-0 overflow-y-auto">
              {/* Header Details */}
              <div className="flex items-start justify-between pb-2.5 border-b border-slate-200/60 dark:border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Selected Centre</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight mt-0.5">
                    {selectedCentre.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedCentre.location}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCentre.status === "Open"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {selectedCentre.status}
                </span>
              </div>

              {/* Price Banner */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Government MSP Rate ({selectedCentre.crop})
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {selectedCentre.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{selectedCentre.unit}</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <SmallInfo icon={Clock3} label="Next Opening" value={selectedCentre.nextSlot} />
                <SmallInfo icon={MapPin} label="Distance" value={selectedCentre.distance} />
              </div>

              {/* Capacity Bar */}
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 dark:border-white/5 dark:bg-slate-900/50 p-2.5">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-400 font-medium">Slots Remaining</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedCentre.slots} / {selectedCentre.totalSlots}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(selectedCentre.slots / selectedCentre.totalSlots) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={() => openBooking(selectedCentre)}
              className="mt-3 w-full h-9 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              Book Delivery Slot
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </aside>

        </div>

        {/* Bottom Status Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-200/70 bg-slate-50/90 dark:border-white/10 dark:bg-slate-950/60 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">Official State APMC Mandi Procurement System</span>
          </div>
          <span className="text-[10px]">Real-time gate pass verified</span>
        </div>

      </div>

      {/* Booking Quick Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowBooking(false)}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Direct Reservation</h3>
                <p className="text-[10px] text-slate-400">{selectedCentre.name}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Arrival Window</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[selectedCentre.nextSlot, selectedCentre.lastBooking].map((time) => (
                    <button
                      key={time}
                      type="button"
                      className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      <Clock3 className="h-3 w-3" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Qty (QTL)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full mt-1 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2.5 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Transport</label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full mt-1 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-2 text-xs font-bold outline-none"
                  >
                    <option>Tractor + Trolley</option>
                    <option>Truck</option>
                    <option>Mini Truck</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5">
                <span className="text-[10px] text-slate-400">MSP Total Est.</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  ₹{(Number(quantity || 0) * selectedCentre.priceNum).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={confirmBooking}
              className="mt-4 w-full h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              Confirm Slot Reservation
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CENTRE CARD SUB-COMPONENT
============================================================ */

function CentreCard({ centre, onBook, onSelect, selected }) {
  const availability = Math.round((centre.slots / centre.totalSlots) * 100);

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
        selected
          ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm"
          : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-emerald-500/40"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                selected
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Store className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                {centre.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{centre.location}</p>
            </div>
          </div>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
              centre.status === "Open"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {centre.status}
          </span>
        </div>

        {/* Price & Distance */}
        <div className="flex items-baseline justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {centre.price}
            </span>
            <span className="text-[9px] text-slate-400">{centre.unit}</span>
          </div>
          <span className="text-[10px] text-slate-400">{centre.distance} away</span>
        </div>
      </div>

      {/* Slots & Quick Book */}
      <div className="mt-2.5">
        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
          <span>Available slots: {centre.slots}</span>
          <span className="font-bold text-emerald-600">{availability}%</span>
        </div>
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${availability}%` }} />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
          className="w-full h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition"
        >
          Book Slot
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function SmallInfo({ icon: Icon, label, value }) {
  return (
    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5">
      <div className="flex items-center gap-1 text-slate-400">
        <Icon className="h-3 w-3 text-emerald-500" />
        <span className="text-[9px] uppercase font-bold">{label}</span>
      </div>
      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}