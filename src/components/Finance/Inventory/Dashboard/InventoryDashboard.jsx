'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    LayoutDashboard,
    Package,
    HardDrive,
    TrendingUp,
    TrendingDown,
    Box,
    CheckCircle2,
    Clock,
    AlertCircle,
    LucideIcon,
    PieChart,
    ShoppingCart,
    Receipt,
    Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
    {
        id: 'total-assets',
        label: 'Total Assets',
        value: '1,284',
        secondaryValue: '124 assigned',
        status: 'up',
        trend: '+5.2%',
        icon: HardDrive,
        color: 'emerald'
    },
    {
        id: 'total-inventory',
        label: 'Total Inventory',
        value: '45,890',
        secondaryValue: '1,200 items low',
        status: 'down',
        trend: '-2.1%',
        icon: Package,
        color: 'blue'
    },
    {
        id: 'monthly-income',
        label: 'Monthly Income (Assets)',
        value: '₹8,45,000',
        secondaryValue: '₹1.2L this week',
        status: 'up',
        trend: '+12.5%',
        icon: TrendingUp,
        color: 'purple'
    },
    {
        id: 'monthly-expenses',
        label: 'Monthly Expenses',
        value: '₹3,12,000',
        secondaryValue: 'Rent & Maintenance',
        status: 'down',
        trend: '+8.4%',
        icon: TrendingDown,
        color: 'orange'
    }
];

export default function InventoryDashboard() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/inventory')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <LayoutDashboard className="text-emerald-600" size={24} />
                            Inventory Dashboard
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Quick Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {STATS.map((stat, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={stat.id}
                            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.status === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            <p className="text-xs text-gray-400 mt-1">{stat.secondaryValue}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="space-y-12">
                    {/* Section 2: Supply Chain */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <ShoppingCart size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Supply Chain</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="font-bold text-gray-800">Pending Purchases</p>
                                    <Users size={18} className="text-gray-400" />
                                </div>
                                <p className="text-3xl font-bold text-blue-600">24</p>
                                <p className="text-xs text-gray-500 mt-1">Orders awaiting fulfillment</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="font-bold text-gray-800">Active Vendors</p>
                                    <Users size={18} className="text-gray-400" />
                                </div>
                                <p className="text-3xl font-bold text-emerald-600">142</p>
                                <p className="text-xs text-gray-500 mt-1">Onboarded this year</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Assets & Stock */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <Box size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Assets & Stock</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                                <h3 className="text-lg font-bold mb-6">Inventory Depletion</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Surgical Masks', val: 85, color: 'emerald' },
                                        { name: 'Emergency Rations', val: 32, color: 'rose' },
                                        { name: 'Cotton Blankets', val: 54, color: 'amber' }
                                    ].map(item => (
                                        <div key={item.name} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                    <div className={`h-full bg-${item.color}-500`} style={{ width: `${item.val}%` }}></div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{item.val}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
