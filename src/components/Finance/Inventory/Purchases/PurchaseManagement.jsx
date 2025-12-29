'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ShoppingCart,
    Plus,
    Search,
    X,
    Calendar,
    IndianRupee,
    Package,
    Trash2,
    FileText,
    User,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PurchaseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock Data
    const VENDORS = [
        { id: 1, name: 'MedPlus Essentials' },
        { id: 2, name: 'Reliance Retail Ltd' },
        { id: 3, name: 'Tata Croma Supplies' }
    ];

    const ITEMS = [
        { id: 1, name: 'MacBook Pro M3', type: 'Asset', unit: 'Nos' },
        { id: 2, name: 'Basmati Rice', type: 'Inventory', unit: 'Kg' },
        { id: 3, name: 'iPhone 15', type: 'Asset', unit: 'Nos' },
        { id: 4, name: 'Wheat Flour', type: 'Inventory', unit: 'Kg' },
    ];

    const [purchases, setPurchases] = useState([
        {
            id: 'PO-2024-001',
            vendor: 'Tata Croma Supplies',
            date: '2024-12-28',
            totalAmount: 450000,
            items: [
                { name: 'MacBook Pro M3', qty: 2, price: 200000, type: 'Asset' },
                { name: 'iPhone 15', qty: 1, price: 50000, type: 'Asset' }
            ],
            status: 'Completed'
        },
        {
            id: 'PO-2024-002',
            vendor: 'Reliance Retail Ltd',
            date: '2024-12-25',
            totalAmount: 12000,
            items: [
                { name: 'Basmati Rice', qty: 100, price: 80, type: 'Inventory' },
                { name: 'Wheat Flour', qty: 50, price: 40, type: 'Inventory' }
            ],
            status: 'Completed'
        }
    ]);

    // Form State
    const [formData, setFormData] = useState({
        vendorName: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'Pending',
        lineItems: []
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleVendorChange = (e) => {
        setFormData(prev => ({ ...prev, vendorName: e.target.value }));
    };

    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { itemId: '', qty: 1, price: 0 }]
        }));
    };

    const removeLineItem = (index) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index)
        }));
    };

    const updateLineItem = (index, field, value) => {
        setFormData(prev => {
            const updatedLines = [...prev.lineItems];
            updatedLines[index] = { ...updatedLines[index], [field]: value };
            return { ...prev, lineItems: updatedLines };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Calculate total
        const total = formData.lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);

        // Map items to readable format
        const readableItems = formData.lineItems.map(line => {
            const itemDef = ITEMS.find(i => i.id.toString() === line.itemId.toString());
            return {
                name: itemDef?.name || 'Unknown Item',
                qty: Number(line.qty),
                price: Number(line.price),
                type: itemDef?.type
            };
        });

        const newPurchase = {
            id: `PO-2024-${String(purchases.length + 1).padStart(3, '0')}`,
            vendor: formData.vendorName,
            date: formData.purchaseDate,
            totalAmount: total,
            items: readableItems,
            items: readableItems,
            status: formData.paymentStatus === 'Paid' ? 'Completed' : 'Pending Payment'
        };

        setPurchases(prev => [newPurchase, ...prev]);
        setShowAddModal(false);
        setFormData({ vendorName: '', purchaseDate: new Date().toISOString().split('T')[0], paymentStatus: 'Pending', lineItems: [] });
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
                            <ShoppingCart className="text-emerald-600" size={24} />
                            Purchase Management
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ vendorName: '', purchaseDate: new Date().toISOString().split('T')[0], paymentStatus: 'Pending', lineItems: [] });
                            setShowAddModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        New Purchase
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search PO number or vendor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Purchase History */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Purchases</h2>
                    <AnimatePresence>
                        {purchases.map((po) => (
                            <motion.div
                                key={po.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{po.vendor}</h3>
                                            <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                                                {po.id} <span className="w-1 h-1 rounded-full bg-gray-300"></span> {po.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">₹{po.totalAmount.toLocaleString()}</p>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold mt-1">
                                            <CheckCircle2 size={12} />
                                            {po.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items Purchased</p>
                                    <div className="grid gap-3">
                                        {po.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${item.type === 'Asset' ? 'bg-blue-400' : 'bg-orange-400'}`}></span>
                                                    <span className="font-medium text-gray-700">{item.name}</span>
                                                    <span className="text-gray-400">x {item.qty}</span>
                                                </div>
                                                <span className="font-bold text-gray-600">₹{item.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* System Behavior Note */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-[11px] text-gray-400 italic">
                                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">i</div>
                                        Assets automatically registered. Inventory stock updated.
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            {/* Add Purchase Modal */}
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
                                    <h2 className="text-xl font-bold text-gray-900">Record New Purchase</h2>
                                    <p className="text-sm text-gray-500">Log incoming stock or assets</p>
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
                                    {/* Vendor & Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Vendor</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.vendorName}
                                                    onChange={handleVendorChange}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Vendor</option>
                                                    {VENDORS.map(v => (
                                                        <option key={v.id} value={v.name}>{v.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Purchase Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.purchaseDate}
                                                    onChange={(e) => setFormData(p => ({ ...p, purchaseDate: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Payment Status</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.paymentStatus}
                                                    onChange={(e) => setFormData(p => ({ ...p, paymentStatus: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Partial">Partial</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proof Upload (Conditional) */}
                                    {(formData.paymentStatus === 'Paid' || formData.paymentStatus === 'Partial') && (
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                            <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Upload Payment Proof</label>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all"
                                            />
                                        </div>
                                    )}

                                    {/* Line Items */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items & Quantities</label>
                                        </div>

                                        <div className="space-y-3">
                                            {formData.lineItems.map((line, idx) => (
                                                <div key={idx} className="flex gap-3 items-start">
                                                    <div className="flex-1">
                                                        <select
                                                            required
                                                            value={line.itemId}
                                                            onChange={(e) => updateLineItem(idx, 'itemId', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
                                                        >
                                                            <option value="">Select Item</option>
                                                            {ITEMS.map(item => (
                                                                <option key={item.id} value={item.id}>{item.name} ({item.type})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="w-24">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="Qty"
                                                            required
                                                            value={line.qty}
                                                            onChange={(e) => updateLineItem(idx, 'qty', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
                                                        />
                                                    </div>
                                                    <div className="w-32 relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</div>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Price"
                                                            required
                                                            value={line.price}
                                                            onChange={(e) => updateLineItem(idx, 'price', e.target.value)}
                                                            className="w-full pl-6 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLineItem(idx)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addLineItem}
                                            className="mt-3 text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Add another item
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                    <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-500">
                                        <span>Total Amount</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            ₹{formData.lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                                    >
                                        Save Purchase Entry
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
