"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Heart,
    ShieldCheck,
    UserCheck,
    Flag,
    CheckSquare,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Filter,
    Download,
    Bell,
    Search,
    MoreHorizontal,
    DollarSign,
    IndianRupee,
    Activity,
    Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// --- Mock Data ---
const SUMMARY_METRICS = [
    {
        id: 1,
        label: "Total Donors",
        value: "2,543",
        icon: Users,
        route: "/donation-management",
    },
    {
        id: 2,
        label: "Total Donations",
        value: "₹45,23,000",
        icon: IndianRupee,
        route: "/donation-management",
    },
    {
        id: 3,
        label: "Active Campaigns",
        value: "8",
        icon: Flag,
        route: "/campaigns",
    },
    {
        id: 4,
        label: "Pending Tasks",
        value: "24",
        icon: CheckSquare,
        route: "/admin/task-management",
    },
];

const DONATION_DATA_MOCK = [
    { month: "Jan", amount: 45000, users: 120 },
    { month: "Feb", amount: 52000, users: 132 },
    { month: "Mar", amount: 48000, users: 101 },
    { month: "Apr", amount: 61000, users: 154 },
    { month: "May", amount: 55000, users: 142 },
    { month: "Jun", amount: 67000, users: 180 },
    { month: "Jul", amount: 72000, users: 195 },
    { month: "Aug", amount: 69000, users: 178 },
    { month: "Sep", amount: 84000, users: 210 },
    { month: "Oct", amount: 92000, users: 245 },
    { month: "Nov", amount: 88000, users: 230 },
    { month: "Dec", amount: 98000, users: 260 },
];

const MetricCard = ({ metric, index }) => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => router.push(metric.route)}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <metric.icon size={22} className="text-emerald-600" strokeWidth={2} />
                </div>
                <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded ${
                        metric.isPositive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                    }`}
                >
                   
                    {metric.change}
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {metric.value}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                </p>
            </div>
        </motion.div>
    );
};

const ActivityCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const events = {
        "2024-03-05": [
            { id: 1, type: "expense", title: "Office Supplies", time: "10:00 AM", amount: "₹12,000" },
            { id: 2, type: "task", title: "Review Campaign", time: "2:30 PM", assignee: "Ali" },
        ],
        "2024-03-12": [
            { id: 3, type: "donation", title: "Large Donation", time: "11:15 AM", amount: "₹50,000" },
        ],
        "2024-03-15": [
            { id: 4, type: "purchase", title: "New Camera Gear", time: "09:00 AM", amount: "₹1,45,000" },
            { id: 5, type: "admin", title: "New Admin Onboarded", time: "1:00 PM", name: "Zainab" },
            { id: 6, type: "task", title: "Upload Event Photos", time: "4:00 PM", assignee: "Bilal" },
        ],
        "2024-03-22": [
            { id: 7, type: "campaign", title: "Ramadan Drive Launch", time: "9:00 AM" },
        ],
    };

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
        const dateStr = `2024-03-${String(day).padStart(2, "0")}`;
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
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden"
        >
            {/* Calendar Header */}
            <div className="p-5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CalendarIcon size={20} className="text-gray-600" />
                        Activity Schedule
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-semibold text-gray-700 w-32 text-center">
                            {monthName} {year}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[600px]">
                {/* Calendar Grid */}
                <div className="flex-1 p-5 border-r border-gray-200 overflow-y-auto">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-3">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty Previous Days */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-gray-50 rounded-lg min-h-[85px]" />
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
                                        bg-white rounded-lg border min-h-[85px] p-2.5 cursor-pointer transition-all
                                        ${isSelected 
                                            ? "border-emerald-500 bg-emerald-50 shadow-md" 
                                            : "border-gray-200 hover:border-emerald-300 hover:shadow-sm"}
                                    `}
                                >
                                    <span
                                        className={`
                                            text-xs font-semibold w-6 h-6 flex items-center justify-center rounded mb-2
                                            ${isToday ? "bg-emerald-600 text-white" : "text-gray-700"}
                                        `}
                                    >
                                        {day}
                                    </span>

                                    <div className="space-y-1">
                                        {dailyEvents.slice(0, 2).map((ev, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${getTypeColor(ev.type)} flex-shrink-0`} />
                                                <span className="text-[10px] font-medium text-gray-600 truncate">{ev.title}</span>
                                            </div>
                                        ))}
                                        {dailyEvents.length > 2 && (
                                            <span className="text-[9px] font-semibold text-emerald-600 pl-2 block">+{dailyEvents.length - 2}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed List Panel */}
                <div className="w-full lg:w-80 bg-gray-50 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-gray-900">
                                {selectedDay ? `${monthName} ${selectedDay}, ${year}` : "Select a date"}
                            </h4>
                            {selectedDay && (
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedDay ? (
                            getDayEvents(selectedDay).length > 0 ? (
                                getDayEvents(selectedDay).map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded ${getTypeBadge(event.type)}`}>
                                                {event.type}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">{event.time}</span>
                                        </div>
                                        <h5 className="font-semibold text-gray-900 mb-1">{event.title}</h5>
                                        {event.amount && (
                                            <p className="text-sm font-semibold text-emerald-600">{event.amount}</p>
                                        )}
                                        {event.assignee && (
                                            <p className="text-sm text-gray-600">Assignee: <span className="font-medium">{event.assignee}</span></p>
                                        )}
                                        {event.name && (
                                            <p className="text-sm text-gray-600">Name: <span className="font-medium">{event.name}</span></p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarIcon size={32} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">No events scheduled</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12">
                                <CalendarIcon size={32} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-600">Select a date</p>
                                <p className="text-xs text-gray-500 mt-1">Click any day to view events</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">Welcome back! Here's your overview</p>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {SUMMARY_METRICS.map((metric, index) => (
                        <MetricCard key={metric.id} metric={metric} index={index} />
                    ))}
                </div>

                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Activity size={20} className="text-gray-600" />
                            Donation Trends
                        </h3>
                        <button className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            View Details
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={DONATION_DATA_MOCK}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: 12 }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Calendar */}
                <ActivityCalendar />
            </div>
        </div>
    );
}