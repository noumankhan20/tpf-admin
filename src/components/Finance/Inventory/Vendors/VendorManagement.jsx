'use client';

import React, { useState, useEffect } from 'react';
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
    MoreVertical,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    // Mock Initial Vendors
    const [vendors, setVendors] = useState([
        { id: 1, name: 'MedPlus Essentials', gst: '27AAAAA0000A1Z5', location: 'Mumbai, Maharashtra', address: 'Plot 42, Sector 18, Vashi', status: 'active' },
        { id: 2, name: 'Reliance Retail Ltd', gst: '27BBBBB1111B1Z2', location: 'Ahmedabad, Gujarat', address: 'Reliance House, Paldi', status: 'active' },
        { id: 3, name: 'Tata Croma Supplies', gst: '27CCCCC2222C1Z9', location: 'Bangalore, Karnataka', address: 'Electronic City, Phase 1', status: 'disabled' },
    ]);

    // Form State
    const [formData, setFormData] = useState({ name: '', gst: '', location: '', address: '' });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingVendor) {
            setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...v, ...formData } : v));
            setEditingVendor(null);
        } else {
            const newVendor = {
                id: Date.now(),
                ...formData,
                status: 'active'
            };
            setVendors(prev => [newVendor, ...prev]);
        }
        setFormData({ name: '', gst: '', location: '', address: '' });
        setShowAddModal(false);
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setFormData({ name: vendor.name, gst: vendor.gst, location: vendor.location, address: vendor.address });
        setShowAddModal(true);
    };

    const toggleStatus = (id) => {
        setVendors(prev => prev.map(v =>
            v.id === id ? { ...v, status: v.status === 'active' ? 'disabled' : 'active' } : v
        ));
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.gst.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/inventory')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="text-emerald-600" size={24} />
                            Vendor Management
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            setEditingVendor(null);
                            setFormData({ name: '', gst: '', location: '', address: '' });
                            setShowAddModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Add New Vendor
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filters */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or GST number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Vendors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredVendors.map((vendor) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={vendor.id}
                                className={`bg-white rounded-2xl border ${vendor.status === 'disabled' ? 'border-gray-200 grayscale-[0.6] opacity-80' : 'border-gray-100 shadow-sm'} p-6 relative group transition-all hover:shadow-md`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${vendor.status === 'disabled' ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <Briefcase size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(vendor)}
                                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(vendor.id)}
                                            className={`p-2 rounded-lg transition-colors ${vendor.status === 'active' ? 'hover:bg-rose-50 text-rose-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                                            title={vendor.status === 'active' ? 'Disable' : 'Enable'}
                                        >
                                            {vendor.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{vendor.name}</h3>
                                <p className="text-xs font-bold text-emerald-600 mb-4 tracking-wider">{vendor.gst}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MapPin size={14} className="shrink-0" />
                                        <p className="text-sm truncate">{vendor.location}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                        {vendor.address}
                                    </p>
                                </div>

                                {vendor.status === 'disabled' && (
                                    <div className="absolute top-4 right-4 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">
                                        Disabled
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredVendors.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No vendors found</h3>
                        <p className="text-gray-500">Try adjusting your search to find what you're looking for.</p>
                    </div>
                )}
            </main>

            {/* Add/Edit Vendor Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                                    <p className="text-sm text-gray-500">Supplier information for procurement</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor Name</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder="e.g. MedPlus Essentials"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">GST Number</label>
                                        <input
                                            required
                                            name="gst"
                                            value={formData.gst}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="GSTIN Number"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Location</label>
                                        <input
                                            required
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="e.g. Mumbai, MH"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Full Address</label>
                                    <textarea
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Enter complete office address..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-4"
                                >
                                    {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
