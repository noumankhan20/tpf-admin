'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    ChevronDown,
    Mail,
    Building2,
    User,
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

// ─── CSC API ───────────────────────────────────────────────────────────────────
const CSC_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY || '';

const fetchStatesCSC = async () => {
    try {
        const res = await fetch('https://api.countrystatecity.in/v1/countries/IN/states', {
            headers: { "X-CSCAPI-KEY": "ZUVLUHhxTURNaHI4RU9WRmplUVhaaU9WeFVmbFNrVjltSUk5bFN0Mg==" },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        return data
            .map((s) => ({ name: s.name, isoCode: s.iso2 }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch {
        return [];
    }
};

const fetchCitiesCSC = async (stateIso) => {
    try {
        const res = await fetch(
            `https://api.countrystatecity.in/v1/countries/IN/states/${stateIso}/cities`,
            { headers: {"X-CSCAPI-KEY": "ZUVLUHhxTURNaHI4RU9WRmplUVhaaU9WeFVmbFNrVjltSUk5bFN0Mg==" } }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        return data.map((c) => c.name).sort((a, b) => a.localeCompare(b));
    } catch {
        return [];
    }
};

// ─── Searchable Dropdown ───────────────────────────────────────────────────────
function SearchableDropdown({ value, onChange, options, placeholder, disabled = false, label, getLabel }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef(null);
    const inputRef = useRef(null);

    const filtered = query
        ? options.filter((o) => (typeof o === 'string' ? o : getLabel(o)).toLowerCase().includes(query.toLowerCase()))
        : options;

    const selectedLabel = value
        ? typeof options[0] === 'string'
            ? value
            : getLabel(options.find((o) => o.isoCode === value) || {})
        : '';

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        if (disabled) return;
        setOpen(true);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-left flex items-center justify-between transition-colors focus:outline-none focus:border-emerald-500 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300'
                } ${!value ? 'text-gray-400' : 'text-gray-900'}`}
            >
                <span className="truncate">{selectedLabel || placeholder}</span>
                <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        className="absolute z-[200] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={`Search ${label}…`}
                                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No results</p>
                            ) : (
                                filtered.map((opt, i) => {
                                    const optVal = typeof opt === 'string' ? opt : opt.isoCode;
                                    const optLabel = typeof opt === 'string' ? opt : getLabel(opt);
                                    const isSelected = optVal === value;
                                    return (
                                        <button
                                            key={i} type="button"
                                            onClick={() => { onChange(optVal, opt); setOpen(false); setQuery(''); }}
                                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                                isSelected ? 'bg-emerald-600 text-white font-medium' : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {optLabel}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── ID Helpers ────────────────────────────────────────────────────────────────
const determineIdType = (val) => {
    if (!val) return 'GST';
    const clean = val.trim().toUpperCase();
    if (clean.startsWith('GST:')) return 'GST';
    if (clean.startsWith('PAN:')) return 'PAN';
    if (clean.startsWith('AADHAAR:')) return 'AADHAAR';
    if (clean.startsWith('OTHERS:')) return 'OTHERS';
    if (/^[0-9A-Z]{15}$/.test(clean)) return 'GST';
    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)) return 'PAN';
    if (/^[0-9]{12}$/.test(clean)) return 'AADHAAR';
    return 'OTHERS';
};

const getCleanIdValue = (val) => {
    if (!val) return '';
    return val.replace(/^(GST|PAN|AADHAAR|OTHERS)\s*:\s*/i, '').trim();
};

const EMPTY_FORM = {
    fullName: '',
    contactNumber: '',
    alternateContact: '',
    email: '',
    vendorGST: '',
    state: '',
    stateIso: '',
    city: '',
    fullAddress: '',
    status: 'ACTIVE',
    vendorType: 'NORMAL',
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VendorManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [vendorTypeFilter, setVendorTypeFilter] = useState('ALL'); // NEW
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const { adminInfo } = useSelector((state) => state.adminAuth);
    const isSuperAdmin = adminInfo?.isSuperAdmin || adminInfo?.role === 'SuperAdmin';

    // CSC data for filter dropdowns
    const [allStates, setAllStates]           = useState([]);
    const [filterCities, setFilterCities]     = useState([]);
    const [loadingFilterCities, setLoadingFilterCities] = useState(false);

    // Form modal CSC data
    const [formStates, setFormStates]         = useState([]);
    const [formCities, setFormCities]         = useState([]);
    const [loadingFormStates, setLoadingFormStates] = useState(false);
    const [loadingFormCities, setLoadingFormCities] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, type: 'danger', title: '', message: '', onConfirm: () => {}, confirmText: ''
    });

    // API
    const { data: vendorsData, isLoading, isError, error } = useGetVendorsQuery({
        page: currentPage, limit: 10,
        search: searchQuery,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        vendorType: vendorTypeFilter !== 'ALL' ? vendorTypeFilter : undefined,
        state: stateFilter || undefined,
        city: cityFilter || undefined,
    });
    const { data: dashboardStats } = useGetInventoryDashboardStatsQuery();
    const supplyStats = dashboardStats?.data?.supplyChain || { activeVendors: 0, newVendorsYearly: 0 };
    const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
    const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
    const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();
    const [createDeleteRequest, { isLoading: isRequestingDelete }] = useCreateDeleteRequestMutation();

    const [idType, setIdType] = useState('GST');
    const [formData, setFormData] = useState(EMPTY_FORM);

    // ── Lifecycle ──────────────────────────────────────────────────────────────
    useEffect(() => { setIsMounted(true); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, vendorTypeFilter, stateFilter, cityFilter]);

    // Load states once
    useEffect(() => {
        let cancelled = false;
        setLoadingFormStates(true);
        fetchStatesCSC().then((data) => {
            if (!cancelled) { setFormStates(data); setAllStates(data); setLoadingFormStates(false); }
        });
        return () => { cancelled = true; };
    }, []);

    // Load form cities when stateIso changes
    useEffect(() => {
        if (!formData.stateIso) { setFormCities([]); return; }
        let cancelled = false;
        setLoadingFormCities(true);
        fetchCitiesCSC(formData.stateIso).then((data) => {
            if (!cancelled) { setFormCities(data); setLoadingFormCities(false); }
        });
        return () => { cancelled = true; };
    }, [formData.stateIso]);

    // Load filter cities when stateFilter changes
    useEffect(() => {
        if (!stateFilter) { setFilterCities([]); return; }
        const found = allStates.find((s) => s.name === stateFilter);
        if (!found) return;
        let cancelled = false;
        setLoadingFilterCities(true);
        fetchCitiesCSC(found.isoCode).then((data) => {
            if (!cancelled) { setFilterCities(data); setLoadingFilterCities(false); }
        });
        return () => { cancelled = true; };
    }, [stateFilter, allStates]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setIdType('GST');
        setEditingVendor(null);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        try {
            if (!/^[0-9]{10}$/.test(formData.contactNumber.toString())) {
                toast.warning('Contact number must be a valid 10-digit number');
                return;
            }
            const idVal = formData.vendorGST.trim().toUpperCase();
            if (!idVal) { toast.warning('Identification document value is required'); return; }
            if (idType === 'GST'    && !/^[0-9A-Z]{15}$/.test(idVal))             { toast.warning('GST must be 15 alphanumeric chars'); return; }
            if (idType === 'PAN'    && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idVal)) { toast.warning('PAN must be ABCDE1234F format'); return; }
            if (idType === 'AADHAAR' && !/^[0-9]{12}$/.test(idVal))               { toast.warning('Aadhaar must be 12 digits'); return; }

            const submissionData = {
                ...formData,
                vendorGST: `${idType}: ${idVal}`,
                alternateContact: formData.alternateContact || undefined,
                email: formData.email || undefined,
            };
            // Remove helper field not in schema
            delete submissionData.stateIso;

            if (editingVendor) {
                await updateVendor({ vendorId: editingVendor._id, data: submissionData }).unwrap();
                toast.success('Vendor updated successfully');
            } else {
                await createVendor(submissionData).unwrap();
                toast.success('Vendor created successfully');
            }
            resetForm();
            setShowAddModal(false);
        } catch (err) {
            console.error('Failed to save vendor:', err);
            toast.error(err?.data?.message || 'Failed to save vendor');
        }
    };

    const handleEdit = (vendor) => {
        const idVal = vendor.vendorGST || '';
        const detectedType = determineIdType(idVal);

        // Find stateIso from loaded states
        const stateObj = formStates.find((s) => s.name === vendor.state);

        setEditingVendor(vendor);
        setFormData({
            fullName:         vendor.fullName,
            contactNumber:    vendor.contactNumber.toString(),
            alternateContact: vendor.alternateContact ? vendor.alternateContact.toString() : '',
            email:            vendor.email || '',
            vendorGST:        getCleanIdValue(idVal),
            state:            vendor.state || '',
            stateIso:         stateObj?.isoCode || '',
            city:             vendor.city || '',
            fullAddress:      vendor.fullAddress,
            status:           vendor.status,
            vendorType:       vendor.vendorType || 'NORMAL',
        });
        setIdType(detectedType);
        setShowAddModal(true);
    };

    const toggleStatus = async (vendor) => {
        try {
            const newStatus = vendor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateVendor({ vendorId: vendor._id, data: { status: newStatus } }).unwrap();
            toast.success(`Vendor ${newStatus === 'ACTIVE' ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update vendor status');
        }
    };

    const handleDelete = (vendor) => {
        setConfirmModal({
            isOpen: true, type: 'danger',
            title: isSuperAdmin ? 'Delete Vendor Permanently' : 'Request Deletion',
            message: isSuperAdmin
                ? 'Are you sure you want to permanently delete this vendor?'
                : 'This will send a request to the Super Admin to permanently remove this vendor.',
            confirmText: isSuperAdmin ? 'Delete Permanently' : 'Send Request',
            onConfirm: async () => {
                try {
                    if (isSuperAdmin) {
                        await deleteVendor(vendor._id).unwrap();
                        toast.success('Vendor deleted permanently');
                    } else {
                        await createDeleteRequest({
                            entityId: vendor._id, entityModel: 'Vendor',
                            module: 'Inventory / Vendors', entityName: vendor.fullName,
                        }).unwrap();
                        toast.success('Deletion request sent to Super Admin');
                    }
                } catch (err) {
                    toast.error(err?.data?.message || 'Failed to delete vendor');
                }
            },
        });
    };

    const vendors = vendorsData?.data || [];
    const meta    = vendorsData?.meta || { totalPages: 1, total: 0 };

    if (!isMounted) return null;

    // ── ID type available options ─────────────────────────────────────────────
    const isIndividual     = formData.vendorType === 'INDIVIDUAL';
    const availableIdTypes = isIndividual
        ? [{ value: 'PAN', label: 'PAN Card' }, { value: 'AADHAAR', label: 'Aadhaar Card' }, { value: 'OTHERS', label: 'Others' }]
        : [{ value: 'GST', label: 'GST' }, { value: 'PAN', label: 'PAN Card' }, { value: 'AADHAAR', label: 'Aadhaar Card' }, { value: 'OTHERS', label: 'Others' }];

    const ID_PLACEHOLDERS = { GST: '15-char GSTIN', PAN: '10-char PAN (ABCDE1234F)', AADHAAR: '12-digit Aadhaar', OTHERS: 'Enter Document ID' };
    const ID_MAXLEN       = { GST: 15, PAN: 10, AADHAAR: 12, OTHERS: 30 };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/inventory')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="text-emerald-600" size={24} />
                            Vendor Management
                        </h1>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} /> Add New Vendor
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ── Summary Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { icon: Users,     bg: 'bg-blue-50',   iconColor: 'text-blue-600',   label: 'Total Vendors',  value: meta.total },
                        { icon: CheckCircle, bg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'Active Vendors', value: supplyStats.activeVendors },
                        { icon: Calendar,  bg: 'bg-amber-50',  iconColor: 'text-amber-600',  label: 'New This Year',  value: supplyStats.newVendorsYearly },
                    ].map(({ icon: Icon, bg, iconColor, label, value }) => (
                        <div key={label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-2">
                                <div className={`w-10 h-10 rounded-xl ${bg} ${iconColor} flex items-center justify-center`}>
                                    <Icon size={20} />
                                </div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ───────────────────────────────────────────────── */}
                <div className="mb-8 space-y-4">
                    {/* Row 1: Search + State + City */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text" placeholder="Search by name, GST, or contact…"
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
                            />
                        </div>

                        {/* State filter */}
                        <div className="relative w-48">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
                            <select
                                value={stateFilter}
                                onChange={(e) => { setStateFilter(e.target.value); setCityFilter(''); }}
                                className="w-full pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm font-medium appearance-none text-sm"
                            >
                                <option value="">All States</option>
                                {allStates.map((s) => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>

                        {/* City filter */}
                        <div className="relative w-48">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
                            <select
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                disabled={!stateFilter}
                                className="w-full pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm font-medium appearance-none text-sm disabled:opacity-50"
                            >
                                <option value="">All Cities</option>
                                {filterCities.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    {/* Row 2: Status filter + Vendor Type filter */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Status */}
                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                            {['ALL', 'ACTIVE', 'INACTIVE'].map((s) => (
                                <button
                                    key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        statusFilter === s ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Vendor Type — NEW filter */}
                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                            {[
                                { value: 'ALL',        label: 'All Types' },
                                { value: 'NORMAL',     label: 'Business'  },
                                { value: 'INDIVIDUAL', label: 'Individual' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value} onClick={() => setVendorTypeFilter(value)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        vendorTypeFilter === value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Clear state/city filters */}
                        {(stateFilter || cityFilter) && (
                            <button
                                onClick={() => { setStateFilter(''); setCityFilter(''); }}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-500 hover:text-rose-600 bg-white border border-gray-200 rounded-xl transition-colors"
                            >
                                <X size={13} /> Clear Location
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Loading ───────────────────────────────────────────────── */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500 font-medium">Loading vendors…</p>
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────────────────── */}
                {isError && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-red-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Error Loading Vendors</h3>
                        <p className="text-gray-500 font-medium">{error?.data?.message || 'Something went wrong'}</p>
                    </div>
                )}

                {/* ── Vendor List ───────────────────────────────────────────── */}
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
                                    {searchQuery ? 'No vendors match your search.' : 'No vendors found.'}
                                </div>
                            ) : (
                                vendors.map((vendor) => (
                                    <div key={vendor._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                        {/* Details */}
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                                vendor.vendorType === 'INDIVIDUAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {vendor.vendorType === 'INDIVIDUAL' ? <User size={18} /> : <Building2 size={18} />}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-900 truncate">{vendor.fullName}</p>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest border leading-none shrink-0 uppercase ${
                                                        vendor.vendorType === 'INDIVIDUAL'
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                        {vendor.vendorType === 'INDIVIDUAL' ? 'Individual' : 'Business'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide border leading-none shrink-0 ${
                                                        determineIdType(vendor.vendorGST) === 'GST'    ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        determineIdType(vendor.vendorGST) === 'PAN'    ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        determineIdType(vendor.vendorGST) === 'AADHAAR'? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                        {determineIdType(vendor.vendorGST)}
                                                    </span>
                                                    <span className="truncate">{getCleanIdValue(vendor.vendorGST) || '—'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-gray-900">{vendor.contactNumber}</p>
                                            {vendor.alternateContact && (
                                                <p className="text-[10px] text-gray-400">{vendor.alternateContact}</p>
                                            )}
                                            {vendor.email && (
                                                <p className="text-[10px] text-blue-500 truncate">{vendor.email}</p>
                                            )}
                                        </div>

                                        {/* Location */}
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-900 font-bold truncate">{vendor.city || 'N/A'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{vendor.state || 'N/A'}</p>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {vendor.status === 'ACTIVE' ? <CheckCircle size={10} /> : <Ban size={10} />}
                                                {vendor.status}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-1">
                                            <button onClick={() => handleEdit(vendor)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Edit Vendor">
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
                                                title={isSuperAdmin ? 'Delete Permanently' : 'Request Deletion'}
                                            >
                                                {isDeleting || isRequestingDelete ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Pagination currentPage={currentPage} totalPages={meta.totalPages} onPageChange={(p) => setCurrentPage(p)} />
                    </div>
                )}
            </main>

            {/* ── Add / Edit Modal ──────────────────────────────────────────── */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setShowAddModal(false); resetForm(); }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10 max-h-[92vh] flex flex-col"
                        >
                            {/* Modal header */}
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                                    <p className="text-sm text-gray-500">Supplier information for procurement</p>
                                </div>
                                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-5 overflow-y-auto flex-1">

                                {/* Vendor Type toggle */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vendor Type *</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { type: 'NORMAL',     Icon: Building2, title: 'Business',   sub: 'Company / Firm'      },
                                            { type: 'INDIVIDUAL', Icon: User,       title: 'Individual', sub: 'Person / Freelancer' },
                                        ].map(({ type, Icon, title, sub }) => {
                                            const active = formData.vendorType === type;
                                            return (
                                                <button
                                                    key={type} type="button"
                                                    onClick={() => {
                                                        setFormData((p) => ({ ...p, vendorType: type, vendorGST: '' }));
                                                        if (type === 'INDIVIDUAL' && idType === 'GST') setIdType('PAN');
                                                    }}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                                        active ? 'border-gray-900 bg-gray-50' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Icon size={16} className={active ? 'text-gray-900' : 'text-gray-400'} />
                                                    <div>
                                                        <p className="text-sm font-medium leading-none text-gray-900">{title}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {isIndividual && (
                                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                            Individual vendors use free-text descriptions in purchases — no inventory items required.
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        {isIndividual ? 'Full Name *' : 'Company Name *'}
                                    </label>
                                    <input
                                        required type="text"
                                        placeholder={isIndividual ? 'e.g. Ramesh Kumar' : 'e.g. MedPlus Essentials'}
                                        value={formData.fullName}
                                        onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                                        className={fldCls}
                                    />
                                </div>

                                {/* Contact + Alternate */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Contact Number *</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input
                                                required type="tel" maxLength={10} placeholder="10-digit number"
                                                value={formData.contactNumber}
                                                onChange={(e) => setFormData((p) => ({ ...p, contactNumber: e.target.value }))}
                                                className={`${fldCls} pl-9`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Alternate Contact</label>
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input
                                                type="tel" maxLength={10} placeholder="Optional"
                                                value={formData.alternateContact}
                                                onChange={(e) => setFormData((p) => ({ ...p, alternateContact: e.target.value }))}
                                                className={`${fldCls} pl-9`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="email" placeholder="vendor@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                            className={`${fldCls} pl-9`}
                                        />
                                    </div>
                                </div>

                                {/* ID Type + Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">ID Document Type *</label>
                                        <select
                                            value={idType}
                                            onChange={(e) => { setIdType(e.target.value); setFormData((p) => ({ ...p, vendorGST: '' })); }}
                                            className={fldCls}
                                        >
                                            {availableIdTypes.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                            {idType === 'OTHERS' ? 'ID' : idType} Number *
                                        </label>
                                        <input
                                            required type="text"
                                            placeholder={ID_PLACEHOLDERS[idType]}
                                            maxLength={ID_MAXLEN[idType]}
                                            value={formData.vendorGST}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (idType === 'AADHAAR') val = val.replace(/\D/g, '');
                                                setFormData((p) => ({ ...p, vendorGST: val }));
                                            }}
                                            className={`${fldCls} uppercase`}
                                        />
                                    </div>
                                </div>

                                {/* State + City — searchable CSC dropdowns */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">State *</label>
                                        {loadingFormStates ? (
                                            <div className={`${fldCls} flex items-center gap-2 text-gray-400`}>
                                                <Loader2 size={13} className="animate-spin" />
                                                <span className="text-xs">Loading…</span>
                                            </div>
                                        ) : (
                                            <SearchableDropdown
                                                value={formData.stateIso}
                                                onChange={(isoCode, obj) => setFormData((p) => ({ ...p, state: obj?.name || isoCode, stateIso: isoCode, city: '' }))}
                                                options={formStates}
                                                placeholder="Select State"
                                                label="state"
                                                getLabel={(o) => o.name || ''}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">City *</label>
                                        {loadingFormCities ? (
                                            <div className={`${fldCls} flex items-center gap-2 text-gray-400`}>
                                                <Loader2 size={13} className="animate-spin" />
                                                <span className="text-xs">Loading…</span>
                                            </div>
                                        ) : (
                                            <SearchableDropdown
                                                value={formData.city}
                                                onChange={(city) => setFormData((p) => ({ ...p, city }))}
                                                options={formCities}
                                                placeholder={formData.stateIso ? 'Select City' : 'Select state first'}
                                                disabled={!formData.stateIso || loadingFormCities}
                                                label="city"
                                                getLabel={(o) => o}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Full Address *</label>
                                    <textarea
                                        required rows={3} placeholder="Enter complete office address…"
                                        value={formData.fullAddress}
                                        onChange={(e) => setFormData((p) => ({ ...p, fullAddress: e.target.value }))}
                                        className={`${fldCls} resize-none`}
                                    />
                                </div>

                                {/* Submit */}
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
                onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
}

const fldCls = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-sm';