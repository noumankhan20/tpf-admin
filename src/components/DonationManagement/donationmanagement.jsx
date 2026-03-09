"use client"
import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Eye, X, Filter, Menu, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FilterModal from '../lib/filters';
import { useGetDonationsQuery, useGetPendingCountQuery } from '@/utils/slices/donationApiSlice';

// Purpose Badge Component
const PurposeBadge = ({ purpose }) => {
    if (!purpose) return null;

    return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            {purpose}
        </span>
    );
};

// Search Bar Component
const SearchBar = ({ value, onChange }) => {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
        </div>
    );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-700 flex items-center">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronDown className="h-5 w-5 rotate-90" />
                        </button>
                        {getPageNumbers().map((page, idx) => (
                            page === '...' ? (
                                <span key={`dots-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                                        ? 'z-10 bg-emerald-500 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronDown className="h-5 w-5 -rotate-90" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

// Donation Details Modal
const DonationDetailsModal = ({ donation, onClose }) => {
    if (!donation) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-none"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Donation Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 active:bg-gray-200"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Transaction ID</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900 font-mono break-all">{donation.id}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900 break-all">{donation.email}</p>
                        </div><div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900 break-all">{donation.fullName}</p>
                        </div><div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Mobile No</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900 break-all">{donation.mobile}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Donation Amount</label>
                            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">₹{donation.amount.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">
                                Tip Amount
                            </label>
                            <p className="mt-1 text-lg sm:text-xl font-semibold text-blue-600">
                                ₹{(donation.tipAmount || 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Location</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900 break-all">{donation.kycStatus}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Donation Date</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900">{new Date(donation.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Purpose</label>
                            <p className="mt-1">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-emerald-100 text-emerald-800">
                                    {donation.purpose}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Campaign Name</label>
                            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">{donation.campaignName}</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Donation Management Component
export default function DonationManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    // What user is editing in the modal
    const [draftFilters, setDraftFilters] = useState({
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        donationType: '',
    });

    // What is actually applied to API
    const [appliedFilters, setAppliedFilters] = useState({
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
    });
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const router = useRouter();

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // Build query params for API
    const queryParams = useMemo(() => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
        };
        if (debouncedSearch && debouncedSearch.length >= 2) {
            params.search = debouncedSearch;
        }
        if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
        if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
        if (appliedFilters.minAmount) params.minAmount = appliedFilters.minAmount;
        if (appliedFilters.maxAmount) params.maxAmount = appliedFilters.maxAmount;
        if (appliedFilters.donationType) {
            params.donationType = appliedFilters.donationType;
        }
        return params;
    }, [currentPage, debouncedSearch, appliedFilters, itemsPerPage]);


    // Fetch donations using RTK Query
    const { data, error, isLoading, isFetching } = useGetDonationsQuery(queryParams);
    const {
        data: pendingCountData,
        isLoading: isPendingCountLoading,
        isError: isPendingCountError,
    } = useGetPendingCountQuery();
    const pendingCount = pendingCountData?.count ?? 0;


    // Reset to page 1 when filters or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, appliedFilters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchQuery]);
    const totalApprovedOfflineAmount = data?.totalApprovedOfflineAmount || 0;
    const totalApprovedOfflineDonations = data?.totalApprovedOfflineDonations || 0;
    const pendingOfflineDonations = data?.pendingOfflineDonations || 0;
    // Extract donations and pagination from API response
    const donations = data?.donations || [];
    const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalDonations: 0 };
    const totalAmount = data?.totalAmount || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-8 relative">
                    {/* Back Button (left aligned) */}
                    <button
                        onClick={() => router.push('/select-portal?category=monitoring')}
                        className="absolute left-0 top-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-90" />
                        <span className="hidden sm:inline cursor-pointer">Back</span>
                    </button>

                    {/* Centered Heading */}
                    <div className="text-center px-12 sm:px-16">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            Donation Management
                        </h1>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-600">
                            View and manage all donation transactions
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    {/* Total Donations */}
                    <div className="relative bg-white rounded-2xl p-5 overflow-hidden group"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(16,185,129,0.08)' }}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-6 translate-x-6"
                            style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Donations</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 tabular-nums">
                            {isLoading ? (
                                <span className="inline-block w-16 h-8 bg-gray-100 rounded-lg animate-pulse" />
                            ) : pagination.totalDonations}
                        </p>
                        <div className="mt-3 h-0.5 w-8 rounded-full bg-emerald-400" />
                    </div>

                    {/* Online Donation Amount */}
                    <div className="relative rounded-2xl p-5 overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)',
                            boxShadow: '0 4px 20px rgba(16,185,129,0.35)'
                        }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
                            style={{ background: 'white' }} />
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Online Amount</p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                            {isLoading ? (
                                <span className="inline-block w-24 h-8 bg-white/20 rounded-lg animate-pulse" />
                            ) : `₹${totalAmount.toLocaleString('en-IN')}`}
                        </p>
                        <div className="mt-3 h-0.5 w-8 rounded-full bg-white/40" />
                    </div>

                    {/* Offline Donations */}
                    <div
                        onClick={() => router.push('/donation-management/offline-donation')}
                        className="relative bg-white rounded-2xl p-5 overflow-hidden cursor-pointer col-span-2 lg:col-span-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(16,185,129,0.08)' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(16,185,129,0.08)'}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-8 translate-x-8"
                            style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Offline Donations</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-100">
                                    {isLoading ? '…' : `${pendingOfflineDonations} pending`}
                                </span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-emerald-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium mb-1">Approved</p>
                                <p className="text-xl font-bold text-emerald-600 tabular-nums">
                                    {isLoading ? <span className="inline-block w-10 h-6 bg-emerald-100 rounded animate-pulse" /> : totalApprovedOfflineDonations}
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-medium mb-1">Pending</p>
                                <p className="text-xl font-bold text-red-500 tabular-nums">
                                    {isLoading ? <span className="inline-block w-10 h-6 bg-red-100 rounded animate-pulse" /> : pendingOfflineDonations}
                                </p>
                            </div>
                        </div>

                        {/* Amount Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-400">Approved Amount</p>
                            <p className="text-lg font-bold text-gray-800 tabular-nums">
                                {isLoading ? <span className="inline-block w-20 h-5 bg-gray-100 rounded animate-pulse" /> : `₹${totalApprovedOfflineAmount.toLocaleString("en-IN")}`}
                            </p>
                        </div>

                        {/* Arrow hint */}
                        <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                </div>
                <div className="flex justify-between items-center mb-3 px-4">
                    <p className="text-sm text-gray-600">
                        Showing {donations.length} of {pagination.totalDonations}
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>

                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="sm:hidden px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowFilterModal(true)}
                                className="px-3 py-2 rounded-lg cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                        <p className="text-gray-500 text-base sm:text-lg">Loading donations...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                        <p className="text-red-500 text-base sm:text-lg">Error loading donations. Please try again.</p>
                    </div>
                )}

                {/* Desktop Table View */}
                {!isLoading && !error && (
                    <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Purpose
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {donations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-gray-900">{donation.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{donation.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-emerald-600">
                                                    ₹{donation.amount.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{donation.kycStatus}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(donation.date).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <PurposeBadge purpose={donation.purpose} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => setSelectedDonation(donation)}
                                                    className="text-emerald-600 hover:text-emerald-900 cursor-pointer transition-colors flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4 cursor-pointer" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* Mobile & Tablet Card View */}
                {!isLoading && !error && (
                    <div className="lg:hidden space-y-3 sm:space-y-4">
                        {donations.map((donation) => (
                            <div key={donation.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 mr-2">
                                        <p className="text-xs text-gray-500 font-mono mt-1">{donation.id}</p>
                                    </div>
                                    <PurposeBadge purpose={donation.purpose} />
                                </div>

                                <div className="space-y-2 text-xs sm:text-sm">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-gray-500 flex-shrink-0">Email:</span>
                                        <span className="text-gray-900 text-right break-all">{donation.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-gray-500">Amount:</span>
                                        <span className="text-lg sm:text-xl font-bold text-emerald-600">
                                            ₹{donation.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-gray-500">Date:</span>
                                        <span className="text-gray-900">
                                            {new Date(donation.date).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedDonation(donation)}
                                    className="mt-4 w-full bg-emerald-500 text-white py-2.5 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                                >
                                    <Eye className="w-4 h-4 cursor-pointer" />
                                    View Details
                                </button>
                            </div>
                        ))}

                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && donations.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                        <p className="text-gray-500 text-base sm:text-lg">No donations found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Donation Details Modal */}
            {selectedDonation && (
                <DonationDetailsModal
                    donation={selectedDonation}
                    onClose={() => setSelectedDonation(null)}
                />
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <FilterModal
                    filters={draftFilters}
                    setFilters={setDraftFilters}
                    onApply={() => {
                        setAppliedFilters(draftFilters); // 🔥 THIS is the key
                        setCurrentPage(1);
                        setShowFilterModal(false);
                    }}
                    onClose={() => setShowFilterModal(false)}
                />
            )}
        </div>
    );
}