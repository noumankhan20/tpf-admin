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
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetAssetsQuery,
    useAssignAssetMutation,
    useUnassignAssetMutation,
    useUpdateAssetIncomeMutation
} from '../../../../utils/slices/InventoryAndAsset/assetApiSlice';
import { useGetAdminListQuery } from '../../../../utils/slices/adminApiSlice';

export default function AssetManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // API Hooks
    const { data: assetsData, isLoading } = useGetAssetsQuery();
    const { data: adminListData } = useGetAdminListQuery();
    const [assignAsset, { isLoading: isAssigning }] = useAssignAssetMutation();
    const [unassignAsset, { isLoading: isUnassigning }] = useUnassignAssetMutation();
    const [updateIncome, { isLoading: isUpdating }] = useUpdateAssetIncomeMutation();

    const assets = assetsData?.data || [];
    const admins = adminListData?.data || [];

    // Form States
    const [assigneeId, setAssigneeId] = useState('');
    const [incomeAmount, setIncomeAmount] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await assignAsset({ assetId: selectedAsset._id, assignedTo: assigneeId }).unwrap();
            setShowAssignModal(false);
            setAssigneeId('');
            setSelectedAsset(null);
        } catch (err) {
            console.error('Failed to assign asset:', err);
            alert(err?.data?.message || 'Failed to assign asset');
        }
    };

    const handleRecordIncome = async (e) => {
        e.preventDefault();
        try {
            const amount = Number(incomeAmount);
            await updateIncome({ assetId: selectedAsset._id, monthlyIncome: amount }).unwrap();
            setShowIncomeModal(false);
            setIncomeAmount('');
            setSelectedAsset(null);
        } catch (err) {
            console.error('Failed to update income:', err);
            alert(err?.data?.message || 'Failed to update income');
        }
    };

    const handleUnassign = async (id) => {
        if (confirm('Are you sure you want to unassign this asset? This will make it available for others.')) {
            try {
                await unassignAsset(id).unwrap();
            } catch (err) {
                console.error('Failed to unassign asset:', err);
                alert(err?.data?.message || 'Failed to unassign asset');
            }
        }
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.assignedTo?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
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

                                        <div className="col-span-3 flex items-center justify-end gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">₹{(asset.totalIncome || 0).toLocaleString()}</p>
                                                <p className="text-xs text-green-600 font-medium">+₹{(asset.monthlyIncome || 0).toLocaleString()}/mo</p>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedAsset(asset); setIncomeAmount(asset.monthlyIncome || ''); setShowIncomeModal(true); }}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                                                title="Record Income"
                                            >
                                                <IndianRupee size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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
