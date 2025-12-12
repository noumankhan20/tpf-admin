"use client"
import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, X, Filter, Menu, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Mock donation data
const mockDonations = [
    {
        id: 'TXN001234',
        fullName: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        mobile: '+91 98765 43210',
        city: 'Mumbai',
        state: 'Maharashtra',
        amount: 5000,
        date: '2024-12-10',
        purpose: 'Zakaat'
    },
    {
        id: 'TXN001235',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        mobile: '+91 98765 43211',
        city: 'Delhi',
        state: 'Delhi',
        amount: 10000,
        date: '2024-12-09',
        purpose: 'Emergency Funds'
    },
    {
        id: 'TXN001236',
        fullName: 'Amit Patel',
        email: 'amit.patel@email.com',
        mobile: '+91 98765 43212',
        city: 'Ahmedabad',
        state: 'Gujarat',
        amount: 2500,
        date: '2024-12-08',
        purpose: 'Masjid Building Initiative'
    },
    {
        id: 'TXN001237',
        fullName: 'Sneha Reddy',
        email: 'sneha.reddy@email.com',
        mobile: '+91 98765 43213',
        city: 'Hyderabad',
        state: 'Telangana',
        amount: 7500,
        date: '2024-12-07',
        purpose: 'Global Muslim Crisis'
    },
    {
        id: 'TXN001238',
        fullName: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        mobile: '+91 98765 43214',
        city: 'Jaipur',
        state: 'Rajasthan',
        amount: 3000,
        date: '2024-12-06',
        purpose: 'Zakaat'
    },
    {
        id: 'TXN001239',
        fullName: 'Anita Desai',
        email: 'anita.desai@email.com',
        mobile: '+91 98765 43215',
        city: 'Pune',
        state: 'Maharashtra',
        amount: 15000,
        date: '2024-12-05',
        purpose: 'Emergency Funds'
    },
    {
        id: 'TXN001240',
        fullName: 'Rahul Mehta',
        email: 'rahul.mehta@email.com',
        mobile: '+91 98765 43216',
        city: 'Bangalore',
        state: 'Karnataka',
        amount: 5500,
        date: '2024-12-04',
        purpose: 'Masjid Building Initiative'
    },
    {
        id: 'TXN001241',
        fullName: 'Kavita Joshi',
        email: 'kavita.joshi@email.com',
        mobile: '+91 98765 43217',
        city: 'Chennai',
        state: 'Tamil Nadu',
        amount: 4000,
        date: '2024-12-03',
        purpose: 'Global Muslim Crisis'
    },
    {
        id: 'TXN001242',
        fullName: 'Suresh Nair',
        email: 'suresh.nair@email.com',
        mobile: '+91 98765 43218',
        city: 'Kochi',
        state: 'Kerala',
        amount: 8000,
        date: '2024-12-02',
        purpose: 'Zakaat'
    },
    {
        id: 'TXN001243',
        fullName: 'Meera Gupta',
        email: 'meera.gupta@email.com',
        mobile: '+91 98765 43219',
        city: 'Kolkata',
        state: 'West Bengal',
        amount: 6000,
        date: '2024-12-01',
        purpose: 'Emergency Funds'
    },
    {
        id: 'TXN001244',
        fullName: 'Arun Kumar',
        email: 'arun.kumar@email.com',
        mobile: '+91 98765 43220',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        amount: 3500,
        date: '2024-11-30',
        purpose: 'Masjid Building Initiative'
    },
    {
        id: 'TXN001245',
        fullName: 'Divya Shah',
        email: 'divya.shah@email.com',
        mobile: '+91 98765 43221',
        city: 'Surat',
        state: 'Gujarat',
        amount: 12000,
        date: '2024-11-29',
        purpose: 'Global Muslim Crisis'
    }
];

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
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900">{donation.fullName}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900 break-all">{donation.email}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Mobile Number</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900">{donation.mobile}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Location</label>
                            <p className="mt-1 text-sm sm:text-base text-gray-900">{donation.city}, {donation.state}</p>
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Donation Amount</label>
                            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">₹{donation.amount.toLocaleString()}</p>
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
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 10;
    const router = useRouter();
    // Filter and sort donations
    const filteredAndSortedDonations = useMemo(() => {
        let filtered = mockDonations.filter(donation => {
            const query = searchQuery.toLowerCase();
            return (
                donation.fullName.toLowerCase().includes(query) ||
                donation.email.toLowerCase().includes(query) ||
                donation.mobile.toLowerCase().includes(query)
            );
        });

        filtered.sort((a, b) => {
            let aVal = sortField === 'date' ? new Date(a.date) : a.amount;
            let bVal = sortField === 'date' ? new Date(b.date) : b.amount;

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [searchQuery, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedDonations.length / itemsPerPage);
    const paginatedDonations = filteredAndSortedDonations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
        setShowFilters(false);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />;
        return sortOrder === 'asc' ?
            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> :
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />;
    };

     return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-8 relative">
                    {/* Back Button (left aligned) */}
                    <button
                        onClick={() => window.history.back()}
                        className="absolute left-0 top-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-90" />
                        <span className="hidden sm:inline">Back</span>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Donations</p>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-gray-900">{mockDonations.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Amount</p>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-emerald-600">
                            ₹{(mockDonations.reduce((sum, d) => sum + d.amount, 0) / 1000).toFixed(0)}k
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6 col-span-2 lg:col-span-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Top Purpose</p>
                        <p className="mt-1 sm:mt-2 text-base sm:text-xl font-bold text-emerald-600 truncate">
                            {
                                Object.entries(
                                    mockDonations.reduce((acc, d) => {
                                        acc[d.purpose] = (acc[d.purpose] || 0) + d.amount;
                                        return acc;
                                    }, {})
                                ).sort((a, b) => b[1] - a[1])[0][0]
                            }
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6 col-span-2 lg:col-span-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Average Donation</p>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-bold text-orange-500">
                            ₹{Math.round(
                                mockDonations.reduce((sum, d) => sum + d.amount, 0) / mockDonations.length
                            ).toLocaleString()}
                        </p>
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
                        </div>
                        
                        {/* Desktop Filters */}
                        <div className="hidden sm:flex gap-2">
                            <button
                                onClick={() => handleSort('date')}
                                className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm sm:text-base ${sortField === 'date'
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Date <SortIcon field="date" />
                            </button>
                            <button
                                onClick={() => handleSort('amount')}
                                className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm sm:text-base ${sortField === 'amount'
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Amount <SortIcon field="amount" />
                            </button>
                        </div>

                        {/* Mobile Filters Dropdown */}
                        {showFilters && (
                            <div className="sm:hidden flex flex-col gap-2 border-t border-gray-200 pt-3">
                                <button
                                    onClick={() => handleSort('date')}
                                    className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center justify-between text-sm ${sortField === 'date'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                        : 'border-gray-300 text-gray-700 active:bg-gray-50'
                                        }`}
                                >
                                    <span>Sort by Date</span>
                                    <SortIcon field="date" />
                                </button>
                                <button
                                    onClick={() => handleSort('amount')}
                                    className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center justify-between text-sm ${sortField === 'amount'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                        : 'border-gray-300 text-gray-700 active:bg-gray-50'
                                        }`}
                                >
                                    <span>Sort by Amount</span>
                                    <SortIcon field="amount" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Donor Information
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
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
                                {paginatedDonations.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-gray-900">{donation.fullName}</div>
                                                <div className="text-sm text-gray-500 font-mono">{donation.id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm text-gray-900">{donation.email}</div>
                                                <div className="text-sm text-gray-500">{donation.mobile}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{donation.city}</div>
                                            <div className="text-sm text-gray-500">{donation.state}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-emerald-600">
                                                ₹{donation.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(donation.date).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <PurposeBadge purpose={donation.purpose} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => setSelectedDonation(donation)}
                                                className="text-emerald-600 hover:text-emerald-900 transition-colors flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>

                {/* Mobile & Tablet Card View */}
                <div className="lg:hidden space-y-3 sm:space-y-4">
                    {paginatedDonations.map((donation) => (
                        <div key={donation.id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{donation.fullName}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{donation.id}</p>
                                </div>
                                <PurposeBadge purpose={donation.purpose} />
                            </div>

                            <div className="space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500 flex-shrink-0">Email:</span>
                                    <span className="text-gray-900 text-right break-all">{donation.email}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500 flex-shrink-0">Mobile:</span>
                                    <span className="text-gray-900">{donation.mobile}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500 flex-shrink-0">Location:</span>
                                    <span className="text-gray-900 text-right">{donation.city}, {donation.state}</span>
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
                                        {new Date(donation.date).toLocaleDateString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedDonation(donation)}
                                className="mt-4 w-full bg-emerald-500 text-white py-2.5 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                            >
                                <Eye className="w-4 h-4" />
                                View Details
                            </button>
                        </div>
                    ))}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>

                {/* Empty State */}
                {filteredAndSortedDonations.length === 0 && (
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
        </div>
    );
}