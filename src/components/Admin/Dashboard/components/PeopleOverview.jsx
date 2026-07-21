"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart, Users, UserCheck, UserPlus } from "lucide-react";
import { formatNumber } from "@/utils/dashboardUtils";

export default function PeopleOverview({ overview = {} }) {
  const router = useRouter();

  const cards = [
    {
      id: "donors",
      title: "Donors",
      total: overview.totalDonors || 0,
      newCount: overview.periodNewDonors || 0,
      icon: Heart,
      color: "text-rose-500 bg-rose-50 border-rose-100",
      route: "/tpf-management/donors",
    },
    {
      id: "volunteers",
      title: "Volunteers",
      total: overview.totalVolunteers || 0,
      newCount: overview.periodNewVolunteers || 0,
      icon: Users,
      color: "text-indigo-500 bg-indigo-50 border-indigo-100",
      route: "/tpf-management/volunteers",
    },
    {
      id: "beneficiaries",
      title: "Beneficiaries",
      total: overview.totalBeneficiaries || 0,
      newCount: overview.periodNewBeneficiaries || 0,
      icon: UserCheck,
      color: "text-emerald-500 bg-emerald-50 border-emerald-100",
      route: "/verify/financial",
    },
    {
      id: "users",
      title: "Registered Users",
      total: overview.totalUsers || 0,
      newCount: overview.periodNewUsers || 0,
      icon: UserPlus,
      color: "text-amber-500 bg-amber-50 border-amber-100",
      route: "/verify/kyc",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Community & People</h2>
        <p className="text-xs font-medium text-[#64748B]">
          Overview of registered donors, active volunteers, verified beneficiaries, and platform users
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => router.push(card.route)}
              className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  {card.title}
                </span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] font-mono tracking-tight">
                  {formatNumber(card.total)}
                </h3>
                <p className="text-xs font-semibold text-[#10B981] font-mono mt-1">
                  +{formatNumber(card.newCount)} new during period
                </p>
              </div>

              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${card.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
