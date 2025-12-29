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
    PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryStock() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Mock Data
    const [stock, setStock] = useState([
        { id: 1, name: 'Basmati Rice', unit: 'Kg', purchased: 500, used: 120, remaining: 380, category: 'Food' },
        { id: 2, name: 'Wheat Flour', unit: 'Kg', purchased: 300, used: 50, remaining: 250, category: 'Food' },
        { id: 3, name: 'Surgical Masks', unit: 'Box', purchased: 1000, used: 850, remaining: 150, category: 'Medical' },
        { id: 4, name: 'Blankets', unit: 'Nos', purchased: 200, used: 45, remaining: 155, category: 'Relief' }
    ]);

    // Form State
    const [distributeData, setDistributeData] = useState({
        qty: '',
        purpose: 'Sadaqah',
        notes: ''
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const openDistributeModal = (item) => {
        setSelectedItem(item);
        setDistributeData({ qty: '', purpose: 'Sadaqah', notes: '' });
        setShowDistributeModal(true);
    };

    const handleDistribute = (e) => {
        e.preventDefault();
        const qty = Number(distributeData.qty);

        if (qty > selectedItem.remaining) {
            alert(`Cannot distribute more than remaining stock (${selectedItem.remaining} ${selectedItem.unit})`);
            return;
        }

        setStock(prev => prev.map(item =>
            item.id === selectedItem.id
                ? { ...item, used: item.used + qty, remaining: item.remaining - qty }
                : item
        ));

        setShowDistributeModal(false);
    };

    const filteredStock = stock.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
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

                {/* Stock Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredStock.map((item) => {
                            const usagePercent = Math.min((item.used / item.purchased) * 100, 100);
                            const isLowStock = item.remaining < (item.purchased * 0.2); // Low stock if < 20%

                            return (
                                <motion.div
                                    key={item.id}
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
                                                <p className="text-xs font-medium text-gray-400">{item.category}</p>
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
                                            <span className="text-gray-500 font-medium">Purchased</span>
                                            <span className="font-bold text-gray-900">{item.purchased} <span className="text-xs text-gray-400">{item.unit}</span></span>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className="font-bold text-emerald-600">Remaining: {item.remaining}</span>
                                                <span className="font-bold text-gray-400">Used: {item.used}</span>
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

                                    <button
                                        onClick={() => openDistributeModal(item)}
                                        className="w-full py-3 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl text-gray-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        <Share2 size={16} />
                                        Distribute Stock
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
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
                                    <p className="text-xs text-gray-600">{selectedItem.name} ({selectedItem.remaining} {selectedItem.unit} left)</p>
                                </div>
                            </div>

                            <form onSubmit={handleDistribute} className="p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Quantity to Distribute</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedItem.remaining}
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
                                    Confirm Distribution
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
