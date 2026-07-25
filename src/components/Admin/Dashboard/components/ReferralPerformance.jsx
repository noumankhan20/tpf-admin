"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import { Share2, Search, Building, UserCheck, FolderKanban, ChevronDown, Check } from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/dashboardUtils";
import { useGetCampaignReferralsQuery } from "@/utils/slices/adminDashboardApiSlice";
import { useGetCampaignListQuery } from "@/utils/slices/campaignSlice";

const REF_COLORS = {
  Influencer: "#EC4899",
  "Insta Influencer": "#EC4899",
  Masjid: "#10B981",
  WhatsappAPI: "#22C55E",
  "Email Broadcast": "#3B82F6",
  "Meta Ads": "#6366F1",
  "Direct / Unknown": "#94A3B8",
};

const CATEGORIES = ["ALL", "Influencer", "Masjid", "WhatsappAPI", "Email Broadcast", "Meta Ads", "Direct / Unknown"];

export default function ReferralPerformance({ startDate, endDate }) {
  const { data: campaignRes, isLoading: isCampaignsLoading } = useGetCampaignListQuery();
  
  const { data: referralsRes, isLoading: isReferralsLoading } = useGetCampaignReferralsQuery({ startDate, endDate });

  const [selectedCampaignId, setSelectedCampaignId] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);
  const campaigns = campaignRes?.data || [];
  const referrals = referralsRes?.referrals || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sort campaigns newest first (by createdAt date & MongoDB ObjectId) & filter by search query inside dropdown
  const sortedAndFilteredCampaigns = useMemo(() => {
    const list = [...campaigns].sort((a, b) => {
      // 1. Try sorting by createdAt date
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA > 0 && dateB > 0 && dateA !== dateB) {
        return dateB - dateA; // Newest date first
      }

      // 2. Fallback: MongoDB _id timestamp (newer documents have higher hex _id)
      const idA = String(a._id || a.campaignId?._id || "");
      const idB = String(b._id || b.campaignId?._id || "");
      return idB.localeCompare(idA);
    });

    if (!campaignSearchQuery.trim()) return list;
    const q = campaignSearchQuery.toLowerCase();
    return list.filter((c) => (c.title || c.campaignName || "").toLowerCase().includes(q));
  }, [campaigns, campaignSearchQuery]);

  // Filter referrals by active selected campaign
  const baseReferrals = useMemo(() => {
    if (selectedCampaignId === "ALL") return referrals;
    return referrals.filter((ref) => {
      if (!ref.campaignId) return false;
      const refCampId = typeof ref.campaignId === "object" ? ref.campaignId._id : ref.campaignId;
      return String(refCampId) === String(selectedCampaignId);
    });
  }, [referrals, selectedCampaignId]);

  // Calculate revenue totals per referral channel category for selected campaign
  const sourceTotals = useMemo(() => {
    const totals = {
      Influencer: 0,
      Masjid: 0,
      WhatsappAPI: 0,
      "Email Broadcast": 0,
      "Meta Ads": 0,
      "Direct / Unknown": 0,
    };

    baseReferrals.forEach((ref) => {
      const src = (ref.refSource || "").trim();
      const rev = Number(ref.totalRevenue || ref.revenue || 0);

      if (src.toLowerCase().includes("influencer")) totals["Influencer"] += rev;
      else if (src.toLowerCase().includes("masjid")) totals["Masjid"] += rev;
      else if (src.toLowerCase().includes("whatsapp")) totals["WhatsappAPI"] += rev;
      else if (src.toLowerCase().includes("email")) totals["Email Broadcast"] += rev;
      else if (src.toLowerCase().includes("meta") || src.toLowerCase().includes("ads")) totals["Meta Ads"] += rev;
      else totals["Direct / Unknown"] += rev;
    });

    return totals;
  }, [baseReferrals]);

  // Summary Metrics
  const directAmount = sourceTotals["Direct / Unknown"];
  const referredAmount =
    sourceTotals["Influencer"] +
    sourceTotals["Masjid"] +
    sourceTotals["WhatsappAPI"] +
    sourceTotals["Email Broadcast"] +
    sourceTotals["Meta Ads"];

  const grandTotalAmount = directAmount + referredAmount;

  const directCount = useMemo(() => {
    return baseReferrals
      .filter((r) => {
        const src = (r.refSource || "").trim();
        return (
          !src ||
          src === "Direct / Unknown" ||
          src.toUpperCase() === "DIRECT" ||
          src.toUpperCase() === "UNKNOWN" ||
          src === "-"
        );
      })
      .reduce((sum, r) => sum + (r.count || 1), 0);
  }, [baseReferrals]);

  const referredCount = useMemo(() => {
    return baseReferrals
      .filter((r) => {
        const src = (r.refSource || "").trim();
        return (
          src &&
          src !== "Direct / Unknown" &&
          src.toUpperCase() !== "DIRECT" &&
          src.toUpperCase() !== "UNKNOWN" &&
          src !== "-"
        );
      })
      .reduce((sum, r) => sum + (r.count || 1), 0);
  }, [baseReferrals]);

  const grandTotalCount = directCount + referredCount;
  const directPct = grandTotalCount > 0 ? Math.round((directCount / grandTotalCount) * 100) : 0;
  const referredPct = grandTotalCount > 0 ? Math.round((referredCount / grandTotalCount) * 100) : 0;

  // Filtered referrals for table workspace
  const filteredReferrals = useMemo(() => {
    let result = baseReferrals;

    if (categoryFilter !== "ALL") {
      result = result.filter((ref) => {
        const src = (ref.refSource || "").trim();
        if (categoryFilter === "Direct / Unknown") {
          return (
            !src ||
            src === "Direct / Unknown" ||
            src.toUpperCase() === "DIRECT" ||
            src.toUpperCase() === "UNKNOWN" ||
            src === "-"
          );
        }
        return src.toLowerCase().includes(categoryFilter.toLowerCase());
      });
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ref) =>
          (ref.refName && ref.refName.toLowerCase().includes(q)) ||
          (ref.refCity && ref.refCity.toLowerCase().includes(q)) ||
          (ref.refSource && ref.refSource.toLowerCase().includes(q))
      );
    }

    return result;
  }, [baseReferrals, categoryFilter, searchQuery]);

  // Group and aggregate referral records by (refSource + "|" + refName + "|" + refCity) so identical entity rows are summed into 1 row!
  const groupedReferrals = useMemo(() => {
    const map = new Map();

    filteredReferrals.forEach((ref) => {
      let src = (ref.refSource || "").trim();
      let name = (ref.refName || "").trim();
      let city = (ref.refCity || "").trim();

      if (
        !src ||
        src === "Direct / Unknown" ||
        src.toUpperCase() === "DIRECT" ||
        src.toUpperCase() === "UNKNOWN" ||
        src === "-"
      ) {
        src = "Direct / Unknown";
      }

      if (!name || name.toUpperCase() === "DIRECT" || name.toUpperCase() === "UNKNOWN" || name === "-") {
        name = src === "Direct / Unknown" ? "Direct" : "-";
      }

      const key = `${src.toLowerCase()}|${name.toLowerCase()}|${city.toLowerCase()}`;
      const rev = Number(ref.totalRevenue || ref.revenue || 0);
      const cnt = Number(ref.count || 1);

      if (!map.has(key)) {
        map.set(key, {
          refSource: src,
          refName: name,
          refCity: city,
          totalRevenue: rev,
          count: cnt,
        });
      } else {
        const existing = map.get(key);
        existing.totalRevenue += rev;
        existing.count += cnt;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredReferrals]);

  // Echarts Donut Chart Configuration
  const chartOption = useMemo(() => {
    const dataKeys = Object.keys(sourceTotals);
    const chartData = dataKeys
      .filter((key) => sourceTotals[key] > 0)
      .map((key) => ({
        name: key === "Direct / Unknown" ? "Direct" : key,
        value: sourceTotals[key],
        itemStyle: { color: REF_COLORS[key] || "#94A3B8" },
      }));

    return {
      title: {
        text: formatCurrency(grandTotalAmount),
        subtext: "TOTAL REVENUE",
        left: "center",
        top: "40%",
        textStyle: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
        subtextStyle: { fontSize: 9, fontWeight: "600", color: "#64748B" },
      },
      tooltip: {
        trigger: "item",
        backgroundColor: "#0F172A",
        borderWidth: 0,
        padding: [8, 12],
        borderRadius: 8,
        textStyle: { color: "#FFFFFF", fontSize: 11, fontFamily: "sans-serif" },
        formatter: (params) =>
          `${params.name}: <b>₹${params.value.toLocaleString("en-IN")}</b> (${params.percent}%)`,
      },
      series: [
        {
          name: "Referral Channel",
          type: "pie",
          radius: ["55%", "80%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          minAngle: 15,
          padAngle: 2,
          itemStyle: { borderRadius: 4 },
          label: { show: false },
          labelLine: { show: false },
          data: chartData.length > 0 ? chartData : [{ name: "No Data", value: 1, itemStyle: { color: "#E2E8F0" } }],
          animationType: "scale",
          animationDuration: 800,
        },
      ],
    };
  }, [sourceTotals, grandTotalAmount]);

  const selectedCampaignObj = useMemo(() => {
    if (selectedCampaignId === "ALL") return null;
    return campaigns.find(
      (c) => String(c._id || c.campaignId?._id) === String(selectedCampaignId)
    );
  }, [campaigns, selectedCampaignId]);

  const selectedCampaignTitle = selectedCampaignObj
    ? selectedCampaignObj.title || selectedCampaignObj.campaignName
    : "All Campaigns (Platform Wide)";

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs flex flex-col gap-6 font-sans">
      {/* 1. Header & Integrated Campaign Search Dropdown */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-5">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Share2 size={18} className="text-[#10B981]" />
            <span>Referral Intelligence & Partner Analytics</span>
          </h2>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Analyze which channels and partners drive campaign revenue for{" "}
            <span className="font-semibold text-[#0F172A]">{selectedCampaignTitle}</span>.
          </p>
        </div>

        {/* Custom Campaign Search Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 bg-[#FAFAFA] hover:bg-white border border-[#E2E8F0] hover:border-[#10B981] px-3.5 py-2 rounded-xl text-xs font-bold text-[#0F172A] shadow-xs transition-all cursor-pointer"
          >
            <FolderKanban size={15} className="text-[#10B981]" />
            <span className="max-w-[240px] truncate">{selectedCampaignTitle}</span>
            <ChevronDown size={14} className={`text-[#64748B] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Floating Dropdown Menu with Search Input inside */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 p-2 flex flex-col gap-2">
              {/* Search Bar inside Dropdown */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={13} />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={campaignSearchQuery}
                  onChange={(e) => setCampaignSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#10B981] transition-all"
                />
              </div>

              {/* Scrollable Campaign List (Newest First) */}
              <div className="max-h-60 overflow-y-auto flex flex-col divide-y divide-[#F1F5F9]">
                {/* Option: All Campaigns */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaignId("ALL");
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-[#FAFAFA] rounded-lg transition-colors ${
                    selectedCampaignId === "ALL" ? "text-[#10B981] bg-emerald-50/50" : "text-[#0F172A]"
                  }`}
                >
                  <span>All Campaigns (Platform Wide)</span>
                  {selectedCampaignId === "ALL" && <Check size={14} className="text-[#10B981]" />}
                </button>

                {/* Option List Sorted Newest First */}
                {sortedAndFilteredCampaigns.map((camp) => {
                  const id = camp._id || camp.campaignId?._id;
                  const title = camp.title || camp.campaignName || "Campaign";
                  const isSelected = String(id) === String(selectedCampaignId);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedCampaignId(id);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#FAFAFA] rounded-lg transition-colors ${
                        isSelected ? "text-[#10B981] font-bold bg-emerald-50/50" : "text-[#334155]"
                      }`}
                    >
                      <span className="truncate pr-2">{title}</span>
                      {isSelected && <Check size={14} className="text-[#10B981] shrink-0" />}
                    </button>
                  );
                })}

                {sortedAndFilteredCampaigns.length === 0 && (
                  <div className="p-3 text-center text-xs text-[#94A3B8]">No matching campaigns found.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isCampaignsLoading || isReferralsLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#64748B]">
          <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <span>Loading campaign referral analytics...</span>
        </div>
      ) : (
        <>
          {/* 2. Direct vs Referred Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAFAFA] border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Direct / Organic Revenue
                </span>
                <h3 className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {formatCurrency(directAmount)}
                </h3>
                <p className="text-xs font-semibold text-[#64748B] font-mono mt-0.5">
                  {formatNumber(directCount)} Donations ({directPct}%)
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                <Building size={18} />
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider block mb-1">
                  Referred Revenue
                </span>
                <h3 className="text-xl font-extrabold text-[#10B981] font-mono">
                  {formatCurrency(referredAmount)}
                </h3>
                <p className="text-xs font-semibold text-[#059669] font-mono mt-0.5">
                  {formatNumber(referredCount)} Donations ({referredPct}%)
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <UserCheck size={18} />
              </div>
            </div>
          </div>

          {/* 3. Main Data Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Donut Chart & Channel Color Badges */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#F1F5F9] pb-6 lg:pb-0 lg:pr-6">
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 text-center w-full">
                Channel Revenue Share
              </h3>
              <div className="w-full h-[200px] relative">
                <ReactEcharts option={chartOption} style={{ height: "100%", width: "100%" }} />
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {Object.keys(REF_COLORS).map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FAFAFA] rounded border border-[#E2E8F0] text-[10px] font-bold text-[#64748B]"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: REF_COLORS[key] }} />
                    <span>{key === "Direct / Unknown" ? "Direct" : key}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Category Filter Actions & Partner Workspace Table */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Category Filter Tabs & Table Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        categoryFilter === cat
                          ? "bg-white text-[#10B981] shadow-xs border-[#E2E8F0]"
                          : "text-[#64748B] hover:text-[#0F172A] border-transparent hover:bg-[#F1F5F9]"
                      }`}
                    >
                      {cat === "ALL" ? "All Channels" : cat === "Direct / Unknown" ? "Direct" : cat}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 text-[#94A3B8]" size={13} />
                  <input
                    type="text"
                    placeholder="Filter partners, cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-44 pl-8 pr-3 py-1 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] transition-all"
                  />
                </div>
              </div>

              {/* Interactive Table Workspace */}
              <div className="overflow-x-auto max-h-[300px] border border-[#E2E8F0] rounded-xl shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0] sticky top-0 z-10 text-[10px] font-bold text-[#64748B] uppercase">
                      <th className="p-3">Source Channel</th>
                      <th className="p-3">Referrer Entity</th>
                      <th className="p-3">Location</th>
                      <th className="p-3 text-right">Revenue</th>
                      <th className="p-3 text-right">Donations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {groupedReferrals.length > 0 ? (
                      groupedReferrals.map((ref, idx) => {
                        const src = ref.refSource || "Direct / Unknown";
                        const color = REF_COLORS[src] || "#94A3B8";

                        return (
                          <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                            <td className="p-3 font-semibold text-[#0F172A] flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <span>{src}</span>
                            </td>
                            <td className="p-3 text-[#334155] font-medium">{ref.refName || "-"}</td>
                            <td className="p-3 text-[#64748B] font-medium">{ref.refCity || "-"}</td>
                            <td className="p-3 font-bold text-[#10B981] text-right font-mono">
                              {formatCurrency(ref.totalRevenue || ref.revenue || 0)}
                            </td>
                            <td className="p-3 text-[#64748B] font-semibold text-right font-mono">
                              {formatNumber(ref.count || 0)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-xs text-[#94A3B8]">
                          No matching referral partner records for{" "}
                          <span className="font-semibold text-[#334155]">{selectedCampaignTitle}</span>.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
