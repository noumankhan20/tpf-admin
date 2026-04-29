'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ClipboardList,
    Search,
    Package,
    ArrowRight,
    TrendingDown,
    Info,
    X,
    Share2,
    Trash2,
    Loader2,
    Edit2,
    ChevronDown,
    Tag,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/Common/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetInventoryStockQuery,
    useDistributeStockMutation
} from '../../../../utils/slices/InventoryAndAsset/stockApiSlice';
import { useUpdateItemMutation, useDeleteItemMutation } from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';
import { useGetInventoryDashboardStatsQuery } from '../../../../utils/slices/InventoryAndAsset/dashboardApiSlice';
import Pagination from '../Common/Pagination';

export default function InventoryStock() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, LOW_STOCK
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

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
    const { data: stockResponse, isLoading, isError } = useGetInventoryStockQuery({
        page: currentPage,
        limit: 10,
        search: searchQuery
    });
    
    // Get Stats for summary cards
    const { data: dashboardStats } = useGetInventoryDashboardStatsQuery();
    const invStats = dashboardStats?.data?.inventory || { totalStock: 0, lowStockCount: 0 };

    const [distributeStock, { isLoading: isDistributing }] = useDistributeStockMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

    const stock = stockResponse?.data || [];
    const meta = stockResponse?.meta || { totalPages: 1 };

    // Form State
    const [distributeData, setDistributeData] = useState({
        qty: '',
        purpose: 'Sadaqah',
        notes: ''
    });

    const [editForm, setEditForm] = useState({
        name: '',
        unit: 'PIECE',
        status: 'ACTIVE'
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const openDistributeModal = (item) => {
        setSelectedItem(item);
        setDistributeData({ qty: '', purpose: 'Sadaqah', notes: '' });
        setShowDistributeModal(true);
    };

    const handleDistribute = async (e) => {
        e.preventDefault();
        const qty = Number(distributeData.qty);

        if (qty > selectedItem.currentStock) {
            toast.warning(`Cannot distribute more than remaining stock (${selectedItem.currentStock} ${selectedItem.unit})`);
            return;
        }

        try {
            await distributeStock({
                itemId: selectedItem._id,
                quantity: qty,
                purpose: distributeData.purpose
            }).unwrap();
            setShowDistributeModal(false);
            toast.success('Stock distributed successfully');
        } catch (err) {
            console.error('Failed to distribute stock:', err);
            toast.error(err?.data?.message || 'Failed to distribute stock');
        }
    };

    const handleEditOpen = (item) => {
        setEditingItem(item);
        setEditForm({
            name: item.name,
            unit: item.unit || 'PIECE',
            status: item.status || 'ACTIVE'
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateItem({
                itemId: editingItem._id,
                data: editForm
            }).unwrap();
            setShowEditModal(false);
            setEditingItem(null);
            toast.success('Inventory item updated successfully');
        } catch (err) {
            console.error('Failed to update item:', err);
            toast.error(err?.data?.message || 'Failed to update item');
        }
    };

    // Client-side filtering for low stock since it's based on a percentage threshold
    const filteredStock = stock.filter(item => {
        if (statusFilter === 'LOW_STOCK') {
            const totalVolume = item.totalPurchased || 0;
            return totalVolume > 0 && item.currentStock < (totalVolume * 0.2);
        }
        return true;
    });

    const handleStockDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'danger',
            title: 'Deactivate Inventory Item',
            message: 'Are you sure you want to deactivate this inventory item?',
            confirmText: 'Deactivate',
            onConfirm: async () => {
                try {
                    await deleteItem(id).unwrap();
                    toast.success('Item deactivated successfully');
                } catch (err) {
                    console.error('Failed to delete item:', err);
                    toast.error(err?.data?.message || 'Failed to deactivate item');
                }
            }
        });
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
                            <ClipboardList className="text-emerald-600" size={24} />
                            Inventory Stock
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Package size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Overall Stock Items</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{invStats.totalStock}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md border-l-4 border-l-rose-500">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <TrendingDown size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Critical Low Stock</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{invStats.lowStockCount}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Share2 size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Stock Usage Rate</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-gray-900">84%</p>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">+5% this week</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search stock items by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
                        />
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                        {['ALL', 'LOW_STOCK'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading current stock levels...</p>
                    </div>
                )}

                {/* Stock List View */}
                {!isLoading && (
                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-5">Stock Item / Details</div>
                            <div className="col-span-4">Availability & Usage</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {filteredStock.length === 0 ? (
                                <div className="text-center py-20 px-4">
                                    <Package className="mx-auto text-gray-200 mb-4" size={48} />
                                    <h3 className="text-lg font-bold text-gray-900">No stock results</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
                                </div>
                            ) : (
                                filteredStock.map((item) => {
                                    const totalVolume = item.totalPurchased || 0;
                                    const usagePercent = totalVolume > 0
                                        ? Math.min((item.totalDistributed / totalVolume) * 100, 100)
                                        : 0;
                                    const isLowStock = totalVolume > 0 && item.currentStock < (totalVolume * 0.2);

                                    return (
                                        <div key={item._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group focus-within:bg-gray-50">
                                            <div className="col-span-5 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="font-bold text-gray-900">{item.name}</p>
                                                        {isLowStock && (
                                                            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded tracking-tighter border border-rose-200">
                                                                Low
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-tight">
                                                        <ClipboardList size={10} /> {item.unit} Based tracking • Active
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="col-span-4">
                                                <div className="flex items-center justify-between text-[10px] font-bold mb-1.5 px-0.5">
                                                    <div>
                                                        <span className="text-emerald-600">REMAINING: {item.currentStock}</span>
                                                        <span className="text-gray-300 mx-1.5">|</span>
                                                        <span className="text-gray-400">USED: {item.totalDistributed}</span>
                                                    </div>
                                                    <span className="text-gray-400 tracking-tighter uppercase">Total: {item.totalPurchased}</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                                    <div
                                                        className="h-full bg-orange-200 transition-all duration-1000"
                                                        style={{ width: `${usagePercent}%` }}
                                                    ></div>
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                                        style={{ width: `${100 - usagePercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="col-span-3 flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDistributeModal(item)}
                                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                                >
                                                    <Share2 size={14} /> Distribute
                                                </button>
                                                <button
                                                    onClick={() => handleEditOpen(item)}
                                                    className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Edit Item"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStockDelete(item._id)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Deactivate Item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
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

            {/* Distribute Modal */}
            <AnimatePresence>
                {/* ... (Keep existing modal code but wrap with motion if needed, already had it) ... */}
                {showDistributeModal && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDistributeModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 bg-orange-50 border-b border-orange-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm shrink-0 border border-orange-100">
                                    <Share2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Distribute Stock</h3>
                                    <p className="text-xs text-gray-600 font-medium uppercase tracking-tighter">{selectedItem.name} ({selectedItem.currentStock} {selectedItem.unit} left)</p>
                                </div>
                            </div>

                            <form onSubmit={handleDistribute} className="p-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Quantity to Distribute</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedItem.currentStock}
                                            required
                                            value={distributeData.qty}
                                            onChange={(e) => setDistributeData(p => ({ ...p, qty: e.target.value }))}
                                            placeholder="0"
                                            className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-orange-500 outline-none text-2xl font-black text-gray-900 shadow-inner"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">{selectedItem.unit}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Distribution Purpose</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Sadaqah', 'Donation', 'Internal'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setDistributeData(p => ({ ...p, purpose: type }))}
                                                className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${distributeData.purpose === type
                                                    ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200'
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isDistributing}
                                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isDistributing ? <Loader2 className="animate-spin" size={20} /> : <><Share2 size={20} /> Confirm Distribution</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Item Modal */}
            <AnimatePresence>
                {showEditModal && editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Edit Inventory Item</h2>
                                    <p className="text-sm text-gray-500">Update naming and status</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Item Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Unit *</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                required
                                                value={editForm.unit}
                                                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none appearance-none font-bold text-sm"
                                            >
                                                {["KG", "GRAM", "LITRE", "ML", "PIECE", "BOX", "METER", "FEET", "HOUR", "DAY"].map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status *</label>
                                        <div className="relative">
                                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                required
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none appearance-none font-bold text-sm"
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : "Update Item"}
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

