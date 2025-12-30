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
    User,
    Users,
    Package,
    Receipt,
    TrendingDown,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Redux hooks
import {
    useGetExpensesQuery,
    useCreateExpenseMutation
} from '@/utils/slices/InventoryAndAsset/expenseApiSlice';
import { useGetAdminListQuery } from '@/utils/slices/adminApiSlice';
import { useGetCampaignListQuery } from '@/utils/slices/campaignSlice';
import { useGetPurchasesQuery } from '@/utils/slices/InventoryAndAsset/purchaseApiSlice';
import { useGetVendorsQuery } from '@/utils/slices/InventoryAndAsset/vendorApiSlice';

export default function ExpenseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExpenseType, setSelectedExpenseType] = useState('ALL');

    // API Hooks
    const { data: expensesResponse, isLoading, refetch } = useGetExpensesQuery({
        type: selectedExpenseType,
        search: searchQuery
    });
    const { data: adminsResponse } = useGetAdminListQuery();
    const { data: campaignsResponse } = useGetCampaignListQuery();
    const { data: purchasesResponse } = useGetPurchasesQuery();
    const { data: vendorsResponse } = useGetVendorsQuery();

    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

    const expenses = expensesResponse?.data || [];
    const admins = adminsResponse?.data || [];
    const campaigns = campaignsResponse?.data || [];
    const purchases = purchasesResponse?.data || [];
    const vendors = vendorsResponse?.data || [];

    // Form State
    const [formData, setFormData] = useState({
        expenseType: 'SALARY',
        amount: '',
        description: '',
        adminId: '',
        campaignId: '',
        purchaseId: '',
        vendorId: '',
        paymentMethod: 'CASH',
        transactionId: '',
        notes: '',
        reimbursementType: 'ADMIN',
        volunteerName: '',
        volunteerPhone: '',
        volunteerLocation: '',
        proofFile: null
    });

    const expenseTypes = [
        { value: 'ALL', label: 'All Expenses', color: 'gray' },
        { value: 'SALARY', label: 'Salary', color: 'blue' },
        { value: 'BENEFICIARY', label: 'Beneficiary', color: 'green' },
        { value: 'PURCHASE', label: 'Purchase', color: 'purple' },
        { value: 'REIMBURSEMENT', label: 'Reimbursement', color: 'orange' },
        { value: 'OPERATIONAL', label: 'Operational', color: 'teal' },
        { value: 'OTHER', label: 'Other', color: 'gray' },
    ];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('amount', formData.amount);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('expenseType', formData.expenseType);
            formDataToSend.append('paymentMethod', formData.paymentMethod);

            if (formData.transactionId) formDataToSend.append('transactionId', formData.transactionId);
            if (formData.notes) formDataToSend.append('notes', formData.notes);

            if (formData.expenseType === 'SALARY' && formData.adminId) {
                formDataToSend.append('adminId', formData.adminId);
            }
            if (formData.expenseType === 'BENEFICIARY' && formData.campaignId) {
                formDataToSend.append('campaignId', formData.campaignId);
            }
            if (formData.expenseType === 'PURCHASE' && formData.purchaseId) {
                formDataToSend.append('purchaseId', formData.purchaseId);
            }
            if (formData.vendorId) {
                formDataToSend.append('vendorId', formData.vendorId);
            }

            if (formData.expenseType === 'REIMBURSEMENT') {
                if (formData.reimbursementType === 'ADMIN' && formData.adminId) {
                    formDataToSend.append('reimbursementTo[adminId]', formData.adminId);
                } else if (formData.reimbursementType === 'VOLUNTEER') {
                    formDataToSend.append('reimbursementTo[volunteerDetails][name]', formData.volunteerName);
                    formDataToSend.append('reimbursementTo[volunteerDetails][phone]', formData.volunteerPhone);
                    formDataToSend.append('reimbursementTo[volunteerDetails][location]', formData.volunteerLocation);
                }
            }

            if (formData.proofFile) {
                formDataToSend.append('proof', formData.proofFile);
            }

            await createExpense(formDataToSend).unwrap();
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create expense:', error);
            alert(error?.data?.message || 'Failed to create expense');
        }
    };

    const resetForm = () => {
        setFormData({
            expenseType: 'SALARY',
            amount: '',
            description: '',
            adminId: '',
            campaignId: '',
            purchaseId: '',
            vendorId: '',
            paymentMethod: 'CASH',
            transactionId: '',
            notes: '',
            reimbursementType: 'ADMIN',
            volunteerName: '',
            volunteerPhone: '',
            volunteerLocation: '',
            proofFile: null
        });
    };

    const getExpenseTypeColor = (type) => {
        const typeInfo = expenseTypes.find(t => t.value === type);
        return typeInfo?.color || 'gray';
    };

    if (!isMounted) return null;

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
                            <TrendingDown className="text-emerald-600" size={24} />
                            Expense Management
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Record Expense
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filters */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
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

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {expenseTypes.map((type) => {
                            const isSelected = selectedExpenseType === type.value;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedExpenseType(type.value)}
                                    className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${isSelected
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading expenses...</p>
                    </div>
                )}

                {/* Expenses List */}
                {!isLoading && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Expenses</h2>
                        <AnimatePresence>
                            {expenses.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <TrendingDown size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No expenses recorded</h3>
                                    <p className="text-gray-500">Record an expense to start tracking.</p>
                                </div>
                            ) : (
                                expenses.map((expense) => {
                                    const typeColor = getExpenseTypeColor(expense.expenseType);

                                    return (
                                        <motion.div
                                            key={expense._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                    <div className={`w-12 h-12 rounded-xl bg-${typeColor}-50 text-${typeColor}-600 flex items-center justify-center`}>
                                                        <TrendingDown size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-bold text-gray-900">{expense.description}</h3>
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-${typeColor}-50 text-${typeColor}-700`}>
                                                                {expense.expenseType}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(expense.date).toLocaleDateString()}
                                                            </span>
                                                            {expense.adminId && (
                                                                <span className="flex items-center gap-1 text-blue-600">
                                                                    <User size={12} />
                                                                    {expense.adminId.fullName}
                                                                </span>
                                                            )}
                                                            {expense.campaignId && (
                                                                <span className="flex items-center gap-1 text-green-600">
                                                                    <Users size={12} />
                                                                    {expense.campaignId.title}
                                                                </span>
                                                            )}
                                                            {expense.vendorId && (
                                                                <span className="flex items-center gap-1 text-purple-600">
                                                                    <Building2 size={12} />
                                                                    {expense.vendorId.fullName}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1 text-gray-400">
                                                                <Receipt size={12} />
                                                                {expense.paymentMethod}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                                                    {expense.transactionId && (
                                                        <p className="text-xs text-gray-400 mt-1">TXN: {expense.transactionId}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {expense.notes && (
                                                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                                                    <p className="text-sm text-gray-600">{expense.notes}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
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
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Record New Expense</h2>
                                    <p className="text-sm text-gray-500">Track organizational expenses</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                    {/* Expense Type */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Expense Type *</label>
                                        <select
                                            required
                                            value={formData.expenseType}
                                            onChange={(e) => setFormData(p => ({ ...p, expenseType: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                        >
                                            {expenseTypes.filter(t => t.value !== 'ALL').map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Amount */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Amount (₹) *</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                                    placeholder="0.00"
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold"
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Payment Method *</label>
                                            <div className="relative">
                                                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="CASH">Cash</option>
                                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                                    <option value="UPI">UPI</option>
                                                    <option value="CHEQUE">Cheque</option>
                                                    <option value="CARD">Card</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Description *</label>
                                        <textarea
                                            required
                                            rows="2"
                                            value={formData.description}
                                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                            placeholder="What was this expense for?"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Conditional Fields Based on Expense Type */}
                                    {formData.expenseType === 'SALARY' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Admin *</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.adminId}
                                                    onChange={(e) => setFormData(p => ({ ...p, adminId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Admin</option>
                                                    {admins.map(admin => (
                                                        <option key={admin._id} value={admin._id}>{admin.fullName} ({admin.email})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.expenseType === 'BENEFICIARY' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Campaign *</label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.campaignId}
                                                    onChange={(e) => setFormData(p => ({ ...p, campaignId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Campaign</option>
                                                    {campaigns.map(campaign => (
                                                        <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.expenseType === 'PURCHASE' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Link Purchase *</label>
                                            <div className="relative">
                                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.purchaseId}
                                                    onChange={(e) => setFormData(p => ({ ...p, purchaseId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Purchase</option>
                                                    {purchases.map(purchase => (
                                                        <option key={purchase._id} value={purchase._id}>
                                                            {purchase.vendorId?.fullName} - ₹{purchase.totalAmount}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.expenseType === 'REIMBURSEMENT' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Reimbursement To *</label>
                                                <select
                                                    required
                                                    value={formData.reimbursementType}
                                                    onChange={(e) => setFormData(p => ({ ...p, reimbursementType: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="VOLUNTEER">Volunteer</option>
                                                </select>
                                            </div>

                                            {formData.reimbursementType === 'ADMIN' ? (
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Admin *</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <select
                                                            required
                                                            value={formData.adminId}
                                                            onChange={(e) => setFormData(p => ({ ...p, adminId: e.target.value }))}
                                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                        >
                                                            <option value="">Choose Admin</option>
                                                            {admins.map(admin => (
                                                                <option key={admin._id} value={admin._id}>{admin.fullName}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Name *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.volunteerName}
                                                            onChange={(e) => setFormData(p => ({ ...p, volunteerName: e.target.value }))}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Phone *</label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            value={formData.volunteerPhone}
                                                            onChange={(e) => setFormData(p => ({ ...p, volunteerPhone: e.target.value }))}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Location *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.volunteerLocation}
                                                            onChange={(e) => setFormData(p => ({ ...p, volunteerLocation: e.target.value }))}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Optional Vendor */}
                                    {(formData.expenseType === 'OPERATIONAL' || formData.expenseType === 'OTHER') && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor (Optional)</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    value={formData.vendorId}
                                                    onChange={(e) => setFormData(p => ({ ...p, vendorId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Vendor</option>
                                                    {vendors.map(vendor => (
                                                        <option key={vendor._id} value={vendor._id}>{vendor.fullName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Transaction ID */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Transaction ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.transactionId}
                                            onChange={(e) => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                                            placeholder="e.g., TXN123456"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Additional Notes</label>
                                        <textarea
                                            rows="2"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                                            placeholder="Any additional information..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Proof Upload */}
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Upload Proof (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setFormData(p => ({ ...p, proofFile: e.target.files[0] }))}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Save Expense Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
