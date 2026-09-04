"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Camera, MapPin, Phone, Mail, Sprout, ShieldCheck, BadgeCheck,
  Ruler, FileText, CheckCircle2, X, Building2, Eye, Download, Clock3,
  Globe2, Bell, Smartphone, MessageCircle, CalendarDays, Activity,
  Sparkles, RefreshCw, ArrowRight
} from "lucide-react";

const EMPTY_FARMER = {
  name: "",
  avatar: { url: null, publicId: null },
  mobile: "",
  email: "",
  role: "FARMER",
  verification: { isVerified: false, isPhoneVerified: false, verifiedAt: null, verifiedBy: null, verifiedAtCentre: null },
  isActive: true,
  onboardingCompleted: false,
  onboardingSkipped: false,
  onboardingCompletedAt: null,
  farmLocation: { state: "", district: "", village: "", pincode: "" },
  farm: { landArea: null, landUnit: "Acre", mainCrop: "" },
  preferredCentre: null,
  documents: [],
  designation: null,
  officerCentre: null,
  adminLevel: null,
  preferredLanguage: "English",
  notifications: { sms: true, whatsapp: true, push: true },
  lastLogin: null,
};

const LANGUAGES = {
  en: "English",
  English: "English",
  hi: "हिन्दी (Hindi)",
  "हिन्दी (Hindi)": "हिन्दी (Hindi)",
  bn: "বাংলা (Bengali)",
  or: "ଓଡ଼ିଆ (Odia)",
  te: "తెలుగు (Telugu)",
  "తెలుగు (Telugu)": "తెలుగు (Telugu)",
  mr: "मराठी (Marathi)",
  "मराठी (Marathi)": "मराठी (Marathi)",
  "ਪੰਜਾਬੀ (Punjabi)": "ਪੰਜਾਬੀ (Punjabi)",
  "தமிழ் (Tamil)": "தமிழ் (Tamil)",
};

const DOC_TYPES = {
  IDENTITY_PROOF: "Identity Proof",
  LAND_RECORD: "Land Record",
  BANK_PROOF: "Bank Proof",
  OTHER: "Other",
};

export default function ProfilePage() {
  const router = useRouter();
  const [farmer, setFarmer] = useState(EMPTY_FARMER);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const readJson = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Something went wrong.");
    return data;
  };

  const normalizeFarmer = (data = {}) => ({
    ...EMPTY_FARMER,
    ...data,
    avatar: { ...EMPTY_FARMER.avatar, ...(data?.avatar || {}) },
    farmLocation: { ...EMPTY_FARMER.farmLocation, ...(data?.farmLocation || {}) },
    farm: { ...EMPTY_FARMER.farm, ...(data?.farm || {}) },
    verification: { ...EMPTY_FARMER.verification, ...(data?.verification || {}) },
    notifications: { ...EMPTY_FARMER.notifications, ...(data?.notifications || {}) },
    documents: data?.documents || [],
  });

  const fetchFarmerProfile = async (showLoader = true) => {
    try {
      showLoader ? setLoading(true) : setRefreshing(true);
      const res = await fetch("/api/farmer/profile", { cache: "no-store", credentials: "include" });
      const data = await readJson(res);
      const f = normalizeFarmer(data.farmer);
      setFarmer(f);
      setProfileImage(f.avatar?.url || null);
      return f;
    } catch (err) {
      console.error("Farmer profile fetch error:", err);
      showToast(err.message || "Failed to load profile");
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const res = await fetch("/api/farmer/centres", { cache: "no-store", credentials: "include" });
      const data = await readJson(res);
      setCentres(data.centres || []);
    } catch (err) {
      console.error("Procurement centres fetch error:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchFarmerProfile(true), fetchCentres()]);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([fetchFarmerProfile(false), fetchCentres()]);
    showToast("Profile refreshed");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Only JPG, PNG and WEBP images are allowed");
      return (e.target.value = "");
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5MB");
      return (e.target.value = "");
    }

    const previewUrl = URL.createObjectURL(file);
    try {
      setUploadingAvatar(true);
      setProfileImage(previewUrl);
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/farmer/avatar", { method: "POST", body: formData, credentials: "include" });
      const data = await readJson(res);
      setFarmer((prev) => ({ ...prev, avatar: data.avatar }));
      setProfileImage(data.avatar?.url || null);
      showToast("Profile avatar updated successfully");
    } catch (err) {
      console.error("Avatar upload error:", err);
      setProfileImage(farmer.avatar?.url || null);
      showToast(err.message || "Failed to upload avatar");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const getDocumentStatus = (status) => {
    if (status === "VERIFIED") return { label: "Verified", className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 };
    if (status === "REJECTED") return { label: "Rejected", className: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20", icon: Clock3 };
    return { label: "Pending", className: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock3 };
  };

  const formatFileSize = (s) => (!s ? "Unknown size" : s < 1024 ? `${s} B` : s < 1048576 ? `${(s / 1024).toFixed(1)} KB` : `${(s / 1048576).toFixed(1)} MB`);
  const formatDate = (d) => {
    if (!d || Number.isNaN(new Date(d).getTime())) return "Not available";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getCentreName = () => {
    const pc = farmer.preferredCentre;
    if (!pc) return "Not selected";
    if (typeof pc === "object") return pc.name || pc.title || pc.code || pc.centreCode || pc._id || "Selected Centre";
    const found = centres.find((c) => String(c._id) === String(pc));
    return found ? found.name || found.title || found.code || found.centreCode || "Selected Centre" : pc;
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading farmer profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col justify-center items-center p-2 sm:p-4 select-none antialiased">
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-7xl h-full min-h-[92vh] max-h-[94vh] flex flex-col min-h-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-emerald-950/5 dark:shadow-black/50 overflow-hidden relative">
        {/* TOP ACCENT LINE */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-500 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 lg:p-7 overflow-hidden">
          {/* HEADER BAR */}
          <header className="shrink-0 pb-4 border-b border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Verified Agricultural Profile</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Farmer Profile
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Verified identification, farm registry, and linked MSP documentation.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!farmer.onboardingCompleted && (
                <button
                  type="button"
                  onClick={() => router.push("/onboarding")}
                  className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Complete Onboarding</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-9 px-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-500" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </header>

          {/* INNER SCROLLABLE CONTENT */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 hover:scrollbar-thumb-emerald-500">
            {/* HERO PROFILE SUMMARY CARD */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* AVATAR WITH CAMERA UPLOAD */}
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-500 p-[2px] shadow-md shadow-emerald-600/20">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 dark:bg-[#0b1015] flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Farmer avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg cursor-pointer transition-all active:scale-95 ${
                      uploadingAvatar ? "opacity-60 pointer-events-none" : ""
                    }`}
                    title="Change Avatar"
                  >
                    {uploadingAvatar ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  </label>
                  <input id="avatar-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" />
                </div>

                {/* ESSENTIAL IDENTIFICATION DETAILS */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {farmer.name || "Farmer"}
                    </h2>
                    {farmer.verification?.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-wider uppercase">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Account
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400">
                      {farmer.role || "FARMER"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {farmer.mobile ? `+91 ${farmer.mobile}` : "Mobile not set"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {farmer.farmLocation?.village || "Village not specified"}
                      {farmer.farmLocation?.district ? `, ${farmer.farmLocation.district}` : ""}
                    </span>
                  </div>

                  {/* QUICK STATS STRIP */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 text-left">
                    <QuickMetric label="Land Holding" value={farmer.farm?.landArea != null ? `${farmer.farm.landArea} ${farmer.farm.landUnit || "Acre"}` : "—"} icon={Ruler} />
                    <QuickMetric label="Main Crop" value={farmer.farm?.mainCrop || "—"} icon={Sprout} />
                    <QuickMetric label="Centre" value={getCentreName()} icon={Building2} />
                    <QuickMetric label="Documents" value={`${farmer.documents?.length || 0} Registered`} icon={FileText} />
                  </div>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN DETAILS GRID */}
            <div className="grid lg:grid-cols-2 gap-3.5">
              <ProfileSection icon={User} title="Personal Details" desc="Authentication & account identity">
                <InfoItem label="Full Name" value={farmer.name} />
                <InfoItem label="Mobile Number" value={farmer.mobile ? `+91 ${farmer.mobile}` : "—"} icon={Phone} />
                <InfoItem label="Email Address" value={farmer.email || "Not registered"} icon={Mail} />
                <InfoItem label="Account Status" value={farmer.isActive ? "Active Verified Session" : "Inactive"} green={farmer.isActive} />
                <InfoItem label="Preferred Language" value={LANGUAGES[farmer.preferredLanguage] || farmer.preferredLanguage} icon={Globe2} />
              </ProfileSection>

              <ProfileSection icon={MapPin} title="Farm Location" desc="Registered revenue location & address">
                <InfoItem label="Village" value={farmer.farmLocation?.village} />
                <InfoItem label="District" value={farmer.farmLocation?.district} />
                <InfoItem label="State" value={farmer.farmLocation?.state} />
                <InfoItem label="Pincode" value={farmer.farmLocation?.pincode} />
              </ProfileSection>

              <ProfileSection icon={Sprout} title="Agriculture & Mandi Allocation" desc="Land metrics and procurement tie-up">
                <InfoItem label="Land Area" value={farmer.farm?.landArea != null ? `${farmer.farm.landArea} ${farmer.farm.landUnit || "Acre"}` : "—"} icon={Ruler} />
                <InfoItem label="Main Crop" value={farmer.farm?.mainCrop} icon={Sprout} />
                <InfoItem label="Allocated Procurement Centre" value={getCentreName()} icon={Building2} />
                {farmer.officerCentre && (
                  <InfoItem label="Assigned Officer Centre" value={typeof farmer.officerCentre === "object" ? farmer.officerCentre?.name || farmer.officerCentre?._id : farmer.officerCentre} icon={Building2} />
                )}
              </ProfileSection>

              <ProfileSection icon={ShieldCheck} title="Verification & Security Audit" desc="Official APMC validation record">
                <VerificationItem label="Identity Verification" value={farmer.verification?.isVerified ? "Officer Approved" : "Pending Verification"} verified={farmer.verification?.isVerified} />
                <VerificationItem label="Mobile Phone Check" value={farmer.verification?.isPhoneVerified ? "SMS Verified" : "Unverified"} verified={farmer.verification?.isPhoneVerified} />
                <InfoItem label="Verified On" value={formatDate(farmer.verification?.verifiedAt)} icon={CalendarDays} />
                <InfoItem label="Last Portal Access" value={formatDate(farmer.lastLogin)} icon={Clock3} />
              </ProfileSection>
            </div>

            {/* REGISTERED DOCUMENTS SECTION */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Registered Documents ({farmer.documents?.length || 0})
                    </h3>
                    <p className="text-[10px] text-slate-400">Official identity, land record and bank certificates on file</p>
                  </div>
                </div>
              </div>

              {farmer.documents?.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {farmer.documents.map((doc) => {
                    const statusInfo = getDocumentStatus(doc.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div key={doc._id} className="p-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate">{doc.name}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${statusInfo.className}`}>
                              <StatusIcon className="w-2.5 h-2.5" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {DOC_TYPES[doc.type] || doc.type}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2">
                            <span>Size: {formatFileSize(doc.size)}</span>
                            <span>{formatDate(doc.uploadedAt)}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedDocument(doc)}
                          className="mt-3 w-full h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-500" />
                          View Document
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-bold text-slate-500">No documents on file.</p>
                </div>
              )}
            </div>

            {/* NOTIFICATION CHANNELS (READ-ONLY) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3">
                <Bell className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Active Dispatch Channels
                </h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <ChannelBadge icon={Smartphone} label="SMS Notifications" active={farmer.notifications?.sms} />
                <ChannelBadge icon={MessageCircle} label="WhatsApp Alerts" active={farmer.notifications?.whatsapp} />
                <ChannelBadge icon={Bell} label="Push Notifications" active={farmer.notifications?.push} />
              </div>
            </div>
          </div>

          {/* FOOTER AUDIT STRIP */}
          <footer className="shrink-0 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Official Farmer Registry Data • State APMC Records
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Read-Only Verified Profile
            </span>
          </footer>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          statusInfo={getDocumentStatus(selectedDocument.status)}
          fileSize={formatFileSize(selectedDocument.size)}
          formattedDate={formatDate(selectedDocument.uploadedAt)}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[500] px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {toast}
        </div>
      )}
    </div>
  );
}

function ProfileSection({ icon: Icon, title, desc, children }) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-white/5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 mb-2.5">
          <Icon className="w-4 h-4 text-emerald-500" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">{title}</h3>
            <p className="text-[9px] text-slate-400">{desc}</p>
          </div>
        </div>
        <div className="space-y-1.5">{children}</div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon, green = false }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-xs font-bold text-right truncate max-w-[65%] ${green ? "text-emerald-500 font-black" : "text-slate-800 dark:text-slate-200"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function VerificationItem({ label, value, verified }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      <span className={`inline-flex items-center gap-1 text-[10px] font-black ${verified ? "text-emerald-500" : "text-amber-500"}`}>
        {verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
        {value}
      </span>
    </div>
  );
}

function QuickMetric({ label, value, icon: Icon }) {
  return (
    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[8px] uppercase tracking-wider font-bold truncate">{label}</span>
      </div>
      <p className="mt-1 text-xs font-black text-slate-800 dark:text-slate-200 truncate">{value}</p>
    </div>
  );
}

function ChannelBadge({ icon: Icon, label, active }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}>
        {active ? "Active" : "Off"}
      </span>
    </div>
  );
}

function DocumentViewer({ document: doc, statusInfo, fileSize, formattedDate, onClose }) {
  const isImage = doc.mimeType?.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";

  return (
    <div className="fixed inset-0 z-[600] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-black text-slate-900 dark:text-white truncate">{doc.name}</h2>
              <p className="text-[10px] text-slate-400">{DOC_TYPES[doc.type] || doc.type}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 flex items-center justify-center min-h-[320px]">
          {isImage ? (
            <img src={doc.url} alt={doc.name} className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg" />
          ) : isPdf ? (
            <iframe src={doc.url} title={doc.name} className="w-full h-[60vh] rounded-xl bg-white" />
          ) : (
            <div className="text-center p-6">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-700 dark:text-slate-300">Preview not supported</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Please download the file to inspect its content.</p>
            </div>
          )}
        </div>

        <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span>Size: <strong className="text-slate-700 dark:text-slate-200">{fileSize}</strong></span>
            <span>Uploaded: <strong className="text-slate-700 dark:text-slate-200">{formattedDate}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-8 px-3 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
              Close
            </button>
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="h-8 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}