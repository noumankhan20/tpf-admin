'use client';

import React from 'react';
import { X, Loader2, User, Building2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { INDIAN_LOCATIONS } from '@/utils/locations';

const ID_TYPES = [
    { value: 'GST',     label: 'GST',          placeholder: '15-char GSTIN',            maxLen: 15 },
    { value: 'PAN',     label: 'PAN Card',     placeholder: '10-char PAN (ABCDE1234F)', maxLen: 10 },
    { value: 'AADHAAR', label: 'Aadhaar Card', placeholder: '12-digit Aadhaar',         maxLen: 12 },
    { value: 'OTHERS',  label: 'Others',       placeholder: 'Enter Document ID',         maxLen: 30 },
];

const INDIVIDUAL_ID_TYPES = ID_TYPES.filter((t) => t.value !== 'GST');

export default function AddVendorModal({
    show, onClose,
    vendorFormData, setVendorFormData,
    vendorIdType, setVendorIdType,
    states, apiCities, isLoadingCities, triggerGetCities,
    onSubmit, isLoading,
}) {
    const isIndividual     = vendorFormData.vendorType === 'INDIVIDUAL';
    const availableIdTypes = isIndividual ? INDIVIDUAL_ID_TYPES : ID_TYPES;
    const idTypeConfig     = availableIdTypes.find((t) => t.value === vendorIdType) || availableIdTypes[0];

    const handleVendorTypeChange = (type) => {
        setVendorFormData((p) => ({ ...p, vendorType: type, vendorGST: '' }));
        if (type === 'INDIVIDUAL' && vendorIdType === 'GST') setVendorIdType('PAN');
    };

    const handleStateChange = (newState) => {
        setVendorFormData((p) => ({ ...p, state: newState, city: '' }));
        if (newState) triggerGetCities(newState);
    };

    const handleIdTypeChange = (type) => {
        setVendorIdType(type);
        setVendorFormData((p) => ({ ...p, vendorGST: '' }));
    };

    const handleIdValueChange = (e) => {
        let val = e.target.value;
        if (vendorIdType === 'AADHAAR') val = val.replace(/\D/g, '');
        setVendorFormData((p) => ({ ...p, vendorGST: val }));
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
                        className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200/80"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Add Vendor</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Supplier information for procurement</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 overflow-y-auto flex-1">

                            {/* Vendor Type */}
                            <div>
                                <Label>Vendor Type *</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1.5">
                                    {[
                                        { type: 'NORMAL',     Icon: Building2, title: 'Business',   sub: 'Company / Firm'      },
                                        { type: 'INDIVIDUAL', Icon: User,       title: 'Individual', sub: 'Person / Freelancer' },
                                    ].map(({ type, Icon, title, sub }) => {
                                        const active = isIndividual ? type === 'INDIVIDUAL' : type === 'NORMAL';
                                        return (
                                            <button
                                                key={type} type="button"
                                                onClick={() => handleVendorTypeChange(type)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                                    active
                                                        ? 'border-gray-900 bg-gray-50 text-gray-900'
                                                        : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                                                }`}
                                            >
                                                <Icon size={16} className={active ? 'text-gray-900' : 'text-gray-400'} />
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{title}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {isIndividual && (
                                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                        Individual vendors use free-text descriptions in purchases — no inventory items required.
                                    </p>
                                )}
                            </div>

                            {/* Name + Contact */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label={isIndividual ? 'Full Name *' : 'Company Name *'}>
                                    <input
                                        required type="text"
                                        placeholder={isIndividual ? 'e.g. Ramesh Kumar' : 'e.g. MedPlus Essentials'}
                                        value={vendorFormData.fullName}
                                        onChange={(e) => setVendorFormData((p) => ({ ...p, fullName: e.target.value }))}
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Contact Number *">
                                    <input
                                        required type="tel" maxLength={10} placeholder="10-digit number"
                                        value={vendorFormData.contactNumber}
                                        onChange={(e) => setVendorFormData((p) => ({ ...p, contactNumber: e.target.value }))}
                                        className={inputCls}
                                    />
                                </Field>
                            </div>

                            {/* ID Document */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Document Type *">
                                    <select value={vendorIdType} onChange={(e) => handleIdTypeChange(e.target.value)} className={inputCls}>
                                        {availableIdTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </Field>
                                <Field label={`${idTypeConfig.label} Number *`}>
                                    <input
                                        required type="text"
                                        placeholder={idTypeConfig.placeholder}
                                        maxLength={idTypeConfig.maxLen}
                                        value={vendorFormData.vendorGST}
                                        onChange={handleIdValueChange}
                                        className={`${inputCls} uppercase`}
                                    />
                                </Field>
                            </div>

                            {/* State + City */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="State *">
                                    <select required value={vendorFormData.state} onChange={(e) => handleStateChange(e.target.value)} className={inputCls}>
                                        <option value="">Select State</option>
                                        {states.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>
                                <Field label="City *">
                                    <select
                                        required disabled={!vendorFormData.state || isLoadingCities}
                                        value={vendorFormData.city}
                                        onChange={(e) => setVendorFormData((p) => ({ ...p, city: e.target.value }))}
                                        className={`${inputCls} disabled:opacity-40`}
                                    >
                                        <option value="">{isLoadingCities ? 'Loading…' : 'Select City'}</option>
                                        {(apiCities || (vendorFormData.state && INDIAN_LOCATIONS[vendorFormData.state]) || []).map(
                                            (city) => <option key={city} value={city}>{city}</option>
                                        )}
                                    </select>
                                </Field>
                            </div>

                            {/* Address */}
                            <Field label="Full Address *">
                                <textarea
                                    required rows={3} placeholder="Enter complete address…"
                                    value={vendorFormData.fullAddress}
                                    onChange={(e) => setVendorFormData((p) => ({ ...p, fullAddress: e.target.value }))}
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-3">
                            <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
                            <button onClick={onSubmit} disabled={isLoading} className={primaryBtn}>
                                {isLoading ? <Loader2 className="animate-spin" size={15} /> : `Save ${isIndividual ? 'Individual' : 'Business'} Vendor`}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2.5 bg-white border border-gray-400 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors';
const primaryBtn = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const cancelBtn  = 'px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors';

function Label({ children }) {
    return <p className="text-xs font-bold text-gray-700 mb-1.5">{children}</p>;
}

function Field({ label, children }) {
    return (
        <div>
            <Label>{label}</Label>
            {children}
        </div>
    );
}