'use client';
import Navbar from '../Layout/NavBar';
import Sidebar from '../Layout/SideBar';
import { useState, useEffect } from 'react';

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
    Trash2
} from 'lucide-react';


// Mock data for demonstration
const mockAdminData = [
    {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul@donatenow.org',
        role: 'Campaign Manager',
        lastActivity: 'Updated donation campaign settings',
        date: '2025-01-15 14:30',
        status: 'Success'
    },
    {
        id: 2,
        name: 'Priya Patel',
        email: 'priya@donatenow.org',
        role: 'CMS Admin',
        lastActivity: 'Added new blog post about education',
        date: '2025-01-15 12:15',
        status: 'Success'
    },
    {
        id: 3,
        name: 'Akshay Kumar',
        email: 'akshay@donatenow.org',
        role: 'Volunteer Manager',
        lastActivity: 'Processing payment verification',
        date: '2025-01-15 11:45',
        status: 'Pending'
    },
];

const AdminManagement = () => {
    const [adminData, setAdminData] = useState(mockAdminData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Date');
    const [showPassword, setShowPassword] = useState(false);
    const [successAlert, setSuccessAlert] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        contact: '',
        role: []
    });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("AdminManagement");

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
        const matchesRole = roleFilter === 'All' || admin.role === roleFilter;
        return matchesSearch && matchesRole;
    }).sort((a, b) => {
        if (sortBy === 'Date') {
            return new Date(b.date) - new Date(a.date);
        }
        return a.name.localeCompare(b.name);
    });

    const handleSubmit = () => {
        // Create new admin
        const newAdmin = {
            id: adminData.length + 1,
            name: formData.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email: formData.email,
            role: formData.role,
            lastActivity: 'Account created',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: 'Success'
        };

        setAdminData([newAdmin, ...adminData]);

        // Reset form
        setFormData({
            email: '',
            password: '',
            contact: '',
            role: 'Admin'
        });

        // Show success alert
        setSuccessAlert(true);
        setTimeout(() => setSuccessAlert(false), 3000);

        // Close modal
        setIsModalOpen(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Failed':
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

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
        // Reset form when closing
        setFormData({
            email: '',
            password: '',
            contact: '',
            role: 'Admin'
        });
        setShowPassword(false);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1 text-center sm:text-left">Admin Management</h1>
                            <p className="text-sm text-gray-600 text-center sm:text-left">Manage platform admins and view their recent activities.</p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r w-full sm:w-auto mx-auto sm:mx-0 from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            Add Admin
                        </button>
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
                                        <option value="Admin">Admin</option>
                                        <option value="CMS Admin">CMS Admin</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                </div>

                                {/* Sort by Date */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                                    >
                                        <option value="Date">Sort by Date</option>
                                        <option value="Name">Sort by Name</option>
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
                                        <th className="text-left py-4 px-3 font-semibold text-gray-700 w-[28%]">Activity Description</th>
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
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 shrink-0 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                            {admin.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-gray-900 text-sm">{admin.name}</div>
                                                            <div className="text-xs text-gray-500 truncate">{admin.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block ${admin.role === 'Admin'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {admin.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 text-gray-700 text-sm">{admin.lastActivity}</td>
                                                <td className="py-4 px-3 text-gray-600 text-xs whitespace-nowrap">{formatDate(admin.date)}</td>
                                                <td className="py-4 px-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap inline-block ${getStatusColor(admin.status)}`}>
                                                        {admin.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3">
                                                    <div className="flex items-center gap-1">
                                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                                                            <Trash2 className="w-4 h-4" />
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
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.role === 'Admin'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {admin.role}
                                                </span>
                                            </div>

                                            <div className="text-gray-700 text-sm">{admin.lastActivity}</div>
                                            <div className="text-gray-500 text-xs">{formatDate(admin.date)}</div>

                                            <div className="flex items-center gap-2 pt-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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

                {/* Add Admin Modal with Blur Background */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4 sm:p-6"
                        onClick={closeModal}
                    >
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scrollbar-none [&::-webkit-scrollbar]:hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Create New Admin</h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="admin@donatenow.org"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Create a secure password"
                                            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Role Selection
                                    </label>
                                    <div className="relative">
                                        <select
                                            multiple
                                            value={formData.role}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                                                setFormData({ ...formData, role: selected });
                                            }}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="CMS Admin">CMS Admin</option>
                                            <option value="Volunteer Manager">Volunteer Manager</option>
                                            <option value="Campaign Manager">Campaign Manager</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Hold <kbd className="px-1 bg-gray-100 rounded">Ctrl</kbd> (Windows) or <kbd className="px-1 bg-gray-100 rounded">Cmd</kbd> (Mac) to select multiple roles.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                    >
                                        Create Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManagement;