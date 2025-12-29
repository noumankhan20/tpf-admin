'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Package,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    HardDrive,
    Shapes,
    Scale,
    Monitor,
    ShoppingBag,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItemManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterType, setFilterType] = useState('all');

    // Mock Initial Items
    const [items, setItems] = useState([
        { id: 1, name: 'MacBook Pro M3', type: 'Asset', unit: 'Nos', category: 'Electronics' },
        { id: 2, name: 'Basmati Rice', type: 'Inventory', unit: 'Kg', category: 'Food' },
        { id: 3, name: 'iPhone 15', type: 'Asset', unit: 'Nos', category: 'Electronics' },
        { id: 4, name: 'Wheat Flour', type: 'Inventory', unit: 'Kg', category: 'Food' },
        { id: 5, name: 'Office Chair', type: 'Asset', unit: 'Nos', category: 'Furniture' },
    ]);

    // Form State
    const [formData, setFormData] = useState({ name: '', type: 'Asset', unit: 'Nos' });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            setItems(prev => prev.map(v => v.id === editingItem.id ? { ...v, ...formData } : v));
            setEditingItem(null);
        } else {
            const newItem = {
                id: Date.now(),
                ...formData
            };
            setItems(prev => [newItem, ...prev]);
        }
        setFormData({ name: '', type: 'Asset', unit: 'Nos' });
        setShowAddModal(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({ name: item.name, type: item.type, unit: item.unit });
        setShowAddModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setItems(prev => prev.filter(v => v.id !== id));
        }
    };

    const filteredItems = items.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || v.type === filterType;
        return matchesSearch && matchesFilter;
    });

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
                            <Package className="text-emerald-600" size={24} />
                            Item Master
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ name: '', type: 'Asset', unit: 'Nos' });
                            setShowAddModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Define Item
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search items by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['all', 'Asset', 'Inventory'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${filterType === type
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-200'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={item.id}
                                className="bg-white rounded-3xl border border-gray-100 p-6 relative group transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${item.type === 'Asset' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {item.type === 'Asset' ? <HardDrive size={24} /> : <ShoppingBag size={24} />}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${item.type === 'Asset' ? 'text-blue-500' : 'text-orange-500'}`}>
                                        {item.type}
                                    </p>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <Scale size={14} />
                                        <span className="text-xs font-bold uppercase tracking-tight">Unit:</span>
                                    </div>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{item.unit}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Box size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No items defined</h3>
                        <p className="text-gray-500">Add some items (Assets or Inventory) to start tracking.</p>
                    </div>
                )}
            </main>

            {/* Add/Edit Item Modal */}
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
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Item' : 'New Item Master'}</h2>
                                    <p className="text-sm text-gray-500">Define what you buy or track</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Item Name</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder="e.g. MacBook Pro, Basmati Rice"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Item Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none"
                                        >
                                            <option value="Asset">Asset</option>
                                            <option value="Inventory">Inventory</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Unit of Measure</label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none"
                                        >
                                            <option value="Nos">Nos (Numbers)</option>
                                            <option value="Kg">Kg (Kilograms)</option>
                                            <option value="Ltrs">Ltrs (Liters)</option>
                                            <option value="Mtrs">Mtrs (Meters)</option>
                                            <option value="Box">Box</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                            {formData.type === 'Asset' ? <HardDrive size={16} /> : <ShoppingBag size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Pro-tip</p>
                                            <p className="text-[11px] text-emerald-600 font-medium">
                                                {formData.type === 'Asset'
                                                    ? "Assets are long-term items like laptops."
                                                    : "Inventory items are consumables like food supplies."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98] mt-2"
                                >
                                    {editingItem ? 'Update Item' : 'Create Item'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
