'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    HardDrive,
    Search,
    UserPlus,
    DollarSign,
    IndianRupee,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    X,
    TrendingUp,
    MoreVertical,
    Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssetManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // Mock Data
    const [assets, setAssets] = useState([
        {
            id: 'AST-001',
            name: 'MacBook Pro M3 (14")',
            type: 'Laptop',
            status: 'Assigned',
            assignedTo: 'Akshat Gupta',
            assignmentDate: '2024-01-15',
            monthlyIncome: 12000,
            totalIncome: 132000 // 11 months
        },
        {
            id: 'AST-002',
            name: 'MacBook Pro M3 (16")',
            type: 'Laptop',
            status: 'Available',
            assignedTo: '-',
            assignmentDate: '-',
            monthlyIncome: 0,
            totalIncome: 45000 // Previous income
        },
        {
            id: 'AST-003',
            name: 'iPhone 15 Pro',
            type: 'Mobile',
            status: 'Assigned',
            assignedTo: 'Sarah Jenkins',
            assignmentDate: '2024-06-20',
            monthlyIncome: 5000,
            totalIncome: 30000
        }
    ]);

    // Form States
    const [assigneeName, setAssigneeName] = useState('');
    const [incomeAmount, setIncomeAmount] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleAssign = (e) => {
        e.preventDefault();
        setAssets(prev => prev.map(a =>
            a.id === selectedAsset.id
                ? { ...a, status: 'Assigned', assignedTo: assigneeName, assignmentDate: new Date().toISOString().split('T')[0] }
                : a
        ));
        setShowAssignModal(false);
        setAssigneeName('');
        setSelectedAsset(null);
    };

    const handleRecordIncome = (e) => {
        e.preventDefault();
        const amount = Number(incomeAmount);
        setAssets(prev => prev.map(a =>
            a.id === selectedAsset.id
                ? { ...a, monthlyIncome: amount, totalIncome: a.totalIncome + amount }
                : a
        ));
        setShowIncomeModal(false);
        setIncomeAmount('');
        setSelectedAsset(null);
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <HardDrive className="text-emerald-600" size={24} />
                            Asset Management
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search assets by name or assignee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Assets List */}
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-4">Asset Details</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-3">Assigned To</div>
                        <div className="col-span-3 text-right">Income Generated</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {filteredAssets.map(asset => (
                            <div key={asset.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Laptop size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{asset.name}</p>
                                        <p className="text-xs text-gray-400">{asset.id} • {asset.type}</p>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${asset.status === 'Assigned' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                        }`}>
                                        {asset.status === 'Assigned' ? <User size={12} /> : <CheckCircle2 size={12} />}
                                        {asset.status}
                                    </span>
                                </div>

                                <div className="col-span-3">
                                    {asset.status === 'Assigned' ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{asset.assignedTo}</p>
                                            <p className="text-xs text-gray-400">Since {asset.assignmentDate}</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setSelectedAsset(asset); setShowAssignModal(true); }}
                                            className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 w-fit"
                                        >
                                            <UserPlus size={14} /> Assign Now
                                        </button>
                                    )}
                                </div>

                                <div className="col-span-3 flex items-center justify-end gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{asset.totalIncome.toLocaleString()}</p>
                                        <p className="text-xs text-green-600 font-medium">+₹{asset.monthlyIncome.toLocaleString()}/mo</p>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedAsset(asset); setShowIncomeModal(true); }}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Record Income"
                                    >
                                        <IndianRupee size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Assign Asset Modal */}
            <AnimatePresence>
                {showAssignModal && selectedAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAssignModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 bg-indigo-50 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-indigo-600">
                                    <UserPlus size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-indigo-900">Assign Asset</h3>
                                <p className="text-xs text-indigo-600 font-medium">{selectedAsset.name}</p>
                            </div>
                            <form onSubmit={handleAssign} className="p-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Assign To User</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    placeholder="Enter full name..."
                                    value={assigneeName}
                                    onChange={(e) => setAssigneeName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all mb-6"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAssignModal(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                    >Cancel</button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
                                    >Confirm Assignment</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Record Income Modal */}
            <AnimatePresence>
                {showIncomeModal && selectedAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowIncomeModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 bg-emerald-50 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-emerald-600">
                                    <TrendingUp size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-900">Record Monthly Income</h3>
                                <p className="text-xs text-emerald-600 font-medium">{selectedAsset.name}</p>
                            </div>
                            <form onSubmit={handleRecordIncome} className="p-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Income Amount (₹)</label>
                                <input
                                    autoFocus
                                    type="number"
                                    min="0"
                                    required
                                    placeholder="e.g. 10000"
                                    value={incomeAmount}
                                    onChange={(e) => setIncomeAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all mb-6"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowIncomeModal(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                    >Cancel</button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all"
                                    >Update Income</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
