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
    Laptop,
    UserMinus,
    Trash2,
    Loader2,
    Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/Common/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetAssetsQuery,
    useAssignAssetMutation,
    useUnassignAssetMutation,
    useUpdateAssetIncomeMutation,
    useDeleteAssetMutation
} from '../../../../utils/slices/InventoryAndAsset/assetApiSlice';
import { useGetInventoryDashboardStatsQuery } from '../../../../utils/slices/InventoryAndAsset/dashboardApiSlice';
import Pagination from '../Common/Pagination';
import { useGetAdminListQuery } from '../../../../utils/slices/adminApiSlice';

export default function AssetManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [viewAsset, setViewAsset] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
    const { data: assetsResponse, isLoading, isError, error } = useGetAssetsQuery({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
    });
    const { data: adminListData } = useGetAdminListQuery();
    const [assignAsset, { isLoading: isAssigning }] = useAssignAssetMutation();
    const [unassignAsset, { isLoading: isUnassigning }] = useUnassignAssetMutation();
    const [updateIncome, { isLoading: isUpdating }] = useUpdateAssetIncomeMutation();
    const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

    const assets = assetsResponse?.data || [];
    const meta = assetsResponse?.meta || { totalPages: 1 };
    const admins = adminListData?.data || [];

    // Form States
    const [assigneeId, setAssigneeId] = useState('');
    const [incomeForm, setIncomeForm] = useState({
        personName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    // Get Stats for summary cards
    const { data: dashboardStats } = useGetInventoryDashboardStatsQuery();
    const stats = dashboardStats?.data?.assets || { total: 0, assigned: 0 };
    const financialStats = dashboardStats?.data?.financials || { monthlyIncome: 0 };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, startDate, endDate]);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await assignAsset({ assetId: selectedAsset._id, assignedTo: assigneeId }).unwrap();
            setShowAssignModal(false);
            setAssigneeId('');
            setSelectedAsset(null);
        } catch (err) {
            console.error('Failed to assign asset:', err);
            toast.error(err?.data?.message || 'Failed to assign asset');
        }
    };

    const handleRecordIncome = async (e) => {
        e.preventDefault();
        try {
            await updateIncome({
                assetId: selectedAsset._id,
                ...incomeForm,
                amount: Number(incomeForm.amount)
            }).unwrap();
            setShowIncomeModal(false);
            setIncomeForm({
                personName: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                note: ''
            });
            setSelectedAsset(null);
            toast.success('Income entry added to ledger');
        } catch (err) {
            console.error('Failed to update income:', err);
            toast.error(err?.data?.message || 'Failed to update income');
        }
    };

    const handleUnassign = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'warning',
            title: 'Unassign Asset',
            message: 'Are you sure you want to unassign this asset? This will make it available for others.',
            confirmText: 'Unassign',
            onConfirm: async () => {
                try {
                    await unassignAsset(id).unwrap();
                    toast.success('Asset unassigned successfully');
                } catch (err) {
                    console.error('Failed to unassign asset:', err);
                    toast.error(err?.data?.message || 'Failed to unassign asset');
                }
            }
        });
    };

    const handleAssetDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'danger',
            title: 'Deactivate Asset',
            message: 'Are you sure you want to deactivate this asset?',
            confirmText: 'Deactivate',
            onConfirm: async () => {
                try {
                    await deleteAsset(id).unwrap();
                    toast.success('Asset deactivated successfully');
                } catch (err) {
                    console.error('Failed to delete asset:', err);
                    toast.error(err?.data?.message || 'Failed to deactivate asset');
                }
            }
        });
    };

    const filteredAssets = assets;

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
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <HardDrive size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Assets</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Assigned</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stats.assigned}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Available</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stats.total - stats.assigned}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <IndianRupee size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Income</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">₹{(financialStats.grandTotalIncome || 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search assets by name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
                            />
                        </div>

                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                            {['ALL', 'AVAILABLE', 'ASSIGNED', 'MAINTENANCE'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest shrink-0">
                            <Calendar size={18} className="text-emerald-600" />
                            Assignment Date:
                        </div>
                        <div className="flex flex-1 gap-4 w-full">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium"
                            />
                            <span className="text-gray-300 self-center">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium"
                            />
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                                    title="Clear dates"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Assets List */}
                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading assets...</p>
                    </div>
                )}

                {/* Assets List */}
                {!isLoading && (
                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-4">Asset Details</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-3">Assigned To</div>
                            <div className="col-span-3 text-right">Income Generated</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {filteredAssets.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No assets found. Add items with type "Asset" to see them here.
                                </div>
                            ) : (
                                filteredAssets.map(asset => (
                                    <div key={asset._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Laptop size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{asset.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {asset._id.slice(-6).toUpperCase()} • {asset.itemType}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${asset.assetStatus === 'ASSIGNED' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                                }`}>
                                                {asset.assetStatus === 'ASSIGNED' ? <User size={12} /> : <CheckCircle2 size={12} />}
                                                {asset.assetStatus}
                                            </span>
                                        </div>

                                        <div className="col-span-3">
                                            {asset.assetStatus === 'ASSIGNED' && asset.assignedTo ? (
                                                <div className="flex items-center justify-between pr-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{asset.assignedTo.fullName}</p>
                                                        <p className="text-xs text-gray-400">
                                                            Since {new Date(asset.assignmentDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleUnassign(asset._id)}
                                                        disabled={isUnassigning}
                                                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Unassign / Return Asset"
                                                    >
                                                        {isUnassigning ? <Loader2 className="animate-spin" size={16} /> : <UserMinus size={16} />}
                                                    </button>
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

                                        <div className="col-span-3 flex items-center justify-end gap-2 text-right">
                                            <div className="mr-2">
                                                <p className="font-black text-gray-900">₹{(asset.totalIncome || 0).toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Generated</p>
                                            </div>
                                            <button
                                                onClick={() => setViewAsset(asset)}
                                                className="p-2 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAsset(asset);
                                                    setIncomeForm({
                                                        personName: '',
                                                        amount: '',
                                                        date: new Date().toISOString().split('T')[0],
                                                        note: ''
                                                    });
                                                    setShowIncomeModal(true);
                                                }}
                                                className="p-2 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                                                title="Record Income"
                                            >
                                                <IndianRupee size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAssetDelete(asset._id)}
                                                disabled={isDeleting}
                                                className="p-2 hover:bg-rose-50 rounded-lg text-gray-300 hover:text-rose-600 transition-colors"
                                                title="Deactivate Asset"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={meta.totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                )}
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
                                <select
                                    required
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all mb-6"
                                >
                                    <option value="">Select an Admin</option>
                                    {admins.map(admin => (
                                        <option key={admin._id} value={admin._id}>
                                            {admin.fullName}
                                        </option>
                                    ))}
                                </select>
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

            {/* Record Income Modal (Ledger Type) */}
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
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 bg-emerald-50 text-center border-b border-emerald-100">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-emerald-600 border border-emerald-100">
                                    <TrendingUp size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-900">Record Income Entry</h3>
                                <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">{selectedAsset.name}</p>
                            </div>
                            <form onSubmit={handleRecordIncome} className="p-8 space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Received From / Person Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. John Doe / ABC Corp"
                                        value={incomeForm.personName}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, personName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Amount (₹) *</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            placeholder="5000"
                                            value={incomeForm.amount}
                                            onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Entry Date</label>
                                        <input
                                            type="date"
                                            value={incomeForm.date}
                                            onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Note (Optional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Add any details about this entry..."
                                        value={incomeForm.note}
                                        onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium resize-none text-sm"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowIncomeModal(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                                    >Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isUpdating ? <Loader2 className="animate-spin" size={18} /> : "Save Entry"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Asset Detail Modal */}
            <AnimatePresence>
                {viewAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewAsset(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Asset Record</h2>
                                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">UID: {viewAsset._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => setViewAsset(null)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                        <Laptop size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{viewAsset.name}</h3>
                                        <p className="text-sm font-medium text-gray-500">{viewAsset.itemType} • {viewAsset.unit}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className={`text-sm font-bold uppercase ${viewAsset.assetStatus === 'ASSIGNED' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                            {viewAsset.assetStatus}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Income</p>
                                        <p className="text-sm font-bold text-gray-900">₹{viewAsset.totalIncome?.toLocaleString() || '0'}</p>
                                    </div>
                                </div>

                                 <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Income Ledger / History</p>
                                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                                        {(viewAsset.incomeHistory || []).length > 0 ? (
                                            viewAsset.incomeHistory.map((entry, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{entry.personName}</p>
                                                        <p className="text-[10px] text-gray-500">{new Date(entry.date).toLocaleDateString()} {entry.note && `• ${entry.note}`}</p>
                                                    </div>
                                                    <p className="text-sm font-black text-emerald-600">₹{entry.amount.toLocaleString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-center text-gray-400 py-4 italic">No income history recorded.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Assignment Activity</p>

                                    <div className="space-y-4">
                                        {viewAsset.assignmentDate && (
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <UserPlus size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Assigned To {viewAsset.assignedTo?.fullName || 'User'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(viewAsset.assignmentDate).toLocaleDateString(undefined, { dateStyle: 'full' })} at {new Date(viewAsset.assignmentDate).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {viewAsset.unassignmentDate && (
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                    <UserMinus size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Last Returned/Unassigned</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(viewAsset.unassignmentDate).toLocaleDateString(undefined, { dateStyle: 'full' })} at {new Date(viewAsset.unassignmentDate).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {!viewAsset.assignmentDate && !viewAsset.unassignmentDate && (
                                            <div className="flex items-center gap-3 text-gray-400 py-4 italic text-sm">
                                                <Clock size={16} />
                                                No assignment history recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={() => setViewAsset(null)}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </div>
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
