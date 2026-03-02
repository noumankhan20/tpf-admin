"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    ArrowLeft,
    TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import ReactEcharts from "echarts-for-react";
import {
    useGetDonationAnalyticsQuery
} from "../../../utils/slices/adminDashboardApiSlice";

const COLORS = {
    ZAKAAT: "#10b981",
    SADAQAH: "#f59e0b",
    LILLAH: "#6366f1",
    IMDAD: "#14b8a6",
};

const DonationTrendChart = () => {
    const [timeRange, setTimeRange] = useState("year");
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
        { key: "ALL", label: "All Donations" },
        { key: "ZAKAAT", label: "Zakaat" },
        { key: "SADAQAH", label: "Sadaqah" },
        { key: "LILLAH", label: "Lillah" },
        { key: "IMDAD", label: "Imdad" },
    ];

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const chartOption = useMemo(() => {
        const labels = trendData.map(item => {
            if (timeRange === 'year') return months[item._id.month - 1].substring(0, 3);
            if (timeRange === 'month' || timeRange === 'week') return `${item._id.day}/${item._id.month}`;
            if (timeRange === 'today') return `${item._id.hour}:00`;
            return "";
        });
        const values = trendData.map(item => item.total);

        return {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderWidth: 0,
                padding: [12, 16],
                borderRadius: 12,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                textStyle: { color: '#1f2937', fontWeight: 600 },
                formatter: function (params) {
                    const value = params[0].value;
                    return `
                        <div style="font-size: 14px; margin-bottom: 4px; color: #6b7280;">${params[0].name}</div>
                        <div style="font-size: 18px; font-weight: 800; color: #10b981;">₹${value.toLocaleString('en-IN')}</div>
                    `;
                }
            },
            grid: {
                top: '10%',
                left: '2%',
                right: '2%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: labels,
                boundaryGap: false,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 12,
                    fontWeight: 600,
                    margin: 15
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#f3f4f6'
                    }
                },
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 12,
                    fontWeight: 600,
                    formatter: (value) => value === 0 ? '0' : `₹${(value / 1000).toFixed(0)}k`
                }
            },
            series: [
                {
                    data: values,
                    type: 'line',
                    smooth: 0.4,
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        color: '#10b981',
                        borderWidth: 3,
                        borderColor: '#fff'
                    },
                    lineStyle: {
                        width: 4,
                        color: '#10b981',
                        shadowBlur: 20,
                        shadowColor: 'rgba(16, 185, 129, 0.3)',
                        shadowOffsetY: 10
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                                { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                            ]
                        }
                    },
                    animationDuration: 1500,
                    animationEasing: 'cubicOut'
                }
            ]
        };
    }, [trendData, timeRange]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 p-8 border border-gray-100"
        >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Donation Trend</h3>
                    <p className="text-lg text-gray-500 font-medium">
                        Platform Volume: <span className="font-black text-emerald-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                        {['today', 'week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeRange === range ? "bg-white text-emerald-600 shadow-md border border-emerald-50" : "text-gray-400 hover:text-gray-900"}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    {timeRange === 'month' && (
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-gray-50 border border-gray-100 text-gray-700 text-sm font-bold rounded-2xl focus:ring-emerald-500 p-3 cursor-pointer outline-none shadow-sm"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="flex justify-end mb-8">
                <div className="relative group">
                    <select
                        value={activeType}
                        onChange={(e) => setActiveType(e.target.value)}
                        className="appearance-none bg-emerald-50/50 border-2 border-emerald-100/50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-2xl focus:ring-emerald-500 block w-52 p-4 pr-10 cursor-pointer shadow-sm outline-none transition-all hover:bg-emerald-50"
                    >
                        {donationTypes.map((type) => (
                            <option key={type.key} value={type.key}>{type.label}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-600">
                        <ChevronDown size={14} strokeWidth={3} />
                    </div>
                </div>
            </div>

            <div className="h-[450px] w-full">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Compiling Analytics...</span>
                    </div>
                ) : (
                    <ReactEcharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                )}
            </div>
        </motion.div>
    );
};

const DonationTypeBreakdown = () => {
    const { data, isLoading } = useGetDonationAnalyticsQuery({
        timeRange: 'year',
        year: new Date().getFullYear(),
        donationType: 'ALL'
    });

    const breakdown = data?.analytics?.breakdown || [];
    const total = breakdown.reduce((acc, curr) => acc + curr.total, 0);

    const chartOption = useMemo(() => {
        const chartData = breakdown.map(item => ({
            name: item._id,
            value: item.total,
            itemStyle: { color: COLORS[item._id] || "#ccc" }
        }));

        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderWidth: 0,
                padding: [12, 16],
                borderRadius: 12,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                textStyle: { color: '#1f2937', fontWeight: 600 },
                formatter: (params) => `
                    <div style="font-size: 14px; margin-bottom: 4px; color: #6b7280;">${params.name}</div>
                    <div style="font-size: 18px; font-weight: 800; color: ${params.color};">₹${params.value.toLocaleString('en-IN')}</div>
                    <div style="font-size: 12px; margin-top: 4px; color: #9ca3af;">${params.percent}% of total volume</div>
                `
            },
            series: [{
                name: 'Donation Type',
                type: 'pie',
                radius: ['55%', '85%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 16,
                    borderColor: '#fff',
                    borderWidth: 6
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 24,
                        fontWeight: 'bold',
                        formatter: '{d}%'
                    },
                    itemStyle: {
                        shadowBlur: 20,
                        shadowColor: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                labelLine: { show: false },
                data: chartData,
                animationType: 'scale',
                animationDuration: 1500,
                animationEasing: 'elasticOut'
            }]
        };
    }, [breakdown]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 p-8 border border-gray-100 h-full flex flex-col"
        >
            <h3 className="text-2xl font-black text-gray-900 mb-8 px-2">Market Share</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 min-h-[400px]">
                        <ReactEcharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {breakdown.map((item) => {
                            const percentage = total ? Math.round((item.total / total) * 100) : 0;
                            return (
                                <div key={item._id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[item._id] || "#ccc" }} />
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-700 transition-colors">{item._id}</span>
                                    </div>
                                    <div className="text-lg font-black text-gray-900">₹{item.total.toLocaleString('en-IN')}</div>
                                    <div className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-500 transition-colors uppercase tracking-widest">{percentage}% Volume</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default function DashboardOverview() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gray-50/50 font-sans flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 shrink-0 shadow-sm sticky top-0 z-50">
                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => router.push('/select-portal?category=dashboard')}
                        className="p-3 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100 text-gray-400 hover:text-emerald-600 shadow-sm hover:shadow-emerald-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Financial Intelligence</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Real-time Analytics Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end px-4 border-r border-gray-100">
                        <span className="text-xs font-black text-gray-900 uppercase">System Status</span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Live Updates
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center text-white">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-8 max-w-[1800px] mx-auto w-full flex flex-col space-y-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Overview <span className="text-emerald-500">& Insights</span></h2>
                    <p className="text-lg text-gray-500 font-medium">Monitoring platform performance and donation metrics across all sectors.</p>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <DonationTrendChart />
                    </div>
                    <div className="xl:col-span-1">
                        <DonationTypeBreakdown />
                    </div>
                </div>
            </main>
        </div>
    );
}
