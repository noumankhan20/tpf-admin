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
    TrendingUp,
    Users,
    ShoppingCart,
    Briefcase,
    Target,
    Zap,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetCalendarEventsQuery,
    useAddMeetingMutation
} from "../../../utils/slices/adminDashboardApiSlice";

const TYPE_CONFIG = {
    expense:  { color: "#EF4444", bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", icon: TrendingUp,   label: "Expense"  },
    task:     { color: "#3B82F6", bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", icon: Target,       label: "Task"     },
    purchase: { color: "#F59E0B", bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", icon: ShoppingCart, label: "Purchase" },
    admin:    { color: "#8B5CF6", bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE", icon: Users,        label: "Admin"    },
    campaign: { color: "#10B981", bg: "#F0FDF4", text: "#059669", border: "#A7F3D0", icon: Briefcase,    label: "Campaign" },
    meeting:  { color: "#D946EF", bg: "#FDF4FF", text: "#C026D3", border: "#F5D0FE", icon: CalendarIcon, label: "Meeting"  },
    default:  { color: "#6B7280", bg: "#F9FAFB", text: "#4B5563", border: "#E5E7EB", icon: Zap,          label: "Event"    },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ActivityCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [meetingForm, setMeetingForm] = useState({
        title: "",
        date: "",
        time: "",
        link: "",
        description: "",
        participants: "",
    });

    const { data: eventsData, isLoading, refetch } = useGetCalendarEventsQuery({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
    });

    const [addMeeting, { isLoading: isCreatingMeeting }] = useAddMeetingMutation();

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

    const today = new Date();
    const isCurrentMonth =
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

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
        return events[`${yearStr}-${monthStr}-${dayStr}`] || [];
    };

    const monthlyStats = useMemo(() => {
        let totalEvents = 0;
        const eventTypes = {};
        Object.values(events).forEach((dayEvents) => {
            totalEvents += dayEvents.length;
            dayEvents.forEach((event) => {
                eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
            });
        });
        return { totalEvents, eventTypes };
    }, [events]);

    const handleOpenMeetingModal = () => {
        let dateStr = "";
        if (selectedDay) {
            const yearStr = currentDate.getFullYear();
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, "0");
            const dayStr = String(selectedDay).padStart(2, "0");
            dateStr = `${yearStr}-${monthStr}-${dayStr}`;
        } else {
            const today = new Date();
            dateStr = today.toISOString().split("T")[0];
        }
        setMeetingForm({
            title: "",
            date: dateStr,
            time: "",
            link: "",
            description: "",
            participants: "",
        });
        setIsMeetingModalOpen(true);
    };

    const handleMeetingSubmit = async (e) => {
        e.preventDefault();
        try {
            await addMeeting(meetingForm).unwrap();
            setIsMeetingModalOpen(false);
            refetch();
        } catch (err) {
            console.error("Failed to schedule meeting:", err);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            {/* ── Main Calendar ── */}
            <div className="xl:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Calendar Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                            <CalendarIcon size={15} className="text-gray-500" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">
                                {monthName} <span className="text-gray-400 font-normal">{year}</span>
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleOpenMeetingModal}
                            className="px-3 h-8 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                        >
                            + Add Meeting
                        </button>
                        <button
                            onClick={handlePrevMonth}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        >
                            <ChevronLeft size={15} strokeWidth={2} />
                        </button>
                        <button
                            onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }}
                            className="px-3 h-8 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        >
                            <ChevronRight size={15} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {WEEKDAYS.map((day, idx) => (
                        <div
                            key={day}
                            className={`py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider ${
                                idx === 0 || idx === 6 ? "text-gray-300" : "text-gray-400"
                            }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="p-3">
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty leading cells */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: days }).map((_, i) => {
                            const day = i + 1;
                            const dailyEvents = getDayEvents(day);
                            const isSelected = selectedDay === day;
                            const isToday = isCurrentMonth && day === today.getDate();
                            const hasEvents = dailyEvents.length > 0;
                            const isWeekend = (firstDay + i) % 7 === 0 || (firstDay + i) % 7 === 6;

                            // Collect unique types for dots
                            const uniqueTypes = [...new Set(dailyEvents.map(e => e.type))].slice(0, 3);

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(isSelected ? null : day)}
                                    className={`
                                        relative aspect-square rounded-lg flex flex-col items-center justify-start pt-2 pb-1 px-1 cursor-pointer transition-all duration-150 group
                                        ${isToday
                                            ? "bg-gray-900 text-white"
                                            : isSelected
                                                ? "bg-gray-100 ring-1 ring-gray-300"
                                                : hasEvents
                                                    ? "hover:bg-gray-50 text-gray-800"
                                                    : "hover:bg-gray-50 text-gray-700"
                                        }
                                        ${isWeekend && !isToday && !isSelected ? "text-gray-400" : ""}
                                    `}
                                >
                                    <span className={`text-sm font-semibold leading-none ${isToday ? "text-white" : ""}`}>
                                        {day}
                                    </span>

                                    {/* Event indicator dots */}
                                    {hasEvents && (
                                        <div className="flex items-center gap-0.5 mt-1.5">
                                            {uniqueTypes.map((type, idx) => {
                                                const cfg = getTypeConfig(type);
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                        style={{
                                                            backgroundColor: isToday ? "rgba(255,255,255,0.7)" : cfg.color
                                                        }}
                                                    />
                                                );
                                            })}
                                            {dailyEvents.length > 3 && (
                                                <span className={`text-[9px] font-bold ml-0.5 ${isToday ? "text-white/70" : "text-gray-400"}`}>
                                                    +{dailyEvents.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading overlay */}
                {isLoading && (
                    <div className="px-4 pb-4">
                        <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-300 animate-pulse rounded-full w-2/3" />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Sidebar ── */}
            <div className="xl:col-span-1 flex flex-col gap-4">
                {/* Month Stats */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">This Month</p>
                        <span className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                            {monthlyStats.totalEvents} events
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {Object.entries(monthlyStats.eventTypes).length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">No events this month</p>
                        ) : (
                            Object.entries(monthlyStats.eventTypes).slice(0, 6).map(([type, count]) => {
                                const cfg = getTypeConfig(type);
                                const Icon = cfg.icon;
                                return (
                                    <div key={type} className="flex items-center justify-between py-1.5">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: cfg.bg }}
                                            >
                                                <Icon size={12} style={{ color: cfg.text }} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 capitalize">{type}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">{count}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Selected Day Preview */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {selectedDay ? `${monthName} ${selectedDay}` : "No Date Selected"}
                        </p>
                        {selectedDay && getDayEvents(selectedDay).length > 0 && (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                                {getDayEvents(selectedDay).length}
                            </span>
                        )}
                    </div>

                    {selectedDay ? (
                        getDayEvents(selectedDay).length > 0 ? (
                            <div className="space-y-2">
                                {getDayEvents(selectedDay).slice(0, 4).map((event, idx) => {
                                    const cfg = getTypeConfig(event.type);
                                    const Icon = cfg.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="flex flex-col p-2.5 rounded-lg border transition-colors"
                                            style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div
                                                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: cfg.color + "20" }}
                                                >
                                                    <Icon size={11} style={{ color: cfg.text }} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{event.title}</p>
                                                    <p className="text-[10px] capitalize mt-0.5" style={{ color: cfg.text }}>{event.type}</p>
                                                    {event.link && (
                                                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline block mt-1.5 font-bold">
                                                            Join Meeting
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {getDayEvents(selectedDay).length > 4 && (
                                    <p className="text-center text-xs text-gray-400 font-medium py-1">
                                        +{getDayEvents(selectedDay).length - 4} more · click to view all
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-3">
                                    <CalendarIcon size={18} className="text-gray-300" />
                                </div>
                                <p className="text-xs font-medium text-gray-400">No events on this day</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-3">
                                <CalendarIcon size={18} className="text-gray-300" />
                            </div>
                            <p className="text-xs font-medium text-gray-400">Click a date to preview events</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Full Event Modal ── */}
            <AnimatePresence>
                {selectedDay && getDayEvents(selectedDay).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
                        onClick={() => setSelectedDay(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                            transition={{ type: "spring", damping: 30, stiffness: 350 }}
                            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Events</p>
                                    <h4 className="text-base font-semibold text-gray-900">
                                        {monthName} {selectedDay}, {year}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                                        {getDayEvents(selectedDay).length} event{getDayEvents(selectedDay).length !== 1 ? "s" : ""}
                                    </span>
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                                    >
                                        <X size={14} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="overflow-y-auto max-h-[calc(85vh-70px)] p-5 space-y-2.5">
                                {getDayEvents(selectedDay).map((event, idx) => {
                                    const cfg = getTypeConfig(event.type);
                                    const Icon = cfg.icon;
                                    return (
                                        <motion.div
                                            key={event.id || idx}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04, duration: 0.2 }}
                                            className="flex gap-3.5 p-3.5 rounded-lg border transition-colors"
                                            style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                                        >
                                            {/* Icon */}
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: cfg.color + "18" }}
                                            >
                                                <Icon size={15} style={{ color: cfg.text }} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h5 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                                                        {event.title}
                                                    </h5>
                                                    {event.time && (
                                                        <div className="flex items-center gap-1 flex-shrink-0 text-gray-400">
                                                            <Clock size={11} />
                                                            <span className="text-[11px] font-medium">{event.time}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                        className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                                        style={{ color: cfg.text, backgroundColor: cfg.color + "15" }}
                                                    >
                                                        {cfg.label}
                                                    </span>

                                                    {event.assignee && (
                                                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                            <Users size={10} />
                                                            {event.type === "meeting" ? "Host:" : ""} {event.assignee}
                                                        </span>
                                                    )}
                                                    {event.name && (
                                                        <span className="text-[11px] text-gray-500">{event.name}</span>
                                                    )}
                                                </div>

                                                {event.link && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={event.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                                        >
                                                            Join Link: {event.link}
                                                        </a>
                                                    </div>
                                                )}

                                                {event.participants && event.participants.length > 0 && (
                                                    <div className="mt-2 text-[11px] text-gray-500">
                                                        <span className="font-semibold text-gray-700">Participants:</span> {event.participants.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Add Meeting Modal ── */}
            <AnimatePresence>
                {isMeetingModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
                        onClick={() => setIsMeetingModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                            transition={{ type: "spring", damping: 30, stiffness: 350 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900">Schedule Meeting</h4>
                                    <p className="text-[11px] text-gray-400 font-medium">Attendees will receive email invitations</p>
                                </div>
                                <button
                                    onClick={() => setIsMeetingModalOpen(false)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                                >
                                    <X size={14} strokeWidth={2} />
                                </button>
                            </div>

                            <form onSubmit={handleMeetingSubmit} className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Meeting Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sync Session"
                                        value={meetingForm.title}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={meetingForm.date}
                                            onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={meetingForm.time}
                                            onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Meeting Join Link</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://meet.google.com/..."
                                        value={meetingForm.link}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, link: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Description (Optional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Meeting agenda..."
                                        value={meetingForm.description}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Participant Emails (Comma-separated)</label>
                                    <input
                                        type="text"
                                        placeholder="john@example.com, sarah@example.com"
                                        value={meetingForm.participants}
                                        onChange={(e) => setMeetingForm(prev => ({ ...prev, participants: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsMeetingModalOpen(false)}
                                        className="flex-1 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingMeeting}
                                        className="flex-1 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        {isCreatingMeeting && <Loader2 size={14} className="animate-spin" />}
                                        Schedule
                                    </button>
                                </div>
                            </form>
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
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={15} strokeWidth={2} />
                    </button>
                    <div>
                        <h1 className="text-sm font-semibold text-gray-900">Calendar</h1>
                        <p className="text-[11px] text-gray-400">Activity & Event Tracker</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {["expense", "task", "purchase", "campaign", "meeting"].map((type) => {
                        const cfg = getTypeConfig(type);
                        return (
                            <div
                                key={type}
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold"
                                style={{ color: cfg.text, backgroundColor: cfg.bg, borderColor: cfg.border }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                                {cfg.label}
                            </div>
                        );
                    })}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-5"
                >
                    <p className="text-xs text-gray-400 font-medium">
                        Track activities, tasks, and events across your organization
                    </p>
                </motion.div>
                <ActivityCalendar />
            </main>
        </div>
    );
}
