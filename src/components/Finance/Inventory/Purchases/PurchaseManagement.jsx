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
    Trash2,
    FileText,
    User,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/Common/ConfirmModal';
import Pagination from '../Common/Pagination';
import { useGetPurchasesQuery, useCreatePurchaseMutation, useDeletePurchaseMutation } from '../../../../utils/slices/InventoryAndAsset/purchaseApiSlice';
import { useGetVendorsQuery } from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetItemsQuery } from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';
import { getMediaUrl } from '../../../../utils/media';

export default function PurchaseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewPurchase, setViewPurchase] = useState(null);
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
    const { data: purchasesResponse, isLoading, isError } = useGetPurchasesQuery({
        page: currentPage,
        limit: 10,
        search: searchQuery
    });
    const { data: vendorsResponse } = useGetVendorsQuery();
    const { data: itemsResponse } = useGetItemsQuery({}); // Fetch all items (Inventory + Asset)

    const [createPurchase, { isLoading: isCreating }] = useCreatePurchaseMutation();
    const [deletePurchase] = useDeletePurchaseMutation();

    const purchases = purchasesResponse?.data || [];
    const meta = purchasesResponse?.meta || { totalPages: 1 };
    const vendors = vendorsResponse?.data || [];
    const items = itemsResponse?.data || [];

    // Form State
    const [formData, setFormData] = useState({
        vendorId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'PENDING',
        proofFile: null,
        lineItems: []
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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
            toast.warning("Please add at least one item.");
            return;
        }

        // Validate all line items have valid values
        for (const item of formData.lineItems) {
            if (!item.itemId) {
                toast.warning("Please select an item for all line items.");
                return;
            }
            if (!item.qty || Number(item.qty) <= 0) {
                toast.warning("Please enter a valid quantity for all items.");
                return;
            }
            if (!item.price || Number(item.price) < 0) {
                toast.warning("Please enter a valid price for all items.");
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
                paymentStatus: 'PENDING',
                proofFile: null,
                lineItems: []
            });
            toast.success('Purchase recorded successfully');
        } catch (err) {
            console.error('Failed to create purchase:', err);
            toast.error(err?.data?.message || 'Failed to record purchase');
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'danger',
            title: 'Delete Purchase Record',
            message: 'Are you sure you want to delete this purchase record? Stock will be reverted.',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await deletePurchase(id).unwrap();
                    toast.success('Purchase record deleted successfully');
                } catch (err) {
                    console.error('Failed to delete purchase:', err);
                    toast.error(err?.data?.message || 'Failed to delete purchase');
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
                            <ShoppingCart className="text-emerald-600" size={24} />
                            Purchase Management
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ vendorId: '', purchaseDate: new Date().toISOString().split('T')[0], paymentStatus: 'PENDING', proofFile: null, lineItems: [] });
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
                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-1">Ref</div>
                            <div className="col-span-3">Vendor</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2 text-right">Amount</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {purchases.length === 0 ? (
                                <div className="text-center py-20">
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
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="col-span-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
                                                #{po._id.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <p className="font-bold text-gray-900 line-clamp-1">{po.vendorId?.fullName || "Unknown Vendor"}</p>
                                            <p className="text-[10px] text-gray-400 italic">
                                                {po.items.length} {po.items.length === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-gray-600">
                                                {new Date(po.purchaseDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="text-sm font-bold text-gray-900">₹{po.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold 
                                                    ${po.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700' :
                                                    po.paymentStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {po.paymentStatus}
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setViewPurchase(po)}
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {po.bill?.fileUrl && (
                                                <button
                                                    onClick={() => window.open(getMediaUrl(po.bill.fileUrl), '_blank')}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="View Bill Proof"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(po._id)}
                                                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={meta.totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
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

            {/* Purchase Detail Modal */}
            <AnimatePresence>
                {viewPurchase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewPurchase(null)}
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
                                    <h2 className="text-xl font-bold text-gray-900">Purchase Details</h2>
                                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Ref: #{viewPurchase._id.slice(-8)}</p>
                                </div>
                                <button
                                    onClick={() => setViewPurchase(null)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vendor</p>
                                        <p className="font-bold text-gray-900 text-lg">{viewPurchase.vendorId?.fullName || "N/A"}</p>
                                        <p className="text-xs text-gray-500">{viewPurchase.vendorId?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                        <p className="font-bold text-gray-900">{new Date(viewPurchase.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Items Summary</p>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 text-[10px] uppercase text-gray-400 font-bold">
                                                    <th className="px-4 py-3 text-left">Item</th>
                                                    <th className="px-4 py-3 text-center">Qty</th>
                                                    <th className="px-4 py-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {viewPurchase.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3">
                                                            <p className="font-bold text-gray-900">{item.itemId?.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{item.itemId?.itemType}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-600 font-medium">
                                                            {item.quantity} {item.itemId?.unit}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                            ₹{item.totalPrice.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-100/50">
                                                    <td colSpan="2" className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Grand Total</td>
                                                    <td className="px-4 py-4 text-right text-lg font-bold text-emerald-600">
                                                        ₹{viewPurchase.totalAmount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Payment Status</p>
                                            <p className="text-sm font-bold text-emerald-600 tracking-wide uppercase">{viewPurchase.paymentStatus}</p>
                                        </div>
                                    </div>
                                    {viewPurchase.bill?.fileUrl && (
                                        <button
                                            onClick={() => window.open(getMediaUrl(viewPurchase.bill.fileUrl), '_blank')}
                                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                        >
                                            View Proof
                                        </button>
                                    )}
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
