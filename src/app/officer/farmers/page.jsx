"use client";

import {
  Search,
  SlidersHorizontal,
  Users,
  UserCheck,
  UserX,
  MapPin,
  Phone,
  ChevronRight,
  Eye,
  X,
  Clock3,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   SAMPLE FARMER DATA
   Replace this with your API / MongoDB data later
========================================================= */

const farmers = [
  {
    id: "FR1024",
    name: "Ramesh Kumar",
    village: "Chas",
    area: "Chas Block",
    mobile: "9876543210",
    status: "Active",
    joined: "12 Jan 2026",
    bookings: 18,
    procurement: "842 kg",
    payments: "₹48,620",
    lastVisit: "Today",
  },
  {
    id: "FR1025",
    name: "Suresh Singh",
    village: "Bokaro",
    area: "Bokaro Block",
    mobile: "9123456780",
    status: "Active",
    joined: "18 Jan 2026",
    bookings: 14,
    procurement: "625 kg",
    payments: "₹36,450",
    lastVisit: "Yesterday",
  },
  {
    id: "FR1026",
    name: "Anita Devi",
    village: "Kandra",
    area: "Chas Block",
    mobile: "9988776655",
    status: "Pending",
    joined: "02 Feb 2026",
    bookings: 7,
    procurement: "284 kg",
    payments: "₹17,250",
    lastVisit: "28 Aug 2026",
  },
  {
    id: "FR1027",
    name: "Mohan Das",
    village: "Dumri",
    area: "Chas Block",
    mobile: "9876123450",
    status: "Active",
    joined: "21 Feb 2026",
    bookings: 22,
    procurement: "1,120 kg",
    payments: "₹64,800",
    lastVisit: "Today",
  },
  {
    id: "FR1028",
    name: "Sunita Kumari",
    village: "Pindrajora",
    area: "Bokaro Block",
    mobile: "9812345678",
    status: "Inactive",
    joined: "11 Mar 2026",
    bookings: 4,
    procurement: "156 kg",
    payments: "₹9,420",
    lastVisit: "12 Aug 2026",
  },
  {
    id: "FR1029",
    name: "Rajesh Mahto",
    village: "Petarwar",
    area: "Petarwar Block",
    mobile: "9090909090",
    status: "Active",
    joined: "22 Mar 2026",
    bookings: 16,
    procurement: "714 kg",
    payments: "₹42,180",
    lastVisit: "Yesterday",
  },
  {
    id: "FR1030",
    name: "Priya Devi",
    village: "Kasmar",
    area: "Kasmar Block",
    mobile: "9345678901",
    status: "Pending",
    joined: "05 Apr 2026",
    bookings: 3,
    procurement: "112 kg",
    payments: "₹6,720",
    lastVisit: "25 Aug 2026",
  },
  {
    id: "FR1031",
    name: "Arjun Kumar",
    village: "Jaridih",
    area: "Jaridih Block",
    mobile: "9234567890",
    status: "Active",
    joined: "19 Apr 2026",
    bookings: 11,
    procurement: "498 kg",
    payments: "₹29,540",
    lastVisit: "27 Aug 2026",
  },
  {
    id: "FR1032",
    name: "Deepak Kumar",
    village: "Chas",
    area: "Chas Block",
    mobile: "9988123456",
    status: "Active",
    joined: "02 May 2026",
    bookings: 9,
    procurement: "356 kg",
    payments: "₹21,340",
    lastVisit: "29 Aug 2026",
  },
  {
    id: "FR1033",
    name: "Meena Devi",
    village: "Bokaro",
    area: "Bokaro Block",
    mobile: "9876001234",
    status: "Active",
    joined: "15 May 2026",
    bookings: 13,
    procurement: "584 kg",
    payments: "₹34,720",
    lastVisit: "30 Aug 2026",
  },
];

/* =========================================================
   FILTER OPTIONS
========================================================= */

const villages = [
  "All Villages",
  "Chas",
  "Bokaro",
  "Kandra",
  "Dumri",
  "Pindrajora",
  "Petarwar",
  "Kasmar",
  "Jaridih",
];

const statuses = [
  "All Status",
  "Active",
  "Pending",
  "Inactive",
];

/* =========================================================
   PAGE
========================================================= */

export default function FarmersPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [village, setVillage] = useState("All Villages");
  const [status, setStatus] = useState("All Status");

  /* =======================================================
     FILTER FARMERS
  ======================================================== */

  const filteredFarmers = useMemo(() => {
    return farmers.filter((farmer) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        farmer.name.toLowerCase().includes(searchValue) ||
        farmer.id.toLowerCase().includes(searchValue) ||
        farmer.mobile.includes(searchValue);

      const matchesVillage =
        village === "All Villages" ||
        farmer.village === village;

      const matchesStatus =
        status === "All Status" ||
        farmer.status === status;

      return (
        matchesSearch &&
        matchesVillage &&
        matchesStatus
      );
    });
  }, [search, village, status]);

  /* =======================================================
     STATISTICS
  ======================================================== */

  const totalFarmers = farmers.length;

  const activeFarmers = farmers.filter(
    (farmer) => farmer.status === "Active"
  ).length;

  const pendingFarmers = farmers.filter(
    (farmer) => farmer.status === "Pending"
  ).length;

  const inactiveFarmers = farmers.filter(
    (farmer) => farmer.status === "Inactive"
  ).length;

  /* =======================================================
     OPEN FARMER DETAILS
  ======================================================== */

  const openFarmerDetails = (farmerId) => {
    router.push(`/officer/farmers/${farmerId}`);
  };

  return (
    /*
      IMPORTANT:
      Entire page is locked.
      Only the farmer list is scrollable.
    */
    <div className="h-[calc(100vh-70px)] overflow-hidden bg-slate-50 dark:bg-slate-950">

      <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden p-4 md:p-5 lg:p-6">

        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-4 shrink-0">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            {/* Left */}
            <div>

              <div className="mb-1.5 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                  Farmer Management
                </span>

              </div>

              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
                Farmers
              </h1>

              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 md:text-xs">
                View farmers registered with your assigned centre.
              </p>

            </div>

            {/* Centre */}
            <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <MapPin size={14} />
              </div>

              <div>

                <p className="text-[8px] text-slate-400">
                  Assigned Centre
                </p>

                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                  XYZ Mandi
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            STATISTICS
        ==================================================== */}

        <div className="mb-4 grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4">

          <StatCard
            icon={<Users size={16} />}
            value={totalFarmers}
            label="Total Farmers"
            type="blue"
          />

          <StatCard
            icon={<UserCheck size={16} />}
            value={activeFarmers}
            label="Active Farmers"
            type="green"
          />

          <StatCard
            icon={<Clock3 size={16} />}
            value={pendingFarmers}
            label="Pending Verification"
            type="amber"
          />

          <StatCard
            icon={<UserX size={16} />}
            value={inactiveFarmers}
            label="Inactive"
            type="red"
          />

        </div>

        {/* ===================================================
            SEARCH + FILTERS
        ==================================================== */}

        <div className="mb-4 shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-2.5 md:flex-row">

            {/* Search */}
            <div className="relative flex-1">

              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by farmer name, ID or mobile..."
                className="
                  h-9
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-3
                  text-[11px]
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  transition

                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/10

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                "
              />

            </div>

            {/* Filters */}
            <div className="flex gap-2">

              {/* Village */}
              <div className="relative flex-1 md:flex-none">

                <MapPin
                  size={13}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={village}
                  onChange={(e) =>
                    setVillage(e.target.value)
                  }
                  className="
                    h-9
                    w-full
                    appearance-none
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    pl-8
                    pr-7
                    text-[10px]
                    font-medium
                    text-slate-700
                    outline-none
                    focus:border-emerald-500

                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-200

                    md:w-40
                  "
                >
                  {villages.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

              {/* Status */}
              <div className="relative flex-1 md:flex-none">

                <SlidersHorizontal
                  size={13}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="
                    h-9
                    w-full
                    appearance-none
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    pl-8
                    pr-7
                    text-[10px]
                    font-medium
                    text-slate-700
                    outline-none
                    focus:border-emerald-500

                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-200

                    md:w-36
                  "
                >
                  {statuses.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

            </div>

          </div>

          {/* Filter Result */}
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">

            <p className="text-[9px] text-slate-500 dark:text-slate-400">

              Showing{" "}

              <span className="font-bold text-slate-800 dark:text-slate-200">
                {filteredFarmers.length}
              </span>

              {" "}of{" "}

              <span className="font-bold text-slate-800 dark:text-slate-200">
                {totalFarmers}
              </span>

              {" "}farmers

            </p>

            {(search ||
              village !== "All Villages" ||
              status !== "All Status") && (

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setVillage("All Villages");
                  setStatus("All Status");
                }}
                className="
                  flex
                  items-center
                  gap-1
                  text-[9px]
                  font-bold
                  text-emerald-600
                  hover:text-emerald-700
                  dark:text-emerald-400
                "
              >
                <X size={11} />
                Clear filters
              </button>

            )}

          </div>

        </div>

        {/* ===================================================
            FARMER LIST
            ONLY THIS SECTION SCROLLS
        ==================================================== */}

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* Desktop Header */}

          <div
            className="
              hidden

              grid-cols-[2fr_1.3fr_1.15fr_1fr_1fr_40px]

              gap-4

              border-b
              border-slate-200

              bg-slate-50

              px-5
              py-2.5

              dark:border-slate-800
              dark:bg-slate-800/50

              lg:grid
            "
          >

            <TableHeading>
              Farmer
            </TableHeading>

            <TableHeading>
              Location
            </TableHeading>

            <TableHeading>
              Contact
            </TableHeading>

            <TableHeading>
              Activity
            </TableHeading>

            <TableHeading>
              Status
            </TableHeading>

            <span />

          </div>

          {/* =================================================
              SCROLL CONTAINER

              Approximately five rows visible.
          ================================================== */}

          <div
            className="
              h-full
              max-h-[375px]
              overflow-y-auto

              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-slate-300

              dark:scrollbar-thumb-slate-700
            "
          >

            {filteredFarmers.length > 0 ? (

              <div className="divide-y divide-slate-100 dark:divide-slate-800">

                {filteredFarmers.map((farmer) => (

                  <FarmerRow
                    key={farmer.id}
                    farmer={farmer}
                    onView={() =>
                      openFarmerDetails(farmer.id)
                    }
                  />

                ))}

              </div>

            ) : (

              <EmptyState />

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================================
   STAT CARD
========================================================================== */

function StatCard({
  icon,
  value,
  label,
  type,
}) {
  const styles = {
    blue: {
      box: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },

    green: {
      box: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },

    amber: {
      box: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },

    red: {
      box: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div className="flex items-center gap-2.5">

        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg

            ${styles[type].box}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="truncate text-[8px] font-medium text-slate-500 dark:text-slate-400 sm:text-[9px]">
            {label}
          </p>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================================
   TABLE HEADING
========================================================================== */

function TableHeading({ children }) {
  return (
    <span className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
      {children}
    </span>
  );
}

/* ==========================================================================
   FARMER ROW
========================================================================== */

function FarmerRow({
  farmer,
  onView,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();
          onView();
        }
      }}
      className="
        group
        grid
        cursor-pointer
        gap-3

        px-4
        py-3

        transition

        hover:bg-emerald-50/50

        focus:outline-none
        focus:ring-2
        focus:ring-inset
        focus:ring-emerald-500/40

        dark:hover:bg-emerald-950/20

        lg:grid-cols-[2fr_1.3fr_1.15fr_1fr_1fr_40px]
        lg:items-center
        lg:gap-4
        lg:px-5
      "
    >

      {/* ===================================================
          FARMER
      ==================================================== */}

      <div className="flex min-w-0 items-center gap-3">

        {/* Avatar */}
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center

            rounded-full

            bg-emerald-100

            text-[10px]
            font-black
            text-emerald-700

            dark:bg-emerald-950/50
            dark:text-emerald-400
          "
        >
          {getInitials(farmer.name)}
        </div>

        {/* Name */}
        <div className="min-w-0">

          <div className="flex items-center gap-1.5">

            <p className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {farmer.name}
            </p>

            <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline">
              {farmer.id}
            </span>

          </div>

          <p className="mt-0.5 text-[8px] text-slate-400">
            Joined {farmer.joined}
          </p>

        </div>

      </div>

      {/* ===================================================
          LOCATION
      ==================================================== */}

      <div className="flex min-w-0 items-center gap-2">

        <MapPin
          size={12}
          className="shrink-0 text-slate-400 lg:hidden"
        />

        <div className="min-w-0">

          <p className="truncate text-[10px] font-semibold text-slate-700 dark:text-slate-300">
            {farmer.village}
          </p>

          <p className="truncate text-[8px] text-slate-400">
            {farmer.area}
          </p>

        </div>

      </div>

      {/* ===================================================
          CONTACT
      ==================================================== */}

      <div className="hidden items-center gap-2 lg:flex">

        <Phone
          size={12}
          className="text-slate-400"
        />

        <span className="text-[9px] font-medium text-slate-600 dark:text-slate-400">
          {farmer.mobile}
        </span>

      </div>

      {/* ===================================================
          ACTIVITY
      ==================================================== */}

      <div className="flex items-center gap-4">

        <div>

          <p className="text-[8px] text-slate-400">
            Bookings
          </p>

          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {farmer.bookings}
          </p>

        </div>

        <div className="hidden sm:block">

          <p className="text-[8px] text-slate-400">
            Procured
          </p>

          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {farmer.procurement}
          </p>

        </div>

      </div>

      {/* ===================================================
          STATUS
      ==================================================== */}

      <div>
        <StatusBadge status={farmer.status} />
      </div>

      {/* ===================================================
          DESKTOP VIEW
      ==================================================== */}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="
          hidden
          h-7
          w-7
          items-center
          justify-center

          rounded-lg

          text-slate-400

          transition

          hover:bg-emerald-50
          hover:text-emerald-600

          dark:hover:bg-emerald-950/40
          dark:hover:text-emerald-400

          lg:flex
        "
        aria-label={`View ${farmer.name}`}
      >
        <ChevronRight size={15} />
      </button>

      {/* ===================================================
          MOBILE VIEW
      ==================================================== */}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="
          flex
          w-fit
          items-center
          gap-1

          rounded-lg

          bg-emerald-50

          px-2.5
          py-1.5

          text-[8px]
          font-bold

          text-emerald-700

          dark:bg-emerald-950/40
          dark:text-emerald-400

          lg:hidden
        "
      >
        <Eye size={11} />
        View
      </button>

    </div>
  );
}

/* ==========================================================================
   STATUS BADGE
========================================================================== */

function StatusBadge({
  status,
}) {
  const config = {
    Active: {
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },

    Pending: {
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
      dot: "bg-amber-500",
    },

    Inactive: {
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      dot: "bg-slate-400",
    },
  };

  const current = config[status];

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5

        rounded-full

        px-2
        py-1

        text-[8px]
        font-bold

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

      {status}

    </span>
  );
}

/* ==========================================================================
   EMPTY STATE
========================================================================== */

function EmptyState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Users size={20} />
      </div>

      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
        No farmers found
      </h3>

      <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
        Try changing your search or filter options.
      </p>

    </div>
  );
}

/* ==========================================================================
   GET INITIALS
========================================================================== */

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}