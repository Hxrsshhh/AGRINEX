"use client";

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Filter,
  PackageCheck,
  Search,
  Scale,
  ShieldCheck,
  ShoppingBasket,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   SAMPLE PROCUREMENT DATA
========================================================= */

const procurementRequests = [
  {
    id: "PR1024",
    farmerId: "FR1024",
    farmer: "Ramesh Kumar",
    village: "Chas",
    crop: "Wheat",
    requestedQuantity: "450 kg",
    receivedQuantity: null,
    grade: null,
    amount: "₹26,550",
    status: "PENDING",
    date: "01 Sep 2026",
    time: "10:30 AM",
    priority: "High",
  },
  {
    id: "PR1025",
    farmerId: "FR1025",
    farmer: "Suresh Singh",
    village: "Bokaro",
    crop: "Rice",
    requestedQuantity: "320 kg",
    receivedQuantity: "315 kg",
    grade: "A",
    amount: "₹18,900",
    status: "WEIGHED",
    date: "01 Sep 2026",
    time: "10:15 AM",
    priority: "Normal",
  },
  {
    id: "PR1026",
    farmerId: "FR1026",
    farmer: "Anita Devi",
    village: "Kandra",
    crop: "Wheat",
    requestedQuantity: "280 kg",
    receivedQuantity: null,
    grade: null,
    amount: "₹16,520",
    status: "VERIFIED",
    date: "01 Sep 2026",
    time: "09:45 AM",
    priority: "Normal",
  },
  {
    id: "PR1027",
    farmerId: "FR1027",
    farmer: "Mohan Das",
    village: "Dumri",
    crop: "Maize",
    requestedQuantity: "520 kg",
    receivedQuantity: "510 kg",
    grade: "A+",
    amount: "₹31,110",
    status: "COMPLETED",
    date: "01 Sep 2026",
    time: "09:20 AM",
    priority: "Normal",
  },
  {
    id: "PR1028",
    farmerId: "FR1028",
    farmer: "Sunita Kumari",
    village: "Pindrajora",
    crop: "Rice",
    requestedQuantity: "240 kg",
    receivedQuantity: null,
    grade: null,
    amount: "₹14,160",
    status: "PENDING",
    date: "01 Sep 2026",
    time: "09:00 AM",
    priority: "High",
  },
  {
    id: "PR1029",
    farmerId: "FR1029",
    farmer: "Rajesh Mahto",
    village: "Petarwar",
    crop: "Wheat",
    requestedQuantity: "390 kg",
    receivedQuantity: "385 kg",
    grade: "A",
    amount: "₹22,830",
    status: "ACCEPTED",
    date: "01 Sep 2026",
    time: "08:40 AM",
    priority: "Normal",
  },
  {
    id: "PR1030",
    farmerId: "FR1030",
    farmer: "Priya Devi",
    village: "Kasmar",
    crop: "Maize",
    requestedQuantity: "210 kg",
    receivedQuantity: null,
    grade: null,
    amount: "₹12,390",
    status: "REJECTED",
    date: "01 Sep 2026",
    time: "08:15 AM",
    priority: "Normal",
  },
  {
    id: "PR1031",
    farmerId: "FR1031",
    farmer: "Arjun Kumar",
    village: "Jaridih",
    crop: "Rice",
    requestedQuantity: "340 kg",
    receivedQuantity: null,
    grade: null,
    amount: "₹20,060",
    status: "PENDING",
    date: "01 Sep 2026",
    time: "08:00 AM",
    priority: "High",
  },
  {
    id: "PR1032",
    farmerId: "FR1032",
    farmer: "Vijay Kumar",
    village: "Bermo",
    crop: "Wheat",
    requestedQuantity: "410 kg",
    receivedQuantity: "405 kg",
    grade: "A",
    amount: "₹23,895",
    status: "WEIGHED",
    date: "01 Sep 2026",
    time: "07:45 AM",
    priority: "Normal",
  },
  {
    id: "PR1033",
    farmerId: "FR1033",
    farmer: "Kiran Devi",
    village: "Gomia",
    crop: "Rice",
    requestedQuantity: "300 kg",
    receivedQuantity: null,
    grade: null,
    amount: "₹17,700",
    status: "PENDING",
    date: "01 Sep 2026",
    time: "07:30 AM",
    priority: "High",
  },
];

/* =========================================================
   STATUS FILTERS
========================================================= */

const statusFilters = [
  "All",
  "PENDING",
  "VERIFIED",
  "ACCEPTED",
  "WEIGHED",
  "COMPLETED",
  "REJECTED",
];

/* =========================================================
   PAGE
========================================================= */

export default function ProcurementPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* =======================================================
     SEARCH + FILTER
  ======================================================== */

  const filteredRequests = useMemo(() => {
    const value = search.trim().toLowerCase();

    return procurementRequests.filter((item) => {
      const searchableText = [
        item.id,
        item.farmerId,
        item.farmer,
        item.village,
        item.crop,
        item.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        value === "" || searchableText.includes(value);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  /* =======================================================
     COUNTS
  ======================================================== */

  const totalRequests = procurementRequests.length;

  const pendingCount = procurementRequests.filter(
    (item) => item.status === "PENDING"
  ).length;

  const verifiedCount = procurementRequests.filter(
    (item) => item.status === "VERIFIED"
  ).length;

  const completedCount = procurementRequests.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  /* =======================================================
     OPEN DETAILS
  ======================================================== */

  const openProcurement = (id) => {
    router.push(`/officer/procurement/${id}`);
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <main
      className="
        h-full
        w-full
        overflow-hidden
        bg-slate-50
        dark:bg-slate-950
      "
    >
      <div
        className="
          mx-auto
          h-full
          w-full
          max-w-[1600px]
          overflow-hidden
          p-3
          sm:p-4
          lg:p-5
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-3 flex items-center justify-between">

          <div className="min-w-0">

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[8px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                Procurement
              </span>

            </div>

            <h1 className="mt-0.5 truncate text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Procurement Management
            </h1>

          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex dark:border-slate-800 dark:bg-slate-900">

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShoppingBasket size={13} />
            </div>

            <div>

              <p className="text-[7px] text-slate-400">
                Assigned Centre
              </p>

              <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">
                XYZ Farmer Centre
              </p>

            </div>

          </div>

        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">

          <CompactStat
            icon={<PackageCheck size={13} />}
            label="Total"
            value={totalRequests}
            type="blue"
          />

          <CompactStat
            icon={<Clock3 size={13} />}
            label="Pending"
            value={pendingCount}
            type="amber"
          />

          <CompactStat
            icon={<ShieldCheck size={13} />}
            label="Verified"
            value={verifiedCount}
            type="green"
          />

          <CompactStat
            icon={<CheckCircle2 size={13} />}
            label="Completed"
            value={completedCount}
            type="purple"
          />

        </div>

        {/* =================================================
            WORKFLOW
        ================================================= */}

        <div className="mb-3 flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white px-1.5 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <WorkflowMini
            icon={<Clock3 size={11} />}
            label="Pending"
            active={pendingCount > 0}
          />

          <WorkflowLine />

          <WorkflowMini
            icon={<ShieldCheck size={11} />}
            label="Verified"
            active={verifiedCount > 0}
          />

          <WorkflowLine />

          <WorkflowMini
            icon={<CheckCircle2 size={11} />}
            label="Accepted"
            active
          />

          <WorkflowLine />

          <WorkflowMini
            icon={<Scale size={11} />}
            label="Weighed"
            active
          />

          <WorkflowLine />

          <WorkflowMini
            icon={<PackageCheck size={11} />}
            label="Completed"
            active={completedCount > 0}
          />

        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <section className="mb-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">

            {/* Search */}

            <div className="relative min-w-0 flex-1">

              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search farmer, procurement ID, farmer ID, crop or village..."
                className="
                  h-9
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-9
                  text-[10px]
                  font-medium
                  text-slate-900
                  outline-none

                  placeholder:text-slate-400

                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/10

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    h-5
                    w-5
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-md
                    text-slate-400
                    hover:bg-slate-200
                    dark:hover:bg-slate-700
                  "
                >
                  <X size={11} />
                </button>
              )}

            </div>

            {/* Filters */}

            <div className="flex min-w-0 items-center gap-1.5">

              <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:flex dark:bg-slate-800 dark:text-slate-400">
                <Filter size={12} />
              </div>

              <div className="flex min-w-0 gap-1 overflow-x-auto">

                {statusFilters.map((status) => (

                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(status)
                    }
                    className={`
                      h-8
                      shrink-0
                      rounded-lg
                      px-2.5
                      text-[8px]
                      font-bold
                      transition

                      ${
                        statusFilter === status
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    {status}
                  </button>

                ))}

              </div>

            </div>

          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">

            <p className="text-[8px] text-slate-400">

              Showing{" "}

              <span className="font-black text-slate-700 dark:text-slate-200">
                {filteredRequests.length}
              </span>

              {" "}of{" "}

              <span className="font-black text-slate-700 dark:text-slate-200">
                {totalRequests}
              </span>

              {" "}requests

            </p>

            {(search || statusFilter !== "All") && (

              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400"
              >
                <X size={10} />
                Clear
              </button>

            )}

          </div>

        </section>

        {/* =================================================
            ALERT
        ================================================= */}

        {pendingCount > 0 && (

          <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/20">

            <AlertCircle
              size={14}
              className="shrink-0 text-amber-600 dark:text-amber-400"
            />

            <p className="text-[8px] font-semibold text-amber-800 dark:text-amber-300">

              <span className="font-black">
                {pendingCount} requests
              </span>{" "}
              require verification.

            </p>

          </div>

        )}

        {/* =================================================
            PROCUREMENT LIST
        ================================================= */}

        <section
          className="
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

          {/* LIST HEADER */}

          <div className="
            flex
            h-[52px]
            items-center
            justify-between
            border-b
            border-slate-200
            px-3
            sm:px-4
            dark:border-slate-800
          ">

            <div className="flex items-center gap-2">

              <div className="
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
              ">
                <PackageCheck size={14} />
              </div>

              <div>

                <h2 className="
                  text-xs
                  font-black
                  text-slate-900
                  dark:text-white
                ">
                  Procurement Requests
                </h2>

                <p className="hidden text-[7px] text-slate-400 sm:block">
                  Select a request to manage the transaction.
                </p>

              </div>

            </div>

            <span className="
              rounded-full
              bg-slate-100
              px-2
              py-1
              text-[7px]
              font-black
              text-slate-500
              dark:bg-slate-800
              dark:text-slate-400
            ">
              {filteredRequests.length} results
            </span>

          </div>

          {/* DESKTOP COLUMN HEADER */}

          <div className="
            hidden
            h-[20px]
            grid-cols-[1.7fr_0.9fr_1fr_0.9fr_0.95fr_25px]
            items-center
            gap-3
            border-b
            border-slate-100
            bg-slate-50
            px-4
            lg:grid
            dark:border-slate-800
            dark:bg-slate-800/40
          ">

            <TableHeading>
              Farmer
            </TableHeading>

            <TableHeading>
              Product
            </TableHeading>

            <TableHeading>
              Quantity
            </TableHeading>

            <TableHeading>
              Amount
            </TableHeading>

            <TableHeading>
              Status
            </TableHeading>

            <span />

          </div>

          {/* =================================================
              THIS IS THE ONLY SCROLLABLE DIV

              360px ≈ 5 desktop rows
          ================================================= */}

          <div
            className="
              h-[300px]
              overflow-y-auto
              overscroll-contain

              divide-y
              divide-slate-100

              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-slate-300

              dark:divide-slate-800
              dark:scrollbar-thumb-slate-700
            "
          >

            {filteredRequests.length > 0 ? (

              filteredRequests.map((item) => (

                <ProcurementRow
                  key={item.id}
                  item={item}
                  onClick={() =>
                    openProcurement(item.id)
                  }
                />

              ))

            ) : (

              <EmptyState />

            )}

          </div>

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function CompactStat({
  icon,
  label,
  value,
  type,
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",

    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",

    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",

    purple:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  };

  return (
    <div className="
      flex
      items-center
      gap-2
      rounded-xl
      border
      border-slate-200
      bg-white
      px-2.5
      py-2
      shadow-sm
      dark:border-slate-800
      dark:bg-slate-900
    ">

      <div
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${styles[type]}
        `}
      >
        {icon}
      </div>

      <div>

        <p className="text-[7px] text-slate-400">
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
   WORKFLOW
========================================================= */

function WorkflowMini({
  icon,
  label,
  active,
}) {
  return (
    <div className="
      flex
      shrink-0
      items-center
      gap-1.5
      px-1.5
      sm:px-2
    ">

      <div
        className={`
          flex
          h-5
          w-5
          items-center
          justify-center
          rounded-md

          ${
            active
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }
        `}
      >
        {icon}
      </div>

      <span className="
        text-[7px]
        font-bold
        text-slate-700
        sm:text-[8px]
        dark:text-slate-300
      ">
        {label}
      </span>

    </div>
  );
}

function WorkflowLine() {
  return (
    <div className="
      h-px
      min-w-2
      flex-1
      bg-slate-200
      dark:bg-slate-700
    " />
  );
}

/* =========================================================
   PROCUREMENT ROW
========================================================= */

function ProcurementRow({
  item,
  onClick,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();
          onClick();
        }
      }}
      className="
        group
        cursor-pointer
        px-3
        py-3
        transition

        hover:bg-emerald-50/40

        focus:outline-none
        focus:ring-2
        focus:ring-inset
        focus:ring-emerald-500/20

        dark:hover:bg-emerald-950/15

        lg:grid
        lg:grid-cols-[1.7fr_0.9fr_1fr_0.9fr_0.95fr_25px]
        lg:items-center
        lg:gap-3
        lg:px-4
        lg:py-3
      "
    >

      {/* FARMER */}

      <div className="flex min-w-0 items-center gap-2.5">

        <div className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-emerald-100
          text-[9px]
          font-black
          text-emerald-700
          dark:bg-emerald-950/50
          dark:text-emerald-400
        ">
          {getInitials(item.farmer)}
        </div>

        <div className="min-w-0">

          <div className="flex items-center gap-1.5">

            <p className="
              truncate
              text-[10px]
              font-black
              text-slate-800
              dark:text-slate-200
            ">
              {item.farmer}
            </p>

            {item.priority === "High" && (

              <span className="
                shrink-0
                rounded
                bg-red-50
                px-1.5
                py-0.5
                text-[6px]
                font-black
                text-red-600
                dark:bg-red-950/40
                dark:text-red-400
              ">
                HIGH
              </span>

            )}

          </div>

          <div className="mt-0.5 flex items-center gap-2">

            <span className="
              text-[7px]
              font-black
              text-emerald-600
              dark:text-emerald-400
            ">
              {item.id}
            </span>

            <span className="text-[7px] text-slate-400">
              {item.farmerId}
            </span>

          </div>

          <p className="mt-0.5 text-[7px] text-slate-400 lg:hidden">
            {item.village} • {item.date} • {item.time}
          </p>

        </div>

      </div>

      {/* DATA */}

      <div className="
        mt-2
        grid
        grid-cols-3
        gap-2
        lg:contents
      ">

        {/* PRODUCT */}

        <div className="flex items-center justify-between lg:block">

          <span className="text-[7px] text-slate-400 lg:hidden">
            Product
          </span>

          <span className="
            text-[8px]
            font-bold
            text-slate-700
            dark:text-slate-300
          ">
            {item.crop}
          </span>

        </div>

        {/* QUANTITY */}

        <div className="flex items-center justify-between lg:block">

          <span className="text-[7px] text-slate-400 lg:hidden">
            Quantity
          </span>

          <div>

            <p className="
              text-[9px]
              font-black
              text-slate-800
              dark:text-slate-200
            ">
              {item.receivedQuantity ||
                item.requestedQuantity}
            </p>

            <p className="hidden text-[6px] text-slate-400 lg:block">
              {item.receivedQuantity
                ? "Received"
                : "Requested"}
            </p>

          </div>

        </div>

        {/* AMOUNT */}

        <div className="flex items-center justify-between lg:block">

          <span className="text-[7px] text-slate-400 lg:hidden">
            Amount
          </span>

          <p className="
            text-[9px]
            font-black
            text-slate-800
            dark:text-slate-200
          ">
            {item.amount}
          </p>

        </div>

        {/* STATUS */}

        <div className="
          mt-2
          flex
          items-center
          justify-between
          lg:mt-0
          lg:block
        ">

          <span className="text-[7px] text-slate-400 lg:hidden">
            Status
          </span>

          <ProcurementStatus
            status={item.status}
          />

        </div>

        {/* ARROW */}

        <div className="hidden justify-end lg:flex">

          <div className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            group-hover:bg-emerald-50
            group-hover:text-emerald-600
            dark:group-hover:bg-emerald-950/40
            dark:group-hover:text-emerald-400
          ">
            <ArrowUpRight size={13} />
          </div>

        </div>

      </div>

      {/* MOBILE ACTION */}

      <div className="
        mt-2
        flex
        items-center
        justify-between
        border-t
        border-slate-100
        pt-2
        dark:border-slate-800
        lg:hidden
      ">

        <span className="text-[7px] text-slate-400">
          Click to manage transaction
        </span>

        <span className="
          flex
          items-center
          gap-1
          text-[7px]
          font-black
          text-emerald-600
          dark:text-emerald-400
        ">
          View details
          <ArrowUpRight size={10} />
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function ProcurementStatus({
  status,
}) {
  const config = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      dot: "bg-amber-500",
    },

    VERIFIED: {
      label: "Verified",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
      dot: "bg-blue-500",
    },

    ACCEPTED: {
      label: "Accepted",
      className:
        "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
      dot: "bg-violet-500",
    },

    WEIGHED: {
      label: "Weighed",
      className:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
      dot: "bg-indigo-500",
    },

    COMPLETED: {
      label: "Completed",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },

    REJECTED: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
      dot: "bg-red-500",
    },
  };

  const current = config[status];

  return (
    <span
      className={`
        inline-flex
        shrink-0
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
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
}) {
  return (
    <span className="
      text-[7px]
      font-black
      uppercase
      tracking-[0.12em]
      text-slate-400
      dark:text-slate-500
    ">
      {children}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="
      flex
      h-full
      min-h-[300px]
      flex-col
      items-center
      justify-center
      px-5
      text-center
    ">

      <div className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-xl
        bg-slate-100
        text-slate-400
        dark:bg-slate-800
      ">
        <Search size={20} />
      </div>

      <h3 className="
        mt-3
        text-xs
        font-black
        text-slate-800
        dark:text-slate-200
      ">
        No procurement requests found
      </h3>

      <p className="
        mt-1
        max-w-xs
        text-[8px]
        leading-relaxed
        text-slate-400
      ">
        Try another farmer name, procurement ID,
        crop, village or status.
      </p>

    </div>
  );
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