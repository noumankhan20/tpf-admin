"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Flag,
    CheckSquare,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    IndianRupee,
    UserCog,
    HeartHandshake,
    TrendingUp,
    Download,
    BarChart3,
    ArrowUpRight,
    ArrowLeft,
    ChevronDown,
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
import { useGetCalendarEventsQuery } from "../../../utils/slices/adminDashboardApiSlice";

// --- Mock Data ---
const SUMMARY_METRICS = [
    {
        id: 1,
        label: "Total Donors",
        value: "2,543",
        icon: Users,
        route: "/donation-management/offline-donation",
        gradient: "from-blue-500 to-blue-600",
    },
    {
        id: 2,
        label: "Total Donation Collected",
        value: "₹45,23,000",
        icon: IndianRupee,
        route: "/donation-management",
        gradient: "from-emerald-500 to-emerald-600",
    },
    {
        id: 3,
        label: "Total Admins",
        value: "12",
        icon: UserCog,
        route: "/add-admin",
        gradient: "from-purple-500 to-purple-600",
    },
    {
        id: 4,
        label: "Total Volunteers",
        value: "87",
        icon: HeartHandshake,
        route: "/admin/volunteers",
        gradient: "from-amber-500 to-amber-600",
    },
    {
        id: 5,
        label: "Total Campaigns",
        value: "8",
        icon: Flag,
        route: "/campaigns",
        gradient: "from-pink-500 to-pink-600",
    },
    {
        id: 6,
        label: "Total Pending Tasks",
        value: "24",
        icon: CheckSquare,
        route: "/admin/task-management",
        gradient: "from-teal-500 to-teal-600",
    },
];

const DONATION_DATA_CURRENT_YEAR = [
    { month: "Jan", Zakaat: 145000, Imdaad: 52000, Lillah: 38000 },
    { month: "Feb", Zakaat: 152000, Imdaad: 48000, Lillah: 42000 },
    { month: "Mar", Zakaat: 148000, Imdaad: 61000, Lillah: 45000 },
    { month: "Apr", Zakaat: 161000, Imdaad: 55000, Lillah: 48000 },
    { month: "May", Zakaat: 175000, Imdaad: 67000, Lillah: 52000 },
    { month: "Jun", Zakaat: 182000, Imdaad: 72000, Lillah: 58000 },
    { month: "Jul", Zakaat: 192000, Imdaad: 69000, Lillah: 61000 },
    { month: "Aug", Zakaat: 184000, Imdaad: 84000, Lillah: 55000 },
    { month: "Sep", Zakaat: 198000, Imdaad: 92000, Lillah: 68000 },
    { month: "Oct", Zakaat: 205000, Imdaad: 88000, Lillah: 72000 },
    { month: "Nov", Zakaat: 212000, Imdaad: 98000, Lillah: 75000 },
    { month: "Dec", Zakaat: 225000, Imdaad: 105000, Lillah: 82000 },
];

const DONATION_DATA_PREVIOUS_YEAR = [
    { month: "Jan", Zakaat: 125000, Imdaad: 42000, Lillah: 28000 },
    { month: "Feb", Zakaat: 132000, Imdaad: 38000, Lillah: 32000 },
    { month: "Mar", Zakaat: 128000, Imdaad: 51000, Lillah: 35000 },
    { month: "Apr", Zakaat: 141000, Imdaad: 45000, Lillah: 38000 },
    { month: "May", Zakaat: 155000, Imdaad: 57000, Lillah: 42000 },
    { month: "Jun", Zakaat: 162000, Imdaad: 62000, Lillah: 48000 },
    { month: "Jul", Zakaat: 172000, Imdaad: 59000, Lillah: 51000 },
    { month: "Aug", Zakaat: 164000, Imdaad: 74000, Lillah: 45000 },
    { month: "Sep", Zakaat: 178000, Imdaad: 82000, Lillah: 58000 },
    { month: "Oct", Zakaat: 185000, Imdaad: 78000, Lillah: 62000 },
    { month: "Nov", Zakaat: 192000, Imdaad: 88000, Lillah: 65000 },
    { month: "Dec", Zakaat: 205000, Imdaad: 95000, Lillah: 72000 },
];

const DONATION_TYPE_DISTRIBUTION = [
    { name: "Zakaat", value: 2150000, percentage: 58 },
    { name: "Imdaad", value: 892000, percentage: 24 },
    { name: "Lillah", value: 668000, percentage: 18 },
];

const COLORS = {
    Zakaat: "#10b981",
    Imdaad: "#14b8a6",
    Lillah: "#6366f1",
};

const MetricCard = ({ metric, index }) => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => router.push(metric.route)}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
        >
            {/* Animated gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            {/* Top gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.gradient}`} />

            <div className="relative z-10">
                {/* Icon and Arrow */}
                <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <metric.icon size={24} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-md`}>
                            <ArrowUpRight size={16} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* Value and Label */}
                <div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                        {metric.value}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {metric.label}
                    </p>
                </div>
            </div>

            {/* Subtle pattern overlay */}
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
                <div className={`w-full h-full bg-gradient-to-br ${metric.gradient} rounded-full blur-2xl`} />
            </div>
        </motion.div>
    );
};

const DonationTrendChart = () => {
    const [selectedFilter, setSelectedFilter] = useState("current");
    const [activeType, setActiveType] = useState("Zakaat");

    const getCurrentData = () => {
        return selectedFilter === "current" ? DONATION_DATA_CURRENT_YEAR : DONATION_DATA_PREVIOUS_YEAR;
    };

    const chartData = getCurrentData();

    const calculateTotal = () => {
        return chartData.reduce((acc, month) => {
            acc += month[activeType] || 0;
            return acc;
        }, 0);
    };

    const donationTypes = [
        { key: "Zakaat", color: "#10b981", label: "Zakaat" },
        { key: "Imdaad", color: "#14b8a6", label: "Imdaad" },
        { key: "Lillah", color: "#6366f1", label: "Lillah" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                        Donation Trend
                    </h3>
                    <p className="text-lg text-gray-600">
                        Total: <span className="font-black text-emerald-600">₹{(calculateTotal() / 100000).toFixed(2)}L</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Year filter */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5">
                        <button
                            onClick={() => setSelectedFilter("current")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedFilter === "current"
                                ? "bg-white text-emerald-600 shadow-md"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Current FY
                        </button>
                        <button
                            onClick={() => setSelectedFilter("previous")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedFilter === "previous"
                                ? "bg-white text-emerald-600 shadow-md"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Previous FY
                        </button>
                    </div>

                    {/* Download button */}
                    <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg">
                        <Download size={18} strokeWidth={2.5} />
                        Export
                    </button>
                </div>
            </div>

            {/* Type filters - Dropdown */}
            <div className="flex justify-end mb-8">
                <div className="relative">
                    <select
                        value={activeType}
                        onChange={(e) => setActiveType(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-48 p-3 pr-8 cursor-pointer shadow-sm outline-none transition-all hover:bg-gray-100"
                    >
                        {donationTypes.map((type) => (
                            <option key={type.key} value={type.key}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <ChevronDown size={16} strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={420}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}

                >
                    <defs>
                        <linearGradient id="colorZakaat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorImdaad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorLillah" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        style={{ fontSize: 13, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: 13, fontWeight: 600 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            padding: "16px 20px",
                            backdropFilter: "blur(10px)"
                        }}
                        itemStyle={{
                            color: '#111827',
                            fontWeight: 700,
                            fontSize: '14px',
                            padding: '4px 0'
                        }}
                        formatter={(value, name) => [`₹${value.toLocaleString('en-IN')}`, name]}
                        labelStyle={{
                            fontWeight: 800,
                            marginBottom: 12,
                            color: '#111827',
                            fontSize: '15px',
                            borderBottom: '2px solid #e5e7eb',
                            paddingBottom: '8px'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey={activeType}
                        stroke={COLORS[activeType]}
                        strokeWidth={4}
                        fillOpacity={1}
                        fill={`url(#color${activeType})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

const DonationTypeBreakdown = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-full"
        >
            <h3 className="text-2xl font-black text-gray-900 mb-8">
                Donation by Type
            </h3>

            {/* Responsive layout */}
            <div className="flex flex-col items-center">
                {/* Pie Chart and Labels Around */}
                <div className="relative w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                            <Pie
                                data={DONATION_TYPE_DISTRIBUTION}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                label={({
                                    cx,
                                    cy,
                                    midAngle,
                                    innerRadius,
                                    outerRadius,
                                    value,
                                    index,
                                    name
                                }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = outerRadius + 30;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    const item = DONATION_TYPE_DISTRIBUTION[index];

                                    return (
                                        <g>
                                            <text
                                                x={x}
                                                y={y}
                                                fill={COLORS[name]}
                                                textAnchor={x > cx ? "start" : "end"}
                                                dominantBaseline="central"
                                                className="text-sm font-black"
                                            >
                                                {name}
                                            </text>
                                            <text
                                                x={x}
                                                y={y + 18}
                                                fill="#6b7280"
                                                textAnchor={x > cx ? "start" : "end"}
                                                dominantBaseline="central"
                                                className="text-xs font-bold"
                                            >
                                                ₹{(item.value / 100000).toFixed(2)}L ({item.percentage}%)
                                            </text>
                                        </g>
                                    );
                                }}
                                labelLine={{
                                    stroke: '#e5e7eb',
                                    strokeWidth: 2,
                                }}
                            >
                                {DONATION_TYPE_DISTRIBUTION.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="none" />
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

                {/* Legend - Simplified for better flow */}
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                    {DONATION_TYPE_DISTRIBUTION.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: COLORS[item.name] }}
                            />
                            <span className="text-sm font-bold text-gray-700">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const ActivityCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const { data: eventsData, isLoading } = useGetCalendarEventsQuery({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
    });

    const events = eventsData?.events || {};

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(null);
    };

    const getDayEvents = (day) => {
        const yearStr = currentDate.getFullYear();
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
        return events[dateStr] || [];
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "expense": return "bg-red-500";
            case "donation": return "bg-emerald-500";
            case "task": return "bg-blue-500";
            case "purchase": return "bg-amber-500";
            case "admin": return "bg-purple-500";
            case "campaign": return "bg-teal-500";
            default: return "bg-gray-400";
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case "expense": return "bg-red-50 text-red-700 border border-red-200";
            case "donation": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "task": return "bg-blue-50 text-blue-700 border border-blue-200";
            case "purchase": return "bg-amber-50 text-amber-700 border border-amber-200";
            case "admin": return "bg-purple-50 text-purple-700 border border-purple-200";
            case "campaign": return "bg-teal-50 text-teal-700 border border-teal-200";
            default: return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden"
        >
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <CalendarIcon size={28} className="text-emerald-600" />
                        Activity Calendar
                    </h3>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <span className="text-base font-black text-gray-700 w-36 text-center">
                            {monthName} {year}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        >
                            <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[600px]">
                {/* Calendar Grid */}
                <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-4">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="text-center text-xs font-black text-gray-500 uppercase py-3">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty Previous Days */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-gray-50 rounded-xl min-h-[90px]" />
                        ))}

                        {/* Actual Days */}
                        {Array.from({ length: days }).map((_, i) => {
                            const day = i + 1;
                            const dailyEvents = getDayEvents(day);
                            const isSelected = selectedDay === day;
                            const isToday = day === new Date().getDate() && monthName === new Date().toLocaleString("default", { month: "long" });

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`
                                        bg-white rounded-xl border-2 min-h-[90px] p-3 cursor-pointer transition-all
                                        ${isSelected
                                            ? "border-emerald-500 bg-emerald-50 shadow-lg"
                                            : "border-gray-200 hover:border-emerald-300 hover:shadow-md"}
                                    `}
                                >
                                    <span
                                        className={`
                                            text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg mb-2
                                            ${isToday ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md" : "text-gray-700"}
                                        `}
                                    >
                                        {day}
                                    </span>

                                    <div className="space-y-1.5">
                                        {dailyEvents.slice(0, 2).map((ev, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getTypeColor(ev.type)} flex-shrink-0`} />
                                                <span className="text-[10px] font-semibold text-gray-600 truncate">{ev.title}</span>
                                            </div>
                                        ))}
                                        {dailyEvents.length > 2 && (
                                            <span className="text-[10px] font-black text-emerald-600 pl-4 block">+{dailyEvents.length - 2}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed List Panel */}
                <div className="w-full lg:w-96 bg-gray-50 flex flex-col">
                    <div className="p-5 border-b border-gray-200 bg-white">
                        <div className="flex justify-between items-center">
                            <h4 className="text-base font-black text-gray-900">
                                {selectedDay ? `${monthName} ${selectedDay}, ${year}` : "Select a date"}
                            </h4>
                            {selectedDay && (
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {selectedDay ? (
                            getDayEvents(selectedDay).length > 0 ? (
                                getDayEvents(selectedDay).map((event) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${getTypeBadge(event.type)}`}>
                                                {event.type}
                                            </span>
                                            <span className="text-xs text-gray-500 font-semibold">{event.time}</span>
                                        </div>
                                        <h5 className="font-black text-gray-900 mb-2">{event.title}</h5>
                                        {event.amount && (
                                            <p className="text-sm font-black text-emerald-600">{event.amount}</p>
                                        )}
                                        {event.assignee && (
                                            <p className="text-sm text-gray-600">Assignee: <span className="font-bold">{event.assignee}</span></p>
                                        )}
                                        {event.name && (
                                            <p className="text-sm text-gray-600">Name: <span className="font-bold">{event.name}</span></p>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <CalendarIcon size={48} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-sm font-semibold text-gray-500">No events scheduled</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-16">
                                <CalendarIcon size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-base font-bold text-gray-600 mb-1">Select a date</p>
                                <p className="text-xs text-gray-500">Click any day to view events</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function AdminDashboard() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-10"
                >
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 group-hover:border-emerald-500 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
                            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:text-emerald-600" />
                        </div>
                        <span className="font-bold text-sm">Back</span>
                    </button>

                    <h1 className="text-4xl font-black text-gray-900 mb-2">
                        TPF Admin Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 font-semibold">
                        Executive overview and donation analytics
                    </p>
                </motion.div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
                    {SUMMARY_METRICS.map((metric, index) => (
                        <MetricCard key={metric.id} metric={metric} index={index} />
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
                    <div className="xl:col-span-2">
                        <DonationTrendChart />
                    </div>
                    <div className="xl:col-span-1">
                        <DonationTypeBreakdown />
                    </div>
                </div>

                {/* Activity Calendar */}
                <ActivityCalendar />
            </div>
        </div>
    );
}