"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  MapPin,
  Sprout,
  UserRound,
  Upload,
  X,
  Loader2,
  Languages,
  ChevronDown,
  ShieldCheck,
  Wheat,
  CircleCheck,
  LockKeyhole,
  Info,
  Building2,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const STEPS = [
  { number: 1, title: "Farm Profile", icon: Sprout },
  { number: 2, title: "Preferences", icon: Building2 },
  { number: 3, title: "Verification", icon: ShieldCheck },
];

const LANGS = [
  "English",
  "हिन्दी (Hindi)",
  "বাংলা (Bengali)",
  "ਪੰਜਾਬੀ (Punjabi)",
  "मराठी (Marathi)",
  "తెలుగు (Telugu)",
  "தமிழ் (Tamil)",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const [uploadingDocuments, setUploadingDocuments] = useState({});
  const [documentPreviews, setDocumentPreviews] = useState({});
  const [centres, setCentres] = useState([]);
  const [loadingCentres, setLoadingCentres] = useState(false);

  const [formData, setFormData] = useState({
    state: "",
    district: "",
    village: "",
    pincode: "",
    landArea: "",
    landUnit: "Acre",
    mainCrop: "",
    preferredLanguage: "English",
    preferredCentre: "",
    identityProof: null,
    landRecord: null,
    bankProof: null,
  });

  useEffect(() => {
    let mounted = true;
    const loadOnboarding = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/onboarding", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Unable to load onboarding");
        if (!mounted) return;

        const ob = data.data || {};
        const findDoc = (type) => ob.documents?.find((d) => d.type === type) || null;

        setFormData({
          state: ob.farmLocation?.state || "",
          district: ob.farmLocation?.district || "",
          village: ob.farmLocation?.village || "",
          pincode: ob.farmLocation?.pincode || "",
          landArea: ob.farm?.landArea != null ? String(ob.farm.landArea) : "",
          landUnit: ob.farm?.landUnit || "Acre",
          mainCrop: ob.farm?.mainCrop || "",
          preferredLanguage: ob.preferredLanguage || "English",
          preferredCentre: ob.preferredCentre?._id || ob.preferredCentre || "",
          identityProof: findDoc("IDENTITY_PROOF"),
          landRecord: findDoc("LAND_RECORD"),
          bankProof: findDoc("BANK_PROOF"),
        });
      } catch (err) {
        if (mounted) setError("Unable to load your saved onboarding information.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadOnboarding();
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut({ callbackUrl: "/signin" });
    } catch (err) {
      setLoggingOut(false);
      setError("Unable to log out. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const fetchCentres = async () => {
    const { state, district, pincode, preferredCentre } = formData;
    if (!state.trim() || !district.trim()) {
      setCentres([]);
      return;
    }
    try {
      setLoadingCentres(true);
      setError("");
      const params = new URLSearchParams({ state: state.trim(), district: district.trim() });
      if (/^\d{6}$/.test(pincode.trim())) params.set("pincode", pincode.trim());

      const res = await fetch(`/api/procurement/centres?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Unable to find procurement centres");

      const centreList = Array.isArray(data.data) ? data.data : Array.isArray(data.centres) ? data.centres : [];
      setCentres(centreList);

      if (preferredCentre && !centreList.some((c) => String(c._id) === String(preferredCentre))) {
        setFormData((prev) => ({ ...prev, preferredCentre: "" }));
      }
    } catch (err) {
      setCentres([]);
      setError(err.message || "Unable to find procurement centres.");
    } finally {
      setLoadingCentres(false);
    }
  };

  useEffect(() => {
    if (step !== 2 || !formData.state.trim() || !formData.district.trim()) return;
    const timer = setTimeout(fetchCentres, 400);
    return () => clearTimeout(timer);
  }, [step, formData.state, formData.district, formData.pincode]);

  const handleFileChange = async (type, file) => {
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      return setError("Please upload a PDF, JPG, or PNG file.");
    }
    if (file.size > 5 * 1024 * 1024) return setError("File size must be under 5 MB.");
    if (uploadingDocuments[type]) return;

    const previewUrl = URL.createObjectURL(file);
    try {
      setError("");
      setDocumentPreviews((p) => ({ ...p, [type]: { url: previewUrl, fileName: file.name, mimeType: file.type, size: file.size } }));
      setFormData((p) => ({ ...p, [type]: { name: file.name, mimeType: file.type, size: file.size, local: true, uploading: true } }));
      setUploadingDocuments((p) => ({ ...p, [type]: true }));

      const body = new FormData();
      body.append("file", file);
      body.append("type", type);

      const res = await fetch("/api/onboarding/documents", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Document upload failed");

      setFormData((p) => ({ ...p, [type]: { ...data.data, status: data.data.status || "UPLOADED" } }));
    } catch (err) {
      setError(err.message || "Unable to upload document.");
      setFormData((p) => ({ ...p, [type]: null }));
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingDocuments((p) => ({ ...p, [type]: false }));
      setDocumentPreviews((p) => ({ ...p, [type]: null }));
    }
  };

  const removeFile = async (type) => {
    const doc = formData[type];
    if (uploadingDocuments[type]) return;

    if (!doc?.id) {
      setFormData((p) => ({ ...p, [type]: null }));
      setDocumentPreviews((p) => {
        if (p[type]?.url) URL.revokeObjectURL(p[type].url);
        return { ...p, [type]: null };
      });
      return;
    }

    try {
      setError("");
      const res = await fetch("/api/onboarding/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Unable to remove document");

      setFormData((p) => ({ ...p, [type]: null }));
      setDocumentPreviews((p) => ({ ...p, [type]: null }));
    } catch (err) {
      setError(err.message || "Unable to remove document.");
    }
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.state.trim()) return setError("Please enter your state."), false;
      if (!formData.district.trim()) return setError("Please enter your district."), false;
      if (!formData.village.trim()) return setError("Please enter your village or town."), false;
      if (!/^\d{6}$/.test(formData.pincode)) return setError("Please enter a valid 6-digit pincode."), false;
      if (!formData.landArea || Number(formData.landArea) <= 0) return setError("Please enter a valid land area."), false;
      if (!formData.mainCrop.trim()) return setError("Please enter your primary crop."), false;
    }
    if (step === 2 && !formData.preferredCentre) {
      return setError("Please select your preferred procurement centre."), false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    try {
      setLoading(true);
      setError("");
      const payload = step === 1
        ? {
            farmLocation: {
              state: formData.state.trim(),
              district: formData.district.trim(),
              village: formData.village.trim(),
              pincode: formData.pincode,
            },
            farm: {
              landArea: Number(formData.landArea),
              landUnit: formData.landUnit,
              mainCrop: formData.mainCrop.trim(),
            },
          }
        : {
            preferredLanguage: formData.preferredLanguage,
            preferredCentre: formData.preferredCentre,
          };

      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save onboarding data");

      setStep((p) => Math.min(p + 1, 3));
    } catch (err) {
      setError(err.message || "Unable to save your information.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (Object.values(uploadingDocuments).some(Boolean)) {
      return setError("Please wait for your documents to finish uploading.");
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Unable to complete onboarding");
      window.location.href = "/farmer/dashboard";
    } catch (err) {
      setError(err.message || "Unable to complete onboarding.");
      setLoading(false);
    }
  };

  const FileUpload = ({ label, description, type, icon: Icon = FileText }) => {
    const file = formData[type];
    const preview = documentPreviews[type];
    const isUploading = !!uploadingDocuments[type];
    const isImage = file?.mimeType?.startsWith("image/") || preview?.mimeType?.startsWith("image/");
    const displayUrl = file?.url || preview?.url || null;

    return (
      <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-emerald-700 ${
        file
          ? isUploading ? "border-amber-400/50 bg-amber-500/[0.04]" : "border-emerald-500/40 bg-emerald-500/[0.04]"
          : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-950/[0.04]"
      }`}>
        {displayUrl && isImage && (
          <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={displayUrl}
              alt={file?.name || preview?.fileName || label}
              className={`h-full w-full object-cover transition-all duration-500 ${isUploading ? "scale-105 blur-[2px] opacity-60" : "opacity-100"}`}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px]">
                <div className="flex min-w-[150px] flex-col items-center gap-2 rounded-2xl bg-white/95 px-5 py-4 text-center shadow-xl dark:bg-slate-900/95">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white">Uploading document</p>
                  <p className="text-[8px] text-slate-400">Please wait...</p>
                </div>
              </div>
            )}
            {!isUploading && file?.url && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1.5 text-white shadow-lg">
                <Check className="h-3 w-3" />
                <span className="text-[8px] font-black">Uploaded</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3.5 p-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isUploading ? "bg-amber-500/10 text-amber-500" : file?.url ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-500"
          }`}>
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : file?.url ? <CircleCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black text-slate-900 dark:text-white">{label}</p>
            {file ? (
              <>
                <p className="mt-1 truncate text-[9px] font-medium text-emerald-600 dark:text-emerald-400">{file.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {file.size && <span className="text-[8px] text-slate-400">{(file.size / 1048576).toFixed(2)} MB</span>}
                  {isUploading && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[7px] font-black text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> Uploading...
                    </span>
                  )}
                  {!isUploading && file?.url && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[7px] font-black text-emerald-600 dark:text-emerald-400">
                      <Check className="h-2.5 w-2.5" /> Uploaded
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-1 text-[9px] leading-relaxed text-slate-400">{description}</p>
            )}
          </div>

          {file ? (
            <button
              type="button"
              onClick={() => removeFile(type)}
              disabled={isUploading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-rose-950/30"
              aria-label={`Remove ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <label className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 text-[9px] font-black text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white dark:text-emerald-400 dark:hover:text-white">
              <Upload className="h-3.5 w-3.5" />
              Upload
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => { handleFileChange(type, e.target.files?.[0]); e.target.value = ""; }}
              />
            </label>
          )}
        </div>

        {file && (
          <div className={`flex items-center gap-2 border-t px-4 py-2 ${isUploading ? "border-amber-500/10 bg-amber-500/5" : "border-emerald-500/10 bg-emerald-500/5"}`}>
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400">Uploading securely to AGRINEX...</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">Document uploaded successfully</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const selectedCentre = centres.find((c) => String(c._id) === String(formData.preferredCentre)) || null;

  return (
    <div className="fixed inset-0 h-full w-screen overflow-hidden bg-[#f6f9f7] font-sans antialiased text-slate-900 dark:bg-[#070c10] dark:text-slate-100">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[130px]" />
        <div className="absolute -bottom-52 -right-32 h-[500px] w-[520px] rounded-full bg-teal-500/[0.08] blur-[140px]" />
        <div className="absolute -left-52 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-lime-500/[0.05] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045]" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 h-[68px] border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-[#070c10]/80">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-500 shadow-lg shadow-emerald-500/20">
              <div className="flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-[9px] bg-[#08100c]">
                <Sprout className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-black tracking-[-0.04em] text-slate-900 dark:text-white">
                  AGRI<span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">NEX</span>
                </span>
                <span className="hidden rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-1 text-[7px] font-black uppercase tracking-[0.12em] text-emerald-500 sm:inline-flex">
                  Secure
                </span>
              </div>
              <p className="mt-1 hidden text-[8px] font-medium tracking-wide text-slate-400 sm:block">Digital Procurement Network</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-[8px] font-black text-emerald-500">
                {step}/3
              </div>
              <div>
                <p className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400">Profile setup</p>
                <p className="mt-0.5 text-[8px] font-bold text-slate-600 dark:text-slate-300">
                  {step === 1 ? "Farm details" : step === 2 ? "Preferences" : "Verification"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading || loggingOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/40 text-[9px] font-bold transition-all disabled:opacity-50"
              title="Log out from account"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="fixed inset-x-0 bottom-0 top-[68px] z-10 flex items-center justify-center overflow-hidden px-3 py-3 sm:px-5 sm:py-4 lg:py-5">
        <div className="flex h-full w-full max-w-[1040px] items-center justify-center">
          <div className="relative flex max-h-full w-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/95 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-slate-800 dark:bg-[#0c1319]/95 dark:shadow-[0_25px_80px_rgba(0,0,0,0.40)]">
            <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500" />

            {/* TITLE & PROGRESS */}
            <div className="shrink-0 border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5 dark:border-slate-800">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Farmer Onboarding
                  </div>
                  <h1 className="mt-2 text-[19px] font-black tracking-[-0.035em] text-slate-950 sm:text-[22px] dark:text-white">
                    {step === 1 ? "Let's set up your farm profile" : step === 2 ? "Choose your AGRINEX preferences" : "Complete your verification"}
                  </h1>
                  <p className="mt-1 max-w-xl text-[9px] leading-[1.6] text-slate-500 sm:text-[10px] dark:text-slate-400">
                    {step === 1
                      ? "Add your farm location and crop information to get relevant procurement centres and services."
                      : step === 2
                        ? "Choose your language and preferred procurement centre based on your farm location."
                        : "Upload your supporting documents to help us verify your farmer profile."}
                  </p>
                </div>

                <div className="w-full shrink-0 lg:w-[300px]">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-400">Registration progress</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[7px] font-black text-emerald-600 dark:text-emerald-400">
                      {step} of 3
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-[13px] right-[13px] top-[13px] h-[2px] rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div
                      className="absolute left-[13px] top-[13px] h-[2px] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
                    />
                    <div className="relative flex justify-between">
                      {STEPS.map((item) => {
                        const Icon = item.icon;
                        const active = item.number === step;
                        const completed = item.number < step;
                        return (
                          <div key={item.number} className="flex flex-col items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                              completed
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : active
                                  ? "border-emerald-500 bg-white text-emerald-500 shadow-md shadow-emerald-500/20 dark:bg-slate-900"
                                  : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                            }`}>
                              {completed ? <Check className="h-3 w-3" strokeWidth={3} /> : <Icon className="h-3 w-3" />}
                            </div>
                            <span className={`mt-1.5 text-[7px] font-black ${active || completed ? "text-emerald-500" : "text-slate-400"}`}>
                              {item.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 sm:px-7 sm:py-5 dark:scrollbar-thumb-slate-700">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-[12px] font-black text-slate-900 dark:text-white">Where is your farm?</h2>
                      <p className="mt-0.5 text-[9px] text-slate-400">This helps us identify nearby procurement centres.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { name: "state", label: "State", placeholder: "e.g. Bihar", icon: MapPin },
                      { name: "district", label: "District", placeholder: "e.g. Bhagalpur" },
                      { name: "village", label: "Village / Town", placeholder: "Enter village or town" },
                      { name: "pincode", label: "Pincode", placeholder: "6-digit PIN code" },
                    ].map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.name}>
                          <label className="mb-1.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            {field.label}
                          </label>
                          <div className="relative">
                            {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />}
                            <input
                              name={field.name}
                              value={formData[field.name]}
                              onChange={
                                field.name === "pincode"
                                  ? (e) => {
                                      setFormData((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }));
                                      setError("");
                                    }
                                  : handleChange
                              }
                              inputMode={field.name === "pincode" ? "numeric" : undefined}
                              placeholder={field.placeholder}
                              className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-[11px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:hover:border-slate-600 dark:focus:bg-slate-800 ${
                                Icon ? "pl-10" : ""
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
                        <Wheat className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-[12px] font-black text-slate-900 dark:text-white">Tell us about your farm</h2>
                        <p className="mt-0.5 text-[9px] text-slate-400">Basic crop and land information.</p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Total Cultivated Area
                        </label>
                        <div className="flex gap-2">
                          <input
                            name="landArea"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.landArea}
                            onChange={handleChange}
                            placeholder="e.g. 5.5"
                            className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-[11px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                          />
                          <div className="relative">
                            <select
                              name="landUnit"
                              value={formData.landUnit}
                              onChange={handleChange}
                              className="h-12 w-[105px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-[10px] font-black text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              <option value="Acre">Acre</option>
                              <option value="Hectare">Hectare</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Primary Crop
                        </label>
                        <div className="relative">
                          <Sprout className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-500" />
                          <input
                            name="mainCrop"
                            value={formData.mainCrop}
                            onChange={handleChange}
                            placeholder="e.g. Wheat, Paddy, Maize"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-[11px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.045] px-4 py-3">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <p className="text-[9px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Your farm details help AGRINEX recommend suitable procurement centres and provide relevant agricultural services.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <Languages className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-[13px] font-black text-slate-900 dark:text-white">Preferred Language</h2>
                        <p className="mt-1 text-[9px] leading-relaxed text-slate-400">Choose the language you are most comfortable using.</p>
                      </div>
                    </div>

                    <label className="mb-1.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Application Language
                    </label>
                    <div className="relative">
                      <Languages className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                      <select
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleChange}
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-[11px] font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                      >
                        {LANGS.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    <div className="mt-5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3">
                      <p className="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Your language</p>
                      <p className="mt-1.5 text-[9px] leading-relaxed text-slate-500 dark:text-slate-400">
                        AGRINEX will use your selected language wherever supported.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-[13px] font-black text-slate-900 dark:text-white">Preferred Procurement Centre</h2>
                        <p className="mt-1 text-[9px] leading-relaxed text-slate-400">Centres are automatically filtered according to your farm location.</p>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 py-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                        <MapPin className="h-3 w-3" />
                        {formData.district || "District"}
                      </span>
                      {formData.state && <span className="text-[8px] font-semibold text-slate-400">{formData.state}</span>}
                      {formData.pincode && <span className="text-[8px] font-semibold text-slate-400">· {formData.pincode}</span>}
                    </div>

                    <label className="mb-1.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Select Centre
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500" />
                      <select
                        name="preferredCentre"
                        value={formData.preferredCentre}
                        onChange={handleChange}
                        disabled={loadingCentres || centres.length === 0}
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-[10px] font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                      >
                        <option value="">
                          {loadingCentres ? "Finding nearby centres..." : centres.length === 0 ? "No centres found" : "Select your preferred centre"}
                        </option>
                        {centres.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}{c.address?.village ? ` — ${c.address.village}` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    {loadingCentres && (
                      <div className="mt-3 flex items-center gap-2 text-[8px] font-bold text-teal-600 dark:text-teal-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding procurement centres near your location...
                      </div>
                    )}

                    {!loadingCentres && formData.state && formData.district && centres.length === 0 && (
                      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2.5">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <p className="text-[8px] leading-relaxed text-amber-700 dark:text-amber-400">
                          No active procurement centre was found for this location. Check your state, district or pincode.
                        </p>
                      </div>
                    )}

                    {selectedCentre && (
                      <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.045] p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                            <Check className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-900 dark:text-white">{selectedCentre.name}</p>
                            <p className="mt-1 text-[8px] leading-relaxed text-slate-500 dark:text-slate-400">
                              {selectedCentre.address?.village ? `${selectedCentre.address.village}, ` : ""}
                              {selectedCentre.address?.district ? `${selectedCentre.address.district}, ` : ""}
                              {selectedCentre.address?.state || formData.state}
                              {selectedCentre.address?.pincode ? ` - ${selectedCentre.address.pincode}` : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <p className="text-[8px] leading-relaxed text-slate-400">
                        Centres shown here are active centres matching your registered farm location.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.08] via-teal-500/[0.04] to-transparent p-5">
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <h2 className="mt-5 text-[15px] font-black text-slate-900 dark:text-white">Secure verification</h2>
                      <p className="mt-2 text-[9px] leading-[1.8] text-slate-500 dark:text-slate-400">
                        Supporting documents help AGRINEX verify your farmer profile and enable access to relevant procurement services.
                      </p>

                      <div className="mt-5 space-y-2.5">
                        {["Documents are securely submitted", "Maximum file size is 5 MB", "Verification can be completed later"].map((text) => (
                          <div key={text} className="flex items-center gap-2.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                              <Check className="h-3 w-3 text-emerald-500" />
                            </div>
                            <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">{text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-white/50 px-3 py-2.5 dark:bg-slate-900/30">
                        <LockKeyhole className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">PDF, JPG or PNG · Max 5 MB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3">
                      <h2 className="text-[12px] font-black text-slate-900 dark:text-white">Supporting documents</h2>
                      <p className="mt-1 text-[9px] text-slate-400">Upload the documents you currently have available.</p>
                    </div>

                    <div className="space-y-2.5">
                      <FileUpload
                        label="Identity Proof"
                        description="Voter ID, PAN, Government ID, etc."
                        type="identityProof"
                        icon={UserRound}
                      />
                      <FileUpload
                        label="Land Record"
                        description="Khasra, Khatauni, or lease agreement"
                        type="landRecord"
                        icon={MapPin}
                      />
                      <FileUpload
                        label="Bank Document"
                        description="Cancelled cheque or passbook front page"
                        type="bankProof"
                        icon={FileText}
                      />
                    </div>

                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <p className="text-[8px] leading-relaxed text-slate-400">
                        You can continue and complete document verification later from your profile.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-5">
                  <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[9px] font-bold text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400">
                    <X className="h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className={`flex shrink-0 items-center border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:px-7 ${
              step > 1 ? "justify-between" : "justify-end"
            }`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setError(""); setStep((p) => Math.max(p - 1, 1)); }}
                  disabled={loading}
                  className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-[8px] font-black uppercase tracking-[0.12em] text-slate-500 transition-all hover:bg-slate-200/70 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading || (step === 2 && loadingCentres)}
                  className="group flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] px-6 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-emerald-500/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={loading}
                  className="group flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] px-6 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-[position:100%_0] hover:shadow-emerald-500/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Finishing...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}