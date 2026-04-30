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
    Loader2,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import Pagination from '../Common/Pagination';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/Common/ConfirmModal';
import {
    useGetVendorsQuery,
    useCreateVendorMutation,
    useUpdateVendorMutation,
    useDeleteVendorMutation,
} from '../../../../utils/slices/InventoryAndAsset/vendorApiSlice';
import { useCreateDeleteRequestMutation } from '../../../../utils/slices/deleteApiSlice';
import { useGetInventoryDashboardStatsQuery } from '../../../../utils/slices/InventoryAndAsset/dashboardApiSlice';
import { useGetStatesQuery, useLazyGetCitiesQuery } from '../../../../utils/slices/locationApiSlice';
import { INDIAN_LOCATIONS, STATES as FALLBACK_STATES } from '../../../../utils/locations';

export default function VendorManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
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
    const { data: vendorsData, isLoading, isError, error } = useGetVendorsQuery({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        state: stateFilter || undefined,
        city: cityFilter || undefined
    });

    const { data: dashboardStats } = useGetInventoryDashboardStatsQuery();
    const supplyStats = dashboardStats?.data?.supplyChain || { activeVendors: 0, newVendorsYearly: 0 };

    const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
    const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
    const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();
    const [createDeleteRequest, { isLoading: isRequestingDelete }] = useCreateDeleteRequestMutation();

    // Location API
    const { data: apiStates, isLoading: isLoadingStates } = useGetStatesQuery();
    const [triggerGetCities, { data: apiCities, isLoading: isLoadingCities }] = useLazyGetCitiesQuery();

    const states = apiStates || FALLBACK_STATES;

    // Form State - Aligned with backend model
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        vendorGST: '',
        state: '',
        city: '',
        fullAddress: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, stateFilter, cityFilter]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate contact number
            if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
                toast.warning('Contact number must be a valid 10-digit number');
                return;
            }

            // Validate GST if provided
            if (formData.vendorGST && !/^[0-9A-Z]{15}$/.test(formData.vendorGST)) {
                toast.warning('Invalid GST number format (must be 15 alphanumeric characters)');
                return;
            }

            console.log('Submitting Vendor Data:', formData);
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
                state: '',
                city: '',
                fullAddress: '',
                status: 'ACTIVE'
            });
            setEditingVendor(null);
            setShowAddModal(false);
            toast.success(editingVendor ? 'Vendor updated successfully' : 'Vendor created successfully');
        } catch (err) {
            console.error('Failed to save vendor:', err);
            toast.error(err?.data?.message || 'Failed to save vendor');
        }
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            fullName: vendor.fullName,
            contactNumber: vendor.contactNumber.toString(),
            vendorGST: vendor.vendorGST || '',
            state: vendor.state || '',
            city: vendor.city || '',
            fullAddress: vendor.fullAddress,
            status: vendor.status
        });
        if (vendor.state) {
            triggerGetCities(vendor.state);
        }
        setShowAddModal(true);
    };

    const toggleStatus = async (vendor) => {
        try {
            const newStatus = vendor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateVendor({
                vendorId: vendor._id,
                data: { status: newStatus }
            }).unwrap();
            toast.success(`Vendor ${newStatus === 'ACTIVE' ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            console.error('Failed to update vendor status:', err);
            toast.error(err?.data?.message || 'Failed to update vendor status');
        }
    };

    const handleDelete = (vendor) => {
        setConfirmModal({
            isOpen: true,
            type: 'danger',
            title: isSuperAdmin ? 'Delete Vendor Permanently' : 'Request Deletion',
            message: isSuperAdmin 
                ? 'Are you sure you want to permanently delete this vendor? This action cannot be undone.' 
                : 'This will send a request to the Super Admin to permanently remove this vendor.',
            confirmText: isSuperAdmin ? 'Delete Permanently' : 'Send Request',
            onConfirm: async () => {
                try {
                    if (isSuperAdmin) {
                        await deleteVendor(vendor._id).unwrap();
                        toast.success('Vendor deleted permanently');
                    } else {
                        await createDeleteRequest({
                            entityId: vendor._id,
                            entityModel: 'Vendor',
                            module: 'Inventory / Vendors',
                            entityName: vendor.fullName
                        }).unwrap();
                        toast.success('Deletion request sent to Super Admin');
                    }
                } catch (err) {
                    console.error('Failed to delete vendor:', err);
                    toast.error(err?.data?.message || 'Failed to delete vendor');
                }
            }
        });
    };

    // Get vendors from API response
    const vendors = vendorsData?.data || [];
    const meta = vendorsData?.meta || { totalPages: 1, total: 0 };

    // Extract unique values for filter dropdowns
    const availableStates = [...new Set(vendors.map(v => v.state).filter(Boolean))].sort();
    const availableCities = [...new Set(vendors.map(v => v.city).filter(Boolean))].sort();

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
                                state: '',
                                city: '',
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
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Vendors</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{meta.total}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Vendors</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{supplyStats.activeVendors}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">New This Year</p>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{supplyStats.newVendorsYearly}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 flex flex-col xl:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, GST, or contact..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
                            />
                        </div>

                        <div className="flex flex-1 gap-4 max-w-2xl">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <select
                                    value={stateFilter}
                                    onChange={(e) => {
                                        setStateFilter(e.target.value);
                                        setCityFilter('');
                                    }}
                                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium appearance-none text-sm cursor-pointer"
                                >
                                    <option value="">All States</option>
                                    {availableStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
 
                            <div className="relative flex-1">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <select
                                    disabled={!stateFilter && availableCities.length === 0}
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium appearance-none text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="">All Cities</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                        {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500 font-medium">Loading vendors...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Error Loading Vendors</h3>
                        <p className="text-gray-500 font-medium">{error?.data?.message || 'Something went wrong'}</p>
                    </div>
                )}

                {/* Vendors List View */}
                {!isLoading && !isError && (
                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-4">Vendor Details</div>
                            <div className="col-span-2">Contact</div>
                            <div className="col-span-2">Location</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {vendors.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    {searchQuery ? 'No vendors match your search.' : 'No vendors found. Add your first vendor to see them here.'}
                                </div>
                            ) : (
                                vendors.map(vendor => (
                                    <div key={vendor._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                <Briefcase size={20} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-gray-900 truncate">{vendor.fullName}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                    {vendor.vendorGST || 'No GST Record'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-gray-900">{vendor.contactNumber}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Verified Number</p>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-900 font-bold truncate">{vendor.city || 'N/A'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{vendor.state || 'N/A'}</p>
                                        </div>

                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {vendor.status === 'ACTIVE' ? <CheckCircle size={10} /> : <Ban size={10} />}
                                                {vendor.status}
                                            </span>
                                        </div>

                                        <div className="col-span-2 flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(vendor)}
                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                title="Edit Vendor"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(vendor)}
                                                className={`p-2 rounded-lg transition-colors ${vendor.status === 'ACTIVE' ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                                                title={vendor.status === 'ACTIVE' ? 'Disable Vendor' : 'Enable Vendor'}
                                            >
                                                {vendor.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                             
                                                onClick={() => handleDelete(vendor)} 
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            State *
                                        </label>
                                        <select
                                            required
                                            name="state"
                                            value={formData.state}
                                            onChange={(e) => {
                                                const newState = e.target.value;
                                                handleInputChange(e);
                                                setFormData(prev => ({ ...prev, city: '' }));
                                                if (newState) triggerGetCities(newState);
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                            disabled={isLoadingStates}
                                        >
                                            <option value="">{isLoadingStates ? 'Loading states...' : 'Select State'}</option>
                                            {states.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            City *
                                        </label>
                                        <select
                                            required
                                            disabled={!formData.state || isLoadingCities}
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none disabled:opacity-50"
                                        >
                                            <option value="">{isLoadingCities ? 'Loading cities...' : 'Select City'}</option>
                                            {apiCities ? (
                                                apiCities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))
                                            ) : (
                                                formData.state && INDIAN_LOCATIONS[formData.state] && INDIAN_LOCATIONS[formData.state].map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>
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