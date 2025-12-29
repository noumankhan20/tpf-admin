'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    BarChart3,
    Download,
    FileText,
    HardDrive,
    Package,
    TrendingDown,
    TrendingUp,
    Share2,
    Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const REPORT_TYPES = [
    {
        id: 'assets',
        title: 'Asset Report',
        desc: 'Complete list of assets, assignments, and generated income.',
        icon: HardDrive,
        color: 'blue',
        stats: '1,284 Assets',
        lastGenerated: 'Today, 09:00 AM'
    },
    {
        id: 'inventory-balance',
        title: 'Inventory Balance Report',
        desc: 'Current stock levels across all Categories and Warehouses.',
        icon: Package,
        color: 'orange',
        stats: '45 Low Stock Items',
        lastGenerated: 'Yesterday'
    },
    {
        id: 'distribution',
        title: 'Inventory Distribution',
        desc: 'Track Sadaqah, Donations, and Internal Usage history.',
        icon: Share2,
        color: 'purple',
        stats: '2,400 Units Distributed',
        lastGenerated: '2 days ago'
    },
    {
        id: 'finance',
        title: 'Income & Expense Report',
        desc: 'Consolidated financial statement for Assets & Inventory.',
        icon: TrendingUp,
        color: 'emerald',
        stats: '₹4.5L Net Flow',
        lastGenerated: '1 week ago'
    }
];

export default function InventoryReports() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleDownload = (id) => {
        // Simulate download
        alert(`Downloading ${id}_report.pdf...`);
    };

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
                            <BarChart3 className="text-emerald-600" size={24} />
                            Reports & Analytics
                        </h1>
                    </div>
                    <button className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Available Reports</h2>
                    <p className="text-gray-500">Download detailed breakdowns for auditing and analysis.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {REPORT_TYPES.map((report) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <report.icon size={120} />
                            </div>

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl bg-${report.color}-50 text-${report.color}-600 flex items-center justify-center mb-6`}>
                                    <report.icon size={28} />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h3>
                                <p className="text-gray-500 mb-6 h-10">{report.desc}</p>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Key Stat</p>
                                        <p className="text-sm font-bold text-gray-900">{report.stats}</p>
                                    </div>
                                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generated</p>
                                        <p className="text-sm font-bold text-gray-900">{report.lastGenerated}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleDownload(report.id)}
                                        className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg active:scale-95"
                                    >
                                        <Download size={16} /> Download CSV
                                    </button>
                                    <button className="px-4 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors">
                                        View
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
