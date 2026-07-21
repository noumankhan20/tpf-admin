"use client";

import React, { useState, useMemo } from "react";
import ReactEcharts from "echarts-for-react";
import { formatCurrency, formatNumber } from "@/utils/dashboardUtils";

const COLORS = {
  ZAKAAT: "#10B981", // Emerald
  SADAQAH: "#F59E0B", // Amber
  LILLAH: "#6366F1", // Indigo
  IMDAD: "#14B8A6", // Teal
  OFFLINE: "#64748B", // Slate
  TIP: "#EC4899", // Pink
  RIBA: "#475569", // Dark Slate
};

export default function DonationPerformance({ donations = {} }) {
  const [chartType, setChartType] = useState("line"); // 'line' | 'bar'
  const [channelView, setChannelView] = useState("all"); // 'all' | 'online' | 'offline'
  const [typeMode, setTypeMode] = useState("online"); // 'online' | 'offline'

  const trendData = donations.trend || [];
  const onlineTypes = donations.onlineTypes || [];
  const offlineTypes = donations.offlineTypes || [];

  const onlineAmount = donations.onlineAmount || 0;
  const offlineAmount = donations.offlineAmount || 0;
  const totalAmount = onlineAmount + offlineAmount;

  const onlinePct = totalAmount > 0 ? Math.round((onlineAmount / totalAmount) * 100) : 0;
  const offlinePct = totalAmount > 0 ? Math.round((offlineAmount / totalAmount) * 100) : 0;

  // Chart option for trend
  const chartOption = useMemo(() => {
    const labels = trendData.map((item) => {
      const d = item._id;
      if (d.hour !== undefined) return `${d.hour}:00`;
      if (d.day !== undefined && d.month !== undefined) return `${d.day}/${d.month}`;
      if (d.week !== undefined) return `W${d.week}`;
      if (d.month !== undefined) return `M${d.month}`;
      return "";
    });

    const values = trendData.map((item) => {
      if (channelView === "online") return item.online || 0;
      if (channelView === "offline") return item.offline || 0;
      return item.total || 0;
    });

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0F172A",
        borderWidth: 0,
        padding: [10, 14],
        borderRadius: 8,
        textStyle: { color: "#FFFFFF", fontSize: 12, fontFamily: "monospace" },
        formatter: (params) => {
          const value = params[0].value;
          return `
            <div style="color: #94A3B8; margin-bottom: 2px;">${params[0].name}</div>
            <div style="font-weight: 700; color: #10B981;">₹${value.toLocaleString("en-IN")}</div>
          `;
        },
      },
      grid: { top: "8%", left: "0%", right: "2%", bottom: "0%", containLabel: true },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: chartType === "bar",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748B", fontSize: 11, margin: 12 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#F1F5F9", type: "solid" } },
        axisLabel: {
          color: "#64748B",
          fontSize: 11,
          formatter: (val) => (val === 0 ? "0" : `₹${(val / 1000).toFixed(0)}k`),
        },
      },
      series: [
        {
          data: values,
          type: chartType,
          smooth: 0.3,
          symbol: "circle",
          symbolSize: 6,
          itemStyle:
            chartType === "bar"
              ? { color: "#10B981", borderRadius: [4, 4, 0, 0] }
              : { color: "#10B981", borderWidth: 2, borderColor: "#fff" },
          barWidth: chartType === "bar" ? "35%" : undefined,
          lineStyle: { width: 3, color: "#10B981" },
          areaStyle:
            chartType === "line"
              ? {
                  color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: "rgba(16, 185, 129, 0.15)" },
                      { offset: 1, color: "rgba(16, 185, 129, 0)" },
                    ],
                  },
                }
              : undefined,
          animationDuration: 800,
        },
      ],
    };
  }, [trendData, chartType, channelView]);

  // Donut chart option for type breakdown
  const currentTypes = typeMode === "online" ? onlineTypes : offlineTypes;
  const typeTotal = currentTypes.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const donutOption = useMemo(() => {
    const data = currentTypes.map((item) => {
      let key = item._id || "UNKNOWN";
      if (key === "SADQAH") key = "SADAQAH";
      const name =
        key === "ZAKAAT"
          ? "Zakat"
          : key === "SADAQAH"
          ? "Sadaqah"
          : key === "LILLAH"
          ? "Lillah"
          : key === "IMDAD"
          ? "Imdad"
          : key === "RIBA"
          ? "Riba"
          : key;
      return {
        name,
        value: item.amount || 0,
        itemStyle: { color: COLORS[key] || "#94A3B8" },
      };
    });

    return {
      title: {
        text: formatCurrency(typeTotal),
        subtext: "PERIOD TOTAL",
        left: "center",
        top: "42%",
        textStyle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
        subtextStyle: { fontSize: 9, fontWeight: "600", color: "#64748B", margin: 4 },
      },
      tooltip: {
        trigger: "item",
        backgroundColor: "#0F172A",
        borderWidth: 0,
        padding: [8, 12],
        borderRadius: 8,
        textStyle: { color: "#FFFFFF", fontSize: 11 },
        formatter: (params) =>
          `${params.name}: <b>₹${params.value.toLocaleString("en-IN")}</b> (${params.percent}%)`,
      },
      series: [
        {
          type: "pie",
          radius: ["55%", "78%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          minAngle: 15,
          padAngle: 2,
          itemStyle: { borderRadius: 4 },
          label: { show: false },
          labelLine: { show: false },
          data,
          animationDuration: 800,
        },
      ],
    };
  }, [currentTypes, typeTotal]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Trend Line/Bar Chart (2 columns) */}
        <div className="xl:col-span-2 bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F1F5F9] pb-4 gap-3">
            <div>
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Donation Performance Trend
              </h3>
              <p className="text-xl font-extrabold text-[#0F172A] tracking-tight font-mono mt-0.5">
                Collection Net: <span className="text-[#10B981]">{formatCurrency(totalAmount)}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
                {["line", "bar"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                      chartType === type
                        ? "bg-white text-[#0F172A] shadow-xs"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
                {[
                  { key: "all", label: "All" },
                  { key: "online", label: "Online" },
                  { key: "offline", label: "Offline" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setChannelView(opt.key)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                      channelView === opt.key
                        ? "bg-white text-[#0F172A] shadow-xs"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ReactEcharts option={chartOption} style={{ height: "100%", width: "100%" }} />
          </div>

          {/* Online vs Offline Visual Comparison Bar */}
          <div className="pt-4 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-[#475569]">Channel Distribution</span>
              <span className="font-mono text-[#0F172A]">
                Online: {formatCurrency(onlineAmount)} ({onlinePct}%) • Offline: {formatCurrency(offlineAmount)} ({offlinePct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-[#F1F5F9] rounded-full flex overflow-hidden">
              <div
                style={{ width: `${onlinePct}%` }}
                className="bg-[#10B981] h-full transition-all duration-500"
                title={`Online: ${onlinePct}%`}
              />
              <div
                style={{ width: `${offlinePct}%` }}
                className="bg-[#64748B] h-full transition-all duration-500"
                title={`Offline: ${offlinePct}%`}
              />
            </div>
          </div>
        </div>

        {/* Donation Type Breakdown (1 column) */}
        <div className="xl:col-span-1 bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Donation Type Breakdown
            </h3>
            <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
              {["online", "offline"].map((m) => (
                <button
                  key={m}
                  onClick={() => setTypeMode(m)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                    typeMode === m
                      ? "bg-white text-[#0F172A] shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[230px] w-full relative">
            <ReactEcharts option={donutOption} style={{ height: "100%", width: "100%" }} />
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {currentTypes.map((item) => {
              let key = item._id || "UNKNOWN";
              if (key === "SADQAH") key = "SADAQAH";
              const label =
                key === "ZAKAAT"
                  ? "Zakat"
                  : key === "SADAQAH"
                  ? "Sadaqah"
                  : key === "LILLAH"
                  ? "Lillah"
                  : key === "IMDAD"
                  ? "Imdad"
                  : key === "RIBA"
                  ? "Riba"
                  : key;

              const pct = typeTotal > 0 ? Math.round(((item.amount || 0) / typeTotal) * 100) : 0;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAFAFA] border border-[#E2E8F0]/60"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[key] || "#94A3B8" }}
                    />
                    <span className="font-semibold text-[#334155]">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#0F172A] font-bold">
                      {formatCurrency(item.amount || 0)}
                    </span>
                    <span className="text-[#64748B] text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
