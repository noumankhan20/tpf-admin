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
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetPurchasesQuery, useCreatePurchaseMutation } from '../../../../utils/slices/InventoryAndAsset/purchaseApiSlice';
import { useGetVendorsQuery } from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetItemsQuery } from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';

export default function PurchaseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // API Hooks
    const { data: purchasesResponse, isLoading, isError } = useGetPurchasesQuery(searchQuery);
    const { data: vendorsResponse } = useGetVendorsQuery();
    const { data: itemsResponse } = useGetItemsQuery({}); // Fetch all items (Inventory + Asset)

    const [createPurchase, { isLoading: isCreating }] = useCreatePurchaseMutation();

    const purchases = purchasesResponse?.data || [];
    const vendors = vendorsResponse?.data || [];
    const items = itemsResponse?.data || [];

    // console.log("Items fetched:", items);

    // Form State
    const [formData, setFormData] = useState({
        vendorId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'Pending',
        proofFile: null,
        lineItems: []
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleVendorChange = (e) => {
        setFormData(prev => ({ ...prev, vendorId: e.target.value }));
    };

const addLineItem = () => {
    setFormData(prev => ({
        ...prev,
        lineItems: [...prev.lineItems, { itemId: '', qty: '', price: '', unit: '' }]
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
        
        // If itemId is being updated, also store the unit
        if (field === 'itemId') {
            const selectedItem = items.find(item => item._id === value);
            updatedLines[index] = { 
                ...updatedLines[index], 
                itemId: value,
                unit: selectedItem?.unit || '' // Store the unit
            };
        } else {
            updatedLines[index] = { ...updatedLines[index], [field]: value };
        }
        
        return { ...prev, lineItems: updatedLines };
    });
};

    const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.lineItems.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    // Validate all line items have valid values
    for (const item of formData.lineItems) {
        if (!item.itemId) {
            alert("Please select an item for all line items.");
            return;
        }
        if (!item.qty || Number(item.qty) <= 0) {
            alert("Please enter a valid quantity for all items.");
            return;
        }
        if (!item.price || Number(item.price) < 0) {
            alert("Please enter a valid price for all items.");
            return;
        }
    }

    const formDataToSend = new FormData();
    formDataToSend.append('vendorId', formData.vendorId);
    formDataToSend.append('purchaseDate', formData.purchaseDate);
    formDataToSend.append('paymentStatus', formData.paymentStatus);

    // Correctly structure items for backend with proper number conversion
    const itemsPayload = formData.lineItems.map(item => ({
        itemId: item.itemId,
        quantity: Number(item.qty),
        price: Number(item.price) // Backend expects 'price', not 'unitPrice'
    }));

    formDataToSend.append('items', JSON.stringify(itemsPayload));

    if (formData.proofFile) {
        formDataToSend.append('proof', formData.proofFile);
    }

    try {
        await createPurchase(formDataToSend).unwrap();

        setShowAddModal(false);
        setFormData({
            vendorId: '',
            purchaseDate: new Date().toISOString().split('T')[0],
            paymentStatus: 'Pending',
            proofFile: null,
            lineItems: []
        });
    } catch (err) {
        console.error('Failed to create purchase:', err);
        alert(err?.data?.message || 'Failed to record purchase');
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
                            <ShoppingCart className="text-emerald-600" size={24} />
                            Purchase Management
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ vendorId: '', purchaseDate: new Date().toISOString().split('T')[0], paymentStatus: 'Pending', proofFile: null, lineItems: [] });
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

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading purchases...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Error Loading Purchases</h3>
                        <p className="text-gray-500">Failed to fetch purchase history.</p>
                    </div>
                )}

                {/* Purchase History */}
                {!isLoading && !isError && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Purchases</h2>
                        <AnimatePresence>
                            {purchases.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <ShoppingCart size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No purchases recorded</h3>
                                    <p className="text-gray-500">Record a new purchase to start tracking.</p>
                                </div>
                            ) : (
                                purchases.map((po) => (
                                    <motion.div
                                        key={po._id}
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
                                                    <h3 className="text-lg font-bold text-gray-900">{po.vendorId?.fullName || "Unknown Vendor"}</h3>
                                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                                                        <span className='uppercase'>#{po._id.slice(-6)}</span> <span className="w-1 h-1 rounded-full bg-gray-300"></span> {new Date(po.purchaseDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">₹{po.totalAmount.toLocaleString()}</p>
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mt-1 
                                                    ${po.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700' :
                                                        po.paymentStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    <CheckCircle2 size={12} />
                                                    {po.paymentStatus}
                                                    {po.bill?.fileUrl && <span className="ml-1 text-[10px] underline cursor-pointer" onClick={() => window.open(process.env.NEXT_PUBLIC_BACKEND_API + po.bill.fileUrl, '_blank')}>View Proof</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items Purchased</p>
                                            <div className="grid gap-3">
                                                {po.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${item.itemId?.itemType === 'ASSET' ? 'bg-blue-400' : 'bg-orange-400'}`}></span>
                                                            <span className="font-medium text-gray-700">{item.itemId?.name}</span>
                                                            <span className="text-gray-400">x {item.quantity} {item.itemId?.unit}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-600">₹{item.totalPrice.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* System Behavior Note */}
                                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-[11px] text-gray-400 italic">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">i</div>
                                                Inventory stock updated automatically.
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
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
                                                    value={formData.vendorId}
                                                    onChange={handleVendorChange}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Vendor</option>
                                                    {vendors.map(v => (
                                                        <option key={v._id} value={v._id}>{v.fullName}</option>
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
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PAID">Paid</option>
                                                    <option value="PARTIALLY_PAID">Partial</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proof Upload (Conditional) */}
                                    {(formData.paymentStatus === 'PAID' || formData.paymentStatus === 'PARTIALLY_PAID') && (
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                            <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Upload Payment Proof</label>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setFormData(p => ({ ...p, proofFile: e.target.files[0] }))}
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
                    {items.map(item => (
                        <option key={item._id} value={item._id}>{item.name} ({item.itemType})</option>
                    ))}
                </select>
            </div>
            <div className="w-32">
                <div className="relative">
                 <input
    type="number"
    min="1"
    step="1"
    placeholder="Qty"
    required
    value={line.qty}
    onChange={(e) => updateLineItem(idx, 'qty', e.target.value)}
    className="w-full px-4 py-2 pr-12 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
/>
                    {line.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                            {line.unit}
                        </span>
                    )}
                </div>
            </div>
            <div className="w-32 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</div>
              <input
    type="number"
    min="0"
    step="0.01"
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
                                        disabled={isCreating}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Save Purchase Entry'}
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
