"use client";

import { useState } from "react";

import Navbar from "@/components/farmer/Navbar";
import Sidebar from "@/components/farmer/Sidebar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#070d0a] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="pt-16 lg:ml-56 flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-[1600px] p-3 sm:p-4 flex items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}