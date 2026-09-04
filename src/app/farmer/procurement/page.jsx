"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Search,
  CheckCircle2,
  Check,
  ChevronRight,
  ChevronLeft,
  Store,
  Wheat,
  MapPin,
  Clock3,
  CalendarDays,
  Truck,
  Tractor,
  ShieldCheck,
  SlidersHorizontal,
  RefreshCw,
  Loader2,
  AlertCircle,
  Download,
  QrCode,
  RotateCcw,
  ListChecks,
  X,
} from "lucide-react";

/* ============================================================
   VEHICLES
============================================================ */

const VEHICLE_TYPES = [
  {
    id: "TRACTOR",
    label: "Tractor",
    icon: Tractor,
  },
  {
    id: "TRACTOR_TROLLEY",
    label: "Tractor + Trolley",
    icon: Truck,
  },
  {
    id: "MINI_TRUCK",
    label: "Mini Truck",
    icon: Truck,
  },
  {
    id: "TRUCK",
    label: "Truck",
    icon: Truck,
  },
];

/* ============================================================
   HELPERS
============================================================ */

const getTodayString = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const formatDateForApi = (date) => {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return "Not selected";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Not selected";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateLong = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "--";

  const parts = String(time).split(":");

  let hour = Number(parts[0]);
  const minute = parts[1] || "00";

  if (Number.isNaN(hour)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${String(hour).padStart(
    2,
    "0"
  )}:${minute} ${suffix}`;
};

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
};

const getCentreLocation = (centre) => {
  if (!centre?.address) {
    return "Location not available";
  }

  const parts = [
    centre.address.village,
    centre.address.district,
    centre.address.state,
    centre.address.pincode,
  ].filter(Boolean);

  return (
    parts.join(", ") ||
    "Location not available"
  );
};

const getCentreStatusLabel = (status) => {
  if (status === "ACTIVE") return "Open";
  if (status === "INACTIVE") return "Closed";
  if (status === "CLOSED") return "Closed";

  return status || "Unknown";
};

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ProcurementPage() {
  const router = useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  /* ============================================================
     DATABASE DATA
  ============================================================ */

  const [centres, setCentres] = useState([]);
  const [commodities, setCommodities] = useState([]);

  /*
   * Store slots by centre ID.
   *
   * {
   *   centreId: [slots]
   * }
   */
  const [centreSlots, setCentreSlots] =
    useState({});

  /* ============================================================
     PAGE STATE
  ============================================================ */

  const [selectedCentre, setSelectedCentre] =
    useState(null);

  const [selectedCommodity, setSelectedCommodity] =
    useState(null);

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState(getTodayString());

  const [selectedCrop, setSelectedCrop] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("nearest");

  const [showFilters, setShowFilters] =
    useState(false);

  /* ============================================================
     BOOKING STATE
  ============================================================ */

  const [showBooking, setShowBooking] =
    useState(false);

  const [quantity, setQuantity] =
    useState("25");

  const [vehicleType, setVehicleType] =
    useState("TRACTOR_TROLLEY");

  const [vehicleNumber, setVehicleNumber] =
    useState("");

  const [bookingError, setBookingError] =
    useState("");

  const [bookingLoading, setBookingLoading] =
    useState(false);

  /* ============================================================
     SUCCESS STATE
  ============================================================ */

  const [createdBooking, setCreatedBooking] =
    useState(null);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [qrDownloading, setQrDownloading] =
    useState(false);

  const [gatePassDownloading, setGatePassDownloading] =
    useState(false);

  /* ============================================================
     GENERAL UI
  ============================================================ */

  const [loading, setLoading] =
    useState(true);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  /* ============================================================
     TOAST
  ============================================================ */

  const showToast = (message) => {
    setToast(message);

    window.clearTimeout(
      showToast.timeout
    );

    showToast.timeout =
      window.setTimeout(() => {
        setToast("");
      }, 3000);
  };

  /* ============================================================
     API JSON HELPER
  ============================================================ */

  const readJson = async (response) => {
    const data =
      await response.json().catch(() => ({}));

    if (
      !response.ok ||
      data.success === false
    ) {
      throw new Error(
        data.message ||
          "Something went wrong."
      );
    }

    return data;
  };

  /* ============================================================
     FETCH INITIAL DATA
  ============================================================ */

  const fetchInitialData = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [
        centresResponse,
        commoditiesResponse,
      ] = await Promise.all([
        fetch(
          "/api/procurement/centres",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/procurement/commodities",
          {
            cache: "no-store",
          }
        ),
      ]);

      const centresResult =
        await centresResponse.json();

      const commoditiesResult =
        await commoditiesResponse.json();

      if (
        !centresResponse.ok ||
        !centresResult.success
      ) {
        throw new Error(
          centresResult.message ||
            "Failed to load procurement centres."
        );
      }

      if (
        !commoditiesResponse.ok ||
        !commoditiesResult.success
      ) {
        throw new Error(
          commoditiesResult.message ||
            "Failed to load commodities."
        );
      }

      const loadedCentres =
        Array.isArray(
          centresResult.data
        )
          ? centresResult.data
          : Array.isArray(
              centresResult.centres
            )
          ? centresResult.centres
          : [];

      const loadedCommodities =
        Array.isArray(
          commoditiesResult.data
        )
          ? commoditiesResult.data
          : Array.isArray(
              commoditiesResult.commodities
            )
          ? commoditiesResult.commodities
          : [];

      setCentres(loadedCentres);
      setCommodities(
        loadedCommodities
      );

      if (
        loadedCentres.length > 0
      ) {
        setSelectedCentre(
          (previous) => {
            if (!previous) {
              return loadedCentres[0];
            }

            const stillExists =
              loadedCentres.find(
                (centre) =>
                  String(
                    centre._id
                  ) ===
                  String(
                    previous._id
                  )
              );

            return (
              stillExists ||
              loadedCentres[0]
            );
          }
        );
      }
    } catch (fetchError) {
      console.error(
        "Procurement data error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load procurement data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ============================================================
     AUTH + INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }

    if (
      session.user.role &&
      session.user.role !== "FARMER"
    ) {
      setError(
        "Only farmer accounts can access procurement booking."
      );

      setLoading(false);
      return;
    }

    fetchInitialData();
  }, [
    sessionStatus,
    session,
    router,
  ]);

  /* ============================================================
     FETCH CENTRE SLOTS
  ============================================================ */

  const fetchCentreSlots = async (
    centre,
    options = {}
  ) => {
    if (!centre?._id) {
      return [];
    }

    const {
      commodityId = "",
      date = "",
    } = options;

    try {
      setLoadingSlots(true);

      const params =
        new URLSearchParams();

      params.set(
        "centreId",
        String(centre._id)
      );

      if (commodityId) {
        params.set(
          "commodityId",
          String(commodityId)
        );
      }

      if (date) {
        params.set(
          "date",
          String(date)
        );
      }

      const response =
        await fetch(
          `/api/procurement/slots?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to load available slots."
        );
      }

      const rawSlots =
        Array.isArray(
          result.data
        )
          ? result.data
          : Array.isArray(
              result.slots
            )
          ? result.slots
          : [];

      const normalizedSlots =
        rawSlots.map((slot) => {
          const capacity =
            Number(
              slot.capacity || 0
            );

          const booked =
            Number(
              slot.bookedCount || 0
            );

          const calculatedRemaining =
            Math.max(
              0,
              capacity - booked
            );

          const remaining =
            Number.isFinite(
              Number(
                slot.remaining
              )
            )
              ? Number(
                  slot.remaining
                )
              : calculatedRemaining;

          /*
           * IMPORTANT:
           * Keep the rate directly on the slot.
           *
           * The backend should return:
           * minimumSupportPrice
           */
          const minimumSupportPrice =
            Number(
              slot.minimumSupportPrice ??
                slot.commodity
                  ?.minimumSupportPrice ??
                0
            );

          return {
            ...slot,

            remaining,

            minimumSupportPrice,

            unit:
              slot.unit ||
              slot.commodity?.unit ||
              "QUINTAL",

            commodityName:
              slot.commodityName ||
              slot.commodity?.name ||
              "",

            commodityCode:
              slot.commodityCode ||
              slot.commodity?.code ||
              "",
          };
        });

      setCentreSlots(
        (previous) => ({
          ...previous,
          [centre._id]:
            normalizedSlots,
        })
      );

      return normalizedSlots;
    } catch (slotError) {
      console.error(
        "Slot loading error:",
        slotError
      );

      showToast(
        slotError.message ||
          "Unable to load available slots."
      );

      return [];
    } finally {
      setLoadingSlots(false);
    }
  };

  /* ============================================================
     LOAD ALL SLOTS FOR SELECTED CENTRE
  ============================================================ */

  useEffect(() => {
    if (!selectedCentre?._id) {
      return;
    }

    fetchCentreSlots(
      selectedCentre
    );
  }, [
    selectedCentre?._id,
  ]);

  /* ============================================================
     CENTRE SLOTS
  ============================================================ */

  const selectedCentreSlots =
    selectedCentre?._id
      ? centreSlots[
          selectedCentre._id
        ] || []
      : [];

  /* ============================================================
     AVAILABLE COMMODITIES
  ============================================================ */

  const centreCommodities =
    useMemo(() => {
      const commodityIds =
        new Set();

      selectedCentreSlots.forEach(
        (slot) => {
          if (
            slot.commodityId
          ) {
            commodityIds.add(
              String(
                slot.commodityId
              )
            );
          }
        }
      );

      /*
       * If the slot route already
       * contains commodity information,
       * use the global commodity list
       * to preserve the complete object.
       */
      const fromGlobal =
        commodities.filter(
          (commodity) =>
            commodityIds.has(
              String(
                commodity._id
              )
            )
        );

      /*
       * Fallback from slots.
       */
      const fromSlots =
        selectedCentreSlots
          .filter(
            (slot) =>
              slot.commodityId
          )
          .map((slot) => ({
            _id:
              slot.commodityId,

            name:
              slot.commodityName,

            code:
              slot.commodityCode,

            unit:
              slot.unit,

            minimumSupportPrice:
              Number(
                slot.minimumSupportPrice ||
                  0
              ),
          }));

      const merged =
        new Map();

      fromGlobal.forEach(
        (commodity) => {
          merged.set(
            String(
              commodity._id
            ),
            commodity
          );
        }
      );

      fromSlots.forEach(
        (commodity) => {
          const key = String(
            commodity._id
          );

          if (!merged.has(key)) {
            merged.set(
              key,
              commodity
            );
          }
        }
      );

      return Array.from(
        merged.values()
      );
    }, [
      selectedCentreSlots,
      commodities,
    ]);

  /* ============================================================
     AUTO SELECT COMMODITY
  ============================================================ */

  useEffect(() => {
    if (
      centreCommodities.length ===
      0
    ) {
      setSelectedCommodity(
        null
      );
      return;
    }

    setSelectedCommodity(
      (previous) => {
        if (!previous) {
          return centreCommodities[0];
        }

        const exists =
          centreCommodities.find(
            (commodity) =>
              String(
                commodity._id
              ) ===
              String(
                previous._id
              )
          );

        return (
          exists ||
          centreCommodities[0]
        );
      }
    );
  }, [
    selectedCentre?._id,
    centreCommodities,
  ]);

  /* ============================================================
     DATE SLOTS
  ============================================================ */

  const slotsForSelectedDate =
    useMemo(() => {
      if (!selectedDate) {
        return [];
      }

      return selectedCentreSlots.filter(
        (slot) => {
          if (!slot.date) {
            return false;
          }

          const slotDate =
            new Date(
              slot.date
            );

          if (
            Number.isNaN(
              slotDate.getTime()
            )
          ) {
            return false;
          }

          const formatted =
            formatDateForApi(
              slotDate
            );

          return (
            formatted ===
            selectedDate
          );
        }
      );
    }, [
      selectedCentreSlots,
      selectedDate,
    ]);

  /* ============================================================
     FILTERED SLOTS
  ============================================================ */

  const filteredDateSlots =
    useMemo(() => {
      let slots =
        slotsForSelectedDate;

      if (
        selectedCommodity?._id
      ) {
        slots = slots.filter(
          (slot) =>
            String(
              slot.commodityId
            ) ===
            String(
              selectedCommodity._id
            )
        );
      }

      return [...slots].sort(
        (a, b) =>
          String(
            a.startTime || ""
          ).localeCompare(
            String(
              b.startTime || ""
            )
          )
      );
    }, [
      slotsForSelectedDate,
      selectedCommodity,
    ]);

  /* ============================================================
     AUTO SELECT SLOT ONLY IF VALID
  ============================================================ */

  useEffect(() => {
    if (
      !selectedSlot
    ) {
      return;
    }

    const exists =
      filteredDateSlots.some(
        (slot) =>
          String(slot._id) ===
          String(
            selectedSlot._id
          )
      );

    if (!exists) {
      setSelectedSlot(null);
    }
  }, [
    filteredDateSlots,
    selectedSlot,
  ]);

  /* ============================================================
     CENTRE META
  ============================================================ */

  const getCentreMeta = (
    centre
  ) => {
    const slots =
      centreSlots[
        centre?._id
      ] || [];

    const available =
      slots.filter(
        (slot) =>
          slot.status ===
            "AVAILABLE" &&
          Number(
            slot.remaining || 0
          ) > 0
      );

    const nextSlot =
      [...available].sort(
        (a, b) => {
          const dateA =
            new Date(
              a.date
            ).getTime();

          const dateB =
            new Date(
              b.date
            ).getTime();

          if (
            dateA !== dateB
          ) {
            return (
              dateA - dateB
            );
          }

          return String(
            a.startTime || ""
          ).localeCompare(
            String(
              b.startTime || ""
            )
          );
        }
      )[0];

    const capacity =
      slots.reduce(
        (total, slot) =>
          total +
          Number(
            slot.capacity || 0
          ),
        0
      );

    const remaining =
      slots.reduce(
        (total, slot) =>
          total +
          Number(
            slot.remaining || 0
          ),
        0
      );

    const commodity =
      commodities.find(
        (item) =>
          slots.some(
            (slot) =>
              String(
                slot.commodityId
              ) ===
              String(
                item._id
              )
          )
      );

    const slotCommodity =
      slots.find(
        (slot) =>
          Number(
            slot.minimumSupportPrice
          ) > 0
      );

    const price =
      Number(
        commodity?.minimumSupportPrice ??
          slotCommodity?.minimumSupportPrice ??
          0
      );

    return {
      slots,
      available,
      nextSlot,
      capacity,
      remaining,
      commodity,
      price,
    };
  };

  /* ============================================================
     FILTER CENTRES
  ============================================================ */

  const filteredCentres =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      let list =
        centres.filter(
          (centre) => {
            const meta =
              getCentreMeta(
                centre
              );

            const location =
              getCentreLocation(
                centre
              ).toLowerCase();

            const searchMatch =
              !normalizedSearch ||
              centre.name
                ?.toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              centre.centreId
                ?.toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              location.includes(
                normalizedSearch
              );

            const cropMatch =
              selectedCrop ===
                "All" ||
              meta.commodity
                ?.name ===
                selectedCrop;

            return (
              searchMatch &&
              cropMatch
            );
          }
        );

      if (
        sortBy ===
        "highest_price"
      ) {
        list.sort(
          (a, b) =>
            getCentreMeta(
              b
            ).price -
            getCentreMeta(
              a
            ).price
        );
      }

      if (
        sortBy ===
        "earliest"
      ) {
        list.sort(
          (a, b) => {
            const slotA =
              getCentreMeta(
                a
              ).nextSlot;

            const slotB =
              getCentreMeta(
                b
              ).nextSlot;

            if (!slotA) return 1;
            if (!slotB) return -1;

            const dateA =
              new Date(
                slotA.date
              ).getTime();

            const dateB =
              new Date(
                slotB.date
              ).getTime();

            if (
              dateA !== dateB
            ) {
              return (
                dateA - dateB
              );
            }

            return String(
              slotA.startTime ||
                ""
            ).localeCompare(
              String(
                slotB.startTime ||
                  ""
              )
            );
          }
        );
      }

      /*
       * There is no guaranteed geo
       * coordinate in the current
       * ProcurementCentre schema.
       *
       * Therefore "nearest" keeps
       * database ordering instead
       * of inventing distances.
       */
      return list;
    }, [
      centres,
      centreSlots,
      commodities,
      search,
      selectedCrop,
      sortBy,
    ]);

  /* ============================================================
     CROP OPTIONS
  ============================================================ */

  const cropOptions =
    useMemo(() => {
      return [
        ...new Set(
          commodities
            .map(
              (commodity) =>
                commodity.name
            )
            .filter(Boolean)
        ),
      ];
    }, [
      commodities,
    ]);

  /* ============================================================
     SELECT CENTRE
  ============================================================ */

  const handleSelectCentre = async (
    centre
  ) => {
    setSelectedCentre(
      centre
    );

    setSelectedCommodity(
      null
    );

    setSelectedSlot(
      null
    );

    setSelectedDate(
      getTodayString()
    );

    setBookingError("");

    /*
     * Always refresh slots when
     * changing centre.
     */
    await fetchCentreSlots(
      centre
    );
  };

  /* ============================================================
     OPEN BOOKING
  ============================================================ */

  const openBooking = async (
    centre
  ) => {
    if (!centre?._id) {
      showToast(
        "Centre information is unavailable."
      );
      return;
    }

    if (
      centre.status &&
      centre.status !==
        "ACTIVE"
    ) {
      showToast(
        "This procurement centre is not currently active."
      );
      return;
    }

    setSelectedCentre(
      centre
    );

    setSelectedSlot(
      null
    );

    setSelectedDate(
      getTodayString()
    );

    setQuantity("25");

    setVehicleType(
      "TRACTOR_TROLLEY"
    );

    setVehicleNumber("");

    setBookingError("");

    setShowBooking(true);

    /*
     * Refresh from database so
     * current availability is used.
     */
    await fetchCentreSlots(
      centre
    );
  };

  /* ============================================================
     CHANGE COMMODITY
  ============================================================ */

  const handleCommodityChange = (
    event
  ) => {
    const commodity =
      centreCommodities.find(
        (item) =>
          String(
            item._id
          ) ===
          String(
            event.target.value
          )
      );

    setSelectedCommodity(
      commodity || null
    );

    setSelectedSlot(null);
  };

  /* ============================================================
     CHANGE DATE
  ============================================================ */

  const handleDateChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSelectedDate(value);

    setSelectedSlot(null);

    /*
     * Explicitly fetch selected
     * centre/date/commodity.
     */
    if (
      selectedCentre?._id
    ) {
      fetchCentreSlots(
        selectedCentre,
        {
          commodityId:
            selectedCommodity?._id ||
            "",
          date: value,
        }
      );
    }
  };

  /* ============================================================
     SELECT SLOT
  ============================================================ */

  const handleSlotSelect = (
    slot
  ) => {
    if (
      slot.status !==
        "AVAILABLE" ||
      Number(
        slot.remaining || 0
      ) <= 0
    ) {
      showToast(
        "This slot is not available."
      );
      return;
    }

    setSelectedSlot(
      slot
    );
  };

  /* ============================================================
     RESET BOOKING
  ============================================================ */

  const resetBookingForm = () => {
    setSelectedDate(
      getTodayString()
    );

    setQuantity("25");

    setVehicleType(
      "TRACTOR_TROLLEY"
    );

    setVehicleNumber("");

    setSelectedSlot(null);

    setBookingError("");
  };

  /* ============================================================
     CLOSE BOOKING
  ============================================================ */

  const closeBooking = () => {
    if (bookingLoading) {
      return;
    }

    setShowBooking(false);

    setBookingError("");
  };

  /* ============================================================
     QUANTITY VALIDATION
  ============================================================ */

  const validateQuantity = () => {
    const value =
      Number(quantity);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return "Quantity must be greater than zero.";
    }

    return "";
  };

  /* ============================================================
     VEHICLE VALIDATION
  ============================================================ */

  const validateVehicleNumber = () => {
    const value =
      vehicleNumber
        .trim()
        .toUpperCase();

    if (!value) {
      return "Vehicle number is required.";
    }

    if (
      value.length < 4 ||
      value.length > 20
    ) {
      return "Enter a valid vehicle registration number.";
    }

    return "";
  };

  /* ============================================================
     CONFIRM BOOKING
  ============================================================ */

  const confirmBooking = async () => {
    try {
      setBookingError("");

      if (!session?.user?.id) {
        setBookingError(
          "Your session has expired. Please sign in again."
        );
        return;
      }

      if (
        !selectedCentre?._id
      ) {
        setBookingError(
          "Please select a procurement centre."
        );
        return;
      }

      if (
        !selectedCommodity?._id
      ) {
        setBookingError(
          "Please select a commodity."
        );
        return;
      }

      if (!selectedSlot?._id) {
        setBookingError(
          "Please select an available time slot."
        );
        return;
      }

      if (
        selectedSlot.status !==
          "AVAILABLE" ||
        Number(
          selectedSlot.remaining || 0
        ) <= 0
      ) {
        setBookingError(
          "This slot is no longer available. Please select another slot."
        );
        return;
      }

      const quantityError =
        validateQuantity();

      if (quantityError) {
        setBookingError(
          quantityError
        );
        return;
      }

      const vehicleError =
        validateVehicleNumber();

      if (vehicleError) {
        setBookingError(
          vehicleError
        );
        return;
      }

      setBookingLoading(true);

      const response =
        await fetch(
          "/api/procurement/bookings",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              centreId:
                selectedCentre._id,

              slotId:
                selectedSlot._id,

              commodityId:
                selectedCommodity._id,

              expectedQuantity:
                Number(quantity),

              vehicleType:
                vehicleType,

              vehicleNumber:
                vehicleNumber
                  .trim()
                  .toUpperCase(),
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to create booking."
        );
      }

      const booking =
        result.data ||
        result.booking;

      if (!booking) {
        throw new Error(
          "Booking was created but no booking information was returned."
        );
      }

      setCreatedBooking(
        booking
      );

      setShowBooking(
        false
      );

      setShowSuccess(
        true
      );

      /*
       * Refresh slot availability
       * after successful booking.
       */
      await fetchCentreSlots(
        selectedCentre
      );

      showToast(
        "Procurement slot booked successfully."
      );
    } catch (bookingError) {
      console.error(
        "Booking error:",
        bookingError
      );

      setBookingError(
        bookingError.message ||
          "Unable to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  /* ============================================================
     QR
  ============================================================ */

  const getQrPayload = () => {
    if (!createdBooking) {
      return "";
    }

    return JSON.stringify({
      type:
        "AGRINEX_PROCUREMENT_GATE_PASS",

      bookingId:
        createdBooking.bookingId ||
        "",

      tokenNumber:
        createdBooking.tokenNumber ||
        "",

      farmerId:
        createdBooking.farmer?.id ||
        session?.user?.id ||
        "",

      centreId:
        createdBooking.centre
          ?.centreId ||
        "",

      slotId:
        createdBooking.slot?.id ||
        "",

      status:
        createdBooking.status ||
        "CONFIRMED",
    });
  };

  const getQrUrl = () => {
    const payload =
      getQrPayload();

    if (!payload) {
      return "";
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&format=png&data=${encodeURIComponent(
      payload
    )}`;
  };

  /* ============================================================
     DOWNLOAD QR
  ============================================================ */

  const downloadQRCode =
    async () => {
      if (!createdBooking) {
        showToast(
          "Booking information is unavailable."
        );
        return;
      }

      try {
        setQrDownloading(
          true
        );

        const response =
          await fetch(
            getQrUrl()
          );

        if (!response.ok) {
          throw new Error(
            "QR generation failed."
          );
        }

        const blob =
          await response.blob();

        const blobUrl =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          blobUrl;

        anchor.download = `AGRINEX-${
          createdBooking.bookingId ||
          "BOOKING"
        }-QR.png`;

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
          blobUrl
        );

        showToast(
          "QR code downloaded."
        );
      } catch (qrError) {
        console.error(
          "QR download error:",
          qrError
        );

        showToast(
          "Unable to download QR code."
        );
      } finally {
        setQrDownloading(
          false
        );
      }
    };

  /* ============================================================
     DOWNLOAD GATE PASS
  ============================================================ */

  const downloadGatePass =
    () => {
      if (!createdBooking) {
        showToast(
          "Booking information is unavailable."
        );
        return;
      }

      try {
        setGatePassDownloading(
          true
        );

        const slot =
          createdBooking.slot;

        const centre =
          createdBooking.centre;

        const commodity =
          createdBooking.commodity;

        const vehicle =
          createdBooking.vehicle;

        const farmer =
          createdBooking.farmer;

        const content = `
==================================================
                    AGRINEX
             PROCUREMENT GATE PASS
==================================================

Booking ID:
${createdBooking.bookingId || "N/A"}

Token Number:
${createdBooking.tokenNumber || "N/A"}

Status:
${createdBooking.status || "CONFIRMED"}

--------------------------------------------------
FARMER
--------------------------------------------------

Name:
${farmer?.name || session?.user?.name || "N/A"}

Mobile:
${farmer?.mobile || session?.user?.mobile || "N/A"}

Farmer ID:
${farmer?.id || session?.user?.id || "N/A"}

--------------------------------------------------
PROCUREMENT CENTRE
--------------------------------------------------

Centre:
${centre?.name || selectedCentre?.name || "N/A"}

Centre ID:
${centre?.centreId || "N/A"}

Address:
${
  centre?.address
    ? [
        centre.address.village,
        centre.address.district,
        centre.address.state,
        centre.address.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : getCentreLocation(
        selectedCentre
      )
}

--------------------------------------------------
COMMODITY
--------------------------------------------------

Commodity:
${commodity?.name || selectedCommodity?.name || "N/A"}

Code:
${commodity?.code || selectedCommodity?.code || "N/A"}

Unit:
${commodity?.unit || selectedCommodity?.unit || "QUINTAL"}

Expected Quantity:
${createdBooking.quantity || quantity || "N/A"} Quintal(s)

MSP Rate:
₹${formatCurrency(
  commodity?.minimumSupportPrice ??
    selectedCommodity?.minimumSupportPrice ??
    selectedSlot?.minimumSupportPrice ??
    0
)}

--------------------------------------------------
SCHEDULE
--------------------------------------------------

Date:
${
  slot?.date
    ? formatDateLong(slot.date)
    : formatDateDisplay(
        selectedDate
      )
}

Time:
${
  slot?.startTime
    ? `${formatTime(
        slot.startTime
      )} - ${formatTime(
        slot.endTime
      )}`
    : "N/A"
}

--------------------------------------------------
VEHICLE
--------------------------------------------------

Type:
${vehicle?.type || vehicleType || "N/A"}

Vehicle Number:
${vehicle?.number || vehicleNumber || "N/A"}

--------------------------------------------------
QUEUE
--------------------------------------------------

Queue Position:
${
  createdBooking.queuePosition ??
  "N/A"
}

Estimated Wait:
${
  createdBooking.estimatedWaitMin ??
  0
} minutes

==================================================

Present this gate pass at the procurement centre.

                    AGRINEX
==================================================
`;

        const blob =
          new Blob(
            [content],
            {
              type:
                "text/plain;charset=utf-8",
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href = url;

        anchor.download = `AGRINEX-${
          createdBooking.bookingId ||
          "BOOKING"
        }-GatePass.txt`;

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
          url
        );

        showToast(
          "Gate pass downloaded."
        );
      } catch (gatePassError) {
        console.error(
          "Gate pass error:",
          gatePassError
        );

        showToast(
          "Unable to download gate pass."
        );
      } finally {
        setGatePassDownloading(
          false
        );
      }
    };

  /* ============================================================
     REBOOK
  ============================================================ */

  const handleRebook = async () => {
    setShowSuccess(
      false
    );

    setCreatedBooking(
      null
    );

    resetBookingForm();

    if (
      selectedCentre?._id
    ) {
      await fetchCentreSlots(
        selectedCentre
      );
    }

    setShowBooking(
      true
    );
  };

  /* ============================================================
     MY BOOKINGS
  ============================================================ */

  const handleMyBookings =
    () => {
      setShowSuccess(
        false
      );

      router.push(
        "/farmer/my-bookings"
      );
    };

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh =
    async () => {
      await fetchInitialData(
        false
      );

      if (
        selectedCentre?._id
      ) {
        await fetchCentreSlots(
          selectedCentre
        );
      }

      showToast(
        "Procurement data refreshed."
      );
    };

  /* ============================================================
     SELECTED PRICE
  ============================================================ */

  const selectedPrice =
    Number(
      selectedCommodity?.minimumSupportPrice ??
        selectedSlot?.minimumSupportPrice ??
        0
    );

  const selectedUnit =
    selectedCommodity?.unit ||
    selectedSlot?.unit ||
    "QUINTAL";

  const estimatedValue =
    Number(quantity || 0) *
    selectedPrice;

  const selectedVehicle =
    VEHICLE_TYPES.find(
      (item) =>
        item.id ===
        vehicleType
    ) ||
    VEHICLE_TYPES[1];

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    sessionStatus ===
      "loading" ||
    loading
  ) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-[#080d12]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Wheat className="h-6 w-6 text-emerald-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
            Loading procurement centres...
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error && centres.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-[#080d12] p-5">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-white dark:bg-slate-900 p-6 shadow-xl text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
            Unable to load procurement data
          </h2>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchInitialData()
            }
            className="mt-5 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black inline-flex items-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden bg-slate-50 dark:bg-[#080d12] text-slate-900 dark:text-white flex flex-col">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-lime-500/10 blur-[140px]" />
      </div>

      {/* ======================================================
          TOAST
      ====================================================== */}

      {toast && (
        <div className="fixed left-1/2 top-20 z-[900] -translate-x-1/2 px-4">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900/95 dark:bg-emerald-500 text-white dark:text-slate-950 px-4 py-2.5 text-xs font-bold shadow-2xl border border-white/10">
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="shrink-0 px-4 sm:px-5 pt-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Wheat className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black tracking-tight truncate">
              Mandi Procurement Centres
            </h1>

            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Find an active MSP centre and book your delivery window.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleRefresh
          }
          disabled={refreshing}
          className="shrink-0 h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black flex items-center gap-1.5 hover:border-emerald-400 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />
          <span className="hidden sm:inline">
            Refresh
          </span>
        </button>
      </header>

      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="shrink-0 px-4 sm:px-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-2.5">
            {/* SEARCH */}

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search centre, ID or location..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-xs font-bold placeholder:text-slate-400 focus:border-emerald-500 transition"
              />
            </div>

            {/* CROP */}

            <select
              value={
                selectedCrop
              }
              onChange={(event) =>
                setSelectedCrop(
                  event.target.value
                )
              }
              className="h-10 lg:w-44 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-bold outline-none focus:border-emerald-500"
            >
              <option value="All">
                All Crops
              </option>

              {cropOptions.map(
                (crop) => (
                  <option
                    key={crop}
                    value={crop}
                  >
                    {crop}
                  </option>
                )
              )}
            </select>

            {/* SORT */}

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
              className="h-10 lg:w-44 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-bold outline-none focus:border-emerald-500"
            >
              <option value="nearest">
                Default Order
              </option>

              <option value="earliest">
                Earliest Slot
              </option>

              <option value="highest_price">
                Highest MSP
              </option>
            </select>

            {/* FILTER */}

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (value) =>
                    !value
                )
              }
              className={`h-10 px-3.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                showFilters
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                Active filters
              </span>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCrop(
                    "All"
                  );
                  setSortBy(
                    "nearest"
                  );
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 hover:text-emerald-500"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          MAIN SPLIT
          RIGHT SIDE IS NON-SCROLLABLE
      ====================================================== */}

      <div className="flex-1 min-h-0 px-4 sm:px-5 py-3 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* ====================================================
            LEFT
        ==================================================== */}

        <section className="lg:col-span-8 min-h-0 flex flex-col overflow-hidden">
          <div className="shrink-0 flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {filteredCentres.length}{" "}
              Centres available
            </span>

            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              Live Mandi Data
            </span>
          </div>

          {/* ONLY LEFT SIDE SCROLLS */}

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {filteredCentres.length ===
            0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Store className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700" />

                  <p className="mt-3 text-xs font-black text-slate-500">
                    No procurement centres found.
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Try another crop or search.
                  </p>
                </div>
              </div>
            ) : (
              filteredCentres.map(
                (centre) => {
                  const meta =
                    getCentreMeta(
                      centre
                    );

                  return (
                    <CentreCard
                      key={
                        centre._id
                      }
                      centre={
                        centre
                      }
                      meta={meta}
                      selected={
                        String(
                          selectedCentre?._id
                        ) ===
                        String(
                          centre._id
                        )
                      }
                      onSelect={() =>
                        handleSelectCentre(
                          centre
                        )
                      }
                      onBook={() =>
                        openBooking(
                          centre
                        )
                      }
                    />
                  );
                }
              )
            )}
          </div>
        </section>

        {/* ====================================================
            RIGHT
            IMPORTANT: NO OVERFLOW-Y-AUTO
        ==================================================== */}

        <aside className="lg:col-span-4 min-h-0 h-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm overflow-hidden flex flex-col">
          {selectedCentre ? (
            <>
              {/* HEADER */}

              <div className="shrink-0 pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[8px] uppercase tracking-widest font-black text-slate-400">
                      Selected Centre
                    </span>

                    <h2 className="mt-0.5 text-sm font-black truncate">
                      {
                        selectedCentre.name
                      }
                    </h2>

                    <p className="mt-0.5 text-[9px] text-slate-400 truncate">
                      {getCentreLocation(
                        selectedCentre
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-1 rounded-full border text-[8px] font-black uppercase ${
                      selectedCentre.status ===
                      "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {getCentreStatusLabel(
                      selectedCentre.status
                    )}
                  </span>
                </div>
              </div>

              {/* MSP */}

              <div className="shrink-0 mt-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
                <p className="text-[8px] uppercase tracking-widest font-black text-emerald-700 dark:text-emerald-400">
                  Government MSP Rate
                </p>

                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹
                    {formatCurrency(
                      selectedPrice
                    )}
                  </span>

                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    /{" "}
                    {selectedUnit}
                  </span>
                </div>

                <p className="text-[9px] mt-1 font-bold text-emerald-700/70 dark:text-emerald-300/70">
                  {selectedCommodity?.name ||
                    getCentreMeta(
                      selectedCentre
                    ).commodity
                      ?.name ||
                    "Select a commodity"}
                </p>
              </div>

              {/* STATS */}

              <div className="shrink-0 grid grid-cols-2 gap-2 mt-3">
                <InfoBox
                  icon={Clock3}
                  label="Next Slot"
                  value={
                    getCentreMeta(
                      selectedCentre
                    ).nextSlot
                      ? formatTime(
                          getCentreMeta(
                            selectedCentre
                          )
                            .nextSlot
                            .startTime
                        )
                      : "No slot"
                  }
                />

                <InfoBox
                  icon={MapPin}
                  label="Location"
                  value="Centre"
                />
              </div>

              {/* COMMODITY */}

              <div className="shrink-0 mt-3">
                <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                  Commodity
                </label>

                <select
                  value={
                    selectedCommodity?._id ||
                    ""
                  }
                  onChange={
                    handleCommodityChange
                  }
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-black outline-none focus:border-emerald-500"
                >
                  {centreCommodities.length ===
                  0 ? (
                    <option value="">
                      No commodities available
                    </option>
                  ) : (
                    centreCommodities.map(
                      (
                        commodity
                      ) => (
                        <option
                          key={
                            commodity._id
                          }
                          value={
                            commodity._id
                          }
                        >
                          {
                            commodity.name
                          }
                        </option>
                      )
                    )
                  )}
                </select>
              </div>

              {/* DATE */}

              <div className="shrink-0 mt-2.5">
                <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                  Arrival Date
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />

                  <input
                    type="date"
                    min={
                      getTodayString()
                    }
                    value={
                      selectedDate
                    }
                    onChange={
                      handleDateChange
                    }
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* SLOT SUMMARY */}

              <div className="shrink-0 mt-3 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                  Available Slots
                </span>

                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                  {filteredDateSlots.length}{" "}
                  found
                </span>
              </div>

              {/* SLOTS
                  Fixed-height internal area.
                  Right sidebar itself never scrolls.
              */}

              <div className="shrink-0 mt-2 h-[132px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {loadingSlots ? (
                  <div className="h-full flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                      Loading slots...
                    </div>
                  </div>
                ) : filteredDateSlots.length ===
                  0 ? (
                  <div className="h-full flex flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center px-3">
                    <Clock3 className="h-5 w-5 text-slate-300 dark:text-slate-600" />

                    <p className="mt-1.5 text-[9px] font-black text-slate-500">
                      No slots for this date
                    </p>

                    <p className="text-[8px] text-slate-400 mt-0.5">
                      Select another date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredDateSlots.map(
                      (
                        slot
                      ) => {
                        const available =
                          slot.status ===
                            "AVAILABLE" &&
                          Number(
                            slot.remaining ||
                              0
                          ) >
                            0;

                        const rate =
                          Number(
                            slot.minimumSupportPrice ||
                              selectedPrice ||
                              0
                          );

                        const unit =
                          slot.unit ||
                          selectedUnit ||
                          "QUINTAL";

                        const selected =
                          String(
                            selectedSlot?._id
                          ) ===
                          String(
                            slot._id
                          );

                        return (
                          <button
                            key={
                              slot._id
                            }
                            type="button"
                            disabled={
                              !available
                            }
                            onClick={() =>
                              handleSlotSelect(
                                slot
                              )
                            }
                            className={`w-full p-2.5 rounded-xl border text-left transition ${
                              selected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                : available
                                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p
                                  className={`text-[10px] font-black ${
                                    selected
                                      ? "text-white"
                                      : ""
                                  }`}
                                >
                                  {formatTime(
                                    slot.startTime
                                  )}{" "}
                                  –{" "}
                                  {formatTime(
                                    slot.endTime
                                  )}
                                </p>

                                <p
                                  className={`text-[8px] mt-0.5 ${
                                    selected
                                      ? "text-white/70"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {available
                                    ? `${slot.remaining} slot${
                                        Number(
                                          slot.remaining
                                        ) !==
                                        1
                                          ? "s"
                                          : ""
                                      } remaining`
                                    : "Full / unavailable"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p
                                  className={`text-[10px] font-black ${
                                    selected
                                      ? "text-white"
                                      : "text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  ₹
                                  {formatCurrency(
                                    rate
                                  )}
                                </p>

                                <p
                                  className={`text-[7px] font-bold uppercase ${
                                    selected
                                      ? "text-white/70"
                                      : "text-slate-400"
                                  }`}
                                >
                                  /{" "}
                                  {unit}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* SELECTED SLOT */}

              <div className="shrink-0 mt-2.5">
                {selectedSlot ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-400">
                        Selected slot
                      </p>

                      <p className="text-[10px] font-black truncate">
                        {formatTime(
                          selectedSlot.startTime
                        )}{" "}
                        –{" "}
                        {formatTime(
                          selectedSlot.endTime
                        )}
                      </p>
                    </div>

                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-2.5 text-[9px] font-bold text-slate-400 text-center">
                    Select a time slot to continue.
                  </div>
                )}
              </div>

              {/* BOTTOM CTA */}

              <div className="mt-auto pt-3">
                <button
                  type="button"
                  disabled={
                    !selectedCommodity?._id ||
                    !selectedSlot ||
                    selectedSlot.status !==
                      "AVAILABLE" ||
                    Number(
                      selectedSlot.remaining ||
                        0
                    ) <= 0
                  }
                  onClick={() =>
                    openBooking(
                      selectedCentre
                    )
                  }
                  className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Book Delivery Slot
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Store className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />

                <p className="mt-3 text-xs font-black text-slate-500">
                  Select a centre
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="shrink-0 px-4 sm:px-5 py-2 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between text-[8px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

          <span>
            Official AGRINEX Procurement System
          </span>
        </div>

        <span className="hidden sm:inline">
          Live slot availability
        </span>
      </footer>

      {/* ======================================================
          BOOKING MODAL
      ====================================================== */}

      {showBooking &&
        selectedCentre && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl">
              {/* HEADER */}

              <div className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Store className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[8px] uppercase tracking-widest font-black text-emerald-500">
                      Procurement Booking
                    </p>

                    <h2 className="text-sm font-black truncate">
                      {
                        selectedCentre.name
                      }
                    </h2>

                    <p className="text-[9px] text-slate-400">
                      Complete your delivery details.
                    </p>
                  </div>

                  {/* No close X button as requested previously */}
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin">
                {/* COMMODITY */}

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                    Commodity
                  </label>

                  <select
                    value={
                      selectedCommodity?._id ||
                      ""
                    }
                    onChange={
                      handleCommodityChange
                    }
                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-black outline-none focus:border-emerald-500"
                  >
                    {centreCommodities.map(
                      (
                        commodity
                      ) => (
                        <option
                          key={
                            commodity._id
                          }
                          value={
                            commodity._id
                          }
                        >
                          {
                            commodity.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* RATE */}

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest font-black text-emerald-700 dark:text-emerald-400">
                        Government MSP
                      </p>

                      <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Official procurement rate
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ₹
                        {formatCurrency(
                          selectedPrice
                        )}
                      </p>

                      <p className="text-[8px] font-bold text-slate-400">
                        /{" "}
                        {selectedUnit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DATE + SLOT */}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                      Date
                    </label>

                    <input
                      type="date"
                      min={
                        getTodayString()
                      }
                      value={
                        selectedDate
                      }
                      onChange={
                        handleDateChange
                      }
                      className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-black outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                      Time Slot
                    </label>

                    <select
                      value={
                        selectedSlot?._id ||
                        ""
                      }
                      onChange={(
                        event
                      ) => {
                        const slot =
                          filteredDateSlots.find(
                            (
                              item
                            ) =>
                              String(
                                item._id
                              ) ===
                              String(
                                event
                                  .target
                                  .value
                              )
                          );

                        if (
                          slot
                        ) {
                          handleSlotSelect(
                            slot
                          );
                        }
                      }}
                      className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-black outline-none focus:border-emerald-500"
                    >
                      <option value="">
                        Select slot
                      </option>

                      {filteredDateSlots.map(
                        (
                          slot
                        ) => (
                          <option
                            key={
                              slot._id
                            }
                            value={
                              slot._id
                            }
                            disabled={
                              slot.status !==
                                "AVAILABLE" ||
                              Number(
                                slot.remaining ||
                                  0
                              ) <=
                                0
                            }
                          >
                            {formatTime(
                              slot.startTime
                            )}{" "}
                            -{" "}
                            {formatTime(
                              slot.endTime
                            )}{" "}
                            •{" "}
                            {slot.remaining ||
                              0}{" "}
                            left
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* QUANTITY */}

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                    Expected Quantity
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={
                        quantity
                      }
                      onChange={(
                        event
                      ) =>
                        setQuantity(
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 pr-20 text-xs font-black outline-none focus:border-emerald-500"
                      placeholder="Enter quantity"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                      QUINTALS
                    </span>
                  </div>
                </div>

                {/* VEHICLE */}

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                    Vehicle Type
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {VEHICLE_TYPES.map(
                      (
                        vehicle
                      ) => {
                        const Icon =
                          vehicle.icon;

                        const active =
                          vehicleType ===
                          vehicle.id;

                        return (
                          <button
                            key={
                              vehicle.id
                            }
                            type="button"
                            onClick={() =>
                              setVehicleType(
                                vehicle.id
                              )
                            }
                            className={`h-11 rounded-xl border flex items-center justify-center gap-2 text-[9px] font-black transition ${
                              active
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-emerald-400"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {
                              vehicle.label
                            }
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* VEHICLE NUMBER */}

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-black text-slate-400 mb-1.5">
                    Vehicle Registration Number
                  </label>

                  <input
                    type="text"
                    value={
                      vehicleNumber
                    }
                    onChange={(
                      event
                    ) =>
                      setVehicleNumber(
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="e.g. AS01AB1234"
                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-black uppercase outline-none focus:border-emerald-500"
                  />
                </div>

                {/* SUMMARY */}

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[8px] uppercase tracking-wider font-black text-slate-400">
                        Estimated MSP Value
                      </p>

                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Quantity × official MSP
                      </p>
                    </div>

                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ₹
                      {formatCurrency(
                        estimatedValue
                      )}
                    </p>
                  </div>
                </div>

                {/* ERROR */}

                {bookingError && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />

                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400">
                      {bookingError}
                    </p>
                  </div>
                )}

                {/* ACTIONS */}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    disabled={
                      bookingLoading
                    }
                    onClick={
                      closeBooking
                    }
                    className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      bookingLoading ||
                      !selectedSlot ||
                      selectedSlot.status !==
                        "AVAILABLE" ||
                      Number(
                        selectedSlot.remaining ||
                          0
                      ) <= 0
                    }
                    onClick={
                      confirmBooking
                    }
                    className="flex-[1.5] h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ======================================================
          SUCCESS MODAL
      ====================================================== */}

      {showSuccess &&
        createdBooking && (
          <div className="fixed inset-0 z-[1100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/20 shadow-2xl">
              {/* SUCCESS HEADER */}

              <div className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-white/10 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>

                <h2 className="mt-3 text-base font-black">
                  Booking Confirmed
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  Your procurement delivery slot has been reserved successfully.
                </p>
              </div>

              {/* CONTENT */}

              <div className="p-5 overflow-y-auto max-h-[calc(100vh-13rem)] scrollbar-thin">
                {/* TOKEN */}

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-[8px] uppercase tracking-widest font-black text-emerald-700 dark:text-emerald-400">
                    Your Token Number
                  </p>

                  <p className="mt-1 text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    #
                    {createdBooking.tokenNumber ||
                      "N/A"}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-2 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    <span>
                      Queue:{" "}
                      <strong>
                        {createdBooking.queuePosition ??
                          "N/A"}
                      </strong>
                    </span>

                    <span>•</span>

                    <span>
                      Wait:{" "}
                      <strong>
                        {createdBooking.estimatedWaitMin ??
                          0}{" "}
                        min
                      </strong>
                    </span>
                  </div>
                </div>

                {/* QR */}

                <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 text-center">
                  <div className="w-36 h-36 mx-auto rounded-2xl bg-white p-2 shadow-md">
                    <img
                      src={
                        getQrUrl()
                      }
                      alt="AGRINEX booking QR code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="mt-2 text-[8px] uppercase tracking-widest font-black text-slate-400">
                    Scan at procurement centre
                  </p>
                </div>

                {/* DETAILS */}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <SuccessInfo
                    label="Centre"
                    value={
                      createdBooking
                        .centre
                        ?.name ||
                      selectedCentre.name
                    }
                  />

                  <SuccessInfo
                    label="Commodity"
                    value={
                      createdBooking
                        .commodity
                        ?.name ||
                      selectedCommodity?.name ||
                      "N/A"
                    }
                  />

                  <SuccessInfo
                    label="Quantity"
                    value={`${createdBooking.quantity || quantity} Quintal`}
                  />

                  <SuccessInfo
                    label="Vehicle"
                    value={
                      createdBooking
                        .vehicle
                        ?.number ||
                      vehicleNumber ||
                      "N/A"
                    }
                  />

                  <SuccessInfo
                    label="Date"
                    value={
                      createdBooking
                        .slot?.date
                        ? formatDateLong(
                            createdBooking
                              .slot
                              .date
                          )
                        : formatDateDisplay(
                            selectedDate
                          )
                    }
                  />

                  <SuccessInfo
                    label="Time"
                    value={
                      createdBooking
                        .slot
                        ?.startTime
                        ? `${formatTime(
                            createdBooking
                              .slot
                              .startTime
                          )} - ${formatTime(
                            createdBooking
                              .slot
                              .endTime
                          )}`
                        : "N/A"
                    }
                  />
                </div>

                {/* DOWNLOAD */}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={
                      downloadQRCode
                    }
                    disabled={
                      qrDownloading
                    }
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {qrDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4 text-emerald-500" />
                    )}
                    Download QR
                  </button>

                  <button
                    type="button"
                    onClick={
                      downloadGatePass
                    }
                    disabled={
                      gatePassDownloading
                    }
                    className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {gatePassDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 text-emerald-500" />
                    )}
                    Gate Pass
                  </button>
                </div>

                {/* REQUIRED NEXT ACTIONS */}

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={
                      handleRebook
                    }
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Rebook
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleMyBookings
                    }
                    className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-[10px] font-black flex items-center justify-center gap-2"
                  >
                    <ListChecks className="h-4 w-4" />
                    My Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

/* ============================================================
   CENTRE CARD
============================================================ */

function CentreCard({
  centre,
  meta,
  selected,
  onSelect,
  onBook,
}) {
  const status =
    getCentreStatusLabel(
      centre.status
    );

  const isOpen =
    centre.status ===
    "ACTIVE";

  const capacity =
    Number(
      meta?.capacity || 0
    );

  const remaining =
    Number(
      meta?.remaining || 0
    );

  const availability =
    capacity > 0
      ? Math.min(
          100,
          Math.round(
            (remaining /
              capacity) *
              100
          )
        )
      : 0;

  const price =
    Number(
      meta?.price || 0
    );

  return (
    <div
      onClick={
        onSelect
      }
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/30 shadow-sm"
          : "bg-white/90 dark:bg-slate-900/70 border-slate-200/90 dark:border-white/10 hover:border-emerald-400"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
              selected
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            }`}
          >
            <Store className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-black truncate">
              {centre.name}
            </h3>

            <p className="text-[9px] text-slate-400 truncate mt-0.5">
              {getCentreLocation(
                centre
              )}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase ${
            isOpen
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          }`}
        >
          {status}
        </span>
      </div>

      {/* PRICE */}

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[8px] uppercase tracking-wider font-black text-slate-400">
            MSP Rate
          </p>

          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              ₹
              {formatCurrency(
                price
              )}
            </span>

            <span className="text-[8px] font-bold text-slate-400">
              /{" "}
              {meta?.commodity
                ?.unit ||
                "QUINTAL"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[8px] uppercase tracking-wider font-black text-slate-400">
            Available
          </p>

          <p className="text-xs font-black">
            {remaining}
            <span className="text-[8px] text-slate-400">
              {" "}
              slots
            </span>
          </p>
        </div>
      </div>

      {/* PROGRESS */}

      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mb-1">
          <span>
            Slot capacity
          </span>

          <span>
            {availability}%
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${availability}%`,
            }}
          />
        </div>
      </div>

      {/* NEXT SLOT */}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
          <Clock3 className="h-3 w-3 text-emerald-500" />

          <span>
            Next:{" "}
            <strong className="text-slate-600 dark:text-slate-300">
              {meta?.nextSlot
                ? formatTime(
                    meta
                      .nextSlot
                      .startTime
                  )
                : "No slot"}
            </strong>
          </span>
        </div>

        <button
          type="button"
          disabled={
            !isOpen ||
            !meta?.available
              ?.length
          }
          onClick={(
            event
          ) => {
            event.stopPropagation();

            onBook();
          }}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Book Slot
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   INFO BOX
============================================================ */

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-emerald-500" />

        <span className="text-[8px] uppercase tracking-wider font-black text-slate-400">
          {label}
        </span>
      </div>

      <p className="text-[10px] font-black mt-1 truncate">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   SUCCESS INFO
============================================================ */

function SuccessInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2.5 min-w-0">
      <p className="text-[7px] uppercase tracking-wider font-black text-slate-400">
        {label}
      </p>

      <p className="text-[9px] font-black mt-1 truncate">
        {value || "N/A"}
      </p>
    </div>
  );
}