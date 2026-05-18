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
    Clock,
    User,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Eye,
    Edit2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/Common/ConfirmModal';
import Pagination from '../Common/Pagination';
import { 
    useGetPurchasesQuery, 
    useCreatePurchaseMutation, 
    useUpdatePurchaseMutation,
    useDeletePurchaseMutation 
} from '../../../../utils/slices/InventoryAndAsset/purchaseApiSlice';
import { useCreateDeleteRequestMutation } from '../../../../utils/slices/deleteApiSlice';
import { useGetVendorsQuery } from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetItemsQuery } from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';
import { useGetInventoryDashboardStatsQuery } from '../../../../utils/slices/InventoryAndAsset/dashboardApiSlice';
import { getMediaUrl } from '../../../../utils/media';

export default function PurchaseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [viewPurchase, setViewPurchase] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [vendorFilter, setVendorFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const adminInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('adminInfo') || '{}') : {};
    const isSuperAdmin = adminInfo.role === 'SuperAdmin' || adminInfo.isSuperAdmin === true;

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
        search: searchQuery,
        paymentStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
        vendorId: vendorFilter !== 'ALL' ? vendorFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
    });

    const { data: dashboardStats } = useGetInventoryDashboardStatsQuery();
    const supplyStats = dashboardStats?.data?.supplyChain || { totalPurchases: 0, totalSpend: 0, pendingAmount: 0, pendingPurchases: 0 };

    const { data: vendorsResponse } = useGetVendorsQuery({ status: 'ACTIVE' });
    const { data: itemsResponse } = useGetItemsQuery({ status: 'ACTIVE' });

    const [createPurchase, { isLoading: isCreating }] = useCreatePurchaseMutation();
    const [updatePurchase, { isLoading: isUpdating }] = useUpdatePurchaseMutation();
    const [deletePurchase, { isLoading: isDeleting }] = useDeletePurchaseMutation();
    const [createDeleteRequest, { isLoading: isRequestingDelete }] = useCreateDeleteRequestMutation();

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
        lineItems: [{ itemId: '', itemName: '', qty: '', price: '', unit: '' }]
    });

    const selectedVendor = vendors.find(v => v._id === formData.vendorId);
    const isIndividualVendor = selectedVendor?.vendorType === 'INDIVIDUAL';

    // Custom Searchable Vendor Dropdown State & Logic
    const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [vendorPage, setVendorPage] = useState(1);
    const vendorRef = React.useRef(null);

    // Handle outside clicks for Vendor Dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (vendorRef.current && !vendorRef.current.contains(event.target)) {
                setVendorDropdownOpen(false);
            }
        }
        if (vendorDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [vendorDropdownOpen]);

    // Filter vendors based on search query
    const filteredVendors = React.useMemo(() => {
        if (!vendors) return [];
        // Sort vendors alphabetically by fullName
        const sorted = [...vendors].sort((a, b) => {
            const nameA = a.fullName || '';
            const nameB = b.fullName || '';
            return nameA.localeCompare(nameB);
        });

        if (!vendorSearch) return sorted;
        const searchLower = vendorSearch.toLowerCase();
        return sorted.filter(v => v.fullName?.toLowerCase().includes(searchLower) || String(v.contactNumber || '').includes(searchLower));
    }, [vendors, vendorSearch]);

    // Paginate matching vendors (20 per page)
    const ITEMS_PER_PAGE_VENDOR = 20;
    const totalVendorPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE_VENDOR) || 1;
    
    // Adjust current page if search reduces the matches below page range
    useEffect(() => {
        if (vendorPage > totalVendorPages) {
            setVendorPage(totalVendorPages);
        }
    }, [filteredVendors.length, totalVendorPages, vendorPage]);

    const paginatedVendors = React.useMemo(() => {
        const startIndex = (vendorPage - 1) * ITEMS_PER_PAGE_VENDOR;
        return filteredVendors.slice(startIndex, startIndex + ITEMS_PER_PAGE_VENDOR);
    }, [filteredVendors, vendorPage]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, vendorFilter, startDate, endDate]);

    const resetForm = () => {
        setFormData({
            vendorId: '',
            purchaseDate: new Date().toISOString().split('T')[0],
            paymentStatus: 'PENDING',
            proofFile: null,
            lineItems: [{ itemId: '', itemName: '', qty: '', price: '', unit: '' }]
        });
        setEditingPurchase(null);
        setVendorSearch('');
        setVendorPage(1);
        setVendorDropdownOpen(false);
    };

    const handleEdit = (po) => {
        setEditingPurchase(po);
        setFormData({
            vendorId: po.vendorId?._id || '',
            purchaseDate: new Date(po.purchaseDate).toISOString().split('T')[0],
            paymentStatus: po.paymentStatus,
            proofFile: null,
            lineItems: po.items.map(item => ({
                itemId: item.itemId?._id || item.itemId || '',
                itemName: item.itemName || '',
                qty: item.quantity,
                price: item.unitPrice,
                unit: item.itemId?.unit || ''
            }))
        });
        setShowAddModal(true);
    };

    const handleVendorChange = (e) => {
        setFormData(prev => ({ ...prev, vendorId: e.target.value }));
    };

    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { itemId: '', itemName: '', qty: '', price: '', unit: '' }]
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
            if (field === 'itemId') {
                const selectedItem = items.find(item => item._id === value);
                updatedLines[index] = {
                    ...updatedLines[index],
                    itemId: value,
                    unit: selectedItem?.unit || ''
                };
            } else {
                updatedLines[index] = { ...updatedLines[index], [field]: value };
            }
            return { ...prev, lineItems: updatedLines };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.lineItems.length === 0) {
            toast.warning("Please add at least one item.");
            return;
        }

        // Validation
        const selectedVendor = vendors.find(v => v._id === formData.vendorId);
        const isIndividualVendor = selectedVendor?.vendorType === 'INDIVIDUAL';

        for (const item of formData.lineItems) {
            if (!isIndividualVendor && !item.itemId) {
                toast.warning("Please select an item for all line items.");
                return;
            }
            if (isIndividualVendor && !item.itemName?.trim()) {
                toast.warning("Please enter a description for all line items.");
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

        const itemsPayload = formData.lineItems.map(item => {
            if (isIndividualVendor) {
                return {
                    itemName: item.itemName,
                    quantity: Number(item.qty),
                    price: Number(item.price)
                };
            } else {
                return {
                    itemId: item.itemId,
                    quantity: Number(item.qty),
                    price: Number(item.price)
                };
            }
        });
        formDataToSend.append('items', JSON.stringify(itemsPayload));

        if (formData.proofFile) {
            formDataToSend.append('proof', formData.proofFile);
        }

        try {
            if (editingPurchase) {
                await updatePurchase({
                    id: editingPurchase._id,
                    data: formDataToSend
                }).unwrap();
                toast.success('Purchase updated successfully');
            } else {
                await createPurchase(formDataToSend).unwrap();
                toast.success('Purchase recorded successfully');
            }

            setShowAddModal(false);
            resetForm();
        } catch (err) {
            console.error('Failed to save purchase:', err);
            toast.error(err?.data?.message || 'Failed to save purchase');
        }
    };

    const handleDelete = (po) => {
        setConfirmModal({
            isOpen: true,
            type: 'danger',
            title: isSuperAdmin ? 'Delete Purchase Permanently' : 'Request Deletion',
            message: isSuperAdmin 
                ? 'Are you sure you want to permanently delete this purchase record? This action cannot be undone and stock will be reverted.' 
                : 'This will send a request to the Super Admin to permanently remove this purchase record.',
            confirmText: isSuperAdmin ? 'Delete Permanently' : 'Send Request',
            onConfirm: async () => {
                try {
                    if (isSuperAdmin) {
                        await deletePurchase(po._id).unwrap();
                        toast.success('Purchase record deleted permanently');
                    } else {
                        await createDeleteRequest({
                            entityId: po._id,
                            entityModel: 'Purchase',
                            module: 'Inventory / Purchases',
                            entityName: `PO from ${po.vendorId?.fullName || 'Vendor'} (#${po._id.slice(-4)})`
                        }).unwrap();
                        toast.success('Deletion request sent to Super Admin');
                    }
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
                            resetForm();
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
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ShoppingCart size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{supplyStats.totalPurchases}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <IndianRupee size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Spend</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">₹{supplyStats.totalSpend?.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Dues</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">₹{supplyStats.pendingAmount?.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <AlertCircle size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Orders</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{supplyStats.pendingPurchases}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search entries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
                                />
                            </div>

                            <div className="relative flex-1 max-w-xs">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={vendorFilter}
                                    onChange={(e) => setVendorFilter(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium appearance-none"
                                >
                                    <option value="ALL">All Vendors</option>
                                    {vendors.map(v => (
                                        <option key={v._id} value={v._id}>{v.fullName}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            </div>
                        </div>

                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                            {['ALL', 'PENDING', 'PAID', 'PARTIALLY_PAID'].map((status) => (
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
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading purchases...</p>
                    </div>
                )}

                {/* Purchase List */}
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
                                    <h3 className="text-lg font-bold text-gray-900">No purchases found</h3>
                                    <p className="text-gray-500">Record a new purchase to see it here.</p>
                                </div>
                            ) : (
                                purchases.map((po) => (
                                    <div key={po._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
                                                #{po._id.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <p className="font-bold text-gray-900 line-clamp-1">{po.vendorId?.fullName || "N/A"}</p>
                                            <p className="text-[10px] text-gray-400">{po.items.length} items</p>
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-600">
                                            {new Date(po.purchaseDate).toLocaleDateString()}
                                        </div>
                                        <div className="col-span-2 text-right font-bold text-gray-900">
                                            ₹{po.totalAmount.toLocaleString()}
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${po.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {po.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-1">
                                            <button onClick={() => setViewPurchase(po)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Eye size={18} /></button>
                                            <button onClick={() => handleEdit(po)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                                                                         <button 
                                                onClick={() => handleDelete(po)} 
                                                disabled={isDeleting || isRequestingDelete}
                                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title={isSuperAdmin ? "Delete Permanently" : "Request Deletion"}
                                            >
                                                {isDeleting || isRequestingDelete ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <Pagination currentPage={currentPage} totalPages={meta.totalPages} onPageChange={setCurrentPage} />
            </main>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowAddModal(false); resetForm(); }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{editingPurchase ? 'Edit Purchase Entry' : 'New Purchase Entry'}</h2>
                                    <p className="text-sm text-gray-500">Record procurement of assets/inventory</p>
                                </div>
                                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor</label>
                                            <div ref={vendorRef} className="relative z-20">
                                                {/* Hidden input for HTML5 form validation */}
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.vendorId}
                                                    onChange={() => {}}
                                                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                                />

                                                <div 
                                                    onClick={() => setVendorDropdownOpen(prev => !prev)}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
                                                >
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <span className={`text-sm ${selectedVendor ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
                                                        {selectedVendor 
                                                            ? selectedVendor.fullName 
                                                            : 'Choose Vendor'}
                                                    </span>
                                                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${vendorDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                                </div>

                                                {/* Dropdown panel */}
                                                <AnimatePresence>
                                                    {vendorDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                                                        >
                                                            {/* Search field */}
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search vendor..."
                                                                    value={vendorSearch}
                                                                    onChange={(e) => {
                                                                        setVendorSearch(e.target.value);
                                                                        setVendorPage(1);
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                                                                />
                                                                {vendorSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setVendorSearch('');
                                                                            setVendorPage(1);
                                                                        }}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Paginated Options List */}
                                                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                                <div 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(p => ({ ...p, vendorId: '' }));
                                                                        setVendorDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${!formData.vendorId ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                                                >
                                                                    Choose Vendor (None)
                                                                </div>

                                                                {paginatedVendors.length === 0 ? (
                                                                    <div className="text-center py-4 text-xs text-gray-400 font-medium">
                                                                        No vendors match your search.
                                                                    </div>
                                                                ) : (
                                                                    paginatedVendors.map(vendor => {
                                                                        const isSelected = formData.vendorId === vendor._id;
                                                                        return (
                                                                            <div
                                                                                key={vendor._id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFormData(p => ({ ...p, vendorId: vendor._id }));
                                                                                    setVendorDropdownOpen(false);
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${isSelected ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                                            >
                                                                                {vendor.fullName}
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            {/* Pagination controls */}
                                                            {totalVendorPages > 1 && (
                                                                <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                                                    <button
                                                                        type="button"
                                                                        disabled={vendorPage === 1}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setVendorPage(p => Math.max(1, p - 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        <ChevronLeft size={12} />
                                                                        Prev
                                                                    </button>
                                                                    <span>
                                                                        Page {vendorPage} of {totalVendorPages}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={vendorPage === totalVendorPages}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setVendorPage(p => Math.min(totalVendorPages, p + 1));
                                                                        }}
                                                                        className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
                                                                    >
                                                                        Next
                                                                        <ChevronRight size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date</label>
                                            <input type="date" required value={formData.purchaseDate} onChange={(e) => setFormData(p => ({ ...p, purchaseDate: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none font-medium" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
                                            <select required value={formData.paymentStatus} onChange={(e) => setFormData(p => ({ ...p, paymentStatus: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none appearance-none font-medium">
                                                <option value="PENDING">Pending</option>
                                                <option value="PAID">Paid</option>
                                                <option value="PARTIALLY_PAID">Partial</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-3 border-b pb-2 border-gray-100">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {isIndividualVendor ? 'Charge / Service Details' : 'Line Items'}
                                            </label>
                                            {!isIndividualVendor && (
                                                <button type="button" onClick={addLineItem} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                                                    <Plus size={14} /> Add Item
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {formData.lineItems.map((line, idx) => (
                                                <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex-1">
                                                        {isIndividualVendor ? (
                                                            <input 
                                                                type="text" 
                                                                required 
                                                                value={line.itemName || ''} 
                                                                onChange={(e) => updateLineItem(idx, 'itemName', e.target.value)} 
                                                                placeholder="Charge description (e.g. Consulting, Service)" 
                                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium" 
                                                            />
                                                        ) : (
                                                            <select required value={line.itemId} onChange={(e) => updateLineItem(idx, 'itemId', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium">
                                                                <option value="">Choose item...</option>
                                                                {items.map(item => <option key={item._id} value={item._id}>{item.name} ({item.itemType})</option>)}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div className="w-24">
                                                        <input type="number" min="1" required value={line.qty} onChange={(e) => updateLineItem(idx, 'qty', e.target.value)} placeholder="Qty" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm text-center font-bold" />
                                                    </div>
                                                    <div className="w-32">
                                                        <input type="number" min="0" required value={line.price} onChange={(e) => updateLineItem(idx, 'price', e.target.value)} placeholder="Price" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-bold" />
                                                    </div>
                                                    {!isIndividualVendor && (
                                                        <button type="button" onClick={() => removeLineItem(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Invoice / Bill Copy</label>
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => setFormData(p => ({ ...p, proofFile: e.target.files[0] }))} className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-emerald-100 file:text-emerald-700 font-bold" />
                                        {editingPurchase?.bill && !formData.proofFile && <p className="mt-1 text-[10px] text-emerald-600 font-bold">Existing: {editingPurchase.bill.fileName}</p>}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-gray-400 uppercase">Estimated Total</span>
                                        <span className="text-2xl font-black text-gray-900">₹{formData.lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0).toLocaleString()}</span>
                                    </div>
                                    <button type="submit" disabled={isCreating || isUpdating} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                                        {(isCreating || isUpdating) ? <Loader2 className="animate-spin" size={20} /> : (editingPurchase ? 'Update Purchase' : 'Save Purchase Entry')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {viewPurchase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewPurchase(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10 p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{viewPurchase.vendorId?.fullName}</h2>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Ref: #{viewPurchase._id.slice(-8)}</p>
                                </div>
                                <button onClick={() => setViewPurchase(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Purchase Date</p><p className="font-bold text-gray-900">{new Date(viewPurchase.purchaseDate).toLocaleDateString()}</p></div>
                                <div className="text-right"><p className="text-[10px] font-bold text-gray-400 uppercase">Payment Status</p><p className="font-bold text-emerald-600 uppercase">{viewPurchase.paymentStatus}</p></div>
                            </div>

                            <div className="space-y-3">
                                {viewPurchase.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.itemId?.name || item.itemName || "Individual Vendor Charge"}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-medium">{item.quantity} {item.itemId?.unit || 'qty'} × ₹{item.unitPrice}</p>
                                        </div>
                                        <p className="font-bold text-gray-900">₹{item.totalPrice.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-400 uppercase">Grand Total</span>
                                <span className="text-xl font-bold text-emerald-600">₹{viewPurchase.totalAmount.toLocaleString()}</span>
                            </div>

                            {viewPurchase.bill?.fileUrl && (
                                <button onClick={() => window.open(getMediaUrl(viewPurchase.bill.fileUrl), '_blank')} className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                                    <FileText size={18} /> View Bill Copy
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} confirmText={confirmModal.confirmText} />
        </div>
    );
}
