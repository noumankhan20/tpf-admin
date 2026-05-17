'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    IndianRupee,
    Plus,
    Search,
    X,
    Calendar,
    FileText,
    Building2,
    User,
    Users,
    Package,
    Receipt,
    TrendingDown,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Clock,
    Filter,
    CreditCard,
    ShoppingCart,
    Banknote,
    Trash2,
    MapPin,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Redux hooks
import {
    useGetExpensesQuery,
    useCreateExpenseMutation
} from '@/utils/slices/InventoryAndAsset/expenseApiSlice';
import { useGetAdminListQuery } from '@/utils/slices/adminApiSlice';
import { useGetCampaignListQuery } from '@/utils/slices/campaignSlice';
import { useGetPurchasesQuery } from '@/utils/slices/InventoryAndAsset/purchaseApiSlice';
import { useGetVendorsQuery } from '@/utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetAgreementsQuery } from '@/utils/slices/documentationApiSlice';
import {
    useGetVolunteersQuery,
    useGetApprovedVouchersQuery,
} from '@/utils/slices/vouchersApiSlice';
import { 
    useCreatePurchaseMutation 
} from '@/utils/slices/InventoryAndAsset/purchaseApiSlice';
import { 
    useCreateVendorMutation 
} from '@/utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetItemsQuery } from '@/utils/slices/InventoryAndAsset/itemApiSlice';
import { useGetStatesQuery, useLazyGetCitiesQuery } from '@/utils/slices/locationApiSlice';
import { INDIAN_LOCATIONS, STATES as FALLBACK_STATES } from '@/utils/locations';

export default function ExpenseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExpenseType, setSelectedExpenseType] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    // API Hooks
    const { data: expensesResponse, isLoading, refetch } = useGetExpensesQuery({
        type: selectedExpenseType !== 'ALL' ? selectedExpenseType : undefined,
        search: searchQuery,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentMethod: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined
    });
    const { data: adminsResponse } = useGetAdminListQuery();
    const { data: campaignsResponse } = useGetCampaignListQuery();
    const { data: purchasesResponse } = useGetPurchasesQuery();
    const { data: vendorsResponse } = useGetVendorsQuery();
    const { data: agreementsResponse } = useGetAgreementsQuery();

    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

    // Form State
    const [formData, setFormData] = useState({
        expenseType: 'SALARY',
        amount: '',
        description: '',
        adminId: '',
        campaignId: '',
        purchaseId: '',
        vendorId: '',
        agreementId: '',
        paymentMethod: 'CASH',
        transactionId: '',
        notes: '',
        reimbursementType: 'ADMIN',
        volunteerName: '',
        volunteerPhone: '',
        volunteerLocation: '',
        volunteerId: '',
        voucherId: '',
        proofFile: null,
        transactionDate: new Date().toISOString().split('T')[0],
        transactionTime: ''
    });

    const { data: volunteersResponse } = useGetVolunteersQuery();
    const { data: vouchersResponse } = useGetApprovedVouchersQuery(formData.volunteerId, {
        skip: !formData.volunteerId
    });

    // Sub-modal states
    const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);

    // Purchase Form State (for sub-modal)
    const [purchaseFormData, setPurchaseFormData] = useState({
        vendorId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'PENDING',
        proofFile: null,
        lineItems: []
    });

    // Vendor Form State (for sub-modal)
    const [vendorFormData, setVendorFormData] = useState({
        fullName: '',
        contactNumber: '',
        vendorGST: '',
        state: '',
        city: '',
        fullAddress: '',
        status: 'ACTIVE'
    });

    // Mutations and data for sub-modals
    const [createPurchase, { isLoading: isCreatingPurchase }] = useCreatePurchaseMutation();
    const [createVendor, { isLoading: isCreatingVendor }] = useCreateVendorMutation();
    const { data: itemsResponse } = useGetItemsQuery({ status: 'ACTIVE' });
    const items = itemsResponse?.data || [];
    const { data: apiStates, isLoading: isLoadingStates } = useGetStatesQuery();
    const [triggerGetCities, { data: apiCities, isLoading: isLoadingCities }] = useLazyGetCitiesQuery();
    const states = apiStates || FALLBACK_STATES;

    const volunteers = volunteersResponse?.data || [];
    const approvedVouchers = vouchersResponse?.data || [];

    const expenses = expensesResponse?.data || [];
    const admins = adminsResponse?.data || [];
    const campaigns = campaignsResponse?.data || [];
    const purchases = purchasesResponse?.data || [];
    const vendors = vendorsResponse?.data || [];
    const agreements = agreementsResponse?.data || [];

    // Extract unique values for dynamic filters
    const availablePaymentMethods = [...new Set(expenses.map(e => e.paymentMethod).filter(Boolean))].sort();


    // Local Filtering for robust UI behavior
    const filteredExpenses = expenses.filter(expense => {
        // Search
        const searchStr = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            expense.description?.toLowerCase().includes(searchStr) ||
            expense.transactionId?.toLowerCase().includes(searchStr) ||
            expense.amount?.toString().includes(searchStr);

        // Expense Type
        const matchesType = selectedExpenseType === 'ALL' || expense.expenseType === selectedExpenseType;

        // Payment Method
        const matchesPayment = paymentMethodFilter === 'ALL' || expense.paymentMethod === paymentMethodFilter;

        // Date Range
        const expDate = new Date(expense.date).setHours(0, 0, 0, 0);
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

        const matchesStartDate = !start || expDate >= start;
        const matchesEndDate = !end || expDate <= end;

        // Amount Range
        const matchesMinAmount = !minAmount || expense.amount >= parseFloat(minAmount);
        const matchesMaxAmount = !maxAmount || expense.amount <= parseFloat(maxAmount);

        return matchesSearch && matchesType && matchesPayment && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });

    const expenseTypes = [
        { value: 'ALL', label: 'All Expenses', color: 'gray' },
        { value: 'SALARY', label: 'Salary', color: 'blue' },
        { value: 'BENEFICIARY', label: 'Beneficiary', color: 'green' },
        { value: 'PURCHASE', label: 'Purchase', color: 'purple' },
        { value: 'REIMBURSEMENT', label: 'Reimbursement', color: 'orange' },
        { value: 'OPERATIONAL', label: 'Operational', color: 'teal' },
        { value: 'DOCUMENTATION_SERVICE', label: 'Documentation Service Payment', color: 'amber' },
        { value: 'OTHER', label: 'Other', color: 'gray' },
    ];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('amount', formData.amount);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('expenseType', formData.expenseType);
            formDataToSend.append('paymentMethod', formData.paymentMethod);

            if (formData.transactionId) formDataToSend.append('transactionId', formData.transactionId);
            if (formData.notes) formDataToSend.append('notes', formData.notes);
            formDataToSend.append('transactionDate', formData.transactionDate);
            if (formData.transactionTime) formDataToSend.append('transactionTime', formData.transactionTime);

            if (formData.expenseType === 'SALARY' && formData.adminId) {
                formDataToSend.append('adminId', formData.adminId);
            }
            if (formData.campaignId) {
                formDataToSend.append('campaignId', formData.campaignId);
            }
            if (formData.expenseType === 'PURCHASE' && formData.purchaseId) {
                formDataToSend.append('purchaseId', formData.purchaseId);
            }
            if (formData.vendorId) {
                formDataToSend.append('vendorId', formData.vendorId);
            }
            if (formData.expenseType === 'DOCUMENTATION_SERVICE' && formData.agreementId) {
                formDataToSend.append('agreementId', formData.agreementId);
            }

            if (formData.expenseType === 'REIMBURSEMENT') {
                if (formData.reimbursementType === 'ADMIN' && formData.adminId) {
                    formDataToSend.append('reimbursementTo[adminId]', formData.adminId);
                } else if (formData.reimbursementType === 'VOLUNTEER' && formData.volunteerId) {
                    formDataToSend.append('reimbursementTo[volunteerDetails][name]', formData.volunteerName); // Still keeping old fields for safety
                    formDataToSend.append('reimbursementTo[volunteerDetails][phone]', formData.volunteerPhone);
                    formDataToSend.append('reimbursementTo[volunteerDetails][location]', formData.volunteerLocation);
                    formDataToSend.append('reimbursementTo[volunteerId]', formData.volunteerId);
                    if (formData.voucherId) formDataToSend.append('voucherId', formData.voucherId);
                }
            }

            if (formData.proofFile) {
                formDataToSend.append('proof', formData.proofFile);
            }

            await createExpense(formDataToSend).unwrap();
            setShowAddModal(false);
            resetForm();
            toast.success('Expense recorded successfully');
        } catch (error) {
            console.error('Failed to create expense:', error);
            toast.error(error?.data?.message || 'Failed to create expense');
        }
    };

    const resetForm = () => {
        setFormData({
            expenseType: 'SALARY',
            amount: '',
            description: '',
            adminId: '',
            campaignId: '',
            purchaseId: '',
            vendorId: '',
            agreementId: '',
            paymentMethod: 'CASH',
            transactionId: '',
            notes: '',
            reimbursementType: 'ADMIN',
            volunteerName: '',
            volunteerPhone: '',
            volunteerLocation: '',
            volunteerId: '',
            voucherId: '',
            proofFile: null,
            transactionDate: new Date().toISOString().split('T')[0],
            transactionTime: ''
        });
    };

    // Sub-modal handlers
    const addLineItem = () => {
        setPurchaseFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { itemId: '', qty: '', price: '', unit: '' }]
        }));
    };

    const removeLineItem = (index) => {
        setPurchaseFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index)
        }));
    };

    const updateLineItem = (index, field, value) => {
        setPurchaseFormData(prev => {
            const updatedLines = [...prev.lineItems];
            if (field === 'itemId') {
                const selectedItem = items.find(item => item._id === value);
                updatedLines[index] = {
                    ...updatedLines[index],
                    itemId: value,
                    unit: selectedItem?.unit || ''
                };
            } else {
                updatedLines[index] = { ...updatedLines[index], [field]: value };
            }
            return { ...prev, lineItems: updatedLines };
        });
    };

    const handleCreatePurchaseSubmit = async (e) => {
        e.preventDefault();
        if (purchaseFormData.lineItems.length === 0) {
            toast.warning("Please add at least one item.");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('vendorId', purchaseFormData.vendorId);
        formDataToSend.append('purchaseDate', purchaseFormData.purchaseDate);
        formDataToSend.append('paymentStatus', purchaseFormData.paymentStatus);

        const itemsPayload = purchaseFormData.lineItems.map(item => ({
            itemId: item.itemId,
            quantity: Number(item.qty),
            price: Number(item.price)
        }));
        formDataToSend.append('items', JSON.stringify(itemsPayload));

        if (purchaseFormData.proofFile) {
            formDataToSend.append('proof', purchaseFormData.proofFile);
        }

        try {
            const result = await createPurchase(formDataToSend).unwrap();
            toast.success('Purchase recorded successfully');
            setShowAddPurchaseModal(false);
            // Automatically select the new purchase in the main form
            setFormData(prev => ({ ...prev, purchaseId: result.data._id }));
        } catch (err) {
            console.error('Failed to save purchase:', err);
            toast.error(err?.data?.message || 'Failed to save purchase');
        }
    };

    const handleCreateVendorSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!/^[0-9]{10}$/.test(vendorFormData.contactNumber)) {
                toast.warning('Contact number must be a valid 10-digit number');
                return;
            }

            // Validate GST if provided
            if (vendorFormData.vendorGST && !/^[0-9A-Z]{15}$/.test(vendorFormData.vendorGST)) {
                toast.warning('Invalid GST number format (must be 15 alphanumeric characters)');
                return;
            }

            const result = await createVendor(vendorFormData).unwrap();
            toast.success('Vendor created successfully');
            setShowAddVendorModal(false);
            // Automatically select the new vendor in the main form
            setFormData(prev => ({ ...prev, vendorId: result.data._id }));
        } catch (err) {
            console.error('Failed to save vendor:', err);
            toast.error(err?.data?.message || 'Failed to save vendor');
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedExpenseType('ALL');
        setStartDate('');
        setEndDate('');
        setPaymentMethodFilter('ALL');
        setMinAmount('');
        setMaxAmount('');
    };

    const getExpenseTypeColor = (type) => {
        const typeInfo = expenseTypes.find(t => t.value === type);
        return typeInfo?.color || 'gray';
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/select-portal?category=resource')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingDown className="text-emerald-600" size={24} />
                            Expense Management
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Plus size={18} />
                        Record Expense
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filters */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search description, TXN ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <select
                                value={selectedExpenseType}
                                onChange={(e) => setSelectedExpenseType(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                {expenseTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Payment Method Dropdown */}
                        <div className="relative">
                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <select
                                value={paymentMethodFilter}
                                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Payment Methods</option>
                                {availablePaymentMethods.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Date Range - Start */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                            />
                        </div>

                        {/* Date Range - End */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                                placeholder="End Date"
                            />
                        </div>

                        {/* Amount Range */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="relative flex-1">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold"
                                />
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        <button
                            onClick={clearFilters}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                        >
                            <X size={16} />
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading expenses...</p>
                    </div>
                )}

                {/* Expenses List */}
                {!isLoading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Recent Expenses</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                                {filteredExpenses.length} Results
                            </p>
                        </div>
                        <AnimatePresence>
                            {filteredExpenses.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <TrendingDown size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No results found</h3>
                                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                                </div>
                            ) : (
                                filteredExpenses.map((expense) => {
                                    const typeColor = getExpenseTypeColor(expense.expenseType);
 
                                    return (
                                        <motion.div
                                            key={expense._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                    <div className={`w-12 h-12 rounded-xl bg-gray-50 text-emerald-600 flex items-center justify-center`}>
                                                        <TrendingDown size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-bold text-gray-900">{expense.description}</h3>
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700`}>
                                                                {expense.expenseType}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(expense.date || expense.transactionDate).toLocaleDateString()}
                                                            </span>
                                                            {expense.adminId && (
                                                                <span className="flex items-center gap-1 text-blue-600">
                                                                    <User size={12} />
                                                                    {expense.adminId.fullName}
                                                                </span>
                                                            )}
                                                            {expense.campaignId && (
                                                                <span className="flex items-center gap-1 text-green-600">
                                                                    <Users size={12} />
                                                                    {expense.campaignId.title}
                                                                </span>
                                                            )}
                                                            {expense.vendorId && (
                                                                <span className="flex items-center gap-1 text-purple-600">
                                                                    <Building2 size={12} />
                                                                    {expense.vendorId.fullName}
                                                                </span>
                                                            )}
                                                            {expense.agreementId && (
                                                                <span className="flex items-center gap-1 text-amber-600">
                                                                    <FileText size={12} />
                                                                    {expense.agreementId.agreementTitle}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1 text-gray-400">
                                                                <Banknote size={12} />
                                                                {expense.paymentMethod}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                                                    {expense.transactionId && (
                                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">TXN: {expense.transactionId}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {expense.notes && (
                                                <div className="bg-gray-50 rounded-xl p-4 mt-4 border border-gray-100/50">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Notes</p>
                                                    <p className="text-sm text-gray-600 italic">"{expense.notes}"</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Add Expense Modal */}
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
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Record New Expense</h2>
                                    <p className="text-sm text-gray-500">Track organizational expenses</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                    {/* Expense Type */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Expense Type *</label>
                                        <select
                                            required
                                            value={formData.expenseType}
                                            onChange={(e) => setFormData(p => ({ ...p, expenseType: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                        >
                                            {expenseTypes.filter(t => t.value !== 'ALL').map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Amount */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Amount (₹) *</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                                    placeholder="0.00"
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold"
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Payment Method *</label>
                                            <div className="relative">
                                                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="CASH">Cash</option>
                                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                                    <option value="UPI">UPI</option>
                                                    <option value="CHEQUE">Cheque</option>
                                                    <option value="CARD">Card</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Transaction Date */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date of Transaction *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.transactionDate}
                                                    onChange={(e) => setFormData(p => ({ ...p, transactionDate: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Transaction Time */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Transaction Time (Optional)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="time"
                                                    value={formData.transactionTime}
                                                    onChange={(e) => setFormData(p => ({ ...p, transactionTime: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Description *</label>
                                        <textarea
                                            required
                                            rows="2"
                                            value={formData.description}
                                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                            placeholder="What was this expense for?"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Conditional Fields Based on Expense Type */}
                                    {formData.expenseType === 'SALARY' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Employee *</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.adminId}
                                                    onChange={(e) => setFormData(p => ({ ...p, adminId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Admin</option>
                                                    {admins.map(admin => (
                                                        <option key={admin._id} value={admin._id}>{admin.fullName} ({admin.email})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Campaign Selection for SALARY, REIMBURSEMENT, and BENEFICIARY */}
                                    {(formData.expenseType === 'BENEFICIARY' ||
                                        (formData.expenseType === 'SALARY' && formData.adminId) ||
                                        (formData.expenseType === 'REIMBURSEMENT' && (formData.adminId || formData.volunteerId))
                                    ) && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                                    Select Campaign {formData.expenseType !== 'BENEFICIARY' && '(Optional)'}
                                                </label>
                                                <div className="relative">
                                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <select
                                                        required={formData.expenseType === 'BENEFICIARY'}
                                                        value={formData.campaignId}
                                                        onChange={(e) => setFormData(p => ({ ...p, campaignId: e.target.value }))}
                                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                    >
                                                        <option value="">Choose Campaign</option>
                                                        {campaigns.map(campaign => (
                                                            <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                    {formData.expenseType === 'PURCHASE' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Link Purchase *</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setPurchaseFormData({
                                                            vendorId: '',
                                                            purchaseDate: new Date().toISOString().split('T')[0],
                                                            paymentStatus: 'PENDING',
                                                            proofFile: null,
                                                            lineItems: []
                                                        });
                                                        setShowAddPurchaseModal(true);
                                                    }}
                                                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <Plus size={10} />
                                                    Add New Purchase
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.purchaseId}
                                                    onChange={(e) => setFormData(p => ({ ...p, purchaseId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Purchase</option>
                                                    {purchases.map(purchase => (
                                                        <option key={purchase._id} value={purchase._id}>
                                                            {purchase.vendorId?.fullName} - ₹{purchase.totalAmount}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.expenseType === 'DOCUMENTATION_SERVICE' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Documentation Agreement *</label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    required
                                                    value={formData.agreementId}
                                                    onChange={(e) => setFormData(p => ({ ...p, agreementId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Agreement</option>
                                                    {agreements.map(agreement => (
                                                        <option key={agreement._id} value={agreement._id}>
                                                            {agreement.title} - {agreement.parties?.[0]?.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.expenseType === 'REIMBURSEMENT' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Reimbursement To *</label>
                                                <select
                                                    required
                                                    value={formData.reimbursementType}
                                                    onChange={(e) => setFormData(p => ({ ...p, reimbursementType: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="VOLUNTEER">Volunteer</option>
                                                </select>
                                            </div>

                                            {formData.reimbursementType === 'ADMIN' ? (
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Employee *</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <select
                                                            required
                                                            value={formData.adminId}
                                                            onChange={(e) => setFormData(p => ({ ...p, adminId: e.target.value }))}
                                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                        >
                                                            <option value="">Choose Admin</option>
                                                            {admins.map(admin => (
                                                                <option key={admin._id} value={admin._id}>{admin.fullName}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select a Volunteer *</label>
                                                        <div className="relative">
                                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                            <select
                                                                required
                                                                value={formData.volunteerId}
                                                                onChange={(e) => {
                                                                    const vId = e.target.value;
                                                                    setFormData(p => ({ ...p, volunteerId: vId, voucherId: '', amount: '', description: '' }));
                                                                }}
                                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                            >
                                                                <option value="">Choose Volunteer</option>
                                                                {volunteers.map(v => (
                                                                    <option key={v._id} value={v._id}>{v.fullName} ({v.email})</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {formData.volunteerId && (
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select a Voucher *</label>
                                                            <div className="relative">
                                                                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                <select
                                                                    required
                                                                    value={formData.voucherId}
                                                                    onChange={(e) => {
                                                                        const vId = e.target.value;
                                                                        const selectedV = approvedVouchers.find(v => v._id === vId);
                                                                        setFormData(p => ({
                                                                            ...p,
                                                                            voucherId: vId,
                                                                            amount: selectedV?.amount || '',
                                                                            description: selectedV?.description || ''
                                                                        }));
                                                                    }}
                                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                                >
                                                                    <option value="">Choose Approved Voucher</option>
                                                                    {approvedVouchers.map(v => (
                                                                        <option key={v._id} value={v._id}>
                                                                            #{v._id.slice(-6).toUpperCase()} - ₹{v.amount} ({v.description})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {approvedVouchers.length === 0 && (
                                                                <p className="text-xs text-orange-500 mt-1">No approved and pending vouchers found for this volunteer.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Optional Vendor */}
                                    {(formData.expenseType === 'OPERATIONAL' || formData.expenseType === 'OTHER') && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor (Optional)</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setVendorFormData({
                                                            fullName: '',
                                                            contactNumber: '',
                                                            vendorGST: '',
                                                            state: '',
                                                            city: '',
                                                            fullAddress: '',
                                                            status: 'ACTIVE'
                                                        });
                                                        setShowAddVendorModal(true);
                                                    }}
                                                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <Plus size={10} />
                                                    Add New Vendor
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    value={formData.vendorId}
                                                    onChange={(e) => setFormData(p => ({ ...p, vendorId: e.target.value }))}
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Choose Vendor</option>
                                                    {vendors.map(vendor => (
                                                        <option key={vendor._id} value={vendor._id}>{vendor.fullName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Transaction ID */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Transaction ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.transactionId}
                                            onChange={(e) => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                                            placeholder="e.g., TXN123456"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Additional Notes</label>
                                        <textarea
                                            rows="2"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                                            placeholder="Any additional information..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Proof Upload */}
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Upload Proof (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setFormData(p => ({ ...p, proofFile: e.target.files[0] }))}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Save Expense Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sub-Modal: Add New Purchase */}
            <AnimatePresence>
                {showAddPurchaseModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddPurchaseModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">New Purchase Entry</h2>
                                    <p className="text-sm text-gray-500">Record procurement for this expense</p>
                                </div>
                                <button onClick={() => setShowAddPurchaseModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleCreatePurchaseSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor *</label>
                                            <select required value={purchaseFormData.vendorId} onChange={(e) => setPurchaseFormData(p => ({ ...p, vendorId: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none appearance-none font-medium">
                                                <option value="">Select Vendor</option>
                                                {vendors.map(v => <option key={v._id} value={v._id}>{v.fullName}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date *</label>
                                            <input type="date" required value={purchaseFormData.purchaseDate} onChange={(e) => setPurchaseFormData(p => ({ ...p, purchaseDate: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none font-medium" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status *</label>
                                            <select required value={purchaseFormData.paymentStatus} onChange={(e) => setPurchaseFormData(p => ({ ...p, paymentStatus: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none appearance-none font-medium">
                                                <option value="PENDING">Pending</option>
                                                <option value="PAID">Paid</option>
                                                <option value="PARTIALLY_PAID">Partial</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-3 border-b pb-2 border-gray-100">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</label>
                                            <button type="button" onClick={addLineItem} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"><Plus size={14} /> Add Item</button>
                                        </div>
                                        <div className="space-y-3">
                                            {purchaseFormData.lineItems.map((line, idx) => (
                                                <div key={idx} className="flex gap-3 items-start">
                                                    <div className="flex-1">
                                                        <select required value={line.itemId} onChange={(e) => updateLineItem(idx, 'itemId', e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium">
                                                            <option value="">Choose item...</option>
                                                            {items.map(item => <option key={item._id} value={item._id}>{item.name} ({item.itemType})</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-24">
                                                        <input type="number" min="1" required value={line.qty} onChange={(e) => updateLineItem(idx, 'qty', e.target.value)} placeholder="Qty" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm text-center font-bold" />
                                                    </div>
                                                    <div className="w-32">
                                                        <input type="number" min="0" required value={line.price} onChange={(e) => updateLineItem(idx, 'price', e.target.value)} placeholder="Price" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-bold" />
                                                    </div>
                                                    <button type="button" onClick={() => removeLineItem(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 border-dashed">
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Invoice / Bill Copy</label>
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => setPurchaseFormData(p => ({ ...p, proofFile: e.target.files[0] }))} className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-emerald-100 file:text-emerald-700 font-bold" />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-gray-400 uppercase">Estimated Total</span>
                                        <span className="text-2xl font-black text-gray-900">₹{purchaseFormData.lineItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0).toLocaleString()}</span>
                                    </div>
                                    <button type="submit" disabled={isCreatingPurchase} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                                        {isCreatingPurchase ? <Loader2 className="animate-spin" size={20} /> : 'Save Purchase Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sub-Modal: Add New Vendor */}
            <AnimatePresence>
                {showAddVendorModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddVendorModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add New Vendor</h2>
                                    <p className="text-sm text-gray-500">Supplier information for procurement</p>
                                </div>
                                <button onClick={() => setShowAddVendorModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                            </div>

                            <div className="p-8 space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Vendor Name *</label>
                                    <input required value={vendorFormData.fullName} onChange={(e) => setVendorFormData(prev => ({ ...prev, fullName: e.target.value }))} type="text" placeholder="e.g. MedPlus Essentials" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Contact Number *</label>
                                        <input required value={vendorFormData.contactNumber} onChange={(e) => setVendorFormData(prev => ({ ...prev, contactNumber: e.target.value }))} type="tel" placeholder="10-digit number" maxLength={10} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">GST Number</label>
                                        <input value={vendorFormData.vendorGST} onChange={(e) => setVendorFormData(prev => ({ ...prev, vendorGST: e.target.value.toUpperCase() }))} type="text" placeholder="15-char GSTIN" maxLength={15} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">State *</label>
                                        <select required value={vendorFormData.state} onChange={(e) => { const newState = e.target.value; setVendorFormData(prev => ({ ...prev, state: newState, city: '' })); if (newState) triggerGetCities(newState); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none">
                                            <option value="">Select State</option>
                                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">City *</label>
                                        <select required disabled={!vendorFormData.state || isLoadingCities} value={vendorFormData.city} onChange={(e) => setVendorFormData(prev => ({ ...prev, city: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none disabled:opacity-50">
                                            <option value="">{isLoadingCities ? 'Loading cities...' : 'Select City'}</option>
                                            {apiCities ? apiCities.map(city => <option key={city} value={city}>{city}</option>) : vendorFormData.state && INDIAN_LOCATIONS[vendorFormData.state] && INDIAN_LOCATIONS[vendorFormData.state].map(city => <option key={city} value={city}>{city}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Full Address *</label>
                                    <textarea required value={vendorFormData.fullAddress} onChange={(e) => setVendorFormData(prev => ({ ...prev, fullAddress: e.target.value }))} rows={3} placeholder="Enter complete office address..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none" />
                                </div>

                                <button onClick={handleCreateVendorSubmit} disabled={isCreatingVendor} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                                    {isCreatingVendor ? <Loader2 className="animate-spin" size={18} /> : 'Save Vendor'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
