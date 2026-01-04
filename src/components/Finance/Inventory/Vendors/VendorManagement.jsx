'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Users,
    Plus,
    Edit2,
    Trash2,
    MapPin,
    Search,
    X,
    CheckCircle,
    Ban,
    Phone,
    Calendar,
    Briefcase,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../Common/Pagination';
import {
    useGetVendorsQuery,
    useCreateVendorMutation,
    useUpdateVendorMutation,
    useDeleteVendorMutation,
} from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';

export default function VendorManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // API Hooks
    const { data: vendorsData, isLoading, isError, error } = useGetVendorsQuery({
        page: currentPage,
        limit: 12,
        search: searchQuery
    });
    const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
    const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
    const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();

    // Form State - Aligned with backend model
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        vendorGST: '',
        location: '',
        fullAddress: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate contact number
            if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
                alert('Contact number must be a valid 10-digit number');
                return;
            }

            // Validate GST if provided
            if (formData.vendorGST && !/^[0-9A-Z]{15}$/.test(formData.vendorGST)) {
                alert('Invalid GST number format (must be 15 alphanumeric characters)');
                return;
            }

            if (editingVendor) {
                await updateVendor({
                    vendorId: editingVendor._id,
                    data: formData
                }).unwrap();
            } else {
                await createVendor(formData).unwrap();
            }

            // Reset form and close modal
            setFormData({
                fullName: '',
                contactNumber: '',
                vendorGST: '',
                location: '',
                fullAddress: '',
                status: 'ACTIVE'
            });
            setEditingVendor(null);
            setShowAddModal(false);
        } catch (err) {
            console.error('Failed to save vendor:', err);
            alert(err?.data?.message || 'Failed to save vendor');
        }
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            fullName: vendor.fullName,
            contactNumber: vendor.contactNumber.toString(),
            vendorGST: vendor.vendorGST || '',
            location: vendor.location || '',
            fullAddress: vendor.fullAddress,
            status: vendor.status
        });
        setShowAddModal(true);
    };

    const toggleStatus = async (vendor) => {
        try {
            const newStatus = vendor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateVendor({
                vendorId: vendor._id,
                data: { status: newStatus }
            }).unwrap();
        } catch (err) {
            console.error('Failed to update vendor status:', err);
            alert(err?.data?.message || 'Failed to update vendor status');
        }
    };

    const handleDelete = async (vendorId) => {
        if (window.confirm('Are you sure you want to deactivate this vendor?')) {
            try {
                await deleteVendor(vendorId).unwrap();
            } catch (err) {
                console.error('Failed to delete vendor:', err);
                alert(err?.data?.message || 'Failed to delete vendor');
            }
        }
    };

    // Get vendors from API response
    const vendors = vendorsData?.data || [];
    const meta = vendorsData?.meta || { totalPages: 1 };

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
                            <Users className="text-emerald-600" size={24} />
                            Vendor Management
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            setEditingVendor(null);
                            setFormData({
                                fullName: '',
                                contactNumber: '',
                                vendorGST: '',
                                location: '',
                                fullAddress: '',
                                status: 'ACTIVE'
                            });
                            setShowAddModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Add New Vendor
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filters */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, GST, or contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading vendors...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Error Loading Vendors</h3>
                        <p className="text-gray-500">{error?.data?.message || 'Something went wrong'}</p>
                    </div>
                )}

                {/* Vendors Grid */}
                {!isLoading && !isError && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {vendors.map((vendor) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={vendor._id}
                                        className={`bg-white rounded-2xl border ${vendor.status === 'INACTIVE' ? 'border-gray-200 grayscale-[0.6] opacity-80' : 'border-gray-100 shadow-sm'} p-6 relative group transition-all hover:shadow-md`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${vendor.status === 'INACTIVE' ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(vendor)}
                                                    className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(vendor)}
                                                    className={`p-2 rounded-lg transition-colors ${vendor.status === 'ACTIVE' ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                                                    title={vendor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {vendor.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{vendor.fullName}</h3>
                                        {vendor.vendorGST && (
                                            <p className="text-xs font-bold text-emerald-600 mb-3 tracking-wider">{vendor.vendorGST}</p>
                                        )}

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Phone size={14} className="shrink-0" />
                                                <p className="text-sm">{vendor.contactNumber}</p>
                                            </div>
                                            {vendor.location && (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <MapPin size={14} className="shrink-0" />
                                                    <p className="text-sm truncate">{vendor.location}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                                {vendor.fullAddress}
                                            </p>
                                            <div className="flex items-center gap-2 text-gray-400 pt-2 border-t border-gray-100">
                                                <Calendar size={12} className="shrink-0" />
                                                <p className="text-xs">
                                                    Joined {new Date(vendor.joinedAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {vendor.status === 'INACTIVE' && (
                                            <div className="absolute top-4 right-4 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">
                                                Inactive
                                            </div>
                                        )}
                                        {vendor.status === 'SUSPENDED' && (
                                            <div className="absolute top-4 right-4 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded uppercase tracking-widest">
                                                Suspended
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={meta.totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                )}

                {!isLoading && !isError && vendors.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No vendors found</h3>
                        <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search to find what you\'re looking for.' : 'Get started by adding your first vendor.'}
                        </p>
                    </div>
                )}
            </main>

            {/* Add/Edit Vendor Modal */}
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
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                                    </h2>
                                    <p className="text-sm text-gray-500">Supplier information for procurement</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        Vendor Name *
                                    </label>
                                    <input
                                        required
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder="e.g. MedPlus Essentials"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            Contact Number *
                                        </label>
                                        <input
                                            required
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleInputChange}
                                            type="tel"
                                            placeholder="10-digit number"
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            GST Number / Vendor ID
                                        </label>
                                        <input
                                            name="vendorGST"
                                            value={formData.vendorGST}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="15-char GSTIN"
                                            maxLength={15}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        Location
                                    </label>
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder="e.g. Mumbai, Maharashtra"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        Full Address *
                                    </label>
                                    <textarea
                                        required
                                        name="fullAddress"
                                        value={formData.fullAddress}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Enter complete office address..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isCreating || isUpdating}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {(isCreating || isUpdating) && <Loader2 className="animate-spin" size={18} />}
                                    {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}