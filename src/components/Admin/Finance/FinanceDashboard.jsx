'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ArrowLeft,
    PieChart,
    BarChart3,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinanceDashboard() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/finance')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Finance Dashboard
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        label="Total Revenue"
                        value="₹24,50,000"
                        change="+12.5%"
                        isPositive={true}
                        icon={<TrendingUp className="text-emerald-600" />}
                        bg="bg-emerald-50"
                    />
                    <MetricCard
                        label="Total Expenses"
                        value="₹8,20,000"
                        change="+8.2%"
                        isPositive={false}
                        icon={<TrendingDown className="text-rose-600" />}
                        bg="bg-rose-50"
                    />
                    <MetricCard
                        label="Total Disbursements"
                        value="₹12,40,000"
                        change="+15.3%"
                        isPositive={true}
                        icon={<DollarSign className="text-blue-600" />}
                        bg="bg-blue-50"
                    />
                    <MetricCard
                        label="Net Balance"
                        value="₹3,90,000"
                        change="-2.1%"
                        isPositive={false}
                        icon={<PieChart className="text-amber-600" />}
                        bg="bg-amber-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Transactions Placeholder */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Monthly Cash Flow</h3>
                            <button className="text-sm text-emerald-600 font-bold hover:underline">View Details</button>
                        </div>
                        <div className="p-12 text-center">
                            <BarChart3 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Cash flow visualization coming soon</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-6">Upcoming Deadlines</h3>
                        <div className="space-y-4">
                            <DeadlineItem
                                title="Beneficiary Payouts"
                                date="Tomorrow, 10:00 AM"
                                category="Disbursement"
                            />
                            <DeadlineItem
                                title="Monthly Audit"
                                date="Jan 5, 2024"
                                category="Compliance"
                            />
                            <DeadlineItem
                                title="Vendor Payments"
                                date="Jan 10, 2024"
                                category="Purchases"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function MetricCard({ label, value, change, isPositive, icon, bg }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center font-bold`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {change}
                </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h4 className="text-2xl font-black text-gray-900">{value}</h4>
        </div>
    );
}

function DeadlineItem({ title, date, category }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                <Calendar size={20} />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{date}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">{category}</span>
                </div>
            </div>
        </div>
    );
}
