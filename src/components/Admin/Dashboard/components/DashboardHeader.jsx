"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, LayoutDashboard, ArrowLeft, Grid, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import DashboardDateFilter from "./DashboardDateFilter";

export default function DashboardHeader({
  activePreset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomDateChange,
  onRefresh,
  isFetching,
}) {
  const router = useRouter();

  // Rate limiter state: Array of click timestamps within 2 minutes (120,000ms)
  const [refreshTimestamps, setRefreshTimestamps] = useState([]);
  const [cooldownMsg, setCooldownMsg] = useState("");

  const handleRefreshClick = () => {
    const now = Date.now();
    const twoMinutesAgo = now - 2 * 60 * 1000; // 120,000 ms

    // Filter to retain clicks within the rolling 2-minute window
    const recentClicks = refreshTimestamps.filter((ts) => ts > twoMinutesAgo);

    if (recentClicks.length >= 3) {
      // Find time left until the earliest click in the window expires
      const oldestClick = recentClicks[0];
      const timeRemainingMs = oldestClick + 2 * 60 * 1000 - now;
      const secondsRemaining = Math.max(1, Math.ceil(timeRemainingMs / 1000));

      const msg = `Rate limit: max 3 refreshes per 2 mins. Try again in ${secondsRemaining}s.`;
      toast.warning(msg);
      setCooldownMsg(`Wait ${secondsRemaining}s`);

      setTimeout(() => setCooldownMsg(""), 3000);
      return;
    }

    // Record timestamp & execute refresh
    setRefreshTimestamps([...recentClicks, now]);
    if (onRefresh) onRefresh();
  };

  // Remaining refresh count in current 2-minute window
  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
  const recentClickCount = refreshTimestamps.filter((ts) => ts > twoMinutesAgo).length;
  const remainingRefreshes = Math.max(0, 3 - recentClickCount);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Navbar / Portal Navigation Bar */}
      <div className="flex items-center justify-between bg-white border border-[#E2E8F0] px-4 py-2.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <button
            onClick={() => router.push("/select-portal")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] hover:text-[#10B981] rounded-lg transition-all font-bold cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Select Portal</span>
          </button>
          <span className="text-[#94A3B8]">/</span>
          <span className="text-[#0F172A] font-bold">Admin Operations Dashboard</span>
        </div>

        <button
          onClick={() => router.push("/select-portal")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#10B981] transition-colors cursor-pointer"
        >
          <Grid size={14} />
          <span className="hidden sm:inline">All Portals</span>
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-md shrink-0">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Dashboard Overview</h1>
            <p className="text-xs font-medium text-[#64748B] mt-0.5">
              Platform analytics, operational workload & fundraising statistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {cooldownMsg && (
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-lg flex items-center gap-1 animate-pulse">
              <AlertCircle size={12} />
              <span>{cooldownMsg}</span>
            </span>
          )}

          <div className="relative">
            <button
              onClick={handleRefreshClick}
              disabled={isFetching || remainingRefreshes === 0}
              className="px-3 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-xl text-[#64748B] hover:text-[#0F172A] transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer text-xs font-bold"
              title={`Refresh Dashboard (${remainingRefreshes}/3 refreshes remaining)`}
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin text-[#10B981]" : ""} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                {remainingRefreshes}/3
              </span>
            </button>
          </div>

          <DashboardDateFilter
            activePreset={activePreset}
            onPresetChange={onPresetChange}
            customStart={customStart}
            customEnd={customEnd}
            onCustomDateChange={onCustomDateChange}
          />
        </div>
      </div>
    </div>
  );
}
