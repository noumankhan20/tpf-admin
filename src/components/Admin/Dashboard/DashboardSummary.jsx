"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Flag,
    CheckSquare,
    IndianRupee,
    UserCog,
    HeartHandshake,
    ArrowUpRight,
    ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import {
    useGetSummaryMetricsQuery
} from "../../../utils/slices/adminDashboardApiSlice";
import {
    useGetDonationsQuery
} from "../../../utils/slices/donationApiSlice";

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
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.gradient}`} />
            <div className="relative z-10">
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
                <div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                        {metric.value}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {metric.label}
                    </p>
                </div>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
                <div className={`w-full h-full bg-gradient-to-br ${metric.gradient} rounded-full blur-2xl`} />
            </div>
        </motion.div>
    );
};

const SummaryMetrics = () => {
    const { data, isLoading } = useGetSummaryMetricsQuery();
    const metrics = data?.metrics || {};

    const summaryItems = [
        { id: 1, label: "Total Donors", value: metrics.totalDonors || 0, icon: HeartHandshake, route: "/donation-management/offline-donation", gradient: "from-blue-500 to-blue-600" },
        { id: 2, label: "Total Donation Collected", value: metrics.totalDonationCollected ? `₹${(metrics.totalDonationCollected).toLocaleString('en-IN')}` : "₹0", icon: IndianRupee, route: "/donation-management", gradient: "from-emerald-500 to-emerald-600" },
        { id: 3, label: "Total Admins", value: metrics.totalAdmins || 0, icon: UserCog, route: "/add-admin", gradient: "from-purple-500 to-purple-600" },
        { id: 4, label: "Total Users", value: metrics.totalUsers || 0, icon: Users, route: "/admin/volunteers", gradient: "from-amber-500 to-amber-600" },
        { id: 5, label: "Total Campaigns", value: metrics.totalCampaigns || 0, icon: Flag, route: "/campaigns", gradient: "from-pink-500 to-pink-600" },
        { id: 6, label: "Total Pending Tasks", value: metrics.totalPendingTasks || 0, icon: CheckSquare, route: "/admin/task-management", gradient: "from-teal-500 to-teal-600" },
    ];

    if (isLoading) return <div className="text-center py-10">Loading Metrics...</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
            {summaryItems.map((metric, index) => (
                <MetricCard key={metric.id} metric={metric} index={index} />
            ))}
        </div>
    );
};

const RecentTransactions = () => {
    const { data, isLoading } = useGetDonationsQuery({ limit: 5 });
    const donations = data?.donations || [];

    if (isLoading) return <div className="text-center py-10">Loading Transactions...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
            <h3 className="text-2xl font-black text-gray-900 mb-6">Recent Transactions</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Donor</th>
                            <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Amount</th>
                            <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Type</th>
                            <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {donations.length > 0 ? donations.map((donation, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                            {donation.fullName?.[0] || 'U'}
                                        </div>
                                        <span className="font-semibold text-gray-900">{donation.fullName}</span>
                                    </div>
                                </td>
                                <td className="py-4 font-black text-gray-900">₹{donation.amount?.toLocaleString('en-IN')}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${donation.purpose === 'ZAKAAT' ? 'bg-emerald-50 text-emerald-600' :
                                        donation.purpose === 'SADAQAH' ? 'bg-amber-50 text-amber-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                        {donation.purpose || 'SADAQAH'}
                                    </span>
                                </td>
                                <td className="py-4 text-sm text-gray-500">{donation.date ? new Date(donation.date).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="py-10 text-center text-gray-400">No recent transactions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default function DashboardSummary() {
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
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Summary Cards</h1>
                    <p className="text-lg text-gray-600 font-semibold">Key metrics and recent donation activities</p>
                </motion.div>

                <SummaryMetrics />
                <RecentTransactions />
            </div>
        </div>
    );
}
