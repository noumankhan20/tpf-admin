'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, User, Building2, Search, ChevronDown, Phone, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ─── ID Type Config ────────────────────────────────────────────────────────────
const ID_TYPES = [
    { value: 'GST',     label: 'GST',          placeholder: '15-char GSTIN',            maxLen: 15 },
    { value: 'PAN',     label: 'PAN Card',     placeholder: '10-char PAN (ABCDE1234F)', maxLen: 10 },
    { value: 'AADHAAR', label: 'Aadhaar Card', placeholder: '12-digit Aadhaar',         maxLen: 12 },
    { value: 'OTHERS',  label: 'Others',       placeholder: 'Enter Document ID',         maxLen: 30 },
];
const INDIVIDUAL_ID_TYPES = ID_TYPES.filter((t) => t.value !== 'GST');

// ─── CSC API helpers ───────────────────────────────────────────────────────────
const CSC_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY || '';

const fetchStatesCSC = async () => {
    try {
        const res = await fetch('https://api.countrystatecity.in/v1/countries/IN/states', {
            headers: { "X-CSCAPI-KEY": "ZUVLUHhxTURNaHI4RU9WRmplUVhaaU9WeFVmbFNrVjltSUk5bFN0Mg==" },
        });
        if (!res.ok) throw new Error('CSC states failed');
        const data = await res.json();
        return data
            .map((s) => ({ name: s.name, isoCode: s.iso2 }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch {
        return [];
    }
};

const fetchCitiesCSC = async (stateIso) => {
    try {
        const res = await fetch(
            `https://api.countrystatecity.in/v1/countries/IN/states/${stateIso}/cities`,
            { headers: { "X-CSCAPI-KEY": "ZUVLUHhxTURNaHI4RU9WRmplUVhaaU9WeFVmbFNrVjltSUk5bFN0Mg==" } }
        );
        if (!res.ok) throw new Error('CSC cities failed');
        const data = await res.json();
        return data.map((c) => c.name).sort((a, b) => a.localeCompare(b));
    } catch {
        return [];
    }
};

// ─── Searchable Dropdown ───────────────────────────────────────────────────────
function SearchableDropdown({
    value, onChange, options, placeholder, disabled = false,
    label, renderOption, getLabel,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef(null);
    const inputRef = useRef(null);

    const filtered = query
        ? options.filter((o) =>
              (typeof o === 'string' ? o : getLabel(o))
                  .toLowerCase()
                  .includes(query.toLowerCase())
          )
        : options;

    const selectedLabel = value
        ? typeof options[0] === 'string'
            ? value
            : getLabel(options.find((o) => (typeof o === 'string' ? o : o.isoCode) === value) || {})
        : '';

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        if (disabled) return;
        setOpen(true);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className={`${inputCls} flex items-center justify-between text-left ${
                    disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${!value ? 'text-gray-400' : 'text-gray-900'}`}
            >
                <span className="truncate text-sm">
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.12 }}
                        className="absolute z-[200] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                    >
                        {/* Search */}
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={`Search ${label}...`}
                                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-48 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No results</p>
                            ) : (
                                filtered.map((opt, i) => {
                                    const optVal = typeof opt === 'string' ? opt : opt.isoCode;
                                    const optLabel = typeof opt === 'string' ? opt : getLabel(opt);
                                    const isSelected = optVal === value;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                onChange(optVal, opt);
                                                setOpen(false);
                                                setQuery('');
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                                                isSelected
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {renderOption ? renderOption(opt, isSelected) : optLabel}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function AddVendorModal({
    show, onClose,
    vendorFormData, setVendorFormData,
    vendorIdType, setVendorIdType,
    onSubmit, isLoading,
}) {
    const isIndividual     = vendorFormData.vendorType === 'INDIVIDUAL';
    const availableIdTypes = isIndividual ? INDIVIDUAL_ID_TYPES : ID_TYPES;
    const idTypeConfig     = availableIdTypes.find((t) => t.value === vendorIdType) || availableIdTypes[0];

    // CSC state
    const [states, setStates]           = useState([]);   // [{ name, isoCode }]
    const [cities, setCities]           = useState([]);   // string[]
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Load states on mount
    useEffect(() => {
        let cancelled = false;
        setLoadingStates(true);
        fetchStatesCSC().then((data) => {
            if (!cancelled) { setStates(data); setLoadingStates(false); }
        });
        return () => { cancelled = true; };
    }, []);

    // Load cities when state changes
    useEffect(() => {
        if (!vendorFormData.stateIso) { setCities([]); return; }
        let cancelled = false;
        setLoadingCities(true);
        fetchCitiesCSC(vendorFormData.stateIso).then((data) => {
            if (!cancelled) { setCities(data); setLoadingCities(false); }
        });
        return () => { cancelled = true; };
    }, [vendorFormData.stateIso]);

    const handleVendorTypeChange = (type) => {
        setVendorFormData((p) => ({ ...p, vendorType: type, vendorGST: '' }));
        if (type === 'INDIVIDUAL' && vendorIdType === 'GST') setVendorIdType('PAN');
    };

    const handleStateChange = (isoCode, stateObj) => {
        setVendorFormData((p) => ({
            ...p,
            state: stateObj?.name || isoCode,
            stateIso: isoCode,
            city: '',
        }));
    };

    const handleCityChange = (city) => {
        setVendorFormData((p) => ({ ...p, city }));
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

    const update = (field) => (e) =>
        setVendorFormData((p) => ({ ...p, [field]: e.target.value }));

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
                        className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-200/80"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Add Vendor</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Supplier information for procurement</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 overflow-y-auto flex-1">

                            {/* ── Vendor Type ── */}
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

                            {/* ── Name + Primary Contact ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label={isIndividual ? 'Full Name *' : 'Company Name *'}>
                                    <input
                                        required type="text"
                                        placeholder={isIndividual ? 'e.g. Ramesh Kumar' : 'e.g. MedPlus Essentials'}
                                        value={vendorFormData.fullName}
                                        onChange={update('fullName')}
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Contact Number *">
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            required type="tel" maxLength={10} placeholder="10-digit number"
                                            value={vendorFormData.contactNumber}
                                            onChange={update('contactNumber')}
                                            className={`${inputCls} pl-8`}
                                        />
                                    </div>
                                </Field>
                            </div>

                            {/* ── Alternate Contact + Email ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Alternate Contact">
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="tel" maxLength={10} placeholder="Optional"
                                            value={vendorFormData.alternateContact || ''}
                                            onChange={update('alternateContact')}
                                            className={`${inputCls} pl-8`}
                                        />
                                    </div>
                                </Field>
                                <Field label="Email">
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="email" placeholder="vendor@email.com"
                                            value={vendorFormData.email || ''}
                                            onChange={update('email')}
                                            className={`${inputCls} pl-8`}
                                        />
                                    </div>
                                </Field>
                            </div>

                            {/* ── ID Document ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Document Type *">
                                    <select
                                        value={vendorIdType}
                                        onChange={(e) => handleIdTypeChange(e.target.value)}
                                        className={inputCls}
                                    >
                                        {availableIdTypes.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
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

                            {/* ── State + City (CSC searchable) ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="State *">
                                    {loadingStates ? (
                                        <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span className="text-xs">Loading states…</span>
                                        </div>
                                    ) : (
                                        <SearchableDropdown
                                            value={vendorFormData.stateIso || ''}
                                            onChange={handleStateChange}
                                            options={states}
                                            placeholder="Select State"
                                            label="state"
                                            getLabel={(o) => o.name || ''}
                                            renderOption={(o, selected) => (
                                                <span className={selected ? 'font-medium' : ''}>{o.name}</span>
                                            )}
                                        />
                                    )}
                                </Field>
                                <Field label="City *">
                                    {loadingCities ? (
                                        <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span className="text-xs">Loading cities…</span>
                                        </div>
                                    ) : (
                                        <SearchableDropdown
                                            value={vendorFormData.city || ''}
                                            onChange={handleCityChange}
                                            options={cities}
                                            placeholder={vendorFormData.stateIso ? 'Select City' : 'Select state first'}
                                            disabled={!vendorFormData.stateIso || loadingCities}
                                            label="city"
                                            getLabel={(o) => o}
                                        />
                                    )}
                                </Field>
                            </div>

                            {/* ── Address ── */}
                            <Field label="Full Address *">
                                <textarea
                                    required rows={3} placeholder="Enter complete address…"
                                    value={vendorFormData.fullAddress}
                                    onChange={update('fullAddress')}
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-end gap-3">
                            <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
                            <button onClick={onSubmit} disabled={isLoading} className={primaryBtn}>
                                {isLoading
                                    ? <Loader2 className="animate-spin" size={15} />
                                    : `Save ${isIndividual ? 'Individual' : 'Business'} Vendor`}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2.5 bg-white border border-gray-400 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-600 focus:ring-0 transition-colors';
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