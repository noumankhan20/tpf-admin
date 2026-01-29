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
    <div className="mb-6 sm:mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">
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