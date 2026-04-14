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
    AlertCircle,
    Edit2,
    Trash2,
    Briefcase,
    Tag,
    ChevronDown,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/Common/ConfirmModal';
import { 
    useGetExpensesQuery, 
    useCreateExpenseMutation,
    useUpdateExpenseMutation
} from '../../../../utils/slices/InventoryAndAsset/expenseApiSlice';
import { useGetVendorsQuery } from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetItemsQuery } from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';
import { getMediaUrl } from '../../../../utils/media';

const EXPENSE_TYPES = [
    { id: 'OPERATIONAL', label: 'Operational' },
    { id: 'SALARY', label: 'Salary' },
    { id: 'BENEFICIARY', label: 'Beneficiary' },
    { id: 'PURCHASE', label: 'Purchase' },
    { id: 'REIMBURSEMENT', label: 'Reimbursement' },
    { id: 'DOCUMENTATION_SERVICE', label: 'Documentation Service' },
    { id: 'OTHER', label: 'Other' }
];

export default function ExpenseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    // Confirmation Modals State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: ''
    });

    // API Hooks
    const { data: expensesResponse, isLoading, isError } = useGetExpensesQuery({ 
        search: searchQuery, 
        type: typeFilter 
    });
    const { data: vendorsResponse } = useGetVendorsQuery();
    const { data: assetsResponse } = useGetItemsQuery({ itemType: 'ASSET' });

    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
    const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

    const expenses = expensesResponse?.data || [];
    const vendors = vendorsResponse?.data || [];
    const assets = assetsResponse?.data || [];

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        expenseType: 'OPERATIONAL',
        vendorId: '',
        assetId: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        transactionId: '',
        notes: '',
        proofFile: null
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const resetForm = () => {
        setFormData({
            amount: '',
            description: '',
            expenseType: 'OPERATIONAL',
            vendorId: '',
            assetId: '',
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'CASH',
            transactionId: '',
            notes: '',
            proofFile: null
        });
        setEditingExpense(null);
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            amount: expense.amount,
            description: expense.description,
            expenseType: expense.expenseType,
            vendorId: expense.vendorId?._id || '',
            assetId: expense.assetId?._id || '',
            date: new Date(expense.date).toISOString().split('T')[0],
            paymentMethod: expense.paymentMethod || 'CASH',
            transactionId: expense.transactionId || '',
            notes: expense.notes || '',
            proofFile: null
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formPayload = new FormData();
        formPayload.append('amount', formData.amount);
        formPayload.append('description', formData.description);
        formPayload.append('expenseType', formData.expenseType);
        formPayload.append('date', formData.date);
        formPayload.append('paymentMethod', formData.paymentMethod);
        if (formData.vendorId) formPayload.append('vendorId', formData.vendorId);
        if (formData.assetId) formPayload.append('assetId', formData.assetId);
        if (formData.transactionId) formPayload.append('transactionId', formData.transactionId);
        if (formData.notes) formPayload.append('notes', formData.notes);
        if (formData.proofFile) formPayload.append('proof', formData.proofFile);

        try {
            if (editingExpense) {
                await updateExpense({
                    id: editingExpense._id,
                    data: formPayload
                }).unwrap();
                toast.success('Expense updated successfully');
            } else {
                await createExpense(formPayload).unwrap();
                toast.success('Expense recorded successfully');
            }

            setShowAddModal(false);
            resetForm();
        } catch (err) {
            console.error('Failed to save expense:', err);
            toast.error(err?.data?.message || 'Failed to save expense');
        }
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
                            <IndianRupee className="text-emerald-600" size={24} />
                            Expense Tracker
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    
                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setTypeFilter('ALL')}
                            className={`px-4 py-2 rounded-xl text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${typeFilter === 'ALL' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            All
                        </button>
                        {EXPENSE_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setTypeFilter(type.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${typeFilter === type.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
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
                            {expenses.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <IndianRupee size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No expenses recorded</h3>
                                    <p className="text-gray-500">Add an expense or adjust filter to see results.</p>
                                </div>
                            ) : (
                                expenses.map((expense) => (
                                    <motion.div
                                        key={expense._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                                <IndianRupee size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-900 truncate">{expense.description}</h3>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-black rounded uppercase tracking-widest">{expense.expenseType}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(expense.date).toLocaleDateString('en-IN')}</span>
                                                    {expense.vendorId && <span className="flex items-center gap-1 text-blue-600"><Building2 size={12} /> {expense.vendorId.fullName}</span>}
                                                    {expense.asset && <span className="flex items-center gap-1 text-purple-600"><HardDrive size={12} /> {expense.asset.name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 self-end sm:self-center">
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{expense.paymentMethod}</p>
                                            </div>
                                            <div className="flex items-center gap-1 border-l pl-4 border-gray-100">
                                                {expense.proofDocument?.fileUrl && (
                                                    <button
                                                        onClick={() => window.open(getMediaUrl(expense.proofDocument.fileUrl), '_blank')}
                                                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="View Proof"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Add/Edit Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{editingExpense ? 'Edit Expense' : 'New Expense Entry'}</h2>
                                    <p className="text-sm text-gray-500">Record financial disbursements</p>
                                </div>
                                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Amount (₹) *</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="number"
                                                required
                                                value={formData.amount}
                                                onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none text-2xl font-black text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Transaction Date *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Description / Purpose *</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                        placeholder="What is this expense for?"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none resize-none font-medium"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Expense Category *</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                required
                                                value={formData.expenseType}
                                                onChange={(e) => setFormData(p => ({ ...p, expenseType: e.target.value }))}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none appearance-none font-bold text-sm"
                                            >
                                                {EXPENSE_TYPES.map(type => (
                                                    <option key={type.id} value={type.id}>{type.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Payment Method *</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                required
                                                value={formData.paymentMethod}
                                                onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none appearance-none font-bold text-sm"
                                            >
                                                <option value="CASH">Cash</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="UPI">UPI</option>
                                                <option value="CHEQUE">Cheque</option>
                                                <option value="CARD">Card</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Linked Vendor</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                value={formData.vendorId}
                                                onChange={(e) => setFormData(p => ({ ...p, vendorId: e.target.value }))}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none appearance-none font-bold text-sm"
                                            >
                                                <option value="">N/A</option>
                                                {vendors.map(vendor => (
                                                    <option key={vendor._id} value={vendor._id}>{vendor.fullName}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Linked Asset</label>
                                        <div className="relative">
                                            <HardDrive className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                value={formData.assetId}
                                                onChange={(e) => setFormData(p => ({ ...p, assetId: e.target.value }))}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none appearance-none font-bold text-sm"
                                            >
                                                <option value="">N/A</option>
                                                {assets.map(asset => (
                                                    <option key={asset._id} value={asset._id}>{asset.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Transaction ID / Ref</label>
                                    <input
                                        type="text"
                                        value={formData.transactionId}
                                        onChange={(e) => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                                        placeholder="UTR, Ref Number, etc."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none font-medium"
                                    />
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 border-dashed">
                                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Proof of Payment</label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setFormData(p => ({ ...p, proofFile: e.target.files[0] }))}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all font-medium"
                                    />
                                    {editingExpense?.proofDocument && !formData.proofFile && (
                                        <p className="mt-2 text-[10px] text-emerald-600 font-bold italic">Current: {editingExpense.proofDocument.fileName}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {(isCreating || isUpdating) ? <Loader2 className="animate-spin" size={20} /> : <>{editingExpense ? 'Update Expense' : 'Record Expense'}</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
}
