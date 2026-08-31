"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Tractor,
  Globe,
  Bell,
  Check,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger = {
  hidden: {
    opacity: 1,
  },

  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

function SignupContent() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",

    password: "",
    confirmPassword: "",

    state: "",
    district: "",
    village: "",
    pincode: "",

    landArea: "",
    landUnit: "Acre",

    mainCrop: "",

    preferredLanguage: "English",

    notifications: {
      sms: true,
      whatsapp: true,
      push: false,
    },

    otp: ["", "", "", ""],

    termsAccepted: false,
    privacyAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [signupSuccess, setSignupSuccess] = useState(false);

  const [registrationUserId, setRegistrationUserId] =
    useState(null);

  const [errors, setErrors] = useState({});
  const passwordStrength = useMemo(() => {
    const password = formData.password;

    if (!password) {
      return {
        score: 0,
        label: "",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        score,
        label: "Weak",
      };
    }

    if (score <= 3) {
      return {
        score,
        label: "Moderate",
      };
    }

    return {
      score,
      label: "Strong",
    };
  }, [formData.password]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name.startsWith("notif_")) {
      const channel = name.replace("notif_", "");

      setFormData((previous) => ({
        ...previous,

        notifications: {
          ...previous.notifications,
          [channel]: checked,
        },
      }));
    } else {
      setFormData((previous) => ({
        ...previous,

        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: null,
      }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    if (value.length > 1) {
      return;
    }

    const newOtp = [...formData.otp];

    newOtp[index] = value;

    setFormData((previous) => ({
      ...previous,
      otp: newOtp,
    }));

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);

      nextInput?.focus();
    }

    if (errors.otp) {
      setErrors((previous) => ({
        ...previous,
        otp: null,
      }));
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !formData.otp[index] && index > 0) {
      const previousInput = document.getElementById(`otp-input-${index - 1}`);

      previousInput?.focus();
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      const phone = formData.mobileNumber.replace(/\D/g, "");

      if (!/^[6-9]\d{9}$/.test(phone)) {
        newErrors.mobileNumber = "Enter a valid 10-digit mobile number";
      }

      if (formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
          newErrors.email = "Enter a valid email address";
        }
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must contain at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    /* -----------------------------------------------------
       STEP 2
    ----------------------------------------------------- */

    if (step === 2) {
      if (!formData.state.trim()) {
        newErrors.state = "State is required";
      }

      if (!formData.district.trim()) {
        newErrors.district = "District is required";
      }

      if (!formData.village.trim()) {
        newErrors.village = "Village / Taluk is required";
      }

      if (!/^\d{6}$/.test(formData.pincode.trim())) {
        newErrors.pincode = "Enter a valid 6-digit pincode";
      }

      if (!formData.landArea || Number(formData.landArea) <= 0) {
        newErrors.landArea = "Enter valid farm area";
      }

      if (!formData.mainCrop.trim()) {
        newErrors.mainCrop = "Select your primary crop";
      }
    }

    /* -----------------------------------------------------
       STEP 3
    ----------------------------------------------------- */

    if (step === 3) {
      if (formData.otp.join("").length !== 4) {
        newErrors.otp = "Enter the 4-digit OTP";
      }

      if (!formData.termsAccepted) {
        newErrors.terms = "Accept the Terms & Conditions";
      }

      if (!formData.privacyAccepted) {
        newErrors.privacy = "Accept the Privacy Policy";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    setErrors({});

    setCurrentStep((previous) => Math.max(1, previous - 1));
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // ==============================
    // STEP 1 → STEP 2
    // ==============================

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    // ==============================
    // STEP 2 → REGISTER → STEP 3
    // ==============================

    if (currentStep === 2) {
      setIsLoading(true);
      setErrors({});

      try {
        const response = await fetch(
          "/api/auth/register",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              fullName: formData.fullName,
              mobileNumber:
                formData.mobileNumber,
              email: formData.email,

              password: formData.password,
              confirmPassword:
                formData.confirmPassword,

              state: formData.state,
              district: formData.district,
              village: formData.village,
              pincode: formData.pincode,

              landArea: formData.landArea,
              landUnit: formData.landUnit,
              mainCrop: formData.mainCrop,

              preferredLanguage:
                formData.preferredLanguage,

              notifications:
                formData.notifications,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Unable to create account"
          );
        }

        // IMPORTANT
        setRegistrationUserId(
          data.userId
        );

        console.log(
          "AGRINEX OTP:",
          data.otp
        );

        setCurrentStep(3);
      } catch (error) {
        console.error(
          "REGISTRATION ERROR:",
          error
        );

        setErrors({
          general:
            error.message ||
            "Unable to create account",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    if (!registrationUserId) {
      setErrors({
        general:
          "Registration session not found. Please restart.",
      });

      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const otp = formData.otp.join("");

      const response = await fetch(
        "/api/auth/register/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: registrationUserId,
            mobileNumber:
              formData.mobileNumber,
            otp,

            termsAccepted:
              formData.termsAccepted,

            privacyAccepted:
              formData.privacyAccepted,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "OTP verification failed"
        );
      }

      // ==================================
      // REGISTRATION COMPLETE
      // ==================================

      setSignupSuccess(true);

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1400);
    } catch (error) {
      console.error(
        "OTP VERIFICATION ERROR:",
        error
      );

      setErrors({
        otp:
          error.message ||
          "Unable to verify OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (signupSuccess) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-[#080d12] px-4">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            w-full
            max-w-sm
            rounded-[28px]
            bg-white
            dark:bg-[#0d141b]
            border
            border-slate-200
            dark:border-slate-800
            shadow-2xl
            p-7
            text-center
          "
        >
          <div
            className="
            mx-auto
            w-16
            h-16
            rounded-2xl
            bg-emerald-500/10
            flex
            items-center
            justify-center
          "
          >
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>

          <h2 className="mt-5 text-xl font-black">Registration Complete</h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Your AGRINEX farmer profile has been successfully created.
          </p>

          <div
            className="
            mt-5
            p-3
            rounded-2xl
            bg-emerald-500/10
            border
            border-emerald-500/20
          "
          >
            <div
              className="
              flex
              items-center
              justify-center
              gap-2
            "
            >
              <RefreshCw
                className="
                  w-3.5
                  h-3.5
                  text-emerald-500
                  animate-spin
                "
              />

              <span
                className="
                text-[10px]
                font-black
                text-emerald-600
                dark:text-emerald-400
              "
              >
                Opening Farmer Dashboard
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="
      fixed
      inset-0
      w-screen
      h-screen
      max-w-[100vw]
      max-h-screen
      overflow-hidden
      bg-slate-50
      dark:bg-[#080d12]
      text-slate-900
      dark:text-slate-100
      font-sans
    "
    >
      <div
        className="
        fixed
        inset-0
        pointer-events-none
        overflow-hidden
      "
      >
        <div
          className="
          absolute
          -top-32
          left-1/2
          -translate-x-1/2
          w-162.5
          h-87.5
          rounded-full
          bg-emerald-500/10
          blur-[120px]
        "
        />

        <div
          className="
          absolute
          -bottom-40
          -right-25
          w-112.5
          h-87,5
          rounded-full
          bg-teal-500/10
          blur-[120px]
        "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            dark:opacity-[0.04]
          "
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <header
        className="
        absolute
        top-0
        left-0
        right-0
        z-30
        h-16
        sm:h-17.5
        px-4
        sm:px-8
      "
      >
        <div
          className="
          max-w-7xl
          mx-auto
          h-full
          flex
          items-center
          justify-between
        "
        >
          {/* LOGO */}

          <Link
            href="/"
            className="
              flex
              items-center
              gap-2.5
              group
            "
          >
            <div
              className="
              w-9
              h-9
              rounded-xl
              bg-linear-to-br
              from-emerald-500
              via-teal-500
              to-lime-500
              p-[1.5px]
              shadow-lg
              shadow-emerald-500/20
              group-hover:scale-105
              transition-transform
            "
            >
              <div
                className="
                w-full
                h-full
                rounded-[9px]
                bg-slate-950
                flex
                items-center
                justify-center
              "
              >
                <Sprout
                  className="
                  w-4
                  h-4
                  text-emerald-400
                "
                />
              </div>
            </div>

            <div>
              <div
                className="
                text-lg
                font-black
                tracking-tight
              "
              >
                AGRI
                <span
                  className="
                  text-transparent
                  bg-clip-text
                  bg-linear-to-r
                  from-emerald-500
                  to-lime-500
                "
                >
                  NEX
                </span>
              </div>

              <p
                className="
                hidden
                sm:block
                text-[9px]
                text-slate-400
              "
              >
                Digital Procurement Network
              </p>
            </div>
          </Link>

          {/* LOGIN */}

          <Link
            href="/login"
            className="
              flex
              items-center
              gap-1.5
              px-3
              py-2
              rounded-xl
              text-xs
              font-bold
              text-slate-500
              hover:text-emerald-500
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition-all
            "
          >
            <span>Already registered?</span>

            <span className="text-emerald-500">Sign In</span>

            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main
        className="
        absolute
        inset-0
        z-10
        flex
        items-center
        justify-center
        px-3
        sm:px-4
        pt-14
        pb-10
        overflow-hidden
      "
      >
        <div
          className="
          w-full
          max-w-130
          max-h-full
        "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="
              relative
              rounded-[28px]
              bg-white/95
              dark:bg-[#0d141b]/95
              backdrop-blur-2xl
              border
              border-slate-200
              dark:border-slate-800
              shadow-2xl
              shadow-emerald-950/10
              dark:shadow-black/50
              overflow-hidden
            "
          >
            {/* TOP LINE */}

            <div
              className="
              absolute
              top-0
              left-0
              right-0
              h-0.75
              bg-linear-to-r
              from-emerald-500
              via-teal-500
              to-lime-500
            "
            />

            <div className="p-4 sm:p-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="text-center"
              >
                <div
                  className="
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1
                  rounded-full
                  bg-emerald-500/10
                  border
                  border-emerald-500/15
                  text-emerald-600
                  dark:text-emerald-400
                  text-[8px]
                  font-black
                  uppercase
                  tracking-wider
                "
                >
                  <Tractor className="w-3 h-3" />
                  Farmer Registration
                </div>

                <h1
                  className="
                  mt-2.5
                  text-xl
                  sm:text-2xl
                  font-black
                  tracking-tight
                "
                >
                  Create Your AGRINEX Account
                </h1>

                <p
                  className="
                  mt-1
                  text-[10px]
                  leading-relaxed
                  text-slate-500
                  dark:text-slate-400
                "
                >
                  Register once to book procurement slots and track your
                  produce.
                </p>
              </motion.div>

              <div className="mt-4">
                <div
                  className="
                  flex
                  items-center
                  justify-between
                  text-[8px]
                  font-bold
                  text-slate-400
                "
                >
                  <span className={currentStep >= 1 ? "text-emerald-500" : ""}>
                    Account
                  </span>

                  <span className={currentStep >= 2 ? "text-emerald-500" : ""}>
                    Farm Details
                  </span>

                  <span className={currentStep >= 3 ? "text-emerald-500" : ""}>
                    Verification
                  </span>
                </div>

                <div
                  className="
                  grid
                  grid-cols-3
                  gap-1.5
                  mt-1.5
                "
                >
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`
                          h-1
                          rounded-full
                          transition-all
                          duration-300

                          ${currentStep >= step
                          ? "bg-linear-to-r from-emerald-500 to-lime-500"
                          : "bg-slate-200 dark:bg-slate-800"
                        }
                        `}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-4">
                {currentStep === 1 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="space-y-2.5"
                  >
                    <FormField
                      icon={User}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      error={errors.fullName}
                    />

                    <div
                      className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                    >
                      <FormField
                        icon={Phone}
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        type="tel"
                        placeholder="Mobile Number"
                        error={errors.mobileNumber}
                        prefix="+91"
                      />

                      <FormField
                        icon={Mail}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="Email (Optional)"
                        error={errors.email}
                      />
                    </div>

                    <div
                      className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                    >
                      <PasswordField
                        value={formData.password}
                        onChange={handleChange}
                        name="password"
                        placeholder="Password"
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                        error={errors.password}
                      />

                      <PasswordField
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        show={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        error={errors.confirmPassword}
                      />
                    </div>

                    {formData.password && (
                      <div>
                        <div
                          className="
                          flex
                          justify-between
                          mb-1
                        "
                        >
                          <span
                            className="
                            text-[8px]
                            font-bold
                            text-slate-400
                          "
                          >
                            Password strength
                          </span>

                          <span
                            className="
                            text-[8px]
                            font-black
                            text-emerald-500
                          "
                          >
                            {passwordStrength.label}
                          </span>
                        </div>

                        <div
                          className="
                          flex
                          gap-1
                        "
                        >
                          {[1, 2, 3, 4, 5].map((bar) => (
                            <div
                              key={bar}
                              className={`
                                  h-1
                                  flex-1
                                  rounded-full

                                  ${bar <= passwordStrength.score
                                  ? "bg-emerald-500"
                                  : "bg-slate-200 dark:bg-slate-700"
                                }
                                `}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="space-y-2.5"
                  >
                    {/* LOCATION */}

                    <SectionTitle icon={MapPin} title="Farm Location" />

                    <div
                      className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                    >
                      <InputField
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        error={errors.state}
                      />

                      <InputField
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="District"
                        error={errors.district}
                      />
                    </div>

                    <div
                      className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                    >
                      <InputField
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        placeholder="Village / Taluk"
                        error={errors.village}
                      />

                      <InputField
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        type="tel"
                        error={errors.pincode}
                      />
                    </div>

                    {/* FARM */}

                    <SectionTitle icon={Sprout} title="Farm Information" />

                    <div
                      className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                    >
                      <div>
                        <div
                          className="
                          flex
                          items-center
                          rounded-xl
                          bg-slate-50
                          dark:bg-slate-800/60
                          border
                          border-slate-200
                          dark:border-slate-700
                          overflow-hidden
                        "
                        >
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            name="landArea"
                            value={formData.landArea}
                            onChange={handleChange}
                            placeholder="Farm Area"
                            className="
                              min-w-0
                              flex-1
                              bg-transparent
                              px-3
                              py-2.5
                              text-xs
                              outline-none
                            "
                          />
                        </div>

                        {errors.landArea && (
                          <ErrorMessage>{errors.landArea}</ErrorMessage>
                        )}
                      </div>

                      <div
                        className="
                        flex
                        rounded-xl
                        overflow-hidden
                        border
                        border-slate-200
                        dark:border-slate-700
                      "
                      >
                        {["Acre", "Hectare"].map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() =>
                              setFormData((previous) => ({
                                ...previous,
                                landUnit: unit,
                              }))
                            }
                            className={`
                                flex-1
                                text-[9px]
                                font-black
                                transition-all

                                ${formData.landUnit === unit
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-500"
                              }
                              `}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>

                    <InputField
                      name="mainCrop"
                      value={formData.mainCrop}
                      onChange={handleChange}
                      placeholder="Primary Crop (e.g. Wheat, Rice, Maize)"
                      error={errors.mainCrop}
                    />

                    <div
                      className="
                      p-2.5
                      rounded-xl
                      bg-emerald-500/5
                      border
                      border-emerald-500/10
                    "
                    >
                      <div
                        className="
                        flex
                        items-center
                        gap-2
                      "
                      >
                        <CheckCircle2
                          className="
                          w-3.5
                          h-3.5
                          text-emerald-500
                        "
                        />

                        <p
                          className="
                          text-[9px]
                          text-slate-500
                          dark:text-slate-400
                        "
                        >
                          Your farm information helps AGRINEX show relevant
                          procurement centres and schedules.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="space-y-3"
                  >
                    {/* VERIFICATION */}

                    <div
                      className="
                      p-3
                      rounded-2xl
                      bg-emerald-500/5
                      dark:bg-emerald-500/10
                      border
                      border-emerald-500/20
                      text-center
                    "
                    >
                      <div
                        className="
                        mx-auto
                        w-10
                        h-10
                        rounded-xl
                        bg-emerald-500/10
                        flex
                        items-center
                        justify-center
                      "
                      >
                        <KeyRound
                          className="
                          w-5
                          h-5
                          text-emerald-500
                        "
                        />
                      </div>

                      <h3
                        className="
                        mt-2
                        text-xs
                        font-black
                      "
                      >
                        Verify Mobile Number
                      </h3>

                      <p
                        className="
                        mt-1
                        text-[9px]
                        text-slate-500
                        dark:text-slate-400
                      "
                      >
                        Enter the 4-digit OTP sent to{" "}
                        <span
                          className="
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                        >
                          +91 {formData.mobileNumber || "XXXXXXXXXX"}
                        </span>
                      </p>

                      <div
                        className="
                        flex
                        justify-center
                        gap-2
                        mt-3
                      "
                      >
                        {formData.otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-input-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(event) =>
                              handleOtpChange(index, event.target.value)
                            }
                            onKeyDown={(event) =>
                              handleOtpKeyDown(index, event)
                            }
                            className="
                                w-10
                                h-10
                                text-center
                                text-sm
                                font-black
                                rounded-xl
                                bg-white
                                dark:bg-slate-900
                                border
                                border-emerald-500/30
                                text-slate-900
                                dark:text-white
                                outline-none
                                focus:border-emerald-500
                                focus:ring-2
                                focus:ring-emerald-500/20
                              "
                          />
                        ))}
                      </div>

                      {errors.otp && <ErrorMessage>{errors.otp}</ErrorMessage>}
                    </div>

                    {/* LANGUAGE */}

                    <div
                      className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                    >
                      <div>
                        <label
                          className="
                          flex
                          items-center
                          gap-1.5
                          text-[9px]
                          font-bold
                          text-slate-500
                          mb-1
                        "
                        >
                          <Globe
                            className="
                            w-3
                            h-3
                            text-emerald-500
                          "
                          />
                          Preferred Language
                        </label>

                        <select
                          name="preferredLanguage"
                          value={formData.preferredLanguage}
                          onChange={handleChange}
                          className="
                            w-full
                            px-2.5
                            py-2.5
                            rounded-xl
                            bg-slate-50
                            dark:bg-slate-800/60
                            border
                            border-slate-200
                            dark:border-slate-700
                            text-[10px]
                            outline-none
                          "
                        >
                          <option>English</option>

                          <option>हिन्दी (Hindi)</option>

                          <option>ਪੰਜਾਬੀ (Punjabi)</option>

                          <option>मराठी (Marathi)</option>

                          <option>తెలుగు (Telugu)</option>

                          <option>தமிழ் (Tamil)</option>
                        </select>
                      </div>

                      {/* NOTIFICATIONS */}

                      <div>
                        <label
                          className="
                          flex
                          items-center
                          gap-1.5
                          text-[9px]
                          font-bold
                          text-slate-500
                          mb-1
                        "
                        >
                          <Bell
                            className="
                            w-3
                            h-3
                            text-emerald-500
                          "
                          />
                          Procurement Alerts
                        </label>

                        <div
                          className="
                          h-9.5
                          flex
                          items-center
                          gap-3
                          px-2.5
                          rounded-xl
                          bg-slate-50
                          dark:bg-slate-800/60
                          border
                          border-slate-200
                          dark:border-slate-700
                        "
                        >
                          <label
                            className="
                            flex
                            items-center
                            gap-1
                            text-[9px]
                            cursor-pointer
                          "
                          >
                            <input
                              type="checkbox"
                              name="notif_sms"
                              checked={formData.notifications.sms}
                              onChange={handleChange}
                              className="
                                rounded
                                text-emerald-600
                              "
                            />
                            SMS
                          </label>

                          <label
                            className="
                            flex
                            items-center
                            gap-1
                            text-[9px]
                            cursor-pointer
                          "
                          >
                            <input
                              type="checkbox"
                              name="notif_whatsapp"
                              checked={formData.notifications.whatsapp}
                              onChange={handleChange}
                              className="
                                rounded
                                text-emerald-600
                              "
                            />
                            WhatsApp
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* TERMS */}

                    <div
                      className="
                      space-y-2
                      text-[9px]
                      text-slate-500
                      dark:text-slate-400
                    "
                    >
                      <label
                        className="
                        flex
                        items-start
                        gap-2
                        cursor-pointer
                      "
                      >
                        <input
                          type="checkbox"
                          name="termsAccepted"
                          checked={formData.termsAccepted}
                          onChange={handleChange}
                          className="
                            mt-0.5
                            rounded
                            text-emerald-600
                          "
                        />

                        <span>
                          I agree to the AGRINEX{" "}
                          <span
                            className="
                            text-emerald-500
                            font-bold
                          "
                          >
                            Terms & Conditions
                          </span>
                        </span>
                      </label>

                      <label
                        className="
                        flex
                        items-start
                        gap-2
                        cursor-pointer
                      "
                      >
                        <input
                          type="checkbox"
                          name="privacyAccepted"
                          checked={formData.privacyAccepted}
                          onChange={handleChange}
                          className="
                            mt-0.5
                            rounded
                            text-emerald-600
                          "
                        />

                        <span>
                          I agree to the AGRINEX{" "}
                          <span
                            className="
                            text-emerald-500
                            font-bold
                          "
                          >
                            Agricultural Data Privacy Policy
                          </span>
                        </span>
                      </label>

                      {(errors.terms || errors.privacy) && (
                        <ErrorMessage>
                          {errors.terms || errors.privacy}
                        </ErrorMessage>
                      )}
                    </div>
                  </motion.div>
                )}

                <div
                  className="
                  mt-4
                  flex
                  items-center
                  gap-2
                "
                >
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="
                        px-3
                        py-2.5
                        rounded-xl
                        bg-slate-100
                        dark:bg-slate-800
                        text-xs
                        font-black
                        flex
                        items-center
                        gap-1.5
                        hover:bg-slate-200
                        dark:hover:bg-slate-700
                        transition-all
                      "
                    >
                      <ArrowLeft
                        className="
                        w-3.5
                        h-3.5
                      "
                      />
                      Back
                    </button>
                  )}

                  {currentStep < 3 ? (
                    <motion.button
                      whileTap={{
                        scale: 0.98,
                      }}
                      type="button"
                      onClick={handleNext}
                      className="
                        flex-1
                        py-2.5
                        rounded-xl
                        bg-linear-to-r
                        from-emerald-600
                        via-teal-600
                        to-lime-600
                        text-white
                        text-xs
                        font-black
                        shadow-lg
                        shadow-emerald-600/20
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition-all
                      "
                    >
                      Continue
                      <ArrowRight
                        className="
                        w-3.5
                        h-3.5
                      "
                      />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{
                        scale: 0.98,
                      }}
                      type="submit"
                      disabled={isLoading}
                      className="
                        flex-1
                        py-2.5
                        rounded-xl
                        bg-linear-to-r
                        from-emerald-600
                        via-teal-600
                        to-lime-600
                        text-white
                        text-xs
                        font-black
                        shadow-lg
                        shadow-emerald-600/20
                        flex
                        items-center
                        justify-center
                        gap-2
                        disabled:opacity-60
                        transition-all
                      "
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw
                            className="
                            w-3.5
                            h-3.5
                            animate-spin
                          "
                          />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Check
                            className="
                            w-3.5
                            h-3.5
                          "
                          />
                          Create AGRINEX Account
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </form>

              <div
                className="
                mt-3
                pt-3
                border-t
                border-slate-200
                dark:border-slate-800
                flex
                items-center
                justify-center
                gap-4
                text-[8px]
                font-bold
                text-slate-400
              "
              >
                <span
                  className="
                  flex
                  items-center
                  gap-1
                "
                >
                  <ShieldCheck
                    className="
                    w-3
                    h-3
                    text-emerald-500
                  "
                  />
                  Secure Registration
                </span>

                <span
                  className="
                  flex
                  items-center
                  gap-1
                "
                >
                  <CheckCircle2
                    className="
                    w-3
                    h-3
                    text-emerald-500
                  "
                  />
                  Mobile Verified
                </span>
              </div>
            </div>
          </motion.div>

          {/* SYSTEM STATUS */}

          <div
            className="
            mt-3
            flex
            items-center
            justify-center
            gap-3
            text-[8px]
            text-slate-400
          "
          >
            <span
              className="
              flex
              items-center
              gap-1.5
            "
            >
              <span
                className="
                w-1.5
                h-1.5
                rounded-full
                bg-emerald-500
                animate-pulse
              "
              />
              AGRINEX Portal Operational
            </span>

            <span>Smart Procurement • Less Waiting</span>
          </div>
        </div>
      </main>

      <footer
        className="
        absolute
        bottom-0
        left-0
        right-0
        z-20
        h-9
        flex
        items-center
        justify-center
        px-4
        text-center
      "
      >
        <div
          className="
          flex
          items-center
          justify-center
          gap-2
          sm:gap-4
          text-[8px]
          text-slate-400
        "
        >
          <span>© 2026 AGRINEX</span>

          <span className="hidden sm:block">•</span>

          <span>SIH 2026 Prototype</span>

          <span className="hidden sm:block">•</span>

          <span>Digital Procurement Network</span>
        </div>
      </footer>
    </div>
  );
}

function FormField({
  icon: Icon,
  name,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  prefix = null,
}) {
  return (
    <div>
      <div className="relative">
        <Icon
          className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          w-3.5
          h-3.5
          text-slate-400
        "
        />

        {prefix && (
          <span
            className="
            absolute
            left-9
            top-1/2
            -translate-y-1/2
            text-[10px]
            font-bold
            text-slate-500
          "
          >
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full
            ${prefix ? "pl-15" : "pl-9"}
            pr-3
            py-2.5
            rounded-xl
            bg-slate-50
            dark:bg-slate-800/60
            border
            text-xs
            text-slate-900
            dark:text-white
            placeholder:text-slate-400
            outline-none
            focus:ring-2
            focus:ring-emerald-500/20
            focus:border-emerald-500
            transition-all

            ${error
              ? "border-rose-500"
              : "border-slate-200 dark:border-slate-700"
            }
          `}
        />
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

function InputField({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}) {
  return (
    <div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full
          px-3
          py-2.5
          rounded-xl
          bg-slate-50
          dark:bg-slate-800/60
          border
          text-xs
          text-slate-900
          dark:text-white
          placeholder:text-slate-400
          outline-none
          focus:ring-2
          focus:ring-emerald-500/20
          focus:border-emerald-500
          transition-all

          ${error ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
          }
        `}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

function PasswordField({
  name,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  error,
}) {
  return (
    <div>
      <div className="relative">
        <Lock
          className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          w-3.5
          h-3.5
          text-slate-400
        "
        />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full
            pl-9
            pr-9
            py-2.5
            rounded-xl
            bg-slate-50
            dark:bg-slate-800/60
            border
            text-xs
            text-slate-900
            dark:text-white
            placeholder:text-slate-400
            outline-none
            focus:ring-2
            focus:ring-emerald-500/20
            focus:border-emerald-500

            ${error
              ? "border-rose-500"
              : "border-slate-200 dark:border-slate-700"
            }
          `}
        />

        <button
          type="button"
          onClick={onToggle}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-slate-400
            hover:text-emerald-500
          "
        >
          {show ? (
            <EyeOff
              className="
              w-3.5
              h-3.5
            "
            />
          ) : (
            <Eye
              className="
              w-3.5
              h-3.5
            "
            />
          )}
        </button>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div
      className="
      flex
      items-center
      gap-1.5
      text-[9px]
      uppercase
      tracking-wider
      font-black
      text-slate-400
    "
    >
      <Icon
        className="
        w-3
        h-3
        text-emerald-500
      "
      />

      {title}
    </div>
  );
}

function ErrorMessage({ children }) {
  return (
    <p
      className="
      mt-0.5
      flex
      items-center
      gap-1
      text-[8px]
      font-medium
      text-rose-500
    "
    >
      <AlertCircle
        className="
        w-2.5
        h-2.5
      "
      />

      {children}
    </p>
  );
}

export default function SignupPage() {
  return <SignupContent />;
}
