"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, Users, UserCheck, UserX, MapPin,
  Phone, ChevronRight, X, Clock3, ShieldCheck, FileText,
  ExternalLink, CheckCircle2, AlertCircle, Sprout, RefreshCw, Loader2
} from "lucide-react";

const fmtDate = (d) => (!d ? "--" : new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
const getInitials = (n = "") => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "F";

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [centre, setCentre] = useState(null);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, inactive: 0 });
  const [search, setSearch] = useState("");
  const [village, setVillage] = useState("All Villages");
  const [status, setStatus] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [toast, setToast] = useState("");

  const triggerToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const loadFarmers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/officer/farmers", { cache: "no-store", credentials: "include" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setFarmers(d.data || []);
      setCentre(d.centre || null);
      setStats(d.stats || { total: 0, verified: 0, pending: 0, inactive: 0 });
    } catch (err) {
      triggerToast(err.message || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFarmers(); }, []);

  const villages = useMemo(() => ["All Villages", ...new Set(farmers.map((f) => f.farmLocation?.village).filter(Boolean))], [farmers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return farmers.filter((f) => {
      const matchQ = !q || [f.name, f._id, f.mobile, f.farmLocation?.village].some((v) => String(v || "").toLowerCase().includes(q));
      const isVer = f.verification?.isVerified === true;
      const matchSt = status === "All Status" || (status === "Verified" && isVer) || (status === "Pending" && !isVer) || (status === "Inactive" && !f.isActive);
      const matchVl = village === "All Villages" || f.farmLocation?.village === village;
      return matchQ && matchSt && matchVl;
    });
  }, [farmers, search, status, village]);

  const openFarmer = async (id) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/officer/farmers/${id}`, { cache: "no-store", credentials: "include" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setSelected(d.farmer);
    } catch (err) {
      triggerToast(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const verifyFarmer = async () => {
    if (!selected?._id) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/officer/farmers/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "VERIFY_FARMER" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setSelected((prev) => ({ ...prev, verification: d.farmer.verification }));
      setFarmers((prev) => prev.map((f) => f._id === selected._id ? { ...f, verification: d.farmer.verification } : f));
      setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1), verified: prev.verified + 1 }));
      triggerToast("Farmer verified successfully");
    } catch (err) {
      triggerToast(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-70px)] overflow-hidden bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 select-none flex flex-col">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-xl">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header */}
      <header className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-wider">Centre Verification Desk</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Registered Farmers</h1>
          <p className="text-[9px] text-slate-400">Manage farmer profiles for {centre?.name || "assigned centre"}</p>
        </div>
        <button
          onClick={loadFarmers}
          className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[9px] font-bold text-slate-600 hover:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </header>

      {/* Stats Cards */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 shrink-0">
        {[
          { label: "Total Farmers", val: stats.total, icon: Users, c: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
          { label: "Verified", val: stats.verified, icon: UserCheck, c: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Pending", val: stats.pending, icon: Clock3, c: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
          { label: "Inactive", val: stats.inactive, icon: UserX, c: "text-red-600 bg-red-50 dark:bg-red-950/40" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.c}`}><s.icon size={14} /></div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{s.val}</p>
              <p className="text-[8px] text-slate-400 font-bold mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="mb-3 flex flex-col sm:flex-row gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, phone, village..."
            className="h-8 w-full rounded-lg bg-slate-50 pl-7 pr-3 text-[9px] font-bold outline-none dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="flex gap-1.5">
          <select value={village} onChange={(e) => setVillage(e.target.value)} className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800">
            {villages.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 rounded-lg bg-slate-50 px-2 text-[8px] font-bold dark:bg-slate-800">
            {["All Status", "Verified", "Pending", "Inactive"].map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* Farmers Grid/List View */}
      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.map((f) => {
            const isVer = f.verification?.isVerified === true;
            return (
              <div
                key={f._id}
                onClick={() => openFarmer(f._id)}
                className="flex cursor-pointer items-center justify-between p-3 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {getInitials(f.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[10px] font-black text-slate-900 dark:text-white">{f.name}</p>
                      <span className="text-[7px] text-slate-400 font-bold">({String(f._id).slice(-6)})</span>
                    </div>
                    <p className="text-[8px] text-slate-400 truncate mt-0.5">
                      {f.farmLocation?.village || "No village"} • {f.mobile} • {f.farm?.mainCrop || "Crop unspecified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[7px] font-bold ${
                    !f.isActive ? "bg-slate-100 text-slate-500" : isVer ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {!f.isActive ? "Inactive" : isVer ? "Verified" : "Pending"}
                  </span>
                  <ChevronRight size={13} className="text-slate-300" />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400 text-[9px]">
              <Users size={20} className="mb-1 opacity-50" /> No farmers match your filter
            </div>
          )}
        </div>
      </div>

      {/* Details & Document Modal */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
            {detailLoading ? (
              <div className="flex h-64 items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                <Loader2 className="animate-spin text-emerald-500" size={20} /> Loading Farmer Details...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <div>
                      <h3 className="text-xs font-black">{selected.name}</h3>
                      <p className="text-[8px] text-slate-400">{selected._id} • {selected.mobile}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={14} /></button>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-3 text-[9px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[7px]">Location Details</span>
                      <p className="font-bold">Village: {selected.farmLocation?.village || "--"}</p>
                      <p className="font-bold">District: {selected.farmLocation?.district || "--"}</p>
                      <p className="font-bold">State: {selected.farmLocation?.state || "--"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 space-y-1">
                      <span className="font-bold text-slate-400 uppercase text-[7px]">Farm & Produce</span>
                      <p className="font-bold">Primary: {selected.farm?.mainCrop || "--"}</p>
                      <p className="font-bold">Area: {selected.farm?.landArea ? `${selected.farm.landArea} ${selected.farm.landUnit || "Acre"}` : "--"}</p>
                      <p className="font-bold">Language: {selected.preferredLanguage || "English"}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[7px] block mb-1.5">Verification Documents</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selected.documents || []).map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-[8px]">
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={13} className="text-emerald-500 shrink-0" />
                            <span className="font-bold truncate">{doc.name || doc.type}</span>
                          </div>
                          {doc.url && (
                            <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-emerald-600 font-bold hover:underline">
                              View <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      ))}
                      {!selected.documents?.length && <p className="text-slate-400 text-[8px]">No documents uploaded.</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button onClick={() => setSelected(null)} className="rounded-lg border px-3 py-1.5 text-[8px] font-bold text-slate-500">Close</button>
                  {!selected.verification?.isVerified && selected.isActive && (
                    <button
                      onClick={verifyFarmer}
                      disabled={verifyLoading}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[8px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {verifyLoading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Verify Farmer
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}