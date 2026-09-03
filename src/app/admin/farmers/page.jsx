"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Eye,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
} from "lucide-react";

const STATUS_OPTIONS = [
  ["ALL", "All Farmers"],
  ["PENDING", "Pending"],
  ["VERIFIED", "Verified"],
  ["REJECTED", "Rejected"],
];

const DOCUMENT_OPTIONS = [
  ["ALL", "All Documents"],
  ["PENDING", "Pending Docs"],
  ["VERIFIED", "Approved Docs"],
  ["REJECTED", "Rejected Docs"],
];

const noScroll = "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const selectStyle = "w-full h-9 px-3 pr-8 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-slate-800 dark:text-slate-200";

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [centres, setCentres] = useState([]);
  const [statistics, setStatistics] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [centre, setCentre] = useState("ALL");
  const [documentStatus, setDocumentStatus] = useState("ALL");

  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  async function fetchFarmers() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status !== "ALL") params.set("status", status);
      if (centre !== "ALL") params.set("centre", centre);
      if (documentStatus !== "ALL") params.set("documentStatus", documentStatus);

      const response = await fetch(`/api/admin/farmers?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to fetch farmers");

      setFarmers(data.farmers || []);
      setCentres(data.centres || []);
      setStatistics(data.statistics || {});
    } catch (err) {
      setError(err.message || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchFarmers(), 250);
    return () => clearTimeout(timer);
  }, [search, status, centre, documentStatus]);

  function showSuccess(message) {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function viewFarmer(farmer) {
    try {
      setError("");
      const res = await fetch(`/api/admin/farmers/${farmer._id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load farmer");
      setSelectedFarmer(data.farmer);
      setShowDetails(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function documentAction(farmer, documentId, action) {
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/admin/farmers/${farmer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, documentAction: action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Document update failed");

      setSelectedFarmer(data.farmer);
      showSuccess(action === "APPROVE" ? "Document approved" : action === "REJECT" ? "Document rejected" : "Document reset");
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function verifyFarmer() {
    if (!selectedFarmer) return;
    if (!window.confirm(`Verify ${selectedFarmer.name}?\n\nRequired documents must already be approved.`)) return;

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/admin/farmers/${selectedFarmer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const missing = data.missingDocuments?.map(formatDocumentType).join(", ");
        throw new Error(missing ? `${data.message}: ${missing}` : data.message || "Failed to verify farmer");
      }
      setSelectedFarmer(data.farmer);
      showSuccess("Farmer verified successfully");
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function rejectFarmer() {
    if (!selectedFarmer) return;
    if (!rejectionReason.trim()) return setError("Please enter a rejection reason");

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/admin/farmers/${selectedFarmer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to reject farmer");

      setSelectedFarmer(data.farmer);
      setShowReject(false);
      setRejectionReason("");
      showSuccess("Farmer rejected successfully");
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function resetReview() {
    if (!selectedFarmer) return;
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/admin/farmers/${selectedFarmer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_REVIEW" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to reset farmer");

      setSelectedFarmer(data.farmer);
      showSuccess("Farmer moved back to pending review");
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeActiveStatus(farmer, active) {
    const action = active ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} ${farmer.name}?`)) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/farmers/${farmer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: active }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update farmer");

      showSuccess(active ? "Farmer activated" : "Farmer deactivated");
      if (selectedFarmer?._id === farmer._id) setSelectedFarmer(data.farmer);
      await fetchFarmers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function requiredDocumentsApproved(farmer) {
    const req = ["IDENTITY_PROOF", "LAND_RECORD", "BANK_PROOF"];
    return req.every((t) => farmer.documents?.some((doc) => doc.type === t && doc.status === "VERIFIED"));
  }

  function documentCounts(farmer) {
    const docs = farmer.documents || [];
    return {
      total: docs.length,
      verified: docs.filter((d) => d.status === "VERIFIED").length,
      pending: docs.filter((d) => d.status === "PENDING").length,
      rejected: docs.filter((d) => d.status === "REJECTED").length,
    };
  }

  function farmerStatus(farmer) {
    if (farmer.verification?.isVerified) return "VERIFIED";
    if (farmer.verification?.rejectionReason) return "REJECTED";
    return "PENDING";
  }

  const hasFilters = Boolean(search.trim() || status !== "ALL" || centre !== "ALL" || documentStatus !== "ALL");
  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setCentre("ALL");
    setDocumentStatus("ALL");
  };

  return (
    <div className={`h-[calc(100dvh-4.5rem)] w-full overflow-hidden p-3.5 sm:p-5 lg:p-6 flex flex-col min-h-0 bg-slate-50/50 dark:bg-[#070b0e] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white ${noScroll}`}>
      {/* HEADER */}
      <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Producer Verification
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Farmer Directory
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchFarmers}
          disabled={loading}
          className="w-9 h-9 rounded-xl bg-white dark:bg-[#0c1217] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
        </button>
      </header>

      {/* METRIC STRIP */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3.5">
        <StatCard label="Total" value={statistics.total || 0} icon={Users} iconClass="bg-indigo-500/10 text-indigo-500 border-indigo-500/20" />
        <StatCard label="Pending" value={statistics.pending || 0} icon={Clock} iconClass="bg-amber-500/10 text-amber-500 border-amber-500/20" />
        <StatCard label="Verified" value={statistics.verified || 0} icon={CheckCircle2} iconClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" />
        <StatCard label="Rejected" value={statistics.rejected || 0} icon={XCircle} iconClass="bg-rose-500/10 text-rose-500 border-rose-500/20" />
        <StatCard label="Active" value={statistics.active || 0} icon={ShieldCheck} iconClass="bg-teal-500/10 text-teal-500 border-teal-500/20" />
        <StatCard label="Pending Docs" value={statistics.documentsPending || 0} icon={FileText} iconClass="bg-blue-500/10 text-blue-500 border-blue-500/20" />
      </div>

      {/* SUCCESS BANNER */}
      {success && (
        <div className="shrink-0 mb-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-500/10 px-3.5 py-2 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <Check className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold flex-1 truncate">{success}</p>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="shrink-0 mb-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-500/10 px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold flex-1 truncate">{error}</p>
          <button type="button" onClick={() => setError("")} className="text-[11px] font-bold underline hover:opacity-80">Dismiss</button>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className="shrink-0 rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-2.5 mb-3.5 shadow-sm flex flex-col md:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farmer name, mobile, email, village..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <div className="relative">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectStyle}>
              {STATUS_OPTIONS.map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={centre} onChange={(e) => setCentre(e.target.value)} className={selectStyle}>
              <option value="ALL">All Centres</option>
              {centres.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative col-span-2 sm:col-span-1">
            <select value={documentStatus} onChange={(e) => setDocumentStatus(e.target.value)} className={selectStyle}>
              {DOCUMENT_OPTIONS.map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* DIRECTORY LIST / TABLE */}
      <section className="flex-1 min-h-0 rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col shadow-sm">
        <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{farmers.length} Producers Enrolled</span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">Verified: {statistics.verified || 0} • Pending: {statistics.pending || 0}</span>
        </div>

        <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${noScroll}`}>
          {loading && farmers.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-xs font-bold text-slate-500 gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" /> Loading producers...
            </div>
          ) : farmers.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <Users className="w-8 h-8 text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No farmers found</p>
              <p className="text-[10px] text-slate-400">Adjust the query filters or check preferred centres.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <table className="w-full hidden xl:table border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-[#090e13]/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Farmer</th>
                    <th className="px-4 py-2.5 text-left">Farm Details</th>
                    <th className="px-4 py-2.5 text-left">Assigned Centre</th>
                    <th className="px-4 py-2.5 text-center">Docs Status</th>
                    <th className="px-4 py-2.5 text-center">Verification</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-center">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {farmers.map((farmer) => {
                    const docs = documentCounts(farmer);
                    const currentStatus = farmerStatus(farmer);

                    return (
                      <tr key={farmer._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={farmer.name} />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{farmer.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{farmer.mobile}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <p className="font-semibold truncate">
                            {farmer.farm?.landArea ? `${farmer.farm.landArea} ${farmer.farm.landUnit}` : "No area specified"}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{farmer.farm?.mainCrop || "No crop listed"}</p>
                        </td>

                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <p className="font-semibold truncate">{farmer.preferredCentre?.name || "Not Selected"}</p>
                          <p className="font-mono text-[10px] text-slate-400 truncate">{farmer.preferredCentre?.centreId || "—"}</p>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400">{docs.verified}✓</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-amber-500">{docs.pending}⏳</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-rose-500">{docs.rejected}✕</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <VerificationBadge status={currentStatus} />
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${farmer.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${farmer.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {farmer.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => viewFarmer(farmer)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white text-[11px] font-bold transition-all shadow-sm"
                          >
                            <Eye className="w-3 h-3" /> Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* MOBILE / TABLET CARDS */}
              <div className="xl:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                {farmers.map((farmer) => {
                  const docs = documentCounts(farmer);
                  const currentStatus = farmerStatus(farmer);

                  return (
                    <div key={farmer._id} className="p-3.5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={farmer.name} />
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{farmer.name}</h3>
                            <p className="text-[10px] text-slate-400 truncate">{farmer.mobile}</p>
                          </div>
                        </div>
                        <VerificationBadge status={currentStatus} />
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="truncate">🌱 {farmer.farm?.landArea ? `${farmer.farm.landArea} ${farmer.farm.landUnit}` : "N/A"}</span>
                        <span className="truncate">🏢 {farmer.preferredCentre?.name || "No centre"}</span>
                        <span className="truncate col-span-2">
                          📑 Docs: {docs.verified} Approved, {docs.pending} Pending, {docs.rejected} Rejected
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className={`text-[10px] font-bold ${farmer.isActive ? "text-emerald-600" : "text-rose-500"}`}>
                          ● {farmer.isActive ? "Active Account" : "Suspended"}
                        </span>
                        <button
                          type="button"
                          onClick={() => viewFarmer(farmer)}
                          className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3 h-3" /> Audit Farmer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* DETAILS / AUDIT MODAL */}
      {showDetails && selectedFarmer && (
        <Modal title="Farmer Verification Audit" onClose={() => setShowDetails(false)} maxWidth="max-w-3xl">
          <div className={`p-5 space-y-4 overflow-y-auto ${noScroll}`}>
            {/* PRODUCER HEADER */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar name={selectedFarmer.name} large />
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">{selectedFarmer.name}</h2>
                  <p className="text-[10px] text-slate-400">{selectedFarmer.mobile} • {selectedFarmer.email || "No email"}</p>
                </div>
              </div>
              <VerificationBadge status={farmerStatus(selectedFarmer)} />
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-bold uppercase text-slate-400">Farm Location</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                  {selectedFarmer.farmLocation?.village || "N/A"}, {selectedFarmer.farmLocation?.district || "N/A"}
                </p>
                <p className="text-[10px] text-slate-400">{selectedFarmer.farmLocation?.state} - {selectedFarmer.farmLocation?.pincode}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-bold uppercase text-slate-400">Agronomic Profile</p>
                <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                  {selectedFarmer.farm?.landArea ? `${selectedFarmer.farm.landArea} ${selectedFarmer.farm.landUnit}` : "Area not provided"}
                </p>
                <p className="text-[10px] text-slate-400">Crop: {selectedFarmer.farm?.mainCrop || "N/A"} • Centre: {selectedFarmer.preferredCentre?.name || "None"}</p>
              </div>
            </div>

            {/* UPLOADED DOCUMENTS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Documents</p>
                <span className="text-[10px] font-bold text-slate-400">{selectedFarmer.documents?.length || 0} Attached</span>
              </div>

              <div className="space-y-2">
                {selectedFarmer.documents?.length ? (
                  selectedFarmer.documents.map((doc) => (
                    <div key={doc._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">{formatDocumentType(doc.type)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>

                        {doc.status === "PENDING" ? (
                          <>
                            <button
                              disabled={saving}
                              onClick={() => documentAction(selectedFarmer, doc._id, "APPROVE")}
                              className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              disabled={saving}
                              onClick={() => documentAction(selectedFarmer, doc._id, "REJECT")}
                              className="h-7 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold hover:bg-rose-500/20"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            disabled={saving}
                            onClick={() => documentAction(selectedFarmer, doc._id, "PENDING")}
                            className="h-7 px-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No documents uploaded by this farmer.
                  </div>
                )}
              </div>
            </div>

            {/* REJECTION REASON NOTIFICATION */}
            {selectedFarmer.verification?.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                <span className="font-bold">Rejection Note:</span> {selectedFarmer.verification.rejectionReason}
              </div>
            )}

            {/* AUDIT FOOTER */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                disabled={saving}
                onClick={() => changeActiveStatus(selectedFarmer, !selectedFarmer.isActive)}
                className={`h-9 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  selectedFarmer.isActive
                    ? "border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                    : "border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                {selectedFarmer.isActive ? "Disable Account" : "Activate Account"}
              </button>

              <div className="flex items-center gap-2">
                {farmerStatus(selectedFarmer) === "REJECTED" && (
                  <button
                    disabled={saving}
                    onClick={resetReview}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Reset Review
                  </button>
                )}

                {!selectedFarmer.verification?.isVerified && (
                  <>
                    <button
                      disabled={saving}
                      onClick={() => setShowReject(true)}
                      className="h-9 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold"
                    >
                      Reject Farmer
                    </button>
                    <button
                      disabled={saving || !requiredDocumentsApproved(selectedFarmer)}
                      onClick={verifyFarmer}
                      className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Verify Farmer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECTION REASON MODAL */}
      {showReject && selectedFarmer && (
        <Modal title="Reject Farmer Registration" onClose={() => setShowReject(false)}>
          <div className="p-5 space-y-3.5">
            <p className="text-xs text-slate-500">Provide an explicit justification for rejecting this producer's account:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="e.g. Land document could not be matched with registry..."
              className="w-full p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowReject(false)} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !rejectionReason.trim()}
                onClick={rejectFarmer}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ==============================================================
   SUB-COMPONENTS
============================================================== */

function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-[#0c1217]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-3 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}

function VerificationBadge({ status }) {
  const isOk = status === "VERIFIED";
  const isPending = status === "PENDING";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${
        isOk
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : isPending
          ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
          : "bg-rose-500/10 border-rose-500/20 text-rose-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOk ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"}`} />
      {status}
    </span>
  );
}

function Avatar({ name, large = false }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "F";
  const size = large ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  return (
    <div className={`${size} rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shrink-0 shadow-sm`}>
      {initial}
    </div>
  );
}

function Modal({ title, children, onClose, maxWidth = "max-w-lg" }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`w-full ${maxWidth} max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c1217] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden ${noScroll}`}>
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function formatDocumentType(type) {
  const names = {
    IDENTITY_PROOF: "Identity Proof",
    LAND_RECORD: "Land Record",
    BANK_PROOF: "Bank Proof",
    OTHER: "Other Document",
  };
  return names[type] || type;
}