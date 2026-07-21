"use client";

import { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    Search,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Phone,
    Mail,
    MapPin,
    Eye,
    Filter,
    Trash,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    MapPinned,
    Briefcase,
    Calendar,
    Wallet,
    Info,
    ExternalLink,
    CheckCircle2,
    Loader2,
    Heart,
    ChevronDown
} from 'lucide-react';
import {
    useGetVolunteersQuery,
    useGetVolunteerByIdQuery,
    useUpdateVoucherStatusMutation
} from '@/utils/slices/vouchersApiSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getMediaUrl } from '@/utils/media';

export default function VolunteerModule() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [professionFilter, setProfessionFilter] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);
    const [voucherFilter, setVoucherFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [clarificationReason, setClarificationReason] = useState("");
    const [onlyPendingVouchersFilter, setOnlyPendingVouchersFilter] = useState(false);
    const itemsPerPage = 10;

    // API Hooks - Passing filters to backend
    const { data: volunteersResponse, isLoading: isLoadingVolunteers, isError: isErrorVolunteers } = useGetVolunteersQuery({
        search: searchQuery,
        profession: professionFilter,
        city: cityFilter,
        state: stateFilter
    });

    const { data: volunteerDetailResponse, isLoading: isLoadingDetail } = useGetVolunteerByIdQuery(selectedVolunteerId, {
        skip: !selectedVolunteerId
    });

    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateVoucherStatusMutation();

    const volunteersData = volunteersResponse?.data || [];
    const selectedVolunteer = volunteerDetailResponse?.data;

    // Extract unique values for filters
    const professions = useMemo(() => {
        return [...new Set(volunteersData.map(v => v.kycDetails?.profession).filter(Boolean))].sort();
    }, [volunteersData]);

    const cities = useMemo(() => {
        return [...new Set(volunteersData.map(v => v.kycDetails?.city).filter(Boolean))].sort();
    }, [volunteersData]);

    const states = useMemo(() => {
        return [...new Set(volunteersData.map(v => v.kycDetails?.state).filter(Boolean))].sort();
    }, [volunteersData]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showVoucherModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showVoucherModal]);

    // Process volunteers: Calculate pending voucher count & Sort by pending count descending
    const processedVolunteers = useMemo(() => {
        const list = volunteersData.map(v => {
            const pendingCount = (v.vouchers || []).filter(voc => voc.status === "pending").length;
            return {
                ...v,
                pendingVouchersCount: pendingCount
            };
        });

        return [...list].sort((a, b) => {
            if (b.pendingVouchersCount !== a.pendingVouchersCount) {
                return b.pendingVouchersCount - a.pendingVouchersCount;
            }
            return new Date(b.createdAt || b.createdDate) - new Date(a.createdAt || a.createdDate);
        });
    }, [volunteersData]);

    // Local filtering in addition to backend
    const filteredVolunteers = useMemo(() => {
        return processedVolunteers.filter(volunteer => {
            const profession = (volunteer.kycDetails?.profession || "").toLowerCase();
            const city = (volunteer.kycDetails?.city || "").toLowerCase();
            const state = (volunteer.kycDetails?.state || "").toLowerCase();

            const matchesProfession = !professionFilter || profession.includes(professionFilter.toLowerCase());
            const matchesCity = !cityFilter || city.includes(cityFilter.toLowerCase());
            const matchesState = !stateFilter || state.includes(stateFilter.toLowerCase());
            const matchesOnlyPending = !onlyPendingVouchersFilter || volunteer.pendingVouchersCount > 0;

            return matchesProfession && matchesCity && matchesState && matchesOnlyPending;
        });
    }, [processedVolunteers, professionFilter, cityFilter, stateFilter, onlyPendingVouchersFilter]);

    // Stats
    const totalVolunteers = volunteersData.length;
    const allVouchers = useMemo(() => volunteersData.flatMap(v => v.vouchers || []), [volunteersData]);
    const pendingVouchers = useMemo(() => allVouchers.filter(v => v.status === "pending").length, [allVouchers]);

    // Pagination
    const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVolunteers = useMemo(() => {
        return filteredVolunteers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredVolunteers, startIndex]);

    const handleBackClick = () => {
        if (selectedVolunteerId) {
            setSelectedVolunteerId(null);
            setSelectedVoucher(null);
        } else {
            router.back();
        }
    };

    const handleVoucherAction = async (voucherId, action) => {
        if (action === 'clarification' && !clarificationReason) {
            toast.error("Please provide a clarification reason");
            return;
        }

        try {
            await updateStatus({
                id: voucherId,
                status: action,
                clarificationReason: action === 'clarification' ? clarificationReason : undefined
            }).unwrap();

            toast.success(`Voucher status updated successfully!`);
            setShowVoucherModal(false);
            setClarificationReason("");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update voucher status");
        }
    };

    const closeModal = () => {
        setShowVoucherModal(false);
        setSelectedVoucher(null);
        setClarificationReason("");
    };

    const getVoucherStatusBadge = (status) => {
        const styles = {
            pending: "bg-amber-50 text-amber-700 border-amber-200/60",
            approved: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
            clarification: "bg-orange-50 text-orange-700 border-orange-200/60",
            rejected: "bg-rose-50 text-rose-700 border-rose-200/60"
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border uppercase ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    if (isLoadingVolunteers && !volunteersData.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
                    <p className="text-sm text-gray-500 font-medium">Loading volunteers data...</p>
                </div>
            </div>
        );
    }

    if (selectedVolunteerId && selectedVolunteer) {
        // Sort: Pending first, then newest first
        const sortedVouchers = [...(selectedVolunteer.vouchers || [])].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const filteredVouchers = sortedVouchers.filter(
            voucher => voucherFilter === "all" || voucher.status === voucherFilter
        );

        const voucherCounts = (selectedVolunteer.vouchers || []).reduce((acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            acc.all = (acc.all || 0) + 1;
            return acc;
        }, { all: 0, pending: 0, approved: 0, clarification: 0, rejected: 0 });

        return (
            <div className="min-h-screen bg-[#FBFBFB] text-gray-800">
                {/* Header */}
                <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBackClick}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 cursor-pointer"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Volunteer Profile</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${selectedVolunteer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                {selectedVolunteer.status || 'Active'}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Info */}
                        <div className="lg:col-span-1 space-y-5">
                            <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
                                <div className="flex items-center gap-4 mb-5 border-b border-gray-100 pb-5">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shrink-0 shadow-md shadow-emerald-500/10">
                                        {selectedVolunteer.fullName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-gray-900 truncate leading-tight">{selectedVolunteer.fullName}</h2>
                                        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{selectedVolunteer.kycDetails?.profession || 'Volunteer'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3.5">
                                    <div className="flex items-start gap-3">
                                        <Mail className="text-gray-400 mt-0.5 shrink-0" size={15} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Email Address</p>
                                            <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{selectedVolunteer.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="text-gray-400 mt-0.5 shrink-0" size={15} />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Phone Number</p>
                                            <p className="text-xs font-semibold text-gray-700 mt-0.5">{selectedVolunteer.mobileNo || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-gray-400 mt-0.5 shrink-0" size={15} />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Address Location</p>
                                            <p className="text-xs font-semibold text-gray-700 mt-0.5">
                                                {selectedVolunteer.kycDetails?.city || 'N/A'}, {selectedVolunteer.kycDetails?.state || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedVolunteer.helpDescription && (
                                        <div className="mt-4 p-3 rounded-lg bg-emerald-50/30 border border-emerald-100/50">
                                            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Statement of Help</p>
                                            <p className="text-xs font-medium text-gray-600 mt-1 italic leading-relaxed">
                                                "{selectedVolunteer.helpDescription}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stat Card */}
                            <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-4">Voucher Statistics</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Count</p>
                                        <p className="text-xl font-semibold text-gray-800 mt-1">{selectedVolunteer.vouchers?.length || 0}</p>
                                    </div>
                                    <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-100/50 text-center">
                                        <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Approved</p>
                                        <p className="text-xl font-semibold text-emerald-800 mt-1">
                                            ₹{selectedVolunteer.vouchers?.reduce((sum, v) => v.status === 'approved' ? sum + v.amount : sum, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vouchers Section */}
                        <div className="lg:col-span-2 space-y-5">
                            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Expense Vouchers</h3>
                                    <div className="flex flex-wrap gap-1 bg-gray-50 border border-gray-100 p-1 rounded-lg">
                                        {['all', 'pending', 'approved', 'clarification', 'rejected'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setVoucherFilter(f)}
                                                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all flex items-center gap-1.5 cursor-pointer ${
                                                    voucherFilter === f 
                                                        ? 'bg-white text-emerald-700 shadow-sm border border-gray-200/30' 
                                                        : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                            >
                                                <span>{f}</span>
                                                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-semibold ${voucherFilter === f ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-150 text-gray-500'}`}>
                                                    {voucherCounts[f] || 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {filteredVouchers.length > 0 ? (
                                        filteredVouchers.map((voucher) => (
                                            <div 
                                                key={voucher._id} 
                                                className={`p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 relative ${
                                                    voucher.status === 'pending' ? 'border-l-2 border-amber-500' : ''
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2.5 mb-1.5">
                                                        <span className="text-sm font-semibold text-gray-900">₹{voucher.amount.toLocaleString()}</span>
                                                        {getVoucherStatusBadge(voucher.status)}
                                                    </div>
                                                    <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-1">{voucher.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-medium text-gray-400 uppercase">
                                                            Submitted: {new Date(voucher.createdAt).toLocaleDateString()}
                                                        </span>
                                                        {voucher.particulars && (
                                                            <>
                                                                <span className="text-gray-300 text-[10px]">•</span>
                                                                <span className="text-[10px] font-medium text-gray-400 truncate max-w-[150px]">
                                                                    {voucher.particulars}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedVoucher(voucher);
                                                        setShowVoucherModal(true);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                                        voucher.status === 'pending'
                                                            ? 'bg-amber-50/50 border-amber-200 text-amber-700 hover:bg-amber-100/50'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {voucher.status === 'pending' ? 'Review Voucher' : 'View Details'}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center text-gray-400">
                                            <Info className="w-5 h-5 mx-auto mb-2 text-gray-300" />
                                            <p className="text-xs font-medium italic">No vouchers found in this category</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Voucher Review Modal */}
                <AnimatePresence>
                    {showVoucherModal && selectedVoucher && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeModal}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: 15 }}
                                transition={{ duration: 0.15 }}
                                className="bg-white rounded-xl w-full max-w-xl relative shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Voucher Review Workspace</span>
                                    </div>
                                    <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer">
                                        <XCircle size={18} />
                                    </button>
                                </div>
                                
                                <div className="p-5 overflow-y-auto space-y-4">
                                    {/* Amount and Date Header Grid */}
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Voucher Amount</p>
                                            <p className="text-xl font-bold text-emerald-700 mt-1">₹{selectedVoucher.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Submission Date</p>
                                            <p className="text-base font-semibold text-gray-700 mt-1">{new Date(selectedVoucher.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Particulars & Quantity Details Grid */}
                                    {(selectedVoucher.particulars || selectedVoucher.quantity) && (
                                        <div className="grid grid-cols-2 gap-3.5">
                                            {selectedVoucher.particulars && (
                                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Particulars</p>
                                                    <p className="text-xs font-medium text-gray-700 mt-1 truncate">{selectedVoucher.particulars}</p>
                                                </div>
                                            )}
                                            {selectedVoucher.quantity && (
                                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Quantity & Unit</p>
                                                    <p className="text-xs font-semibold text-gray-750 mt-1">
                                                        {selectedVoucher.quantity} {selectedVoucher.unit || 'unit'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Location details */}
                                    {(selectedVoucher.city || selectedVoucher.state) && (
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Spent Location</p>
                                            <p className="text-xs font-semibold text-gray-700 mt-1">
                                                {selectedVoucher.city ? `${selectedVoucher.city}, ` : ''}{selectedVoucher.state || ''}
                                            </p>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Description / Purpose</p>
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 p-3.5 rounded-lg whitespace-pre-line">{selectedVoucher.description}</p>
                                    </div>

                                    {/* Proof image */}
                                    {selectedVoucher.proofDocument && (
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Proof Document / Bill Receipt</p>
                                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-900 group relative">
                                                <img
                                                    src={getMediaUrl(selectedVoucher.proofDocument.fileUrl)}
                                                    alt="Voucher Proof"
                                                    className="w-full h-auto max-h-[220px] object-contain mx-auto"
                                                />
                                                <a
                                                    href={getMediaUrl(selectedVoucher.proofDocument.fileUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="bg-white/95 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 text-gray-800 shadow-md">
                                                        <ExternalLink size={13} /> Open Full View
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {selectedVoucher.status === "pending" && (
                                        <div className="pt-4 border-t border-gray-100 shrink-0">
                                            {clarificationReason !== "" ? (
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-orange-50/50 border border-orange-100/70 rounded-lg">
                                                        <label className="text-[10px] font-bold text-orange-700 block mb-1.5">Clarification Requirement / Notes</label>
                                                        <textarea
                                                            value={clarificationReason}
                                                            onChange={(e) => setClarificationReason(e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-md p-2 outline-none text-xs font-medium shadow-none resize-none focus:border-orange-400 transition-colors"
                                                            rows="2"
                                                            autoFocus
                                                            placeholder="State clearly what information or receipt is missing..."
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleVoucherAction(selectedVoucher._id, "clarification")}
                                                            disabled={isUpdatingStatus}
                                                            className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                                                        >
                                                            {isUpdatingStatus ? <Loader2 className="animate-spin w-3 h-3" /> : null}
                                                            Send Clarification Request
                                                        </button>
                                                        <button 
                                                            onClick={() => setClarificationReason("")} 
                                                            className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg font-semibold text-xs hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        onClick={() => handleVoucherAction(selectedVoucher._id, "approved")}
                                                        disabled={isUpdatingStatus}
                                                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                                                    >
                                                        {isUpdatingStatus ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <CheckCircle size={15} />}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setClarificationReason("Please provide a clearer receipt or voucher bill detail.")}
                                                        className="py-2.5 bg-amber-500 hover:bg-amber-650 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                                                    >
                                                        <AlertCircle size={15} /> Clarification
                                                    </button>
                                                    <button
                                                        onClick={() => handleVoucherAction(selectedVoucher._id, "rejected")}
                                                        disabled={isUpdatingStatus}
                                                        className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                                                    >
                                                        <XCircle size={15} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedVoucher.status === "clarification" && (
                                        <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg shrink-0">
                                            <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">Clarification Reason Requested</p>
                                            <p className="text-xs text-gray-700 italic">"{selectedVoucher.clarificationReason}"</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-gray-800">
            {/* Header */}
            <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                            Volunteer Management
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Volunteers</p>
                            <h3 className="text-2xl font-bold text-gray-800">{totalVolunteers}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 text-gray-500 rounded-lg flex items-center justify-center shrink-0">
                            <Users size={20} />
                        </div>
                    </div>
                    {/* Actionable Pending Vouchers Stat Card */}
                    <div 
                        onClick={() => setOnlyPendingVouchersFilter(!onlyPendingVouchersFilter)}
                        className={`p-4.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none shadow-sm ${
                            onlyPendingVouchersFilter 
                                ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-500/10' 
                                : 'bg-white border-gray-200/80 hover:border-amber-300/80'
                        }`}
                    >
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Pending Vouchers</p>
                            <h3 className="text-2xl font-bold text-amber-700">{pendingVouchers}</h3>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                            onlyPendingVouchersFilter 
                                ? 'bg-amber-100 border-amber-200 text-amber-700 animate-pulse' 
                                : 'bg-amber-50/50 border-amber-100/50 text-amber-600'
                        }`}>
                            <FileText size={20} />
                        </div>
                    </div>
                </div>

                {/* Filters toolbar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-semibold"
                            />
                        </div>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                            <select
                                value={professionFilter}
                                onChange={(e) => { setProfessionFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-8 py-2 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-semibold appearance-none cursor-pointer"
                            >
                                <option value="">All Professions</option>
                                {professions.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                        </div>
                        <div className="relative">
                            <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                            <select
                                value={cityFilter}
                                onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-8 py-2 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-semibold appearance-none cursor-pointer"
                            >
                                <option value="">All Cities</option>
                                {cities.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                            <select
                                value={stateFilter}
                                onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-8 py-2 bg-gray-50/50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-semibold appearance-none cursor-pointer"
                            >
                                <option value="">All States</option>
                                {states.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/55 border-b border-gray-250/20">
                                <tr>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Volunteer</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Profession</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Location</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vouchers</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/60">
                                {paginatedVolunteers.length > 0 ? (
                                    paginatedVolunteers.map((volunteer) => (
                                        <tr key={volunteer._id} className="hover:bg-gray-50/45 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs shadow-sm">
                                                        {volunteer.fullName.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 text-xs truncate leading-snug">{volunteer.fullName}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{volunteer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 hidden md:table-cell font-semibold text-xs text-gray-500">
                                                {volunteer.kycDetails?.profession || 'N/A'}
                                            </td>
                                            <td className="px-5 py-3 hidden lg:table-cell font-semibold text-xs text-gray-500 truncate max-w-[150px]">
                                                {volunteer.kycDetails?.city || 'N/A'}, {volunteer.kycDetails?.state || 'N/A'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="inline-flex flex-col">
                                                    <span className="text-xs font-semibold text-gray-700">{volunteer.vouchers?.length || 0} Total</span>
                                                    {volunteer.pendingVouchersCount > 0 && (
                                                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-1 py-0.2 mt-0.5 w-max">
                                                            {volunteer.pendingVouchersCount} pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="inline-flex items-center gap-2 justify-end">
                                                    {volunteer.pendingVouchersCount > 0 ? (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVolunteerId(volunteer._id);
                                                                    setVoucherFilter("pending");
                                                                }}
                                                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-sm active:scale-97"
                                                            >
                                                                Review Pending
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVolunteerId(volunteer._id);
                                                                    setVoucherFilter("all");
                                                                }}
                                                                className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[11px] font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm active:scale-97"
                                                            >
                                                                Profile
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedVolunteerId(volunteer._id);
                                                                setVoucherFilter("all");
                                                            }}
                                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[11px] font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-sm active:scale-97"
                                                        >
                                                            View Profile
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center text-gray-400 font-medium text-xs italic">
                                            No volunteers found matching your filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-250/20 flex items-center justify-between select-none">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all cursor-pointer bg-white"
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all cursor-pointer bg-white"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}