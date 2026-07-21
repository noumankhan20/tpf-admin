"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { formatNumber } from "@/utils/dashboardUtils";

export default function OperationalStatus({ pending = {} }) {
  const router = useRouter();

  const rows = [
    {
      id: "offline",
      label: "Offline Donations Verification",
      count: pending.offlineDonations || 0,
      route: "/donation-management?status=pending",
      max: 50,
    },
    {
      id: "beneficiary",
      label: "Beneficiary Form Verification",
      count: pending.beneficiaryVerification || 0,
      route: "/verify/financial?status=pending",
      max: 50,
    },
    {
      id: "kyc",
      label: "User KYC Verification",
      count: pending.kycVerification || 0,
      route: "/verify/kyc?status=pending",
      max: 50,
    },
    {
      id: "campaigns",
      label: "Campaign Approvals",
      count: pending.campaignApproval || 0,
      route: "/campaigns?status=DRAFT",
      max: 20,
    },
    {
      id: "volunteers",
      label: "Volunteer Applications",
      count: pending.volunteerApplications || 0,
      route: "/tpf-management/volunteers?status=pending",
      max: 20,
    },
    {
      id: "tasks",
      label: "Pending Internal Tasks",
      count: pending.tasks || 0,
      route: "/admin/task-management?status=PENDING",
      max: 50,
    },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Operational Workload Status</h2>
        <p className="text-xs font-medium text-[#64748B]">
          Current operational workload density across management modules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {rows.map((row) => {
          const pct = Math.min(100, Math.round((row.count / row.max) * 100));
          const colorClass =
            row.count > 20
              ? "bg-red-500 text-red-600"
              : row.count > 0
              ? "bg-amber-500 text-amber-600"
              : "bg-emerald-500 text-emerald-600";

          return (
            <div
              key={row.id}
              onClick={() => router.push(row.route)}
              className="p-3.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl hover:bg-white hover:border-[#CBD5E1] transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A]">{row.label}</span>
                <span className="text-xs font-bold font-mono text-[#0F172A] flex items-center gap-1">
                  <span>{formatNumber(row.count)} Pending</span>
                  <ChevronRight size={13} className="text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    row.count > 20 ? "bg-red-500" : row.count > 0 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
