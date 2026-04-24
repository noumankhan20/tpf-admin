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
    CheckCircle2,
    AlertCircle,
    Shield,
    Users,
    Activity,
    Trash2,
} from 'lucide-react';
import AddAdminModal from "./AddAdminModal";
import ConfirmModal from "../Common/ConfirmModal";
import { MODULES } from '../config/modules';
import { toast } from 'react-toastify';
import { useGetAllAdminsQuery, useAddAdminMutation, useDisableAdminMutation, useEnableAdminMutation, useEditAdminMutation, useDeleteAdminMutation } from '@/utils/slices/adminApiSlice';

// Helper: resolve a module ID to its display name
const getModuleName = (id) => {
    return MODULES.find((m) => m.id === id)?.name || id;
};

const AdminManagement = () => {
    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetAllAdminsQuery();
    const adminData = data?.admins?.map((admin) => ({
        id: admin._id,
        name: admin.fullName,
        email: admin.email,
        mobileNo: admin.mobileNo,
        modules: admin.modules,
        status: admin.status,
        date: admin.createdAt,
        isSuperAdmin: admin.isSuperAdmin,
        lastActivity: "Account created",
        department: admin.department || "",
        position: admin.position || "",
        role: admin.role || "Admin",
    })) || [];
    const [addAdmin, { isLoading: isAddingAdmin }] = useAddAdminMutation();
    const [disableAdmin, { isLoading: isDisablingAdmin }] = useDisableAdminMutation();
    const [enableAdmin, { isLoading: isEnabingAdmin }] = useEnableAdminMutation();
    const [editAdmin, { isLoading: isEditingAdmin }] = useEditAdminMutation();
    const [deleteAdmin, { isLoading: isDeletingAdmin }] = useDeleteAdminMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Date');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmDisableAdmin, setConfirmDisableAdmin] = useState(null);
    const [confirmDeleteAdmin, setConfirmDeleteAdmin] = useState(null);

    const router = useRouter();

    const openEditModal = (admin) => {
        console.log("Admin:", admin);
        setSelectedAdmin({
            ...admin,
            department: admin.department || "",
            position: admin.position || "",
            mobileNo: admin.mobileNo || '',
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedAdmin(null);
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    const filteredData = adminData.filter(admin => {
        const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.lastActivity.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || admin.role === roleFilter || admin.modules.includes(roleFilter);
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
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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

    const handleDisableAdmin = async (adminId) => {
        const admin = adminData.find((admin) => admin.id === adminId);
        if (admin && admin.status === 'Disabled') {
            toast.error('This admin is already disabled.');
            return;
        }

        try {
            await disableAdmin({ id: adminId }).unwrap();
            setConfirmDisableAdmin(null);
            refetch();
            toast.success(`${admin.name} has been disabled successfully.`);
        } catch (error) {
            console.error('Error disabling admin:', error);
            toast.error('Failed to disable admin. Please try again.');
        }
    };

    const handleEnableAdmin = async (adminId) => {
        const admin = adminData.find((admin) => admin.id === adminId);
        if (admin && admin.status === 'Active') {
            toast.error('This admin is already active.');
            return;
        }

        try {
            await enableAdmin({ id: adminId }).unwrap();
            refetch();
            toast.success(`${admin.name} has been enabled successfully.`);
        } catch (error) {
            console.error('Error enabling admin:', error);
            toast.error('Failed to enable admin. Please try again.');
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedAdmin) return;
        console.log("Selected Admin ID:", selectedAdmin?.id);
        console.log("Data to send:", {
            email: selectedAdmin?.email,
            mobileNo: selectedAdmin?.mobileNo,
            fullName: selectedAdmin?.name,
            modules: selectedAdmin?.modules,
            isSuperAdmin: selectedAdmin?.isSuperAdmin,
            department: selectedAdmin?.department,
            position: selectedAdmin?.position,
            role: selectedAdmin?.role,
        });

        const updatedAdminData = {
            email: selectedAdmin.email,
            mobileNo: selectedAdmin.mobileNo || '',
            fullName: selectedAdmin.name,
            modules: selectedAdmin.modules || [],
            isSuperAdmin: selectedAdmin.isSuperAdmin || false,
            department: selectedAdmin.department || '',
            position: selectedAdmin.position || '',
            role: selectedAdmin.role || 'Admin',
        };

        try {
            await editAdmin({
                id: selectedAdmin.id,
                data: updatedAdminData
            }).unwrap();
            refetch();
            toast.success('Admin updated successfully!');
            closeEditModal();
        } catch (error) {
            console.error('Edit Admin Error:', error);
            toast.error(error?.data?.message || 'Failed to update admin.');
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        try {
            await deleteAdmin(adminId).unwrap();
            toast.success("Admin deleted successfully");
            refetch();
        } catch (error) {
            toast.error(
                error?.data?.message || "Failed to delete admin",
                "error"
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <Users className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading admins...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Admins</h3>
                    <p className="text-gray-600 mb-6">There was an error loading the admin data. Please try again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden">

                <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
                    {/* Header Section */}
                    <div className="mb-6">
                        {/* Mobile Layout */}
                        <div className="lg:hidden space-y-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => router.push('/select-portal?category=administration')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push("/add-admin/auditlogs")}
                                        className="bg-emerald-700 hover:bg-emerald-900 text-white p-2 rounded-xl shadow-md transition-all"
                                        title="Audit Logs"
                                    >
                                        <Activity className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-emerald-700 hover:bg-emerald-900 text-white p-2 rounded-xl shadow-md transition-all"
                                        title="Add Admin"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Admin Management
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage platform admins and activities
                                </p>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:block relative">
                            <button
                                onClick={() => router.push('/select-portal?category=administration')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>

                            <div className="text-center px-32">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Admin Management
                                    </h1>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Manage platform admins and view their recent activities
                                </p>
                            </div>

                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-3">
                                <button
                                    onClick={() => router.push("/add-admin/auditlogs")}
                                    className="bg-emerald-700 hover:bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm font-medium"
                                >
                                    <Activity className="w-5 h-5" />
                                    Audit Logs
                                </button>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-emerald-700 hover:bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Admin
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Search and Filter Bar */}
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search admins..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="appearance-none w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 cursor-pointer text-sm"
                                    >
                                        <option value="All">All Roles</option>
                                        <option value="SuperAdmin">Super Admin</option>
                                        <option value="CA">Chartered Accountant</option>
                                        <optgroup label="Modules">
                                            {MODULES.map((module) => (
                                                <option key={module.id} value={module.id}>
                                                    {module.name}
                                                </option>
                                            ))}
                                        </optgroup>
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
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Admin Name</th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Role</th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Date & Time</th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Status</th>
                                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((admin) => (
                                            <tr
                                                key={admin.id}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-emerald-700 shrink-0 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                                            {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-gray-900 text-sm">{admin.name}</div>
                                                            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                                <Mail className="w-3 h-3" />
                                                                {admin.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        {admin.role === "SuperAdmin" || admin.isSuperAdmin ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm">
                                                                <Shield className="w-3 h-3" />
                                                                SuperAdmin
                                                            </span>
                                                        ) : admin.role === "CA" ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm">
                                                                <User className="w-3 h-3" />
                                                                CA (Chartered Accountant)
                                                            </span>
                                                        ) : (
                                                            Array.isArray(admin.modules) && admin.modules.length > 0 ? (
                                                                admin.modules.slice(0, 2).map((moduleId, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-blue-100 text-blue-800 border border-blue-200"
                                                                    >
                                                                        {getModuleName(moduleId)}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                    No modules
                                                                </span>
                                                            )
                                                        )}
                                                        {!admin.isSuperAdmin && admin.modules.length > 2 && (
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                +{admin.modules.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(admin.date)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(admin.status)}`}>
                                                        {admin.status === 'Active' ? (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        ) : (
                                                            <X className="w-3 h-3" />
                                                        )}
                                                        {admin.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            disabled={admin.status === 'Disabled'}
                                                            className={`p-2 rounded-lg transition-all duration-200 ${admin.status === 'Disabled'
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-blue-600 hover:bg-blue-50 hover:scale-110'
                                                                }`}
                                                            onClick={() => openEditModal(admin)}
                                                            title="Edit Admin"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setConfirmDisableAdmin(admin)}
                                                            disabled={admin.status === 'Disabled' || isDisablingAdmin}
                                                            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${admin.status === 'Active'
                                                                ? 'text-red-600 hover:bg-red-50 hover:scale-110'
                                                                : 'text-gray-300 cursor-not-allowed'}`}
                                                            title={admin.status === 'Active' ? 'Disable Admin' : 'Already disabled'}
                                                        >
                                                            <EyeOff className="w-4 h-4" />
                                                        </button>

                                                        {admin.status === 'Disabled' && (
                                                            <button
                                                                onClick={() => handleEnableAdmin(admin.id)}
                                                                disabled={isEnabingAdmin}
                                                                className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${isEnabingAdmin
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-green-600 hover:bg-green-50 hover:scale-110'}`}
                                                                title="Enable Admin"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => setConfirmDeleteAdmin(admin)}
                                                            disabled={isDeletingAdmin}
                                                            className="p-2 rounded-lg transition-all cursor-pointer duration-200 text-red-700 hover:bg-red-100 hover:scale-110"
                                                            title="Delete Admin"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-16 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Search className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No admins found</p>
                                                    <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
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
                                    <div key={admin.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0">
                                                {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 text-sm mb-1">{admin.name}</div>
                                                <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {admin.email}
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${getStatusColor(admin.status)}`}>
                                                {admin.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(admin.date)}
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {admin.role === "SuperAdmin" || admin.isSuperAdmin ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                                                        <Shield className="w-3 h-3" />
                                                        SuperAdmin
                                                    </span>
                                                ) : admin.role === "CA" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                                                        <User className="w-3 h-3" />
                                                        CA
                                                    </span>
                                                ) : (
                                                    Array.isArray(admin.modules) && admin.modules.length > 0 ? (
                                                        <>
                                                            {admin.modules.slice(0, 2).map((moduleId, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                                                >
                                                                    {getModuleName(moduleId)}
                                                                </span>
                                                            ))}
                                                            {admin.modules.length > 2 && (
                                                                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                                    +{admin.modules.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                            No modules
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                            <button
                                                disabled={admin.status === 'Disabled'}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${admin.status === 'Disabled'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium'
                                                    }`}
                                                onClick={() => openEditModal(admin)}
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span className="text-sm">Edit</span>
                                            </button>

                                            <button
                                                onClick={() => setConfirmDisableAdmin(admin)}
                                                disabled={admin.status === 'Disabled'}
                                                className={`flex-1 flex items-center cursor-pointer justify-center gap-2 py-2.5 rounded-lg transition-all ${admin.status === 'Active'
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 font-medium'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                <EyeOff className="w-4 h-4" />
                                                <span className="text-sm">Disable</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No admins found</p>
                                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Edit Modal */}
                        {isEditModalOpen && selectedAdmin && (
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                                onClick={closeEditModal}
                            >
                                <div
                                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Manage Admin</h2>
                                            <p className="text-sm text-gray-500 mt-0.5">{selectedAdmin.name}</p>
                                        </div>
                                        <button
                                            onClick={closeEditModal}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Name</label>
                                            <input
                                                type="text"
                                                value={selectedAdmin.name}
                                                onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                                            <input
                                                type="email"
                                                value={selectedAdmin.email}
                                                onChange={(e) => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                                            <input
                                                type="text"
                                                value={selectedAdmin.mobileNo || ''}
                                                onChange={(e) => setSelectedAdmin({ ...selectedAdmin, mobileNo: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Department</label>
                                            <input
                                                type="text"
                                                value={selectedAdmin.department}
                                                onChange={(e) => setSelectedAdmin({ ...selectedAdmin, department: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="e.g. IT, HR, Operations"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Position</label>
                                            <input
                                                type="text"
                                                value={selectedAdmin.position}
                                                onChange={(e) => setSelectedAdmin({ ...selectedAdmin, position: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="e.g. Manager, Executive"
                                            />
                                        </div>

                                        {/* SuperAdmin Toggle */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700">Admin Type</label>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        SuperAdmins have full access to all modules
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAdmin({
                                                        ...selectedAdmin,
                                                        isSuperAdmin: !selectedAdmin.isSuperAdmin
                                                    })}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedAdmin.isSuperAdmin ? 'bg-purple-600' : 'bg-gray-300'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedAdmin.isSuperAdmin ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>

                                            {selectedAdmin.isSuperAdmin && (
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-purple-600" />
                                                        <span className="text-sm font-medium text-purple-800">
                                                            This admin will have full access to all system modules
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Modules Selection - only when not SuperAdmin */}
                                        {!selectedAdmin.isSuperAdmin && (
                                            <>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Select Modules
                                                </label>

                                                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto p-1">
                                                    {MODULES.map((module) => {
                                                        const isSelected = selectedAdmin.modules.includes(module.id);
                                                        return (
                                                            <label
                                                                key={module.id}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                                    isSelected
                                                                        ? 'border-emerald-300 bg-emerald-50'
                                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {
                                                                        if (isSelected) {
                                                                            setSelectedAdmin({
                                                                                ...selectedAdmin,
                                                                                modules: selectedAdmin.modules.filter((m) => m !== module.id),
                                                                            });
                                                                        } else {
                                                                            setSelectedAdmin({
                                                                                ...selectedAdmin,
                                                                                modules: [...selectedAdmin.modules, module.id],
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                                                />
                                                                <span className={`text-sm flex-1 ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                                                    {module.name}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>

                                                {selectedAdmin.modules.length > 0 && (
                                                    <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                        <span className="font-semibold">{selectedAdmin.modules.length}</span> module{selectedAdmin.modules.length !== 1 ? 's' : ''} selected
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {selectedAdmin.isSuperAdmin && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shrink-0">
                                                        <Shield className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">SuperAdmin Access</p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            When SuperAdmin is enabled, this admin will automatically have access to all modules and system functions.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="sticky bottom-0 bg-white p-6 pt-4 border-t border-gray-200">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={closeEditModal}
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveChanges}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium shadow-lg hover:shadow-xl"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-sm text-gray-600 text-center sm:text-left">
                                    Showing <span className="font-semibold text-gray-900">{filteredData.length}</span> of <span className="font-semibold text-gray-900">{adminData.length}</span> admins
                                </div>
                                {filteredData.length < adminData.length && (
                                    <button className="w-full sm:w-auto px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 shadow-sm">
                                        Load More
                                    </button>
                                )}
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
                            fullName: formData.fullName,
                            email: formData.email,
                            password: formData.password,
                            mobileNo: formData.mobileNo,
                            modules: formData.modules,
                            isSuperAdmin: formData.isSuperAdmin,
                            department: formData.department,
                            position: formData.position,
                            role: formData.role,
                        }).unwrap();

                        toast.success(`Admin ${formData.fullName} created successfully!`);
                        setIsModalOpen(false);
                    } catch (err) {
                        toast.error(err?.data?.message || "Failed to add admin. Please try again.");
                    }
                }}
            />

            <ConfirmModal
                isOpen={!!confirmDisableAdmin}
                onClose={() => setConfirmDisableAdmin(null)}
                onConfirm={() => handleDisableAdmin(confirmDisableAdmin.id)}
                title="Disable Admin Access"
                message={`Are you sure you want to disable ${confirmDisableAdmin?.name}? They will lose access to the system immediately.`}
                confirmText={isDisablingAdmin ? "Disabling..." : "Disable Admin"}
                type="danger"
            />

            <ConfirmModal
                isOpen={!!confirmDeleteAdmin}
                onClose={() => setConfirmDeleteAdmin(null)}
                onConfirm={() => handleDeleteAdmin(confirmDeleteAdmin.id)}
                title="Delete Admin Permanently"
                message={`Are you sure you want to delete ${confirmDeleteAdmin?.name}? This action cannot be undone.`}
                confirmText={isDeletingAdmin ? "Deleting..." : "Delete"}
                type="danger"
            />
        </div>
    );
};

export default AdminManagement;