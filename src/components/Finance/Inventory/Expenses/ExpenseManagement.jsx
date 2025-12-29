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
    HardDrive,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetExpensesQuery, useCreateExpenseMutation } from '../../../../utils/slices/InventoryAndAsset/expenseApiSlice';
import { useGetVendorsQuery } from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetItemsQuery } from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';

export default function ExpenseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // API Hooks
    const { data: expensesResponse, isLoading, isError } = useGetExpensesQuery(searchQuery);
    const { data: vendorsResponse } = useGetVendorsQuery();
    const { data: assetsResponse } = useGetItemsQuery({ itemType: 'ASSET' });

    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

    const expenses = expensesResponse?.data || [];
    const vendors = vendorsResponse?.data || [];
    const assets = assetsResponse?.data || [];

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        desc: '',
        vendorId: '',
        assetId: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createExpense({
                amount: Number(formData.amount),
                description: formData.desc,
                vendorId: formData.vendorId,
                assetId: formData.assetId,
            }).unwrap();

            setShowAddModal(false);
            setFormData({
                amount: '',
                desc: '',
                vendorId: '',
                assetId: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error('Failed to create expense:', err);
            alert(err?.data?.message || 'Failed to create expense');
        }
    };

    // Backend handles search, but we can access the result directly
    const filteredExpenses = expenses;

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

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading expenses...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Error Loading Expenses</h3>
                        <p className="text-gray-500">Failed to fetch expense records.</p>
                    </div>
                )}

                {/* Expenses List */}
                {!isLoading && !isError && (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredExpenses.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <IndianRupee size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No expenses recorded</h3>
                                    <p className="text-gray-500">Add an expense to start tracking.</p>
                                </div>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <motion.div
                                        key={expense._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                                <IndianRupee size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{expense.description}</h3>
                                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(expense.date).toLocaleDateString()}</span>
                                                    {expense.vendor && <span className="flex items-center gap-1 text-blue-600"><Building2 size={12} /> {expense.vendor.fullName}</span>}
                                                    {expense.asset && <span className="flex items-center gap-1 text-purple-600"><HardDrive size={12} /> {expense.asset.name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right pl-16 sm:pl-0">
                                            <p className="text-xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
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
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Link Vendor *</label>
                                        <select
                                            required
                                            value={formData.vendorId}
                                            onChange={(e) => setFormData(p => ({ ...p, vendorId: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map(vendor => (
                                                <option key={vendor._id} value={vendor._id}>
                                                    {vendor.fullName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Link Asset *</label>
                                        <select
                                            required
                                            value={formData.assetId}
                                            onChange={(e) => setFormData(p => ({ ...p, assetId: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
                                        >
                                            <option value="">Select Asset</option>
                                            {assets.map(asset => (
                                                <option key={asset._id} value={asset._id}>
                                                    {asset.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Record Expense'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
