"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Calendar,
  Clock,
  Users,
  Building2,
  Bell,
  Scale,
  IndianRupee,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Smartphone,
  Database,
  Cloud,
  BarChart3,
  FileCheck2,
  MessageSquare,
  Search,
  HelpCircle,
  Cpu,
  Radio,
  LockKeyhole,
  Activity,
  Tractor,
  ClipboardCheck,
  WalletCards,
  Check
} from "lucide-react";

import { useTheme } from "next-themes";
import Link from "next/link";

/* ================================================================
   ANIMATION
================================================================ */

const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};


/* ================================================================
   NAVBAR
================================================================ */

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    {
      name: "Home",
      href: "#home",
    },
    {
      name: "Features",
      href: "#features",
    },
    {
      name: "How It Works",
      href: "#how-it-works",
    },
    {
      name: "Centres",
      href: "#centres",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/90 dark:bg-[#0a1016]/90 backdrop-blur-xl border-b border-emerald-900/10 dark:border-emerald-500/15 shadow-lg shadow-black/5 dark:shadow-black/30"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3 group"
          >

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-lime-500 p-[2px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">

              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">

                <Sprout className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />

              </div>

            </div>


            <div>

              <div className="flex items-center gap-2">

                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">

                  AGRI
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-lime-500">
                    NEX
                  </span>

                </span>


                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  PROCURE
                </span>

              </div>


              <p className="hidden sm:block text-[9px] font-medium text-slate-500 dark:text-slate-400">
                Smart Procurement • Less Waiting
              </p>

            </div>

          </Link>


          {/* DESKTOP NAV */}

          <nav className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800">

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
              >
                {link.name}
              </a>
            ))}

          </nav>


          {/* DESKTOP ACTIONS */}

          <div className="hidden sm:flex items-center gap-2">

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-emerald-500 transition-colors"
            >

              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}

            </button>


            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors"
            >
              Login
            </Link>


            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              Get Started
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

          </div>


          {/* MOBILE ACTIONS */}

          <div className="flex sm:hidden items-center gap-2">

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >

              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}

            </button>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >

              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}

            </button>

          </div>

        </div>

      </div>


      {/* MOBILE MENU */}

      <AnimatePresence>

        {mobileMenuOpen && (

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="md:hidden mt-3 px-4 pb-5 bg-white/95 dark:bg-[#0c1218]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"
          >

            <div className="flex flex-col gap-1 pt-3">

              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-500"
                >
                  {link.name}
                </a>
              ))}


              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">

                <Link
                  href="/login"
                  className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs font-black"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 text-white text-center text-xs font-black"
                >
                  Get Started
                </Link>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </header>
  );
};


/* ================================================================
   HERO
================================================================ */

const Hero = () => {
  const [aheadCount, setAheadCount] = useState(12);
  const [syncing, setSyncing] = useState(false);

  const syncQueue = () => {
    setSyncing(true);

    setTimeout(() => {
      setAheadCount((value) =>
        value > 1 ? value - 1 : 12
      );

      setSyncing(false);
    }, 700);
  };

  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 sm:pt-40 overflow-hidden flex items-center"
    >

      {/* BACKGROUND */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[140px] rounded-full" />

        <div className="absolute top-1/3 left-0 w-80 h-80 bg-lime-500/10 blur-[120px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 blur-[130px] rounded-full" />

      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        <div className="grid lg:grid-cols-12 gap-14 items-center">


          {/* HERO CONTENT */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 text-center lg:text-left"
          >

            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-wide"
            >

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />

              </span>

              Digital Agricultural Procurement Platform

            </motion.div>


            <motion.h1
              variants={fadeInUp}
              className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-slate-900 dark:text-white"
            >

              BOOK YOUR

              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 dark:from-emerald-400 dark:via-teal-300 dark:to-lime-400">
                PROCUREMENT SLOT.
              </span>

            </motion.h1>


            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
            >

              AGRINEX connects farmers with procurement centres through
              digital slot booking, live queue tracking, transparent
              procurement status and payment updates.

            </motion.p>


            {/* CTA */}

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >

              <Link
                href="/signup"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white text-sm font-black shadow-xl shadow-emerald-600/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >

                Book Procurement Slot

                <ArrowRight className="w-4 h-4" />

              </Link>


              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-black hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >

                <Activity className="w-4 h-4 text-emerald-500" />

                See How It Works

              </a>

            </motion.div>


            {/* TRUST STRIP */}

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400"
            >

              <span className="flex items-center gap-1.5">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />

                Digital Token

              </span>

              <span className="flex items-center gap-1.5">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />

                Live Queue

              </span>

              <span className="flex items-center gap-1.5">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />

                Transparent Status

              </span>

            </motion.div>

          </motion.div>


          {/* LIVE DASHBOARD */}

          <div className="lg:col-span-5">

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.7,
              }}
              className="relative"
            >

              {/* Floating status */}

              <div className="absolute -top-5 -right-3 sm:-right-6 z-10">

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 shadow-xl">

                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    SYSTEM LIVE
                  </span>

                </div>

              </div>


              <div className="rounded-[28px] p-[1px] bg-gradient-to-br from-emerald-500/50 via-teal-500/20 to-lime-500/50 shadow-2xl shadow-emerald-950/10">

                <div className="rounded-[27px] bg-white dark:bg-[#0c131a] p-5 sm:p-6">

                  {/* Header */}

                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">

                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                        <Radio className="w-4 h-4 text-emerald-500" />

                      </div>

                      <div>

                        <p className="text-xs font-black">
                          LIVE QUEUE
                        </p>

                        <p className="text-[9px] text-slate-400">
                          XYZ Procurement Centre
                        </p>

                      </div>

                    </div>


                    <button
                      onClick={syncQueue}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 hover:text-emerald-500 transition-colors"
                    >

                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          syncing ? "animate-spin text-emerald-500" : ""
                        }`}
                      />

                      SYNC

                    </button>

                  </div>


                  {/* TOKEN */}

                  <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-lime-500/5 border border-emerald-500/20 p-5 text-center">

                    <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                      Active Digital Token
                    </p>

                    <p className="mt-1 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500">
                      #47
                    </p>

                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Paddy • 20 Quintals
                    </p>

                  </div>


                  {/* QUEUE DATA */}

                  <div className="grid grid-cols-2 gap-3 mt-3">

                    <DashboardMetric
                      icon={Users}
                      label="Farmers Ahead"
                      value={aheadCount}
                    />

                    <DashboardMetric
                      icon={Clock}
                      label="Estimated Wait"
                      value="~45 min"
                      amber
                    />

                  </div>


                  {/* STATUS */}

                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">

                    <div className="flex items-center justify-between">

                      <span className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                        Procurement Progress
                      </span>

                      <span className="text-[9px] font-black text-emerald-500">
                        2 / 5
                      </span>

                    </div>


                    <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">

                      <div className="w-2/5 h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500" />

                    </div>


                    <div className="mt-3 flex items-center gap-2">

                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                      <div>

                        <p className="text-[10px] font-black">
                          Verification Completed
                        </p>

                        <p className="text-[9px] text-slate-400">
                          Proceed to weighing bay
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400">

                    <span className="flex items-center gap-1">

                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />

                      Token Verified

                    </span>

                    <span className="font-mono text-emerald-500">
                      BAY-02
                    </span>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   PROBLEM
================================================================ */

const ProblemSection = () => {

  const problems = [
    {
      icon: Clock,
      title: "Long Waiting",
      desc: "Farmers spend hours waiting at procurement centres without knowing when their turn will arrive.",
    },
    {
      icon: Calendar,
      title: "Uncertain Scheduling",
      desc: "Without advance slots, transport planning becomes difficult and valuable time is lost.",
    },
    {
      icon: Users,
      title: "No Queue Visibility",
      desc: "Farmers have little visibility into the number of vehicles ahead or expected processing time.",
    },
    {
      icon: IndianRupee,
      title: "Payment Uncertainty",
      desc: "Procurement and payment status can remain unclear after produce is accepted.",
    },
  ];

  return (
    <section className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeading
          badge="The Procurement Challenge"
          icon={AlertCircle}
          title="WHY AGRINEX?"
          description="Traditional procurement creates uncertainty at every stage of the farmer journey."
        />


        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {problems.map((item, index) => {

            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 shadow-sm transition-all"
              >

                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-5">

                  <Icon className="w-5 h-5 text-rose-500" />

                </div>

                <h3 className="text-base font-black">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>

              </motion.div>
            );

          })}

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   HOW IT WORKS
================================================================ */

const HowItWorks = () => {

  const steps = [
    {
      number: "01",
      icon: UserIcon,
      title: "Farmer Registration",
      desc: "Create a verified farmer profile with required agricultural and identity information.",
    },
    {
      number: "02",
      icon: Calendar,
      title: "Slot Booking",
      desc: "Choose crop, quantity, procurement centre, vehicle and preferred time slot.",
    },
    {
      number: "03",
      icon: Users,
      title: "Digital Queue",
      desc: "Receive a digital token and track the live queue before reaching the centre.",
    },
    {
      number: "04",
      icon: ClipboardCheck,
      title: "Procurement",
      desc: "Complete gate verification, weighment and quality checks through the centre workflow.",
    },
    {
      number: "05",
      icon: WalletCards,
      title: "Payment",
      desc: "Track procurement approval and payment status from one dashboard.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 relative overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeading
          badge="End-to-End Workflow"
          icon={Activity}
          title="HOW AGRINEX WORKS"
          description="One connected workflow from booking your slot to tracking procurement and payment."
        />


        <div className="relative">

          {/* CONNECTING LINE */}

          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-emerald-500/10 via-emerald-500/50 to-lime-500/10" />


          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">

            {steps.map((step, index) => {

              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  className="relative"
                >

                  <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-lg flex items-center justify-center">

                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">

                      <Icon className="w-6 h-6 text-emerald-500" />

                    </div>

                  </div>


                  <div className="mt-5 text-center">

                    <span className="text-[9px] uppercase tracking-widest font-black text-emerald-500">
                      Step {step.number}
                    </span>

                    <h3 className="mt-1 text-sm font-black">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {step.desc}
                    </p>

                  </div>

                </motion.div>
              );

            })}

          </div>

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   CORE FEATURES
================================================================ */

const CoreFeatures = () => {

  const features = [
    {
      icon: Calendar,
      title: "Smart Slot Booking",
      desc: "Reserve an available procurement window based on centre capacity and operating schedule.",
    },
    {
      icon: Users,
      title: "Live Queue Tracking",
      desc: "Know your digital token position and estimated waiting time before arriving.",
    },
    {
      icon: Building2,
      title: "Centre Management",
      desc: "View centre availability, queue load, operating status and procurement capacity.",
    },
    {
      icon: Scale,
      title: "Procurement Tracking",
      desc: "Follow your produce through verification, weighment, quality check and acceptance.",
    },
    {
      icon: IndianRupee,
      title: "Payment Tracking",
      desc: "Monitor approved procurement value and payment status from the farmer dashboard.",
    },
    {
      icon: Bell,
      title: "Real-Time Alerts",
      desc: "Receive important booking, queue, procurement and payment notifications.",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeading
          badge="Platform Capabilities"
          icon={Sparkles}
          title="CORE FEATURES"
          description="Every feature is designed around the actual procurement journey."
        />


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.07,
                }}
                className="group p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all"
              >

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">

                  <Icon className="w-6 h-6 text-emerald-500" />

                </div>


                <h3 className="mt-5 text-base sm:text-lg font-black">
                  {feature.title}
                </h3>


                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {feature.desc}
                </p>


                <div className="mt-5 flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-wide">

                  Explore Feature

                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />

                </div>

              </motion.div>
            );

          })}

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   TECHNOLOGY / ARCHITECTURE
================================================================ */

const TechnologySection = () => {

  const technologies = [
    {
      icon: Smartphone,
      title: "Farmer Interface",
      desc: "Responsive web interface for slot booking, queue tracking, procurement and payments.",
      tag: "Next.js",
    },
    {
      icon: Database,
      title: "Procurement Data",
      desc: "Structured storage for farmer profiles, bookings, tokens, procurement records and payments.",
      tag: "Database",
    },
    {
      icon: Cloud,
      title: "API Layer",
      desc: "Secure backend APIs connect farmer actions with procurement centre operations.",
      tag: "REST API",
    },
    {
      icon: Activity,
      title: "Real-Time Queue",
      desc: "Queue and centre status can be updated dynamically as procurement operations progress.",
      tag: "Real-Time",
    },
    {
      icon: ShieldCheck,
      title: "Verification",
      desc: "Role-based access and verified farmer information support controlled procurement workflows.",
      tag: "RBAC",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "Centre-level data can be transformed into queue, procurement and operational insights.",
      tag: "Analytics",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />

      </div>


      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeading
          badge="Technology Layer"
          icon={Cpu}
          title="BUILT FOR DIGITAL PROCUREMENT"
          description="The prototype combines a modern web interface, structured procurement data and real-time operational workflows."
        />


        {/* Architecture Flow */}

        <div className="max-w-5xl mx-auto mb-12">

          <div className="rounded-3xl bg-slate-950 dark:bg-[#060a0f] border border-emerald-500/20 p-5 sm:p-8 shadow-2xl">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

              <ArchitectureBlock
                icon={Smartphone}
                title="Farmer App"
                subtitle="Book • Track • Receive"
              />

              <div className="hidden md:flex items-center justify-center">

                <ArrowRight className="w-6 h-6 text-emerald-500" />

              </div>

              <ArchitectureBlock
                icon={Cloud}
                title="API / Services"
                subtitle="Validate • Process • Sync"
              />

              <div className="hidden md:flex items-center justify-center">

                <ArrowRight className="w-6 h-6 text-emerald-500" />

              </div>

              <ArchitectureBlock
                icon={Database}
                title="Procurement Data"
                subtitle="Farmers • Slots • Tokens"
              />

            </div>

          </div>

        </div>


        {/* Technology cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {technologies.map((tech) => {

            const Icon = tech.icon;

            return (
              <div
                key={tech.title}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center">

                    <Icon className="w-5 h-5 text-emerald-500" />

                  </div>

                  <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 dark:text-slate-400">
                    {tech.tag}
                  </span>

                </div>


                <h3 className="mt-5 text-sm font-black">
                  {tech.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {tech.desc}
                </p>

              </div>
            );

          })}

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   QUEUE
================================================================ */

const QueueSection = () => {

  return (
    <section className="py-24 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">

              <Radio className="w-3.5 h-3.5" />

              Real-Time Queue Intelligence

            </div>


            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">

              KNOW YOUR QUEUE

              <br />

              <span className="text-emerald-500">
                BEFORE YOU ARRIVE.
              </span>

            </h2>


            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-lg">

              AGRINEX turns the traditional waiting line into a digital
              queue. Farmers can check their token, current position and
              estimated waiting time from their phone.

            </p>


            <div className="mt-7 space-y-3">

              <FeatureCheck text="Digital token generated after booking" />

              <FeatureCheck text="Live number of farmers ahead" />

              <FeatureCheck text="Estimated waiting time" />

              <FeatureCheck text="Centre and bay status" />

            </div>

          </div>


          {/* PHONE MOCKUP */}

          <div className="flex justify-center">

            <div className="w-full max-w-sm rounded-[32px] bg-slate-950 p-3 shadow-2xl">

              <div className="rounded-[26px] bg-white dark:bg-[#0c131a] overflow-hidden">

                <div className="p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[9px] text-slate-400">
                        AGRINEX
                      </p>

                      <p className="text-sm font-black">
                        My Queue
                      </p>

                    </div>

                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                      <Users className="w-4 h-4 text-emerald-500" />

                    </div>

                  </div>


                  <div className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center">

                    <p className="text-[9px] uppercase tracking-widest font-black text-white/60">
                      Your Token
                    </p>

                    <p className="mt-1 text-5xl font-black">
                      #47
                    </p>

                    <p className="text-[10px] text-white/70">
                      XYZ Procurement Centre
                    </p>

                  </div>


                  <div className="grid grid-cols-2 gap-3 mt-3">

                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">

                      <p className="text-[9px] text-slate-400">
                        AHEAD
                      </p>

                      <p className="mt-1 text-xl font-black">
                        12
                      </p>

                    </div>


                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">

                      <p className="text-[9px] text-slate-400">
                        WAIT
                      </p>

                      <p className="mt-1 text-xl font-black text-amber-500">
                        45m
                      </p>

                    </div>

                  </div>


                  <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 flex items-center gap-2">

                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      You're in the active queue
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   CENTRES
================================================================ */

const CentresSection = () => {

  const centres = [
    {
      name: "XYZ Mandi",
      location: "Kamrup",
      queue: "42",
      wait: "48 min",
      capacity: "72%",
      status: "Moderate",
    },
    {
      name: "ABC Procurement Centre",
      location: "Guwahati",
      queue: "18",
      wait: "20 min",
      capacity: "45%",
      status: "Fast",
    },
    {
      name: "DEF Mandi",
      location: "Nalbari",
      queue: "76",
      wait: "90 min",
      capacity: "88%",
      status: "Busy",
    },
  ];

  return (
    <section
      id="centres"
      className="py-24"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeading
          badge="Procurement Network"
          icon={Building2}
          title="FIND A PROCUREMENT CENTRE"
          description="Compare centre status and queue conditions before planning your visit."
        />


        <div className="grid md:grid-cols-3 gap-5">

          {centres.map((centre) => (

            <div
              key={centre.name}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/30 transition-all"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <div className="flex items-center gap-1.5">

                    <MapPin className="w-4 h-4 text-emerald-500" />

                    <h3 className="text-base font-black">
                      {centre.name}
                    </h3>

                  </div>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {centre.location}
                  </p>

                </div>


                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black">
                  {centre.status}
                </span>

              </div>


              <div className="mt-5 space-y-2">

                <CentreMetric
                  label="Vehicles in Queue"
                  value={centre.queue}
                />

                <CentreMetric
                  label="Estimated Wait"
                  value={centre.wait}
                  amber
                />

                <CentreMetric
                  label="Centre Capacity"
                  value={centre.capacity}
                />

              </div>


              <Link
                href="/signup"
                className="mt-5 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-500 text-xs font-black flex items-center justify-center gap-1 transition-colors"
              >

                View Centre & Book

                <ChevronRight className="w-3.5 h-3.5" />

              </Link>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   PROCUREMENT TRACKING
================================================================ */

const ProcurementTracking = () => {

  const stages = [
    {
      title: "Booking",
      status: "Completed",
    },
    {
      title: "Verification",
      status: "Completed",
    },
    {
      title: "Weighing",
      status: "In Progress",
    },
    {
      title: "Quality Check",
      status: "Pending",
    },
    {
      title: "Procurement",
      status: "Pending",
    },
    {
      title: "Payment",
      status: "Pending",
    },
  ];

  return (
    <section
      id="track"
      className="py-24 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
    >

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeading
          badge="Procurement Transparency"
          icon={Scale}
          title="TRACK EVERY STAGE"
          description="Know exactly where your produce stands from arrival to payment."
        />


        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xl">

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

            {stages.map((stage, index) => {

              const completed = stage.status === "Completed";
              const active = stage.status === "In Progress";

              return (
                <div
                  key={stage.title}
                  className={`p-4 rounded-2xl border text-center ${
                    completed
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : active
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                  }`}
                >

                  <div
                    className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center ${
                      completed
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}
                  >

                    {completed ? (
                      <Check className="w-4 h-4" />
                    ) : active ? (
                      <Activity className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">○</span>
                    )}

                  </div>


                  <p className="mt-3 text-[10px] font-black">
                    {stage.title}
                  </p>


                  <p
                    className={`mt-1 text-[9px] ${
                      completed
                        ? "text-emerald-500"
                        : active
                          ? "text-amber-500"
                          : "text-slate-400"
                    }`}
                  >
                    {stage.status}
                  </p>

                </div>
              );
            })}

          </div>


          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3 text-[10px] text-slate-400">

            <span className="font-mono">
              Lot ID: LOT-AGR-9281
            </span>

            <span className="flex items-center gap-1 text-emerald-500 font-bold">

              <CheckCircle2 className="w-3.5 h-3.5" />

              Verification completed

            </span>

          </div>

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   ALERTS
================================================================ */

const AlertsSection = () => {

  return (
    <section className="py-24">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 p-7 sm:p-10 text-white shadow-2xl">

          <div className="grid md:grid-cols-2 gap-8 items-center">

            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-wider">

                <Bell className="w-3.5 h-3.5" />

                Smart Notifications

              </div>


              <h2 className="mt-4 text-3xl sm:text-4xl font-black">
                NEVER MISS YOUR TURN.
              </h2>


              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                AGRINEX can keep farmers informed about booking confirmations,
                queue movement, gate entry, procurement updates and payment
                status.
              </p>

            </div>


            <div className="space-y-3">

              <NotificationCard
                icon={Calendar}
                title="Slot Confirmed"
                text="Your procurement slot is confirmed for 10:30 AM."
              />

              <NotificationCard
                icon={Users}
                title="Queue Alert"
                text="Only 3 farmers are ahead of your token."
              />

              <NotificationCard
                icon={IndianRupee}
                title="Payment Update"
                text="Your procurement payment has been processed."
              />

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   FAQ
================================================================ */

const FAQ = () => {

  const [open, setOpen] = useState(0);

  const questions = [
    {
      q: "How do I book a procurement slot?",
      a: "Create or access your farmer account, select the crop and estimated quantity, choose a procurement centre and select an available date and time slot.",
    },
    {
      q: "Can I see the live queue?",
      a: "Yes. AGRINEX provides a digital token and queue information so farmers can see their approximate position and estimated waiting time.",
    },
    {
      q: "What can I track after procurement?",
      a: "You can track verification, weighing, quality checking, procurement approval and payment status from the dashboard.",
    },
    {
      q: "Can procurement centres manage their queues?",
      a: "Yes. The platform is designed to support centre-side slot capacity, queue and procurement workflow management.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-24 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
    >

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeading
          badge="Help Centre"
          icon={HelpCircle}
          title="FREQUENTLY ASKED QUESTIONS"
          description="Quick answers about the AGRINEX procurement workflow."
        />


        <div className="space-y-3">

          {questions.map((item, index) => {

            const active = open === index;

            return (
              <div
                key={item.q}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
              >

                <button
                  onClick={() => setOpen(active ? -1 : index)}
                  className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left"
                >

                  <span className="text-xs sm:text-sm font-black">
                    {item.q}
                  </span>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 text-emerald-500 transition-transform ${
                      active ? "rotate-90" : ""
                    }`}
                  />

                </button>


                <AnimatePresence>

                  {active && (

                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      className="px-5 sm:px-6 pb-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                    >

                      {item.a}

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>
            );

          })}

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   FINAL CTA
================================================================ */

const FinalCTA = () => {

  return (
    <section
      id="book"
      className="py-24"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-950 p-8 sm:p-14 text-center text-white shadow-2xl">

          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-emerald-400/20 blur-[100px]" />


          <div className="relative max-w-3xl mx-auto">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-wider">

              <Sprout className="w-3.5 h-3.5" />

              Smarter Procurement Starts Here

            </div>


            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              YOUR PROCUREMENT.
              <br />
              YOUR TIME.
            </h2>


            <p className="mt-4 text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
              Book your procurement slot, track your queue and stay informed
              throughout the procurement process with AGRINEX.
            </p>


            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">

              <Link
                href="/signup"
                className="px-7 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-black hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >

                Create Farmer Account

                <ArrowRight className="w-4 h-4" />

              </Link>


              <Link
                href="/login"
                className="px-7 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-black hover:bg-white/15 transition-colors"
              >

                Login

              </Link>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};


/* ================================================================
   FOOTER
================================================================ */

const Footer = () => {

  const columns = [
    {
      title: "Platform",
      links: [
        ["Home", "#home"],
        ["Features", "#features"],
        ["How It Works", "#how-it-works"],
        ["Centres", "#centres"],
        ["Track Procurement", "#track"],
      ],
    },
    {
      title: "Farmers",
      links: [
        ["Book Slot", "/signup"],
        ["Live Queue", "#track"],
        ["Procurement", "#track"],
        ["Payment Status", "#track"],
        ["Notifications", "#notifications"],
      ],
    },
    {
      title: "Centre Operations",
      links: [
        ["Queue Management", "#features"],
        ["Slot Management", "#features"],
        ["Procurement Workflow", "#track"],
        ["Centre Status", "#centres"],
        ["Analytics", "#technology"],
      ],
    },
    {
      title: "Support",
      links: [
        ["FAQs", "#faq"],
        ["Help Centre", "#faq"],
        ["Contact Support", "mailto:support@agrinex.in"],
        ["Privacy Policy", "#privacy"],
        ["Terms & Conditions", "#terms"],
      ],
    },
  ];

  return (
    <footer
      id="footer"
      className="bg-white dark:bg-[#080d12] border-t border-slate-200 dark:border-slate-800"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN */}

        <div className="py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

          {/* BRAND */}

          <div className="col-span-2 md:col-span-3 lg:col-span-1">

            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
            >

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 p-[2px]">

                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">

                  <Sprout className="w-5 h-5 text-emerald-400" />

                </div>

              </div>


              <span className="text-xl font-black">
                AGRI
                <span className="text-emerald-500">
                  NEX
                </span>
              </span>

            </Link>


            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">

              Digital procurement management for farmers and procurement
              centres — designed to reduce waiting and improve transparency.

            </p>


            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">

              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

              <span className="text-[9px] font-black text-emerald-500">
                PROCUREMENT NETWORK ACTIVE
              </span>

            </div>

          </div>


          {/* COLUMNS */}

          {columns.map((column) => (

            <div key={column.title}>

              <h3 className="text-xs font-black uppercase tracking-wider">
                {column.title}
              </h3>


              <ul className="mt-5 space-y-3">

                {column.links.map(([name, href]) => (

                  <li key={name}>

                    <a
                      href={href}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      {name}
                    </a>

                  </li>

                ))}

              </ul>

            </div>

          ))}

        </div>


        {/* TRUST BAR */}

        <div className="py-5 border-y border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] text-slate-500 dark:text-slate-400">

            <span className="flex items-center gap-1.5">

              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />

              Secure Access

            </span>

            <span className="flex items-center gap-1.5">

              <Database className="w-3.5 h-3.5 text-emerald-500" />

              Structured Data

            </span>

            <span className="flex items-center gap-1.5">

              <Activity className="w-3.5 h-3.5 text-emerald-500" />

              Real-Time Workflow

            </span>

          </div>


          <div className="text-[10px] text-slate-400">
            Smart Procurement • Less Waiting
          </div>

        </div>


        {/* BOTTOM */}

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-[10px] text-slate-500 text-center sm:text-left">
            © 2026 AGRINEX • SIH 2026 Prototype
          </p>


          <div className="flex items-center gap-4 text-[10px] text-slate-500">

            <a
              href="#privacy"
              className="hover:text-emerald-500"
            >
              Privacy
            </a>

            <span>•</span>

            <a
              href="#terms"
              className="hover:text-emerald-500"
            >
              Terms
            </a>

            <span>•</span>

            <a
              href="#faq"
              className="hover:text-emerald-500"
            >
              Help
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
};


/* ================================================================
   SMALL COMPONENTS
================================================================ */

function SectionHeading({
  badge,
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-14">

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">

        <Icon className="w-3.5 h-3.5" />

        {badge}

      </div>


      <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
        {title}
      </h2>


      <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

    </div>
  );
}


function DashboardMetric({
  icon: Icon,
  label,
  value,
  amber = false,
}) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">

      <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider font-black text-slate-400">

        <Icon
          className={`w-3.5 h-3.5 ${
            amber
              ? "text-amber-500"
              : "text-emerald-500"
          }`}
        />

        {label}

      </div>


      <p
        className={`mt-1 text-xl font-black ${
          amber
            ? "text-amber-500"
            : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}


function FeatureCheck({ text }) {
  return (
    <div className="flex items-center gap-2.5">

      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">

        <Check className="w-3 h-3 text-emerald-500" />

      </div>

      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
        {text}
      </span>

    </div>
  );
}


function ArchitectureBlock({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">

          <Icon className="w-5 h-5 text-emerald-400" />

        </div>


        <div>

          <p className="text-xs font-black text-white">
            {title}
          </p>

          <p className="text-[9px] text-slate-500 mt-1">
            {subtitle}
          </p>

        </div>

      </div>

    </div>
  );
}


function CentreMetric({
  label,
  value,
  amber = false,
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">

      <span className="text-[9px] text-slate-400">
        {label}
      </span>

      <span
        className={`text-xs font-black ${
          amber
            ? "text-amber-500"
            : ""
        }`}
      >
        {value}
      </span>

    </div>
  );
}


function NotificationCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm flex items-start gap-3">

      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">

        <Icon className="w-4 h-4" />

      </div>


      <div>

        <p className="text-xs font-black">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-relaxed text-white/60">
          {text}
        </p>

      </div>

    </div>
  );
}


function UserIcon(props) {
  return <Tractor {...props} />;
}


/* ================================================================
   APP
================================================================ */

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090e14] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

      <Navbar />

      <main>

        <Hero />

        <ProblemSection />

        <HowItWorks />

        <CoreFeatures />

        <TechnologySection />

        <QueueSection />

        <CentresSection />

        <ProcurementTracking />

        <AlertsSection />

        <FAQ />

        <FinalCTA />

      </main>

      <Footer />

    </div>
  );
}