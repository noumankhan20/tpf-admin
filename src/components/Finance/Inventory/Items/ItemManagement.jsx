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
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetItemsQuery,
    useCreateItemMutation,
    useUpdateItemMutation,
    useDeleteItemMutation,
} from '../../../../utils/slices/InventoryAndAsset/itemApiSlice';
import { useGetVendorsQuery } from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';

export default function ItemManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // API Hooks
    const { data: itemsResponse, isLoading, isError, error } = useGetItemsQuery({
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        itemType: filterType !== 'all' ? filterType.toUpperCase() : undefined,
    });

    const { data: vendorsData } = useGetVendorsQuery();
    const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

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
    }, [searchQuery, filterType]);

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
            alert(errorMessage);
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

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to deactivate this item?')) {
            try {
                await deleteItem(itemId).unwrap();
            } catch (err) {
                console.error('Failed to delete item:', err);
                alert(err?.data?.message || 'Failed to delete item');
            }
        }
    };

    // Get items and pagination data
    const items = itemsResponse?.data || [];
    const meta = itemsResponse?.meta || { total: 0, page: 1, totalPages: 1 };
    const vendors = vendorsData?.data || [];

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
                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search items by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['all', 'asset', 'inventory'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${filterType === type
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-200'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading items...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Error Loading Items</h3>
                        <p className="text-gray-500">{error?.data?.message || 'Something went wrong'}</p>
                    </div>
                )}

                {/* Items Grid */}
                {!isLoading && !isError && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={item._id}
                                        className={`bg-white rounded-3xl border p-6 relative group transition-all hover:shadow-xl hover:-translate-y-1 ${item.status === 'INACTIVE'
                                            ? 'border-gray-200 opacity-60 grayscale'
                                            : 'border-gray-100'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${item.itemType === 'ASSET'
                                                ? 'bg-blue-50 text-blue-600'
                                                : item.itemType === 'INVENTORY'
                                                    ? 'bg-orange-50 text-orange-600'
                                                    : 'bg-purple-50 text-purple-600'
                                                }`}>
                                                {item.itemType === 'ASSET' ? (
                                                    <HardDrive size={24} />
                                                ) : (
                                                    <ShoppingBag size={24} />
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${item.itemType === 'ASSET'
                                                ? 'text-blue-500'
                                                : item.itemType === 'INVENTORY'
                                                    ? 'text-orange-500'
                                                    : 'text-purple-500'
                                                }`}>
                                                {item.itemType}
                                            </p>
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Scale size={14} />
                                                <span className="text-xs font-bold uppercase tracking-tight">Unit:</span>
                                            </div>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                                {item.unit}
                                            </span>
                                        </div>

                                        {item.status === 'INACTIVE' && (
                                            <div className="absolute top-4 right-4 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">
                                                Inactive
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {meta.totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (meta.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= meta.totalPages - 2) {
                                            pageNum = meta.totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === pageNum
                                                    ? 'bg-emerald-600 text-white shadow-md'
                                                    : 'bg-white border border-gray-200 hover:border-emerald-200 text-gray-600'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                                    disabled={currentPage === meta.totalPages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                <span className="ml-4 text-sm text-gray-500">
                                    Page {currentPage} of {meta.totalPages} ({meta.total} items)
                                </span>
                            </div>
                        )}
                    </>
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
                                        Vendor (Optional)
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
        </div>
    );
}