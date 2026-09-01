"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  Leaf,
  PackageCheck,
  Save,
  Scale,
  ShieldCheck,
  User,
  XCircle,
  Clock3
} from "lucide-react";

/* =========================================================
   SAMPLE PROCUREMENT DATA
   Replace with API / MongoDB later
========================================================= */

const procurementData = {
  PR1024: {
    id: "PR1024",

    farmer: {
      id: "FR1024",
      name: "Ramesh Kumar",
      mobile: "9876543210",
      village: "Chas",
    },

    crop: "Wheat",

    expectedQuantity: 450,

    actualQuantity: 0,

    grade: "A",

    rate: 59,

    status: "PENDING",

    verification: {
      farmerVerified: false,
      cropVerified: false,
      quantityVerified: false,
    },

    remarks: "",

    date: "01 Sep 2026",
    time: "10:30 AM",
  },

  PR1025: {
    id: "PR1025",

    farmer: {
      id: "FR1025",
      name: "Suresh Singh",
      mobile: "9123456780",
      village: "Bokaro",
    },

    crop: "Rice",

    expectedQuantity: 320,

    actualQuantity: 315,

    grade: "A",

    rate: 60,

    status: "WEIGHED",

    verification: {
      farmerVerified: true,
      cropVerified: true,
      quantityVerified: true,
    },

    remarks: "Quantity verified at centre.",

    date: "01 Sep 2026",
    time: "10:15 AM",
  },

  PR1026: {
    id: "PR1026",

    farmer: {
      id: "FR1026",
      name: "Anita Devi",
      mobile: "9988776655",
      village: "Kandra",
    },

    crop: "Wheat",

    expectedQuantity: 280,

    actualQuantity: 0,

    grade: "A",

    rate: 59,

    status: "VERIFIED",

    verification: {
      farmerVerified: true,
      cropVerified: true,
      quantityVerified: false,
    },

    remarks: "",

    date: "01 Sep 2026",
    time: "09:45 AM",
  },

  PR1027: {
    id: "PR1027",

    farmer: {
      id: "FR1027",
      name: "Mohan Das",
      mobile: "9876123450",
      village: "Dumri",
    },

    crop: "Maize",

    expectedQuantity: 520,

    actualQuantity: 510,

    grade: "A+",

    rate: 61,

    status: "COMPLETED",

    verification: {
      farmerVerified: true,
      cropVerified: true,
      quantityVerified: true,
    },

    remarks: "Procurement completed successfully.",

    date: "01 Sep 2026",
    time: "09:20 AM",
  },

  PR1028: {
    id: "PR1028",

    farmer: {
      id: "FR1028",
      name: "Sunita Kumari",
      mobile: "9812345678",
      village: "Pindrajora",
    },

    crop: "Rice",

    expectedQuantity: 240,

    actualQuantity: 0,

    grade: "B",

    rate: 58,

    status: "PENDING",

    verification: {
      farmerVerified: false,
      cropVerified: false,
      quantityVerified: false,
    },

    remarks: "",

    date: "01 Sep 2026",
    time: "09:00 AM",
  },
};

/* =========================================================
   OPTIONS
========================================================= */

const cropOptions = [
  "Wheat",
  "Rice",
  "Maize",
  "Pulses",
  "Vegetables",
];

const gradeOptions = [
  "A+",
  "A",
  "B+",
  "B",
  "C",
];

const statusOptions = [
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

export default function ProcurementDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const procurementId = params?.id;

  const initialData =
    procurementData[procurementId];

  /* =======================================================
     NOT FOUND
  ======================================================== */

  if (!initialData) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

        <div className="flex min-h-screen items-center justify-center p-6">

          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <PackageCheck size={22} />
            </div>

            <h1 className="mt-4 text-sm font-black text-slate-900 dark:text-white">
              Procurement not found
            </h1>

            <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
              No procurement transaction exists with ID{" "}
              <span className="font-bold">
                {procurementId}
              </span>
              .
            </p>

            <Link
              href="/officer/procurement"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-emerald-700"
            >
              <ArrowLeft size={12} />
              Back to Procurement
            </Link>

          </div>

        </div>

      </main>
    );
  }

  return (
    <ProcurementEditor
      initialData={initialData}
      procurementId={procurementId}
      router={router}
    />
  );
}

/* =========================================================
   EDITOR
========================================================= */

function ProcurementEditor({
  initialData,
  procurementId,
  router,
}) {
  /* =======================================================
     FORM STATE
  ======================================================== */

  const [farmerName, setFarmerName] =
    useState(initialData.farmer.name);

  const [farmerId, setFarmerId] =
    useState(initialData.farmer.id);

  const [mobile, setMobile] =
    useState(initialData.farmer.mobile);

  const [village, setVillage] =
    useState(initialData.farmer.village);

  const [crop, setCrop] =
    useState(initialData.crop);

  const [expectedQuantity, setExpectedQuantity] =
    useState(initialData.expectedQuantity);

  const [actualQuantity, setActualQuantity] =
    useState(initialData.actualQuantity);

  const [grade, setGrade] =
    useState(initialData.grade);

  const [rate, setRate] =
    useState(initialData.rate);

  const [status, setStatus] =
    useState(initialData.status);

  const [farmerVerified, setFarmerVerified] =
    useState(
      initialData.verification.farmerVerified
    );

  const [cropVerified, setCropVerified] =
    useState(
      initialData.verification.cropVerified
    );

  const [quantityVerified, setQuantityVerified] =
    useState(
      initialData.verification.quantityVerified
    );

  const [remarks, setRemarks] =
    useState(initialData.remarks);

  const [saved, setSaved] = useState(false);

  /* =======================================================
     CALCULATE TOTAL
  ======================================================== */

  const totalAmount = useMemo(() => {
    const quantity =
      Number(actualQuantity) || 0;

    const price =
      Number(rate) || 0;

    return quantity * price;
  }, [actualQuantity, rate]);

  /* =======================================================
     PROGRESS
  ======================================================== */

  const verificationCount = [
    farmerVerified,
    cropVerified,
    quantityVerified,
  ].filter(Boolean).length;

  /* =======================================================
     SAVE
  ======================================================== */

  const handleSave = () => {
    /*
      Later replace this with:

      await fetch(
        `/api/officer/procurement/${procurementId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            farmerName,
            farmerId,
            mobile,
            village,
            crop,
            expectedQuantity,
            actualQuantity,
            grade,
            rate,
            status,
            farmerVerified,
            cropVerified,
            quantityVerified,
            remarks,
          }),
        }
      );
    */

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  /* =======================================================
     STATUS ACTION
  ======================================================== */

  const completeTransaction = () => {
    setStatus("COMPLETED");
    setFarmerVerified(true);
    setCropVerified(true);
    setQuantityVerified(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">

      <div className="mx-auto w-full max-w-[1500px] p-4 md:p-5 lg:p-6">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-5 flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push("/officer/procurement")
              }
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                shadow-sm
                transition
                hover:border-emerald-500
                hover:bg-emerald-50
                hover:text-emerald-600

                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-400
                dark:hover:bg-emerald-950/40
                dark:hover:text-emerald-400
              "
            >
              <ArrowLeft size={16} />
            </button>

            <div className="min-w-0">

              <div className="mb-1 flex items-center gap-2">

                <span className="text-[8px] font-bold text-slate-400">
                  Procurement
                </span>

                <span className="text-slate-300 dark:text-slate-700">
                  /
                </span>

                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                  {procurementId}
                </span>

              </div>

              <h1 className="truncate text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
                Procurement #{procurementId}
              </h1>

              <p className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
                Review and update the complete procurement transaction.
              </p>

            </div>

          </div>

          <ProcurementStatus status={status} />

        </div>

        {/* =================================================
            WORKFLOW
        ================================================== */}

        <Workflow
          status={status}
        />

        {/* =================================================
            MAIN GRID
        ================================================== */}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.55fr_0.9fr]">

          {/* =================================================
              LEFT
          ================================================== */}

          <div className="space-y-4">

            {/* Farmer */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <SectionHeader
                icon={<User size={15} />}
                title="Farmer Information"
                subtitle="Edit farmer information for this transaction"
              />

              <div className="grid gap-3 p-4 md:grid-cols-2">

                <Field
                  label="Farmer Name"
                  value={farmerName}
                  onChange={setFarmerName}
                />

                <Field
                  label="Farmer ID"
                  value={farmerId}
                  onChange={setFarmerId}
                />

                <Field
                  label="Mobile Number"
                  value={mobile}
                  onChange={setMobile}
                  type="tel"
                />

                <Field
                  label="Village"
                  value={village}
                  onChange={setVillage}
                />

              </div>

            </section>

            {/* Crop */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <SectionHeader
                icon={<Leaf size={15} />}
                title="Crop / Product"
                subtitle="Verify and update product information"
              />

              <div className="grid gap-3 p-4 md:grid-cols-2">

                <SelectField
                  label="Crop / Product"
                  value={crop}
                  onChange={setCrop}
                  options={cropOptions}
                />

                <SelectField
                  label="Quality / Grade"
                  value={grade}
                  onChange={setGrade}
                  options={gradeOptions}
                />

              </div>

            </section>

            {/* Quantity */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <SectionHeader
                icon={<Scale size={15} />}
                title="Quantity & Rate"
                subtitle="Record actual received quantity and applicable rate"
              />

              <div className="grid gap-3 p-4 md:grid-cols-3">

                <NumberField
                  label="Expected Quantity"
                  value={expectedQuantity}
                  onChange={setExpectedQuantity}
                  suffix="kg"
                />

                <NumberField
                  label="Actual Quantity"
                  value={actualQuantity}
                  onChange={setActualQuantity}
                  suffix="kg"
                />

                <NumberField
                  label="Rate"
                  value={rate}
                  onChange={setRate}
                  prefix="₹"
                  suffix="/ kg"
                  step="0.01"
                />

              </div>

              {/* Amount */}

              <div className="mx-4 mb-4 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Total Amount
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      ₹
                      {totalAmount.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-[8px] text-slate-400">
                      Calculation
                    </p>

                    <p className="mt-1 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                      {actualQuantity || 0} kg × ₹
                      {rate || 0}
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* Remarks */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <SectionHeader
                icon={<ClipboardCheck size={15} />}
                title="Transaction Remarks"
                subtitle="Add notes related to this procurement"
              />

              <div className="p-4">

                <textarea
                  value={remarks}
                  onChange={(e) =>
                    setRemarks(e.target.value)
                  }
                  rows={4}
                  placeholder="Enter any observations, quality notes or transaction remarks..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-2.5
                    text-[10px]
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-500/10

                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-slate-200
                  "
                />

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT
          ================================================== */}

          <div className="space-y-4">

            {/* Verification */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <SectionHeader
                icon={<ShieldCheck size={15} />}
                title="Officer Verification"
                subtitle="Confirm each part of the transaction"
              />

              <div className="p-4">

                <VerificationItem
                  label="Farmer verified"
                  description="Identity and farmer details checked"
                  checked={farmerVerified}
                  onChange={setFarmerVerified}
                />

                <VerificationItem
                  label="Crop / product verified"
                  description="Product received matches request"
                  checked={cropVerified}
                  onChange={setCropVerified}
                />

                <VerificationItem
                  label="Quantity verified"
                  description="Actual quantity checked at centre"
                  checked={quantityVerified}
                  onChange={setQuantityVerified}
                />

                <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
                      Verification Progress
                    </span>

                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400">
                      {verificationCount}/3
                    </span>

                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">

                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${
                          (verificationCount / 3) *
                          100
                        }%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* Status */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <SectionHeader
                icon={<FileCheck2 size={15} />}
                title="Transaction Status"
                subtitle="Change procurement workflow status"
              />

              <div className="p-4">

                <SelectField
                  label="Current Status"
                  value={status}
                  onChange={setStatus}
                  options={statusOptions}
                />

                <p className="mt-2 text-[8px] leading-relaxed text-slate-400">
                  Update the status only after completing the required verification step.
                </p>

              </div>

            </section>

            {/* Transaction Summary */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <SectionHeader
                icon={<PackageCheck size={15} />}
                title="Transaction Summary"
                subtitle="Current transaction values"
              />

              <div className="space-y-2 p-4">

                <SummaryRow
                  label="Procurement ID"
                  value={procurementId}
                />

                <SummaryRow
                  label="Farmer"
                  value={farmerName}
                />

                <SummaryRow
                  label="Product"
                  value={crop}
                />

                <SummaryRow
                  label="Expected"
                  value={`${expectedQuantity || 0} kg`}
                />

                <SummaryRow
                  label="Actual"
                  value={`${actualQuantity || 0} kg`}
                  highlight
                />

                <SummaryRow
                  label="Grade"
                  value={grade}
                />

                <SummaryRow
                  label="Rate"
                  value={`₹${rate || 0}/kg`}
                />

                <div className="border-t border-slate-100 pt-2 dark:border-slate-800">

                  <SummaryRow
                    label="Total Amount"
                    value={`₹${totalAmount.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`}
                    highlight
                    large
                  />

                </div>

              </div>

            </section>

            {/* Complete */}

            {status !== "COMPLETED" &&
              status !== "REJECTED" && (

                <button
                  type="button"
                  onClick={completeTransaction}
                  className="
                    flex
                    h-10
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    text-[10px]
                    font-black
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                  "
                >
                  <CheckCircle2 size={14} />
                  Mark Procurement Complete
                </button>

              )}

            {/* Save */}

            <button
              type="button"
              onClick={handleSave}
              className="
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                text-[10px]
                font-black
                text-slate-700
                shadow-sm
                transition
                hover:border-emerald-500
                hover:text-emerald-600

                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:text-emerald-400
              "
            >
              {saved ? (
                <>
                  <Check size={14} />
                  Changes Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </div>

        <div className="h-6" />

      </div>

    </main>
  );
}

/* =========================================================
   WORKFLOW
========================================================= */

function Workflow({
  status,
}) {
  const steps = [
    {
      label: "Pending",
      icon: <Clock3 size={13} />,
    },
    {
      label: "Verified",
      icon: <ShieldCheck size={13} />,
    },
    {
      label: "Accepted",
      icon: <CheckCircle2 size={13} />,
    },
    {
      label: "Weighed",
      icon: <Scale size={13} />,
    },
    {
      label: "Completed",
      icon: <PackageCheck size={13} />,
    },
  ];

  const currentIndex =
    status === "REJECTED"
      ? -1
      : steps.findIndex(
          (step) =>
            step.label.toUpperCase() === status
        );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div className="mb-3 flex items-center justify-between">

        <div>

          <h2 className="text-xs font-black text-slate-900 dark:text-white">
            Procurement Workflow
          </h2>

          <p className="mt-0.5 text-[8px] text-slate-400">
            Current transaction progress
          </p>

        </div>

        {status === "REJECTED" && (
          <span className="rounded-full bg-red-50 px-2 py-1 text-[8px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
            REJECTED
          </span>
        )}

      </div>

      <div className="grid grid-cols-5 gap-1.5">

        {steps.map((step, index) => {

          const completed =
            currentIndex >= index;

          const current =
            currentIndex === index;

          return (
            <div
              key={step.label}
              className={`
                rounded-xl
                border
                p-2
                text-center
                transition

                ${
                  completed
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                    : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"
                }
              `}
            >

              <div className="flex items-center justify-center">

                <div
                  className={`
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-lg

                    ${
                      completed
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-white text-slate-400 dark:bg-slate-900"
                    }
                  `}
                >
                  {current ? (
                    <Check size={12} />
                  ) : (
                    step.icon
                  )}
                </div>

              </div>

              <p
                className={`
                  mt-1
                  truncate
                  text-[7px]
                  font-bold
                  sm:text-[8px]

                  ${
                    completed
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-400"
                  }
                `}
              >
                {step.label}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        {icon}
      </div>

      <div className="min-w-0">

        <h2 className="text-xs font-black text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="truncate text-[8px] text-slate-400">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   TEXT FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[8px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          h-9
          w-full
          rounded-lg
          border
          border-slate-200
          bg-slate-50
          px-3
          text-[10px]
          font-medium
          text-slate-800
          outline-none
          transition

          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-500/10

          dark:border-slate-700
          dark:bg-slate-800
          dark:text-slate-200
        "
      />

    </label>
  );
}

/* =========================================================
   NUMBER FIELD
========================================================= */

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = "1",
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[8px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <div className="relative">

        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`
            h-9
            w-full
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            ${
              prefix
                ? "pl-7"
                : "pl-3"
            }
            ${
              suffix
                ? "pr-14"
                : "pr-3"
            }
            text-[10px]
            font-bold
            text-slate-800
            outline-none
            transition

            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-500/10

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-200
          `}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">
            {suffix}
          </span>
        )}

      </div>

    </label>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[8px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <div className="relative">

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
            bg-slate-50
            px-3
            pr-8
            text-[10px]
            font-bold
            text-slate-800
            outline-none
            transition

            focus:border-emerald-500

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-200
          "
        >

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}

        </select>

        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

      </div>

    </label>
  );
}

/* =========================================================
   VERIFICATION ITEM
========================================================= */

function VerificationItem({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="sr-only"
      />

      <span
        className={`
          mt-0.5
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-md
          border
          transition

          ${
            checked
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
          }
        `}
      >
        {checked && <Check size={12} />}
      </span>

      <span className="min-w-0">

        <span className="block text-[10px] font-bold text-slate-800 dark:text-slate-200">
          {label}
        </span>

        <span className="mt-0.5 block text-[8px] leading-relaxed text-slate-400">
          {description}
        </span>

      </span>

    </label>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
  highlight = false,
  large = false,
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <span className="text-[8px] text-slate-400">
        {label}
      </span>

      <span
        className={`
          truncate
          text-right
          font-bold

          ${
            large
              ? "text-sm"
              : "text-[9px]"
          }

          ${
            highlight
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-700 dark:text-slate-300"
          }
        `}
      >
        {value}
      </span>

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
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },

    VERIFIED: {
      label: "Verified",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
    },

    ACCEPTED: {
      label: "Accepted",
      bg: "bg-violet-50 dark:bg-violet-950/40",
      text: "text-violet-700 dark:text-violet-400",
      dot: "bg-violet-500",
    },

    WEIGHED: {
      label: "Weighed",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      text: "text-indigo-700 dark:text-indigo-400",
      dot: "bg-indigo-500",
    },

    COMPLETED: {
      label: "Completed",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },

    REJECTED: {
      label: "Rejected",
      bg: "bg-red-50 dark:bg-red-950/40",
      text: "text-red-700 dark:text-red-400",
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
        px-2.5
        py-1.5
        text-[8px]
        font-bold
        ${current.bg}
        ${current.text}
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