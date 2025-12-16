'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Phone,
    Mail,
    Eye,
    EyeOff,
    X,
    ChevronDown,
    MoreVertical,
    Edit,
    ArrowLeft,
    User,
} from 'lucide-react';
import AddAdminModal from "./AddAdminModal";
import { ADMIN_MODULES } from '../config/adminRoles';
import { useGetAllAdminsQuery, useAddAdminMutation } from '@/utils/slices/adminApiSlice';

const AdminManagement = () => {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetAllAdminsQuery();
    const adminData = data?.admins?.map((admin) => ({
        id: admin._id,
        name: admin.fullName,
        email: admin.email,
        modules: admin.modules,
        status: admin.status,
        date: admin.createdAt,
        isSuperAdmin: admin.isSuperAdmin,
        lastActivity: "Account created", // placeholder for now
    })) || [];
    const [addAdmin, { isLoading: isAddingAdmin }] = useAddAdminMutation();


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Date');
    const [successAlert, setSuccessAlert] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmDisableAdmin, setConfirmDisableAdmin] = useState(null);

    const router = useRouter();
    const openEditModal = (admin) => {
        setSelectedAdmin(admin);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedAdmin(null);
    };
    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    // Filter and sort data
    const filteredData = adminData.filter(admin => {
        const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.lastActivity.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || admin.modules.includes(roleFilter);
        return matchesSearch && matchesRole;
    }).sort((a, b) => {
        if (sortBy === 'Date') {
            return new Date(b.date) - new Date(a.date);
        }
        return a.name.localeCompare(b.name);
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Disabled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    // const handleRoleSubmit = () => {
    //     // Update the roles of the selected admin
    //     setAdminData((prevData) =>
    //         prevData.map((admin) =>
    //             admin.id === selectedAdmin.id
    //                 ? { ...admin, role: selectedAdmin.role }
    //                 : admin
    //         )
    //     );
    //     closeEditModal();
    // };

    // const toggleAdminStatus = (adminId) => {
    //     setAdminData((prev) =>
    //         prev.map((admin) =>
    //             admin.id === adminId
    //                 ? {
    //                     ...admin,
    //                     status: admin.status === 'Active' ? 'Disabled' : 'Active',
    //                 }
    //                 : admin
    //         )
    //     );
    // };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600">
                Loading admins...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                Failed to load admins
            </div>
        );
    }


    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Success Alert */}
                {successAlert && (
                    <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg transition-all duration-300">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            Admin created successfully!
                        </div>
                    </div>
                )}

                <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
                    {/* Header Section */}
                    {/* Header Section */}
                    <div className="relative mb-6">
                        {/* Back Button - LEFT */}
                        <button
                            onClick={() => router.push("/select-portal")}
                            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-gray-300"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        {/* CENTER TITLE */}
                        <div className="text-center px-12">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Admin Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage platform admins and view their recent activities.
                            </p>
                        </div>

                        {/* RIGHT BUTTONS */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-3">
                            <button
                                onClick={() => router.push("/add-admin/audit-logs")}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm font-medium"
                            >
                                Audit Logs
                            </button>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Add Admin
                            </button>
                        </div>
                    </div>


                    {/* Activity Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Search and Filter Bar */}
                        <div className="bg-blue-50 p-4 border-b border-blue-100">
                            <div className="flex flex-col lg:flex-row gap-3">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or activity..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Filter by Role */}
                                <div className="relative">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                                    >
                                        <option value="All">Filter by Role</option>
                                        {ADMIN_MODULES.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 w-[24%]">Admin Name</th>
                                        <th className="text-left py-4 px-3 font-semibold text-gray-700 w-[12%]">Role</th>
                                        <th className="text-left py-4 px-3 font-semibold text-gray-700 w-[16%]">Date & Time</th>
                                        <th className="text-left py-4 px-3 font-semibold text-gray-700 w-[10%]">Status</th>
                                        <th className="text-left py-4 px-3 font-semibold text-gray-700 w-[10%]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((admin) => (
                                            <tr
                                                key={admin.id}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-gradient-to-r bg-emerald-700 shrink-0 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                            {admin.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-gray-900 text-sm">{admin.name}</div>
                                                            <div className="text-xs text-gray-500 truncate">{admin.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3">
                                                    <div className="flex flex-col gap-1">
                                                        {admin.isSuperAdmin ? (
                                                            // Show SuperAdmin badge
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-800 border border-red-200">
                                                                SuperAdmin
                                                            </span>
                                                        ) : (
                                                            // Show modules for regular admins
                                                            Array.isArray(admin.modules) && admin.modules.length > 0 ? (
                                                                admin.modules.map((module, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${module.includes('Admin')
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-purple-100 text-purple-800'
                                                                            }`}
                                                                    >
                                                                        {module}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                    No modules
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3 text-gray-600 text-xs whitespace-nowrap">{formatDate(admin.date)}</td>
                                                <td className="py-4 px-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap inline-block ${getStatusColor(admin.status)}`}>
                                                        {admin.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            disabled={admin.status === 'Disabled'}
                                                            className={`p-1.5 rounded-lg transition-colors duration-200 ${admin.status === 'Disabled'
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-blue-600 hover:bg-blue-50'
                                                                }`}
                                                            onClick={() => openEditModal(admin)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setConfirmDisableAdmin(admin)}
                                                            className={`p-1.5 rounded-lg transition-colors duration-200 ${admin.status === 'Active'
                                                                ? 'text-red-600 hover:bg-red-50'
                                                                : 'text-green-600 hover:bg-green-50'
                                                                }`}
                                                            title={admin.status === 'Active' ? 'Disable Admin' : 'Enable Admin'}
                                                        >
                                                            <EyeOff className="w-4 h-4" />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-gray-500 text-sm">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <Search className="w-6 h-6 text-gray-400" />
                                                    <span>No results found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden">
                            {filteredData.length > 0 ? (
                                filteredData.map((admin) => (
                                    <div key={admin.id} className="p-6 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium shrink-0">
                                                    {admin.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-900">{admin.name}</div>
                                                    <div className="text-sm text-gray-500 truncate">{admin.email}</div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ${getStatusColor(admin.status)}`}>
                                                {admin.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                                {/* Check if admin.modules exists and is an array */}
                                                {Array.isArray(admin.modules) && admin.modules.length > 0 ? (
                                                    admin.modules.map((modules) => (
                                                        <span
                                                            key={modules}
                                                            className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {modules}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-500">No modules assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500 text-sm">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Search className="w-6 h-6 text-gray-400" />
                                        <span>No results found</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {isEditModalOpen && selectedAdmin && (
                            <div
                                className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4 sm:p-6"
                                onClick={closeEditModal}
                            >
                                <div
                                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scrollbar-none [&::-webkit-scrollbar]:hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <h2 className="text-xl font-semibold text-gray-900">Manage Roles for {selectedAdmin.name}</h2>
                                        <button
                                            onClick={closeEditModal}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-6">
                                        {/* Role Selection (Multi-option Dropdown) */}
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Select Roles
                                            </label>

                                            <div className="relative">
                                                <div className="space-y-2">
                                                    {ADMIN_ROLES.map((role) => (
                                                        <label
                                                            key={role}
                                                            className="flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedAdmin.modules.includes(role)}
                                                                onChange={() => {
                                                                    if (selectedAdmin.modules.includes(role)) {
                                                                        setSelectedAdmin({
                                                                            ...selectedAdmin,
                                                                            modules: selectedAdmin.modules.filter((r) => r !== role),
                                                                        });
                                                                    } else {
                                                                        setSelectedAdmin({
                                                                            ...selectedAdmin,
                                                                            role: [...selectedAdmin.modules, role],
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-blue-600 focus:ring-blue-500 rounded"
                                                            />
                                                            <span className="text-gray-800 text-sm">{role}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={closeEditModal}
                                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRoleSubmit}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Pagination */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {filteredData.length} of {adminData.length} admins
                                </div>
                                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium">
                                    Load More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <AddAdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={async (formData) => {
                    try {
                        await addAdmin({
                            fullName: formData.fullname,
                            email: formData.email,
                            password: formData.password,
                            mobileNo: formData.contact,
                            modules: formData.modules,
                            isSuperAdmin: formData.isSuperAdmin,
                        }).unwrap();

                        setSuccessAlert(true);
                        setTimeout(() => setSuccessAlert(false), 3000);
                        setIsModalOpen(false);
                    } catch (err) {
                        alert(err?.data?.message || "Failed to add admin");
                    }
                }}

            />
            {confirmDisableAdmin && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Disable Admin
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to disable{" "}
                            <span className="font-semibold">{confirmDisableAdmin.name}</span>?
                            They will lose access to the system.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDisableAdmin(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    toggleAdminStatus(confirmDisableAdmin.id);
                                    setConfirmDisableAdmin(null);
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                            >
                                Disable
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div >
    );
};

export default AdminManagement;