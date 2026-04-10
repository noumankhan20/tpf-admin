"use client";

import { useState, useEffect } from 'react';
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
    const itemsPerPage = 10;

    // API Hooks - Passing all filters to backend
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
    const professions = [...new Set(volunteersData.map(v => v.kycDetails?.profession).filter(Boolean))].sort();
    const cities = [...new Set(volunteersData.map(v => v.kycDetails?.city).filter(Boolean))].sort();
    const states = [...new Set(volunteersData.map(v => v.kycDetails?.state).filter(Boolean))].sort();

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

    // Local filtering in addition to backend for smoother UI
    const filteredVolunteers = volunteersData.filter(volunteer => {
        const profession = (volunteer.kycDetails?.profession || "").toLowerCase();
        const city = (volunteer.kycDetails?.city || "").toLowerCase();
        const state = (volunteer.kycDetails?.state || "").toLowerCase();

        const matchesProfession = !professionFilter || profession.includes(professionFilter.toLowerCase());
        const matchesCity = !cityFilter || city.includes(cityFilter.toLowerCase());
        const matchesState = !stateFilter || state.includes(stateFilter.toLowerCase());

        return matchesProfession && matchesCity && matchesState;
    });

    // Stats
    const totalVolunteers = volunteersData.length;
    const allVouchers = volunteersData.flatMap(v => v.vouchers || []);
    const pendingVouchers = allVouchers.filter(v => v.status === "pending").length;

    // Pagination
    const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVolunteers = filteredVolunteers.slice(startIndex, startIndex + itemsPerPage);

    const handleBackClick = () => {
        if (selectedVolunteerId) {
            setSelectedVolunteerId(null);
            setSelectedVoucher(null);
        } else {
            router.push('/select-portal?category=tpf_management');
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

            toast.success(`Voucher ${action} successfully!`);
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
            pending: "bg-amber-50 text-amber-700 border-amber-100",
            approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
            clarification: "bg-orange-50 text-orange-700 border-orange-100",
            rejected: "bg-red-50 text-red-700 border-red-100"
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[status] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (isLoadingVolunteers && !volunteersData.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" style={{ fontFamily: 'Arial, sans-serif' }}>
                <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Loading volunteers...</p>
                </div>
            </div>
        );
    }

    if (selectedVolunteerId && selectedVolunteer) {
        const filteredVouchers = (selectedVolunteer.vouchers || []).filter(
            voucher => voucherFilter === "all" || voucher.status === voucherFilter
        );

        const voucherCounts = (selectedVolunteer.vouchers || []).reduce((acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            acc.all = (acc.all || 0) + 1;
            return acc;
        }, { all: 0, pending: 0, approved: 0, clarification: 0, rejected: 0 });

        return (
            <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: 'Arial, sans-serif' }}>
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                        <button
                            onClick={handleBackClick}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">Volunteer Details</h1>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4">
                                        {selectedVolunteer.fullName.charAt(0)}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedVolunteer.fullName}</h2>
                                    <p className="text-emerald-600 font-medium text-sm">{selectedVolunteer.kycDetails?.profession || 'Volunteer'}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                        <Mail className="text-gray-400 mt-1" size={18} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 font-medium">Email</p>
                                            <p className="text-sm font-bold text-gray-700 truncate">{selectedVolunteer.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                        <Phone className="text-gray-400 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Mobile</p>
                                            <p className="text-sm font-bold text-gray-700">{selectedVolunteer.mobileNo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                        <MapPin className="text-gray-400 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Location</p>
                                            <p className="text-sm font-bold text-gray-700">
                                                {selectedVolunteer.kycDetails?.city}, {selectedVolunteer.kycDetails?.state}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedVolunteer.helpDescription && (
                                        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                                            <Heart className="text-emerald-500 mt-1 shrink-0" size={18} />
                                            <div>
                                                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">How can I help?</p>
                                                <p className="text-sm font-medium text-gray-700 leading-relaxed mt-1 italic">
                                                    "{selectedVolunteer.helpDescription}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Total Vouchers</p>
                                        <p className="text-2xl font-bold text-emerald-700">{selectedVolunteer.vouchers?.length || 0}</p>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Approved Amt</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            ₹{selectedVolunteer.vouchers?.reduce((sum, v) => v.status === 'approved' ? sum + v.amount : sum, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vouchers List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-lg font-bold text-gray-900">Expense Vouchers</h3>
                                    <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
                                        {['all', 'pending', 'approved', 'clarification', 'rejected'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setVoucherFilter(f)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${voucherFilter === f ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <span>{f}</span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${voucherFilter === f ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    {voucherCounts[f] || 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>


                                <div className="divide-y divide-gray-100">
                                    {filteredVouchers.length > 0 ? (
                                        filteredVouchers.map((voucher) => (
                                            <div key={voucher._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-lg font-bold text-gray-900">₹{voucher.amount.toLocaleString()}</span>
                                                        {getVoucherStatusBadge(voucher.status)}
                                                    </div>
                                                    <p className="text-gray-500 text-sm font-medium line-clamp-1">{voucher.description}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                                                        {new Date(voucher.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedVoucher(voucher);
                                                        setShowVoucherModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center text-gray-500">
                                            <p className="font-medium italic">No vouchers found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Voucher Detail Modal */}
                <AnimatePresence>
                    {showVoucherModal && selectedVoucher && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeModal}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">Voucher Details</h3>
                                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                        <XCircle size={24} />
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Amount</p>
                                            <p className="text-2xl font-bold text-emerald-600">₹{selectedVoucher.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Date</p>
                                            <p className="text-xl font-bold text-gray-800">{new Date(selectedVoucher.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Description</p>
                                        <p className="text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedVoucher.description}</p>
                                    </div>
                                    {selectedVoucher.proofDocument && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-2">Proof Image</p>
                                            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900 group relative">
                                                <img
                                                    src={getMediaUrl(selectedVoucher.proofDocument.fileUrl)}
                                                    alt="Voucher Proof"
                                                    className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                                />
                                                <a
                                                    href={getMediaUrl(selectedVoucher.proofDocument.fileUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="bg-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                                        <ExternalLink size={16} /> Open Full View
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {selectedVoucher.status === "pending" && (
                                        <div className="pt-6 border-t border-gray-200">
                                            {clarificationReason !== "" ? (
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                                        <label className="text-xs font-bold text-orange-600 block mb-2">Clarification Reason</label>
                                                        <textarea
                                                            value={clarificationReason}
                                                            onChange={(e) => setClarificationReason(e.target.value)}
                                                            className="w-full bg-transparent outline-none font-medium text-sm border-none shadow-none resize-none"
                                                            rows="3"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleVoucherAction(selectedVoucher._id, "clarification")}
                                                            disabled={isUpdatingStatus}
                                                            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-500/20"
                                                        >
                                                            Send Request
                                                        </button>
                                                        <button onClick={() => setClarificationReason("")} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-3">
                                                    <button
                                                        onClick={() => handleVoucherAction(selectedVoucher._id, "approved")}
                                                        disabled={isUpdatingStatus}
                                                        className="py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-md"
                                                    >
                                                        <CheckCircle size={18} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setClarificationReason("Please provide a clearer bill receipt.")}
                                                        className="py-3 bg-orange-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 shadow-md"
                                                    >
                                                        <AlertCircle size={18} /> Clarify
                                                    </button>
                                                    <button
                                                        onClick={() => handleVoucherAction(selectedVoucher._id, "rejected")}
                                                        disabled={isUpdatingStatus}
                                                        className="py-3 bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-700 shadow-md"
                                                    >
                                                        <XCircle size={18} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedVoucher.status === "clarification" && (
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                            <p className="text-xs font-bold text-orange-600 uppercase mb-1">Reason for Clarification:</p>
                                            <p className="text-gray-700 font-medium font-italic italic">"{selectedVoucher.clarificationReason}"</p>
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
        <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/select-portal?category=tpf_management')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-emerald-600" size={24} />
                        Volunteer Management
                    </h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Total Volunteers</p>
                            <h3 className="text-3xl font-bold text-gray-900">{totalVolunteers}</h3>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Users size={28} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Pending Vouchers</p>
                            <h3 className="text-3xl font-bold text-gray-900">{pendingVouchers}</h3>
                        </div>
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <FileText size={28} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Name or Email..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <select
                                value={professionFilter}
                                onChange={(e) => { setProfessionFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="">All Professions</option>
                                {professions.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                        <div className="relative">
                            <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <select
                                value={cityFilter}
                                onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="">All Cities</option>
                                {cities.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <select
                                value={stateFilter}
                                onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="">All States</option>
                                {states.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Volunteer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Profession</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vouchers</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedVolunteers.length > 0 ? (
                                    paginatedVolunteers.map((volunteer) => (
                                        <tr key={volunteer._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                                        {volunteer.fullName.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 truncate">{volunteer.fullName}</p>
                                                        <p className="text-[11px] text-gray-500 font-medium truncate">{volunteer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell font-bold text-sm text-gray-600">
                                                {volunteer.kycDetails?.profession || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell font-bold text-sm text-gray-600 truncate max-w-[150px]">
                                                {volunteer.kycDetails?.city}, {volunteer.kycDetails?.state}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{volunteer.vouchers?.length || 0} Total</span>
                                                    {volunteer.vouchers?.some(v => v.status === 'pending') && (
                                                        <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedVolunteerId(volunteer._id)}
                                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                                                >
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-500 italic font-medium">
                                            No volunteers found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}