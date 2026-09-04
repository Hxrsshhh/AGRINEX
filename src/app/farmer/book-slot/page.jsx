"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Truck,
  Download,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Info,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ShieldCheck,
  Wheat,
  BadgeCheck,
  Leaf,
  Tractor,
  Phone,
  Mail,
  Building2,
} from "lucide-react";

/* ============================================================
   VEHICLE TYPES
============================================================ */

const VEHICLE_TYPES = [
  { id: "TRACTOR", label: "Tractor", icon: Tractor },
  { id: "TRACTOR_TROLLEY", label: "Tractor + Trolley", icon: Truck },
  { id: "MINI_TRUCK", label: "Mini Truck", icon: Truck },
  { id: "TRUCK", label: "Truck", icon: Truck },
];

/* ============================================================
   BOOKING STEPS (5 STEPS: CENTRE FIRST)
============================================================ */

const STEPS = [
  { number: 1, label: "Centre", icon: Building2 },
  { number: 2, label: "Produce", icon: Wheat },
  { number: 3, label: "Schedule", icon: CalendarIcon },
  { number: 4, label: "Details", icon: Truck },
  { number: 5, label: "Review", icon: CheckCircle2 },
];

/* ============================================================
   HELPERS
============================================================ */

const formatDateForApi = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

function formatDateDisplay(dateString) {
  if (!dateString) return "Not selected";
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "Not selected"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  return {
    startingDay: (firstDay.getDay() + 6) % 7,
    days: Array.from({ length: totalDays }, (_, i) => i + 1),
  };
}

/* ============================================================
   INITIAL BOOKING
============================================================ */

const getInitialBooking = (session) => ({
  centreId: "",
  commodityId: "",
  quantity: 25,
  selectedDate: "",
  slotId: "",
  farmerName: session?.user?.name || "",
  farmerId: session?.user?.id || "",
  farmerLocation: "",
  farmerPhone: session?.user?.mobile || "",
  vehicleType: "TRACTOR_TROLLEY",
  vehicleNumber: "",
  confirmedConsent: false,
});

/* ============================================================
   PAGE
============================================================ */

export default function BookingPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(1);
  const [procurementCentres, setProcurementCentres] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [dateAvailability, setDateAvailability] = useState({});

  const [loadingCentres, setLoadingCentres] = useState(false);
  const [loadingCommodities, setLoadingCommodities] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDateAvailability, setLoadingDateAvailability] = useState(false);
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

  const calendar = useMemo(
    () => getMonthDays(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  );

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const updateBooking = (updates) => {
    setBooking((prev) => ({ ...prev, ...updates }));
  };

  const fetchFarmerProfile = async () => {
    try {
      setLoadingCentres(true);
      const res = await fetch("/api/farmer/profile", { cache: "no-store" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load farmer profile");
      }

      const farmer = result.farmer || result.data || null;
      const preferredCentre = farmer?.preferredCentre || null;

      if (!preferredCentre || !preferredCentre._id) {
        setProcurementCentres([]);
        updateBooking({ centreId: "" });
        throw new Error(
          "Your preferred procurement centre is not assigned. Please contact your centre officer or administrator."
        );
      }

      setProcurementCentres([preferredCentre]);
      updateBooking({
        farmerId: farmer?._id || session?.user?.id || "",
        farmerName: farmer?.name || session?.user?.name || "",
        farmerPhone: farmer?.mobile || session?.user?.mobile || "",
        farmerLocation: farmer?.farmLocation
          ? [
              farmer.farmLocation.village,
              farmer.farmLocation.district,
              farmer.farmLocation.state,
            ]
              .filter(Boolean)
              .join(", ")
          : "",
        centreId: preferredCentre._id,
      });

      return preferredCentre;
    } catch (error) {
      console.error("Failed to fetch farmer profile:", error);
      showToast(error.message || "Unable to load your preferred procurement centre");
      return null;
    } finally {
      setLoadingCentres(false);
    }
  };

  const fetchCommodities = async () => {
    try {
      setLoadingCommodities(true);
      const res = await fetch("/api/procurement/commodities", { cache: "no-store" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load commodities");
      }

      setCommodities(
        Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.commodities)
          ? result.commodities
          : []
      );
    } catch (error) {
      console.error("Failed to fetch commodities:", error);
      showToast(error.message || "Unable to load commodities");
    } finally {
      setLoadingCommodities(false);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    let cancelled = false;

    const initialise = async () => {
      updateBooking({
        farmerId: session?.user?.id || "",
        farmerName: session?.user?.name || "",
        farmerPhone: session?.user?.mobile || "",
      });

      const preferredCentre = await fetchFarmerProfile();
      if (cancelled || !preferredCentre) return;
    };

    initialise();
    fetchCommodities();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, session?.user?.id, session?.user?.name, session?.user?.mobile]);

  const selectedCentre = useMemo(
    () =>
      procurementCentres.find(
        (centre) => String(centre._id) === String(booking.centreId)
      ) || null,
    [procurementCentres, booking.centreId]
  );

  const selectedCommodity = useMemo(
    () =>
      commodities.find(
        (commodity) => String(commodity._id) === String(booking.commodityId)
      ) || null,
    [commodities, booking.commodityId]
  );

  const selectedSlot = useMemo(
    () =>
      timeSlots.find(
        (slot) => String(slot._id) === String(booking.slotId)
      ) || null,
    [timeSlots, booking.slotId]
  );

  const selectedVehicle = useMemo(
    () =>
      VEHICLE_TYPES.find((vehicle) => vehicle.id === booking.vehicleType) ||
      VEHICLE_TYPES[1],
    [booking.vehicleType]
  );

  const fetchSlots = async ({ centreId, commodityId, date }) => {
    if (!centreId || !commodityId || !date) {
      setTimeSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      const params = new URLSearchParams({
        centreId: String(centreId),
        commodityId: String(commodityId),
        date: String(date),
      });

      const res = await fetch(`/api/procurement/slots?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load available slots");
      }

      const slots = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.slots)
        ? result.slots
        : [];

      setTimeSlots(
        slots.map((slot) => ({
          ...slot,
          remaining: Number.isFinite(Number(slot.remaining))
            ? Number(slot.remaining)
            : Math.max(0, Number(slot.capacity || 0) - Number(slot.bookedCount || 0)),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setTimeSlots([]);
      showToast(error.message || "Unable to load slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchMonthAvailability = async ({ centreId, commodityId }) => {
    if (!centreId || !commodityId) {
      setDateAvailability({});
      return;
    }

    try {
      setLoadingDateAvailability(true);
      const todayStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      const dates = [];
      for (let day = 1; day <= calendar.days.length; day++) {
        const date = new Date(calendarYear, calendarMonth, day);
        if (date >= todayStart) {
          dates.push(formatDateForApi(date));
        }
      }

      const results = await Promise.all(
        dates.map(async (date) => {
          try {
            const params = new URLSearchParams({
              centreId: String(centreId),
              commodityId: String(commodityId),
              date,
            });

            const res = await fetch(`/api/procurement/slots?${params.toString()}`, {
              cache: "no-store",
            });
            if (!res.ok) return { date, type: "none" };

            const result = await res.json();
            if (!result.success) return { date, type: "none" };

            const rawSlots = Array.isArray(result.data)
              ? result.data
              : Array.isArray(result.slots)
              ? result.slots
              : [];

            const slots = rawSlots.map((slot) => ({
              ...slot,
              remaining: Number.isFinite(Number(slot.remaining))
                ? Number(slot.remaining)
                : Math.max(0, Number(slot.capacity || 0) - Number(slot.bookedCount || 0)),
            }));

            if (slots.length === 0) return { date, type: "none" };

            const available = slots.filter(
              (slot) =>
                slot.status !== "FULL" &&
                slot.status !== "CLOSED" &&
                slot.status !== "COMPLETED" &&
                slot.isActive !== false &&
                Number(slot.remaining) > 0
            );

            return available.length > 0
              ? {
                  date,
                  type: "available",
                  totalSlots: slots.length,
                  availableSlots: available.length,
                }
              : {
                  date,
                  type: "full",
                  totalSlots: slots.length,
                  availableSlots: 0,
                };
          } catch {
            return { date, type: "none" };
          }
        })
      );

      const map = {};
      results.forEach((item) => {
        map[item.date] = item;
      });

      setDateAvailability(map);
    } catch (error) {
      console.error("Month availability error:", error);
      setDateAvailability({});
    } finally {
      setLoadingDateAvailability(false);
    }
  };

  useEffect(() => {
    if (!booking.centreId || !booking.commodityId || !booking.selectedDate) {
      setTimeSlots([]);
      return;
    }

    fetchSlots({
      centreId: booking.centreId,
      commodityId: booking.commodityId,
      date: booking.selectedDate,
    });
  }, [booking.centreId, booking.commodityId, booking.selectedDate]);

  useEffect(() => {
    if (!booking.centreId || !booking.commodityId) {
      setDateAvailability({});
      return;
    }

    fetchMonthAvailability({
      centreId: booking.centreId,
      commodityId: booking.commodityId,
    });
  }, [booking.centreId, booking.commodityId, calendarYear, calendarMonth]);

  const changeQuantity = (amount) => {
    updateBooking({
      quantity: Math.max(1, Number(booking.quantity) + amount),
    });
  };

  const isPastDate = (day) =>
    new Date(calendarYear, calendarMonth, day) <
    new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const selectCalendarDay = (day) => {
    if (isPastDate(day)) return;

    const dateString = formatDateForApi(new Date(calendarYear, calendarMonth, day));
    const availability = dateAvailability[dateString];

    if (availability?.type !== "available") {
      return showToast(
        availability?.type === "full"
          ? "All slots are full for this date."
          : "No procurement slots are available for this date."
      );
    }

    updateBooking({ selectedDate: dateString, slotId: "" });
  };

  const validateStep = () => {
    // Step 1: Procurement Centre Verification
    if (activeStep === 1) {
      if (!booking.centreId) {
        showToast("Your assigned procurement centre is loading or unavailable.");
        return false;
      }
    }

    // Step 2: Produce
    if (activeStep === 2) {
      if (!booking.commodityId) {
        showToast("Please select a commodity.");
        return false;
      }
      if (!booking.quantity || Number(booking.quantity) < 1) {
        showToast("Please enter a valid quantity.");
        return false;
      }
    }

    // Step 3: Schedule
    if (activeStep === 3) {
      if (!booking.selectedDate) {
        showToast("Please select an arrival date.");
        return false;
      }
      if (!booking.slotId) {
        showToast("Please select a time slot.");
        return false;
      }
    }

    // Step 4: Details / Vehicle
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

    // Step 5: Review & Confirmation
    if (activeStep === 5 && !booking.confirmedConsent) {
      showToast("Please confirm the booking declaration.");
      return false;
    }

    return true;
  };

  const createBooking = async () => {
    try {
      setBookingLoading(true);

      if (!booking.centreId) {
        throw new Error("Your preferred procurement centre could not be determined.");
      }

      const res = await fetch("/api/procurement/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centreId: booking.centreId,
          slotId: booking.slotId,
          commodityId: booking.commodityId,
          expectedQuantity: Number(booking.quantity),
          vehicleType: booking.vehicleType,
          vehicleNumber: booking.vehicleNumber.trim().toUpperCase(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create booking");
      }

      const data = result.data || result.booking;
      if (!data) throw new Error("Booking was created but no data was returned.");

      setGeneratedToken(data.tokenNumber || "");
      setCreatedBooking(data);
      setShowSuccess(true);

      await fetchSlots({
        centreId: booking.centreId,
        commodityId: booking.commodityId,
        date: booking.selectedDate,
      });

      await fetchMonthAvailability({
        centreId: booking.centreId,
        commodityId: booking.commodityId,
      });
    } catch (error) {
      console.error("Booking creation failed:", error);
      showToast(error.message || "Unable to create procurement booking");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (activeStep < 5) {
      setActiveStep((prev) => prev + 1);
      return;
    }
    await createBooking();
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(1, prev - 1));
  };

  const downloadGatePass = () => {
    if (!createdBooking) return showToast("Booking information is unavailable.");

    try {
      setGatePassDownloading(true);
      const content = `AGRINEX PROCUREMENT GATE PASS
================================
Booking ID: ${createdBooking.bookingId || "N/A"}
Token Number: ${createdBooking.tokenNumber || "N/A"}
Farmer: ${createdBooking.farmer?.name || booking.farmerName || "N/A"}
Farmer ID: ${createdBooking.farmer?.id || booking.farmerId || "N/A"}
Mobile: ${createdBooking.farmer?.mobile || booking.farmerPhone || "N/A"}
Procurement Centre: ${createdBooking.centre?.name || selectedCentre?.name || "N/A"}
Centre ID: ${createdBooking.centre?.centreId || "N/A"}
Village: ${createdBooking.centre?.address?.village || selectedCentre?.address?.village || "N/A"}
District: ${createdBooking.centre?.address?.district || selectedCentre?.address?.district || "N/A"}
Commodity: ${createdBooking.commodity?.name || selectedCommodity?.name || "N/A"}
Quantity: ${booking.quantity} Q
Date: ${formatDateDisplay(booking.selectedDate)}
Time: ${selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "N/A"}
Vehicle: ${selectedVehicle.label}
Vehicle Number: ${booking.vehicleNumber || "N/A"}
Queue Position: ${createdBooking.queuePosition || "N/A"}
Estimated Wait: ${createdBooking.estimatedWaitMin || 0} minutes
Status: ${createdBooking.status || "CONFIRMED"}
================================
AGRINEX Procurement Reservation`;

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
    } finally {
      setGatePassDownloading(false);
    }
  };

  const downloadQRCode = async () => {
    if (!createdBooking) return showToast("Booking information is unavailable.");

    try {
      setQrDownloading(true);
      const qrPayload = JSON.stringify({
        type: "AGRINEX_PROCUREMENT_GATE_PASS",
        bookingId: createdBooking.bookingId || "",
        tokenNumber: createdBooking.tokenNumber || "",
        farmerId: createdBooking.farmer?.id || booking.farmerId || "",
        centreId: createdBooking.centre?.centreId || "",
        status: createdBooking.status || "CONFIRMED",
      });

      const response = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=600x600&format=png&data=${encodeURIComponent(
          qrPayload
        )}`
      );

      if (!response.ok) throw new Error("QR generation failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
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
    } finally {
      setQrDownloading(false);
    }
  };

  const handleRebook = () => {
    const currentCentreId = booking.centreId;
    setShowSuccess(false);
    setCreatedBooking(null);
    setGeneratedToken("");
    setTimeSlots([]);
    setDateAvailability({});

    setBooking({
      ...getInitialBooking(session),
      centreId: currentCentreId,
    });
    setActiveStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMyBookings = () => {
    setShowSuccess(false);
    router.push("/farmer/my-bookings");
  };

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
      <div className="w-full max-w-5xl h-full max-h-[82vh] flex flex-col min-h-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-emerald-950/5 dark:shadow-black/50 overflow-hidden relative">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 overflow-hidden">
          {/* HEADER: Strictly page title & 5-step progress (No top centre component on ANY page) */}
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
                    Reserve your verified procurement window without waiting at the centre.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                  APMC Portal Active
                </span>
              </div>
            </div>

            {/* 5-STEP PROGRESS BAR */}
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
                    className="relative z-10 flex items-center gap-2 bg-transparent disabled:cursor-default"
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 ${
                        active
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-105 ring-4 ring-emerald-500/15"
                          : completed
                          ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      {completed ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>

                    <span
                      className={`hidden md:inline-block text-[11px] font-bold tracking-wide uppercase ${
                        active
                          ? "text-emerald-600 dark:text-emerald-400"
                          : completed
                          ? "text-slate-700 dark:text-slate-300"
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

          {/* MAIN CONTENT CONTAINER */}
          <div className="flex-1 min-h-0 pt-3 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 hover:scrollbar-thumb-emerald-500">
              <AnimatePresence mode="wait">
                {/* =================================================
                    STEP 1 — PROCUREMENT CENTRE (READ-ONLY, NO CHANGE OPTION)
                ================================================= */}
                {activeStep === 1 && (
                  <motion.div
                    key="step-centre"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                          Step 1: Your Designated Procurement Centre
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          All scheduling and crop drop-offs are processed through your assigned APMC facility.
                        </p>
                      </div>

                      {selectedCentre ? (
                        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-5 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                                <Building2 className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400">
                                    Assigned Facility
                                  </span>
                                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                </div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                  {selectedCentre.name}
                                </h2>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  ID: {selectedCentre.centreId || "—"}
                                </p>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="h-3 w-3" />
                              VERIFIED & FIXED
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                            <CentreInfo icon={MapPin} label="Village" value={selectedCentre.address?.village || "—"} />
                            <CentreInfo icon={MapPin} label="District" value={selectedCentre.address?.district || "—"} />
                            <CentreInfo icon={MapPin} label="State" value={selectedCentre.address?.state || "—"} />
                            <CentreInfo icon={Phone} label="Contact" value={selectedCentre.contactNumber || "—"} />
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] text-slate-500 border-t border-emerald-500/10">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  selectedCentre.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              Facility Status: {selectedCentre.status === "ACTIVE" ? "Operational" : "Closed"}
                            </span>
                            {selectedCentre.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3 text-emerald-500" />
                                {selectedCentre.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : loadingCentres ? (
                        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-8 flex flex-col items-center justify-center gap-3">
                          <span className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                          <span className="text-xs font-semibold text-slate-500">
                            Retrieving your registered procurement centre...
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600 font-semibold">
                          No preferred centre assigned to your account. Please contact an APMC officer.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                      <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        This centre is locked to ensure proper queue management and local quota availability. Click <strong>Continue</strong> to configure your produce.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    STEP 2 — PRODUCE
                ================================================= */}
                {activeStep === 2 && (
                  <motion.div
                    key="step-produce"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                          Select Commodity
                        </p>
                      </div>

                      {loadingCommodities ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        </div>
                      ) : commodities.length === 0 ? (
                        <div className="text-center py-8">
                          <Wheat className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="text-xs text-slate-500 mt-2">No active commodities available.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {commodities.map((commodity) => {
                            const selected = String(booking.commodityId) === String(commodity._id);
                            return (
                              <button
                                key={commodity._id}
                                type="button"
                                onClick={() =>
                                  updateBooking({
                                    commodityId: commodity._id,
                                    selectedDate: "",
                                    slotId: "",
                                  })
                                }
                                className={`p-3 rounded-2xl border text-center transition-all ${
                                  selected
                                    ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                                    : "bg-white/90 dark:bg-slate-800/50 border-slate-200/90 dark:border-white/5 hover:border-emerald-400 hover:shadow-sm"
                                }`}
                              >
                                <span className="text-xl block mb-1">🌾</span>
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
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* QUANTITY */}
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
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                                Number(booking.quantity) === quantity
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
                      <span>
                        Gross weight will be recorded at the yard weighbridge with automatic receipting.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    STEP 3 — SCHEDULE
                ================================================= */}
                {activeStep === 3 && (
                  <motion.div
                    key="step-schedule"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col gap-3"
                  >
                    {!booking.commodityId ? (
                      <div className="flex-1 flex items-center justify-center text-center p-6">
                        <div>
                          <CalendarIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                          <p className="text-xs font-bold text-slate-500 mt-2">
                            Select a commodity first.
                          </p>
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
                              {new Date(calendarYear, calendarMonth, 1).toLocaleDateString("en-IN", {
                                month: "long",
                                year: "numeric",
                              })}
                            </span>

                            <div className="flex flex-wrap items-center gap-2.5 text-[9px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Available
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                Full
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                Unavailable
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
                                  className={`relative h-9 rounded-xl text-[10px] font-bold transition-all border ${
                                    selected
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
                                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                                        isAvailable
                                          ? "bg-emerald-500"
                                          : isFull
                                          ? "bg-amber-500"
                                          : "bg-slate-300 dark:bg-slate-600"
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

                        {/* TIME SLOTS */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                            Arrival Window
                          </p>

                          {!booking.selectedDate ? (
                            <div className="p-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                              <CalendarIcon className="mx-auto h-6 w-6 text-slate-300" />
                              <p className="text-[10px] text-slate-500 mt-1">
                                Select a date to view available slots.
                              </p>
                            </div>
                          ) : loadingSlots ? (
                            <div className="flex justify-center py-6">
                              <div className="h-7 w-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                            </div>
                          ) : timeSlots.length === 0 ? (
                            <div className="p-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                              <Clock className="mx-auto h-6 w-6 text-slate-300" />
                              <p className="text-[10px] text-slate-500 mt-1">
                                No slots available for this date.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {timeSlots.map((slot) => {
                                const selected = String(booking.slotId) === String(slot._id);
                                const full =
                                  slot.status === "FULL" ||
                                  slot.status === "CLOSED" ||
                                  slot.status === "COMPLETED" ||
                                  slot.remaining <= 0;

                                return (
                                  <button
                                    key={slot._id}
                                    type="button"
                                    disabled={full}
                                    onClick={() => updateBooking({ slotId: slot._id })}
                                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                                      selected
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
                                      className={`text-[9px] font-semibold mt-0.5 block ${
                                        full
                                          ? "text-rose-500"
                                          : slot.remaining <= 3
                                          ? "text-amber-500"
                                          : "text-emerald-600 dark:text-emerald-400"
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

                {/* =================================================
                    STEP 4 — DETAILS / VEHICLE
                ================================================= */}
                {activeStep === 4 && (
                  <motion.div
                    key="step-details"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col justify-between gap-3"
                  >
                    {/* FARMER SUMMARY */}
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
                          {booking.farmerPhone && (
                            <p className="text-[10px] text-slate-400">{booking.farmerPhone}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Verified
                      </span>
                    </div>

                    {/* VEHICLE TYPE */}
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
                              className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                                selected
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

                    {/* VEHICLE NUMBER */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                        Vehicle License Number
                      </p>
                      <div className="relative">
                        <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          value={booking.vehicleNumber}
                          onChange={(e) =>
                            updateBooking({ vehicleNumber: e.target.value.toUpperCase() })
                          }
                          placeholder="AS-01-AB-1234"
                          className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs font-mono font-bold tracking-wider outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300">
                      <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        Vehicle information will be linked to your procurement booking for gate verification.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    STEP 5 — COMPLETE REVIEW
                ================================================= */}
                {activeStep === 5 && (
                  <motion.div
                    key="step-review"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="h-full flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                          Complete Booking Details
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Review everything before confirming.
                        </p>
                      </div>

                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-600">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        READY TO CONFIRM
                      </span>
                    </div>

                    {/* CENTRE SUMMARY ONLY IN FINAL REVIEW */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400">
                            Procurement Centre
                          </p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {selectedCentre?.name || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <ReviewCard icon={BadgeCheck} title="Farmer">
                        <ReviewRow label="Name" value={booking.farmerName || "—"} />
                        <ReviewRow label="Farmer ID" value={booking.farmerId || "—"} />
                        <ReviewRow label="Mobile" value={booking.farmerPhone || "—"} />
                      </ReviewCard>

                      <ReviewCard icon={Wheat} title="Produce">
                        <ReviewRow label="Commodity" value={selectedCommodity?.name || "—"} />
                        <ReviewRow label="Code" value={selectedCommodity?.code || "—"} />
                        <ReviewRow label="Expected Quantity" value={`${booking.quantity} Q`} />
                        {selectedCommodity?.minimumSupportPrice > 0 && (
                          <ReviewRow label="MSP" value={`₹${selectedCommodity.minimumSupportPrice}`} />
                        )}
                      </ReviewCard>

                      <ReviewCard icon={CalendarIcon} title="Schedule">
                        <ReviewRow label="Date" value={formatDateDisplay(booking.selectedDate)} />
                        <ReviewRow
                          label="Time"
                          value={
                            selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : "—"
                          }
                        />
                        <ReviewRow label="Available Slots" value={selectedSlot?.remaining ?? "—"} />
                      </ReviewCard>

                      <ReviewCard icon={Truck} title="Vehicle">
                        <ReviewRow label="Type" value={selectedVehicle.label} />
                        <ReviewRow label="Registration" value={booking.vehicleNumber || "—"} />
                      </ReviewCard>
                    </div>

                    {/* CONSENT */}
                    <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-800/40 cursor-pointer hover:border-emerald-400 transition">
                      <input
                        type="checkbox"
                        checked={booking.confirmedConsent}
                        onChange={(e) => updateBooking({ confirmedConsent: e.target.checked })}
                        className="mt-0.5 accent-emerald-600 rounded"
                      />
                      <span className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        I confirm that all the above procurement booking details are correct and I agree to arrive at my preferred procurement centre during the allotted date and time window.
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="shrink-0 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 1 || bookingLoading}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={bookingLoading || !booking.centreId}
              className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/25 disabled:opacity-50 transition active:scale-95"
            >
              {bookingLoading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating...
                </>
              ) : activeStep === 5 ? (
                <>
                  Confirm Booking
                  <Check className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </footer>
        </div>
      </div>

      {/* SUCCESS MODAL */}
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
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Booking Confirmed
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Your procurement slot has been reserved.
                </p>
              </div>

              <div className="mt-2.5 p-2.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-[8px] uppercase tracking-widest font-black text-slate-400">
                  Token Number
                </p>
                <p className="mt-0.5 font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {generatedToken || "—"}
                </p>
                <div className="mt-1.5 flex justify-center">
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-inner">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                </div>
                <p className="mt-1 text-[8px] text-slate-400">
                  Present this QR at the procurement gate.
                </p>
              </div>

              {createdBooking && (
                <div className="mt-2.5 p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 space-y-1">
                  <DetailRow label="Booking ID" value={createdBooking.bookingId || "—"} mono />
                  <DetailRow
                    label="Queue Position"
                    value={createdBooking.queuePosition ? `#${createdBooking.queuePosition}` : "N/A"}
                  />
                  <DetailRow
                    label="Estimated Wait"
                    value={`${createdBooking.estimatedWaitMin || 0} min`}
                  />
                  <DetailRow
                    label="Procurement Centre"
                    value={createdBooking.centre?.name || selectedCentre?.name || "—"}
                  />
                  <DetailRow
                    label="Crop"
                    value={createdBooking.commodity?.name || selectedCommodity?.name || "—"}
                  />
                  <DetailRow label="Quantity" value={`${booking.quantity} Q`} />
                  <DetailRow label="Date" value={formatDateDisplay(booking.selectedDate)} />
                  <DetailRow
                    label="Time Slot"
                    value={
                      selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : "—"
                    }
                  />
                  <DetailRow
                    label="Vehicle"
                    value={`${selectedVehicle.label} • ${booking.vehicleNumber}`}
                  />
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
                    <QrCode className="h-3.5 w-3.5" />
                    Download QR Code
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
                    <Download className="h-3 w-3" />
                    Download Gate Pass
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleRebook}
                  className="h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-400/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <CalendarIcon className="h-3 w-3" />
                  Rebook
                </button>

                <button
                  type="button"
                  onClick={handleMyBookings}
                  className="h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-[11px] font-black flex items-center justify-center gap-1 transition active:scale-95"
                >
                  My Bookings
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST */}
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

/* ============================================================
   HELPER SUB-COMPONENTS
============================================================ */

function CentreInfo({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-white/70 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-slate-400">
        <Icon className="h-2.5 w-2.5 text-emerald-500" />
        <span className="text-[7px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <p className="text-[9px] font-black text-slate-800 dark:text-white mt-0.5 truncate">{value}</p>
    </div>
  );
}

function ReviewInfo({ label, value }) {
  return (
    <div className="rounded-xl bg-white/70 dark:bg-slate-900/30 border border-emerald-500/10 px-2.5 py-2">
      <p className="text-[7px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <p className="text-[9px] font-black text-slate-800 dark:text-white mt-0.5 truncate">{value}</p>
    </div>
  );
}

function ReviewCard({ icon: Icon, title, children }) {
  return (
    <div className="p-3 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-800/40">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-emerald-500" />
        <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">{title}</p>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[9px] text-slate-400">{label}</span>
      <span className="text-[10px] font-black text-slate-800 dark:text-white text-right truncate max-w-[190px]">
        {value}
      </span>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span
        className={`max-w-[220px] text-[10px] font-bold text-right text-slate-800 dark:text-white ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}