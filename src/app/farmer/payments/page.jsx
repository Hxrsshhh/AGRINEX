"use client";

import React, { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Building2,
  ReceiptText,
  ArrowDownToLine,
  Eye,
  X,
  ShieldCheck,
  Banknote,
  Wheat,
  Scale,
  CreditCard,
  CircleDollarSign,
} from "lucide-react";

const PAYMENTS = [
  { id: "PAY-2026-08421", date: "28 Aug 2026", crop: "Paddy", quantity: "25 QTL", centre: "XYZ Procurement Centre", amount: 48500, deductions: 0, netAmount: 48500, status: "Paid", paymentMethod: "Direct Bank Transfer", transactionId: "UTR2684219045", account: "XXXX XXXX 4821" },
  { id: "PAY-2026-07914", date: "18 Aug 2026", crop: "Paddy", quantity: "18 QTL", centre: "ABC Procurement Centre", amount: 34920, deductions: 420, netAmount: 34500, status: "Paid", paymentMethod: "Direct Bank Transfer", transactionId: "UTR2679142088", account: "XXXX XXXX 4821" },
  { id: "PAY-2026-07108", date: "05 Aug 2026", crop: "Wheat", quantity: "20 QTL", centre: "XYZ Procurement Centre", amount: 46200, deductions: 0, netAmount: 46200, status: "Processing", paymentMethod: "Direct Bank Transfer", transactionId: "Processing", account: "XXXX XXXX 4821" },
];

const inr = (n) => new Intl.NumberFormat("en-IN").format(n);

export default function PaymentDetailsPage() {
  const [activePayment, setActivePayment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const filtered = PAYMENTS.filter((p) => filter === "all" || p.status.toLowerCase() === filter);

  return (
    <div className="relative flex h-[calc(100vh-6.5rem)] w-full flex-col overflow-hidden select-none gap-2.5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-xl">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">Payment Details</h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Procurement earnings & real-time settlements</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[9px] font-bold text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" /> Secure DBT
        </div>
      </header>

      {/* Stat Strip */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 shrink-0">
        {[
          { label: "Total Earnings", val: `₹${inr(129200)}`, sub: "Season total", icon: CircleDollarSign, c: "text-slate-900 dark:text-white" },
          { label: "Paid", val: `₹${inr(83000)}`, sub: "Settled in bank", icon: CheckCircle2, c: "text-emerald-600" },
          { label: "Processing", val: `₹${inr(46200)}`, sub: "Expected soon", icon: Clock3, c: "text-amber-500" },
          { label: "Transactions", val: "3", sub: "Dispatches count", icon: ReceiptText, c: "text-slate-900 dark:text-white" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200/80 bg-white/70 p-2.5 dark:border-white/10 dark:bg-slate-900/50 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
              <s.icon className={`h-3.5 w-3.5 ${s.c}`} />
            </div>
            <p className={`mt-1 text-sm sm:text-base font-black ${s.c}`}>{s.val}</p>
            <p className="text-[7px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Latest Highlight Banner */}
      <section className="shrink-0 rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-900/50 p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Latest Settlement</span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black text-emerald-600">Paid</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Produce", val: "Paddy", icon: Wheat },
            { label: "Quantity", val: "25 QTL", icon: Scale },
            { label: "Centre", val: "XYZ Centre", icon: Building2 },
            { label: "Net Amount", val: "₹48,500", icon: IndianRupee, highlight: true },
          ].map((d) => (
            <div key={d.label} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2">
              <div className="flex items-center gap-1 text-[7px] font-bold text-slate-400 uppercase">
                <d.icon className="h-2.5 w-2.5 text-emerald-500" /> {d.label}
              </div>
              <p className={`mt-0.5 text-[10px] font-black truncate ${d.highlight ? "text-emerald-600" : ""}`}>{d.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment History List */}
      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200/80 bg-white/70 shadow-xs dark:border-white/10 dark:bg-slate-900/50 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/70 p-2 px-3 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <ReceiptText className="h-3.5 w-3.5 text-emerald-500" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Payment History</h2>
          </div>
          <div className="flex gap-1">
            {["all", "paid", "processing"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2 py-0.5 text-[8px] font-bold capitalize transition ${
                  filter === f ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-200/70 bg-white/50 p-2 text-[8px] transition hover:border-emerald-500/40 dark:border-white/5 dark:bg-slate-800/40"
            >
              <div>
                <span className="font-black text-slate-900 dark:text-white">{item.id}</span>
                <p className="text-[7px] text-slate-400">{item.crop} • {item.quantity} • {item.date}</p>
              </div>
              <div className="truncate text-slate-500 dark:text-slate-400">{item.centre}</div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-black text-slate-900 dark:text-white">₹{inr(item.netAmount)}</span>
                <span className={`rounded px-1.5 py-0.5 text-[7px] font-black ${item.status === "Paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                  {item.status}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setActivePayment(item)} className="rounded p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Eye className="h-3 w-3" />
                  </button>
                  <button onClick={() => triggerToast(`Receipt ${item.id} downloaded.`)} className="rounded p-1 text-emerald-600 hover:bg-emerald-500/10">
                    <ArrowDownToLine className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Account Strip */}
      <footer className="shrink-0 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 px-3 dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-[9px] font-black">Direct Settlement Account</p>
            <p className="text-[7px] text-slate-400">Verified Direct Benefit Transfer (DBT)</p>
          </div>
        </div>
        <span className="font-mono text-[9px] font-black text-slate-600 dark:text-slate-300">XXXX XXXX 4821</span>
      </footer>

      {/* Details Modal */}
      {activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-black text-slate-900 dark:text-white">{activePayment.id}</span>
              <button onClick={() => setActivePayment(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="my-3 rounded-lg bg-emerald-500/5 p-2.5 text-center border border-emerald-500/10">
              <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Net Payment</span>
              <p className="text-xl font-black text-emerald-600">₹{inr(activePayment.netAmount)}</p>
            </div>
            <div className="space-y-1.5 text-[8px]">
              {[
                ["Produce", activePayment.crop],
                ["Quantity", activePayment.quantity],
                ["Centre", activePayment.centre],
                ["Date", activePayment.date],
                ["Gross Amount", `₹${inr(activePayment.amount)}`],
                ["Deductions", `₹${inr(activePayment.deductions)}`],
                ["Account", activePayment.account],
                ["UTR", activePayment.transactionId],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-0.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { triggerToast(`Receipt ${activePayment.id} downloaded.`); setActivePayment(null); }}
              className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-[9px] font-bold text-white hover:bg-emerald-500 transition"
            >
              <ArrowDownToLine className="h-3 w-3" /> Download Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}