'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingDown, Plus, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// ── API hooks ────────────────────────────────────────────────────────────────
import { useGetExpensesQuery } from '@/utils/slices/InventoryAndAsset/expenseApiSlice';
import { useGetAdminListQuery } from '@/utils/slices/adminApiSlice';
import { useGetCampaignListQuery } from '@/utils/slices/campaignSlice';
import { useGetPurchasesQuery } from '@/utils/slices/InventoryAndAsset/purchaseApiSlice';
import { useGetVendorsQuery } from '@/utils/slices/InventoryAndAsset/vendorApiSlice';
import { useGetAgreementsQuery } from '@/utils/slices/documentationApiSlice';
import {
    useGetVolunteersQuery,
    useGetApprovedVouchersQuery,
} from '@/utils/slices/vouchersApiSlice';
import { useGetItemsQuery } from '@/utils/slices/InventoryAndAsset/itemApiSlice';
import { useGetStatesQuery, useLazyGetCitiesQuery } from '@/utils/slices/locationApiSlice';
import { STATES as FALLBACK_STATES } from '@/utils/locations';

// ── Sub-components ───────────────────────────────────────────────────────────
import ExpenseFilters from './components/ExpenseFilters';
import { ExpenseTable, ExpenseMobileList } from './components/ExpenseList';
import AddExpenseModal from './components/AddExpenseModal';
import EditExpenseModal from './components/EditExpenseModal';
import AddPurchaseModal from './components/AddPurchaseModal';
import AddVendorModal from './components/AddVendorModal';

// ── Custom hook ───────────────────────────────────────────────────────────────
import { useExpenseForm } from './hooks/useExpenseForm';
import { DEFAULT_PURCHASE_FORM, DEFAULT_VENDOR_FORM, AMOUNT_TYPES } from './utils/expenseHelpers';

export default function ExpenseManagement() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExpenseType, setSelectedExpenseType] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [selectedAmountType, setSelectedAmountType] = useState('ALL');

    // ── Remote data ──────────────────────────────────────────────────────────
    const { data: expensesRes, isLoading } = useGetExpensesQuery({
        type: selectedExpenseType !== 'ALL' ? selectedExpenseType : undefined,
        amountType: selectedAmountType !== 'ALL' ? selectedAmountType : undefined,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentMethod: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
    });
    const { data: adminsRes } = useGetAdminListQuery();
    const { data: campaignsRes } = useGetCampaignListQuery();
    const { data: purchasesRes } = useGetPurchasesQuery();
    const { data: vendorsRes } = useGetVendorsQuery();
    const { data: agreementsRes } = useGetAgreementsQuery();
    const { data: itemsRes } = useGetItemsQuery({ status: 'ACTIVE' });
    const { data: apiStates } = useGetStatesQuery();
    const [triggerGetCities, { data: apiCities, isLoading: isLoadingCities }] = useLazyGetCitiesQuery();

    // ── Normalised lists ──────────────────────────────────────────────────────
    const expenses = expensesRes?.data || [];
    const admins = adminsRes?.data || [];
    const campaigns = campaignsRes?.data || [];
    const purchases = purchasesRes?.data || [];
    const vendors = vendorsRes?.data || [];
    const agreements = agreementsRes?.data || [];
    const items = itemsRes?.data || [];
    const volunteers = (useGetVolunteersQuery().data)?.data || [];
    const states = apiStates || FALLBACK_STATES;

    // ── Form hook ─────────────────────────────────────────────────────────────
    const {
        formData, setFormData, setField, resetForm,
        editingExpense, openEditExpense,
        purchaseFormData, setPurchaseFormData,
        vendorFormData, setVendorFormData,
        vendorIdType, setVendorIdType,
        showAddPurchaseModal, setShowAddPurchaseModal,
        showAddVendorModal, setShowAddVendorModal,
        handleSubmit, isCreating, isUpdating,
        handleCreatePurchaseSubmit, isCreatingPurchase,
        handleCreateVendorSubmit, isCreatingVendor,
        addLineItem, removeLineItem, updateLineItem,
        hasDraft, restoreDraft, discardDraft, draftSavedStatus,
    } = useExpenseForm({
        vendors: vendorsRes?.data || [],
        items: itemsRes?.data || [],
        purchases: purchasesRes?.data || [],
        onSuccess: () => {
            setShowAddModal(false);
            setShowEditModal(false);
        },
    });

    // ── Vouchers depend on selected volunteer ─────────────────────────────────
    const { data: vouchersRes } = useGetApprovedVouchersQuery(formData.volunteerId, {
        skip: !formData.volunteerId,
    });
    const approvedVouchers = vouchersRes?.data || [];

    // ── Edit handler ──────────────────────────────────────────────────────────
    const handleOpenEdit = (expense) => {
        openEditExpense(expense);
        setShowEditModal(true);
    };

    // ── Client-side filter ────────────────────────────────────────────────────
    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                expense.description?.toLowerCase().includes(q) ||
                expense.transactionId?.toLowerCase().includes(q) ||
                expense.amount?.toString().includes(q);

            const matchesAmountType =
                selectedAmountType === 'ALL' ||
                expense.amountType === selectedAmountType;

            const matchesType = selectedExpenseType === 'ALL' || expense.expenseType === selectedExpenseType;
            const matchesPayment = paymentMethodFilter === 'ALL' || expense.paymentMethod === paymentMethodFilter;

            const expDate = new Date(expense.date).setHours(0, 0, 0, 0);
            const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
            const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

            return (
                matchesSearch &&
                matchesType &&
                matchesAmountType &&
                matchesPayment &&
                (!start || expDate >= start) &&
                (!end || expDate <= end) &&
                (!minAmount || expense.amount >= parseFloat(minAmount)) &&
                (!maxAmount || expense.amount <= parseFloat(maxAmount))
            );
        });
    }, [expenses, searchQuery, selectedExpenseType, paymentMethodFilter, startDate, endDate, minAmount, maxAmount]);

    const availablePaymentMethods = useMemo(
        () => [...new Set(expenses.map((e) => e.paymentMethod).filter(Boolean))].sort(),
        [expenses]
    );

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedExpenseType('ALL');
        setStartDate('');
        setSelectedAmountType('ALL');
        setEndDate('');
        setPaymentMethodFilter('ALL');
        setMinAmount('');
        setMaxAmount('');
    };

    // ── Track whether the vendor modal was opened from AddPurchaseModal ────────
    const [vendorModalSource, setVendorModalSource] = useState('expense'); // 'expense' | 'purchase'

    useEffect(() => { setIsMounted(true); }, []);
    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
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
                        <Plus size={18} /> Record Expense
                    </button>
                </div>
            </header>

            {/* ── Main ───────────────────────────────────────────────────────── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ExpenseFilters
                    selectedAmountType={selectedAmountType}
                    setSelectedAmountType={setSelectedAmountType}
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    selectedExpenseType={selectedExpenseType} setSelectedExpenseType={setSelectedExpenseType}
                    paymentMethodFilter={paymentMethodFilter} setPaymentMethodFilter={setPaymentMethodFilter}
                    startDate={startDate} setStartDate={setStartDate}
                    endDate={endDate} setEndDate={setEndDate}
                    minAmount={minAmount} setMinAmount={setMinAmount}
                    maxAmount={maxAmount} setMaxAmount={setMaxAmount}
                    availablePaymentMethods={availablePaymentMethods}
                    onClear={clearFilters}
                />

                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                        <p className="text-gray-500">Loading expenses…</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Recent Expenses</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                                    {filteredExpenses.length} Results
                                </p>
                            </div>
                            {/* Pass onEdit to both table variants */}
                            <ExpenseTable expenses={filteredExpenses} onEdit={handleOpenEdit} />
                            <ExpenseMobileList expenses={filteredExpenses} onEdit={handleOpenEdit} />
                        </div>
                    </AnimatePresence>
                )}
            </main>

            {/* ── Add Expense Modal ───────────────────────────────────────────── */}
            <AddExpenseModal
                show={showAddModal}
                onClose={() => { setShowAddModal(false); resetForm(); }}
                formData={formData}
                setFormData={setFormData}
                setField={setField}
                handleSubmit={handleSubmit}
                isCreating={isCreating}
                admins={admins}
                campaigns={campaigns}
                purchases={purchases}
                vendors={vendors}
                agreements={agreements}
                volunteers={volunteers}
                approvedVouchers={approvedVouchers}
                onOpenAddPurchase={() => {
                    setPurchaseFormData(DEFAULT_PURCHASE_FORM);
                    setVendorModalSource('purchase');
                    setShowAddPurchaseModal(true);
                }}
                onOpenAddVendor={() => {
                    setVendorFormData(DEFAULT_VENDOR_FORM);
                    setVendorModalSource('expense');
                    setShowAddVendorModal(true);
                }}
                hasDraft={hasDraft}
                restoreDraft={restoreDraft}
                discardDraft={discardDraft}
                draftSavedStatus={draftSavedStatus}
            />

            {/* ── Edit Expense Modal ──────────────────────────────────────────── */}
            <EditExpenseModal
                show={showEditModal}
                onClose={() => { setShowEditModal(false); resetForm(); }}
                formData={formData}
                setFormData={setFormData}
                setField={setField}
                handleSubmit={handleSubmit}
                isUpdating={isUpdating}
                admins={admins}
                campaigns={campaigns}
                purchases={purchases}
                vendors={vendors}
                agreements={agreements}
                volunteers={volunteers}
                approvedVouchers={approvedVouchers}
            />

            {/* ── Add Purchase Modal ──────────────────────────────────────────── */}
            <AddPurchaseModal
                show={showAddPurchaseModal}
                onClose={() => setShowAddPurchaseModal(false)}
                purchaseFormData={purchaseFormData}
                setPurchaseFormData={setPurchaseFormData}
                vendors={vendors}
                items={items}
                addLineItem={addLineItem}
                removeLineItem={removeLineItem}
                updateLineItem={updateLineItem}
                onSubmit={handleCreatePurchaseSubmit}
                isLoading={isCreatingPurchase}
                onOpenAddVendor={() => {
                    setVendorFormData(DEFAULT_VENDOR_FORM);
                    setVendorModalSource('purchase');
                    setShowAddVendorModal(true);
                }}
            />

            {/* ── Add Vendor Modal ────────────────────────────────────────────── */}
            <AddVendorModal
                show={showAddVendorModal}
                onClose={() => setShowAddVendorModal(false)}
                vendorFormData={vendorFormData}
                setVendorFormData={setVendorFormData}
                vendorIdType={vendorIdType}
                setVendorIdType={setVendorIdType}
                states={states}
                apiCities={apiCities}
                isLoadingCities={isLoadingCities}
                triggerGetCities={triggerGetCities}
                onSubmit={handleCreateVendorSubmit}
                isLoading={isCreatingVendor}
            />
        </div>
    );
}