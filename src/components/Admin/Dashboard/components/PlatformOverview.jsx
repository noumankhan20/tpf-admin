"use client";

import React from "react";
import {
  IndianRupee,
  HeartHandshake,
  Users,
  UserCheck,
  FolderKanban,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { formatCurrency, formatNumber, calculatePercentageChange } from "@/utils/dashboardUtils";

const KpiCard = ({ title, primaryValue, subText, change, icon: Icon, color = "#10B981", dark = false }) => {
  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
        dark
          ? "bg-[#0F172A] border-[#1E293B] text-white"
          : "bg-white border-[#E2E8F0] text-[#0F172A]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? "text-[#94A3B8]" : "text-[#64748B]"}`}>
            {title}
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              dark ? "bg-[#1E293B] text-[#10B981]" : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]"
            }`}
          >
            <Icon size={16} />
          </div>
        </div>

        <h3 className="text-2xl font-extrabold tracking-tight font-mono mb-1">{primaryValue}</h3>
        {subText && (
          <p className={`text-xs font-semibold ${dark ? "text-[#CBD5E1]" : "text-[#475569]"}`}>
            {subText}
          </p>
        )}
      </div>

      {change && (
        <div className="mt-4 pt-3 border-t border-slate-100/10 flex items-center gap-1.5 text-xs font-bold font-mono">
          {change.value === 0 ? (
            <span className="flex items-center gap-1 text-slate-400">
              <Minus size={12} />
              <span>0% vs prev period</span>
            </span>
          ) : change.isIncrease ? (
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <TrendingUp size={12} />
              <span>{change.formatted} vs prev period</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              <TrendingDown size={12} />
              <span>{change.formatted} vs prev period</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function PlatformOverview({ overview = {} }) {
  const donationChange = calculatePercentageChange(overview.periodDonations, overview.prevPeriodDonations);
  const donorChange = calculatePercentageChange(overview.periodNewDonors, overview.prevNewDonors);
  const volunteerChange = calculatePercentageChange(overview.periodNewVolunteers, overview.prevNewVolunteers);
  const userChange = calculatePercentageChange(overview.periodNewUsers, overview.prevNewUsers);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Platform Overview</h2>
        <p className="text-xs font-medium text-[#64748B]">
          Cumulative scale and period operational performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Donations"
          primaryValue={formatCurrency(overview.periodDonations)}
          subText={`${formatCurrency(overview.totalDonations)} all time`}
          change={donationChange}
          icon={IndianRupee}
          dark={true}
        />

        <KpiCard
          title="Total Donors"
          primaryValue={formatNumber(overview.periodNewDonors)}
          subText={`${formatNumber(overview.totalDonors)} all time`}
          change={donorChange}
          icon={HeartHandshake}
        />

        <KpiCard
          title="Volunteers"
          primaryValue={formatNumber(overview.periodNewVolunteers)}
          subText={`${formatNumber(overview.totalVolunteers)} all time`}
          change={volunteerChange}
          icon={Users}
        />

        <KpiCard
          title="Beneficiaries"
          primaryValue={formatNumber(overview.periodNewBeneficiaries)}
          subText={`${formatNumber(overview.totalBeneficiaries)} all time`}
          icon={UserCheck}
        />

        <KpiCard
          title="Total Users"
          primaryValue={formatNumber(overview.periodNewUsers)}
          subText={`${formatNumber(overview.totalUsers)} all time`}
          change={userChange}
          icon={Users}
        />

        <KpiCard
          title="Campaigns"
          primaryValue={formatNumber(overview.periodNewCampaigns || 0)}
          subText={`${overview.totalCampaigns || 0} all time`}
          icon={FolderKanban}
        />
      </div>
    </div>
  );
}
