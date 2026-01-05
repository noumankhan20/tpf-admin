"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    ArrowLeft,
    TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    PieChart as RechartPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
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

    const formattedData = trendData.map(item => {
        let label = "";
        if (timeRange === 'year') {
            label = months[item._id.month - 1].substring(0, 3);
        } else if (timeRange === 'month' || timeRange === 'week') {
            label = `${item._id.day}/${item._id.month}`;
        } else if (timeRange === 'today') {
            label = `${item._id.hour}:00`;
        }
        return {
            ...item,
            label,
            value: item.total
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
        >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Donation Trend</h3>
                    <p className="text-lg text-gray-600">
                        Total: <span className="font-black text-emerald-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5 overflow-x-auto">
                        {['today', 'week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${timeRange === range ? "bg-white text-emerald-600 shadow-md" : "text-gray-600 hover:text-gray-900"}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    {timeRange === 'month' && (
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-gray-100 border-none text-gray-700 text-sm font-bold rounded-xl focus:ring-emerald-500 p-2.5 cursor-pointer"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="flex justify-end mb-8">
                <div className="relative">
                    <select
                        value={activeType}
                        onChange={(e) => setActiveType(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-48 p-3 pr-8 cursor-pointer shadow-sm outline-none transition-all hover:bg-gray-100"
                    >
                        {donationTypes.map((type) => (
                            <option key={type.key} value={type.key}>{type.label}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <ChevronDown size={16} strokeWidth={3} />
                    </div>
                </div>
            </div>

            <div className="h-[420px] w-full">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-400">Loading Chart...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: 13, fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: 13, fontWeight: 600 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "16px",
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                    padding: "16px 20px",
                                    backdropFilter: "blur(10px)"
                                }}
                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, activeType]}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
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

    const formattedBreakdown = breakdown.map(item => ({
        name: item._id,
        value: item.total,
        percentage: total ? Math.round((item.total / total) * 100) : 0
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-full"
        >
            <h3 className="text-2xl font-black text-gray-900 mb-8">Donation by Type</h3>
            {isLoading ? (
                <div className="h-[400px] flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="relative w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartPieChart>
                                <Pie
                                    data={formattedBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {formattedBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#ccc"} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "none",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                        padding: "12px",
                                    }}
                                />
                            </RechartPieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 mt-8">
                        {formattedBreakdown.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[item.name] || "#ccc" }} />
                                <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                <span className="text-xs text-gray-500">({item.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default function DashboardOverview() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
            <div className="max-w-[1800px] mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
                            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:text-emerald-600" />
                        </div>
                        <span className="font-bold text-sm">Back</span>
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
                    <p className="text-lg text-gray-600 font-semibold">Detailed charts and donation analytics</p>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                        <DonationTrendChart />
                    </div>
                    <div className="xl:col-span-1">
                        <DonationTypeBreakdown />
                    </div>
                </div>
            </div>
        </div>
    );
}
