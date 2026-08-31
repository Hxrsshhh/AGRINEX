"use client";

import React, { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock3,
  AlertCircle,
  IndianRupee,
  Building2,
  CalendarDays,
  ReceiptText,
  ArrowDownToLine,
  Eye,
  X,
  ShieldCheck,
  Banknote,
  FileText,
  Wheat,
  Scale,
  MapPin,
  ChevronRight,
  CreditCard,
  CircleDollarSign,
} from "lucide-react";

/* ============================================================
   PAYMENT DATA
============================================================ */

const PAYMENT_RECORDS = [
  {
    id: "PAY-2026-08421",
    date: "28 Aug 2026",
    crop: "Paddy",
    quantity: "25 QTL",
    centre: "XYZ Procurement Centre",
    amount: 48500,
    deductions: 0,
    netAmount: 48500,
    status: "Paid",
    paymentMethod: "Direct Bank Transfer",
    transactionId: "UTR2684219045",
    account: "XXXX XXXX 4821",
  },
  {
    id: "PAY-2026-07914",
    date: "18 Aug 2026",
    crop: "Paddy",
    quantity: "18 QTL",
    centre: "ABC Procurement Centre",
    amount: 34920,
    deductions: 420,
    netAmount: 34500,
    status: "Paid",
    paymentMethod: "Direct Bank Transfer",
    transactionId: "UTR2679142088",
    account: "XXXX XXXX 4821",
  },
  {
    id: "PAY-2026-07108",
    date: "05 Aug 2026",
    crop: "Wheat",
    quantity: "20 QTL",
    centre: "XYZ Procurement Centre",
    amount: 46200,
    deductions: 0,
    netAmount: 46200,
    status: "Processing",
    paymentMethod: "Direct Bank Transfer",
    transactionId: "Processing",
    account: "XXXX XXXX 4821",
  },
];

const PAYMENT_SUMMARY = {
  totalEarned: 129200,
  paidAmount: 83000,
  pendingAmount: 46200,
  totalTransactions: 3,
};

/* ============================================================
   PAGE
============================================================ */

export default function PaymentDetailsPage() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");

  /* ============================================================
     TOAST
  ============================================================ */

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredPayments = PAYMENT_RECORDS.filter((payment) => {
    if (filter === "paid") {
      return payment.status === "Paid";
    }

    if (filter === "processing") {
      return payment.status === "Processing";
    }

    return true;
  });

  /* ============================================================
     OPEN DETAILS
  ============================================================ */

  const openDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  /* ============================================================
     DOWNLOAD
  ============================================================ */

  const downloadReceipt = (payment) => {
    showToast(`Receipt ${payment.id} downloaded.`);
  };

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden">
      {/* ========================================================
          TOAST
      ======================================================== */}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[500]">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-[10px] font-bold shadow-2xl border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="shrink-0 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Payment Details
              </h1>

              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Track procurement earnings and payment settlements.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Settlement
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div className="flex-1 min-h-0 flex flex-col gap-2.5">
        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
          <PaymentStat
            icon={CircleDollarSign}
            label="Total Earnings"
            value={`₹${formatAmount(PAYMENT_SUMMARY.totalEarned)}`}
            subtitle="This season"
          />

          <PaymentStat
            icon={CheckCircle2}
            label="Paid"
            value={`₹${formatAmount(PAYMENT_SUMMARY.paidAmount)}`}
            subtitle="Settled amount"
            green
          />

          <PaymentStat
            icon={Clock3}
            label="Processing"
            value={`₹${formatAmount(PAYMENT_SUMMARY.pendingAmount)}`}
            subtitle="Expected settlement"
            amber
          />

          <PaymentStat
            icon={ReceiptText}
            label="Transactions"
            value={PAYMENT_SUMMARY.totalTransactions}
            subtitle="Procurement payments"
          />
        </div>

        {/* ======================================================
            CURRENT PAYMENT STATUS
        ====================================================== */}

        <section className="shrink-0 rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-lime-500/20" />

          <div className="p-3 sm:p-3.5">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div>
                <p className="text-[8px] uppercase tracking-wider font-bold text-emerald-500">
                  Latest Settlement
                </p>

                <h2 className="text-xs sm:text-sm font-black mt-0.5">
                  Paddy Procurement Payment
                </h2>
              </div>

              <StatusBadge status="Paid" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <CompactDetail
                icon={Wheat}
                label="Produce"
                value="Paddy"
              />

              <CompactDetail
                icon={Scale}
                label="Quantity"
                value="25 QTL"
              />

              <CompactDetail
                icon={Building2}
                label="Centre"
                value="XYZ Procurement Centre"
              />

              <CompactDetail
                icon={IndianRupee}
                label="Net Amount"
                value="₹48,500"
                highlight
              />
            </div>
          </div>
        </section>

        {/* ======================================================
            PAYMENT HISTORY
        ====================================================== */}

        <section className="flex-1 min-h-0 rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="shrink-0 px-3 py-2.5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-3.5 w-3.5 text-emerald-500" />

              <div>
                <h2 className="text-xs font-black">
                  Payment History
                </h2>

                <p className="text-[8px] text-slate-400">
                  Recent procurement settlements
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[
                ["all", "All"],
                ["paid", "Paid"],
                ["processing", "Processing"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`px-2 py-1 rounded-md text-[8px] font-bold transition ${
                    filter === id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0 p-2">
            <div className="hidden md:grid grid-cols-[1.2fr_1fr_1.4fr_1fr_1fr_auto] gap-2 px-3 py-2 text-[7px] uppercase tracking-wider font-black text-slate-400">
              <span>Payment</span>
              <span>Date</span>
              <span>Centre</span>
              <span>Amount</span>
              <span>Status</span>
              <span />
            </div>

            <div className="space-y-1.5">
              {filteredPayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  onView={() => openDetails(payment)}
                  onDownload={() =>
                    downloadReceipt(payment)
                  }
                />
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================
            BANK INFORMATION
        ====================================================== */}

        <section className="shrink-0 rounded-2xl border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-slate-900/60">
          <div className="px-3 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Banknote className="h-4 w-4 text-emerald-500" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black">
                  Settlement Account
                </p>

                <p className="text-[8px] text-slate-400 truncate">
                  Payments are transferred directly to your registered bank account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-[7px] uppercase font-bold text-slate-400">
                  Account
                </p>

                <p className="text-[9px] font-mono font-black">
                  XXXX XXXX 4821
                </p>
              </div>

              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================
          PAYMENT DETAIL MODAL
      ======================================================== */}

      {showDetails && selectedPayment && (
        <div className="fixed inset-0 z-[400] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ReceiptText className="h-4 w-4 text-emerald-500" />
                </div>

                <div>
                  <h2 className="text-xs font-black">
                    Payment Details
                  </h2>

                  <p className="text-[8px] text-slate-400 font-mono">
                    {selectedPayment.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-2.5">
              {/* Amount */}
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3 text-center">
                <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">
                  Net Payment
                </p>

                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹{formatAmount(selectedPayment.netAmount)}
                </p>

                <div className="flex items-center justify-center gap-1 mt-1">
                  <StatusBadge
                    status={selectedPayment.status}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-1.5">
                <ModalDetail
                  label="Produce"
                  value={selectedPayment.crop}
                />

                <ModalDetail
                  label="Quantity"
                  value={selectedPayment.quantity}
                />

                <ModalDetail
                  label="Date"
                  value={selectedPayment.date}
                />

                <ModalDetail
                  label="Centre"
                  value={selectedPayment.centre}
                />

                <ModalDetail
                  label="Gross Amount"
                  value={`₹${formatAmount(
                    selectedPayment.amount
                  )}`}
                />

                <ModalDetail
                  label="Deductions"
                  value={`₹${formatAmount(
                    selectedPayment.deductions
                  )}`}
                />
              </div>

              {/* Bank */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-500" />

                  <span className="text-[9px] font-black">
                    Settlement Information
                  </span>
                </div>

                <ModalDetail
                  label="Payment Method"
                  value={selectedPayment.paymentMethod}
                />

                <ModalDetail
                  label="Bank Account"
                  value={selectedPayment.account}
                />

                <ModalDetail
                  label="Transaction / UTR"
                  value={selectedPayment.transactionId}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="flex-1 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-bold"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadReceipt(selectedPayment)
                  }
                  className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center gap-1.5"
                >
                  <ArrowDownToLine className="h-3 w-3" />
                  Download Receipt
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
   PAYMENT STAT
============================================================ */

function PaymentStat({
  icon: Icon,
  label,
  value,
  subtitle,
  green = false,
  amber = false,
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 p-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div
          className={`h-7 w-7 rounded-lg flex items-center justify-center ${
            green
              ? "bg-emerald-500/10 text-emerald-500"
              : amber
              ? "bg-amber-500/10 text-amber-500"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        {green && (
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        )}

        {amber && (
          <Clock3 className="h-3 w-3 text-amber-500" />
        )}
      </div>

      <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400 mt-2">
        {label}
      </p>

      <p
        className={`text-sm sm:text-base font-black mt-0.5 ${
          green
            ? "text-emerald-600 dark:text-emerald-400"
            : amber
            ? "text-amber-500"
            : ""
        }`}
      >
        {value}
      </p>

      <p className="text-[7px] text-slate-400 mt-0.5">
        {subtitle}
      </p>
    </div>
  );
}

/* ============================================================
   COMPACT DETAIL
============================================================ */

function CompactDetail({
  icon: Icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 min-w-0">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 text-emerald-500 shrink-0" />

        <span className="text-[7px] uppercase font-bold text-slate-400">
          {label}
        </span>
      </div>

      <p
        className={`text-[9px] font-black truncate ${
          highlight
            ? "text-emerald-600 dark:text-emerald-400"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   PAYMENT ROW
============================================================ */

function PaymentRow({
  payment,
  onView,
  onDownload,
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-800/30 px-2.5 py-2">
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[1.2fr_1fr_1.4fr_1fr_1fr_auto] items-center gap-2">
        <div>
          <p className="text-[9px] font-black">
            {payment.id}
          </p>

          <p className="text-[7px] text-slate-400 mt-0.5">
            {payment.crop} • {payment.quantity}
          </p>
        </div>

        <span className="text-[8px] text-slate-500">
          {payment.date}
        </span>

        <span className="text-[8px] font-bold truncate">
          {payment.centre}
        </span>

        <div>
          <p className="text-[9px] font-black">
            ₹{formatAmount(payment.netAmount)}
          </p>

          {payment.deductions > 0 && (
            <p className="text-[7px] text-slate-400">
              Deduction ₹
              {formatAmount(payment.deductions)}
            </p>
          )}
        </div>

        <StatusBadge status={payment.status} />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onView}
            className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-500"
            title="View payment"
          >
            <Eye className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600"
            title="Download receipt"
          >
            <ArrowDownToLine className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black truncate">
              {payment.id}
            </p>

            <p className="text-[7px] text-slate-400 mt-0.5">
              {payment.crop} • {payment.quantity} •{" "}
              {payment.date}
            </p>
          </div>

          <StatusBadge status={payment.status} />
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-1.5">
            <p className="text-[7px] text-slate-400">
              Centre
            </p>

            <p className="text-[8px] font-bold truncate">
              {payment.centre}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-1.5">
            <p className="text-[7px] text-slate-400">
              Net Amount
            </p>

            <p className="text-[9px] font-black text-emerald-600">
              ₹{formatAmount(payment.netAmount)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-1.5 mt-1.5">
          <button
            type="button"
            onClick={onView}
            className="h-6 px-2 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-bold flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            Details
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="h-6 px-2 rounded-md bg-emerald-500/10 text-emerald-600 text-[8px] font-bold flex items-center gap-1"
          >
            <ArrowDownToLine className="h-3 w-3" />
            Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const paid = status === "Paid";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[7px] font-black ${
        paid
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      }`}
    >
      {paid ? (
        <CheckCircle2 className="h-2.5 w-2.5" />
      ) : (
        <Clock3 className="h-2.5 w-2.5" />
      )}

      {status}
    </span>
  );
}

/* ============================================================
   MODAL DETAIL
============================================================ */

function ModalDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-200/60 dark:border-white/5 last:border-0">
      <span className="text-[8px] text-slate-400">
        {label}
      </span>

      <span className="text-[8px] font-bold text-right max-w-[65%] truncate">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN").format(amount);
}