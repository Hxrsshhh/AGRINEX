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
  ChevronRight,
  CircleCheck,
  Leaf,
  BadgeCheck,
  Gauge,
  Phone,
  Tractor,
} from "lucide-react";

/* =========================================================
   PROCUREMENT CENTRES
========================================================= */

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
  },
];

/* =========================================================
   CROPS
========================================================= */

const CROPS = [
  {
    id: "paddy",
    name: "Paddy",
    icon: "🌾",
    variety: "PR-126 / Basmati",
    color: "emerald",
  },
  {
    id: "wheat",
    name: "Wheat",
    icon: "🌾",
    variety: "Sharbati / Lok-1",
    color: "amber",
  },
  {
    id: "maize",
    name: "Maize",
    icon: "🌽",
    variety: "Hybrid Yellow",
    color: "yellow",
  },
  {
    id: "mustard",
    name: "Mustard",
    icon: "🌱",
    variety: "Pusa Bold",
    color: "lime",
  },
];

/* =========================================================
   VEHICLES
========================================================= */

const VEHICLE_TYPES = [
  {
    id: "tractor",
    label: "Tractor",
    icon: Tractor,
  },
  {
    id: "tractor_trolley",
    label: "Tractor + Trolley",
    icon: Truck,
  },
  {
    id: "mini_truck",
    label: "Mini Truck",
    icon: Truck,
  },
  {
    id: "truck",
    label: "Truck",
    icon: Truck,
  },
];

/* =========================================================
   CALENDAR
========================================================= */

const SEPTEMBER_2026_DAYS = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;

  let status = "available";

  if ([6, 13, 20, 27].includes(day)) {
    status = "closed";
  } else if ([11, 12, 18, 25].includes(day)) {
    status = "few";
  } else if ([15, 22].includes(day)) {
    status = "full";
  }

  return {
    day,
    status,
  };
});

/* =========================================================
   TIME SLOTS
========================================================= */

const TIME_SLOTS = [
  {
    slot: "08:00 – 09:00 AM",
    status: "12 available",
    count: 12,
    isFull: false,
  },
  {
    slot: "09:00 – 10:00 AM",
    status: "8 available",
    count: 8,
    isFull: false,
  },
  {
    slot: "10:00 – 11:00 AM",
    status: "3 left",
    count: 3,
    isFull: false,
  },
  {
    slot: "11:00 – 12:00 PM",
    status: "6 available",
    count: 6,
    isFull: false,
  },
  {
    slot: "02:00 – 03:00 PM",
    status: "15 available",
    count: 15,
    isFull: false,
  },
  {
    slot: "03:00 – 04:00 PM",
    status: "9 available",
    count: 9,
    isFull: false,
  },
  {
    slot: "04:00 – 05:00 PM",
    status: "Full",
    count: 0,
    isFull: true,
  },
];

/* =========================================================
   STEPS
========================================================= */

const STEPS = [
  {
    number: 1,
    label: "Centre",
    description: "Choose mandi",
    icon: MapPin,
  },
  {
    number: 2,
    label: "Produce",
    description: "Crop & quantity",
    icon: Wheat,
  },
  {
    number: 3,
    label: "Schedule",
    description: "Date & time",
    icon: CalendarIcon,
  },
  {
    number: 4,
    label: "Details",
    description: "Vehicle",
    icon: Truck,
  },
  {
    number: 5,
    label: "Review",
    description: "Confirm booking",
    icon: CheckCircle2,
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function BookingPage() {
  const [activeStep, setActiveStep] = useState(1);

  const [centreSearch, setCentreSearch] = useState("");
  const [centreFilter, setCentreFilter] = useState("all");

  const [booking, setBooking] = useState({
    centreId: "xyz-centre",
    cropId: "paddy",
    quantity: 25,

    selectedDate: 12,
    selectedMonth: "September 2026",

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

  /* =======================================================
     HELPERS
  ======================================================= */

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2600);
  };

  const updateBooking = (updates) => {
    setBooking((previous) => ({
      ...previous,
      ...updates,
    }));
  };

  const selectedCentre =
    PROCUREMENT_CENTRES.find((centre) => centre.id === booking.centreId) ||
    PROCUREMENT_CENTRES[0];

  const selectedCrop =
    CROPS.find((crop) => crop.id === booking.cropId) || CROPS[0];

  const selectedVehicle =
    VEHICLE_TYPES.find((vehicle) => vehicle.id === booking.vehicleType) ||
    VEHICLE_TYPES[1];

  /* =======================================================
     FILTER CENTRES
  ======================================================= */

  const filteredCentres = useMemo(() => {
    return PROCUREMENT_CENTRES.filter((centre) => {
      const search = centreSearch.toLowerCase().trim();

      const matchesSearch =
        !search ||
        centre.name.toLowerCase().includes(search) ||
        centre.location.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      if (centreFilter === "nearby") {
        return centre.isNearby;
      }

      if (centreFilter === "open") {
        return centre.status === "Open";
      }

      if (centreFilter === "low_queue") {
        return centre.isLowQueue;
      }

      return true;
    });
  }, [centreSearch, centreFilter]);

  /* =======================================================
     QUANTITY
  ======================================================= */

  const changeQuantity = (amount) => {
    updateBooking({
      quantity: Math.max(1, booking.quantity + amount),
    });
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

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

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    if (!validateStep()) return;

    if (activeStep < 5) {
      setActiveStep((previous) => previous + 1);

      return;
    }

    const token = `AGR-TK-${Math.floor(1000 + Math.random() * 9000)}`;

    setGeneratedToken(token);
    setShowSuccess(true);
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    setActiveStep((previous) => Math.max(1, previous - 1));
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        relative

        w-full
        h-[calc(100vh-5.5rem)]

        min-h-0

        overflow-hidden

        bg-[#f4f7f5]
        dark:bg-[#0a1016]

        text-slate-900
        dark:text-slate-100

        flex
        flex-col

        transition-colors
        duration-300
      "
    >
      {/* ===================================================
          DECORATIVE BACKGROUND
      ==================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -top-32
            right-10

            w-72
            h-72

            rounded-full

            bg-emerald-500/5

            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-1/3

            w-80
            h-80

            rounded-full

            bg-lime-500/5

            blur-3xl
          "
        />
      </div>

      {/* ===================================================
          TOAST
      ==================================================== */}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -15,
              scale: 0.96,
            }}
            className="
              fixed

              top-20
              left-1/2

              -translate-x-1/2

              z-[250]

              flex
              items-center
              gap-2

              px-4
              py-2.5

              rounded-2xl

              bg-slate-950
              dark:bg-white

              text-white
              dark:text-slate-950

              text-xs
              font-bold

              shadow-2xl
            "
          >
            <CheckCircle2
              className="
                w-3.5
                h-3.5

                text-emerald-400
                dark:text-emerald-600
              "
            />

            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          HEADER
      ==================================================== */}

      <header
        className="
          relative
          z-10

         

          w-full
          max-w-6xl

          mx-auto

          px-4
          sm:px-6
          lg:px-8

          pt-1
          pb-2

          shrink-0
        "
      >
        <div
          className="
            flex
            items-center
            justify-between

            gap-5
          "
        >
          {/* TITLE */}

          <div className="min-w-0">
          

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <h1
                className="
                  mt-1.5

                  text-xl
                  sm:text-2xl

                  font-black

                  tracking-tight

                  text-slate-950
                  dark:text-white
                "
              >
                Book a Procurement Slot
              </h1>
            </div>

            <p
              className="
                mt-0.5

                text-[9px]
                sm:text-[10px]

                text-slate-500
                dark:text-slate-400
              "
            >
              Reserve your mandi arrival and skip unnecessary queue time.
            </p>
          </div>

          {/* LIVE STATUS */}

          <div
            className="
              hidden
              sm:flex

              items-center
              gap-3

              px-3.5
              py-2.5

              rounded-2xl

              bg-white/90
              dark:bg-slate-900/90

              border
              border-slate-200
              dark:border-slate-800

              shadow-sm
              backdrop-blur
            "
          >
            <div
              className="
                relative
                flex
                items-center
                justify-center
              "
            >
              <span
                className="
                  absolute

                  w-5
                  h-5

                  rounded-full

                  bg-emerald-500/10

                  animate-ping
                "
              />

              <span
                className="
                  relative

                  w-2
                  h-2

                  rounded-full

                  bg-emerald-500
                "
              />
            </div>

            <div>
              <p
                className="
                  text-[8px]

                  font-black
                  uppercase
                  tracking-wider

                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                Live network
              </p>

              <p
                className="
                  mt-0.5

                  text-[9px]

                  font-bold

                  text-slate-600
                  dark:text-slate-300
                "
              >
                Procurement centres online
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            STEPPER
        ================================================== */}

        <div
          className="
            relative

            mt-3

            p-1.5

            rounded-2xl

            bg-white/95
            dark:bg-slate-900/95

            border
            border-slate-200
            dark:border-slate-800

            shadow-sm

            backdrop-blur

            overflow-hidden
          "
        >
          {/* PROGRESS LINE */}

          <div
            className="
              absolute

              left-[7%]
              right-[7%]

              top-1/2

              h-[2px]

              -translate-y-1/2

              bg-slate-100
              dark:bg-slate-800
            "
          />

          <motion.div
            className="
              absolute

              left-[7%]

              top-1/2

              h-[2px]

              -translate-y-1/2

              bg-emerald-500
            "
            initial={false}
            animate={{
              width: `${((activeStep - 1) / 4) * 86}%`,
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
          />

          <div
            className="
              relative
              z-10

              flex
              items-center
              justify-between
            "
          >
            {STEPS.map((step) => {
              const active = activeStep === step.number;

              const completed = activeStep > step.number;

              const Icon = step.icon;

              return (
                <button
                  key={step.number}
                  type="button"
                  disabled={step.number > activeStep}
                  onClick={() => {
                    if (step.number <= activeStep) {
                      setActiveStep(step.number);
                    }
                  }}
                  className="
                    group

                    flex
                    items-center
                    gap-2

                    min-w-0

                    px-1
                    sm:px-2

                    disabled:cursor-default
                  "
                >
                  <div
                    className={`
                      relative

                      flex
                      items-center
                      justify-center

                      w-7
                      h-7
                      sm:w-8
                      sm:h-8

                      rounded-xl

                      border

                      transition-all
                      duration-200

                      ${
                        active
                          ? `
                            bg-emerald-600
                            border-emerald-500

                            text-white

                            shadow-lg
                            shadow-emerald-600/20

                            scale-105
                          `
                          : completed
                            ? `
                              bg-white
                              dark:bg-slate-900

                              border-emerald-500

                              text-emerald-600
                              dark:text-emerald-400
                            `
                            : `
                              bg-white
                              dark:bg-slate-900

                              border-slate-200
                              dark:border-slate-700

                              text-slate-400
                              dark:text-slate-500
                            `
                      }
                    `}
                  >
                    {completed ? (
                      <Check
                        className="
                          w-3.5
                          h-3.5
                        "
                      />
                    ) : (
                      <Icon
                        className="
                          w-3.5
                          h-3.5
                        "
                      />
                    )}
                  </div>

                  <div
                    className="
                      hidden
                      md:block

                      text-left
                      min-w-0
                    "
                  >
                    <p
                      className={`
                        text-[9px]

                        font-black

                        truncate

                        ${
                          active
                            ? `
                              text-emerald-600
                              dark:text-emerald-400
                            `
                            : `
                              text-slate-700
                              dark:text-slate-300
                            `
                        }
                      `}
                    >
                      {step.label}
                    </p>

                    <p
                      className="
                        mt-0.5

                        text-[7px]

                        text-slate-400

                        truncate
                      "
                    >
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN
      ==================================================== */}

      <main
        className="
          relative
          z-10

          flex-1
          min-h-0

          w-full
          max-w-6xl

          mx-auto

          px-4
          sm:px-6
          lg:px-8

          pb-3

          overflow-hidden
        "
      >
        {/* =================================================
            MAIN BOOKING CARD
        ================================================== */}

        <div
          className="
            relative

            h-full
            min-h-0

            rounded-[28px]

            bg-white
            dark:bg-[#0c1410]

            border
            border-slate-200
            dark:border-slate-800

            shadow-[0_20px_60px_rgba(15,23,42,0.08)]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]

            overflow-hidden

            flex
            flex-col
          "
        >
          {/* TOP ACCENT */}

          <div
            className="
              absolute
              top-0
              left-0
              right-0

              h-[2px]

              bg-gradient-to-r
              from-transparent
              via-emerald-500
              to-transparent

              opacity-70
            "
          />

          {/* =================================================
              CONTENT
          ================================================== */}

          <div
            className="
              flex-1
              min-h-0

              p-3
              sm:p-4
              lg:p-5

              overflow-hidden
            "
          >
            <AnimatePresence mode="wait">
              {/* =================================================
                  STEP 1
              ================================================== */}

              {activeStep === 1 && (
                <motion.div
                  key="centre"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    h-full
                    min-h-0

                    flex
                    flex-col

                    gap-2.5

                    overflow-hidden
                  "
                >
                  <PageSectionHeader
                    eyebrow="STEP 01"
                    title="Choose your procurement centre"
                    description="Select a nearby mandi based on distance, queue and current capacity."
                  />

                  {/* SEARCH + QUICK STATS */}

                  <div
                    className="
                      grid

                      grid-cols-1
                      lg:grid-cols-[1fr_auto]

                      gap-2

                      shrink-0
                    "
                  >
                    <div
                      className="
                        relative
                      "
                    >
                      <Search
                        className="
                          absolute

                          left-3.5
                          top-1/2

                          -translate-y-1/2

                          w-4
                          h-4

                          text-slate-400
                        "
                      />

                      <input
                        value={centreSearch}
                        onChange={(e) => setCentreSearch(e.target.value)}
                        placeholder="Search centre, mandi or village..."
                        className="
                          w-full

                          h-10

                          pl-10
                          pr-4

                          rounded-xl

                          bg-slate-50
                          dark:bg-slate-900

                          border
                          border-slate-200
                          dark:border-slate-800

                          text-[10px]
                          sm:text-[11px]

                          text-slate-900
                          dark:text-white

                          placeholder:text-slate-400

                          outline-none

                          transition

                          focus:border-emerald-500
                          focus:ring-4
                          focus:ring-emerald-500/10
                        "
                      />
                    </div>

                    <div
                      className="
                        hidden
                        sm:flex

                        items-center
                        gap-2

                        px-3

                        rounded-xl

                        bg-emerald-500/5

                        border
                        border-emerald-500/10
                      "
                    >
                      <Navigation
                        className="
                          w-3.5
                          h-3.5

                          text-emerald-500
                        "
                      />

                      <span
                        className="
                          text-[8px]

                          font-bold

                          text-emerald-700
                          dark:text-emerald-400
                        "
                      >
                        4 centres found nearby
                      </span>
                    </div>
                  </div>

                  {/* FILTERS */}

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5

                      flex-wrap

                      shrink-0
                    "
                  >
                    {[
                      ["all", "All Centres"],
                      ["nearby", "Nearby"],
                      ["open", "Open Now"],
                      ["low_queue", "Low Queue"],
                    ].map(([id, label]) => {
                      const selected = centreFilter === id;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setCentreFilter(id)}
                          className={`
                              px-3

                              py-1.5

                              rounded-lg

                              text-[8px]
                              sm:text-[9px]

                              font-black

                              transition-all

                              ${
                                selected
                                  ? `
                                    bg-slate-950
                                    dark:bg-white

                                    text-white
                                    dark:text-slate-950

                                    shadow-sm
                                  `
                                  : `
                                    bg-slate-100
                                    dark:bg-slate-800

                                    text-slate-500
                                    dark:text-slate-300

                                    hover:bg-slate-200
                                    dark:hover:bg-slate-700
                                  `
                              }
                            `}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* CENTRES */}

                  <div
                    className="
                      flex-1
                      min-h-0

                      grid

                      grid-cols-1
                      lg:grid-cols-2

                      gap-2.5

                      overflow-hidden
                    "
                  >
                    {filteredCentres.map((centre) => {
                      const selected = booking.centreId === centre.id;

                      const capacityColor =
                        centre.capacity > 80
                          ? "bg-rose-500"
                          : centre.capacity > 60
                            ? "bg-amber-500"
                            : "bg-emerald-500";

                      return (
                        <motion.button
                          key={centre.id}
                          type="button"
                          whileHover={{
                            y: -2,
                          }}
                          whileTap={{
                            scale: 0.99,
                          }}
                          onClick={() => {
                            updateBooking({
                              centreId: centre.id,
                            });

                            showToast(`${centre.name} selected`);
                          }}
                          className={`
                              relative

                              min-h-0

                              p-3

                              rounded-2xl

                              border

                              text-left

                              overflow-hidden

                              flex
                              flex-col
                              justify-between

                              transition-all
                              duration-200

                              ${
                                selected
                                  ? `
                                    bg-emerald-500/[0.07]
                                    dark:bg-emerald-400/[0.07]

                                    border-emerald-500/70

                                    shadow-lg
                                    shadow-emerald-900/5

                                    ring-1
                                    ring-emerald-500/10
                                  `
                                  : `
                                    bg-slate-50/80
                                    dark:bg-slate-900/60

                                    border-slate-200
                                    dark:border-slate-800

                                    hover:border-emerald-500/40

                                    hover:bg-white
                                    dark:hover:bg-slate-900
                                  `
                              }
                            `}
                        >
                          {/* SELECTED GLOW */}

                          {selected && (
                            <div
                              className="
                                  absolute

                                  -top-12
                                  -right-12

                                  w-28
                                  h-28

                                  rounded-full

                                  bg-emerald-500/10

                                  blur-2xl
                                "
                            />
                          )}

                          <div
                            className="
                                relative
                                z-10

                                flex
                                items-start
                                justify-between

                                gap-3
                              "
                          >
                            <div
                              className="
                                  flex
                                  items-center
                                  gap-2.5

                                  min-w-0
                                "
                            >
                              <div
                                className={`
                                    w-9
                                    h-9

                                    rounded-xl

                                    flex
                                    items-center
                                    justify-center

                                    shrink-0

                                    ${
                                      selected
                                        ? `
                                          bg-emerald-600
                                          text-white

                                          shadow-md
                                          shadow-emerald-600/20
                                        `
                                        : `
                                          bg-white
                                          dark:bg-slate-800

                                          text-emerald-600
                                          dark:text-emerald-400

                                          border
                                          border-slate-200
                                          dark:border-slate-700
                                        `
                                    }
                                  `}
                              >
                                <MapPin
                                  className="
                                      w-4
                                      h-4
                                    "
                                />
                              </div>

                              <div
                                className="
                                    min-w-0
                                  "
                              >
                                <div
                                  className="
                                      flex
                                      items-center
                                      gap-1.5
                                    "
                                >
                                  <p
                                    className="
                                        text-[10px]
                                        sm:text-[11px]

                                        font-black

                                        truncate

                                        text-slate-950
                                        dark:text-white
                                      "
                                  >
                                    {centre.name}
                                  </p>

                                  {centre.isLowQueue && (
                                    <span
                                      className="
                                          hidden
                                          sm:inline-flex

                                          px-1.5
                                          py-0.5

                                          rounded-md

                                          bg-emerald-500/10

                                          text-emerald-600
                                          dark:text-emerald-400

                                          text-[6px]

                                          font-black

                                          uppercase
                                        "
                                    >
                                      Low queue
                                    </span>
                                  )}
                                </div>

                                <p
                                  className="
                                      mt-0.5

                                      text-[8px]

                                      text-slate-400

                                      truncate
                                    "
                                >
                                  {centre.location}
                                </p>
                              </div>
                            </div>

                            {selected && (
                              <div
                                className="
                                    w-5
                                    h-5

                                    rounded-full

                                    bg-emerald-500

                                    text-white

                                    flex
                                    items-center
                                    justify-center

                                    shrink-0
                                  "
                              >
                                <Check
                                  className="
                                      w-3
                                      h-3
                                    "
                                />
                              </div>
                            )}
                          </div>

                          {/* METRICS */}

                          <div
                            className="
                                relative
                                z-10

                                grid
                                grid-cols-3

                                gap-1.5

                                mt-3
                              "
                          >
                            <MetricCard
                              icon={Users}
                              label="Queue"
                              value={`${centre.queue}`}
                              helper="farmers"
                            />

                            <MetricCard
                              icon={Timer}
                              label="Wait"
                              value={centre.wait}
                              helper="estimated"
                            />

                            <MetricCard
                              icon={Gauge}
                              label="Capacity"
                              value={`${centre.capacity}%`}
                              helper="current"
                            />
                          </div>

                          {/* CAPACITY BAR */}

                          <div
                            className="
                                relative
                                z-10

                                mt-2.5
                              "
                          >
                            <div
                              className="
                                  flex
                                  items-center
                                  justify-between

                                  mb-1
                                "
                            >
                              <span
                                className="
                                    text-[7px]

                                    font-bold

                                    text-slate-400
                                  "
                              >
                                Centre load
                              </span>

                              <span
                                className="
                                    text-[7px]

                                    font-black

                                    text-slate-500
                                    dark:text-slate-400
                                  "
                              >
                                {centre.capacity}%
                              </span>
                            </div>

                            <div
                              className="
                                  h-1

                                  rounded-full

                                  bg-slate-200
                                  dark:bg-slate-800

                                  overflow-hidden
                                "
                            >
                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                animate={{
                                  width: `${centre.capacity}%`,
                                }}
                                className={`
                                    h-full

                                    rounded-full

                                    ${capacityColor}
                                  `}
                              />
                            </div>
                          </div>

                          {/* FOOTER */}

                          <div
                            className="
                                relative
                                z-10

                                mt-2.5

                                flex
                                items-center
                                justify-between

                                gap-2
                              "
                          >
                            <span
                              className="
                                  flex
                                  items-center
                                  gap-1

                                  text-[8px]

                                  font-black

                                  text-emerald-600
                                  dark:text-emerald-400
                                "
                            >
                              <span
                                className="
                                    w-1.5
                                    h-1.5

                                    rounded-full

                                    bg-emerald-500
                                  "
                              />
                              Open now
                            </span>

                            <span
                              className="
                                  flex
                                  items-center
                                  gap-1

                                  text-[7px]

                                  font-bold

                                  text-slate-400
                                "
                            >
                              {centre.subtext}

                              <ChevronRight
                                className="
                                    w-2.5
                                    h-2.5
                                  "
                              />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}

                    {filteredCentres.length === 0 && (
                      <div
                        className="
                          col-span-full

                          flex
                          flex-col
                          items-center
                          justify-center

                          rounded-2xl

                          border
                          border-dashed
                          border-slate-300
                          dark:border-slate-700
                        "
                      >
                        <Search
                          className="
                            w-7
                            h-7

                            text-slate-300
                          "
                        />

                        <p
                          className="
                            mt-2

                            text-xs

                            font-black
                          "
                        >
                          No centres found
                        </p>

                        <p
                          className="
                            mt-1

                            text-[8px]

                            text-slate-400
                          "
                        >
                          Try a different search or filter.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  STEP 2
              ================================================== */}

              {activeStep === 2 && (
                <motion.div
                  key="produce"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    h-full
                    min-h-0

                    flex
                    flex-col

                    gap-3

                    overflow-hidden
                  "
                >
                  <PageSectionHeader
                    eyebrow="STEP 02"
                    title="Tell us about your produce"
                    description="Select the crop and provide an approximate quantity."
                  />

                  {/* CROPS */}

                  <div className="shrink-0">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <SectionLabel>Crop / Produce</SectionLabel>

                      <span
                        className="
                          text-[7px]

                          text-slate-400
                        "
                      >
                        Select one
                      </span>
                    </div>

                    <div
                      className="
                        grid

                        grid-cols-2
                        md:grid-cols-4

                        gap-2

                        mt-1.5
                      "
                    >
                      {CROPS.map((crop) => {
                        const selected = booking.cropId === crop.id;

                        return (
                          <motion.button
                            key={crop.id}
                            type="button"
                            whileHover={{
                              y: -2,
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                            onClick={() =>
                              updateBooking({
                                cropId: crop.id,
                              })
                            }
                            className={`
                                relative

                                p-3

                                rounded-2xl

                                border

                                overflow-hidden

                                text-center

                                transition-all

                                ${
                                  selected
                                    ? `
                                      bg-emerald-500/[0.08]
                                      dark:bg-emerald-400/[0.08]

                                      border-emerald-500

                                      shadow-md
                                      shadow-emerald-900/5
                                    `
                                    : `
                                      bg-slate-50
                                      dark:bg-slate-900/60

                                      border-slate-200
                                      dark:border-slate-800

                                      hover:border-emerald-500/40
                                    `
                                }
                              `}
                          >
                            {selected && (
                              <div
                                className="
                                    absolute

                                    top-2
                                    right-2

                                    w-4
                                    h-4

                                    rounded-full

                                    bg-emerald-500

                                    text-white

                                    flex
                                    items-center
                                    justify-center
                                  "
                              >
                                <Check
                                  className="
                                      w-2.5
                                      h-2.5
                                    "
                                />
                              </div>
                            )}

                            <div
                              className="
                                  w-11
                                  h-11

                                  mx-auto

                                  rounded-2xl

                                  bg-white
                                  dark:bg-slate-800

                                  border
                                  border-slate-100
                                  dark:border-slate-700

                                  flex
                                  items-center
                                  justify-center

                                  text-2xl

                                  shadow-sm
                                "
                            >
                              {crop.icon}
                            </div>

                            <p
                              className="
                                  mt-2

                                  text-[10px]

                                  font-black
                                "
                            >
                              {crop.name}
                            </p>

                            <p
                              className="
                                  mt-0.5

                                  text-[7px]

                                  text-slate-400

                                  truncate
                                "
                            >
                              {crop.variety}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* QUANTITY PANEL */}

                  <div
                    className="
                      flex-1
                      min-h-0

                      rounded-2xl

                      bg-gradient-to-br
                      from-emerald-500/[0.07]
                      to-slate-50

                      dark:from-emerald-400/[0.06]
                      dark:to-slate-900

                      border
                      border-emerald-500/15

                      p-4

                      flex
                      flex-col
                      items-center
                      justify-center

                      overflow-hidden
                    "
                  >
                    <div
                      className="
                        w-full

                        flex
                        items-center
                        justify-between
                      "
                    >
                      <div>
                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >
                          <Scale
                            className="
                              w-4
                              h-4

                              text-emerald-500
                            "
                          />

                          <p
                            className="
                              text-xs

                              font-black
                            "
                          >
                            Estimated quantity
                          </p>
                        </div>

                        <p
                          className="
                            mt-1

                            text-[8px]

                            text-slate-400
                          "
                        >
                          Enter your expected produce quantity.
                        </p>
                      </div>

                      <div
                        className="
                          px-2.5
                          py-1.5

                          rounded-xl

                          bg-white
                          dark:bg-slate-900

                          border
                          border-slate-200
                          dark:border-slate-700
                        "
                      >
                        <span
                          className="
                            text-[8px]

                            font-black

                            text-slate-400
                          "
                        >
                          UNIT
                        </span>

                        <span
                          className="
                            ml-1

                            text-[9px]

                            font-black

                            text-emerald-600
                          "
                        >
                          Quintals
                        </span>
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-center

                        gap-5

                        mt-5
                      "
                    >
                      <QuantityButton onClick={() => changeQuantity(-1)}>
                        −
                      </QuantityButton>

                      <div
                        className="
                          min-w-[120px]

                          text-center
                        "
                      >
                        <div
                          className="
                            flex
                            items-baseline
                            justify-center
                          "
                        >
                          <span
                            className="
                              text-5xl

                              font-black
                              tracking-tighter
                            "
                          >
                            {booking.quantity}
                          </span>

                          <span
                            className="
                              ml-2

                              text-sm

                              font-black

                              text-emerald-600
                              dark:text-emerald-400
                            "
                          >
                            Q
                          </span>
                        </div>

                        <p
                          className="
                            mt-1

                            text-[8px]

                            font-bold

                            text-slate-400
                          "
                        >
                          Approximate quantity
                        </p>
                      </div>

                      <QuantityButton onClick={() => changeQuantity(1)}>
                        +
                      </QuantityButton>
                    </div>

                    <div
                      className="
                        flex
                        flex-wrap
                        justify-center

                        gap-1.5

                        mt-5
                      "
                    >
                      {[10, 20, 25, 35, 50, 75].map((quantity) => (
                        <button
                          key={quantity}
                          type="button"
                          onClick={() =>
                            updateBooking({
                              quantity,
                            })
                          }
                          className={`
                              px-2.5

                              py-1.5

                              rounded-lg

                              text-[8px]

                              font-black

                              transition

                              ${
                                booking.quantity === quantity
                                  ? `
                                    bg-emerald-600
                                    text-white

                                    shadow-md
                                    shadow-emerald-600/20
                                  `
                                  : `
                                    bg-white
                                    dark:bg-slate-900

                                    border
                                    border-slate-200
                                    dark:border-slate-700

                                    text-slate-500
                                    dark:text-slate-300
                                  `
                              }
                            `}
                        >
                          {quantity} Q
                        </button>
                      ))}
                    </div>
                  </div>

                  <InfoBox icon={ShieldCheck}>
                    Final net quantity will be recorded automatically after
                    weighbridge measurement and quality inspection.
                  </InfoBox>
                </motion.div>
              )}

              {/* =================================================
                  STEP 3
              ================================================== */}

              {activeStep === 3 && (
                <motion.div
                  key="schedule"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    h-full
                    min-h-0

                    flex
                    flex-col

                    gap-3

                    overflow-hidden
                  "
                >
                  <PageSectionHeader
                    eyebrow="STEP 03"
                    title="Schedule your arrival"
                    description="Pick a date and an available time window."
                  />

                  {/* CALENDAR */}

                  <div
                    className="
                      shrink-0

                      rounded-2xl

                      bg-slate-50
                      dark:bg-slate-900/60

                      border
                      border-slate-200
                      dark:border-slate-800

                      p-3.5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between

                        mb-3
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <div
                          className="
                            w-8
                            h-8

                            rounded-xl

                            bg-emerald-500/10

                            flex
                            items-center
                            justify-center
                          "
                        >
                          <CalendarIcon
                            className="
                              w-4
                              h-4

                              text-emerald-500
                            "
                          />
                        </div>

                        <div>
                          <p
                            className="
                              text-[11px]

                              font-black
                            "
                          >
                            September 2026
                          </p>

                          <p
                            className="
                              mt-0.5

                              text-[7px]

                              text-slate-400
                            "
                          >
                            Select your preferred arrival date
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          hidden
                          sm:flex

                          items-center
                          gap-2
                        "
                      >
                        <CalendarLegend type="available" label="Available" />

                        <CalendarLegend type="few" label="Few left" />

                        <CalendarLegend type="full" label="Full" />
                      </div>
                    </div>

                    <div
                      className="
                        grid
                        grid-cols-7

                        gap-1.5
                      "
                    >
                      {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                        <span
                          key={day}
                          className="
                              h-5

                              flex
                              items-center
                              justify-center

                              text-[7px]

                              font-black

                              uppercase

                              text-slate-400
                            "
                        >
                          {day}
                        </span>
                      ))}

                      {/* SEPTEMBER 2026 STARTS TUESDAY */}

                      <span />

                      {SEPTEMBER_2026_DAYS.map(({ day, status }) => {
                        const selected = booking.selectedDate === day;

                        const disabled =
                          status === "closed" || status === "full";

                        return (
                          <motion.button
                            key={day}
                            type="button"
                            disabled={disabled}
                            whileHover={
                              !disabled
                                ? {
                                    scale: 1.05,
                                  }
                                : {}
                            }
                            whileTap={
                              !disabled
                                ? {
                                    scale: 0.96,
                                  }
                                : {}
                            }
                            onClick={() => {
                              updateBooking({
                                selectedDate: day,
                              });

                              showToast(`September ${day} selected`);
                            }}
                            className={`
                                relative

                                h-7
                                sm:h-8

                                rounded-lg

                                flex
                                items-center
                                justify-center

                                text-[8px]

                                font-black

                                border

                                transition-all

                                ${
                                  selected
                                    ? `
                                      bg-emerald-600
                                      border-emerald-600

                                      text-white

                                      shadow-md
                                      shadow-emerald-600/20
                                    `
                                    : status === "closed"
                                      ? `
                                        bg-slate-200/60
                                        dark:bg-slate-800/50

                                        border-transparent

                                        text-slate-300
                                        dark:text-slate-600

                                        cursor-not-allowed
                                      `
                                      : status === "full"
                                        ? `
                                          bg-rose-500/5

                                          border-rose-500/10

                                          text-rose-400

                                          cursor-not-allowed
                                        `
                                        : status === "few"
                                          ? `
                                            bg-amber-500/5

                                            border-amber-500/20

                                            text-amber-600

                                            hover:bg-amber-500/10
                                          `
                                          : `
                                            bg-white
                                            dark:bg-slate-900

                                            border-slate-200
                                            dark:border-slate-700

                                            text-slate-700
                                            dark:text-slate-300

                                            hover:border-emerald-400
                                          `
                                }
                              `}
                          >
                            {day}

                            {status === "few" && !selected && (
                              <span
                                className="
                                      absolute

                                      bottom-0.5

                                      w-1
                                      h-1

                                      rounded-full

                                      bg-amber-500
                                    "
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TIME WINDOWS */}

                  <div
                    className="
                      flex-1
                      min-h-0

                      overflow-hidden
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <SectionLabel>Available time windows</SectionLabel>

                      <span
                        className="
                          text-[7px]

                          font-bold

                          text-emerald-600
                          dark:text-emerald-400
                        "
                      >
                        {TIME_SLOTS.filter((slot) => !slot.isFull).length}{" "}
                        windows open
                      </span>
                    </div>

                    <div
                      className="
                        grid

                        grid-cols-2
                        lg:grid-cols-4

                        gap-2

                        mt-1.5
                      "
                    >
                      {TIME_SLOTS.map((slot) => {
                        const selected = booking.timeSlot === slot.slot;

                        return (
                          <motion.button
                            key={slot.slot}
                            type="button"
                            disabled={slot.isFull}
                            whileHover={
                              !slot.isFull
                                ? {
                                    y: -1,
                                  }
                                : {}
                            }
                            onClick={() =>
                              updateBooking({
                                timeSlot: slot.slot,
                              })
                            }
                            className={`
                                relative

                                p-2.5

                                rounded-xl

                                border

                                text-left

                                transition-all

                                ${
                                  selected
                                    ? `
                                      bg-emerald-500/[0.08]

                                      border-emerald-500

                                      text-emerald-700
                                      dark:text-emerald-400

                                      shadow-sm
                                    `
                                    : slot.isFull
                                      ? `
                                        bg-slate-100
                                        dark:bg-slate-800

                                        border-slate-200
                                        dark:border-slate-800

                                        opacity-50

                                        cursor-not-allowed
                                      `
                                      : `
                                        bg-slate-50
                                        dark:bg-slate-900/60

                                        border-slate-200
                                        dark:border-slate-800

                                        hover:border-emerald-400
                                      `
                                }
                              `}
                          >
                            <div
                              className="
                                  flex
                                  items-center
                                  justify-between
                                "
                            >
                              <div
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                  "
                              >
                                <Clock
                                  className="
                                      w-3
                                      h-3
                                    "
                                />

                                <span
                                  className="
                                      text-[8px]

                                      font-black
                                    "
                                >
                                  {slot.slot}
                                </span>
                              </div>

                              {selected && (
                                <Check
                                  className="
                                      w-3
                                      h-3
                                    "
                                />
                              )}
                            </div>

                            <div
                              className="
                                  mt-2

                                  flex
                                  items-center
                                  justify-between
                                "
                            >
                              <span
                                className={`
                                    text-[7px]

                                    font-bold

                                    ${
                                      slot.isFull
                                        ? "text-rose-400"
                                        : slot.count <= 3
                                          ? "text-amber-500"
                                          : "text-emerald-500"
                                    }
                                  `}
                              >
                                {slot.status}
                              </span>

                              {!slot.isFull && (
                                <span
                                  className="
                                      text-[6px]

                                      text-slate-400
                                    "
                                >
                                  slots
                                </span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  STEP 4
              ================================================== */}

              {activeStep === 4 && (
                <motion.div
                  key="details"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    h-full
                    min-h-0

                    flex
                    flex-col

                    gap-3

                    overflow-hidden
                  "
                >
                  <PageSectionHeader
                    eyebrow="STEP 04"
                    title="Confirm farmer & vehicle details"
                    description="These details help the centre identify your booking at the gate."
                  />

                  {/* FARMER CARD */}

                  <div
                    className="
                      relative

                      shrink-0

                      p-3.5

                      rounded-2xl

                      bg-gradient-to-r
                      from-emerald-500/[0.08]
                      to-transparent

                      border
                      border-emerald-500/15

                      overflow-hidden
                    "
                  >
                    <div
                      className="
                        absolute

                        right-0
                        top-0

                        w-32
                        h-full

                        bg-emerald-500/5

                        blur-2xl
                      "
                    />

                    <div
                      className="
                        relative
                        z-10

                        flex
                        items-center
                        justify-between

                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            w-11
                            h-11

                            rounded-2xl

                            bg-emerald-600

                            text-white

                            flex
                            items-center
                            justify-center

                            text-xs

                            font-black

                            shadow-lg
                            shadow-emerald-600/20
                          "
                        >
                          RK
                        </div>

                        <div>
                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                            "
                          >
                            <p
                              className="
                                text-xs

                                font-black
                              "
                            >
                              {booking.farmerName}
                            </p>

                            <BadgeCheck
                              className="
                                w-3.5
                                h-3.5

                                text-emerald-500
                              "
                            />
                          </div>

                          <p
                            className="
                              mt-0.5

                              text-[8px]

                              font-mono

                              text-slate-400
                            "
                          >
                            {booking.farmerId}
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-1.5

                          px-2.5
                          py-1.5

                          rounded-xl

                          bg-emerald-500/10

                          text-emerald-600
                          dark:text-emerald-400

                          text-[8px]

                          font-black
                        "
                      >
                        <ShieldCheck
                          className="
                            w-3
                            h-3
                          "
                        />
                        Verified farmer
                      </div>
                    </div>

                    <div
                      className="
                        relative
                        z-10

                        mt-3

                        grid

                        grid-cols-1
                        sm:grid-cols-2

                        gap-2
                      "
                    >
                      <SmallDetail
                        icon={MapPin}
                        value={booking.farmerLocation}
                      />

                      <SmallDetail icon={Phone} value={booking.farmerPhone} />
                    </div>
                  </div>

                  {/* VEHICLE */}

                  <div className="shrink-0">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <SectionLabel>Transport vehicle</SectionLabel>

                      <span
                        className="
                          text-[7px]

                          text-slate-400
                        "
                      >
                        Select one
                      </span>
                    </div>

                    <div
                      className="
                        grid

                        grid-cols-2
                        md:grid-cols-4

                        gap-2

                        mt-1.5
                      "
                    >
                      {VEHICLE_TYPES.map((vehicle) => {
                        const selected = booking.vehicleType === vehicle.id;

                        const Icon = vehicle.icon;

                        return (
                          <button
                            key={vehicle.id}
                            type="button"
                            onClick={() =>
                              updateBooking({
                                vehicleType: vehicle.id,
                              })
                            }
                            className={`
                                flex
                                items-center
                                gap-2

                                p-2.5

                                rounded-xl

                                border

                                transition-all

                                ${
                                  selected
                                    ? `
                                      bg-emerald-500/[0.08]

                                      border-emerald-500

                                      text-emerald-600
                                      dark:text-emerald-400
                                    `
                                    : `
                                      bg-slate-50
                                      dark:bg-slate-900/60

                                      border-slate-200
                                      dark:border-slate-800

                                      text-slate-600
                                      dark:text-slate-300

                                      hover:border-emerald-400
                                    `
                                }
                              `}
                          >
                            <div
                              className={`
                                  w-7
                                  h-7

                                  rounded-lg

                                  flex
                                  items-center
                                  justify-center

                                  ${
                                    selected
                                      ? "bg-emerald-500/10"
                                      : "bg-white dark:bg-slate-800"
                                  }
                                `}
                            >
                              <Icon
                                className="
                                    w-3.5
                                    h-3.5
                                  "
                              />
                            </div>

                            <span
                              className="
                                  text-[8px]
                                  sm:text-[9px]

                                  font-black

                                  truncate
                                "
                            >
                              {vehicle.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* REGISTRATION */}

                  <div
                    className="
                      shrink-0
                    "
                  >
                    <SectionLabel>Vehicle registration number</SectionLabel>

                    <div
                      className="
                        relative

                        mt-1.5
                      "
                    >
                      <Truck
                        className="
                          absolute

                          left-3.5
                          top-1/2

                          -translate-y-1/2

                          w-4
                          h-4

                          text-slate-400
                        "
                      />

                      <input
                        value={booking.vehicleNumber}
                        onChange={(e) =>
                          updateBooking({
                            vehicleNumber: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="AS-01-AB-1234"
                        className="
                          w-full

                          h-10

                          pl-10
                          pr-4

                          rounded-xl

                          bg-slate-50
                          dark:bg-slate-900

                          border
                          border-slate-200
                          dark:border-slate-800

                          text-[10px]

                          font-mono
                          font-black

                          tracking-wider

                          outline-none

                          transition

                          focus:border-emerald-500
                          focus:ring-4
                          focus:ring-emerald-500/10
                        "
                      />
                    </div>
                  </div>

                  <InfoBox icon={ShieldCheck}>
                    Vehicle details will be used for gate-entry verification at
                    the selected procurement centre.
                  </InfoBox>
                </motion.div>
              )}

              {/* =================================================
                  STEP 5
              ================================================== */}

              {activeStep === 5 && (
                <motion.div
                  key="review"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    h-full
                    min-h-0

                    flex
                    flex-col

                    gap-2.5

                    overflow-hidden
                  "
                >
                  <PageSectionHeader
                    eyebrow="STEP 05"
                    title="Review your booking"
                    description="Everything looks good? Confirm to reserve your procurement slot."
                  />

                  {/* SUMMARY HIGHLIGHTS */}

                  <div
                    className="
                      shrink-0

                      grid

                      grid-cols-2
                      lg:grid-cols-4

                      gap-2
                    "
                  >
                    <ReviewHighlight
                      icon={MapPin}
                      label="Centre"
                      value={selectedCentre.name}
                    />

                    <ReviewHighlight
                      icon={Wheat}
                      label="Produce"
                      value={selectedCrop.name}
                    />

                    <ReviewHighlight
                      icon={CalendarIcon}
                      label="Arrival"
                      value={`${booking.selectedDate} Sept`}
                    />

                    <ReviewHighlight
                      icon={Clock}
                      label="Time"
                      value={booking.timeSlot}
                    />
                  </div>

                  {/* MAIN REVIEW */}

                  <div
                    className="
                      flex-1
                      min-h-0

                      grid

                      lg:grid-cols-[1.35fr_0.65fr]

                      gap-2.5

                      overflow-hidden
                    "
                  >
                    {/* DETAILS */}

                    <div
                      className="
                        min-h-0

                        rounded-2xl

                        border
                        border-slate-200
                        dark:border-slate-800

                        overflow-hidden

                        bg-white
                        dark:bg-slate-900/50
                      "
                    >
                      <div
                        className="
                          px-3.5
                          py-2.5

                          bg-slate-50
                          dark:bg-slate-900

                          border-b
                          border-slate-200
                          dark:border-slate-800

                          flex
                          items-center
                          justify-between
                        "
                      >
                        <div>
                          <p
                            className="
                              text-[9px]

                              font-black
                            "
                          >
                            Booking summary
                          </p>

                          <p
                            className="
                              mt-0.5

                              text-[7px]

                              text-slate-400
                            "
                          >
                            Final details before confirmation
                          </p>
                        </div>

                        <CheckCircle2
                          className="
                            w-4
                            h-4

                            text-emerald-500
                          "
                        />
                      </div>

                      <div
                        className="
                          overflow-hidden
                        "
                      >
                        <ReviewRow
                          icon={MapPin}
                          label="Procurement Centre"
                          value={selectedCentre.name}
                        />

                        <ReviewRow
                          icon={Navigation}
                          label="Location"
                          value={selectedCentre.location}
                        />

                        <ReviewRow
                          icon={Wheat}
                          label="Produce"
                          value={`
                            ${selectedCrop.name} • ${selectedCrop.variety}
                          `}
                        />

                        <ReviewRow
                          icon={Scale}
                          label="Estimated Quantity"
                          value={`${booking.quantity} Quintals`}
                          highlight
                        />

                        <ReviewRow
                          icon={CalendarIcon}
                          label="Arrival Date"
                          value={`${booking.selectedDate} September 2026`}
                        />

                        <ReviewRow
                          icon={Clock}
                          label="Time Window"
                          value={booking.timeSlot}
                        />

                        <ReviewRow
                          icon={Truck}
                          label="Vehicle"
                          value={`${selectedVehicle.label} • ${booking.vehicleNumber}`}
                        />
                      </div>
                    </div>

                    {/* RIGHT INFO */}

                    <div
                      className="
                        min-h-0

                        flex
                        flex-col

                        gap-2.5
                      "
                    >
                      {/* QUEUE CARD */}

                      <div
                        className="
                          shrink-0

                          p-3.5

                          rounded-2xl

                          bg-emerald-500/[0.06]

                          border
                          border-emerald-500/15
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <div
                            className="
                              w-8
                              h-8

                              rounded-xl

                              bg-emerald-500/10

                              flex
                              items-center
                              justify-center
                            "
                          >
                            <Timer
                              className="
                                w-4
                                h-4

                                text-emerald-500
                              "
                            />
                          </div>

                          <div>
                            <p
                              className="
                                text-[8px]

                                text-slate-400
                              "
                            >
                              Estimated waiting
                            </p>

                            <p
                              className="
                                text-sm

                                font-black

                                text-emerald-600
                                dark:text-emerald-400
                              "
                            >
                              {selectedCentre.wait}
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            mt-2.5

                            text-[7px]

                            leading-relaxed

                            text-slate-500
                            dark:text-slate-400
                          "
                        >
                          Your scheduled arrival helps reduce uncertainty at the
                          procurement centre.
                        </p>
                      </div>

                      {/* DECLARATION */}

                      <label
                        className="
                          flex-1
                          min-h-0

                          flex
                          items-start
                          gap-2.5

                          p-3.5

                          rounded-2xl

                          bg-slate-50
                          dark:bg-slate-900/60

                          border
                          border-slate-200
                          dark:border-slate-800

                          cursor-pointer

                          overflow-hidden
                        "
                      >
                        <input
                          type="checkbox"
                          checked={booking.confirmedConsent}
                          onChange={(e) =>
                            updateBooking({
                              confirmedConsent: e.target.checked,
                            })
                          }
                          className="
                            mt-0.5

                            w-4
                            h-4

                            accent-emerald-600

                            shrink-0
                          "
                        />

                        <div>
                          <p
                            className="
                              text-[9px]

                              font-black
                            "
                          >
                            Booking declaration
                          </p>

                          <p
                            className="
                              mt-1.5

                              text-[8px]

                              leading-relaxed

                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            I confirm that the produce details and vehicle
                            information provided are correct and that the
                            produce will be available for inspection and
                            procurement at the selected centre.
                          </p>

                          <div
                            className="
                              flex
                              items-center
                              gap-1.5

                              mt-3

                              text-[7px]

                              font-bold

                              text-emerald-600
                              dark:text-emerald-400
                            "
                          >
                            <ShieldCheck
                              className="
                                w-3
                                h-3
                              "
                            />
                            Secure digital booking
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================
              ACTION BAR
          ================================================== */}

          <div
            className="
              shrink-0

              px-3
              sm:px-4
              lg:px-5

              py-2.5

              border-t
              border-slate-200
              dark:border-slate-800

              bg-slate-50/90
              dark:bg-slate-950/60

              backdrop-blur

              flex
              items-center
              justify-between

              gap-3
            "
          >
            <div
              className="
                hidden
                sm:flex

                items-center
                gap-2

                min-w-0
              "
            >
              <div
                className="
                  w-7
                  h-7

                  rounded-lg

                  bg-emerald-500/10

                  flex
                  items-center
                  justify-center
                "
              >
                <ShieldCheck
                  className="
                    w-3.5
                    h-3.5

                    text-emerald-500
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-[8px]

                    font-black
                  "
                >
                  Secure booking
                </p>

                <p
                  className="
                    text-[7px]

                    text-slate-400
                  "
                >
                  Your slot is reserved after confirmation.
                </p>
              </div>
            </div>

            <div
              className="
                flex

                items-center

                gap-2

                w-full
                sm:w-auto
              "
            >
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="
                    h-9

                    px-3
                    sm:px-4

                    rounded-xl

                    bg-white
                    dark:bg-slate-900

                    border
                    border-slate-200
                    dark:border-slate-700

                    text-[9px]
                    sm:text-[10px]

                    font-black

                    flex
                    items-center
                    justify-center

                    gap-1.5

                    transition

                    hover:bg-slate-50
                    dark:hover:bg-slate-800
                  "
                >
                  <ArrowLeft
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="
                  h-9

                  flex-1
                  sm:flex-none

                  min-w-[150px]

                  px-5

                  rounded-xl

                  bg-emerald-600
                  hover:bg-emerald-500

                  text-white

                  text-[10px]
                  sm:text-[11px]

                  font-black

                  shadow-lg
                  shadow-emerald-600/20

                  transition-all

                  hover:-translate-y-0.5

                  active:translate-y-0

                  flex
                  items-center
                  justify-center

                  gap-2
                "
              >
                {activeStep < 5 ? (
                  <>
                    Continue
                    <ArrowRight
                      className="
                        w-3.5
                        h-3.5
                      "
                    />
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      className="
                        w-3.5
                        h-3.5
                      "
                    />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ===================================================
          SUCCESS MODAL
      ==================================================== */}

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0

              z-[300]

              flex
              items-center
              justify-center

              p-4

              bg-slate-950/70

              backdrop-blur-md
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              transition={{
                duration: 0.25,
              }}
              className="
                relative

                w-full
                max-w-md

                max-h-[90vh]

                overflow-y-auto

                rounded-[28px]

                bg-white
                dark:bg-[#0c1410]

                border
                border-slate-200
                dark:border-slate-800

                shadow-2xl
              "
            >
              {/* CLOSE */}

              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="
                  absolute

                  top-4
                  right-4

                  z-10

                  w-8
                  h-8

                  rounded-xl

                  bg-slate-100
                  dark:bg-slate-800

                  flex
                  items-center
                  justify-center

                  text-slate-500

                  hover:text-slate-900
                  dark:hover:text-white
                "
              >
                <X
                  className="
                    w-4
                    h-4
                  "
                />
              </button>

              <div
                className="
                  p-5
                "
              >
                {/* SUCCESS */}

                <div
                  className="
                    text-center
                  "
                >
                  <div
                    className="
                      relative

                      w-16
                      h-16

                      mx-auto

                      rounded-2xl

                      bg-emerald-500/10

                      flex
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        absolute

                        inset-0

                        rounded-2xl

                        bg-emerald-500/10

                        animate-pulse
                      "
                    />

                    <CheckCircle2
                      className="
                        relative

                        w-9
                        h-9

                        text-emerald-500
                      "
                    />
                  </div>

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-1

                      mt-3

                      px-2
                      py-1

                      rounded-full

                      bg-emerald-500/10

                      text-emerald-600
                      dark:text-emerald-400

                      text-[7px]

                      font-black

                      uppercase
                      tracking-widest
                    "
                  >
                    <Sparkles
                      className="
                        w-2.5
                        h-2.5
                      "
                    />
                    Successfully booked
                  </div>

                  <h2
                    className="
                      mt-2

                      text-xl

                      font-black

                      tracking-tight
                    "
                  >
                    Your slot is confirmed
                  </h2>

                  <p
                    className="
                      mt-1

                      text-[9px]

                      leading-relaxed

                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Arrive at the selected procurement centre during your
                    scheduled window.
                  </p>
                </div>

                {/* TOKEN */}

                <div
                  className="
                    relative

                    mt-5

                    p-4

                    rounded-2xl

                    bg-gradient-to-br
                    from-emerald-500/[0.08]
                    to-slate-50

                    dark:from-emerald-400/[0.06]
                    dark:to-slate-900

                    border
                    border-emerald-500/20

                    text-center

                    overflow-hidden
                  "
                >
                  <div
                    className="
                      absolute

                      -top-16
                      -right-16

                      w-32
                      h-32

                      rounded-full

                      bg-emerald-500/10

                      blur-2xl
                    "
                  />

                  <p
                    className="
                      relative

                      text-[7px]

                      uppercase
                      tracking-[0.2em]

                      font-black

                      text-slate-400
                    "
                  >
                    Procurement Token
                  </p>

                  <p
                    className="
                      relative

                      mt-1

                      text-2xl

                      font-black
                      font-mono

                      tracking-wider

                      text-emerald-600
                      dark:text-emerald-400
                    "
                  >
                    {generatedToken}
                  </p>

                  {/* QR */}

                  <div
                    className="
                      relative

                      w-28
                      h-28

                      mx-auto
                      mt-4

                      rounded-2xl

                      bg-white

                      border
                      border-slate-200

                      flex
                      items-center
                      justify-center

                      shadow-sm
                    "
                  >
                    <QrCode
                      className="
                        w-20
                        h-20

                        text-slate-900
                      "
                    />
                  </div>

                  <p
                    className="
                      relative

                      mt-2

                      text-[7px]

                      text-slate-400
                    "
                  >
                    Show this token at the procurement gate.
                  </p>
                </div>

                {/* QUICK DETAILS */}

                <div
                  className="
                    grid
                    grid-cols-2

                    gap-2

                    mt-3
                  "
                >
                  <SmallSuccessStat
                    icon={MapPin}
                    label="Centre"
                    value={selectedCentre.name}
                  />

                  <SmallSuccessStat
                    icon={CalendarIcon}
                    label="Arrival"
                    value={`${booking.selectedDate} Sept`}
                  />

                  <SmallSuccessStat
                    icon={Clock}
                    label="Time"
                    value={booking.timeSlot}
                  />

                  <SmallSuccessStat
                    icon={Wheat}
                    label="Produce"
                    value={`${booking.quantity} Q`}
                  />
                </div>

                {/* DOWNLOAD */}

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "Gate pass download will be available after API integration.",
                    )
                  }
                  className="
                    mt-4

                    w-full

                    h-10

                    rounded-xl

                    bg-slate-950
                    dark:bg-white

                    text-white
                    dark:text-slate-950

                    text-[10px]

                    font-black

                    flex
                    items-center
                    justify-center

                    gap-2

                    hover:opacity-90

                    transition
                  "
                >
                  <Download
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                  Download Gate Pass
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   PAGE SECTION HEADER
========================================================= */

function PageSectionHeader({ eyebrow, title, description }) {
  return (
    <div
      className="
        flex
        items-start
        justify-between

        gap-4

        shrink-0
      "
    >
      <div
        className="
          flex
          items-start
          gap-2.5

          min-w-0
        "
      >
        <div
          className="
            w-8
            h-8

            rounded-xl

            bg-emerald-500/10

            flex
            items-center
            justify-center

            text-emerald-600
            dark:text-emerald-400

            shrink-0
          "
        >
          <Leaf
            className="
              w-4
              h-4
            "
          />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-[7px]

              font-black

              uppercase
              tracking-[0.16em]

              text-emerald-600
              dark:text-emerald-400
            "
          >
            {eyebrow}
          </p>

          <h2
            className="
              mt-0.5

              text-sm
              sm:text-base

              font-black

              tracking-tight

              text-slate-950
              dark:text-white
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-0.5

              text-[8px]
              sm:text-[9px]

              text-slate-500
              dark:text-slate-400
            "
          >
            {description}
          </p>
        </div>
      </div>

      <div
        className="
          hidden
          md:flex

          items-center
          gap-1

          px-2
          py-1

          rounded-lg

          bg-slate-100
          dark:bg-slate-800

          text-[7px]

          font-bold

          text-slate-400
        "
      >
        <CircleCheck
          className="
            w-3
            h-3

            text-emerald-500
          "
        />
        Auto-saved
      </div>
    </div>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({ children }) {
  return (
    <label
      className="
        text-[8px]

        uppercase
        tracking-[0.12em]

        font-black

        text-slate-400
      "
    >
      {children}
    </label>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div
      className="
        p-2

        rounded-xl

        bg-white
        dark:bg-slate-900

        border
        border-slate-200
        dark:border-slate-800
      "
    >
      <div
        className="
          flex
          items-center
          gap-1

          text-slate-400
        "
      >
        <Icon
          className="
            w-2.5
            h-2.5
          "
        />

        <span
          className="
            text-[6px]

            font-bold

            uppercase
          "
        >
          {label}
        </span>
      </div>

      <div
        className="
          flex
          items-baseline
          gap-1

          mt-0.5
        "
      >
        <span
          className="
            text-[10px]

            font-black
          "
        >
          {value}
        </span>

        <span
          className="
            text-[6px]

            text-slate-400
          "
        >
          {helper}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   QUANTITY BUTTON
========================================================= */

function QuantityButton({ children, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{
        scale: 1.04,
      }}
      whileTap={{
        scale: 0.94,
      }}
      onClick={onClick}
      className="
        w-10
        h-10

        rounded-xl

        bg-white
        dark:bg-slate-900

        border
        border-slate-200
        dark:border-slate-700

        text-lg

        font-black

        shadow-sm

        hover:border-emerald-400
      "
    >
      {children}
    </motion.button>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({ children, icon: Icon = Info }) {
  return (
    <div
      className="
        shrink-0

        flex
        items-start
        gap-2

        p-2.5

        rounded-xl

        bg-emerald-500/[0.05]
        dark:bg-emerald-400/[0.05]

        border
        border-emerald-500/15

        text-[8px]

        leading-relaxed

        text-emerald-700
        dark:text-emerald-300
      "
    >
      <Icon
        className="
          w-3.5
          h-3.5

          text-emerald-500

          shrink-0
        "
      />

      <span>{children}</span>
    </div>
  );
}

/* =========================================================
   SMALL DETAIL
========================================================= */

function SmallDetail({ icon: Icon, value }) {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5

        min-w-0

        px-2.5
        py-2

        rounded-xl

        bg-white
        dark:bg-slate-900/80

        border
        border-emerald-500/10
      "
    >
      <Icon
        className="
          w-3
          h-3

          text-emerald-500

          shrink-0
        "
      />

      <span
        className="
          text-[8px]

          font-semibold

          text-slate-500
          dark:text-slate-400

          truncate
        "
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   REVIEW HIGHLIGHT
========================================================= */

function ReviewHighlight({ icon: Icon, label, value }) {
  return (
    <div
      className="
        min-w-0

        p-2.5

        rounded-2xl

        bg-slate-50
        dark:bg-slate-900/60

        border
        border-slate-200
        dark:border-slate-800
      "
    >
      <div
        className="
          flex
          items-center
          gap-1.5
        "
      >
        <Icon
          className="
            w-3.5
            h-3.5

            text-emerald-500
          "
        />

        <span
          className="
            text-[7px]

            font-bold

            text-slate-400
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-1

          text-[8px]

          font-black

          truncate
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   REVIEW ROW
========================================================= */

function ReviewRow({ icon: Icon, label, value, highlight = false }) {
  return (
    <div
      className="
        flex
        items-center

        gap-2.5

        px-3.5
        py-2

        border-b
        border-slate-100
        dark:border-slate-800

        last:border-b-0
      "
    >
      <div
        className="
          w-6
          h-6

          rounded-lg

          bg-slate-50
          dark:bg-slate-800

          flex
          items-center
          justify-center

          shrink-0
        "
      >
        <Icon
          className="
            w-3
            h-3

            text-slate-400
          "
        />
      </div>

      <span
        className="
          text-[7px]

          text-slate-400

          shrink-0
        "
      >
        {label}
      </span>

      <span
        className={`
          ml-auto

          text-[8px]

          font-black

          text-right

          ${
            highlight
              ? `
                text-emerald-600
                dark:text-emerald-400
              `
              : `
                text-slate-800
                dark:text-slate-200
              `
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   CALENDAR LEGEND
========================================================= */

function CalendarLegend({ type, label }) {
  const classes = {
    available: "bg-emerald-500",
    few: "bg-amber-500",
    full: "bg-rose-500",
  };

  return (
    <span
      className="
        flex
        items-center
        gap-1

        text-[6px]

        font-bold

        text-slate-400
      "
    >
      <span
        className={`
          w-1.5
          h-1.5

          rounded-full

          ${classes[type]}
        `}
      />

      {label}
    </span>
  );
}

/* =========================================================
   SUCCESS STAT
========================================================= */

function SmallSuccessStat({ icon: Icon, label, value }) {
  return (
    <div
      className="
        p-2.5

        rounded-xl

        bg-slate-50
        dark:bg-slate-900

        border
        border-slate-200
        dark:border-slate-800
      "
    >
      <div
        className="
          flex
          items-center
          gap-1
        "
      >
        <Icon
          className="
            w-3
            h-3

            text-emerald-500
          "
        />

        <span
          className="
            text-[6px]

            font-bold

            text-slate-400
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-1

          text-[8px]

          font-black

          truncate
        "
      >
        {value}
      </p>
    </div>
  );
}
