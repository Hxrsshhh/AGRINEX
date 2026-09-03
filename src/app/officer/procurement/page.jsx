"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ArrowUpRight, CheckCircle2, Clock3, Filter,
  PackageCheck, Search, Scale, ShieldCheck, ShoppingBasket, X
} from "lucide-react";

const PROCUREMENT_REQUESTS = [
  { id: "PR1024", farmerId: "FR1024", farmer: "Ramesh Kumar", village: "Chas", crop: "Wheat", requestedQuantity: "450 kg", receivedQuantity: null, amount: "₹26,550", status: "PENDING", date: "01 Sep 2026", time: "10:30 AM", priority: "High" },
  { id: "PR1025", farmerId: "FR1025", farmer: "Suresh Singh", village: "Bokaro", crop: "Rice", requestedQuantity: "320 kg", receivedQuantity: "315 kg", amount: "₹18,900", status: "WEIGHED", date: "01 Sep 2026", time: "10:15 AM", priority: "Normal" },
  { id: "PR1026", farmerId: "FR1026", farmer: "Anita Devi", village: "Kandra", crop: "Wheat", requestedQuantity: "280 kg", receivedQuantity: null, amount: "₹16,520", status: "VERIFIED", date: "01 Sep 2026", time: "09:45 AM", priority: "Normal" },
  { id: "PR1027", farmerId: "FR1027", farmer: "Mohan Das", village: "Dumri", crop: "Maize", requestedQuantity: "520 kg", receivedQuantity: "510 kg", amount: "₹31,110", status: "COMPLETED", date: "01 Sep 2026", time: "09:20 AM", priority: "Normal" },
  { id: "PR1028", farmerId: "FR1028", farmer: "Sunita Kumari", village: "Pindrajora", crop: "Rice", requestedQuantity: "240 kg", receivedQuantity: null, amount: "₹14,160", status: "PENDING", date: "01 Sep 2026", time: "09:00 AM", priority: "High" },
  { id: "PR1029", farmerId: "FR1029", farmer: "Rajesh Mahto", village: "Petarwar", crop: "Wheat", requestedQuantity: "390 kg", receivedQuantity: "385 kg", amount: "₹22,830", status: "ACCEPTED", date: "01 Sep 2026", time: "08:40 AM", priority: "Normal" },
  { id: "PR1030", farmerId: "FR1030", farmer: "Priya Devi", village: "Kasmar", crop: "Maize", requestedQuantity: "210 kg", receivedQuantity: null, amount: "₹12,390", status: "REJECTED", date: "01 Sep 2026", time: "08:15 AM", priority: "Normal" },
  { id: "PR1031", farmerId: "FR1031", farmer: "Arjun Kumar", village: "Jaridih", crop: "Rice", requestedQuantity: "340 kg", receivedQuantity: null, amount: "₹20,060", status: "PENDING", date: "01 Sep 2026", time: "08:00 AM", priority: "High" },
  { id: "PR1032", farmerId: "FR1032", farmer: "Vijay Kumar", village: "Bermo", crop: "Wheat", requestedQuantity: "410 kg", receivedQuantity: "405 kg", amount: "₹23,895", status: "WEIGHED", date: "01 Sep 2026", time: "07:45 AM", priority: "Normal" },
  { id: "PR1033", farmerId: "FR1033", farmer: "Kiran Devi", village: "Gomia", crop: "Rice", requestedQuantity: "300 kg", receivedQuantity: null, amount: "₹17,700", status: "PENDING", date: "01 Sep 2026", time: "07:30 AM", priority: "High" },
];

const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500", icon: Clock3 },
  VERIFIED: { label: "Verified", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", dot: "bg-blue-500", icon: ShieldCheck },
  ACCEPTED: { label: "Accepted", cls: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400", dot: "bg-violet-500", icon: CheckCircle2 },
  WEIGHED: { label: "Weighed", cls: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400", dot: "bg-indigo-500", icon: Scale },
  COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500", icon: PackageCheck },
  REJECTED: { label: "Rejected", cls: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400", dot: "bg-red-500", icon: AlertCircle },
};

const STATUS_FILTERS = ["All", "PENDING", "VERIFIED", "ACCEPTED", "WEIGHED", "COMPLETED", "REJECTED"];

export default function ProcurementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROCUREMENT_REQUESTS.filter((item) => {
      const matchQ = !q || [item.id, item.farmerId, item.farmer, item.village, item.crop, item.status]
        .some((v) => String(v || "").toLowerCase().includes(q));
      const matchSt = statusFilter === "All" || item.status === statusFilter;
      return matchQ && matchSt;
    });
  }, [search, statusFilter]);

  const counts = useMemo(() => ({
    total: PROCUREMENT_REQUESTS.length,
    pending: PROCUREMENT_REQUESTS.filter((i) => i.status === "PENDING").length,
    verified: PROCUREMENT_REQUESTS.filter((i) => i.status === "VERIFIED").length,
    completed: PROCUREMENT_REQUESTS.filter((i) => i.status === "COMPLETED").length,
  }), []);

  return (
    <main className="h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 select-none p-3 sm:p-4 lg:p-5 flex flex-col">
      {/* Header */}
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-wider">Procurement Operations</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Procurement Management</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <ShoppingBasket size={13} className="text-emerald-500" />
          <span>XYZ Farmer Centre</span>
        </div>
      </header>

      {/* Stats Matrix */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 shrink-0">
        {[
          { label: "Total Requests", val: counts.total, icon: PackageCheck, c: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
          { label: "Pending", val: counts.pending, icon: Clock3, c: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
          { label: "Verified", val: counts.verified, icon: ShieldCheck, c: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Completed", val: counts.completed, icon: CheckCircle2, c: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.c}`}><s.icon size={13} /></div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{s.val}</p>
              <p className="text-[7px] text-slate-400 font-bold mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Progress Bar */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2 text-[8px] font-bold shadow-xs dark:border-slate-800 dark:bg-slate-900 shrink-0">
        {["Pending", "Verified", "Accepted", "Weighed", "Completed"].map((st, i, arr) => {
          const cfg = STATUS_MAP[st.toUpperCase()];
          return (
            <div key={st} className="flex flex-1 items-center">
              <div className="flex items-center gap-1.5 px-2">
                <cfg.icon size={11} className={st === "Completed" ? "text-emerald-500" : "text-slate-500"} />
                <span className="text-slate-700 dark:text-slate-300 truncate">{st}</span>
              </div>
              {i < arr.length - 1 && <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />}
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search farmer, ID, crop, village..."
              className="h-8 w-full rounded-lg bg-slate-50 pl-7 pr-7 text-[9px] font-bold outline-none dark:bg-slate-800 dark:text-white"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={11} />
              </button>
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-2.5 py-1 text-[8px] font-bold capitalize transition shrink-0 ${
                  statusFilter === s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {s.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Procurement Table / Records */}
      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col">
        <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_30px] gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
          <span>Farmer</span>
          <span>Produce</span>
          <span>Quantity</span>
          <span>Amount</span>
          <span>Status</span>
          <span />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.map((item) => {
            const st = STATUS_MAP[item.status] || STATUS_MAP.PENDING;
            return (
              <div
                key={item.id}
                onClick={() => router.push(`/officer/procurement/${item.id}`)}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_30px] items-center gap-2 p-3 text-[9px] cursor-pointer transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {item.farmer[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 dark:text-white truncate">{item.farmer}</span>
                      {item.priority === "High" && <span className="rounded bg-red-50 text-red-600 px-1 py-0.5 text-[6px] font-black">HIGH</span>}
                    </div>
                    <p className="text-[7px] text-slate-400">{item.id} • {item.farmerId}</p>
                  </div>
                </div>

                <span className="font-bold text-slate-700 dark:text-slate-300">{item.crop}</span>
                <div>
                  <p className="font-black text-slate-900 dark:text-white">{item.receivedQuantity || item.requestedQuantity}</p>
                  <span className="text-[7px] text-slate-400">{item.receivedQuantity ? "Received" : "Estimated"}</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">{item.amount}</span>
                <div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-bold ${st.cls}`}>
                    <span className={`h-1 w-1 rounded-full ${st.dot}`} /> {st.label}
                  </span>
                </div>
                <div className="hidden lg:flex justify-end text-slate-300"><ArrowUpRight size={13} /></div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400 text-[9px]">
              <PackageCheck size={20} className="mb-1 opacity-50" /> No procurement records match your criteria
            </div>
          )}
        </div>
      </div>
    </main>
  );
}