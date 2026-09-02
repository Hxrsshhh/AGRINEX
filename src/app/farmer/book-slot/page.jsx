"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search, Check, CheckCircle2, Truck, Download, QrCode, ArrowRight, ArrowLeft,
  Info, Calendar as CalendarIcon, MapPin, Clock, ShieldCheck, Wheat, BadgeCheck, Leaf, Tractor, Navigation
} from "lucide-react";

const VEHICLE_TYPES = [
  { id: "TRACTOR", label: "Tractor", icon: Tractor },
  { id: "TRACTOR_TROLLEY", label: "Tractor + Trolley", icon: Truck },
  { id: "MINI_TRUCK", label: "Mini Truck", icon: Truck },
  { id: "TRUCK", label: "Truck", icon: Truck },
];

const STEPS = [
  { number: 1, label: "Centre", icon: MapPin },
  { number: 2, label: "Produce", icon: Wheat },
  { number: 3, label: "Schedule", icon: CalendarIcon },
  { number: 4, label: "Details", icon: Truck },
  { number: 5, label: "Review", icon: CheckCircle2 },
];

const CENTRE_FILTERS = [
  { id: "all", label: "All" },
  { id: "nearby", label: "Nearby" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
];

const formatDateForApi = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function formatDateDisplay(dateString) {
  if (!dateString) return "Not selected";
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Not selected" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  return {
    startingDay: (firstDay.getDay() + 6) % 7,
    days: Array.from({ length: totalDays }, (_, i) => i + 1),
  };
}

// Calculate distance in km between two geo points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const getInitialBooking = (session) => ({
  centreId: "", commodityId: "", quantity: 25, selectedDate: "", slotId: "",
  farmerName: session?.user?.name || "", farmerId: session?.user?.id || "",
  farmerLocation: "", farmerPhone: session?.user?.mobile || "",
  vehicleType: "TRACTOR_TROLLEY", vehicleNumber: "", confirmedConsent: false,
});

export default function BookingPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(1);
  const [centreSearch, setCentreSearch] = useState("");
  const [centreFilter, setCentreFilter] = useState("all");
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [procurementCentres, setProcurementCentres] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [dateAvailability, setDateAvailability] = useState({});
  const [loadingDateAvailability, setLoadingDateAvailability] = useState(false);
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [loadingCommodities, setLoadingCommodities] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const [qrDownloading, setQrDownloading] = useState(false);
  const [gatePassDownloading, setGatePassDownloading] = useState(false);
  const [booking, setBooking] = useState(getInitialBooking(null));

  const currentDate = new Date();
  const [calendarYear] = useState(currentDate.getFullYear());
  const [calendarMonth] = useState(currentDate.getMonth());
  const calendar = useMemo(() => getMonthDays(calendarYear, calendarMonth), [calendarYear, calendarMonth]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const updateBooking = (updates) => setBooking((prev) => ({ ...prev, ...updates }));

  // Retrieve user location for Nearby filtering
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoordinates({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Fallback or permission denial handled gracefully
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const fetchCentres = async () => {
    try {
      setLoadingCentres(true);
      const res = await fetch("/api/procurement/centres", { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to load procurement centres");
      setProcurementCentres(Array.isArray(result.data) ? result.data : Array.isArray(result.centres) ? result.centres : []);
    } catch (err) {
      console.error("Failed to fetch centres:", err);
      showToast(err.message || "Unable to load procurement centres");
    } finally { setLoadingCentres(false); }
  };

  const fetchCommodities = async () => {
    try {
      setLoadingCommodities(true);
      const res = await fetch("/api/procurement/commodities", { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to load commodities");
      setCommodities(Array.isArray(result.data) ? result.data : Array.isArray(result.commodities) ? result.commodities : []);
    } catch (err) {
      console.error("Failed to fetch commodities:", err);
      showToast(err.message || "Unable to load commodities");
    } finally { setLoadingCommodities(false); }
  };

  const fetchSlots = async ({ centreId, commodityId, date }) => {
    if (!centreId || !commodityId || !date) return setTimeSlots([]);
    try {
      setLoadingSlots(true);
      const params = new URLSearchParams({ centreId: String(centreId), commodityId: String(commodityId), date: String(date) });
      const res = await fetch(`/api/procurement/slots?${params}`, { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to load available slots");
      const slots = Array.isArray(result.data) ? result.data : Array.isArray(result.slots) ? result.slots : [];
      setTimeSlots(slots.map((s) => ({
        ...s,
        remaining: Number.isFinite(Number(s.remaining)) ? Number(s.remaining) : Math.max(0, Number(s.capacity || 0) - Number(s.bookedCount || 0)),
      })));
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setTimeSlots([]);
      showToast(err.message || "Unable to load available slots");
    } finally { setLoadingSlots(false); }
  };

  const fetchMonthAvailability = async ({ centreId, commodityId }) => {
    if (!centreId || !commodityId) return setDateAvailability({});
    try {
      setLoadingDateAvailability(true);
      const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const dates = [];
      for (let day = 1; day <= calendar.days.length; day++) {
        const date = new Date(calendarYear, calendarMonth, day);
        if (date >= todayStart) dates.push(formatDateForApi(date));
      }

      const results = await Promise.all(dates.map(async (date) => {
        try {
          const params = new URLSearchParams({ centreId: String(centreId), commodityId: String(commodityId), date });
          const res = await fetch(`/api/procurement/slots?${params}`, { cache: "no-store" });
          if (!res.ok) return { date, type: "none" };
          const result = await res.json();
          if (!result.success) return { date, type: "none" };

          const rawSlots = Array.isArray(result.data) ? result.data : Array.isArray(result.slots) ? result.slots : [];
          const slots = rawSlots.map((s) => ({
            ...s,
            remaining: Number.isFinite(Number(s.remaining)) ? Number(s.remaining) : Math.max(0, Number(s.capacity || 0) - Number(s.bookedCount || 0)),
          }));
          if (slots.length === 0) return { date, type: "none" };

          const available = slots.filter((s) => s.status !== "FULL" && s.status !== "CLOSED" && s.status !== "COMPLETED" && s.isActive !== false && Number(s.remaining) > 0);
          return available.length > 0
            ? { date, type: "available", totalSlots: slots.length, availableSlots: available.length }
            : { date, type: "full", totalSlots: slots.length, availableSlots: 0 };
        } catch (err) {
          console.error(`Failed to check ${date}:`, err);
          return { date, type: "none" };
        }
      }));

      const map = {};
      results.forEach((item) => { map[item.date] = item; });
      setDateAvailability(map);
    } catch (err) {
      console.error("Failed to fetch month availability:", err);
      setDateAvailability({});
    } finally { setLoadingDateAvailability(false); }
  };

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetchCentres();
    fetchCommodities();
    updateBooking({ farmerId: session?.user?.id || "", farmerName: session?.user?.name || "", farmerPhone: session?.user?.mobile || "" });
  }, [sessionStatus, session?.user?.id, session?.user?.name, session?.user?.mobile]);

  useEffect(() => {
    if (!booking.centreId || !booking.commodityId || !booking.selectedDate) return setTimeSlots([]);
    fetchSlots({ centreId: booking.centreId, commodityId: booking.commodityId, date: booking.selectedDate });
  }, [booking.centreId, booking.commodityId, booking.selectedDate]);

  useEffect(() => {
    if (!booking.centreId || !booking.commodityId) return setDateAvailability({});
    fetchMonthAvailability({ centreId: booking.centreId, commodityId: booking.commodityId });
  }, [booking.centreId, booking.commodityId, calendarYear, calendarMonth]);

  const selectedCentre = useMemo(() => procurementCentres.find((c) => String(c._id) === String(booking.centreId)) || null, [procurementCentres, booking.centreId]);
  const selectedCommodity = useMemo(() => commodities.find((c) => String(c._id) === String(booking.commodityId)) || null, [commodities, booking.commodityId]);
  const selectedSlot = useMemo(() => timeSlots.find((s) => String(s._id) === String(booking.slotId)) || null, [timeSlots, booking.slotId]);
  const selectedVehicle = useMemo(() => VEHICLE_TYPES.find((v) => v.id === booking.vehicleType) || VEHICLE_TYPES[1], [booking.vehicleType]);

  // Enhanced Centres Filtering (All, Nearby, Open, Closed)
  const filteredCentres = useMemo(() => {
    const s = centreSearch.toLowerCase().trim();

    let list = procurementCentres.map((centre) => {
      let distanceKm = null;

      if (userCoordinates && centre.latitude && centre.longitude) {
        distanceKm = getDistanceFromLatLonInKm(
          userCoordinates.latitude,
          userCoordinates.longitude,
          Number(centre.latitude),
          Number(centre.longitude)
        );
      } else if (userCoordinates && centre.coordinates?.length === 2) {
        distanceKm = getDistanceFromLatLonInKm(
          userCoordinates.latitude,
          userCoordinates.longitude,
          Number(centre.coordinates[1]),
          Number(centre.coordinates[0])
        );
      }

      return {
        ...centre,
        calculatedDistance: distanceKm !== null ? Number(distanceKm.toFixed(1)) : null,
      };
    });

    // 1. Text Search Filter
    if (s) {
      list = list.filter((centre) =>
        [centre.name, centre.address?.village, centre.address?.district, centre.address?.state, centre.address?.pincode].some(
          (f) => f?.toLowerCase().includes(s)
        )
      );
    }

    // 2. Status / Nearby Filter
    if (centreFilter === "open") {
      list = list.filter((c) => c.status === "ACTIVE");
    } else if (centreFilter === "closed") {
      list = list.filter((c) => c.status !== "ACTIVE");
    } else if (centreFilter === "nearby") {
      // Sort by closest distance if geo coordinates exist, else match district/pincode
      list = [...list].sort((a, b) => {
        if (a.calculatedDistance !== null && b.calculatedDistance !== null) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        if (a.calculatedDistance !== null) return -1;
        if (b.calculatedDistance !== null) return 1;
        return 0;
      });
    }

    return list;
  }, [procurementCentres, centreSearch, centreFilter, userCoordinates]);

  const changeQuantity = (amount) => updateBooking({ quantity: Math.max(1, Number(booking.quantity) + amount) });
  const isPastDate = (day) => new Date(calendarYear, calendarMonth, day) < new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const selectCalendarDay = (day) => {
    if (isPastDate(day)) return;
    const dateString = formatDateForApi(new Date(calendarYear, calendarMonth, day));
    const availability = dateAvailability[dateString];
    if (availability?.type !== "available") {
      return showToast(availability?.type === "full" ? "All slots are full for this date." : "No procurement slots are available for this date.");
    }
    updateBooking({ selectedDate: dateString, slotId: "" });
  };

  const validateStep = () => {
    if (activeStep === 1 && !booking.centreId) return showToast("Please select a procurement centre."), false;
    if (activeStep === 2) {
      if (!booking.commodityId) return showToast("Please select a commodity."), false;
      if (!booking.quantity || Number(booking.quantity) < 1) return showToast("Please enter a valid quantity."), false;
    }
    if (activeStep === 3) {
      if (!booking.selectedDate) return showToast("Please select an arrival date."), false;
      if (!booking.slotId) return showToast("Please select a time slot."), false;
    }
    if (activeStep === 4) {
      if (!booking.vehicleType) return showToast("Please select a vehicle type."), false;
      if (!booking.vehicleNumber.trim()) return showToast("Please enter the vehicle registration number."), false;
    }
    if (activeStep === 5 && !booking.confirmedConsent) return showToast("Please confirm the booking declaration."), false;
    return true;
  };

  const createBooking = async () => {
    try {
      setBookingLoading(true);
      const res = await fetch("/api/procurement/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centreId: booking.centreId, slotId: booking.slotId, commodityId: booking.commodityId,
          expectedQuantity: Number(booking.quantity), vehicleType: booking.vehicleType,
          vehicleNumber: booking.vehicleNumber.trim().toUpperCase(),
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to create booking");
      const data = result.data || result.booking;
      if (!data) throw new Error("Booking was created but no booking data was returned.");

      setGeneratedToken(data.tokenNumber || "");
      setCreatedBooking(data);
      setShowSuccess(true);
      await fetchSlots({ centreId: booking.centreId, commodityId: booking.commodityId, date: booking.selectedDate });
      await fetchMonthAvailability({ centreId: booking.centreId, commodityId: booking.commodityId });
    } catch (err) {
      console.error("Booking creation failed:", err);
      showToast(err.message || "Unable to create procurement booking");
    } finally { setBookingLoading(false); }
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (activeStep < 5) return setActiveStep((prev) => prev + 1);
    await createBooking();
  };

  const handleBack = () => setActiveStep((prev) => Math.max(1, prev - 1));

  const downloadGatePass = () => {
    if (!createdBooking) return showToast("Booking information is unavailable.");
    try {
      setGatePassDownloading(true);
      const content = `AGRINEX PROCUREMENT GATE PASS\n================================\nBooking ID:\n${createdBooking.bookingId || "N/A"}\nToken Number:\n${createdBooking.tokenNumber || "N/A"}\nFarmer:\n${createdBooking.farmer?.name || booking.farmerName || "N/A"}\nFarmer ID:\n${createdBooking.farmer?.id || booking.farmerId || "N/A"}\nMobile:\n${createdBooking.farmer?.mobile || booking.farmerPhone || "N/A"}\nProcurement Centre:\n${createdBooking.centre?.name || selectedCentre?.name || "N/A"}\nCentre ID:\n${createdBooking.centre?.centreId || "N/A"}\nCommodity:\n${createdBooking.commodity?.name || selectedCommodity?.name || "N/A"}\nQuantity:\n${booking.quantity} Q\nDate:\n${formatDateDisplay(booking.selectedDate)}\nTime:\n${selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "N/A"}\nVehicle:\n${selectedVehicle.label}\nVehicle Number:\n${booking.vehicleNumber || "N/A"}\nQueue Position:\n${createdBooking.queuePosition || "N/A"}\nEstimated Wait:\n${createdBooking.estimatedWaitMin || 0} minutes\nStatus:\n${createdBooking.status || "CONFIRMED"}\n================================\nAGRINEX\nProcurement Reservation\n`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `AGRINEX-${createdBooking.bookingId || "BOOKING"}-GatePass.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showToast("Gate pass downloaded.");
    } catch (error) {
      console.error("Gate pass download failed:", error);
      showToast("Unable to download gate pass.");
    } finally { setGatePassDownloading(false); }
  };

  const downloadQRCode = async () => {
    if (!createdBooking) return showToast("Booking information is unavailable.");
    try {
      setQrDownloading(true);
      const qrPayload = JSON.stringify({
        type: "AGRINEX_PROCUREMENT_GATE_PASS", bookingId: createdBooking.bookingId || "",
        tokenNumber: createdBooking.tokenNumber || "", farmerId: createdBooking.farmer?.id || booking.farmerId || "",
        centreId: createdBooking.centre?.centreId || "", status: createdBooking.status || "CONFIRMED",
      });
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=600x600&format=png&data=${encodeURIComponent(qrPayload)}`);
      if (!response.ok) throw new Error("QR generation failed");
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `AGRINEX-${createdBooking.bookingId || "BOOKING"}-QR.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
      showToast("QR code downloaded.");
    } catch (error) {
      console.error("QR download failed:", error);
      showToast("Unable to download QR code. Please try again.");
    } finally { setQrDownloading(false); }
  };

  const handleRebook = () => {
    setShowSuccess(false); setCreatedBooking(null); setGeneratedToken(""); setTimeSlots([]);
    setDateAvailability({}); setCentreSearch(""); setCentreFilter("all");
    setBooking(getInitialBooking(session)); setActiveStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMyBookings = () => { setShowSuccess(false); router.push("/farmer/my-bookings"); };

  if (sessionStatus === "loading") {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading farmer account...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
          <h2 className="text-base font-black text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="text-xs text-slate-500 mt-1">Please sign in as a farmer to book a procurement slot.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100/60 to-emerald-50/25 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950 flex flex-col justify-center items-center p-3 sm:p-5 select-none antialiased">

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-5xl h-full max-h-[82vh] flex flex-col min-h-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-emerald-950/5 dark:shadow-black/50 overflow-hidden relative">

        {/* TOP MULTI-GRADIENT ACCENT BAR */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 overflow-hidden">

          <header className="shrink-0 flex flex-col gap-3 pb-3.5 border-b border-slate-200/80 dark:border-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <Leaf className="h-5 w-5" />
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

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 text-xs shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                  APMC Portal Active
                </span>
              </div>
            </div>

            {/* PROGRESS STEP BAR */}
            <div className="relative flex items-center justify-between px-3 sm:px-6 py-2 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="absolute left-7 right-7 top-1/2 h-[2px] -translate-y-1/2 bg-slate-200 dark:bg-slate-800" />
              <motion.div
                className="absolute left-7 top-1/2 h-[2px] -translate-y-1/2 bg-emerald-500"
                initial={false}
                animate={{ width: `${((activeStep - 1) / 4) * 87}%` }}
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
                    className="relative z-10 flex items-center gap-2 bg-transparent disabled:cursor-default group"
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 ${active
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-105 ring-4 ring-emerald-500/15"
                          : completed
                            ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                        }`}
                    >
                      {completed ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>

                    <span
                      className={`hidden md:inline-block text-[11px] font-bold tracking-wide uppercase ${active ? "text-emerald-600 dark:text-emerald-400" : completed ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
                        }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </header>

          <div className="flex-1 min-h-0 pt-3 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 hover:scrollbar-thumb-emerald-500">
              <AnimatePresence mode="wait">

                {/* STEP 1: CENTRE SELECTION WITH ALL / NEARBY / OPEN / CLOSED */}
                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          value={centreSearch}
                          onChange={(e) => setCentreSearch(e.target.value)}
                          placeholder="Search centre, village, district or pincode..."
                          className="w-full h-9 pl-9 pr-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                      </div>

                      {/* FILTERS: ALL / NEARBY / OPEN / CLOSED */}
                      <div className="flex gap-1.5 shrink-0">
                        {CENTRE_FILTERS.map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setCentreFilter(mode.id)}
                            className={`px-3.5 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${centreFilter === mode.id
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                                : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 text-slate-500 hover:border-emerald-400 hover:text-slate-800 dark:hover:text-slate-200"
                              }`}
                          >
                            {mode.id === "nearby" && <Navigation className="h-3 w-3 shrink-0" />}
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {loadingCentres ? (
                      <div className="flex-1 flex items-center justify-center py-10">
                        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                      </div>
                    ) : filteredCentres.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-center p-6">
                        <div>
                          <MapPin className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                          <p className="text-xs font-bold text-slate-500 mt-2">
                            {centreFilter === "nearby"
                              ? "No nearby procurement centres found. Try searching by pincode or select 'All'."
                              : "No procurement centres found."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-2">
                        {filteredCentres.map((centre) => {
                          const selected = String(booking.centreId) === String(centre._id);
                          const isOpen = centre.status === "ACTIVE";

                          return (
                            <button
                              key={centre._id}
                              type="button"
                              onClick={() => updateBooking({ centreId: centre._id, commodityId: "", selectedDate: "", slotId: "" })}
                              className={`group text-left p-3.5 rounded-2xl border transition-all ${selected
                                  ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                                  : "bg-white/90 dark:bg-slate-800/50 border-slate-200/90 dark:border-white/5 hover:border-emerald-400 hover:shadow-sm"
                                }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                      {centre.name}
                                    </p>
                                    {centre.calculatedDistance !== null && (
                                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                                        {centre.calculatedDistance} km
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                                    {centre.address?.village || "Village"}, {centre.address?.district || "District"}
                                  </p>
                                  <p className="text-[9px] text-slate-400 mt-0.5">
                                    {centre.address?.state || "State"}
                                  </p>
                                </div>
                                {selected && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 text-[9px]">
                                <span className={`flex items-center gap-1 font-bold ${isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-rose-500"}`} />
                                  {isOpen ? "Open" : "Closed"}
                                </span>
                                <span className="text-slate-400 font-mono">
                                  {centre.address?.pincode || "—"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: COMMODITY & QUANTITY */}
                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col justify-between gap-3"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-2">
                        Select Commodity
                      </p>

                      {loadingCommodities ? (
                        <div className="flex justify-center py-10">
                          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        </div>
                      ) : commodities.length === 0 ? (
                        <div className="text-center py-10">
                          <Wheat className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="text-xs text-slate-500 mt-2">No active commodities available.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {commodities.map((commodity) => {
                            const selected = String(booking.commodityId) === String(commodity._id);
                            return (
                              <div
                                key={commodity._id}
                                onClick={() => updateBooking({ commodityId: commodity._id, slotId: "", selectedDate: "" })}
                                className={`cursor-pointer p-3.5 rounded-2xl border text-center transition-all ${selected
                                    ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                                    : "bg-white/90 dark:bg-slate-800/50 border-slate-200/90 dark:border-white/5 hover:border-emerald-400 hover:shadow-sm"
                                  }`}
                              >
                                <span className="text-2xl block mb-1">🌾</span>
                                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                  {commodity.name}
                                </p>
                                <p className="text-[9px] text-slate-400 mt-0.5">
                                  {commodity.code} • {commodity.unit}
                                </p>
                                {commodity.minimumSupportPrice > 0 && (
                                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                                    MSP ₹{commodity.minimumSupportPrice}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-slate-800/40 p-3.5">
                      <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-2">
                        Expected Quantity
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeQuantity(-1)}
                            className="h-8 w-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/5 text-sm font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition"
                          >
                            −
                          </button>

                          <div className="min-w-[70px] text-center">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              {booking.quantity}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 ml-1">Q</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => changeQuantity(1)}
                            className="h-8 w-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/5 text-sm font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {[10, 25, 50, 100].map((quantity) => (
                            <button
                              key={quantity}
                              type="button"
                              onClick={() => updateBooking({ quantity })}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${Number(booking.quantity) === quantity
                                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                                  : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:border-emerald-400"
                                }`}
                            >
                              {quantity} Q
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Gross weight will be logged at the yard weighbridge with auto-receipting.</span>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: SCHEDULE / CALENDAR */}
                {activeStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col gap-3"
                  >
                    {!booking.centreId || !booking.commodityId ? (
                      <div className="flex-1 flex items-center justify-center text-center p-6">
                        <div>
                          <CalendarIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                          <p className="text-xs font-bold text-slate-500 mt-2">Select a centre and commodity first.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-800/40 p-3.5">
                          {loadingDateAvailability && (
                            <div className="flex items-center justify-center gap-2 py-1.5 text-[10px] text-slate-400">
                              <span className="h-2.5 w-2.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                              Checking slot availability...
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {new Date(calendarYear, calendarMonth, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                            </span>

                            <div className="flex flex-wrap items-center gap-2.5 text-[9px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-amber-500" /> Full
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Unavailable
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center">
                            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                              <span key={day} className="text-[9px] font-bold text-slate-400 uppercase py-0.5">
                                {day}
                              </span>
                            ))}

                            {Array.from({ length: calendar.startingDay }, (_, i) => (
                              <span key={`empty-${i}`} />
                            ))}

                            {calendar.days.map((day) => {
                              const date = new Date(calendarYear, calendarMonth, day);
                              const dateString = formatDateForApi(date);
                              const selected = booking.selectedDate === dateString;
                              const past = isPastDate(day);
                              const availability = dateAvailability[dateString];
                              const isAvailable = availability?.type === "available";
                              const isFull = availability?.type === "full";
                              const selectable = !past && isAvailable;

                              return (
                                <button
                                  key={day}
                                  type="button"
                                  disabled={!selectable}
                                  onClick={() => selectCalendarDay(day)}
                                  title={
                                    past
                                      ? "Previous date"
                                      : isAvailable
                                        ? `${availability.availableSlots} slot${availability.availableSlots !== 1 ? "s" : ""} available`
                                        : isFull
                                          ? "All slots are full"
                                          : "No procurement slots available"
                                  }
                                  className={`relative h-9 rounded-xl text-[10px] font-bold transition-all border ${selected
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 scale-[1.03]"
                                      : past
                                        ? "bg-slate-100/60 dark:bg-slate-900/40 border-transparent text-slate-300 dark:text-slate-700 opacity-50 cursor-not-allowed"
                                        : isAvailable
                                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-400 cursor-pointer"
                                          : isFull
                                            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 cursor-not-allowed"
                                            : "bg-slate-100/70 dark:bg-slate-800/50 border-slate-200/50 dark:border-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                    }`}
                                >
                                  {day}
                                  {!past && !selected && (
                                    <span
                                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${isAvailable ? "bg-emerald-500" : isFull ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
                                        }`}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {booking.selectedDate && (
                            <div className="mt-2.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              Selected: {formatDateDisplay(booking.selectedDate)}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                            Arrival Window
                          </p>

                          {!booking.selectedDate ? (
                            <div className="p-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                              <CalendarIcon className="mx-auto h-6 w-6 text-slate-300" />
                              <p className="text-[10px] text-slate-500 mt-1">Select a date to view available slots.</p>
                            </div>
                          ) : loadingSlots ? (
                            <div className="flex justify-center py-6">
                              <div className="h-7 w-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                            </div>
                          ) : timeSlots.length === 0 ? (
                            <div className="p-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                              <Clock className="mx-auto h-6 w-6 text-slate-300" />
                              <p className="text-[10px] text-slate-500 mt-1">No slots available for this date.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {timeSlots.map((slot) => {
                                const selected = String(booking.slotId) === String(slot._id);
                                const full = slot.status === "FULL" || slot.status === "CLOSED" || slot.status === "COMPLETED" || slot.remaining <= 0;

                                return (
                                  <button
                                    key={slot._id}
                                    type="button"
                                    disabled={full}
                                    onClick={() => updateBooking({ slotId: slot._id })}
                                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${selected
                                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                                        : full
                                          ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-transparent"
                                          : "bg-white/90 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-emerald-400"
                                      }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-black text-[11px]">
                                        {slot.startTime} – {slot.endTime}
                                      </span>
                                      {selected && <Check className="h-3 w-3 text-emerald-600 shrink-0" />}
                                    </div>
                                    <span
                                      className={`text-[9px] font-semibold mt-0.5 block ${full ? "text-rose-500" : slot.remaining <= 3 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"
                                        }`}
                                    >
                                      {full ? "Full" : `${slot.remaining} available`}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: TRANSPORT & VEHICLE */}
                {activeStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          {booking.farmerName?.slice(0, 2).toUpperCase() || "FR"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {booking.farmerName}
                            </span>
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {booking.farmerId}</p>
                          {booking.farmerPhone && <p className="text-[10px] text-slate-400">{booking.farmerPhone}</p>}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Verified Session
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-2">
                        Transport Type
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {VEHICLE_TYPES.map((vehicle) => {
                          const selected = booking.vehicleType === vehicle.id;
                          const Icon = vehicle.icon;

                          return (
                            <button
                              key={vehicle.id}
                              type="button"
                              onClick={() => updateBooking({ vehicleType: vehicle.id })}
                              className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${selected
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                                  : "bg-white/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-emerald-400"
                                }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{vehicle.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                        Vehicle License Number
                      </p>

                      <div className="relative">
                        <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          value={booking.vehicleNumber}
                          onChange={(e) => updateBooking({ vehicleNumber: e.target.value.toUpperCase() })}
                          placeholder="AS-01-AB-1234"
                          className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs font-mono font-bold tracking-wider outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300">
                      <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Vehicle information will be linked to your procurement booking for gate verification.</span>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: REVIEW & CONFIRM */}
                {activeStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col justify-between gap-3"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <SummaryTile icon={MapPin} label="Centre" value={selectedCentre?.name || "Not selected"} />
                      <SummaryTile icon={Wheat} label="Crop" value={selectedCommodity ? `${selectedCommodity.name} (${booking.quantity} Q)` : "Not selected"} />
                      <SummaryTile icon={CalendarIcon} label="Date" value={formatDateDisplay(booking.selectedDate)} />
                      <SummaryTile icon={Clock} label="Window" value={selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : "Not selected"} />
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-800/40 text-xs space-y-2">
                      <div className="flex justify-between gap-3 text-slate-500 dark:text-slate-400">
                        <span>Farmer Account</span>
                        <span className="font-bold text-slate-800 dark:text-white text-right">
                          {booking.farmerName}<br />
                          <span className="text-[10px] font-mono text-slate-400">{booking.farmerId}</span>
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-500 dark:text-slate-400">
                        <span>Vehicle Details</span>
                        <span className="font-bold text-slate-800 dark:text-white text-right">
                          {selectedVehicle.label} • {booking.vehicleNumber}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-500 dark:text-slate-400">
                        <span>Quantity</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {booking.quantity} Q
                        </span>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-800/40 cursor-pointer hover:border-emerald-400 transition">
                      <input
                        type="checkbox"
                        checked={booking.confirmedConsent}
                        onChange={(e) => updateBooking({ confirmedConsent: e.target.checked })}
                        className="mt-0.5 accent-emerald-600 rounded"
                      />
                      <span className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        I confirm that the above procurement booking details are correct and I agree to arrive at the selected centre during the allotted time window.
                      </span>
                    </label>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          <footer className="shrink-0 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 1 || bookingLoading}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={bookingLoading}
              className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/25 disabled:opacity-50 transition active:scale-95"
            >
              {bookingLoading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating...
                </>
              ) : activeStep === 5 ? (
                <>
                  Confirm Booking <Check className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </footer>

        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 overflow-hidden scrollbar-none"
            >
              <div className="text-center">
                <div className="mx-auto h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-1.5">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Booking Confirmed</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Your procurement slot has been reserved.</p>
              </div>

              <div className="mt-2.5 p-2.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-[8px] uppercase tracking-widest font-black text-slate-400">Token Number</p>
                <p className="mt-0.5 font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {generatedToken || "—"}
                </p>
                <div className="mt-1.5 flex justify-center">
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-inner">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                </div>
                <p className="mt-1 text-[8px] text-slate-400">Present this QR at the procurement gate.</p>
              </div>

              {createdBooking && (
                <div className="mt-2.5 p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 space-y-1">
                  <DetailRow label="Booking ID" value={createdBooking.bookingId || "—"} mono />
                  <DetailRow label="Queue Position" value={createdBooking.queuePosition ? `#${createdBooking.queuePosition}` : "N/A"} />
                  <DetailRow label="Estimated Wait" value={`${createdBooking.estimatedWaitMin || 0} min`} />
                  <DetailRow label="Centre" value={createdBooking.centre?.name || selectedCentre?.name || "—"} />
                  <DetailRow label="Crop" value={createdBooking.commodity?.name || selectedCommodity?.name || "—"} />
                  <DetailRow label="Quantity" value={`${booking.quantity} Q`} />
                  <DetailRow label="Date" value={formatDateDisplay(booking.selectedDate)} />
                  <DetailRow label="Time Slot" value={selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : "—"} />
                  <DetailRow label="Vehicle" value={`${selectedVehicle.label} • ${booking.vehicleNumber}`} />
                  <div className="pt-1.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400">Status</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[8px] font-black text-emerald-600 dark:text-emerald-400">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      {createdBooking.status || "CONFIRMED"}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={downloadQRCode}
                disabled={qrDownloading}
                className="mt-2.5 w-full h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition active:scale-95"
              >
                {qrDownloading ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating QR...
                  </>
                ) : (
                  <>
                    <QrCode className="h-3.5 w-3.5" /> Download QR Code
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={downloadGatePass}
                disabled={gatePassDownloading}
                className="mt-1.5 w-full h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition active:scale-95"
              >
                {gatePassDownloading ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3" /> Download Gate Pass
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleRebook}
                  className="h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-400/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <CalendarIcon className="h-3 w-3" /> Rebook
                </button>
                <button
                  type="button"
                  onClick={handleMyBookings}
                  className="h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95"
                >
                  My Bookings <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[500] px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className={`max-w-[220px] text-[10px] font-bold text-right text-slate-800 dark:text-white ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

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