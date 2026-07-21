"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  FileCheck,
  UserCheck,
  FolderCheck,
  Users,
  ClipboardList,
  ReceiptText,
} from "lucide-react";

export default function AttentionRequired({ pending = {} }) {
  const router = useRouter();

  const items = [
    {
      id: "offline",
      title: "Offline Donations",
      subtitle: "Pending Verification",
      count: pending.offlineDonations || 0,
      action: "Review Donations",
      route: "/donation-management?status=pending",
      icon: CreditCard,
    },
    {
      id: "beneficiary",
      title: "Beneficiary Forms",
      subtitle: "Pending Verification",
      count: pending.beneficiaryVerification || 0,
      action: "Review Applications",
      route: "/verify/financial?status=pending",
      icon: FileCheck,
    },
    {
      id: "kyc",
      title: "KYC Verification",
      subtitle: "Pending Review",
      count: pending.kycVerification || 0,
      action: "Review KYC",
      route: "/verify/kyc?status=pending",
      icon: UserCheck,
    },
    {
      id: "campaigns",
      title: "Campaign Approvals",
      subtitle: "Pending Approval",
      count: pending.campaignApproval || 0,
      action: "Review Campaigns",
      route: "/campaigns?status=DRAFT",
      icon: FolderCheck,
    },
    {
      id: "volunteers",
      title: "Volunteer Applications",
      subtitle: "Pending Review",
      count: pending.volunteerApplications || 0,
      action: "Review Volunteers",
      route: "/tpf-management/volunteers?status=pending",
      icon: Users,
    },
    {
      id: "tasks",
      title: "Task Management",
      subtitle: "Pending Tasks",
      count: pending.tasks || 0,
      action: "View Tasks",
      route: "/admin/task-management?status=PENDING",
      icon: ClipboardList,
    },
    {
      id: "vouchers",
      title: "Expense Vouchers",
      subtitle: "Pending Approval",
      count: pending.vouchers || 0,
      action: "View Vouchers",
      route: "/finance/expenses?status=pending",
      icon: ReceiptText,
    },
  ];

  const getPriorityStyle = (count) => {
    if (count >= 20) {
      return {
        badge: "bg-red-50 text-red-600 border-red-200",
        indicator: "bg-red-500",
        border: "border-red-100 hover:border-red-300",
        text: "text-red-600",
      };
    }
    if (count > 0) {
      return {
        badge: "bg-amber-50 text-amber-600 border-amber-200",
        indicator: "bg-amber-500",
        border: "border-amber-100 hover:border-amber-300",
        text: "text-amber-600",
      };
    }
    return {
      badge: "bg-slate-50 text-slate-500 border-slate-200",
      indicator: "bg-slate-300",
      border: "border-slate-200 hover:border-slate-300",
      text: "text-slate-600",
    };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <span>Attention Required</span>
          </h2>
          <p className="text-xs font-medium text-[#64748B]">
            Pending actions across TPFAid operations requiring admin verification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
        {items.map((item) => {
          const style = getPriorityStyle(item.count);
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => router.push(item.route)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${style.border}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E2E8F0] flex items-center justify-center text-[#475569]">
                    <Icon size={16} />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border font-mono ${style.badge}`}
                  >
                    {item.count > 0 ? `${item.count} Pending` : "0 Pending"}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#0F172A] leading-snug">{item.title}</h3>
                <p className="text-[11px] font-medium text-[#64748B]">{item.subtitle}</p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] font-semibold text-[#10B981] group hover:text-[#059669]">
                <span>{item.action}</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
