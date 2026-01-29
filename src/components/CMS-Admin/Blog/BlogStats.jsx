"use client";
import React from "react";
import { BookOpen, FileText, Eye, TrendingUp } from "lucide-react";

export default function BlogStats({ data, isLoading }) {
  const stats = [
    {
      label: "Total Posts",
      value: isLoading ? "..." : data?.pagination?.total || 0,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Published",
      value: isLoading ? "..." : data?.data?.filter(b => b.status === "published").length || 0,
      icon: FileText,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Drafts",
      value: isLoading ? "..." : data?.data?.filter(b => b.status === "draft").length || 0,
      icon: Eye,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "This Month",
      value: isLoading ? "..." : data?.data?.filter(b => {
        const blogDate = new Date(b.createdAt);
        const now = new Date();
        return blogDate.getMonth() === now.getMonth() && 
               blogDate.getFullYear() === now.getFullYear();
      }).length || 0,
      icon: TrendingUp,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200/60 p-3 sm:p-4 shadow-sm hover:shadow transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}