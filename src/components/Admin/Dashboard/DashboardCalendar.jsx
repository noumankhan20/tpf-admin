"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    X,
    Clock,
    Sparkles,
    TrendingUp,
    Users,
    ShoppingCart,
    Briefcase,
    Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetCalendarEventsQuery
} from "../../../utils/slices/adminDashboardApiSlice";

const ActivityCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);

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

    const getTypeIcon = (type) => {
        switch (type) {
            case "expense": return TrendingUp;
            case "task": return Target;
            case "purchase": return ShoppingCart;
            case "admin": return Users;
            case "campaign": return Briefcase;
            default: return Sparkles;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "expense": return { bg: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600", border: "border-rose-200" };
            case "task": return { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" };
            case "purchase": return { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600", border: "border-amber-200" };
            case "admin": return { bg: "bg-violet-500", light: "bg-violet-100", text: "text-violet-600", border: "border-violet-200" };
            case "campaign": return { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600", border: "border-teal-200" };
            default: return { bg: "bg-gray-500", light: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
        }
    };

    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

    // Calculate monthly stats
    const monthlyStats = useMemo(() => {
        let totalEvents = 0;
        let eventTypes = {};
        Object.values(events).forEach(dayEvents => {
            totalEvents += dayEvents.length;
            dayEvents.forEach(event => {
                eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
            });
        });
        return { totalEvents, eventTypes };
    }, [events]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Calendar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="xl:col-span-3 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden"
            >
                {/* Calendar Header */}
                <div className="relative px-8 py-8 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500" />
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                    </div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                                <CalendarIcon size={28} className="text-white" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tight">
                                    {monthName}
                                </h3>
                                <p className="text-emerald-100 text-lg font-medium">{year}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePrevMonth}
                                className="w-12 h-12 bg-white/10 hover:bg-white/25 backdrop-blur-xl rounded-xl transition-all text-white flex items-center justify-center border border-white/20"
                            >
                                <ChevronLeft size={22} strokeWidth={2.5} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentDate(new Date())}
                                className="px-5 h-12 bg-white/10 hover:bg-white/25 backdrop-blur-xl rounded-xl transition-all text-white text-sm font-bold border border-white/20"
                            >
                                Today
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextMonth}
                                className="w-12 h-12 bg-white/10 hover:bg-white/25 backdrop-blur-xl rounded-xl transition-all text-white flex items-center justify-center border border-white/20"
                            >
                                <ChevronRight size={22} strokeWidth={2.5} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, idx) => (
                            <div key={day} className="text-center py-3">
                                <span className={`text-xs font-black tracking-widest ${idx === 0 || idx === 6 ? 'text-gray-300' : 'text-gray-400'}`}>
                                    {day}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-[4/3]" />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: days }).map((_, i) => {
                            const day = i + 1;
                            const dailyEvents = getDayEvents(day);
                            const isSelected = selectedDay === day;
                            const isToday = isCurrentMonth && day === today.getDate();
                            const isHovered = hoveredDay === day;
                            const isWeekend = (firstDay + i) % 7 === 0 || (firstDay + i) % 7 === 6;

                            return (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.01 }}
                                    onMouseEnter={() => setHoveredDay(day)}
                                    onMouseLeave={() => setHoveredDay(null)}
                                    onClick={() => setSelectedDay(isSelected ? null : day)}
                                    className={`
                                        relative aspect-[4/3] rounded-2xl p-3 cursor-pointer transition-all duration-200
                                        ${isToday
                                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-300/40"
                                            : isSelected
                                                ? "bg-emerald-50 ring-2 ring-emerald-500 ring-offset-2"
                                                : isHovered
                                                    ? "bg-gray-50 shadow-md"
                                                    : dailyEvents.length > 0
                                                        ? "bg-gray-50/80"
                                                        : "bg-white hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {/* Day Number */}
                                    <div className="flex items-start justify-between">
                                        <span className={`
                                            text-lg font-black transition-colors
                                            ${isToday ? "text-white" : isWeekend ? "text-gray-300" : "text-gray-800"}
                                        `}>
                                            {day}
                                        </span>

                                        {dailyEvents.length > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`
                                                    w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
                                                    ${isToday ? "bg-white/30 text-white" : "bg-emerald-500 text-white"}
                                                `}
                                            >
                                                {dailyEvents.length}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Event Dots */}
                                    {dailyEvents.length > 0 && (
                                        <div className="flex items-center gap-1 mt-2">
                                            {dailyEvents.slice(0, 4).map((ev, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`w-2 h-2 rounded-full ${isToday ? "bg-white/60" : getTypeColor(ev.type).bg}`}
                                                />
                                            ))}
                                            {dailyEvents.length > 4 && (
                                                <span className={`text-[9px] font-bold ${isToday ? "text-white/70" : "text-gray-400"}`}>
                                                    +{dailyEvents.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="xl:col-span-1 space-y-6"
            >
                {/* Month Stats */}
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-emerald-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Sparkles size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">This Month</p>
                            <p className="text-2xl font-black text-gray-900">{monthlyStats.totalEvents} Events</p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {Object.entries(monthlyStats.eventTypes).slice(0, 4).map(([type, count]) => {
                            const colors = getTypeColor(type);
                            const Icon = getTypeIcon(type);
                            return (
                                <div key={type} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 ${colors.light} rounded-lg flex items-center justify-center`}>
                                            <Icon size={14} className={colors.text} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 capitalize">{type}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Preview */}
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">
                        {selectedDay ? `${monthName} ${selectedDay}` : "Select a Date"}
                    </h4>

                    {selectedDay ? (
                        getDayEvents(selectedDay).length > 0 ? (
                            <div className="space-y-3">
                                {getDayEvents(selectedDay).slice(0, 3).map((event, idx) => {
                                    const colors = getTypeColor(event.type);
                                    const Icon = getTypeIcon(event.type);
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-2xl ${colors.light} border ${colors.border}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon size={14} className={colors.text} />
                                                <span className={`text-xs font-black uppercase ${colors.text}`}>{event.type}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 truncate">{event.title}</p>
                                        </motion.div>
                                    );
                                })}
                                {getDayEvents(selectedDay).length > 3 && (
                                    <p className="text-center text-sm text-gray-500 font-semibold">
                                        +{getDayEvents(selectedDay).length - 3} more events
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CalendarIcon size={28} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-bold text-gray-400">No events</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarIcon size={28} className="text-emerald-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">Click a date to view</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Full Event Modal */}
            <AnimatePresence>
                {selectedDay && getDayEvents(selectedDay).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedDay(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="relative px-8 py-8 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500" />
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
                                </div>

                                <div className="relative flex justify-between items-start">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">Events for</p>
                                        <h4 className="text-3xl font-black text-white">
                                            {monthName} {selectedDay}, {year}
                                        </h4>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelectedDay(null)}
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white flex items-center justify-center"
                                    >
                                        <X size={20} strokeWidth={2.5} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 overflow-y-auto max-h-[calc(90vh-160px)]">
                                <div className="space-y-4">
                                    {getDayEvents(selectedDay).map((event, idx) => {
                                        const colors = getTypeColor(event.type);
                                        const Icon = getTypeIcon(event.type);
                                        return (
                                            <motion.div
                                                key={event.id || idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`p-6 rounded-2xl ${colors.light} border-2 ${colors.border} hover:shadow-lg transition-shadow`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
                                                            <Icon size={20} className="text-white" />
                                                        </div>
                                                        <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg ${colors.bg} text-white`}>
                                                            {event.type}
                                                        </span>
                                                    </div>
                                                    {event.time && (
                                                        <div className="flex items-center gap-2 text-gray-500 bg-white px-3 py-1.5 rounded-lg">
                                                            <Clock size={14} />
                                                            <span className="text-sm font-bold">{event.time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <h5 className="text-xl font-black text-gray-900 mb-3">{event.title}</h5>
                                                {(event.assignee || event.name) && (
                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        {event.assignee && (
                                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl">
                                                                <Users size={14} className="text-gray-400" />
                                                                <span className="text-gray-500 font-medium">Assignee:</span>
                                                                <span className="font-bold text-gray-900">{event.assignee}</span>
                                                            </div>
                                                        )}
                                                        {event.name && (
                                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl">
                                                                <span className="text-gray-500 font-medium">Name:</span>
                                                                <span className="font-bold text-gray-900">{event.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function DashboardCalendar() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-emerald-50/50 p-6 lg:p-10">
            <div className="max-w-[1600px] mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 flex items-center justify-center transition-all shadow-sm group-hover:shadow-lg">
                            <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:text-emerald-600" />
                        </div>
                        <span className="font-bold text-lg">Back to Dashboard</span>
                    </motion.button>
                    <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tight">
                        Calendar
                    </h1>
                    <p className="text-xl text-gray-500 font-medium">
                        Track your activities, tasks, and events in one place
                    </p>
                </motion.div>
                <ActivityCalendar />
            </div>
        </div>
    );
}
