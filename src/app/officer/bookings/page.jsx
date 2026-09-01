"use client";

import {
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Filter,
    MapPin,
    Search,
    UserCheck,
    Users,
    X,
    XCircle,
    PackageCheck,
    ListFilter,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   INITIAL BOOKINGS
========================================================= */

const initialBookings = [
    {
        id: "BK1024",
        farmer: "Ramesh Kumar",
        farmerId: "FR1024",
        village: "Chas",
        centre: "XYZ Farmer Centre",
        date: "2026-09-01",
        time: "10:30 AM",
        purpose: "Paddy",
        status: "CONFIRMED",
        arrived: true,
        queueToken: null,
        phone: "9876543210",
        createdAt: "Aug 29, 2026",
    },
    {
        id: "BK1025",
        farmer: "Suresh Singh",
        farmerId: "FR1025",
        village: "Bokaro",
        centre: "XYZ Farmer Centre",
        date: "2026-09-01",
        time: "11:00 AM",
        purpose: "Wheat",
        status: "BOOKED",
        arrived: false,
        queueToken: null,
        phone: "9876543211",
        createdAt: "Aug 30, 2026",
    },
    {
        id: "BK1026",
        farmer: "Anita Devi",
        farmerId: "FR1026",
        village: "Kandra",
        centre: "XYZ Farmer Centre",
        date: "2026-09-01",
        time: "11:30 AM",
        purpose: "Paddy",
        status: "COMPLETED",
        arrived: true,
        queueToken: 103,
        phone: "9876543212",
        createdAt: "Aug 28, 2026",
    },
    {
        id: "BK1027",
        farmer: "Mohan Das",
        farmerId: "FR1027",
        village: "Dumri",
        centre: "XYZ Farmer Centre",
        date: "2026-09-01",
        time: "12:00 PM",
        purpose: "Maize",
        status: "CONFIRMED",
        arrived: false,
        queueToken: null,
        phone: "9876543213",
        createdAt: "Aug 30, 2026",
    },
    {
        id: "BK1028",
        farmer: "Sunita Kumari",
        farmerId: "FR1028",
        village: "Pindrajora",
        centre: "XYZ Farmer Centre",
        date: "2026-09-01",
        time: "12:30 PM",
        purpose: "Paddy",
        status: "BOOKED",
        arrived: false,
        queueToken: null,
        phone: "9876543214",
        createdAt: "Aug 31, 2026",
    },
    {
        id: "BK1029",
        farmer: "Rajesh Mahto",
        farmerId: "FR1029",
        village: "Petarwar",
        centre: "XYZ Farmer Centre",
        date: "2026-09-01",
        time: "01:00 PM",
        purpose: "Wheat",
        status: "CANCELLED",
        arrived: false,
        queueToken: null,
        phone: "9876543215",
        createdAt: "Aug 28, 2026",
    },
    {
        id: "BK1030",
        farmer: "Priya Devi",
        farmerId: "FR1030",
        village: "Kasmar",
        centre: "XYZ Farmer Centre",
        date: "2026-09-02",
        time: "10:30 AM",
        purpose: "Paddy",
        status: "BOOKED",
        arrived: false,
        queueToken: null,
        phone: "9876543216",
        createdAt: "Aug 31, 2026",
    },
    {
        id: "BK1031",
        farmer: "Arjun Kumar",
        farmerId: "FR1031",
        village: "Chas",
        centre: "ABC Procurement Centre",
        date: "2026-09-01",
        time: "02:00 PM",
        purpose: "Rice",
        status: "CONFIRMED",
        arrived: true,
        queueToken: null,
        phone: "9876543217",
        createdAt: "Aug 30, 2026",
    },
];

/* =========================================================
   PAGE
========================================================= */

export default function OfficerBookingsPage() {
    const router = useRouter();

    const [bookings, setBookings] = useState(
        initialBookings
    );

    const [selectedBooking, setSelectedBooking] =
        useState(null);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [centreFilter, setCentreFilter] =
        useState("ALL");

    const [dateFilter, setDateFilter] =
        useState("TODAY");

    const [lastAction, setLastAction] =
        useState("Bookings are ready");

    /* =======================================================
       DATE
    ======================================================== */

    const today = "2026-09-01";

    /* =======================================================
       FILTER BOOKINGS
    ======================================================== */

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const searchValue = search
                .toLowerCase()
                .trim();

            const matchesSearch =
                !searchValue ||
                booking.farmer
                    .toLowerCase()
                    .includes(searchValue) ||
                booking.farmerId
                    .toLowerCase()
                    .includes(searchValue) ||
                booking.id
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "ALL" ||
                booking.status === statusFilter;

            const matchesCentre =
                centreFilter === "ALL" ||
                booking.centre === centreFilter;

            const matchesDate =
                dateFilter === "ALL" ||
                (dateFilter === "TODAY" &&
                    booking.date === today);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCentre &&
                matchesDate
            );
        });
    }, [
        bookings,
        search,
        statusFilter,
        centreFilter,
        dateFilter,
    ]);

    /* =======================================================
       STATISTICS
    ======================================================== */

    const todayBookings = bookings.filter(
        (booking) => booking.date === today
    );

    const confirmedCount = todayBookings.filter(
        (booking) => booking.status === "CONFIRMED"
    ).length;

    const waitingCount = todayBookings.filter(
        (booking) =>
            booking.arrived &&
            booking.status === "CONFIRMED"
    ).length;

    const completedCount = todayBookings.filter(
        (booking) => booking.status === "COMPLETED"
    ).length;

    const cancelledCount = todayBookings.filter(
        (booking) => booking.status === "CANCELLED"
    ).length;

    /* =======================================================
       CENTRES
    ======================================================== */

    const centres = [
        ...new Set(
            bookings.map((booking) => booking.centre)
        ),
    ];

    /* =======================================================
       CONFIRM
    ======================================================== */

    const confirmBooking = (id) => {
        const booking = bookings.find(
            (item) => item.id === id
        );

        if (!booking) return;

        setBookings((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        status: "CONFIRMED",
                    }
                    : item
            )
        );

        setLastAction(
            `${booking.farmer}'s booking confirmed`
        );

        setSelectedBooking((current) =>
            current?.id === id
                ? {
                    ...current,
                    status: "CONFIRMED",
                }
                : current
        );
    };

    /* =======================================================
       CANCEL
    ======================================================== */

    const cancelBooking = (id) => {
        const booking = bookings.find(
            (item) => item.id === id
        );

        if (!booking) return;

        setBookings((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        status: "CANCELLED",
                    }
                    : item
            )
        );

        setLastAction(
            `${booking.farmer}'s booking cancelled`
        );

        setSelectedBooking((current) =>
            current?.id === id
                ? {
                    ...current,
                    status: "CANCELLED",
                }
                : current
        );
    };

    /* =======================================================
       MARK ARRIVED
    ======================================================== */

    const markArrived = (id) => {
        const booking = bookings.find(
            (item) => item.id === id
        );

        if (!booking) return;

        if (booking.status !== "CONFIRMED") {
            setLastAction(
                "Booking must be confirmed first"
            );
            return;
        }

        setBookings((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        arrived: true,
                    }
                    : item
            )
        );

        setLastAction(
            `${booking.farmer} marked as arrived`
        );

        setSelectedBooking((current) =>
            current?.id === id
                ? {
                    ...current,
                    arrived: true,
                }
                : current
        );
    };

    /* =======================================================
       ADD TO QUEUE
    ======================================================== */

    const addToQueue = (id) => {
        const booking = bookings.find(
            (item) => item.id === id
        );

        if (!booking) return;

        if (booking.status !== "CONFIRMED") {
            setLastAction(
                "Only confirmed bookings can enter the queue"
            );
            return;
        }

        if (!booking.arrived) {
            setLastAction(
                "Farmer must be marked arrived first"
            );
            return;
        }

        /*
          In the real backend this should create a queue
          entry associated with this booking.
    
          Example:
          POST /api/officer/queue
          {
            bookingId: booking.id,
            farmerId: booking.farmerId
          }
        */

        setLastAction(
            `Token assigned to ${booking.farmer}`
        );

        setSelectedBooking(null);

        router.push(
            `/officer/queue?bookingId=${booking.id}`
        );
    };

    /* =======================================================
       OPEN BOOKING
    ======================================================== */

    const openBooking = (booking) => {
        setSelectedBooking(booking);
    };

    return (
        <main className="h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">

            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col overflow-hidden p-3 sm:p-4 lg:p-5">

                {/* =================================================
            HEADER
        ================================================= */}

                <header className="mb-3 flex shrink-0 items-center justify-between">

                    <div>

                        <div className="flex items-center gap-1.5">

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                                Officer Operations
                            </span>

                        </div>

                        <h1 className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
                            Bookings
                        </h1>

                    </div>

                    <div className="flex items-center gap-2">

                        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex dark:border-slate-800 dark:bg-slate-900">

                            <MapPin
                                size={13}
                                className="text-emerald-600 dark:text-emerald-400"
                            />

                            <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
                                XYZ Farmer Centre
                            </span>

                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            <CalendarDays size={13} />
                        </div>

                    </div>

                </header>

                {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

                <section className="mb-3 shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">

                        {/* SEARCH */}

                        <div className="relative min-w-0 flex-1">

                            <Search
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search farmer / booking ID..."
                                className="
                  h-9
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-3
                  text-[9px]
                  font-semibold
                  text-slate-700
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/10
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-slate-200
                "
                            />

                        </div>

                        {/* FILTERS */}

                        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:w-auto">

                            <FilterSelect
                                value={dateFilter}
                                onChange={setDateFilter}
                                options={[
                                    ["TODAY", "Today"],
                                    ["ALL", "All Dates"],
                                ]}
                            />

                            <FilterSelect
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    ["ALL", "All Status"],
                                    ["BOOKED", "Booked"],
                                    ["CONFIRMED", "Confirmed"],
                                    ["COMPLETED", "Completed"],
                                    ["CANCELLED", "Cancelled"],
                                ]}
                            />

                            <FilterSelect
                                value={centreFilter}
                                onChange={setCentreFilter}
                                options={[
                                    ["ALL", "All Centres"],
                                    ...centres.map((centre) => [
                                        centre,
                                        centre.replace(
                                            " Farmer Centre",
                                            ""
                                        ),
                                    ]),
                                ]}
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setCentreFilter("ALL");
                                    setDateFilter("TODAY");
                                }}
                                className="
                  flex
                  h-9
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-[8px]
                  font-black
                  text-slate-500
                  transition
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
                            >
                                <X size={11} />
                                Clear
                            </button>

                        </div>

                    </div>

                </section>

                {/* =================================================
            LAST ACTION
        ================================================= */}

                <div className="mb-3 flex shrink-0 items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 dark:border-emerald-950 dark:bg-emerald-950/20">

                    <CheckCircle2
                        size={13}
                        className="shrink-0 text-emerald-600 dark:text-emerald-400"
                    />

                    <p className="truncate text-[8px] font-bold text-emerald-700 dark:text-emerald-400">
                        {lastAction}
                    </p>

                </div>

                {/* =================================================
            STATISTICS
        ================================================= */}

                <div className="mb-3 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-5">

                    <BookingStat
                        label="Today's Bookings"
                        value={todayBookings.length}
                        icon={<CalendarDays size={13} />}
                        type="blue"
                    />

                    <BookingStat
                        label="Confirmed"
                        value={confirmedCount}
                        icon={<Check size={13} />}
                        type="green"
                    />

                    <BookingStat
                        label="Waiting"
                        value={waitingCount}
                        icon={<Clock3 size={13} />}
                        type="amber"
                    />

                    <BookingStat
                        label="Completed"
                        value={completedCount}
                        icon={<PackageCheck size={13} />}
                        type="purple"
                    />

                    <BookingStat
                        label="Cancelled"
                        value={cancelledCount}
                        icon={<XCircle size={13} />}
                        type="red"
                    />

                </div>

                {/* =================================================
            MAIN TABLE PANEL
        ================================================= */}

                <section
                    className="
    min-h-0
    h-[432px]
    max-h-[432px]
    shrink-0
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-sm
    dark:border-slate-800
    dark:bg-slate-900
  "
                >
                    {/* PANEL HEADER */}

                    <div
                        className="
      flex
      h-[52px]
      shrink-0
      items-center
      justify-between
      border-b
      border-slate-200
      px-3
      sm:px-4
      dark:border-slate-800
    "
                    >
                        <div className="flex items-center gap-2">

                            <div
                                className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          bg-emerald-50
          text-emerald-600
          dark:bg-emerald-950/40
          dark:text-emerald-400
        "
                            >
                                <ListFilter size={14} />
                            </div>

                            <div>
                                <h2 className="text-xs font-black text-slate-900 dark:text-white">
                                    Booking Records
                                </h2>

                                <p className="hidden text-[7px] text-slate-400 sm:block">
                                    Manage farmer appointments and arrivals
                                </p>
                            </div>

                        </div>

                        <span
                            className="
        rounded-full
        bg-slate-100
        px-2
        py-1
        text-[7px]
        font-black
        text-slate-500
        dark:bg-slate-800
        dark:text-slate-400
      "
                        >
                            {filteredBookings.length} records
                        </span>

                    </div>

                    {/* =================================================
      SCROLLABLE TABLE AREA
  ================================================= */}

                    <div
                        className="
      h-[380px]
      min-h-0
      overflow-y-auto
      overscroll-contain
      scrollbar-thin
      scrollbar-track-transparent
      scrollbar-thumb-slate-300
      dark:scrollbar-thumb-slate-700
    "
                    >

                        {/* DESKTOP HEADER */}

                        <div
                            className="
        sticky
        top-0
        z-10
        hidden
        h-[38px]
        grid-cols-[0.9fr_1.5fr_0.9fr_0.8fr_0.9fr_0.9fr_70px]
        items-center
        gap-3
        border-b
        border-slate-100
        bg-slate-50
        px-4
        lg:grid
        dark:border-slate-800
        dark:bg-slate-900
      "
                        >
                            <TableHeading>Booking</TableHeading>
                            <TableHeading>Farmer</TableHeading>
                            <TableHeading>Date</TableHeading>
                            <TableHeading>Time</TableHeading>
                            <TableHeading>Purpose</TableHeading>
                            <TableHeading>Status</TableHeading>
                            <TableHeading>Action</TableHeading>
                        </div>

                        {/* RECORDS */}

                        {filteredBookings.length > 0 ? (

                            filteredBookings.map((booking) => (
                                <BookingRow
                                    key={booking.id}
                                    booking={booking}
                                    onView={() => openBooking(booking)}
                                />
                            ))

                        ) : (

                            <EmptyBookings />

                        )}

                    </div>

                </section>

            </div>

            {/* =================================================
          BOOKING SHEET
      ================================================= */}

            {selectedBooking && (

                <BookingSheet
                    booking={selectedBooking}
                    onClose={() =>
                        setSelectedBooking(null)
                    }
                    onConfirm={() =>
                        confirmBooking(selectedBooking.id)
                    }
                    onCancel={() =>
                        cancelBooking(selectedBooking.id)
                    }
                    onArrived={() =>
                        markArrived(selectedBooking.id)
                    }
                    onAddQueue={() =>
                        addToQueue(selectedBooking.id)
                    }
                    onGoProcurement={() =>
                        router.push(
                            `/procurement?bookingId=${selectedBooking.id}`
                        )
                    }
                />

            )}

        </main>
    );
}

/* =========================================================
   BOOKING STAT
========================================================= */

function BookingStat({
    label,
    value,
    icon,
    type,
}) {
    const styles = {
        blue:
            "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",

        green:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",

        amber:
            "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",

        purple:
            "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",

        red:
            "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    };

    return (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles[type]}`}
            >
                {icon}
            </div>

            <div className="min-w-0">

                <p className="truncate text-[7px] text-slate-400">
                    {label}
                </p>

                <p className="text-sm font-black leading-none text-slate-900 dark:text-white">
                    {value}
                </p>

            </div>

        </div>
    );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
    value,
    onChange,
    options,
}) {
    return (
        <div className="relative">

            <Filter
                size={10}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                className="
          h-9
          w-full
          appearance-none
          rounded-lg
          border
          border-slate-200
          bg-white
          pl-7
          pr-7
          text-[8px]
          font-black
          text-slate-600
          outline-none
          transition
          focus:border-emerald-500
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-300
        "
            >

                {options.map(([value, label]) => (
                    <option
                        key={value}
                        value={value}
                    >
                        {label}
                    </option>
                ))}

            </select>

        </div>
    );
}

/* =========================================================
   BOOKING ROW
========================================================= */

function BookingRow({
    booking,
    onView,
}) {
    return (
        <div className="border-b border-slate-100 px-3 py-3 transition hover:bg-slate-50/70 sm:px-4 dark:border-slate-800 dark:hover:bg-slate-800/30">

            {/* DESKTOP */}

            <div className="hidden grid-cols-[0.9fr_1.5fr_0.9fr_0.8fr_0.9fr_0.9fr_70px] items-center gap-3 lg:grid">

                <div>

                    <p className="text-[8px] font-black text-slate-800 dark:text-slate-200">
                        {booking.id}
                    </p>

                </div>

                <div className="flex min-w-0 items-center gap-2">

                    <Avatar name={booking.farmer} />

                    <div className="min-w-0">

                        <p className="truncate text-[9px] font-black text-slate-800 dark:text-slate-200">
                            {booking.farmer}
                        </p>

                        <p className="text-[7px] text-emerald-600 dark:text-emerald-400">
                            {booking.farmerId}
                        </p>

                    </div>

                </div>

                <p className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">
                    {formatDate(booking.date)}
                </p>

                <p className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">
                    {booking.time}
                </p>

                <PurposeBadge
                    purpose={booking.purpose}
                />

                <div>

                    <BookingStatus
                        status={booking.status}
                    />

                </div>

                <button
                    type="button"
                    onClick={onView}
                    className="
            flex
            h-7
            items-center
            justify-center
            gap-1
            rounded-md
            border
            border-slate-200
            bg-white
            px-2
            text-[7px]
            font-black
            text-slate-600
            transition
            hover:border-emerald-200
            hover:bg-emerald-50
            hover:text-emerald-700
            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-300
            dark:hover:bg-emerald-950/30
          "
                >
                    View
                    <ChevronRight size={10} />
                </button>

            </div>

            {/* MOBILE / TABLET */}

            <div className="lg:hidden">

                <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-2">

                        <Avatar name={booking.farmer} />

                        <div className="min-w-0">

                            <p className="truncate text-[9px] font-black text-slate-800 dark:text-slate-200">
                                {booking.farmer}
                            </p>

                            <div className="flex items-center gap-2">

                                <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400">
                                    {booking.id}
                                </span>

                                <span className="text-[7px] text-slate-400">
                                    {booking.farmerId}
                                </span>

                            </div>

                        </div>

                    </div>

                    <BookingStatus
                        status={booking.status}
                    />

                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">

                    <MiniInfo
                        label="Date"
                        value={formatDate(booking.date)}
                    />

                    <MiniInfo
                        label="Time"
                        value={booking.time}
                    />

                    <MiniInfo
                        label="Purpose"
                        value={booking.purpose}
                    />

                </div>

                <div className="mt-2 flex items-center justify-between">

                    <div className="flex items-center gap-1.5">

                        {booking.arrived && (
                            <span className="flex items-center gap-1 text-[7px] font-bold text-emerald-600 dark:text-emerald-400">
                                <UserCheck size={9} />
                                Arrived
                            </span>
                        )}

                        {booking.queueToken && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-1 text-[7px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                Token #{booking.queueToken}
                            </span>
                        )}

                    </div>

                    <button
                        type="button"
                        onClick={onView}
                        className="flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[7px] font-black text-white hover:bg-emerald-700"
                    >
                        View
                        <ChevronRight size={10} />
                    </button>

                </div>

            </div>

        </div>
    );
}

/* =========================================================
   BOOKING SHEET
========================================================= */

function BookingSheet({
    booking,
    onClose,
    onConfirm,
    onCancel,
    onArrived,
    onAddQueue,
    onGoProcurement,
}) {
    return (
        <>

            {/* BACKDROP */}

            <div
                className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* SHEET */}

            <aside
                className="
          fixed
          right-0
          top-0
          z-50
          flex
          h-[100dvh]
          w-full
          max-w-[390px]
          flex-col
          border-l
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-950
        "
            >

                {/* HEADER */}

                <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">

                    <div>

                        <p className="text-[7px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                            Booking Details
                        </p>

                        <h2 className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
                            {booking.id}
                        </h2>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <X size={14} />
                    </button>

                </div>

                {/* CONTENT */}

                <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

                    {/* FARMER */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">

                        <div className="flex items-center gap-2.5">

                            <Avatar
                                name={booking.farmer}
                                large
                            />

                            <div className="min-w-0">

                                <h3 className="truncate text-xs font-black text-slate-900 dark:text-white">
                                    {booking.farmer}
                                </h3>

                                <p className="mt-0.5 text-[7px] text-slate-400">
                                    {booking.farmerId}
                                </p>

                                <p className="mt-1 text-[7px] font-bold text-emerald-600 dark:text-emerald-400">
                                    {booking.village}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* STATUS */}

                    <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

                        <div className="flex items-center justify-between">

                            <span className="text-[7px] font-black uppercase tracking-wider text-slate-400">
                                Booking Status
                            </span>

                            <BookingStatus
                                status={booking.status}
                            />

                        </div>

                        {booking.arrived && (
                            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2 text-[7px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                <CheckCircle2 size={11} />
                                Farmer has arrived
                            </div>
                        )}

                    </div>

                    {/* DETAILS */}

                    <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

                        <p className="mb-1 text-[7px] font-black uppercase tracking-wider text-slate-400">
                            Appointment
                        </p>

                        <DetailLine
                            label="Date"
                            value={formatDate(booking.date)}
                        />

                        <DetailLine
                            label="Time"
                            value={booking.time}
                        />

                        <DetailLine
                            label="Purpose"
                            value={booking.purpose}
                        />

                        <DetailLine
                            label="Centre"
                            value={booking.centre}
                        />

                        <DetailLine
                            label="Mobile"
                            value={booking.phone}
                        />

                        <DetailLine
                            label="Created"
                            value={booking.createdAt}
                        />

                        {booking.queueToken && (
                            <DetailLine
                                label="Queue Token"
                                value={`#${booking.queueToken}`}
                            />
                        )}

                    </div>

                    {/* WORKFLOW */}

                    <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

                        <p className="mb-3 text-[7px] font-black uppercase tracking-wider text-slate-400">
                            Booking Workflow
                        </p>

                        <WorkflowStep
                            label="Booking Created"
                            active
                            completed
                        />

                        <WorkflowLine />

                        <WorkflowStep
                            label="Officer Confirmation"
                            active={
                                booking.status === "CONFIRMED" ||
                                booking.status === "COMPLETED"
                            }
                            completed={
                                booking.status === "CONFIRMED" ||
                                booking.status === "COMPLETED"
                            }
                        />

                        <WorkflowLine />

                        <WorkflowStep
                            label="Farmer Arrival"
                            active={booking.arrived}
                            completed={booking.arrived}
                        />

                        <WorkflowLine />

                        <WorkflowStep
                            label="Added to Queue"
                            active={
                                !!booking.queueToken ||
                                booking.status === "COMPLETED"
                            }
                            completed={
                                !!booking.queueToken ||
                                booking.status === "COMPLETED"
                            }
                        />

                        <WorkflowLine />

                        <WorkflowStep
                            label="Procurement / Completion"
                            active={
                                booking.status === "COMPLETED"
                            }
                            completed={
                                booking.status === "COMPLETED"
                            }
                        />

                    </div>

                </div>

                {/* ACTIONS */}

                <div className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">

                    <p className="mb-2 text-[7px] font-black uppercase tracking-wider text-slate-400">
                        Officer Actions
                    </p>

                    <div className="grid grid-cols-2 gap-1.5">

                        {booking.status === "BOOKED" && (
                            <SheetButton
                                icon={<Check size={11} />}
                                label="Confirm Booking"
                                primary
                                onClick={onConfirm}
                            />
                        )}

                        {booking.status === "CONFIRMED" &&
                            !booking.arrived && (
                                <SheetButton
                                    icon={<UserCheck size={11} />}
                                    label="Mark Arrived"
                                    primary
                                    onClick={onArrived}
                                />
                            )}

                        {booking.status === "CONFIRMED" &&
                            booking.arrived &&
                            !booking.queueToken && (
                                <SheetButton
                                    icon={<Users size={11} />}
                                    label="Add to Queue"
                                    primary
                                    onClick={onAddQueue}
                                />
                            )}

                        {booking.status === "COMPLETED" && (
                            <SheetButton
                                icon={<PackageCheck size={11} />}
                                label="Open Procurement"
                                primary
                                onClick={onGoProcurement}
                            />
                        )}

                        {booking.status !== "CANCELLED" &&
                            booking.status !== "COMPLETED" &&
                            !booking.queueToken && (
                                <SheetButton
                                    icon={<X size={11} />}
                                    label="Cancel Booking"
                                    onClick={onCancel}
                                />
                            )}

                        <SheetButton
                            icon={<X size={11} />}
                            label="Close"
                            onClick={onClose}
                        />

                    </div>

                </div>

            </aside>

        </>
    );
}

/* =========================================================
   WORKFLOW STEP
========================================================= */

function WorkflowStep({
    label,
    active,
    completed,
}) {
    return (
        <div className="flex items-center gap-2">

            <div
                className={`
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          ${completed
                        ? "bg-emerald-600 text-white"
                        : active
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                    }
        `}
            >
                {completed ? (
                    <Check size={11} />
                ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
            </div>

            <span
                className={`
          text-[8px]
          font-bold
          ${completed
                        ? "text-slate-700 dark:text-slate-200"
                        : "text-slate-400"
                    }
        `}
            >
                {label}
            </span>

        </div>
    );
}

/* =========================================================
   WORKFLOW LINE
========================================================= */

function WorkflowLine() {
    return (
        <div className="ml-3 h-3 border-l border-dashed border-slate-200 dark:border-slate-700" />
    );
}

/* =========================================================
   SHEET BUTTON
========================================================= */

function SheetButton({
    icon,
    label,
    onClick,
    primary = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        flex
        h-8
        items-center
        justify-center
        gap-1.5
        rounded-lg
        px-2
        text-[7px]
        font-black
        transition

        ${primary
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }
      `}
        >
            {icon}
            {label}
        </button>
    );
}

/* =========================================================
   BOOKING STATUS
========================================================= */

function BookingStatus({
    status,
}) {
    const config = {
        BOOKED: {
            label: "Booked",
            dot: "bg-amber-500",
            className:
                "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
        },

        CONFIRMED: {
            label: "Confirmed",
            dot: "bg-emerald-500",
            className:
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        },

        COMPLETED: {
            label: "Completed",
            dot: "bg-blue-500",
            className:
                "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
        },

        CANCELLED: {
            label: "Cancelled",
            dot: "bg-red-500",
            className:
                "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
        },
    };

    const current =
        config[status] || config.BOOKED;

    return (
        <span
            className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2
        py-1
        text-[7px]
        font-black
        ${current.className}
      `}
        >

            <span
                className={`
          h-1.5
          w-1.5
          rounded-full
          ${current.dot}
        `}
            />

            {current.label}

        </span>
    );
}

/* =========================================================
   PURPOSE
========================================================= */

function PurposeBadge({
    purpose,
}) {
    return (
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[7px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {purpose}
        </span>
    );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
    name,
    large = false,
}) {
    return (
        <div
            className={`
        flex
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-emerald-100
        font-black
        text-emerald-700
        dark:bg-emerald-950/50
        dark:text-emerald-400

        ${large
                    ? "h-10 w-10 text-[10px]"
                    : "h-8 w-8 text-[8px]"
                }
      `}
        >
            {getInitials(name)}
        </div>
    );
}

/* =========================================================
   MINI INFO
========================================================= */

function MiniInfo({
    label,
    value,
}) {
    return (
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">

            <p className="text-[6px] text-slate-400">
                {label}
            </p>

            <p className="mt-0.5 truncate text-[7px] font-black text-slate-700 dark:text-slate-300">
                {value}
            </p>

        </div>
    );
}

/* =========================================================
   DETAIL LINE
========================================================= */

function DetailLine({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">

            <span className="text-[7px] text-slate-400">
                {label}
            </span>

            <span className="max-w-[180px] truncate text-right text-[8px] font-bold text-slate-700 dark:text-slate-300">
                {value}
            </span>

        </div>
    );
}

/* =========================================================
   TABLE HEADING
========================================================= */

function TableHeading({
    children,
}) {
    return (
        <span className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            {children}
        </span>
    );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyBookings() {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">

                <CalendarDays size={20} />

            </div>

            <h3 className="mt-3 text-xs font-black text-slate-800 dark:text-slate-200">
                No bookings found
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
                Try changing your search or filters.
            </p>

        </div>
    );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {
    const parsed = new Date(
        `${date}T00:00:00`
    );

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {
    return name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
