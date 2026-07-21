"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, ArrowRight, CheckCircle2, PlayCircle, PlusCircle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/dashboardUtils";

export default function CampaignOverview({ campaigns = {}, overview = {} }) {
  const router = useRouter();
  const topCampaigns = campaigns.topPerforming || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Campaign Performance</h2>
          <p className="text-xs font-medium text-[#64748B]">
            Active campaign metrics and top performing fundraising initiatives
          </p>
        </div>
        <button
          onClick={() => router.push("/campaigns")}
          className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1 group"
        >
          <span>View All Campaigns</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary Metrics Cards */}
        <div className="lg:col-span-1 flex flex-col gap-3.5">
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <PlayCircle size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Active Campaigns
                </span>
                <span className="text-lg font-extrabold text-[#0F172A] font-mono">
                  {formatNumber(overview.activeCampaigns || 0)}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">Running</span>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Completed Campaigns
                </span>
                <span className="text-lg font-extrabold text-[#0F172A] font-mono">
                  {formatNumber(overview.completedCampaigns || 0)}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">Fulfilled</span>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                <PlusCircle size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Created In Period
                </span>
                <span className="text-lg font-extrabold text-[#0F172A] font-mono">
                  +{formatNumber(overview.periodNewCampaigns || 0)}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-mono">New</span>
          </div>
        </div>

        {/* Right: Top Performing Campaigns Table */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Top Performing Campaigns
            </h3>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase">BY RAISED AMOUNT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase">
                  <th className="pb-2.5">Campaign</th>
                  <th className="pb-2.5">Progress</th>
                  <th className="pb-2.5 text-right">Raised</th>
                  <th className="pb-2.5 text-right">Donors</th>
                  <th className="pb-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {topCampaigns.length > 0 ? (
                  topCampaigns.map((camp) => {
                    const raised = camp.raisedAmount || 0;
                    const target = camp.targetAmount || 1;
                    const pct = Math.min(100, Math.round((raised / target) * 100));

                    return (
                      <tr
                        key={camp._id}
                        onClick={() => router.push(`/campaigns`)}
                        className="hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 pr-3 font-semibold text-[#0F172A] truncate max-w-[180px]">
                          {camp.title}
                        </td>
                        <td className="py-2.5 pr-3 w-28">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#64748B] font-mono">{pct}%</span>
                            <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#10B981] h-full rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-bold text-[#10B981] font-mono">
                          {formatCurrency(raised)}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-[#64748B] font-mono">
                          {formatNumber(camp.totalDonors || 0)}
                        </td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              camp.campaignStatus === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {camp.campaignStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-xs text-[#94A3B8]">
                      No top campaigns found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
