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
    PieChart,
    Trash2,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetInventoryStockQuery,
    useDistributeStockMutation
} from '../../../../utils/slices/InventoryAndAsset/stockApiSlice';
import { useDeleteItemMutation } from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';
import Pagination from '../Common/Pagination';

export default function InventoryStock() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // API Hooks
    const { data: stockResponse, isLoading } = useGetInventoryStockQuery({
        page: currentPage,
        limit: 12,
        search: searchQuery
    });
    const [distributeStock, { isLoading: isDistributing }] = useDistributeStockMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

    const stock = stockResponse?.data || [];
    const meta = stockResponse?.meta || { totalPages: 1 };

    // Form State
    const [distributeData, setDistributeData] = useState({
        qty: '',
        purpose: 'Sadaqah',
        notes: ''
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const openDistributeModal = (item) => {
        setSelectedItem(item);
        setDistributeData({ qty: '', purpose: 'Sadaqah', notes: '' });
        setShowDistributeModal(true);
    };

    const handleDistribute = async (e) => {
        e.preventDefault();
        const qty = Number(distributeData.qty);

        if (qty > selectedItem.currentStock) {
            alert(`Cannot distribute more than remaining stock (${selectedItem.currentStock} ${selectedItem.unit})`);
            return;
        }

        try {
            await distributeStock({
                itemId: selectedItem._id,
                quantity: qty,
                purpose: distributeData.purpose
            }).unwrap();
            setShowDistributeModal(false);
        } catch (err) {
            console.error('Failed to distribute stock:', err);
            alert(err?.data?.message || 'Failed to distribute stock');
        }
    };

    // Data is filtered by backend search query, but we can verify here if needed.
    // The backend handles filtering, so 'stock' is already filtered.
    const filteredStock = stock;

    const handleStockDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this inventory item?')) {
            try {
                await deleteItem(id).unwrap();
            } catch (err) {
                console.error('Failed to delete item:', err);
                alert(err?.data?.message || 'Failed to deactivate item');
            }
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
                            <ClipboardList className="text-emerald-600" size={24} />
                            Inventory Stock
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
                        placeholder="Search stock items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading stock...</p>
                    </div>
                )}

                {/* Stock Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredStock.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-gray-500">
                                    No inventory items found. Create items with type 'Inventory'.
                                </div>
                            ) : (
                                filteredStock.map((item) => {
                                    // Calculate usage percentage
                                    const totalVolume = item.totalPurchased || 0;
                                    // Avoid division by zero
                                    const usagePercent = totalVolume > 0
                                        ? Math.min((item.totalDistributed / totalVolume) * 100, 100)
                                        : 0;

                                    const isLowStock = totalVolume > 0 && item.currentStock < (totalVolume * 0.2);

                                    return (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                                        <p className="text-xs font-medium text-gray-400">Inventory Item</p>
                                                    </div>
                                                </div>
                                                {isLowStock && (
                                                    <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg tracking-wider border border-red-100">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stock Bars */}
                                            <div className="space-y-4 mb-6">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Total Managed</span>
                                                    <span className="font-bold text-gray-900">{item.totalPurchased} <span className="text-xs text-gray-400">{item.unit}</span></span>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                                        <span className="font-bold text-emerald-600">Remaining: {item.currentStock}</span>
                                                        <span className="font-bold text-gray-400">Used: {item.totalDistributed}</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                                        <div
                                                            className="h-full bg-orange-200"
                                                            style={{ width: `${usagePercent}%` }}
                                                        ></div>
                                                        <div
                                                            className="h-full bg-emerald-500"
                                                            style={{ width: `${100 - usagePercent}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openDistributeModal(item)}
                                                    className="flex-1 py-3 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl text-gray-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Share2 size={16} />
                                                    Distribute Stock
                                                </button>
                                                <button
                                                    onClick={() => handleStockDelete(item._id)}
                                                    disabled={isDeleting}
                                                    className="px-3 bg-gray-50 hover:bg-rose-50 text-gray-300 hover:text-rose-600 rounded-xl transition-all flex items-center justify-center"
                                                    title="Deactivate Item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>

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
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                                    <Share2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Distribute Stock</h3>
                                    <p className="text-xs text-gray-600">{selectedItem.name} ({selectedItem.currentStock} {selectedItem.unit} left)</p>
                                </div>
                            </div>

                            <form onSubmit={handleDistribute} className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Quantity to Distribute</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedItem.currentStock}
                                            required
                                            value={distributeData.qty}
                                            onChange={(e) => setDistributeData(p => ({ ...p, qty: e.target.value }))}
                                            placeholder="0"
                                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none text-lg font-bold text-gray-900"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{selectedItem.unit}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Purpose</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Sadaqah', 'Donation', 'Internal'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setDistributeData(p => ({ ...p, purpose: type }))}
                                                className={`py-2 text-xs font-bold rounded-lg border transition-all ${distributeData.purpose === type
                                                    ? 'bg-orange-600 text-white border-orange-600'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                                >
                                    {isDistributing ? <Loader2 className="animate-spin" /> : 'Confirm Distribution'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
