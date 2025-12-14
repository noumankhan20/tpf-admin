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
} from 'lucide-react';

// Sample volunteer data
const volunteersData = [
    {
        id: 1,
        fullName: "Sarah Williams",
        email: "sarah.williams@email.com",
        mobile: "+1 234 567 8901",
        address: "123 Main St, New York, NY 10001",
        status: "active",
        joinDate: "2024-01-15",
        vouchers: [
            { id: 1, amount: 150, description: "Transportation costs", date: "2024-12-01", status: "pending" },
            { id: 2, amount: 75, description: "Event supplies", date: "2024-11-15", status: "approved" }
        ]
    },
    {
        id: 2,
        fullName: "Michael Chen",
        email: "michael.chen@email.com",
        mobile: "+1 234 567 8902",
        address: "456 Oak Ave, Los Angeles, CA 90001",
        status: "active",
        joinDate: "2024-02-20",
        vouchers: [
            { id: 3, amount: 200, description: "Medical supplies", date: "2024-12-05", status: "pending" },
            { id: 4, amount: 120, description: "Food expenses", date: "2024-11-20", status: "completed" }
        ]
    },
    {
        id: 3,
        fullName: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        mobile: "+1 234 567 8903",
        address: "789 Pine Rd, Chicago, IL 60601",
        status: "inactive",
        joinDate: "2024-03-10",
        vouchers: [
            { id: 5, amount: 90, description: "Training materials", date: "2024-10-10", status: "rejected" }
        ]
    },
    {
        id: 4,
        fullName: "James Anderson",
        email: "james.anderson@email.com",
        mobile: "+1 234 567 8904",
        address: "321 Elm St, Houston, TX 77001",
        status: "active",
        joinDate: "2024-01-05",
        vouchers: [
            { id: 6, amount: 180, description: "Event coordination", date: "2024-12-08", status: "approved" },
            { id: 7, amount: 95, description: "Office supplies", date: "2024-11-25", status: "completed" }
        ]
    },
    {
        id: 5,
        fullName: "Olivia Martinez",
        email: "olivia.martinez@email.com",
        mobile: "+1 234 567 8905",
        address: "555 Cedar Ln, Miami, FL 33101",
        status: "active",
        joinDate: "2024-04-12",
        vouchers: [
            { id: 8, amount: 125, description: "Community outreach", date: "2024-12-10", status: "pending" }
        ]
    },
    {
        id: 6,
        fullName: "Daniel Kim",
        email: "daniel.kim@email.com",
        mobile: "+1 234 567 8906",
        address: "777 Maple Dr, Seattle, WA 98101",
        status: "active",
        joinDate: "2024-05-18",
        vouchers: [
            { id: 9, amount: 160, description: "Workshop materials", date: "2024-11-28", status: "completed" }
        ]
    }
];

export default function VolunteerModule() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [voucherFilter, setVoucherFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const itemsPerPage = 10;

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

    // Calculate statistics
    const totalVolunteers = volunteersData.length;
    const activeVolunteers = volunteersData.filter(v => v.status === "active").length;
    const allVouchers = volunteersData.flatMap(v => v.vouchers);
    const pendingVouchers = allVouchers.filter(v => v.status === "pending").length;

    // Filter volunteers
    const filteredVolunteers = volunteersData.filter(volunteer => {
        const matchesSearch =
            volunteer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            volunteer.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || volunteer.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVolunteers = filteredVolunteers.slice(startIndex, startIndex + itemsPerPage);

    const handleBackClick = () => {
        if (selectedVolunteer) {
            setSelectedVolunteer(null);
            setSelectedVoucher(null);
        } else {
            window.location.href = '/tpf-management';
        }
    };

    const handleVoucherAction = (voucherId, action) => {
        console.log(`Voucher ${voucherId} - Action: ${action}`);
        alert(`Voucher ${action} successfully!`);
        setShowVoucherModal(false);
    };

    const closeModal = () => {
        setShowVoucherModal(false);
        setSelectedVoucher(null);
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800"
        };
        return (
            <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getVoucherStatusBadge = (status) => {
        const styles = {
            pending: { bg: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
            approved: { bg: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-3 h-3" /> },
            completed: { bg: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
            rejected: { bg: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> }
        };
        const style = styles[status];
        return (
            <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${style.bg}`}>
                {style.icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Voucher Modal
    const VoucherModal = ({ voucher, onClose }) => (
        <>
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
                onClick={onClose}
            >
                <div 
                    className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold">Reimbursement Voucher Details</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Voucher ID</p>
                                <p className="font-semibold">#{voucher.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Amount</p>
                                <p className="font-semibold text-green-600">₹{voucher.amount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-semibold">{voucher.date}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                {getVoucherStatusBadge(voucher.status)}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Description</p>
                            <p className="font-medium">{voucher.description}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Volunteer Information</p>
                            <p className="font-medium">{selectedVolunteer.fullName}</p>
                            <p className="text-sm text-gray-600">{selectedVolunteer.email}</p>
                        </div>

                        {voucher.status === "pending" && (
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={() => handleVoucherAction(voucher.id, "approved")}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Approve Voucher
                                </button>
                                <button
                                    onClick={() => handleVoucherAction(voucher.id, "rejected")}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject Voucher
                                </button>
                            </div>
                        )}

                        {voucher.status === "approved" && (
                            <button
                                onClick={() => handleVoucherAction(voucher.id, "completed")}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Mark as Completed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    // Volunteer Detail View
    if (selectedVolunteer) {
        const filteredVouchers = selectedVolunteer.vouchers.filter(
            voucher => voucherFilter === "all" || voucher.status === voucherFilter
        );

        return (
            <>
                <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                    <div className={`max-w-7xl mx-auto transition-all duration-300 ${showVoucherModal ? 'blur-sm' : ''}`}>
                        <div className="mb-4 sm:mb-6 text-center">
                            <button
                                onClick={handleBackClick}
                                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                <span className="text-sm sm:text-base">Back to Volunteers</span>
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteer Profile</h1>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                        {selectedVolunteer.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-semibold mb-1">{selectedVolunteer.fullName}</h2>
                                        {getStatusBadge(selectedVolunteer.status)}
                                        <p className="text-xs sm:text-sm text-gray-600 mt-2">
                                            Member since {new Date(selectedVolunteer.joinDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-600">Email</p>
                                        <p className="text-xs sm:text-sm font-medium break-all">{selectedVolunteer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-600">Mobile</p>
                                        <p className="text-xs sm:text-sm font-medium">{selectedVolunteer.mobile}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-1">
                                    <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-600">Address</p>
                                        <p className="text-xs sm:text-sm font-medium">{selectedVolunteer.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                                <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                                    <button className="flex items-center justify-center mx-auto gap-2 px-3 sm:px-4 py-2 border border-red-300 rounded-lg bg-red-500 hover:bg-red-700 text-white w-full transition-colors text-xs sm:text-sm">
                                        <Trash className="w-4 h-4" />
                                        <span className="hidden sm:inline">Disable Volunteer</span>
                                        <span className="sm:hidden">Disable</span>
                                    </button>
                                </div>
                                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                                    <p className="text-xs sm:text-sm text-gray-600">Total Vouchers</p>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">{selectedVolunteer.vouchers.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Vouchers Section */}
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold">Reimbursement Vouchers</h2>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <select
                                        value={voucherFilter}
                                        onChange={(e) => setVoucherFilter(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block md:hidden space-y-4">
                                {filteredVouchers.map(voucher => (
                                    <div key={voucher.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Voucher #{voucher.id}</p>
                                                <p className="text-lg font-semibold text-green-600">₹{voucher.amount}</p>
                                            </div>
                                            {getVoucherStatusBadge(voucher.status)}
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{voucher.description}</p>
                                        <p className="text-xs text-gray-500 mb-3">{voucher.date}</p>
                                        <button
                                            onClick={() => {
                                                setSelectedVoucher(voucher);
                                                setShowVoucherModal(true);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredVouchers.map(voucher => (
                                            <tr key={voucher.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">#{voucher.id}</td>
                                                <td className="px-4 py-3 text-sm">{voucher.description}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                                    ₹{voucher.amount}
                                                </td>
                                                <td className="px-4 py-3 text-sm">{voucher.date}</td>
                                                <td className="px-4 py-3 text-sm">{getVoucherStatusBadge(voucher.status)}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedVoucher(voucher);
                                                            setShowVoucherModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredVouchers.length === 0 && (
                                <div className="text-center py-8 text-sm text-gray-500">
                                    No vouchers found with the selected filter.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showVoucherModal && selectedVoucher && (
                    <VoucherModal
                        voucher={selectedVoucher}
                        onClose={closeModal}
                    />
                )}
            </>
        );
    }

    // Main Volunteers List View
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto text-center">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="text-sm sm:text-base">Back to TPF Management</span>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteer Management</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Manage volunteer profiles, track activities, and process reimbursement vouchers.
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Total Volunteers</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalVolunteers}</p>
                            </div>
                            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Active Volunteers</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeVolunteers}</p>
                            </div>
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Pending Vouchers</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{pendingVouchers}</p>
                            </div>
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Volunteers Table - Same for ALL screen sizes */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">Volunteers List</h2>

                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700">Volunteer</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 hidden md:table-cell">Email</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 hidden lg:table-cell">Mobile</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700">Vouchers</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 hidden sm:table-cell">Status</th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedVolunteers.map(volunteer => (
                                        <tr key={volunteer.id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-4 py-3">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                                                        {volunteer.fullName.charAt(0)}
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                                                        {volunteer.fullName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                                                <div className="truncate max-w-[180px]">{volunteer.email}</div>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 hidden lg:table-cell whitespace-nowrap">
                                                {volunteer.mobile}
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{volunteer.vouchers.length}</span>
                                                <span className="text-gray-400"> / </span>
                                                <span className="text-orange-600">{volunteer.vouchers.filter(v => v.status === "pending").length}</span>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">
                                                {getStatusBadge(volunteer.status)}
                                            </td>
                                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedVolunteer(volunteer)}
                                                    className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm cursor-pointer"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredVolunteers.length)} of {filteredVolunteers.length} volunteers
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm">
                                    <span className="text-gray-700 font-medium">{currentPage}</span>
                                    <span className="text-gray-500 mx-1">/</span>
                                    <span className="text-gray-500">{totalPages}</span>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}