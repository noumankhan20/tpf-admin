'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../Common/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Bell,
    Search,
    CheckCircle,
    XCircle,
    User,
    MapPin,
    CreditCard,
    Phone,
    Mail,
    Filter,
    SortAsc,
    SortDesc,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    FileText,
    Calendar,
    X as XIcon,
    RefreshCw,
    Printer
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetKycRequestsQuery, useUpdateKycStatusMutation } from '@/utils/slices/kycApiSlice';

export default function KYCVerificationPage() {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Pagination & Sort State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Debounce Search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);


    // Query Hook
    const { data: kycData, isLoading, isFetching } = useGetKycRequestsQuery({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: debouncedSearch,
        sortBy,
        sortOrder
    });

    const [updateStatus, { isLoading: isUpdating }] = useUpdateKycStatusMutation();

    // Handlers
    const handleApprove = async (id) => {
        try {
            await updateStatus({ id, status: 'verified' }).unwrap();
            setSelectedUser(null);
            toast.success("KYC Approved Successfully!");
        } catch (err) {
            console.error("KYC Approve Error:", err);
            toast.error(err?.data?.message || "Failed to approve KYC");
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.warning("Please enter a reason for rejection.");
            return;
        }
        try {
            await updateStatus({ id, status: 'rejected', remarks: rejectReason }).unwrap();
            setIsRejecting(false);
            setRejectReason('');
            setSelectedUser(null);
            toast.success("KYC Rejected Successfully!");
        } catch (err) {
            console.error("KYC Reject Error:", err);
            toast.error(err?.data?.message || "Failed to reject KYC");
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const activeFilterCount = [
        statusFilter !== 'all',
        debouncedSearch !== '',
        sortBy !== 'createdAt'
    ].filter(Boolean).length;

    // Derived Data
    const users = kycData?.data || [];
    const totalCount = kycData?.total || 0;
    const totalPages = kycData?.totalPages || 1;
    const stats = kycData?.stats || { pending: 0, verified: 0, rejected: 0 };

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalCount);

    const printStyles = `
  @media print {
    @page {
      margin: 15mm;
      size: A4;
    }
    
    /* Global Reset */
    html, body {
      visibility: hidden;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white;
    }

    /* Target the Printable Area */
    #printable-form {
      visibility: visible;
      position: absolute;
      left: 0;
      top: 0;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white;
      z-index: 9999;
    }

    /* Ensure children are visible */
    #printable-form * {
      visibility: visible;
    }

    /* Fix Text Cutoff (Crucial for Emails) */
    .print-break-all {
      word-break: break-all;
      overflow-wrap: break-word;
    }

    /* Hide UI elements */
    .no-print, header, button {
      display: none !important;
    }
    
    /* Layout Adjustments */
    .avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
    }
  }
`;

    return (
        <>

            <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
                {/* Header */}
                <style>{printStyles}</style>
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/select-portal?category=work')}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">KYC Verification</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {isFetching && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                        <NotificationBell moduleFilter="KYC" />
                    </div>
                </header>

                <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-hidden flex flex-col">

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={<FileText className="text-blue-600" />} count={totalCount} label="Total Requests" />
                        <StatCard icon={<Clock className="text-orange-600" />} count={stats.pending} label="Pending" />
                        <StatCard icon={<CheckCircle className="text-green-600" />} count={stats.verified} label="Verified" />
                        <StatCard icon={<XCircle className="text-red-600" />} count={stats.rejected} label="Rejected" />
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search Name, PAN, Mobile..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
                            >
                                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                            </button>

                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                                    <XIcon className="w-4 h-4" /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Split */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                        {/* List View */}
                        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">Requests</h2>
                                <span className="text-xs text-gray-500">{startIndex}-{endIndex} of {totalCount}</span>
                            </div>

                            <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                                {isLoading ? (
                                    <p className="text-center text-gray-500 p-8">Loading...</p>
                                ) : users.length === 0 ? (
                                    <div className="text-center text-gray-500 p-8">
                                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>No records found</p>
                                    </div>
                                ) : (
                                    users.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => { setSelectedUser(user); setIsRejecting(false); }}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedUser?._id === user._id
                                                ? 'bg-blue-50 border-blue-500 shadow-md'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-semibold text-base truncate ${selectedUser?._id === user._id ? 'text-blue-700' : 'text-gray-800'
                                                    }`}>
                                                    {user.kycDetails?.fullLegalName || user.fullName}
                                                </h3>
                                                <Badge status={user.kycDetails?.status} />
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                <p className="flex items-center gap-2"><CreditCard size={12} /> {user.kycDetails?.panNumber}</p>
                                                <p className="flex items-center gap-2"><Phone size={12} /> {user.mobileNo}</p>
                                                <p className="flex items-center gap-2">
                                                    <Clock size={12} />
                                                    {user.kycDetails?.submittedAt ? new Date(user.kycDetails.submittedAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-center gap-2">
                                    <PageBtn onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} icon={<ChevronLeft size={16} />} />
                                    <span className="text-sm font-medium flex items-center px-2">Page {currentPage} of {totalPages}</span>
                                    <PageBtn onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} icon={<ChevronRight size={16} />} />
                                </div>
                            )}
                        </div>

                        {/* Detail View */}
                        <div
                            id="printable-form"
                            className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm relative">
                            {selectedUser ? (
                                <div className="flex flex-col h-full">
                                    <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedUser.kycDetails?.fullLegalName}</h2>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span>ID: {selectedUser._id}</span>
                                                    <span>•</span>
                                                    <span>Registered: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                                    <button
                                                        onClick={() => window.print()}
                                                        className="no-print p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                                                        title="Print Form"
                                                    >
                                                        <Printer size={20} />
                                                    </button>
                                                </div>

                                            </div>

                                            <Badge status={selectedUser.kycDetails?.status} size="large" />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
                                        <div className="grid grid-cols-1 gap-6 avoid-break print:grid-cols-1">
                                            {/* Stacked sections for better vertical flow in print if needed, but inner content is now 2-col */}
                                            <DetailSection title="KYC Information" icon={<CreditCard className="text-blue-600" />}>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                                    <Field label="Full Legal Name" value={selectedUser.kycDetails?.fullLegalName} />
                                                    <Field label="PAN Number" value={selectedUser.kycDetails?.panNumber} copyable />
                                                    <Field label="PAN Verified" value={selectedUser.kycDetails?.panVerified ? "Yes" : "No"} />
                                                    <Field label="Submission Date" value={selectedUser.kycDetails?.submittedAt ? new Date(selectedUser.kycDetails.submittedAt).toLocaleString() : 'N/A'} />
                                                </div>
                                            </DetailSection>

                                            <DetailSection title="Contact & Address" icon={<MapPin className="text-blue-600" />}>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                                    <Field label="Mobile Number" value={selectedUser.mobileNo} icon={<Phone size={14} />} />
                                                    <Field label="Email" value={selectedUser.email} icon={<Mail size={14} />} />

                                                    {/* Address spans full width or 2 cols */}
                                                    <div className="col-span-2">
                                                        <Field label="Address" value={selectedUser.kycDetails?.address} />
                                                    </div>

                                                    <Field label="City" value={selectedUser.kycDetails?.city} />
                                                    <Field label="State" value={selectedUser.kycDetails?.state} />
                                                    <Field label="Pincode" value={selectedUser.kycDetails?.pincode} />
                                                </div>
                                            </DetailSection>
                                        </div>

                                        {selectedUser.kycDetails?.remarks && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <h4 className="text-sm font-bold text-yellow-800 mb-1">Admin Remarks</h4>
                                                <p className="text-gray-700 text-sm">{selectedUser.kycDetails.remarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {selectedUser.kycDetails?.status === 'pending' && (
                                        <div className="border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full z-20">
                                            {isRejecting ? (
                                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                                    <h4 className="font-semibold text-red-700 mb-2">Reject Application</h4>
                                                    <textarea
                                                        className="w-full border border-red-300 rounded p-2 text-sm focus:outline-none focus:border-red-500 mb-3"
                                                        placeholder="Reason for rejection..."
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                    />
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => setIsRejecting(false)} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                                                        <button onClick={() => handleReject(selectedUser._id)} disabled={isUpdating} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">Confirm Reject</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-4">
                                                    <button onClick={() => setIsRejecting(true)} className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium">
                                                        <XCircle size={18} /> Reject
                                                    </button>
                                                    <button onClick={() => handleApprove(selectedUser._id)} disabled={isUpdating} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm">
                                                        <CheckCircle size={18} /> Approve
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <FileText size={32} className="opacity-40" />
                                    </div>
                                    <p>Select a user to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );

}

// Helpers
function StatCard({ icon, count, label }) {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
            </div>
        </div>
    );
}

function DetailSection({ title, icon, children }) {
    return (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 avoid-break">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                {icon} <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Field({ label, value, icon, copyable }) {
    if (!value) return null;
    return (
        <div className="group">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                {icon} {label}
            </p>
            <p className="flex items-center gap-2 text-gray-800 font-medium print-break-all">
                {value}
                {copyable && (
                    <button onClick={() => navigator.clipboard.writeText(value)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-500 no-print">
                        <FileText size={12} />
                    </button>
                )}
            </p>
        </div>
    );
}

function PageBtn({ onClick, disabled, icon }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {icon}
        </button>
    );
}

function Badge({ status, size = 'normal' }) {
    const styles = {
        verified: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    const style = styles[status] || 'bg-gray-100 text-gray-600 border-gray-200';

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${style} ${size === 'large' ? 'px-4 py-1.5 text-sm' : ''}`}>
            {status}
        </span>
    );
}
