"use client";

import {
  Building2,
  Check,
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

/* =========================================================
   DEMO OFFICER
========================================================= */

const initialOfficer = {
  name: "Raj Kumar",
  officerId: "OFF1024",
  mobile: "9876543210",
  email: "raj.kumar@agrinex.gov.in",
  designation: "Procurement Officer",
  centre: "XYZ Farmer Centre",
  district: "Bokaro",
};

/* =========================================================
   PAGE
========================================================= */

export default function OfficerProfilePage() {
  const router = useRouter();

  const [officer, setOfficer] =
    useState(initialOfficer);

  const [editMode, setEditMode] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [editForm, setEditForm] = useState({
    name: initialOfficer.name,
    mobile: initialOfficer.mobile,
    email: initialOfficer.email,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  /* =======================================================
     EDIT
  ======================================================== */

  const startEdit = () => {
    setEditForm({
      name: officer.name,
      mobile: officer.mobile,
      email: officer.email,
    });

    setMessage("");
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditForm({
      name: officer.name,
      mobile: officer.mobile,
      email: officer.email,
    });

    setEditMode(false);
  };

  const saveProfile = () => {
    if (
      !editForm.name.trim() ||
      !editForm.mobile.trim() ||
      !editForm.email.trim()
    ) {
      setMessage(
        "Please complete all editable fields."
      );
      return;
    }

    setOfficer((current) => ({
      ...current,
      name: editForm.name.trim(),
      mobile: editForm.mobile.trim(),
      email: editForm.email.trim(),
    }));

    setEditMode(false);
    setMessage("Profile updated successfully.");
  };

  /* =======================================================
     PASSWORD
  ======================================================== */

  const changePassword = () => {
    if (
      !passwords.current ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setMessage(
        "Please complete all password fields."
      );
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      passwords.newPassword !==
      passwords.confirmPassword
    ) {
      setMessage(
        "New passwords do not match."
      );
      return;
    }

    /*
      REAL API:

      POST /api/officer/change-password
    */

    setPasswords({
      current: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMessage(
      "Password changed successfully."
    );
  };

  /* =======================================================
     LOGOUT
  ======================================================== */

 const logout = async () => {
  await signOut({
    callbackUrl: "/signin",
  });
};

  return (
    <main className="h-full w-full overflow-hidden bg-[#f6f8f7] dark:bg-slate-950">

      <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-7">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header className="mb-4 flex shrink-0 items-center justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Account
              </span>

            </div>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Officer Profile
            </h1>

          </div>

          <div className="hidden items-center gap-2.5 sm:flex">

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">

              <MapPin
                size={14}
                className="text-emerald-600 dark:text-emerald-400"
              />

              <div>

                <p className="text-[7px] font-medium uppercase tracking-wider text-slate-400">
                  Assigned Centre
                </p>

                <p className="text-[9px] font-semibold text-slate-700 dark:text-slate-300">
                  {officer.centre}
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            ALERT
        ================================================= */}

        {message && (
          <div className="mb-3 flex shrink-0 items-center justify-between border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/20">

            <div className="flex items-center gap-2">

              <Check
                size={13}
                className="text-emerald-600"
              />

              <span className="text-[8px] font-semibold text-emerald-700 dark:text-emerald-400">
                {message}
              </span>

            </div>

            <button
              onClick={() => setMessage("")}
              className="text-emerald-600"
            >
              <X size={12} />
            </button>

          </div>
        )}

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">

          {/* =================================================
              PROFILE SIDEBAR
          ================================================= */}

          <section className="min-h-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

            <div className="flex h-full min-h-0 flex-col">

              {/* PROFILE */}

              <div className="border-b border-slate-200 px-5 py-6 dark:border-slate-800">

                <div className="flex items-center gap-3">

                  <div className="relative">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                      {getInitials(officer.name)}
                    </div>

                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white dark:border-slate-900">
                      <Check size={9} />
                    </div>

                  </div>

                  <div className="min-w-0">

                    <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {officer.name}
                    </h2>

                    <p className="mt-0.5 truncate text-[8px] font-medium text-slate-500 dark:text-slate-400">
                      {officer.designation}
                    </p>

                    <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 dark:bg-slate-800">

                      <IdCard
                        size={9}
                        className="text-slate-400"
                      />

                      <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                        {officer.officerId}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* ASSIGNMENT */}

              <div className="border-b border-slate-200 p-4 dark:border-slate-800">

                <p className="mb-2 text-[7px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Current Assignment
                </p>

                <div className="border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">

                  <div className="flex items-start gap-2.5">

                    <Building2
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />

                    <div className="min-w-0">

                      <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200">
                        {officer.centre}
                      </p>

                      <div className="mt-1 flex items-center gap-1">

                        <MapPin
                          size={9}
                          className="text-slate-400"
                        />

                        <span className="text-[7px] text-slate-500 dark:text-slate-400">
                          {officer.district}, Jharkhand
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* STATUS */}

              <div className="flex-1 p-4">

                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-[8px] font-semibold text-slate-700 dark:text-slate-300">
                      Account Active
                    </span>

                  </div>

                  <ShieldCheck
                    size={13}
                    className="text-emerald-500"
                  />

                </div>

                <p className="mt-3 text-[7px] leading-relaxed text-slate-400">
                  Your officer account is verified and assigned to the centre shown above.
                </p>

              </div>

              {/* LOGOUT */}

              <div className="border-t border-slate-200 p-4 dark:border-slate-800">

                <button
                  type="button"
                  onClick={logout}
                  className="
                    flex
                    h-9
                    w-full
                    items-center
                    justify-center
                    gap-2
                    border
                    border-red-200
                    bg-white
                    text-[8px]
                    font-bold
                    text-red-600
                    transition
                    hover:bg-red-50
                    dark:border-red-900
                    dark:bg-slate-900
                    dark:text-red-400
                    dark:hover:bg-red-950/20
                  "
                >
                  <LogOut size={12} />
                  Sign Out
                </button>

              </div>

            </div>

          </section>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section className="min-h-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-full min-h-0 flex-col">

                {/* HEADER */}

                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-8 w-8 items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <User size={14} />
                    </div>

                    <div>

                      <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                        Personal Information
                      </h2>

                      <p className="mt-0.5 text-[7px] text-slate-400">
                        Basic information associated with your account
                      </p>

                    </div>

                  </div>

                  {!editMode && (
                    <button
                      type="button"
                      onClick={startEdit}
                      className="
                        flex
                        h-8
                        items-center
                        gap-1.5
                        bg-emerald-600
                        px-3
                        text-[7px]
                        font-bold
                        text-white
                        transition
                        hover:bg-emerald-700
                      "
                    >
                      <Pencil size={10} />
                      Edit
                    </button>
                  )}

                </div>

                {/* CONTENT */}

                <div className="min-h-0 flex-1 p-5">

                  {editMode ? (

                    <div className="space-y-4">

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <FormInput
                          label="Full Name"
                          icon={<User size={11} />}
                          value={editForm.name}
                          onChange={(value) =>
                            setEditForm((current) => ({
                              ...current,
                              name: value,
                            }))
                          }
                        />

                        <FormInput
                          label="Mobile Number"
                          icon={<Phone size={11} />}
                          type="tel"
                          value={editForm.mobile}
                          onChange={(value) =>
                            setEditForm((current) => ({
                              ...current,
                              mobile: value,
                            }))
                          }
                        />

                      </div>

                      <FormInput
                        label="Email Address"
                        icon={<Mail size={11} />}
                        type="email"
                        value={editForm.email}
                        onChange={(value) =>
                          setEditForm((current) => ({
                            ...current,
                            email: value,
                          }))
                        }
                      />

                      <div className="border-t border-slate-100 pt-4 dark:border-slate-800">

                        <p className="mb-3 text-[7px] font-bold uppercase tracking-[0.15em] text-slate-400">
                          Official Information
                        </p>

                        <div className="grid grid-cols-2 gap-3">

                          <ReadOnlyField
                            label="Officer ID"
                            value={officer.officerId}
                          />

                          <ReadOnlyField
                            label="Designation"
                            value={officer.designation}
                          />

                          <ReadOnlyField
                            label="Assigned Centre"
                            value={officer.centre}
                          />

                          <ReadOnlyField
                            label="District"
                            value={officer.district}
                          />

                        </div>

                      </div>

                      <div className="flex gap-2 pt-2">

                        <button
                          type="button"
                          onClick={saveProfile}
                          className="flex h-9 items-center justify-center gap-1.5 bg-emerald-600 px-4 text-[7px] font-bold text-white hover:bg-emerald-700"
                        >
                          <Check size={11} />
                          Save Changes
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex h-9 items-center justify-center gap-1.5 border border-slate-200 bg-white px-4 text-[7px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <X size={11} />
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <InfoField
                          icon={<User size={12} />}
                          label="Full Name"
                          value={officer.name}
                        />

                        <InfoField
                          icon={<IdCard size={12} />}
                          label="Officer ID"
                          value={officer.officerId}
                          official
                        />

                        <InfoField
                          icon={<Phone size={12} />}
                          label="Mobile Number"
                          value={officer.mobile}
                        />

                        <InfoField
                          icon={<Mail size={12} />}
                          label="Email Address"
                          value={officer.email}
                        />

                        <InfoField
                          icon={<ShieldCheck size={12} />}
                          label="Designation"
                          value={officer.designation}
                          official
                        />

                        <InfoField
                          icon={<Building2 size={12} />}
                          label="Assigned Centre"
                          value={officer.centre}
                          official
                        />

                        <InfoField
                          icon={<MapPin size={12} />}
                          label="District"
                          value={officer.district}
                          official
                        />

                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">

                        <div className="flex items-center gap-2">

                          <ShieldCheck
                            size={13}
                            className="text-emerald-500"
                          />

                          <div>

                            <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                              Verified officer information
                            </p>

                            <p className="mt-0.5 text-[7px] text-slate-400">
                              Official identity and assignment details are managed by administration.
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            </section>

            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="min-h-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-full min-h-0 flex-col">

                {/* HEADER */}

                <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                  <div className="flex h-8 w-8 items-center justify-center bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                    <Lock size={14} />
                  </div>

                  <div>

                    <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                      Security
                    </h2>

                    <p className="mt-0.5 text-[7px] text-slate-400">
                      Manage your account password
                    </p>

                  </div>

                </div>

                {/* PASSWORD FORM */}

                <div className="min-h-0 flex-1 p-5">

                  <div className="mb-4">

                    <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                      Change Password
                    </p>

                    <p className="mt-1 text-[7px] leading-relaxed text-slate-400">
                      Use a strong password that you don't use elsewhere.
                    </p>

                  </div>

                  <PasswordInput
                    label="Current Password"
                    value={passwords.current}
                    visible={showCurrent}
                    onChange={(value) =>
                      setPasswords((current) => ({
                        ...current,
                        current: value,
                      }))
                    }
                    onToggle={() =>
                      setShowCurrent(
                        (current) => !current
                      )
                    }
                  />

                  <div className="mt-3">

                    <PasswordInput
                      label="New Password"
                      value={passwords.newPassword}
                      visible={showNew}
                      onChange={(value) =>
                        setPasswords((current) => ({
                          ...current,
                          newPassword: value,
                        }))
                      }
                      onToggle={() =>
                        setShowNew(
                          (current) => !current
                        )
                      }
                    />

                  </div>

                  <div className="mt-3">

                    <PasswordInput
                      label="Confirm New Password"
                      value={passwords.confirmPassword}
                      visible={showConfirm}
                      onChange={(value) =>
                        setPasswords((current) => ({
                          ...current,
                          confirmPassword: value,
                        }))
                      }
                      onToggle={() =>
                        setShowConfirm(
                          (current) => !current
                        )
                      }
                    />

                  </div>

                  <button
                    type="button"
                    onClick={changePassword}
                    className="
                      mt-4
                      flex
                      h-9
                      w-full
                      items-center
                      justify-center
                      gap-1.5
                      bg-violet-600
                      text-[7px]
                      font-bold
                      text-white
                      transition
                      hover:bg-violet-700
                    "
                  >
                    <KeyRound size={11} />
                    Update Password
                  </button>

                  {/* REQUIREMENTS */}

                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">

                    <p className="mb-3 text-[7px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Password Guidelines
                    </p>

                    <div className="space-y-2">

                      <PasswordRule text="At least 8 characters" />

                      <PasswordRule text="Use a unique password" />

                      <PasswordRule text="Avoid personal information" />

                      <PasswordRule text="Never share your password" />

                    </div>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   INFO FIELD
========================================================= */

function InfoField({
  icon,
  label,
  value,
  official = false,
}) {
  return (
    <div
      className={`
        border
        p-3.5
        ${
          official
            ? "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30"
            : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
        }
      `}
    >

      <div className="flex items-center gap-1.5">

        <span className="text-slate-400">
          {icon}
        </span>

        <span className="text-[7px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>

        {official && (
          <span className="ml-auto text-[5px] font-bold uppercase tracking-wider text-slate-400">
            Official
          </span>
        )}

      </div>

      <p className="mt-2 truncate text-[9px] font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  icon,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-1.5 flex items-center gap-1.5 text-[7px] font-bold text-slate-500 dark:text-slate-400">

        {icon}

        {label}

      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          h-9
          w-full
          border
          border-slate-200
          bg-white
          px-3
          text-[8px]
          font-medium
          text-slate-700
          outline-none
          transition
          focus:border-emerald-500
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-200
        "
      />

    </div>
  );
}

/* =========================================================
   READ ONLY
========================================================= */

function ReadOnlyField({
  label,
  value,
}) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/30">

      <p className="text-[6px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[7px] font-bold text-slate-600 dark:text-slate-300">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[7px] font-bold text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <div className="relative">

        <Lock
          size={11}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder="Enter password"
          className="
            h-9
            w-full
            border
            border-slate-200
            bg-white
            pl-8
            pr-9
            text-[8px]
            font-medium
            text-slate-700
            outline-none
            transition
            focus:border-violet-500
            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-200
          "
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {visible ? (
            <EyeOff size={11} />
          ) : (
            <Eye size={11} />
          )}
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   PASSWORD RULE
========================================================= */

function PasswordRule({
  text,
}) {
  return (
    <div className="flex items-center gap-2">

      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">

        <Check size={8} />

      </div>

      <span className="text-[7px] text-slate-500 dark:text-slate-400">
        {text}
      </span>

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
