"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    ArrowLeft,
    TrendingUp,
    Search,
    Calendar,
    Filter,
    Layers,
    User,
    Info,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactEcharts from "echarts-for-react";
import {
    useGetDonationAnalyticsQuery,
    useGetSummaryMetricsQuery,
    useGetActivityHeatmapQuery,
    useGetCampaignReferralsQuery
} from "../../../utils/slices/adminDashboardApiSlice";
import {
    useGetCampaignListQuery
} from "../../../utils/slices/campaignSlice";

// Premium Color Constants
const COLORS = {
    ZAKAAT: "#10B981",    // Emerald
    SADAQAH: "#F59E0B",   // Amber
    LILLAH: "#6366F1",    // Indigo
    IMDAD: "#14B8A6",     // Teal
    OFFLINE: "#64748B",   // Muted Slate
    TIP: "#EC4899",       // Pink
    RIBA: "#475569",      // Dark Slate
};

// ==========================================
// SHARED ENTERPRISE UI COMPONENTS
// ==========================================

const Card = ({ children, className = "", title, action }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_24px_-4px_rgba(0,0,0,0.02)] p-6 transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.02),0_16px_32px_-4px_rgba(0,0,0,0.04)] ${className}`}
    >
        {(title || action) && (
            <div className="flex items-center justify-between mb-5">
                {title && <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">{title}</h3>}
                {action && <div className="text-xs">{action}</div>}
            </div>
        )}
        {children}
    </motion.div>
);

const SegmentedControl = ({ options, active, onChange }) => (
    <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]/80">
        {options.map((opt) => (
            <button
                key={opt.key}
                onClick={() => onChange(opt.key)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    active === opt.key
                        ? "bg-white text-[#0F172A] shadow-sm font-bold"
                        : "text-[#64748B] hover:text-[#334155]"
                }`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

const LoadingState = ({ message = "Loading analytics workspace..." }) => (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#E2E8F0] border-t-[#10B981] rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{message}</span>
    </div>
);

const EmptyState = ({ message = "No matching records found." }) => (
    <div className="py-16 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] mb-3">
            <Info size={18} />
        </div>
        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{message}</p>
    </div>
);

// ==========================================
// DETAILED KPI CARD
// ==========================================

const MetricSparkCard = React.memo(({ title, value, subtext, color, data, prefix = "", darkTheme = false }) => {
    const chartOption = useMemo(() => ({
        grid: { left: 0, right: 0, top: 4, bottom: 0 },
        xAxis: { type: 'category', show: false },
        yAxis: { type: 'value', show: false },
        series: [{
            data: data || [0, 0, 0, 0, 0],
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 1.5, color: darkTheme ? '#10B981' : color },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: darkTheme ? 'rgba(16, 185, 129, 0.15)' : color + '22' },
                        { offset: 1, color: darkTheme ? 'rgba(16, 185, 129, 0)' : color + '00' }
                    ]
                }
            },
            animationDuration: 1000
        }]
    }), [data, color, darkTheme]);

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`rounded-xl p-5 border transition-all ${
                darkTheme
                    ? "bg-[#0F172A] border-[#1E293B] text-white shadow-[0_4px_20px_rgba(15,23,42,0.15)]"
                    : "bg-white border-[#E2E8F0] text-[#0F172A] shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-[#CBD5E1]"
            }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] block mb-1 ${darkTheme ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                        {title}
                    </span>
                    <h4 className="text-2xl font-bold tracking-tight font-mono">{prefix}{value}</h4>
                </div>
                {subtext && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        darkTheme ? 'bg-[#1E293B] text-[#10B981]' : 'bg-[#E6F4EA] text-[#137333]'
                    }`}>
                        {subtext}
                    </span>
                )}
            </div>
            <div className="h-10 w-full mt-4">
                <ReactEcharts option={chartOption} style={{ height: '100%' }} notMerge={true} />
            </div>
        </motion.div>
    );
});

// ==========================================
// CHART CONTAINER DESIGN WORKSPACE
// ==========================================

const DonationTrendChart = () => {
    const [timeRange, setTimeRange] = useState("today");
    const [chartType, setChartType] = useState("bar"); // 'line' | 'bar'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [activeType, setActiveType] = useState("ALL");

    const { data, isLoading } = useGetDonationAnalyticsQuery({
        timeRange,
        month: selectedMonth,
        year: selectedYear,
        donationType: activeType
    });

    const trendData = data?.analytics?.trend || [];
    const totalAmount = data?.analytics?.trend?.reduce((acc, curr) => acc + curr.total, 0) || 0;

    const donationTypes = [
        { key: "ALL", label: "All Types" },
        { key: "ZAKAAT", label: "Zakaat" },
        { key: "SADAQAH", label: "Sadaqah" },
        { key: "LILLAH", label: "Lillah" },
        { key: "IMDAD", label: "Imdad" },
    ];

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const normalizedData = useMemo(() => {
        if (timeRange === 'today') {
            const result = [];
            for (let h = 0; h < 24; h++) {
                const label = `${h}:00`;
                const matched = trendData.find(item => item._id && item._id.hour === h);
                result.push({
                    label,
                    total: matched ? matched.total : 0
                });
            }
            return result;
        }

        if (timeRange === 'week') {
            const startOfWeek = new Date();
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);

            const result = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                
                const dayNum = d.getDate();
                const monthNum = d.getMonth() + 1;
                const label = `${dayNum}/${monthNum}`;
                
                const matched = trendData.find(item => item._id && item._id.day === dayNum && item._id.month === monthNum);
                result.push({
                    label,
                    total: matched ? matched.total : 0
                });
            }
            return result;
        }

        if (timeRange === 'month') {
            const yearNum = selectedYear;
            const daysInMonth = new Date(yearNum, selectedMonth, 0).getDate();
            
            const result = [];
            for (let d = 1; d <= daysInMonth; d++) {
                const label = `${d}/${selectedMonth}`;
                const matched = trendData.find(item => item._id && item._id.day === d && item._id.month === selectedMonth);
                result.push({
                    label,
                    total: matched ? matched.total : 0
                });
            }
            return result;
        }

        if (timeRange === 'year') {
            const result = [];
            months.forEach((m, idx) => {
                const monthNum = idx + 1;
                const matched = trendData.find(item => item._id && item._id.month === monthNum);
                result.push({
                    label: m,
                    total: matched ? matched.total : 0
                });
            });
            return result;
        }

        return trendData.map(item => ({ label: "", total: item.total }));
    }, [trendData, timeRange, selectedMonth, selectedYear]);

    const chartOption = useMemo(() => {
        const labels = normalizedData.map(item => item.label);
        const values = normalizedData.map(item => item.total);

        return {
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#0F172A',
                borderWidth: 0,
                padding: [10, 14],
                borderRadius: 8,
                textStyle: { color: '#FFFFFF', fontSize: 12, fontFamily: 'monospace' },
                formatter: function (params) {
                    const value = params[0].value;
                    return `
                        <div style="color: #94A3B8; margin-bottom: 2px;">${params[0].name}</div>
                        <div style="font-weight: 700; color: #10B981;">₹${value.toLocaleString('en-IN')}</div>
                    `;
                }
            },
            grid: { top: '8%', left: '0%', right: '2%', bottom: '0%', containLabel: true },
            xAxis: {
                type: 'category',
                data: labels,
                boundaryGap: chartType === 'bar',
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#64748B', fontSize: 11, margin: 12 }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { lineStyle: { color: '#F1F5F9', type: 'solid' } },
                axisLabel: {
                    color: '#64748B',
                    fontSize: 11,
                    formatter: (value) => value === 0 ? '0' : `₹${(value / 1000).toFixed(0)}k`
                }
            },
            series: [{
                data: values,
                type: chartType,
                smooth: 0.3,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: chartType === 'bar' ? {
                    color: '#10B981',
                    borderRadius: [4, 4, 0, 0]
                } : {
                    color: '#10B981',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                barWidth: chartType === 'bar' ? '35%' : undefined,
                lineStyle: { width: 3, color: '#10B981' },
                areaStyle: chartType === 'line' ? {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.12)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                        ]
                    }
                } : undefined,
                animationDuration: 1000
            }]
        };
    }, [trendData, timeRange, chartType]);

    return (
        <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-5 border-b border-[#F1F5F9] gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight uppercase tracking-wider text-[11px] text-[#64748B] mb-1">Donation Trend</h3>
                    <p className="text-xl font-bold text-[#0F172A] tracking-tight">
                        Platform Net: <span className="text-[#10B981]">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <SegmentedControl
                        options={[
                            { key: 'line', label: 'Line' },
                            { key: 'bar', label: 'Bar' }
                        ]}
                        active={chartType}
                        onChange={setChartType}
                    />

                    <SegmentedControl
                        options={[
                            { key: 'today', label: '1D' },
                            { key: 'week', label: '1W' },
                            { key: 'month', label: '1M' },
                            { key: 'year', label: '1Y' }
                        ]}
                        active={timeRange}
                        onChange={setTimeRange}
                    />

                    {timeRange === 'month' && (
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-[#FAFAFA] border border-[#E2E8F0] text-xs font-semibold rounded-lg py-1.5 px-3 focus:outline-none focus:border-[#10B981] transition-all"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    )}

                    <div className="relative">
                        <select
                            value={activeType}
                            onChange={(e) => setActiveType(e.target.value)}
                            className="appearance-none bg-[#FAFAFA] border border-[#E2E8F0] text-xs font-semibold rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#10B981] cursor-pointer transition-all"
                        >
                            {donationTypes.map((type) => (
                                <option key={type.key} value={type.key}>{type.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={12} />
                    </div>
                </div>
            </div>

            <div className="h-[320px] w-full">
                {isLoading ? (
                    <LoadingState message="Fetching net transactions..." />
                ) : (
                    <ReactEcharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                )}
            </div>
        </Card>
    );
};

// ==========================================
// PRECISE DONATION TYPE DONUT BREAKDOWN
// ==========================================

const DonationTypeBreakdown = () => {
    const { data, isLoading } = useGetDonationAnalyticsQuery({
        timeRange: 'year',
        year: new Date().getFullYear(),
        donationType: 'ALL'
    });
    const [mode, setMode] = useState("online");

    const onlineBreakdown = data?.analytics?.breakdown || [];
    const offlineBreakdown = data?.analytics?.offlineBreakdown || [];

    const currentBreakdown = useMemo(() => {
        const raw = mode === "online" ? onlineBreakdown : offlineBreakdown;
        const merged = {};
        raw.forEach(item => {
            let key = item._id || "UNKNOWN";
            if (key === "SADQAH") key = "SADAQAH";
            if (!merged[key]) merged[key] = 0;
            merged[key] += item.total;
        });
        return Object.entries(merged)
            .map(([key, val]) => ({
                _id: key,
                total: val
            }))
            .filter(item => item.total > 0);
    }, [mode, onlineBreakdown, offlineBreakdown]);

    const total = currentBreakdown.reduce((acc, curr) => acc + curr.total, 0);

    const chartOption = useMemo(() => {
        const chartData = currentBreakdown.map(item => ({
            name: item._id === "ZAKAAT" ? "Zakat" : item._id === "SADAQAH" ? "Sadaqah" : item._id === "LILLAH" ? "Lillah" : item._id === "IMDAD" ? "Imdad" : item._id === "RIBA" ? "Riba" : item._id,
            value: item.total,
            itemStyle: { color: COLORS[item._id] || "#94A3B8" }
        }));

        return {
            title: {
                text: '₹' + (total >= 100000 ? (total / 100000).toFixed(1) + 'L' : total.toLocaleString('en-IN')),
                subtext: 'VOLUME',
                left: 'center',
                top: '44%',
                textStyle: { fontSize: 16, fontWeight: '700', color: '#0F172A', fontFamily: 'sans-serif' },
                subtextStyle: { fontSize: 9, fontWeight: '600', color: '#64748B', fontFamily: 'sans-serif', margin: 4 }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: '#0F172A',
                borderWidth: 0,
                padding: [8, 12],
                borderRadius: 8,
                textStyle: { color: '#FFFFFF', fontSize: 11 },
                formatter: (params) => `${params.name}: <b>₹${params.value.toLocaleString('en-IN')}</b> (${params.percent}%)`
            },
            series: [{
                name: 'Donation Type',
                type: 'pie',
                radius: ['55%', '78%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                minAngle: 15,
                padAngle: 2,
                itemStyle: { borderRadius: 4 },
                label: { show: false },
                labelLine: { show: false },
                data: chartData,
                animationType: 'scale',
                animationDuration: 800
            }]
        };
    }, [currentBreakdown, total]);

    return (
        <Card>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Donation Share</h3>
                <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]/80">
                    <button
                        onClick={() => setMode("online")}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${mode === "online" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#334155]"}`}
                    >
                        Online
                    </button>
                    <button
                        onClick={() => setMode("offline")}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${mode === "offline" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#334155]"}`}
                    >
                        Offline
                    </button>
                </div>
            </div>

            {isLoading ? (
                <LoadingState message="Loading segmentations..." />
            ) : (
                <div className="flex flex-col gap-4">
                    {currentBreakdown.length === 0 ? (
                        <EmptyState message="No segmentations for this mode" />
                    ) : (
                        <>
                            <div className="h-[280px] w-full relative">
                                <ReactEcharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                {currentBreakdown.map((item) => {
                                    const percentage = total ? Math.round((item.total / total) * 100) : 0;
                                    const label = item._id === "ZAKAAT" ? "Zakat" : item._id === "SADAQAH" ? "Sadaqah" : item._id === "LILLAH" ? "Lillah" : item._id === "IMDAD" ? "Imdad" : item._id === "RIBA" ? "Riba" : item._id;
                                    return (
                                        <div key={item._id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-[#FAFAFA] border border-transparent hover:border-[#E2E8F0] transition-all">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[item._id] || "#94A3B8" }} />
                                                <span className="font-semibold text-[#334155]">{label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[#0F172A] font-bold">₹{item.total.toLocaleString('en-IN')}</span>
                                                <span className="text-[#64748B] text-[10px] font-medium bg-[#F1F5F9] px-1.5 py-0.5 rounded font-mono">{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </Card>
    );
};

// ==========================================
// PREMIUM PROGRESS VISUALIZATION (GOAL PROGRESS)
// ==========================================

const GoalProgress = React.memo(({ progress, targetLabel }) => {
    return (
        <Card>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Goal Progress</h3>
                <span className="text-xs font-bold text-[#10B981] bg-[#E6F4EA] px-2 py-0.5 rounded font-mono">{progress}%</span>
            </div>
            
            <div className="w-full flex flex-col gap-3">
                <div className="relative w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-[#10B981] rounded-full"
                    />
                </div>
                <div className="flex items-center gap-2 justify-between">
                    <span className="text-xs text-[#64748B] font-medium">Monthly Threshold Target</span>
                    <span className="text-xs font-bold text-[#0F172A] font-mono">{targetLabel}</span>
                </div>
            </div>
        </Card>
    );
});

// ==========================================
// ACTIVITY HEATMAP (GITHUB Graph Style)
// ==========================================

const ActivityHeatmap = React.memo(() => {
    const { data: heatmapRes, isLoading } = useGetActivityHeatmapQuery();
    const days = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);
    const hours = useMemo(() => ['12a', '4a', '8a', '12p', '4p', '8p'], []); // Sparser labels for premium spacing

    const heatmapData = heatmapRes?.data || [];

    const option = useMemo(() => ({
        tooltip: {
            position: 'top',
            backgroundColor: '#0F172A',
            borderWidth: 0,
            padding: [6, 10],
            borderRadius: 6,
            textStyle: { color: '#FFFFFF', fontSize: 11, fontFamily: 'monospace' },
            formatter: (params) => {
                // Find correct day/hour representation
                const dayIndex = params.value[1];
                const hrIndex = params.value[0];
                const fullHours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
                const daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return `${daysFull[dayIndex]} ${fullHours[hrIndex]} : <b>${params.value[2]}</b> donations`;
            }
        },
        grid: { top: '8%', bottom: '15%', left: '3%', right: '2%' },
        xAxis: {
            type: 'category',
            data: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'],
            splitArea: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#94A3B8',
                fontSize: 9,
                interval: 3 // Only show labels every 4 hours for clean github style
            }
        },
        yAxis: {
            type: 'category',
            data: days,
            splitArea: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#94A3B8', fontSize: 9 }
        },
        visualMap: {
            min: 0,
            max: Math.max(...heatmapData.map(d => d[2]), 4),
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%',
            inRange: { color: ['#F1F5F9', '#A7F3D0', '#10B981', '#065F46'] },
            show: false
        },
        series: [{
            name: 'Activity',
            type: 'heatmap',
            data: heatmapData,
            label: { show: false },
            itemStyle: {
                borderColor: '#FFFFFF',
                borderWidth: 1.5,
                borderRadius: 2
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.15)'
                }
            }
        }]
    }), [heatmapData, days]);

    return (
        <Card>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#F1F5F9]">
                <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Heatmap Insights</h3>
                <span className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">WEEKLY DENSITIES</span>
            </div>
            
            <div className="h-[180px] w-full">
                {isLoading ? (
                    <LoadingState message="Mapping traffic..." />
                ) : (
                    <ReactEcharts option={option} style={{ height: '100%' }} notMerge={true} />
                )}
            </div>
        </Card>
    );
});

// ==========================================
// REFERRAL ANALYTICS WORKSPACE
// ==========================================

const CampaignReferralsSection = () => {
    const { data: campaignRes, isLoading: isCampaignsLoading } = useGetCampaignListQuery();
    const { data: referralsRes, isLoading: isReferralsLoading } = useGetCampaignReferralsQuery();
    const [selectedCampaignId, setSelectedCampaignId] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const campaigns = campaignRes?.data || [];
    const referrals = referralsRes?.referrals || [];

    const filteredReferrals = useMemo(() => {
        let result = referrals;
        if (selectedCampaignId !== "ALL") {
            result = result.filter(ref => ref.campaignId === selectedCampaignId);
        }
        if (categoryFilter !== "ALL") {
            result = result.filter(ref => ref.refSource === categoryFilter);
        }
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(ref => 
                (ref.refName && ref.refName.toLowerCase().includes(query)) ||
                (ref.refCity && ref.refCity.toLowerCase().includes(query)) ||
                (ref.refSource && ref.refSource.toLowerCase().includes(query))
            );
        }
        return result;
    }, [referrals, selectedCampaignId, categoryFilter, searchQuery]);

    const sourceTotals = useMemo(() => {
        const totals = {
            "Influencer": 0,
            "Masjid": 0,
            "WhatsappAPI": 0,
            "Email Broadcast": 0,
            "Meta Ads": 0,
            "Direct / Unknown": 0
        };

        const baseReferrals = selectedCampaignId === "ALL" 
            ? referrals 
            : referrals.filter(ref => ref.campaignId === selectedCampaignId);

        baseReferrals.forEach(ref => {
            const src = ref.refSource || "Direct / Unknown";
            if (totals[src] !== undefined) {
                totals[src] += ref.totalRevenue;
            } else {
                totals["Direct / Unknown"] += ref.totalRevenue;
            }
        });

        return totals;
    }, [referrals, selectedCampaignId]);

    const REF_COLORS = {
        "Influencer": "#EC4899",
        "Masjid": "#10B981",
        "WhatsappAPI": "#22C55E",
        "Email Broadcast": "#3B82F6",
        "Meta Ads": "#6366F1",
        "Direct / Unknown": "#94A3B8"
    };

    const chartOption = useMemo(() => {
        const dataKeys = Object.keys(sourceTotals);
        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: '#0F172A',
                borderWidth: 0,
                padding: [8, 12],
                borderRadius: 8,
                textStyle: { color: '#FFFFFF', fontSize: 11 },
                formatter: (params) => `${params.name}: <b>₹${params.value.toLocaleString('en-IN')}</b> (${params.percent}%)`
            },
            series: [{
                name: 'Referral Source',
                type: 'pie',
                radius: ['55%', '80%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                minAngle: 15,
                padAngle: 2,
                itemStyle: { borderRadius: 4 },
                label: { show: false },
                labelLine: { show: false },
                data: dataKeys
                    .filter(key => sourceTotals[key] > 0)
                    .map(key => ({
                        name: key,
                        value: sourceTotals[key],
                        itemStyle: { color: REF_COLORS[key] }
                    })),
                animationType: 'scale',
                animationDuration: 800
            }]
        };
    }, [sourceTotals]);

    const categories = ["ALL", "Influencer", "Masjid", "WhatsappAPI", "Email Broadcast", "Meta Ads"];

    return (
        <Card>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-5 mb-6">
                <div>
                    <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Referral Intelligence</h3>
                    <p className="text-sm text-[#64748B] font-medium">Analyze which channels and partners drive campaign revenue.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-[#64748B]">Active Campaign:</span>
                    <div className="relative">
                        <select
                            value={selectedCampaignId}
                            onChange={(e) => setSelectedCampaignId(e.target.value)}
                            className="appearance-none bg-[#FAFAFA] border border-[#E2E8F0] text-xs font-semibold rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#10B981] cursor-pointer transition-all"
                        >
                            <option value="ALL">All Campaigns</option>
                            {campaigns.map(camp => (
                                <option key={camp._id} value={camp.campaignId?._id || camp._id}>
                                    {camp.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={12} />
                    </div>
                </div>
            </div>

            {isCampaignsLoading || isReferralsLoading ? (
                <LoadingState message="Processing channels breakdown..." />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Visual Segment Share */}
                    <div className="lg:col-span-1 flex flex-col items-center justify-center border-r border-[#F1F5F9] pr-6">
                        <div className="w-full h-[180px]">
                            <ReactEcharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                            {Object.keys(REF_COLORS).map(key => (
                                <div key={key} className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FAFAFA] rounded border border-[#E2E8F0] text-[9px] font-bold text-[#64748B]">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: REF_COLORS[key] }} />
                                    <span>{key === "Direct / Unknown" ? "Direct" : key}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interactive Table Grid */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {/* Table filter actions bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA] p-3 rounded-lg border border-[#E2E8F0]">
                            <div className="flex flex-wrap gap-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                                            categoryFilter === cat
                                                ? "bg-white text-[#10B981] shadow-sm border-[#E2E8F0] font-bold"
                                                : "text-[#64748B] hover:text-[#0F172A] border-transparent hover:bg-[#F1F5F9]"
                                        }`}
                                    >
                                        {cat === "ALL" ? "All" : cat}
                                    </button>
                                ))}
                            </div>

                            <div className="relative flex items-center">
                                <Search className="absolute left-2.5 text-[#94A3B8]" size={12} />
                                <input
                                    type="text"
                                    placeholder="Filter partners, cities..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-44 pl-7 pr-3 py-1 bg-white border border-[#E2E8F0] rounded-md text-xs placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] transition-all"
                                />
                            </div>
                        </div>

                        {/* Data Workspace Table */}
                        <div className="overflow-x-auto max-h-[260px] border border-[#E2E8F0] rounded-lg">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0] sticky top-0 z-10">
                                        <th className="p-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">Source</th>
                                        <th className="p-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">Entity</th>
                                        <th className="p-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">Location</th>
                                        <th className="p-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider text-right">Revenue</th>
                                        <th className="p-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider text-right">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                                    {filteredReferrals.length > 0 ? (
                                        filteredReferrals.map((ref, idx) => (
                                            <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                                                <td className="p-3 font-semibold text-[#334155] flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: REF_COLORS[ref.refSource] || "#94A3B8" }} />
                                                    {ref.refSource}
                                                </td>
                                                <td className="p-3 text-[#334155] font-medium">{ref.refName || "-"}</td>
                                                <td className="p-3 text-[#64748B] font-medium">{ref.refCity || "-"}</td>
                                                <td className="p-3 font-bold text-[#10B981] text-right font-mono">₹{ref.totalRevenue.toLocaleString()}</td>
                                                <td className="p-3 text-[#64748B] font-semibold text-right font-mono">{ref.count}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-0">
                                                <EmptyState message="No matching campaign partner records." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

// ==========================================
// MAIN ENTERPRISE DASHBOARD PORTAL
// ==========================================

export default function DashboardOverview() {
    const router = useRouter();
    const { data: summaryData } = useGetSummaryMetricsQuery();
    const metrics = summaryData?.metrics || {};

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col antialiased text-[#334155]">
            {/* Header: Sticky Glass Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push('/select-portal?category=dashboard')}
                        className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg text-[#64748B] hover:text-[#0F172A] transition-all shadow-sm"
                        aria-label="Navigate back"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-[#0F172A] tracking-tight">True Path Admin Workspace</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Enterprise Analytics</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-[#FAFAFA] border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B]">
                        <Calendar size={13} />
                        <span>Live Sync Enabled</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                        T
                    </div>
                </div>
            </header>

            {/* Main Content Layout Workspace */}
            <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2E8F0] pb-6 gap-4"
                >
                    <div>
                        <h2 className="text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2">
                            Dashboard <span className="text-[#10B981]">Overview</span>
                        </h2>
                        <p className="text-sm text-[#64748B] font-medium max-w-xl">
                            Real-time platform summaries, donor conversion ratios, and partner referral indexes.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-2 rounded-lg text-xs font-bold text-[#059669]">
                        <Sparkles size={14} />
                        <span>Platform verified & secure</span>
                    </div>
                </motion.div>

                {/* 2-Column Responsive Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Column (Main Metrics, Lines Chart) */}
                    <div className="xl:col-span-2 flex flex-col gap-8">
                        {/* 1. Sparkline Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricSparkCard
                                title="Net Donors"
                                value={metrics.totalDonors?.toLocaleString() || "0"}
                                color="#10B981"
                                data={metrics.activeDonorsTrend}
                                darkTheme={true}
                            />
                            <MetricSparkCard
                                title="New Donors"
                                value={metrics.donorLoyalty?.new?.toLocaleString() || "0"}
                                subtext={`Today: +${metrics.donorLoyalty?.todayNewDonors || 0}`}
                                color="#6366F1"
                                data={[30, 45, 35, 50, 40, 60, 50, 70]} 
                            />
                            <MetricSparkCard
                                title="Returning Donors"
                                value={metrics.donorLoyalty?.returning?.toLocaleString() || "0"}
                                color="#F59E0B"
                                data={[20, 35, 30, 45, 40, 55, 60, 80]}
                            />
                            <MetricSparkCard
                                title="Average Gift"
                                value={metrics.avgDonated?.toLocaleString() || "0"}
                                prefix="₹"
                                color="#EC4899"
                                data={[40, 50, 60, 55, 70, 65, 80, 75]}
                            />
                        </div>

                        {/* Donation Trend Line Chart */}
                        <DonationTrendChart />
                    </div>

                    {/* Right Column (Donation Share, Goal Progress) */}
                    <div className="xl:col-span-1 flex flex-col gap-8">
                        {/* Donation Share Donut Chart */}
                        <DonationTypeBreakdown />

                        {/* Target Progress Goal */}
                        <GoalProgress
                            progress={metrics.targetProgress}
                            targetLabel={`₹${(metrics.monthlyDonationCollected / 100000).toFixed(1)}L / ₹${(metrics.monthlyTarget / 100000).toFixed(0)}L`}
                        />
                    </div>
                </div>

                {/* Campaign Referrals breakdowns */}
                <CampaignReferralsSection />

                {/* Activity Heatmap */}
                <ActivityHeatmap />
            </main>
        </div>
    );
}
