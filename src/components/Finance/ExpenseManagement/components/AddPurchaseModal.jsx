'use client';

import React, { useMemo } from 'react';
import { X, Plus, Trash2, Loader2, Building2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AddPurchaseModal({
    show, onClose,
    purchaseFormData, setPurchaseFormData,
    vendors, items,
    addLineItem, removeLineItem, updateLineItem,
    onSubmit, isLoading,
    onOpenAddVendor,
}) {
    const selectedVendor     = useMemo(() => vendors.find((v) => v._id === purchaseFormData.vendorId), [vendors, purchaseFormData.vendorId]);
    const isIndividualVendor = selectedVendor?.vendorType === 'INDIVIDUAL';

    const total = purchaseFormData.lineItems.reduce(
        (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0
    );

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200/80"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">New Purchase</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Record procurement for this expense</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">

                                {/* Top row: Vendor, Date, Status */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Vendor */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-xs font-medium text-gray-500">Vendor *</p>
                                            {onOpenAddVendor && (
                                                <button type="button" onClick={onOpenAddVendor} className={addNewBtn}>
                                                    <Plus size={11} /> Add New
                                                </button>
                                            )}
                                        </div>
                                        <select
                                            required
                                            value={purchaseFormData.vendorId}
                                            onChange={(e) => setPurchaseFormData((p) => ({
                                                ...p,
                                                vendorId: e.target.value,
                                                lineItems: [{ itemId: '', itemName: '', qty: '', price: '', unit: '' }],
                                            }))}
                                            className={selectCls}
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map((v) => (
                                                <option key={v._id} value={v._id}>
                                                    {v.fullName}{v.vendorType === 'INDIVIDUAL' ? ' (Individual)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {isIndividualVendor && (
                                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                                <Building2 size={11} /> Free-text charges
                                            </p>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1.5">Date *</p>
                                        <input
                                            type="date" required
                                            value={purchaseFormData.purchaseDate}
                                            onChange={(e) => setPurchaseFormData((p) => ({ ...p, purchaseDate: e.target.value }))}
                                            className={inputCls}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1.5">Status *</p>
                                        <select
                                            required
                                            value={purchaseFormData.paymentStatus}
                                            onChange={(e) => setPurchaseFormData((p) => ({ ...p, paymentStatus: e.target.value }))}
                                            className={selectCls}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PAID">Paid</option>
                                            <option value="PARTIALLY_PAID">Partial</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div>
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                                        <p className="text-xs font-medium text-gray-500">
                                            {isIndividualVendor ? 'Charge / Service Details' : 'Line Items'}
                                        </p>
                                        {!isIndividualVendor && (
                                            <button type="button" onClick={addLineItem} className={addNewBtn}>
                                                <Plus size={11} /> Add Item
                                            </button>
                                        )}
                                    </div>

                                    {/* Column headers */}
                                    <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: isIndividualVendor ? '1fr 5rem 6rem' : '1fr 5rem 6rem 2rem' }}>
                                        <p className="text-[11px] text-gray-400 font-medium">{isIndividualVendor ? 'Description' : 'Item'}</p>
                                        <p className="text-[11px] text-gray-400 font-medium text-center">Qty</p>
                                        <p className="text-[11px] text-gray-400 font-medium text-right">Price (₹)</p>
                                        {!isIndividualVendor && <span />}
                                    </div>

                                    <div className="space-y-2">
                                        {purchaseFormData.lineItems.map((line, idx) => (
                                            <div key={idx} className="grid gap-2 items-center" style={{ gridTemplateColumns: isIndividualVendor ? '1fr 5rem 6rem' : '1fr 5rem 6rem 2rem' }}>
                                                {/* Item / Description */}
                                                {isIndividualVendor ? (
                                                    <input
                                                        type="text" required
                                                        value={line.itemName || ''}
                                                        onChange={(e) => updateLineItem(idx, 'itemName', e.target.value)}
                                                        placeholder="e.g. Consulting fee"
                                                        className={inputCls}
                                                    />
                                                ) : (
                                                    <select required value={line.itemId} onChange={(e) => updateLineItem(idx, 'itemId', e.target.value)} className={selectCls}>
                                                        <option value="">Choose item…</option>
                                                        {items.map((item) => (
                                                            <option key={item._id} value={item._id}>{item.name} ({item.itemType})</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* Qty */}
                                                <input
                                                    type="number" min="1" required
                                                    value={line.qty}
                                                    onChange={(e) => updateLineItem(idx, 'qty', e.target.value)}
                                                    placeholder="1"
                                                    className={`${inputCls} text-center`}
                                                />

                                                {/* Price */}
                                                <input
                                                    type="number" min="0" required
                                                    value={line.price}
                                                    onChange={(e) => updateLineItem(idx, 'price', e.target.value)}
                                                    placeholder="0.00"
                                                    className={`${inputCls} text-right`}
                                                />

                                                {/* Remove */}
                                                {!isIndividualVendor && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLineItem(idx)}
                                                        disabled={purchaseFormData.lineItems.length === 1}
                                                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Running total */}
                                    {purchaseFormData.lineItems.length > 0 && (
                                        <div className="flex items-center justify-end gap-3 pt-3 mt-3 border-t border-gray-100">
                                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Estimated Total</span>
                                            <span className="text-sm font-semibold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Invoice Upload */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Invoice / Bill Copy (Optional)</p>
                                    <input
                                        type="file" accept="image/*,.pdf"
                                        onChange={(e) => setPurchaseFormData((p) => ({ ...p, proofFile: e.target.files[0] }))}
                                        className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="text-base font-semibold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
                                    <button type="submit" disabled={isLoading} className={primaryBtn}>
                                        {isLoading ? <Loader2 className="animate-spin" size={15} /> : 'Save Purchase'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const inputCls  = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors';
const selectCls = `${inputCls} appearance-none`;
const primaryBtn = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const cancelBtn  = 'px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors';
const addNewBtn  = 'inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-colors';