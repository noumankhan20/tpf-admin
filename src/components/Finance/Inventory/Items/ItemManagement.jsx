'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Package,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    HardDrive,
    ShoppingBag,
    Scale,
    Loader2,
    Briefcase,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/Common/ConfirmModal';
import Pagination from '../Common/Pagination';
import {
    useGetItemsQuery,
    useCreateItemMutation,
    useUpdateItemMutation,
    useDeleteItemMutation,
} from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';
import { useCreateDeleteRequestMutation } from '../../../../utils/slices/deleteApiSlice';
import { useGetVendorsQuery } from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetInventoryDashboardStatsQuery } from '../../../../utils/slices/InventoryAndAsset/dashboardApiSlice';

export default function ItemManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [vendorFilter, setVendorFilter] = useState('all');
    const { adminInfo } = useSelector((state) => state.adminAuth);
    const isSuperAdmin = adminInfo?.isSuperAdmin || adminInfo?.role === 'SuperAdmin';

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
    const { data: itemsResponse, isLoading, isError, error } = useGetItemsQuery({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        itemType: filterType !== 'all' ? filterType.toUpperCase() : undefined,
        vendorId: vendorFilter !== 'all' ? vendorFilter : undefined
    });

    const { data: dashboardStats } = useGetInventoryDashboardStatsQuery();
    const assetStats = dashboardStats?.data?.assets || { total: 0 };
    const stockStats = dashboardStats?.data?.inventory || { totalStock: 0, lowStockCount: 0 };

    const { data: vendorsData } = useGetVendorsQuery();
    const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();
    const [createDeleteRequest, { isLoading: isRequestingDelete }] = useCreateDeleteRequestMutation();

    const [formData, setFormData] = useState({
        name: '',
        itemType: 'ASSET',
        unit: 'PIECE',
        quantity: '',
        vendorId: '',
        status: 'ACTIVE'
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterType, vendorFilter]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Item name is required';
        }

        if (!formData.itemType) {
            errors.itemType = 'Item type is required';
        }

        if (!formData.unit) {
            errors.unit = 'Unit of measure is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                itemType: formData.itemType,
                unit: formData.unit,
                status: formData.status,
                quantity: formData.quantity ? Number(formData.quantity) : 0,
            };

            // Only include vendorId if it's selected
            if (formData.vendorId) {
                payload.vendorId = formData.vendorId;
            }

            if (editingItem) {
                await updateItem({
                    itemId: editingItem._id,
                    data: payload
                }).unwrap();
            } else {
                await createItem(payload).unwrap();
            }

            // Reset form and close modal
            resetForm();
            setShowAddModal(false);
        } catch (err) {
            console.error('Failed to save item:', err);
            const errorMessage = err?.data?.message || 'Failed to save item';
            toast.error(errorMessage);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            itemType: 'ASSET',
            unit: 'PIECE',
            quantity: '',
            vendorId: '',
            status: 'ACTIVE'
        });
        setFormErrors({});
        setEditingItem(null);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            itemType: item.itemType,
            unit: item.unit,
            quantity: item.currentStock || 0,
            vendorId: item.vendorId || '',
            status: item.status
        });
        setShowAddModal(true);
    };

    const handleDelete = (item) => {
        setConfirmModal({
            isOpen: true,
            type: 'danger',
            title: isSuperAdmin ? 'Delete Item Permanently' : 'Request Deletion',
            message: isSuperAdmin 
                ? 'Are you sure you want to permanently delete this item? This action cannot be undone.' 
                : 'This will send a request to the Super Admin to permanently remove this item from the master list.',
            confirmText: isSuperAdmin ? 'Delete Permanently' : 'Send Request',
            onConfirm: async () => {
                try {
                    if (isSuperAdmin) {
                        await deleteItem(item._id).unwrap();
                        toast.success('Item deleted permanently');
                    } else {
                        await createDeleteRequest({
                            entityId: item._id,
                            entityModel: 'Item',
                            module: 'Inventory / Item Master',
                            entityName: item.name
                        }).unwrap();
                        toast.success('Deletion request sent to Super Admin');
                    }
                } catch (err) {
                    console.error('Failed to delete item:', err);
                    toast.error(err?.data?.message || 'Failed to delete item');
                }
            }
        });
    };

    // Get items and pagination data
    const items = itemsResponse?.data || [];
    const meta = itemsResponse?.meta || { total: 0, page: 1, totalPages: 1 };
    const vendors = (vendorsData?.data || []).filter(v => v.vendorType !== 'INDIVIDUAL');

    // Get unit display name
    const getUnitDisplay = (unit) => {
        const unitMap = {
            'KG': 'Kilograms',
            'GRAM': 'Grams',
            'LITRE': 'Liters',
            'ML': 'Milliliters',
            'PIECE': 'Pieces',
            'BOX': 'Box',
            'METER': 'Meters',
            'FEET': 'Feet',
            'HOUR': 'Hours',
            'DAY': 'Days'
        };
        return unitMap[unit] || unit;
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
                            <Package className="text-emerald-600" size={24} />
                            Item Master
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
                        Define Item
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <HardDrive size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Assets</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{assetStats.total}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <ShoppingBag size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Stock Items</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stockStats.totalStock}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <AlertCircle size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Low Stock</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stockStats.lowStockCount}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Package size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Items</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{meta.total}</p>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col xl:flex-row gap-4 mb-8 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search items by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
                            />
                        </div>

                        <div className="relative flex-1 max-w-xs">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={vendorFilter}
                                onChange={(e) => setVendorFilter(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium appearance-none"
                            >
                                <option value="all">All Vendors</option>
                                {vendors.map(v => (
                                    <option key={v._id} value={v._id}>{v.fullName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                        {['all', 'asset', 'inventory'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === type
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500 font-medium">Loading items...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Error Loading Items</h3>
                        <p className="text-gray-500 font-medium">{error?.data?.message || 'Something went wrong'}</p>
                    </div>
                )}

                {/* Items List View */}
                {!isLoading && !isError && (
                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-4">Item Details</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Stock/Unit</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No items found. Define your master items to begin.
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.itemType === 'ASSET' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {item.itemType === 'ASSET' ? <HardDrive size={20} /> : <ShoppingBag size={20} />}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    ID: {item._id.slice(-6).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.itemType === 'ASSET' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                                {item.itemType}
                                            </span>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm font-black text-gray-900">
                                                {item.itemType === 'INVENTORY' ? item.currentStock : '-'} 
                                                <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{item.unit}</span>
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.status}
                                            </span>
                                        </div>

                                        <div className="col-span-2 flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                title="Edit Item"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                             <button 
                                                onClick={() => handleDelete(item)} 
                                                disabled={isDeleting || isRequestingDelete}
                                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title={isSuperAdmin ? "Delete Permanently" : "Request Deletion"}
                                            >
                                                {isDeleting || isRequestingDelete ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
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

                {!isLoading && !isError && items.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No items defined</h3>
                        <p className="text-gray-500">
                            {searchQuery
                                ? 'No items match your search criteria.'
                                : 'Add some items (Assets or Inventory) to start tracking.'}
                        </p>
                    </div>
                )}
            </main>

            {/* Add/Edit Item Modal */}
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden z-10"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingItem ? 'Edit Item' : 'New Item Master'}
                                    </h2>
                                    <p className="text-sm text-gray-500">Define what you buy or track</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        Item Name *
                                    </label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder="e.g. MacBook Pro, Basmati Rice"
                                        className={`w-full px-5 py-3.5 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium ${formErrors.name ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            Item Type *
                                        </label>
                                        <select
                                            name="itemType"
                                            value={formData.itemType}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-3.5 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none ${formErrors.itemType ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                        >
                                            <option value="ASSET">Asset</option>
                                            <option value="INVENTORY">Inventory</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        {formErrors.itemType && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.itemType}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            Unit *
                                        </label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-3.5 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none ${formErrors.unit ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                        >
                                            <option value="PIECE">Piece</option>
                                            <option value="KG">Kilogram</option>
                                            <option value="GRAM">Gram</option>
                                            <option value="LITRE">Liter</option>
                                            <option value="ML">Milliliter</option>
                                            <option value="BOX">Box</option>
                                            <option value="METER">Meter</option>
                                            <option value="FEET">Feet</option>
                                            <option value="HOUR">Hour</option>
                                            <option value="DAY">Day</option>
                                        </select>
                                        {formErrors.unit && (
                                            <p className="mt-1 text-xs text-red-500">{formErrors.unit}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity Field - Visible for INVENTORY */}
                                {formData.itemType === 'INVENTORY' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            Initial Quantity/Stock
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 10"
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                                {formData.unit}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        Vendor
                                    </label>
                                    <select
                                        name="vendorId"
                                        value={formData.vendorId}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none"
                                    >
                                        <option value="">No vendor assigned</option>
                                        {vendors
                                            .filter(v => v.status === 'ACTIVE')
                                            .map(vendor => (
                                                <option key={vendor._id} value={vendor._id}>
                                                    {vendor.fullName}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                            {formData.itemType === 'ASSET' ? (
                                                <HardDrive size={16} />
                                            ) : (
                                                <ShoppingBag size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Pro-tip</p>
                                            <p className="text-[11px] text-emerald-600 font-medium">
                                                {formData.itemType === 'ASSET'
                                                    ? 'Assets are long-term items like laptops and furniture.'
                                                    : formData.itemType === 'INVENTORY'
                                                        ? 'Inventory items are consumables like food supplies.'
                                                        : 'Other items are miscellaneous products or services.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isCreating || isUpdating}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {(isCreating || isUpdating) && <Loader2 className="animate-spin" size={18} />}
                                    {editingItem ? 'Update Item' : 'Create Item'}
                                </button>
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