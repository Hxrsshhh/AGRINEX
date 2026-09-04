"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import useSWR from "swr";
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  History,
  Loader2,
  PackageCheck,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  Users,
  Wheat,
  X,
} from "lucide-react";

import { Html5Qrcode } from "html5-qrcode";

/* ============================================================
   FETCHER
============================================================ */

const fetcher = (url) =>
  fetch(url, {
    credentials: "include",
    cache: "no-store",
  }).then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message ||
          "Failed to load bookings"
      );
    }

    return data;
  });

/* ============================================================
   HELPERS
============================================================ */

const toDateStr = (value = new Date()) =>
  new Date(value)
    .toISOString()
    .split("T")[0];

const fmtDate = (value) => {
  if (!value) return "--";

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const fmtTime = (value) => {
  if (!value) return "--";

  if (
    /^\d{1,2}:\d{2}/.test(
      value
    )
  ) {
    const [
      hour,
      minute,
    ] = value
      .split(":")
      .map(Number);

    const suffix =
      hour >= 12
        ? "PM"
        : "AM";

    const h =
      hour % 12 || 12;

    return `${h}:${String(
      minute
    ).padStart(2, "0")} ${suffix}`;
  }

  return new Date(
    value
  ).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/* ============================================================
   REAL BOOKING STATUSES
============================================================ */

const STATUS_MAP = {
  CONFIRMED: {
    label: "Confirmed",
    cls:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },

  ARRIVED: {
    label: "Arrived",
    cls:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900",
    dot: "bg-cyan-500",
  },

  VERIFIED: {
    label: "Verified",
    cls:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900",
    dot: "bg-indigo-500",
  },

  WAITING: {
    label: "Waiting",
    cls:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
    dot: "bg-amber-500",
  },

  PROCESSING: {
    label: "Processing",
    cls:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900",
    dot: "bg-violet-500",
  },

  COMPLETED: {
    label: "Completed",
    cls:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    dot: "bg-blue-500",
  },

  CANCELLED: {
    label: "Cancelled",
    cls:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
    dot: "bg-red-500",
  },

  NO_SHOW: {
    label: "No Show",
    cls:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    dot: "bg-slate-400",
  },
};

function StatusBadge({
  status,
}) {
  const config =
    STATUS_MAP[status] ||
    STATUS_MAP.CONFIRMED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-black ${config.cls}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {config.label}
    </span>
  );
}

/* ============================================================
   MODAL
============================================================ */

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxW = "max-w-md",
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        className={`flex max-h-[90dvh] w-full ${maxW} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              {title}
            </h3>

            {subtitle && (
              <p className="text-[8px] text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function OfficerBookingsPage() {
  const today =
    useMemo(
      () => toDateStr(),
      []
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    centreFilter,
    setCentreFilter,
  ] = useState("ALL");

  const [
    dateFilter,
    setDateFilter,
  ] = useState("TODAY");

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);

  const [
    modal,
    setModal,
  ] = useState(null);

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    lastAction,
    setLastAction,
  ] = useState("");

  /* ----------------------------------------------------------
     API URL
  ---------------------------------------------------------- */

  const apiUrl =
    dateFilter === "ALL"
      ? "/api/officer/bookings"
      : `/api/officer/bookings?date=${today}`;

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    apiUrl,
    fetcher,
    {
      refreshInterval: 5000,
      keepPreviousData: true,
    }
  );

  const bookings =
    Array.isArray(
      data?.bookings
    )
      ? data.bookings
      : [];

  /* ----------------------------------------------------------
     FILTER
  ---------------------------------------------------------- */

  const filtered =
    useMemo(() => {
      const q =
        search
          .toLowerCase()
          .trim();

      return bookings.filter(
        (booking) => {
          const matchSearch =
            !q ||
            [
              booking.farmer?.name,
              booking.farmer?.mobile,
              booking.farmer?.email,
              booking.bookingId,
              booking.tokenNumber,
              booking.queue
                ?.tokenNumber,
            ].some((value) =>
              String(
                value || ""
              )
                .toLowerCase()
                .includes(q)
            );

          const matchStatus =
            statusFilter ===
              "ALL" ||
            booking.status ===
              statusFilter;

          const matchCentre =
            centreFilter ===
              "ALL" ||
            booking.centre?.name ===
              centreFilter;

          return (
            matchSearch &&
            matchStatus &&
            matchCentre
          );
        }
      );
    }, [
      bookings,
      search,
      statusFilter,
      centreFilter,
    ]);

  /* ----------------------------------------------------------
     CENTRES
  ---------------------------------------------------------- */

  const centres =
    useMemo(
      () =>
        [
          ...new Set(
            bookings
              .map(
                (b) =>
                  b.centre?.name
              )
              .filter(Boolean)
          ),
        ],
      [bookings]
    );

  /* ----------------------------------------------------------
     UPDATE BOOKING
  ---------------------------------------------------------- */

  const updateBooking =
    async (
      booking,
      action,
      extra = {}
    ) => {
      if (!booking) return;

      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/officer/bookings",
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                bookingId:
                  booking.bookingId,

                action,

                ...extra,
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
              "Action failed"
          );
        }

        setLastAction(
          `${action} completed for ${
            booking.farmer?.name ||
            "farmer"
          }`
        );

        setModal(null);
        setReason("");

        await mutate();

        if (result.booking) {
          setSelectedBooking(
            result.booking
          );
        }
      } catch (err) {
        setLastAction(
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

  /* ----------------------------------------------------------
     QR
  ---------------------------------------------------------- */

  const handleQr =
    useCallback(
      async (text) => {
        try {
          let bookingId =
            text.trim();

          try {
            const parsed =
              JSON.parse(text);

            bookingId =
              parsed?.bookingId ||
              bookingId;
          } catch {}

          const local =
            bookings.find(
              (booking) =>
                String(
                  booking.bookingId
                ).toLowerCase() ===
                String(
                  bookingId
                ).toLowerCase()
            );

          if (local) {
            setSelectedBooking(
              local
            );

            setModal(null);

            return;
          }

          const response =
            await fetch(
              `/api/officer/bookings?search=${encodeURIComponent(
                bookingId
              )}`,
              {
                credentials:
                  "include",
                cache:
                  "no-store",
              }
            );

          const result =
            await response.json();

          const found =
            result?.bookings?.find(
              (booking) =>
                String(
                  booking.bookingId
                ).toLowerCase() ===
                String(
                  bookingId
                ).toLowerCase()
            );

          if (!found) {
            throw new Error(
              "Booking not found at your centre"
            );
          }

          setSelectedBooking(
            found
          );

          setModal(null);
        } catch (err) {
          setLastAction(
            err.message
          );
        }
      },
      [bookings]
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="flex h-full w-full select-none flex-col overflow-hidden bg-slate-50 p-3 dark:bg-slate-950 sm:p-4 lg:p-5">
      {/* HEADER */}

      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600">
              Officer Desk
            </span>
          </div>

          <h1 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
            Procurement Bookings
          </h1>

          {data?.centre?.name && (
            <p className="mt-0.5 text-[8px] font-bold text-slate-400">
              {data.centre.name}
            </p>
          )}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() =>
              setModal(
                "scanner"
              )
            }
            className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-[8px] font-black text-white hover:bg-emerald-700"
          >
            <ScanLine size={12} />
            Scan QR
          </button>

          <button
            onClick={() =>
              mutate()
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw
              size={13}
              className={
                isLoading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="mb-2.5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[8px] font-bold text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle
            size={13}
          />

          {error.message ||
            "Unable to load bookings"}
        </div>
      )}

      {/* ACTION MESSAGE */}

      {lastAction && (
        <div className="mb-2.5 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[8px] font-bold text-emerald-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              size={12}
            />

            {lastAction}
          </div>

          <button
            onClick={() =>
              setLastAction("")
            }
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* STATS */}

      <div className="mb-3 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {[
          [
            "Confirmed",
            "CONFIRMED",
            CheckCircle2,
          ],
          [
            "Arrived",
            "ARRIVED",
            Users,
          ],
          [
            "Verified",
            "VERIFIED",
            ShieldCheck,
          ],
          [
            "Waiting",
            "WAITING",
            Clock,
          ],
          [
            "Processing",
            "PROCESSING",
            Wheat,
          ],
          [
            "Completed",
            "COMPLETED",
            PackageCheck,
          ],
          [
            "Cancelled",
            "CANCELLED",
            Ban,
          ],
          [
            "No Show",
            "NO_SHOW",
            AlertCircle,
          ],
        ].map(
          ([
            label,
            value,
            Icon,
          ]) => (
            <button
              key={value}
              onClick={() =>
                setStatusFilter(
                  statusFilter ===
                    value
                    ? "ALL"
                    : value
                )
              }
              className={`rounded-xl border p-2 text-left transition ${
                statusFilter ===
                value
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[7px] font-bold uppercase">
                  {label}
                </span>

                <Icon
                  size={11}
                  className="text-emerald-500"
                />
              </div>

              <p className="mt-0.5 text-base font-black leading-none text-slate-900 dark:text-white">
                {
                  bookings.filter(
                    (b) =>
                      b.status ===
                      value
                  ).length
                }
              </p>
            </button>
          )
        )}
      </div>

      {/* FILTERS */}

      <div className="mb-3 flex shrink-0 flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search booking ID, farmer, mobile or token..."
            className="h-8 w-full rounded-lg bg-slate-50 pl-7 pr-3 text-[9px] font-bold outline-none dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex gap-1.5">
          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value
              )
            }
            className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800 dark:text-white"
          >
            <option value="TODAY">
              Today
            </option>

            <option value="ALL">
              All Dates
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800 dark:text-white"
          >
            <option value="ALL">
              All Status
            </option>

            {Object.entries(
              STATUS_MAP
            ).map(
              ([
                key,
                value,
              ]) => (
                <option
                  key={key}
                  value={key}
                >
                  {value.label}
                </option>
              )
            )}
          </select>

          <select
            value={centreFilter}
            onChange={(e) =>
              setCentreFilter(
                e.target.value
              )
            }
            className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800 dark:text-white"
          >
            <option value="ALL">
              All Centres
            </option>

            {centres.map(
              (centre) => (
                <option
                  key={centre}
                  value={centre}
                >
                  {centre}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* BOOKINGS */}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {isLoading &&
          !bookings.length ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2
                size={20}
                className="animate-spin text-emerald-600"
              />
            </div>
          ) : filtered.length ? (
            filtered.map(
              (booking) => (
                <button
                  key={
                    booking._id ||
                    booking.bookingId
                  }
                  onClick={() =>
                    setSelectedBooking(
                      booking
                    )
                  }
                  className="flex w-full items-center justify-between p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-black text-emerald-600">
                      {booking.farmer?.name?.[0] ||
                        "F"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[10px] font-black text-slate-900 dark:text-white">
                          {booking.farmer?.name ||
                            "Unknown Farmer"}
                        </p>

                        <span className="text-[7px] font-bold text-emerald-600">
                          {booking.bookingId}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-[8px] text-slate-400">
                        {fmtDate(
                          booking.date
                        )}{" "}
                        •{" "}
                        {fmtTime(
                          booking.slot
                            ?.startTime
                        )}{" "}
                        •{" "}
                        {booking.commodity
                          ?.name ||
                          "Produce"}{" "}
                        (
                        {booking.expectedQuantity ??
                          "--"}{" "}
                        Qtl)
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      status={
                        booking.status
                      }
                    />

                    <ChevronRight
                      size={13}
                      className="text-slate-300"
                    />
                  </div>
                </button>
              )
            )
          ) : (
            <div className="flex h-56 flex-col items-center justify-center text-slate-400">
              <Calendar
                size={22}
                className="mb-2 opacity-40"
              />

              <p className="text-[9px] font-bold">
                No bookings found
              </p>

              <p className="mt-1 text-[7px]">
                {dateFilter ===
                "TODAY"
                  ? "No bookings for today at your assigned centre."
                  : "There are no bookings matching your filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
         BOOKING DRAWER
      ====================================================== */}

      {selectedBooking && (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <span className="text-[7px] font-bold uppercase text-emerald-600">
                Booking Pass
              </span>

              <h2 className="text-xs font-black text-slate-900 dark:text-white">
                {
                  selectedBooking.bookingId
                }
              </h2>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() =>
                  setModal(
                    "history"
                  )
                }
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 dark:border-slate-800"
              >
                <History size={12} />
              </button>

              <button
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 dark:border-slate-800"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto py-3 text-[8px]">
            {/* STATUS */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900">
              <div>
                <span className="text-[7px] font-bold uppercase text-slate-400">
                  Status
                </span>

                <div className="mt-1">
                  <StatusBadge
                    status={
                      selectedBooking.status
                    }
                  />
                </div>
              </div>

              {selectedBooking.tokenNumber && (
                <div className="text-right">
                  <span className="text-[7px] font-bold uppercase text-slate-400">
                    Token
                  </span>

                  <p className="text-sm font-black text-emerald-600">
                    {
                      selectedBooking.tokenNumber
                    }
                  </p>
                </div>
              )}
            </div>

            {/* FARMER */}

            <div className="space-y-1 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800">
              <span className="font-black text-slate-900 dark:text-white">
                Farmer Profile
              </span>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Name</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {
                    selectedBooking
                      .farmer
                      ?.name
                  }
                </span>
              </div>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Mobile</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {
                    selectedBooking
                      .farmer
                      ?.mobile ||
                    "--"
                  }
                </span>
              </div>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Verified</span>

                <span className="font-bold text-emerald-600">
                  {selectedBooking
                    .farmer
                    ?.verification
                    ?.isVerified
                    ? "Yes"
                    : "Pending"}
                </span>
              </div>

              {selectedBooking
                .farmer
                ?.email && (
                <div className="flex justify-between gap-3 text-slate-500">
                  <span>Email</span>

                  <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                    {
                      selectedBooking
                        .farmer
                        .email
                    }
                  </span>
                </div>
              )}
            </div>

            {/* APPOINTMENT */}

            <div className="space-y-1 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800">
              <span className="font-black text-slate-900 dark:text-white">
                Appointment
              </span>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Centre</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {
                    selectedBooking
                      .centre
                      ?.name
                  }
                </span>
              </div>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Date</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {fmtDate(
                    selectedBooking.date
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Time</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {fmtTime(
                    selectedBooking
                      .slot
                      ?.startTime
                  )}{" "}
                  -{" "}
                  {fmtTime(
                    selectedBooking
                      .slot
                      ?.endTime
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Produce</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {
                    selectedBooking
                      .commodity
                      ?.name
                  }
                </span>
              </div>

              <div className="flex justify-between gap-3 text-slate-500">
                <span>Quantity</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {
                    selectedBooking.expectedQuantity
                  }{" "}
                  Qtl
                </span>
              </div>

              {selectedBooking.vehicleNumber && (
                <div className="flex justify-between gap-3 text-slate-500">
                  <span>Vehicle</span>

                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {
                      selectedBooking
                        .vehicleNumber
                    }
                  </span>
                </div>
              )}
            </div>

            {/* QUEUE */}

            {selectedBooking.queue && (
              <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 dark:border-amber-900 dark:bg-amber-950/20">
                <span className="font-black text-slate-900 dark:text-white">
                  Queue
                </span>

                <div className="flex justify-between text-slate-500">
                  <span>Position</span>

                  <span className="font-black text-amber-600">
                    {selectedBooking
                      .queue
                      .position ??
                      "--"}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Queue Status</span>

                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {
                      selectedBooking
                        .queue
                        .status
                    }
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Wait</span>

                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {
                      selectedBooking.estimatedWaitMin ??
                      0
                    }{" "}
                    min
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}

          <div className="grid shrink-0 grid-cols-2 gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
            {selectedBooking.status ===
              "CONFIRMED" && (
              <>
                <button
                  disabled={loading}
                  onClick={() =>
                    updateBooking(
                      selectedBooking,
                      "VERIFY_FARMER"
                    )
                  }
                  className="h-8 rounded-lg bg-indigo-600 text-[8px] font-black text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Verify Farmer
                </button>

                <button
                  disabled={loading}
                  onClick={() =>
                    updateBooking(
                      selectedBooking,
                      "ARRIVE"
                    )
                  }
                  className="h-8 rounded-lg bg-emerald-600 text-[8px] font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Check In
                </button>
              </>
            )}

            {selectedBooking.status ===
              "ARRIVED" && (
              <>
                {!selectedBooking
                  .farmer
                  ?.verification
                  ?.isVerified && (
                  <button
                    disabled={loading}
                    onClick={() =>
                      updateBooking(
                        selectedBooking,
                        "VERIFY_FARMER"
                      )
                    }
                    className="col-span-2 h-8 rounded-lg bg-indigo-600 text-[8px] font-black text-white"
                  >
                    Verify Farmer
                  </button>
                )}

                <button
                  disabled={loading}
                  onClick={() =>
                    updateBooking(
                      selectedBooking,
                      "QUEUE"
                    )
                  }
                  className="col-span-2 h-8 rounded-lg bg-amber-500 text-[8px] font-black text-white"
                >
                  Add To Queue
                </button>
              </>
            )}

            {selectedBooking.status ===
              "VERIFIED" && (
              <button
                disabled={loading}
                onClick={() =>
                  updateBooking(
                    selectedBooking,
                    "QUEUE"
                  )
                }
                className="col-span-2 h-8 rounded-lg bg-amber-500 text-[8px] font-black text-white"
              >
                Add To Queue
              </button>
            )}

            {selectedBooking.status ===
              "WAITING" && (
              <button
                disabled={loading}
                onClick={() =>
                  updateBooking(
                    selectedBooking,
                    "START_PROCESSING"
                  )
                }
                className="col-span-2 h-8 rounded-lg bg-violet-600 text-[8px] font-black text-white"
              >
                Start Procurement
              </button>
            )}

            {selectedBooking.status ===
              "PROCESSING" && (
              <button
                disabled={loading}
                onClick={() =>
                  updateBooking(
                    selectedBooking,
                    "COMPLETE"
                  )
                }
                className="col-span-2 h-8 rounded-lg bg-blue-600 text-[8px] font-black text-white"
              >
                Complete Procurement
              </button>
            )}

            {![
              "COMPLETED",
              "CANCELLED",
              "NO_SHOW",
            ].includes(
              selectedBooking.status
            ) && (
              <>
                <button
                  disabled={loading}
                  onClick={() =>
                    setModal(
                      "rebook"
                    )
                  }
                  className="h-8 rounded-lg border border-slate-200 text-[8px] font-bold dark:border-slate-800"
                >
                  Rebook
                </button>

                <button
                  disabled={loading}
                  onClick={() =>
                    setModal({
                      type: "cancel",
                      action:
                        "CANCEL",
                    })
                  }
                  className="h-8 rounded-lg border border-red-200 bg-red-50 text-[8px] font-bold text-red-600 dark:border-red-900 dark:bg-red-950/20"
                >
                  Cancel
                </button>
              </>
            )}

            {[
              "CONFIRMED",
              "ARRIVED",
              "VERIFIED",
              "WAITING",
            ].includes(
              selectedBooking.status
            ) && (
              <button
                disabled={loading}
                onClick={() =>
                  setModal({
                    type: "cancel",
                    action:
                      "NO_SHOW",
                  })
                }
                className="col-span-2 h-8 rounded-lg border border-slate-200 text-[8px] font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400"
              >
                Mark No Show
              </button>
            )}
          </div>
        </aside>
      )}

      {/* ======================================================
         QR SCANNER
      ====================================================== */}

      {modal ===
        "scanner" && (
        <ModalShell
          title="Scan Gate Pass QR"
          subtitle="Scan the farmer's AGRINEX booking QR"
          onClose={() =>
            setModal(null)
          }
        >
          <div
            id="qr-reader"
            className="min-h-[260px] overflow-hidden rounded-xl bg-black"
          />

          <ScannerHandler
            onResult={
              handleQr
            }
          />
        </ModalShell>
      )}

      {/* ======================================================
         HISTORY
      ====================================================== */}

      {modal ===
        "history" &&
        selectedBooking && (
          <ModalShell
            title="Booking History"
            subtitle={
              selectedBooking.bookingId
            }
            onClose={() =>
              setModal(null)
            }
          >
            <div className="space-y-4 border-l border-dashed border-emerald-500 pl-4 text-[8px]">
              <div>
                <p className="font-black text-slate-900 dark:text-white">
                  Booking Created
                </p>

                <p className="text-slate-400">
                  {fmtDate(
                    selectedBooking.createdAt
                  )}
                </p>
              </div>

              <div>
                <p className="font-black text-slate-900 dark:text-white">
                  Current Status
                </p>

                <div className="mt-1">
                  <StatusBadge
                    status={
                      selectedBooking.status
                    }
                  />
                </div>
              </div>

              {selectedBooking.cancellationReason && (
                <div>
                  <p className="font-black text-slate-900 dark:text-white">
                    Reason
                  </p>

                  <p className="mt-1 text-slate-500">
                    {
                      selectedBooking.cancellationReason
                    }
                  </p>
                </div>
              )}
            </div>
          </ModalShell>
        )}

      {/* ======================================================
         CANCEL / NO SHOW
      ====================================================== */}

      {modal?.type ===
        "cancel" && (
        <ModalShell
          title={
            modal.action ===
            "NO_SHOW"
              ? "Mark No Show"
              : "Cancel Booking"
          }
          subtitle="Enter a reason"
          onClose={() => {
            setModal(null);
            setReason("");
          }}
        >
          <textarea
            rows={4}
            value={reason}
            onChange={(e) =>
              setReason(
                e.target.value
              )
            }
            placeholder="Enter reason..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />

          <button
            disabled={
              !reason.trim() ||
              loading
            }
            onClick={() =>
              updateBooking(
                selectedBooking,
                modal.action,
                {
                  cancellationReason:
                    reason,
                }
              )
            }
            className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-[9px] font-black text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading && (
              <Loader2
                size={12}
                className="animate-spin"
              />
            )}

            Confirm
          </button>
        </ModalShell>
      )}

      {/* ======================================================
         REBOOK
      ====================================================== */}

      {modal ===
        "rebook" &&
        selectedBooking && (
          <ModalShell
            title="Rebook Farmer"
            subtitle="Choose another available slot at this centre"
            onClose={() =>
              setModal(null)
            }
          >
            <RebookContent
              booking={
                selectedBooking
              }
              onSuccess={async (
                booking
              ) => {
                setModal(null);

                await mutate();

                if (booking) {
                  setSelectedBooking(
                    booking
                  );
                }
              }}
            />
          </ModalShell>
        )}
    </main>
  );
}

/* ============================================================
   QR SCANNER COMPONENT
============================================================ */

function ScannerHandler({
  onResult,
}) {
  useEffect(() => {
    let scanner;

    const start =
      async () => {
        try {
          scanner =
            new Html5Qrcode(
              "qr-reader"
            );

          await scanner.start(
            {
              facingMode:
                "environment",
            },
            {
              fps: 10,
              qrbox: 220,
            },
            (text) => {
              scanner
                .stop()
                .catch(
                  () => {}
                );

              onResult(text);
            },
            () => {}
          );
        } catch (error) {
          console.error(
            "QR scanner error:",
            error
          );
        }
      };

    start();

    return () => {
      if (scanner) {
        scanner
          .stop()
          .catch(
            () => {}
          );
      }
    };
  }, [onResult]);

  return null;
}

/* ============================================================
   REBOOK
============================================================ */

function RebookContent({
  booking,
  onSuccess,
}) {
  const [
    date,
    setDate,
  ] = useState(
    toDateStr()
  );

  const [
    slotId,
    setSlotId,
  ] = useState("");

  const [
    slots,
    setSlots,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let cancelled =
      false;

    const loadSlots =
      async () => {
        setError("");
        setSlots([]);
        setSlotId("");

        try {
          const response =
            await fetch(
              `/api/officer/slots?date=${encodeURIComponent(
                date
              )}`,
              {
                credentials:
                  "include",
                cache:
                  "no-store",
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Unable to load slots"
            );
          }

          /*
           * Support both:
           * { data: { slots: [] } }
           * { slots: [] }
           */

          const raw =
            Array.isArray(
              result?.data?.slots
            )
              ? result.data.slots
              : Array.isArray(
                  result?.slots
                )
              ? result.slots
              : [];

          const available =
            raw.filter(
              (slot) =>
                slot.status ===
                "AVAILABLE" &&
                Number(
                  slot.bookedCount ||
                    0
                ) <
                  Number(
                    slot.capacity ||
                      0
                  )
            );

          if (!cancelled) {
            setSlots(
              available
            );
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err.message
            );
          }
        }
      };

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [date]);

  const submit =
    async () => {
      if (!slotId) return;

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/officer/bookings",
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                bookingId:
                  booking.bookingId,

                action:
                  "REBOOK",

                slotId,
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
              "Rebooking failed"
          );
        }

        onSuccess(
          result.booking
        );
      } catch (err) {
        setError(
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="space-y-2 text-[8px]">
      <input
        type="date"
        value={date}
        min={toDateStr()}
        onChange={(e) =>
          setDate(
            e.target.value
          )
        }
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-[9px] font-bold outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-[8px] font-bold text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="max-h-48 space-y-1 overflow-y-auto">
        {slots.length ? (
          slots.map(
            (slot) => {
              const id =
                slot._id ||
                slot.id;

              const remaining =
                Math.max(
                  0,
                  Number(
                    slot.capacity ||
                      0
                  ) -
                    Number(
                      slot.bookedCount ||
                        0
                    )
                );

              return (
                <button
                  key={id}
                  onClick={() =>
                    setSlotId(
                      id
                    )
                  }
                  className={`w-full rounded-lg border p-2 text-left transition ${
                    String(
                      slotId
                    ) ===
                    String(id)
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="font-black">
                    {fmtTime(
                      slot.startTime
                    )}{" "}
                    -{" "}
                    {fmtTime(
                      slot.endTime
                    )}
                  </div>

                  <div className="mt-0.5 text-slate-400">
                    {remaining}{" "}
                    slots remaining
                  </div>
                </button>
              );
            }
          )
        ) : (
          <div className="rounded-lg bg-slate-50 p-4 text-center text-slate-400 dark:bg-slate-900">
            No available slots
            for this date.
          </div>
        )}
      </div>

      <button
        disabled={
          !slotId ||
          loading
        }
        onClick={
          submit
        }
        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-[9px] font-black text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading && (
          <Loader2
            size={12}
            className="animate-spin"
          />
        )}

        Confirm Rebooking
      </button>
    </div>
  );
}