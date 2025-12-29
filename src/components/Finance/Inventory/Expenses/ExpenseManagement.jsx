'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    IndianRupee,
    Plus,
    Search,
    X,
    Calendar,
    FileText,
    Building2,
    HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpenseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock Data
    const [expenses, setExpenses] = useState([
        { id: 1, desc: 'Office Lease Rent - Jan', amount: 45000, date: '2024-01-05', vendor: 'Regus Spaces', type: 'Operational' },
        { id: 2, desc: 'MacBook repair service', amount: 5200, date: '2024-01-12', asset: 'MacBook Pro M3 (14")', type: 'Maintenance' },
        { id: 3, desc: 'Internet Bill', amount: 1200, date: '2024-01-20', vendor: 'Jio Fiber', type: 'Utility' }
    ]);

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        desc: '',
        vendor: '',
        asset: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newExpense = {
            id: Date.now(),
            amount: Number(formData.amount),
            desc: formData.desc,
            date: formData.date,
            vendor: formData.vendor || null,
            asset: formData.asset || null,
            type: 'General'
        };
        setExpenses(prev => [newExpense, ...prev]);
        setShowAddModal(false);
        setFormData({ amount: '', desc: '', vendor: '', asset: '', date: new Date().toISOString().split('T')[0] });
    };

    const filteredExpenses = expenses.filter(e =>
        e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.vendor && e.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
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
                            <IndianRupee className="text-emerald-600" size={24} />
                            Expense Tracker
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Expenses List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredExpenses.map((expense) => (
                            <motion.div
                                key={expense.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                        <IndianRupee size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{expense.desc}</h3>
                                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {expense.date}</span>
                                            {expense.vendor && <span className="flex items-center gap-1 text-blue-600"><Building2 size={12} /> {expense.vendor}</span>}
                                            {expense.asset && <span className="flex items-center gap-1 text-purple-600"><HardDrive size={12} /> {expense.asset}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pl-16 sm:pl-0">
                                    <p className="text-xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                                    {/* <p className="text-xs text-gray-400 uppercase tracking-wider">{expense.type}</p> */}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        value={formData.amount}
                                        onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-rose-500 outline-none text-2xl font-bold text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={formData.desc}
                                        onChange={(e) => setFormData(p => ({ ...p, desc: e.target.value }))}
                                        placeholder="What was this expense for?"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Link Vendor (Opt)</label>
                                        <select
                                            value={formData.vendor}
                                            onChange={(e) => setFormData(p => ({ ...p, vendor: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
                                        >
                                            <option value="">None</option>
                                            <option value="Regus Spaces">Regus Spaces</option>
                                            <option value="Jio Fiber">Jio Fiber</option>
                                            <option value="MedPlus">MedPlus</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Link Asset (Opt)</label>
                                        <select
                                            value={formData.asset}
                                            onChange={(e) => setFormData(p => ({ ...p, asset: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
                                        >
                                            <option value="">None</option>
                                            <option value="MacBook Pro">MacBook Pro</option>
                                            <option value="Printer HP">Printer HP</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-2"
                                >
                                    Record Expense
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
