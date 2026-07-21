"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ArrowRight,
  CreditCard,
  FileCheck,
  UserCheck,
  ClipboardList,
} from "lucide-react";

export default function RecentActivity({ activity = [] }) {
  const router = useRouter();

  const getIcon = (type) => {
    switch (type) {
      case "donation":
      case "offline_donation":
        return <CreditCard size={15} className="text-emerald-600" />;
      case "financial_aid":
        return <FileCheck size={15} className="text-blue-600" />;
      case "kyc":
        return <UserCheck size={15} className="text-purple-600" />;
      case "task":
      default:
        return <ClipboardList size={15} className="text-amber-600" />;
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "Just now";
    const date = new Date(ts);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Clock size={17} className="text-[#10B981]" />
            <span>Recent Activity</span>
          </h2>
          <p className="text-xs font-medium text-[#64748B]">
            Latest operational events across donations, beneficiary applications, KYC, and tasks
          </p>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-[#F1F5F9]">
        {activity.length > 0 ? (
          activity.map((item, idx) => (
            <div
              key={idx}
              onClick={() => router.push(item.route || "/")}
              className="py-3 flex items-center justify-between hover:bg-[#FAFAFA] px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                  {getIcon(item.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] leading-snug">{item.title}</h4>
                  <p className="text-[11px] font-semibold text-[#64748B]">
                    {item.module} • <span className="text-[#334155]">{item.subtitle}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#94A3B8] font-mono">
                  {formatTime(item.timestamp)}
                </span>
                <ArrowRight size={13} className="text-[#CBD5E1] group-hover:translate-x-1 group-hover:text-[#10B981] transition-all" />
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-[#94A3B8]">
            No recent operational activity recorded.
          </div>
        )}
      </div>
    </div>
  );
}
