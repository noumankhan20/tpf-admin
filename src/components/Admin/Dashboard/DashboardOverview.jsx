"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useGetDashboardAnalyticsQuery } from "@/utils/slices/adminDashboardApiSlice";
import { DATE_PRESETS, getDashboardDateRange } from "@/utils/dashboardUtils";

import DashboardHeader from "./components/DashboardHeader";
import DashboardSectionTracker from "./components/DashboardSectionTracker";
import AttentionRequired from "./components/AttentionRequired";
import PlatformOverview from "./components/PlatformOverview";
import DonationPerformance from "./components/DonationPerformance";
import CampaignOverview from "./components/CampaignOverview";
import PeopleOverview from "./components/PeopleOverview";
import ReferralPerformance from "./components/ReferralPerformance";
import OperationalStatus from "./components/OperationalStatus";
import RecentActivity from "./components/RecentActivity";
import ActivityHeatmap from "./components/ActivityHeatmap";

const DashboardSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-6 max-w-[1600px] mx-auto w-full p-6">
    <div className="h-20 bg-slate-200/70 rounded-2xl w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-28 bg-slate-200/70 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-200/70 rounded-2xl" />
      ))}
    </div>
    <div className="h-96 bg-slate-200/70 rounded-2xl w-full" />
  </div>
);

export default function DashboardOverview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial preset / custom dates from URL query params if present
  const initialPreset = searchParams.get("preset") || DATE_PRESETS.TODAY;
  const initialStart = searchParams.get("start") || "";
  const initialEnd = searchParams.get("end") || "";

  const [activePreset, setActivePreset] = useState(initialPreset);
  const [customStart, setCustomStart] = useState(initialStart);
  const [customEnd, setCustomEnd] = useState(initialEnd);

  // Compute normalized ISO dates for API query
  const { startDate, endDate } = useMemo(() => {
    return getDashboardDateRange(activePreset, customStart, customEnd);
  }, [activePreset, customStart, customEnd]);

  // Sync filter state to URL query parameters safely without infinite loop
  useEffect(() => {
    const currentPreset = searchParams.get("preset") || "";
    const currentStart = searchParams.get("start") || "";
    const currentEnd = searchParams.get("end") || "";

    const targetStart = activePreset === DATE_PRESETS.CUSTOM ? customStart : "";
    const targetEnd = activePreset === DATE_PRESETS.CUSTOM ? customEnd : "";

    if (
      currentPreset !== activePreset ||
      currentStart !== targetStart ||
      currentEnd !== targetEnd
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", activePreset);
      if (activePreset === DATE_PRESETS.CUSTOM && targetStart && targetEnd) {
        params.set("start", targetStart);
        params.set("end", targetEnd);
      } else {
        params.delete("start");
        params.delete("end");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [activePreset, customStart, customEnd, pathname, router, searchParams]);

  const [selectedCampaignId, setSelectedCampaignId] = useState("ALL");
  const [campaignSearch, setCampaignSearch] = useState("");

  // Consolidated Dashboard analytics RTK Query call
  const { data, isLoading, isFetching, isError, refetch } = useGetDashboardAnalyticsQuery({
    startDate,
    endDate,
    campaignId: selectedCampaignId,
    campaignSearch,
  });

  const handlePresetChange = (newPreset) => {
    setActivePreset(newPreset);
  };

  const handleCustomDateChange = (start, end) => {
    setCustomStart(start);
    setCustomEnd(end);
    setActivePreset(DATE_PRESETS.CUSTOM);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans">
        <DashboardSkeleton />
      </div>
    );
  }

  const payload = data || {};
  const pending = payload.pending || {};
  const overview = payload.overview || {};
  const donations = payload.donations || {};
  const campaigns = payload.campaigns || {};
  const referrals = payload.referrals || {};
  const recentActivity = payload.recentActivity || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#334155]">
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        {/* 1. DASHBOARD HEADER */}
        <DashboardHeader
          activePreset={activePreset}
          onPresetChange={handlePresetChange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomDateChange={handleCustomDateChange}
          onRefresh={refetch}
          isFetching={isFetching}
        />

        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center justify-between">
            <span>Unable to connect to live analytics. Showing cached data or retry request.</span>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* SECTION TRACKER & JUMP DOCK */}
        <DashboardSectionTracker />

        {/* 2. ATTENTION REQUIRED */}
        <div id="section-attention" className="bg-red-50/80 border-2 border-red-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <AttentionRequired pending={pending} />
        </div>

        {/* 3. PLATFORM OVERVIEW */}
        <div id="section-platform" className="bg-blue-50/80 border-2 border-blue-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <PlatformOverview overview={overview} />
        </div>

        {/* 4. DONATION PERFORMANCE */}
        <div id="section-donations" className="bg-emerald-50/80 border-2 border-emerald-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <DonationPerformance donations={donations} />
        </div>

        {/* 5. CAMPAIGN OVERVIEW */}
        <div id="section-campaigns" className="bg-purple-50/80 border-2 border-purple-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <CampaignOverview campaigns={campaigns} overview={overview} />
        </div>

        {/* 6. PEOPLE OVERVIEW */}
        <div id="section-people" className="bg-amber-50/80 border-2 border-amber-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <PeopleOverview overview={overview} />
        </div>

        {/* 7. REFERRAL PERFORMANCE */}
        <div id="section-referrals" className="bg-pink-50/80 border-2 border-pink-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <ReferralPerformance startDate={startDate} endDate={endDate} />
        </div>

        {/* 8. OPERATIONAL STATUS */}
        <div id="section-operations" className="bg-cyan-50/80 border-2 border-cyan-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <OperationalStatus pending={pending} />
        </div>

        {/* 9. RECENT ACTIVITY */}
        <div id="section-activity" className="bg-slate-100 border-2 border-slate-300/80 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <RecentActivity activity={recentActivity} />
        </div>

        {/* 10. ACTIVITY HEATMAP */}
        <div id="section-heatmap" className="bg-indigo-50/80 border-2 border-indigo-200/90 p-3 sm:p-4 rounded-2xl shadow-xs transition-all">
          <ActivityHeatmap />
        </div>
      </main>
    </div>
  );
}
