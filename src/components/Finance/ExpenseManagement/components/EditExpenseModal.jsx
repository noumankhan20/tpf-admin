'use client';

import React from 'react';
import {
    X, IndianRupee, Receipt, Calendar, Clock, User, Users,
    Package, FileText, Building2, Loader2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchableDropdown from './SearchableDropdown';
import { EXPENSE_TYPES, PAYMENT_METHODS } from '../utils/expenseHelpers';
import { usePaginatedDropdown } from '../hooks/useExpenseForm';

export default function EditExpenseModal({
    show, onClose,
    formData, setFormData, setField,
    handleSubmit, isUpdating,
    admins, campaigns, purchases, vendors, agreements, volunteers, approvedVouchers,
}) {
    const adminDD     = usePaginatedDropdown(admins,     (a, q) => a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q),       (a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    const campaignDD  = usePaginatedDropdown(campaigns,  (c, q) => c.title?.toLowerCase().includes(q),                                                  (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    const purchaseDD  = usePaginatedDropdown(purchases,  (p, q) => (p.vendorId?.fullName?.toLowerCase() || '').includes(q) || p.totalAmount?.toString().includes(q), (a, b) => new Date(b.purchaseDate || b.createdAt || 0) - new Date(a.purchaseDate || a.createdAt || 0));
    const volunteerDD = usePaginatedDropdown(volunteers, (v, q) => v.fullName?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q),         (a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    const vendorDD    = usePaginatedDropdown(vendors,    (v, q) => v.fullName?.toLowerCase().includes(q) || v.contactNumber?.includes(q),               (a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    const agreementDD = usePaginatedDropdown(agreements, (a, q) => a.title?.toLowerCase().includes(q) || a.parties?.[0]?.name?.toLowerCase().includes(q), (a, b) => (a.title || '').localeCompare(b.title || ''));

    const selectedAdmin     = admins.find((a) => a._id === formData.adminId);
    const selectedCampaign  = campaigns.find((c) => c._id === formData.campaignId);
    const selectedPurchase  = purchases.find((p) => p._id === formData.purchaseId);
    const selectedVolunteer = volunteers.find((v) => v._id === formData.volunteerId);
    const selectedVendor    = vendors.find((v) => v._id === formData.vendorId);
    const selectedAgreement = agreements.find((a) => a._id === formData.agreementId);

    const showCampaign =
        formData.expenseType === 'BENEFICIARY' ||
        (formData.expenseType === 'SALARY' && formData.adminId) ||
        (formData.expenseType === 'REIMBURSEMENT' && (formData.adminId || formData.volunteerId));

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200/80"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Edit Expense</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Update the expense entry details</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">

                                {/* Expense Type */}
                                <Field label="Expense Type *">
                                    <select required value={formData.expenseType} onChange={(e) => setField('expenseType', e.target.value)} className={selectCls}>
                                        {EXPENSE_TYPES.filter((t) => t.value !== 'ALL').map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Amount + Method */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Amount (₹) *">
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                            <input type="number" required value={formData.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="0.00" className={`${inputCls} pl-9 font-semibold`} />
                                        </div>
                                    </Field>
                                    <Field label="Payment Method *">
                                        <div className="relative">
                                            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                                            <select required value={formData.paymentMethod} onChange={(e) => setField('paymentMethod', e.target.value)} className={`${selectCls} pl-9`}>
                                                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </div>
                                    </Field>
                                </div>

                                {/* Date + Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Date *">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                                            <input type="date" required value={formData.transactionDate} onChange={(e) => setField('transactionDate', e.target.value)} className={`${inputCls} pl-9`} />
                                        </div>
                                    </Field>
                                    <Field label="Time (Optional)">
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                                            <input type="time" value={formData.transactionTime} onChange={(e) => setField('transactionTime', e.target.value)} className={`${inputCls} pl-9`} />
                                        </div>
                                    </Field>
                                </div>

                                {/* Description */}
                                <Field label="Description *">
                                    <textarea required rows={2} value={formData.description} onChange={(e) => setField('description', e.target.value)} placeholder="What was this expense for?" className={`${inputCls} resize-none`} />
                                </Field>

                                {/* SALARY */}
                                {formData.expenseType === 'SALARY' && (
                                    <Field label="Employee *">
                                        <DD dd={adminDD} icon={<User size={15} />} placeholder="Choose Employee"
                                            selectedLabel={selectedAdmin ? `${selectedAdmin.fullName} (${selectedAdmin.email})` : null}
                                            required hiddenValue={formData.adminId}
                                            items={adminDD.paginated.map((a) => ({ id: a._id, label: `${a.fullName} (${a.email})` }))}
                                            selectedId={formData.adminId}
                                            onSelect={(id) => { setField('adminId', id); adminDD.setOpen(false); }}
                                            emptyMessage="No employees found."
                                        />
                                    </Field>
                                )}

                                {/* CAMPAIGN */}
                                {showCampaign && (
                                    <Field label={`Campaign${formData.expenseType !== 'BENEFICIARY' ? ' (Optional)' : ' *'}`}>
                                        <DD dd={campaignDD} icon={<Users size={15} />} placeholder="Choose Campaign"
                                            selectedLabel={selectedCampaign?.title || null}
                                            required={formData.expenseType === 'BENEFICIARY'} hiddenValue={formData.campaignId}
                                            items={campaignDD.paginated.map((c) => ({ id: c._id, label: c.title }))}
                                            selectedId={formData.campaignId}
                                            onSelect={(id) => { setField('campaignId', id); campaignDD.setOpen(false); }}
                                            emptyMessage="No campaigns found."
                                        />
                                    </Field>
                                )}

                                {/* PURCHASE */}
                                {formData.expenseType === 'PURCHASE' && (
                                    <Field label="Link Purchase *">
                                        <DD dd={purchaseDD} icon={<Package size={15} />} placeholder="Choose Purchase"
                                            selectedLabel={selectedPurchase ? `${selectedPurchase.vendorId?.fullName || 'Unknown'} — ₹${selectedPurchase.totalAmount}` : null}
                                            required hiddenValue={formData.purchaseId}
                                            items={purchaseDD.paginated.map((p) => ({ id: p._id, label: `${p.vendorId?.fullName || 'Unknown'} — ₹${p.totalAmount}` }))}
                                            selectedId={formData.purchaseId}
                                            onSelect={(id) => { setField('purchaseId', id); purchaseDD.setOpen(false); }}
                                            emptyMessage="No purchases found."
                                        />
                                    </Field>
                                )}

                                {/* DOCUMENTATION SERVICE */}
                                {formData.expenseType === 'DOCUMENTATION_SERVICE' && (
                                    <Field label="Agreement *">
                                        <DD dd={agreementDD} icon={<FileText size={15} />} placeholder="Choose Agreement"
                                            selectedLabel={selectedAgreement ? `${selectedAgreement.title} — ${selectedAgreement.parties?.[0]?.name || 'Unknown'}` : null}
                                            required hiddenValue={formData.agreementId}
                                            items={agreementDD.paginated.map((a) => ({ id: a._id, label: `${a.title} — ${a.parties?.[0]?.name || 'Unknown'}` }))}
                                            selectedId={formData.agreementId}
                                            onSelect={(id) => { setField('agreementId', id); agreementDD.setOpen(false); }}
                                            emptyMessage="No agreements found."
                                        />
                                    </Field>
                                )}

                                {/* REIMBURSEMENT */}
                                {formData.expenseType === 'REIMBURSEMENT' && (
                                    <>
                                        <Field label="Reimburse To *">
                                            <select required value={formData.reimbursementType} onChange={(e) => setField('reimbursementType', e.target.value)} className={selectCls}>
                                                <option value="ADMIN">Admin</option>
                                                <option value="VOLUNTEER">Volunteer</option>
                                            </select>
                                        </Field>
                                        {formData.reimbursementType === 'ADMIN' ? (
                                            <Field label="Select Employee *">
                                                <DD dd={adminDD} icon={<User size={15} />} placeholder="Choose Employee"
                                                    selectedLabel={selectedAdmin ? `${selectedAdmin.fullName} (${selectedAdmin.email})` : null}
                                                    required hiddenValue={formData.adminId}
                                                    items={adminDD.paginated.map((a) => ({ id: a._id, label: `${a.fullName} (${a.email})` }))}
                                                    selectedId={formData.adminId}
                                                    onSelect={(id) => { setField('adminId', id); adminDD.setOpen(false); }}
                                                    emptyMessage="No admins found."
                                                />
                                            </Field>
                                        ) : (
                                            <Field label="Select Volunteer *">
                                                <DD dd={volunteerDD} icon={<Users size={15} />} placeholder="Choose Volunteer"
                                                    selectedLabel={selectedVolunteer ? `${selectedVolunteer.fullName} (${selectedVolunteer.email})` : null}
                                                    required hiddenValue={formData.volunteerId}
                                                    items={volunteerDD.paginated.map((v) => ({ id: v._id, label: `${v.fullName} (${v.email})` }))}
                                                    selectedId={formData.volunteerId}
                                                    onSelect={(id) => { setFormData((p) => ({ ...p, volunteerId: id, voucherId: '' })); volunteerDD.setOpen(false); }}
                                                    emptyMessage="No volunteers found."
                                                    searchPlaceholder="Search volunteer name or email…"
                                                />
                                            </Field>
                                        )}
                                    </>
                                )}

                                {/* OPERATIONAL / OTHER: Optional Vendor */}
                                {(formData.expenseType === 'OPERATIONAL' || formData.expenseType === 'OTHER') && (
                                    <Field label="Vendor (Optional)">
                                        <DD dd={vendorDD} icon={<Building2 size={15} />} placeholder="Choose Vendor"
                                            selectedLabel={selectedVendor?.fullName || null}
                                            items={vendorDD.paginated.map((v) => ({ id: v._id, label: v.fullName }))}
                                            selectedId={formData.vendorId}
                                            onSelect={(id) => { setField('vendorId', id); vendorDD.setOpen(false); }}
                                            emptyMessage="No vendors found."
                                            searchPlaceholder="Search by vendor name or contact…"
                                        />
                                    </Field>
                                )}

                                {/* Divider */}
                                <div className="border-t border-gray-100 pt-4 space-y-4">
                                    <Field label="Transaction ID (Optional)">
                                        <input type="text" value={formData.transactionId} onChange={(e) => setField('transactionId', e.target.value)} placeholder="e.g. TXN123456" className={inputCls} />
                                    </Field>
                                    <Field label="Notes (Optional)">
                                        <textarea rows={2} value={formData.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Any additional information…" className={`${inputCls} resize-none`} />
                                    </Field>
                                    <Field label="Replace Proof (Optional)">
                                        <p className="text-xs text-gray-400 mb-1.5">Leave empty to keep the existing proof document.</p>
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => setField('proofFile', e.target.files[0])}
                                            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-3">
                                <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
                                <button type="submit" disabled={isUpdating} className={primaryBtn}>
                                    {isUpdating ? <Loader2 className="animate-spin" size={15} /> : 'Update Expense'}
                                </button>
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

function Field({ label, children }) {
    return (
        <div>
            <p className="text-xs font-medium text-black mb-1.5">{label}</p>
            {children}
        </div>
    );
}

function DD({ dd, icon, placeholder, selectedLabel, required, hiddenValue, items, selectedId, onSelect, emptyMessage, searchPlaceholder = 'Search…' }) {
    return (
        <SearchableDropdown
            dropdownRef={dd.ref} open={dd.open} onToggle={() => dd.setOpen((p) => !p)}
            icon={icon} placeholder={placeholder} selectedLabel={selectedLabel}
            required={required} hiddenValue={hiddenValue}
            search={dd.search} onSearchChange={(v) => { dd.setSearch(v); dd.setPage(1); }}
            searchPlaceholder={searchPlaceholder}
            page={dd.page} totalPages={dd.totalPages} onPageChange={dd.setPage}
            items={items} selectedId={selectedId} onSelect={onSelect} emptyMessage={emptyMessage}
        />
    );
}