"use client";

import React, { useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import { useGetActivityHeatmapQuery } from "@/utils/slices/adminDashboardApiSlice";

export default function ActivityHeatmap() {
  const { data: heatmapRes, isLoading } = useGetActivityHeatmapQuery();
  const days = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);
  const heatmapData = heatmapRes?.data || [];

  const option = useMemo(
    () => ({
      tooltip: {
        position: "top",
        backgroundColor: "#0F172A",
        borderWidth: 0,
        padding: [6, 10],
        borderRadius: 6,
        textStyle: { color: "#FFFFFF", fontSize: 11, fontFamily: "monospace" },
        formatter: (params) => {
          const dayIndex = params.value[1];
          const hrIndex = params.value[0];
          const fullHours = [
            "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a",
            "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"
          ];
          const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          return `${daysFull[dayIndex]} ${fullHours[hrIndex]} : <b>${params.value[2]}</b> donations`;
        },
      },
      grid: { top: "8%", bottom: "15%", left: "3%", right: "2%" },
      xAxis: {
        type: "category",
        data: [
          "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a",
          "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"
        ],
        splitArea: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94A3B8", fontSize: 9, interval: 3 },
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94A3B8", fontSize: 9 },
      },
      visualMap: {
        min: 0,
        max: Math.max(...heatmapData.map((d) => d[2]), 4),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
        inRange: { color: ["#F1F5F9", "#A7F3D0", "#10B981", "#065F46"] },
        show: false,
      },
      series: [
        {
          name: "Activity",
          type: "heatmap",
          data: heatmapData,
          label: { show: false },
          itemStyle: {
            borderColor: "#FFFFFF",
            borderWidth: 1.5,
            borderRadius: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 4,
              shadowColor: "rgba(0, 0, 0, 0.15)",
            },
          },
        },
      ],
    }),
    [heatmapData, days]
  );

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Weekly Activity Density Heatmap
        </h3>
        <span className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
          TIME INSIGHTS
        </span>
      </div>

      <div className="h-[180px] w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
            Loading activity heatmap...
          </div>
        ) : (
          <ReactEcharts option={option} style={{ height: "100%" }} notMerge={true} />
        )}
      </div>
    </div>
  );
}
