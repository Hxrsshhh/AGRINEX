"use client";

import {
  ArrowDown,
  ArrowUp,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

import { useMemo, useState } from "react";

/* =========================================================
   INITIAL QUEUE DATA
========================================================= */

const initialQueue = [
  {
    id: "Q001",
    token: 104,
    farmer: "Ramesh Kumar",
    farmerId: "FR1024",
    village: "Chas",
    booking: "BK1024",
    status: "WAITING",
    arrived: true,
    time: "10:30 AM",
  },
  {
    id: "Q002",
    token: 105,
    farmer: "Suresh Singh",
    farmerId: "FR1025",
    village: "Bokaro",
    booking: "BK1025",
    status: "PROCESSING",
    arrived: true,
    time: "10:45 AM",
  },
  {
    id: "Q003",
    token: 106,
    farmer: "Anita Devi",
    farmerId: "FR1026",
    village: "Kandra",
    booking: "BK1026",
    status: "WAITING",
    arrived: false,
    time: "11:00 AM",
  },
  {
    id: "Q004",
    token: 107,
    farmer: "Mohan Das",
    farmerId: "FR1027",
    village: "Dumri",
    booking: "BK1027",
    status: "WAITING",
    arrived: true,
    time: "11:15 AM",
  },
  {
    id: "Q005",
    token: 108,
    farmer: "Sunita Kumari",
    farmerId: "FR1028",
    village: "Pindrajora",
    booking: "BK1028",
    status: "HOLD",
    arrived: true,
    time: "11:30 AM",
  },
  {
    id: "Q006",
    token: 109,
    farmer: "Rajesh Mahto",
    farmerId: "FR1029",
    village: "Petarwar",
    booking: "BK1029",
    status: "WAITING",
    arrived: false,
    time: "11:45 AM",
  },
  {
    id: "Q007",
    token: 110,
    farmer: "Priya Devi",
    farmerId: "FR1030",
    village: "Kasmar",
    booking: "BK1030",
    status: "WAITING",
    arrived: true,
    time: "12:00 PM",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function QueuePage() {
  const [queue, setQueue] = useState(initialQueue);

  const [lastAction, setLastAction] = useState(
    "Queue is ready"
  );

  const [selectedId, setSelectedId] = useState(
    initialQueue[0].id
  );

  /* =======================================================
     COUNTS
  ======================================================== */

  const processingCount = queue.filter(
    (item) => item.status === "PROCESSING"
  ).length;

  const waitingCount = queue.filter(
    (item) => item.status === "WAITING"
  ).length;

  const arrivedCount = queue.filter(
    (item) => item.arrived
  ).length;

  const holdCount = queue.filter(
    (item) => item.status === "HOLD"
  ).length;

  /* =======================================================
     CURRENT PROCESSING
  ======================================================== */

  const currentProcessing = queue.find(
    (item) => item.status === "PROCESSING"
  );

  /* =======================================================
     SELECTED FARMER
  ======================================================== */

  const selectedFarmer = queue.find(
    (item) => item.id === selectedId
  );

  /* =======================================================
     CALL NEXT
  ======================================================== */

  const callNext = () => {
    const next = queue.find(
      (item) =>
        item.status === "WAITING" &&
        item.arrived
    );

    if (!next) {
      setLastAction(
        "No arrived farmer is waiting in the queue."
      );
      return;
    }

    setSelectedId(next.id);

    setLastAction(
      `Token #${next.token} called`
    );
  };

  /* =======================================================
     START PROCESSING
  ======================================================== */

  const startProcessing = (id) => {
    setQueue((current) =>
      current.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: "PROCESSING",
            arrived: true,
          };
        }

        if (item.status === "PROCESSING") {
          return {
            ...item,
            status: "WAITING",
          };
        }

        return item;
      })
    );

    const farmer = queue.find(
      (item) => item.id === id
    );

    setSelectedId(id);

    setLastAction(
      `${farmer?.farmer || "Farmer"} started processing`
    );
  };

  /* =======================================================
     MARK ARRIVED
  ======================================================== */

  const markArrived = (id) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              arrived: true,
            }
          : item
      )
    );

    const farmer = queue.find(
      (item) => item.id === id
    );

    setSelectedId(id);

    setLastAction(
      `${farmer?.farmer || "Farmer"} marked arrived`
    );
  };

  /* =======================================================
     SKIP
  ======================================================== */

  const skipFarmer = (id) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "SKIPPED",
            }
          : item
      )
    );

    const farmer = queue.find(
      (item) => item.id === id
    );

    setLastAction(
      `${farmer?.farmer || "Farmer"} skipped`
    );
  };

  /* =======================================================
     HOLD
  ======================================================== */

  const holdFarmer = (id) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "HOLD",
            }
          : item
      )
    );

    const farmer = queue.find(
      (item) => item.id === id
    );

    setLastAction(
      `${farmer?.farmer || "Farmer"} placed on hold`
    );
  };

  /* =======================================================
     RESUME
  ======================================================== */

  const resumeFarmer = (id) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "WAITING",
            }
          : item
      )
    );

    const farmer = queue.find(
      (item) => item.id === id
    );

    setLastAction(
      `${farmer?.farmer || "Farmer"} returned to queue`
    );
  };

  /* =======================================================
     COMPLETE
  ======================================================== */

  const completeFarmer = (id) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "COMPLETED",
            }
          : item
      )
    );

    const farmer = queue.find(
      (item) => item.id === id
    );

    setLastAction(
      `${farmer?.farmer || "Farmer"} completed`
    );
  };

  /* =======================================================
     MOVE UP
  ======================================================== */

  const moveUp = (id) => {
    setQueue((current) => {
      const index = current.findIndex(
        (item) => item.id === id
      );

      if (index <= 0) return current;

      const updated = [...current];

      [
        updated[index - 1],
        updated[index],
      ] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });

    setLastAction("Queue position updated");
  };

  /* =======================================================
     MOVE DOWN
  ======================================================== */

  const moveDown = (id) => {
    setQueue((current) => {
      const index = current.findIndex(
        (item) => item.id === id
      );

      if (
        index === -1 ||
        index === current.length - 1
      ) {
        return current;
      }

      const updated = [...current];

      [
        updated[index],
        updated[index + 1],
      ] = [
        updated[index + 1],
        updated[index],
      ];

      return updated;
    });

    setLastAction("Queue position updated");
  };

  /* =======================================================
     RESET
  ======================================================== */

  const resetQueue = () => {
    setQueue(initialQueue);
    setSelectedId(initialQueue[0].id);
    setLastAction("Queue restored");
  };

  /* =======================================================
     ACTIVE QUEUE
  ======================================================== */

  const activeQueue = useMemo(
    () =>
      queue.filter(
        (item) =>
          item.status !== "COMPLETED" &&
          item.status !== "SKIPPED"
      ),
    [queue]
  );

  return (
    <main className="h-[91vh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950">

      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col overflow-hidden p-3 sm:p-4 lg:p-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-3 flex shrink-0 items-center justify-between">

          <div>

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
                Live Operations
              </span>

            </div>

            <h1 className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Queue Management
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

            <button
              type="button"
              onClick={resetQueue}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-slate-500
                shadow-sm
                transition
                hover:bg-slate-50
                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-400
                dark:hover:bg-slate-800
              "
              title="Reset demo queue"
            >
              <RotateCcw size={13} />
            </button>

          </div>

        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-3 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">

          <QueueStat
            icon={<Users size={13} />}
            label="In Queue"
            value={activeQueue.length}
            type="blue"
          />

          <QueueStat
            icon={<Clock3 size={13} />}
            label="Waiting"
            value={waitingCount}
            type="amber"
          />

          <QueueStat
            icon={<Zap size={13} />}
            label="Processing"
            value={processingCount}
            type="green"
          />

          <QueueStat
            icon={<Pause size={13} />}
            label="On Hold"
            value={holdCount}
            type="purple"
          />

        </div>

        {/* =================================================
            LIVE ACTION BAR
        ================================================= */}

        <section className="mb-3 shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 items-center gap-2">

              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">

                <Bell size={14} />

                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />

              </div>

              <div className="min-w-0">

                <p className="truncate text-[8px] font-black text-slate-800 dark:text-slate-200">
                  {lastAction}
                </p>

                <p className="text-[7px] text-slate-400">
                  {currentProcessing
                    ? `Currently processing Token #${currentProcessing.token}`
                    : "No farmer is currently processing"}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={callNext}
              className="
                flex
                h-8
                shrink-0
                items-center
                justify-center
                gap-1.5
                rounded-lg
                bg-emerald-600
                px-3
                text-[8px]
                font-black
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
              "
            >
              <Bell size={12} />
              Call Next Farmer
            </button>

          </div>

        </section>

        {/* =================================================
            MAIN QUEUE PANEL
        ================================================= */}

        <section
          className="
            min-h-0
            max-h-[calc(100%-180px)]
            flex-1
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

          {/* =================================================
              PANEL HEADER
          ================================================= */}

          <div
            className="
              flex
              h-[45px]
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
                <Users size={14} />
              </div>

              <div>

                <h2 className="text-xs font-black text-slate-900 dark:text-white">
                  Current Queue
                </h2>

                <p className="hidden text-[7px] text-slate-400 sm:block">
                  Manage farmers waiting at the centre
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <span
                className="
                  flex
                  items-center
                  gap-1
                  rounded-full
                  bg-emerald-50
                  px-2
                  py-1
                  text-[7px]
                  font-black
                  text-emerald-700
                  dark:bg-emerald-950/40
                  dark:text-emerald-400
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                LIVE
              </span>

              <span className="hidden text-[7px] text-slate-400 sm:block">
                {arrivedCount}/{activeQueue.length} arrived
              </span>

            </div>

          </div>

          {/* =================================================
              QUEUE CONTENT
          ================================================= */}

          <div
            className="
              grid
              h-[calc(100%-52px)]
            
              min-h-0
              grid-cols-1
              lg:grid-cols-[minmax(0,1fr)_250px]
            "
          >

            {/* =================================================
                CURRENT QUEUE
                ONLY THIS AREA SCROLLS
            ================================================= */}

            <div
              className="
                min-h-0
                overflow-hidden
                border-slate-200
                dark:border-slate-800
                lg:border-r
              "
            >

              {/* Desktop table heading */}

              <div
                className="
                  hidden
                  h-[36px]
                  shrink-0
                  grid-cols-[40px_1.7fr_0.8fr_0.8fr_1fr_24px]
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

                <span className="text-[7px] font-black uppercase tracking-wider text-slate-400">
                  #
                </span>

                <TableHeading>
                  Farmer
                </TableHeading>

                <TableHeading>
                  Token
                </TableHeading>

                <TableHeading>
                  Time
                </TableHeading>

                <TableHeading>
                  Status
                </TableHeading>

                <span />

              </div>

              {/* =================================================
                  ONLY SCROLLABLE DIV
                  APPROXIMATELY 4 ROWS VISIBLE
              ================================================= */}

              <div
                className="
                  h-[calc(100%-36px)]
                  min-h-0
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

                {activeQueue.length > 0 ? (

                  activeQueue.map((item, index) => (

                    <QueueRow
                      key={item.id}
                      item={item}
                      position={index + 1}
                      selected={selectedId === item.id}

                      onSelect={() =>
                        setSelectedId(item.id)
                      }

                      onArrived={() =>
                        markArrived(item.id)
                      }

                      onStart={() =>
                        startProcessing(item.id)
                      }

                      onSkip={() =>
                        skipFarmer(item.id)
                      }

                      onHold={() =>
                        holdFarmer(item.id)
                      }

                      onResume={() =>
                        resumeFarmer(item.id)
                      }

                      onComplete={() =>
                        completeFarmer(item.id)
                      }

                      onMoveUp={() =>
                        moveUp(item.id)
                      }

                      onMoveDown={() =>
                        moveDown(item.id)
                      }

                      first={index === 0}

                      last={
                        index === activeQueue.length - 1
                      }
                    />

                  ))

                ) : (

                  <EmptyQueue />

                )}

              </div>

            </div>

            {/* =================================================
                SELECTED FARMER PANEL
                FIXED - NO SCROLL
            ================================================= */}

            <aside
              className="
                hidden
                min-h-0
                overflow-hidden
                bg-slate-50/60
                lg:block
                dark:bg-slate-950/20
              "
            >

              {selectedFarmer ? (

                <SelectedFarmer
                  farmer={selectedFarmer}

                  onArrived={() =>
                    markArrived(selectedFarmer.id)
                  }

                  onStart={() =>
                    startProcessing(selectedFarmer.id)
                  }

                  onSkip={() =>
                    skipFarmer(selectedFarmer.id)
                  }

                  onHold={() =>
                    holdFarmer(selectedFarmer.id)
                  }

                  onResume={() =>
                    resumeFarmer(selectedFarmer.id)
                  }

                  onComplete={() =>
                    completeFarmer(selectedFarmer.id)
                  }
                />

              ) : (

                <div className="flex h-full items-center justify-center px-4 text-center">

                  <p className="text-[9px] text-slate-400">
                    Select a farmer to manage the queue.
                  </p>

                </div>

              )}

            </aside>

          </div>

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   QUEUE STAT
========================================================= */

function QueueStat({
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
    <div
      className="
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
      "
    >

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
   QUEUE ROW
========================================================= */

function QueueRow({
  item,
  position,
  selected,
  onSelect,
  onArrived,
  onStart,
  onSkip,
  onHold,
  onResume,
  onComplete,
  onMoveUp,
  onMoveDown,
  first,
  last,
}) {
  return (
    <div
      onClick={onSelect}
      className={`
        group
        cursor-pointer
        px-3
        py-3
        transition
        sm:px-4

        ${
          selected
            ? "bg-emerald-50/60 dark:bg-emerald-950/15"
            : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
        }
      `}
    >

      {/* =================================================
          MAIN ROW
      ================================================= */}

      <div
        className="
          grid
          grid-cols-[28px_minmax(0,1fr)]
          gap-2.5
          lg:grid-cols-[40px_1.7fr_0.8fr_0.8fr_1fr_24px]
          lg:items-center
          lg:gap-3
        "
      >

        {/* POSITION */}

        <div className="flex items-center justify-center">

          <div
            className={`
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              text-[8px]
              font-black

              ${
                item.status === "PROCESSING"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }

              lg:h-8
              lg:w-8
            `}
          >
            {String(position).padStart(2, "0")}
          </div>

        </div>

        {/* FARMER */}

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-emerald-100
                text-[8px]
                font-black
                text-emerald-700
                dark:bg-emerald-950/50
                dark:text-emerald-400
              "
            >
              {getInitials(item.farmer)}
            </div>

            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-[9px]
                  font-black
                  text-slate-800
                  dark:text-slate-200
                "
              >
                {item.farmer}
              </p>

              <div className="flex items-center gap-2">

                <span
                  className="
                    text-[7px]
                    font-bold
                    text-emerald-600
                    dark:text-emerald-400
                  "
                >
                  {item.farmerId}
                </span>

                <span className="hidden text-[7px] text-slate-400 sm:block">
                  {item.village}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* TOKEN */}

        <div className="hidden lg:block">

          <span
            className="
              inline-flex
              rounded-md
              bg-slate-100
              px-2
              py-1
              text-[8px]
              font-black
              text-slate-700
              dark:bg-slate-800
              dark:text-slate-200
            "
          >
            #{item.token}
          </span>

        </div>

        {/* TIME */}

        <div className="hidden lg:block">

          <p className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">
            {item.time}
          </p>

        </div>

        {/* STATUS */}

        <div className="mt-2 lg:mt-0">

          <QueueStatus status={item.status} />

        </div>

        {/* ARROW */}

        <div className="hidden justify-end lg:flex">

          <ChevronRight
            size={13}
            className={`
              transition

              ${
                selected
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-300 group-hover:text-slate-500"
              }
            `}
          />

        </div>

      </div>

      {/* =================================================
          MOBILE INFO + ACTIONS
      ================================================= */}

      <div className="ml-[38px] mt-2 lg:hidden">

        <div className="mb-2 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span
              className="
                rounded-md
                bg-slate-100
                px-1.5
                py-1
                text-[7px]
                font-black
                text-slate-600
                dark:bg-slate-800
                dark:text-slate-300
              "
            >
              Token #{item.token}
            </span>

            <span className="text-[7px] text-slate-400">
              {item.time}
            </span>

          </div>

          {item.arrived ? (

            <span
              className="
                flex
                items-center
                gap-1
                text-[7px]
                font-bold
                text-emerald-600
                dark:text-emerald-400
              "
            >
              <CheckCircle2 size={9} />
              Arrived
            </span>

          ) : (

            <span
              className="
                text-[7px]
                font-bold
                text-amber-600
                dark:text-amber-400
              "
            >
              Not arrived
            </span>

          )}

        </div>

        <div className="grid grid-cols-2 gap-1.5">

          {!item.arrived && (
            <ActionButton
              icon={<UserCheck size={11} />}
              label="Arrived"
              onClick={(e) => {
                e.stopPropagation();
                onArrived();
              }}
              primary
            />
          )}

          {item.status === "WAITING" &&
            item.arrived && (
              <ActionButton
                icon={<Play size={11} />}
                label="Start"
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                primary
              />
            )}

          {item.status === "PROCESSING" && (
            <ActionButton
              icon={<Check size={11} />}
              label="Complete"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              primary
            />
          )}

          {item.status === "HOLD" && (
            <ActionButton
              icon={<Play size={11} />}
              label="Resume"
              onClick={(e) => {
                e.stopPropagation();
                onResume();
              }}
              primary
            />
          )}

          {item.status !== "PROCESSING" && (
            <ActionButton
              icon={<Pause size={11} />}
              label="Hold"
              onClick={(e) => {
                e.stopPropagation();
                onHold();
              }}
            />
          )}

          <ActionButton
            icon={<SkipForward size={11} />}
            label="Skip"
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
          />

        </div>

      </div>

      {/* =================================================
          DESKTOP ACTIONS
      ================================================= */}

      <div
        className="
          mt-2
          hidden
          items-center
          justify-end
          gap-1.5
          border-t
          border-slate-100
          pt-2
          lg:flex
          dark:border-slate-800
        "
      >

        <span className="mr-auto text-[7px] text-slate-400">
          Booking {item.booking}
        </span>

        <ActionButton
          icon={<ArrowUp size={10} />}
          label="Up"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={first}
        />

        <ActionButton
          icon={<ArrowDown size={10} />}
          label="Down"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={last}
        />

        {!item.arrived && (
          <ActionButton
            icon={<UserCheck size={10} />}
            label="Arrived"
            onClick={(e) => {
              e.stopPropagation();
              onArrived();
            }}
            primary
          />
        )}

        {item.status === "WAITING" &&
          item.arrived && (
            <ActionButton
              icon={<Play size={10} />}
              label="Start"
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              primary
            />
          )}

        {item.status === "PROCESSING" && (
          <ActionButton
            icon={<Check size={10} />}
            label="Complete"
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            primary
          />
        )}

        {item.status === "HOLD" && (
          <ActionButton
            icon={<Play size={10} />}
            label="Resume"
            onClick={(e) => {
              e.stopPropagation();
              onResume();
            }}
            primary
          />
        )}

        {item.status !== "PROCESSING" && (
          <ActionButton
            icon={<Pause size={10} />}
            label="Hold"
            onClick={(e) => {
              e.stopPropagation();
              onHold();
            }}
          />
        )}

        <ActionButton
          icon={<SkipForward size={10} />}
          label="Skip"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   SELECTED FARMER
========================================================= */

function SelectedFarmer({
  farmer,
  onArrived,
  onStart,
  onSkip,
  onHold,
  onResume,
  onComplete,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      {/* =================================================
          SELECTED FARMER HEADER
      ================================================= */}

      <div className="shrink-0 border-b border-slate-200 p-3 dark:border-slate-800">

        <p className="text-[7px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          Selected Farmer
        </p>

        <div className="mt-2 flex items-center gap-2">

          <div
            className="
              flex
              h-8
              w-8
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
            "
          >
            {getInitials(farmer.farmer)}
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-[11px] font-black text-slate-900 dark:text-white">
              {farmer.farmer}
            </h3>

            <p className="text-[7px] text-slate-400">
              {farmer.farmerId}
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          SELECTED FARMER CONTENT
      ================================================= */}

      <div className="min-h-0 flex-1 overflow-hidden p-3">

        {/* TOKEN */}

        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-2.5
            dark:border-slate-800
            dark:bg-slate-900
          "
        >

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[7px] text-slate-400">
                Queue Token
              </p>

              <p className="mt-0.5 text-xl font-black text-emerald-600 dark:text-emerald-400">
                #{farmer.token}
              </p>

            </div>

            <QueueStatus status={farmer.status} />

          </div>

        </div>

        {/* DETAILS */}

        <div
          className="
            mt-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-2.5
            py-1
            dark:border-slate-800
            dark:bg-slate-900
          "
        >

          <DetailLine
            label="Village"
            value={farmer.village}
          />

          <DetailLine
            label="Booking"
            value={farmer.booking}
          />

          <DetailLine
            label="Appointment"
            value={farmer.time}
          />

          <DetailLine
            label="Arrival"
            value={
              farmer.arrived
                ? "Arrived"
                : "Not arrived"
            }
          />

        </div>

        {/* ACTIONS */}

        <div
          className="
            mt-2
            rounded-xl
            border
            border-slate-200
            bg-white
            p-2.5
            dark:border-slate-800
            dark:bg-slate-900
          "
        >

          <p className="mb-2 text-[7px] font-black uppercase tracking-wider text-slate-400">
            Queue Actions
          </p>

          <div className="grid grid-cols-2 gap-1.5">

            {!farmer.arrived && (
              <ActionButton
                icon={<UserCheck size={10} />}
                label="Mark Arrived"
                onClick={onArrived}
                primary
              />
            )}

            {farmer.status === "WAITING" &&
              farmer.arrived && (
                <ActionButton
                  icon={<Play size={10} />}
                  label="Start"
                  onClick={onStart}
                  primary
                />
              )}

            {farmer.status === "PROCESSING" && (
              <ActionButton
                icon={<Check size={10} />}
                label="Complete"
                onClick={onComplete}
                primary
              />
            )}

            {farmer.status === "HOLD" && (
              <ActionButton
                icon={<Play size={10} />}
                label="Resume"
                onClick={onResume}
                primary
              />
            )}

            {farmer.status !== "PROCESSING" && (
              <ActionButton
                icon={<Pause size={10} />}
                label="Hold"
                onClick={onHold}
              />
            )}

            <ActionButton
              icon={<SkipForward size={10} />}
              label="Skip"
              onClick={onSkip}
            />

          </div>

        </div>

      </div>

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
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-slate-100
        py-1.5
        last:border-0
        dark:border-slate-800
      "
    >

      <span className="text-[7px] text-slate-400">
        {label}
      </span>

      <span className="max-w-[130px] truncate text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        h-7
        items-center
        justify-center
        gap-1
        rounded-md
        px-2
        text-[7px]
        font-black
        transition

        ${
          primary
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        }

        disabled:cursor-not-allowed
        disabled:opacity-40
      `}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   STATUS
========================================================= */

function QueueStatus({
  status,
}) {
  const config = {
    WAITING: {
      label: "Waiting",
      dot: "bg-amber-500",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },

    PROCESSING: {
      label: "Processing",
      dot: "bg-blue-500",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    },

    HOLD: {
      label: "On Hold",
      dot: "bg-violet-500",
      className:
        "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    },

    SKIPPED: {
      label: "Skipped",
      dot: "bg-slate-400",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },

    COMPLETED: {
      label: "Completed",
      dot: "bg-emerald-500",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
  };

  const current =
    config[status] || config.WAITING;

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
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
}) {
  return (
    <span
      className="
        text-[7px]
        font-black
        uppercase
        tracking-[0.12em]
        text-slate-400
        dark:text-slate-500
      "
    >
      {children}
    </span>
  );
}

/* =========================================================
   EMPTY QUEUE
========================================================= */

function EmptyQueue() {
  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        px-5
        text-center
      "
    >

      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-emerald-50
          text-emerald-500
          dark:bg-emerald-950/30
          dark:text-emerald-400
        "
      >
        <CheckCircle2 size={20} />
      </div>

      <h3 className="mt-3 text-xs font-black text-slate-800 dark:text-slate-200">
        Queue is clear
      </h3>

      <p className="mt-1 text-[8px] text-slate-400">
        No active farmers are currently waiting.
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