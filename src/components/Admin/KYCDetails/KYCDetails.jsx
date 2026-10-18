'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../Common/NotificationBell';
import { formatFieldValue } from '@/utils/formatters';
import {
    ArrowLeft, Search, CheckCircle, XCircle, MapPin, CreditCard, Phone, Mail, Clock, FileText, Calendar,
    X as XIcon, RefreshCw, Printer, ChevronLeft, ChevronRight, SortAsc, SortDesc, SlidersHorizontal, ShieldCheck, Copy, Cake,
    Briefcase, Droplet, User as UserIcon, Hash, IndianRupee, Star, ListChecks,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetKycRequestsQuery, useUpdateKycStatusMutation } from '@/utils/slices/kycApiSlice';

/* ---------- helpers ---------- */
const clean = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).trim();
    return s;
};
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const ageOf = (d) => {
    if (!d) return null;
    const b = new Date(d);
    if (Number.isNaN(b.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age -= 1;
    return age >= 0 && age < 130 ? age : null;
};
const initialsOf = (name) =>
    (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

// Everything we know about a user, merging the KYC form with the account profile
const profileOf = (u) => {
    const k = u?.kycDetails || {};
    const dob = k.dateOfBirth || u?.dob;
    return {
        name: clean(k.fullLegalName) || clean(u?.fullName),
        accountName: clean(u?.fullName),
        pan: clean(k.panNumber).toUpperCase(),
        panVerified: !!k.panVerified,
        dob,
        age: ageOf(dob),
        gender: clean(k.gender) || clean(u?.gender),
        bloodGroup: clean(u?.bloodGroup),
        profession: clean(k.profession) || clean(u?.profession),
        mobile: clean(k.phoneNumber) || clean(u?.mobileNo),
        accountMobile: clean(u?.mobileNo),
        email: clean(k.email) || clean(u?.email),
        address: clean(k.address) || clean(u?.address),
        city: clean(k.city),
        state: clean(k.state),
        pincode: clean(k.pincode),
        status: k.status || 'pending',
        submittedAt: k.submittedAt,
        verifiedAt: k.verifiedAt,
        remarks: clean(k.remarks),
        registeredAt: u?.createdDate,
        permanentMember: !!u?.permanentMember,
        totalDonated: u?.donationStats?.totalAmount || 0,
        cardNo: `KYC-${String(u?._id || '').slice(-8).toUpperCase()}`,
    };
};

const STATUS = {
    verified: { label: 'Verified', chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', stamp: 'border-emerald-300 text-emerald-200', dot: 'bg-emerald-500' },
    pending: { label: 'Pending', chip: 'bg-amber-100 text-amber-700 border-amber-200', stamp: 'border-amber-300 text-amber-200', dot: 'bg-amber-500' },
    rejected: { label: 'Rejected', chip: 'bg-red-100 text-red-700 border-red-200', stamp: 'border-red-300 text-red-200', dot: 'bg-red-500' },
};

/* ---------- page ---------- */
export default function KYCVerificationPage() {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortOrder, setSortOrder] = useState('desc');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', state: '', city: '' });
    const setFilter = (key, val) => {
        // picking a different state clears the city so the two never disagree
        setFilters((prev) => ({ ...prev, [key]: val, ...(key === 'state' ? { city: '' } : {}) }));
        setCurrentPage(1);
    };
    const activeFilters = Object.entries(filters).filter(([, v]) => v !== '');
    const FILTER_LABELS = { dateFrom: 'Submitted from', dateTo: 'Submitted to', state: 'State', city: 'City' };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
            setCurrentPage(1);
        }, 450);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: kycData, isLoading, isFetching } = useGetKycRequestsQuery({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: debouncedSearch,
        sortOrder,
        ...Object.fromEntries(activeFilters),
    });
    const [updateStatus, { isLoading: isUpdating }] = useUpdateKycStatusMutation();

    const users = useMemo(() => kycData?.data || [], [kycData]);
    const totalCount = kycData?.total || 0;
    const totalPages = kycData?.totalPages || 1;
    const stats = kycData?.stats || { pending: 0, verified: 0, rejected: 0 };
    const allCount = stats.pending + stats.verified + stats.rejected;
    const stateOptions = kycData?.filterOptions?.states || [];
    const cityOptions = kycData?.filterOptions?.cities || [];
    const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalCount);

    const select = (u) => { setSelectedUser(u); setIsRejecting(false); setRejectReason(''); };

    const handleApprove = async (id) => {
        try {
            await updateStatus({ id, status: 'verified' }).unwrap();
            setSelectedUser(null);
            toast.success('KYC Approved Successfully!');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to approve KYC');
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.warning('Please enter a reason for rejection.');
            return;
        }
        try {
            await updateStatus({ id, status: 'rejected', remarks: rejectReason }).unwrap();
            setIsRejecting(false);
            setRejectReason('');
            setSelectedUser(null);
            toast.success('KYC Rejected Successfully!');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to reject KYC');
        }
    };

    const tabs = [
        { key: 'all', label: 'All', count: allCount },
        { key: 'pending', label: 'Pending', count: stats.pending },
        { key: 'verified', label: 'Verified', count: stats.verified },
        { key: 'rejected', label: 'Rejected', count: stats.rejected },
    ];

    const printStyles = `
  @media print {
    @page { margin: 12mm; size: A4; }
    html, body { visibility: hidden; height: auto !important; margin: 0 !important; padding: 0 !important; background: white; }
    #printable-form { visibility: visible; position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 0 !important; background: white; z-index: 9999; }
    #printable-form * { visibility: visible; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-break-all { word-break: break-all; overflow-wrap: break-word; }
    .no-print, header, button { display: none !important; }
    .avoid-break { break-inside: avoid; page-break-inside: avoid; }
  }
`;

    // Esc closes the open card
    React.useEffect(() => {
        if (!selectedUser) return;
        const onKey = (e) => { if (e.key === 'Escape') setSelectedUser(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedUser]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100 font-sans flex flex-col">
            <style>{printStyles}</style>

            <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 backdrop-blur border-b border-slate-200 shrink-0 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button onClick={() => (selectedUser ? setSelectedUser(null) : router.back())} aria-label={selectedUser ? 'Back to list' : 'Go back'} className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">KYC Verification</h1>
                        <p className="hidden sm:block text-xs text-slate-500">Review identity details and approve or reject</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {isFetching && <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" aria-label="Refreshing" />}
                    <NotificationBell moduleFilter="KYC" />
                </div>
            </header>

            <main className="flex-1 p-4 md:px-6 md:pt-3 md:pb-4 max-w-[1600px] mx-auto w-full">
                <AnimatePresence mode="wait" initial={false}>
                    {selectedUser ? (
                        <motion.div
                            key="detail"
                            id="printable-form"
                            initial={{ opacity: 0, y: 18, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.99 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-6xl mx-auto"
                        >
                            <Detail
                                user={selectedUser}
                                onClose={() => setSelectedUser(null)}
                                isRejecting={isRejecting}
                                setIsRejecting={setIsRejecting}
                                rejectReason={rejectReason}
                                setRejectReason={setRejectReason}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                isUpdating={isUpdating}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.22 }}
                            className="no-print"
                        >
                            {/* Status tabs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" role="tablist" aria-label="KYC status">
                                {tabs.map((t) => {
                                    const active = statusFilter === t.key;
                                    const tone = { all: 'text-blue-600 bg-blue-50', pending: 'text-amber-600 bg-amber-50', verified: 'text-emerald-600 bg-emerald-50', rejected: 'text-red-600 bg-red-50' }[t.key];
                                    const Icon = { all: FileText, pending: Clock, verified: CheckCircle, rejected: XCircle }[t.key];
                                    return (
                                        <button
                                            key={t.key}
                                            role="tab"
                                            aria-selected={active}
                                            onClick={() => { setStatusFilter(t.key); setCurrentPage(1); }}
                                            className={`text-left bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${active ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 hover:shadow-md'}`}
                                        >
                                            <span className={`w-10 h-10 rounded-xl grid place-items-center ${tone}`}><Icon className="w-5 h-5" aria-hidden /></span>
                                            <span>
                                                <span className="block text-2xl font-bold text-slate-900 leading-none">{t.count}</span>
                                                <span className="text-xs font-medium uppercase text-slate-500">{t.label}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
                                        <label htmlFor="kyc-search" className="sr-only">Search KYC requests</label>
                                        <input
                                            id="kyc-search"
                                            type="text"
                                            placeholder="Search name, PAN, mobile or email"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-9 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"><XIcon className="w-3.5 h-3.5" /></button>
                                        )}
                                    </div>
                                    <button onClick={() => setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" aria-hidden /> : <SortDesc className="w-4 h-4" aria-hidden />}
                                        {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
                                    </button>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setIsFilterOpen((v) => !v)}
                                        aria-expanded={isFilterOpen}
                                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${isFilterOpen || activeFilters.length ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <SlidersHorizontal className="w-4 h-4" aria-hidden /> Date, state &amp; city
                                        {activeFilters.length > 0 && <span className="w-5 h-5 bg-emerald-600 text-white text-xs rounded-full grid place-items-center">{activeFilters.length}</span>}
                                    </button>
                                    <div className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600" role="group" aria-label="Rows per page">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Show</span>
                                        {[10, 50, 100].map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => { setPageSize(size); setCurrentPage(1); }}
                                                aria-pressed={pageSize === size}
                                                className={`min-w-[2.75rem] px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer transition-colors ${pageSize === size ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isFilterOpen && (
                                    <div className="mt-3 border border-slate-200 rounded-2xl bg-slate-50/70 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label htmlFor="kyc-from" className="block text-xs font-semibold text-slate-500 mb-1.5">Submitted from</label>
                                            <input id="kyc-from" type="date" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(e) => setFilter('dateFrom', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="kyc-to" className="block text-xs font-semibold text-slate-500 mb-1.5">Submitted to</label>
                                            <input id="kyc-to" type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(e) => setFilter('dateTo', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="kyc-state" className="block text-xs font-semibold text-slate-500 mb-1.5">State</label>
                                            <select id="kyc-state" value={filters.state} onChange={(e) => setFilter('state', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                                <option value="">All states</option>
                                                {stateOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="kyc-city" className="block text-xs font-semibold text-slate-500 mb-1.5">City</label>
                                            <select id="kyc-city" value={filters.city} onChange={(e) => setFilter('city', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                                <option value="">{filters.state ? `All cities in ${filters.state}` : 'All cities'}</option>
                                                {cityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeFilters.length > 0 && (
                                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                        {activeFilters.map(([key, value]) => (
                                            <span key={key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium">
                                                {FILTER_LABELS[key]}: {value}
                                                <button type="button" onClick={() => setFilter(key, '')} aria-label={`Remove ${FILTER_LABELS[key]} filter`} className="p-0.5 rounded-full hover:bg-emerald-200 cursor-pointer"><XIcon className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                        <button type="button" onClick={() => { setFilters({ dateFrom: '', dateTo: '', state: '', city: '' }); setCurrentPage(1); }} className="text-xs font-semibold text-red-600 hover:underline cursor-pointer px-1">Reset filters</button>
                                    </div>
                                )}

                                <p className="mt-3 text-xs text-slate-500">{totalCount === 0 ? 'No requests match' : `Showing ${startIndex}–${endIndex} of ${totalCount} · pending first, then verified, then rejected · click a person to open their identity card`}</p>

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {isLoading ? (
                                        <p className="col-span-full text-center text-slate-500 p-10">Loading...</p>
                                    ) : users.length === 0 ? (
                                        <div className="col-span-full text-center text-slate-500 p-10">
                                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" aria-hidden />
                                            <p>No records found</p>
                                        </div>
                                    ) : (
                                        users.map((u) => {
                                            const p = profileOf(u);
                                            return (
                                                <button
                                                    key={u._id}
                                                    onClick={() => select(u)}
                                                    className="text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="relative shrink-0">
                                                            <span className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white grid place-items-center text-sm font-bold">{initialsOf(p.name)}</span>
                                                            <span className={`absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${(STATUS[p.status] || STATUS.pending).dot}`} />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block font-semibold text-slate-900 truncate">{formatFieldValue('name', p.name) || 'Unnamed'}</span>
                                                            <span className="block text-xs text-slate-500 font-mono truncate">{p.pan || '—'}</span>
                                                        </span>
                                                        <StatusChip status={p.status} />
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                                        <span className="inline-flex items-center gap-1.5 truncate"><Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />{p.mobile || '—'}</span>
                                                        <span className="inline-flex items-center gap-1.5 truncate"><Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />{fmtDate(p.submittedAt) || 'N/A'}</span>
                                                        <span className="inline-flex items-center gap-1.5 truncate col-span-2"><MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />{[p.city, p.state].filter(Boolean).join(', ') || 'No location'}</span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 fab-avoid">
                                        <PageBtn label="Previous page" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} icon={<ChevronLeft size={16} />} />
                                        <span className="text-sm font-medium px-2">Page {currentPage} of {totalPages}</span>
                                        <PageBtn label="Next page" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} icon={<ChevronRight size={16} />} />
                                    </div>
                                )}
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

/* ---------- identity card + full details ---------- */
function copyText(value, label) {
    if (!value) return;
    navigator.clipboard?.writeText(value).then(() => toast.success(`${label} copied`, { autoClose: 1200 }));
}

// Decorative barcode derived from the card number so each card looks different
function Barcode({ seed }) {
    const bars = Array.from(seed).flatMap((ch, i) => {
        const c = ch.charCodeAt(0);
        return [1 + (c % 3), 1 + ((c + i) % 2)];
    });
    return (
        <div className="flex items-end h-6 gap-[2px]" aria-hidden>
            {bars.map((w, i) => (
                <span key={i} className={i % 2 === 0 ? 'bg-white/90' : 'bg-transparent'} style={{ width: `${w * 2}px`, height: '100%' }} />
            ))}
        </div>
    );
}

function CardField({ icon: Icon, label, value, mono, span = '', copy }) {
    return (
        <div className={span}>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                {Icon && <Icon className="w-3 h-3" aria-hidden />} {label}
            </p>
            <p className={`mt-0.5 text-sm font-semibold text-white print-break-all ${mono ? 'font-mono tracking-wider' : ''}`}>
                {value || <span className="font-normal italic text-white/40">Not provided</span>}
                {copy && value && (
                    <button onClick={() => copyText(value, label)} aria-label={`Copy ${label}`} className="no-print ml-2 align-middle p-1 rounded hover:bg-white/15 text-emerald-100 cursor-pointer"><Copy size={12} /></button>
                )}
            </p>
        </div>
    );
}

function Detail({ user, onClose, isRejecting, setIsRejecting, rejectReason, setRejectReason, onApprove, onReject, isUpdating }) {
    const p = profileOf(user);
    const st = STATUS[p.status] || STATUS.pending;
    const address = [p.address, p.city, p.state, p.pincode].filter(Boolean).join(', ');

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between no-print">
                <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" aria-hidden /> Back to all requests <span className="hidden sm:inline text-xs font-normal text-slate-400">(Esc)</span>
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer" title="Print">
                    <Printer size={16} aria-hidden /> Print
                </button>
            </div>

            {/* The ID card */}
            <div
                className="avoid-break relative overflow-hidden rounded-2xl md:rounded-3xl text-white shadow-xl"
                style={{
                    background:
                        'radial-gradient(circle at 85% 10%, rgba(226,171,61,0.28), transparent 38%), radial-gradient(circle at 5% 95%, rgba(45,212,191,0.22), transparent 40%), linear-gradient(135deg, #052e22 0%, #0d3a2b 45%, #0f5a43 100%)',
                }}
            >
                {/* guilloche-style rings */}
                <svg aria-hidden className="absolute -right-24 -top-24 w-80 h-80 text-white/[0.06]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                    {[20, 34, 48, 62, 76, 90].map((r) => <circle key={r} cx="100" cy="100" r={r} strokeWidth="1" />)}
                </svg>

                <div className="relative p-4 md:px-5 md:py-3.5">
                    {/* Top strip */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-amber-400/90 text-emerald-950 grid place-items-center"><ShieldCheck className="w-5 h-5" aria-hidden /></span>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">TPF Aid</p>
                                <p className="text-xs text-emerald-100/80">Donor identity card</p>
                            </div>
                        </div>
                        <span className={`rotate-3 border-2 rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] ${st.stamp}`}>{st.label}</span>
                    </div>

                    {/* Body */}
                    <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <div className="shrink-0 flex sm:flex-col items-center gap-3">
                            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 border-amber-300/70 bg-white/10 grid place-items-center text-3xl font-bold text-amber-200 shadow-inner">
                                {initialsOf(p.name)}
                            </div>
                            {p.permanentMember && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-950"><Star className="w-3 h-3" fill="currentColor" aria-hidden />Permanent donor</span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">Full legal name</p>
                            <h2 className="text-xl sm:text-2xl font-bold leading-tight break-words">{formatFieldValue('name', p.name) || 'Unnamed'}</h2>
                            {p.accountName && p.accountName.toLowerCase() !== p.name.toLowerCase() && (
                                <p className="text-xs text-emerald-100/70 mt-0.5">Account name: {p.accountName}</p>
                            )}

                            <div className="mt-2.5 rounded-xl bg-black/20 border border-white/10 px-3 py-2 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">PAN number</p>
                                    <p className="font-mono text-lg tracking-[0.2em] font-bold print-break-all">{p.pan || '—'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {p.pan && <button onClick={() => copyText(p.pan, 'PAN')} aria-label="Copy PAN" className="no-print p-1.5 rounded-lg hover:bg-white/15 text-emerald-100 cursor-pointer"><Copy size={16} /></button>}
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${p.panVerified ? 'bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/50' : 'bg-white/10 text-white/70 ring-1 ring-white/20'}`}>
                                        {p.panVerified ? <><CheckCircle size={12} aria-hidden /> PAN verified</> : 'PAN not verified'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2.5 grid grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-2">
                                <CardField icon={Cake} label="Date of birth" value={p.dob ? `${fmtDate(p.dob)}${p.age !== null ? ` (${p.age} yrs)` : ''}` : ''} span="lg:col-span-2" />
                                <CardField icon={UserIcon} label="Gender" value={cap(p.gender)} />
                                <CardField icon={Droplet} label="Blood group" value={p.bloodGroup} />
                                <CardField icon={Briefcase} label="Profession" value={p.profession} span="col-span-2 lg:col-span-2" />
                                <CardField icon={Phone} label="Mobile" value={p.mobile} copy span="lg:col-span-2" />
                                <CardField icon={Mail} label="Email" value={p.email} copy span="col-span-2 lg:col-span-4" />
                                <CardField icon={MapPin} label="Address" value={address} span="col-span-2 lg:col-span-6" />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-2.5 pt-2 border-t border-white/15 flex flex-wrap items-end justify-between gap-3">
                        <div className="flex gap-6 text-xs">
                            <div><p className="text-[10px] uppercase tracking-[0.14em] text-emerald-200/70">Submitted</p><p className="font-semibold">{fmtDate(p.submittedAt) || '—'}</p></div>
                            <div><p className="text-[10px] uppercase tracking-[0.14em] text-emerald-200/70">Verified</p><p className="font-semibold">{fmtDate(p.verifiedAt) || '—'}</p></div>
                            <div><p className="text-[10px] uppercase tracking-[0.14em] text-emerald-200/70">Card no.</p><p className="font-mono font-semibold">{p.cardNo}</p></div>
                        </div>
                        <Barcode seed={p.cardNo} />
                    </div>
                </div>
            </div>

            {/* Actions: sits right under the card so the card and the decision fit in one screen */}
            {p.status === 'pending' && (
                <div className="no-print sticky bottom-1 z-20 fab-avoid">
                    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg px-4 py-2">
                        {isRejecting ? (
                            <div>
                                <h4 className="font-semibold text-red-700 mb-2 text-sm">Reject application</h4>
                                <label htmlFor="reject-reason" className="sr-only">Reason for rejection</label>
                                <textarea
                                    id="reject-reason"
                                    className="w-full border border-red-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-2"
                                    placeholder="Reason for rejection (sent to the user by email)..."
                                    rows={2}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsRejecting(false)} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer">Cancel</button>
                                    <button onClick={() => onReject(user._id)} disabled={isUpdating} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 cursor-pointer">Confirm reject</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                <p className="hidden sm:block text-sm text-slate-500">Check the card above, then make a decision.</p>
                                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                                    <button onClick={() => setIsRejecting(true)} className="inline-flex items-center justify-center gap-2 px-5 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold cursor-pointer">
                                        <XCircle size={18} aria-hidden /> Reject
                                    </button>
                                    <button onClick={() => onApprove(user._id)} disabled={isUpdating} className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold shadow-sm disabled:opacity-60 cursor-pointer">
                                        <CheckCircle size={18} aria-hidden /> Approve KYC
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {p.remarks && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 avoid-break">
                    <h4 className="text-sm font-bold text-amber-800 mb-1">Admin remarks</h4>
                    <p className="text-slate-700 text-sm">{p.remarks}</p>
                </div>
            )}

            {/* Complete record: every field, shown even when empty */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Section title="Personal" icon={<UserIcon className="w-4 h-4 text-emerald-600" />}>
                    <Row label="Full legal name" value={p.name} format />
                    <Row label="Account name" value={p.accountName} format />
                    <Row label="Date of birth" value={p.dob ? fmtDate(p.dob) : ''} />
                    <Row label="Age" value={p.age !== null ? `${p.age} years` : ''} />
                    <Row label="Gender" value={cap(p.gender)} />
                    <Row label="Blood group" value={p.bloodGroup} />
                    <Row label="Profession" value={p.profession} format />
                </Section>
                <Section title="Contact" icon={<Phone className="w-4 h-4 text-emerald-600" />}>
                    <Row label="Mobile (KYC form)" value={p.mobile} />
                    <Row label="Mobile (account)" value={p.accountMobile} />
                    <Row label="Email" value={p.email} />
                </Section>
                <Section title="Address" icon={<MapPin className="w-4 h-4 text-emerald-600" />}>
                    <Row label="Street address" value={p.address} format />
                    <Row label="City" value={p.city} format />
                    <Row label="State" value={p.state} format />
                    <Row label="Pincode" value={p.pincode} />
                </Section>
                <Section title="Verification" icon={<ListChecks className="w-4 h-4 text-emerald-600" />}>
                    <Row label="PAN number" value={p.pan} />
                    <Row label="PAN verified" value={p.panVerified ? 'Yes' : 'No'} />
                    <Row label="KYC status" value={st.label} />
                    <Row label="Submitted on" value={fmtDateTime(p.submittedAt)} />
                    <Row label="Verified on" value={fmtDateTime(p.verifiedAt)} />
                    <Row label="Remarks" value={p.remarks} />
                </Section>
                <Section title="Account" icon={<Hash className="w-4 h-4 text-emerald-600" />}>
                    <Row label="Registered on" value={fmtDate(p.registeredAt)} />
                    <Row label="Total donated" value={inr(p.totalDonated)} icon={<IndianRupee className="w-3.5 h-3.5" />} />
                    <Row label="Permanent donor" value={p.permanentMember ? 'Yes' : 'No'} />
                    <Row label="Card number" value={p.cardNo} />
                </Section>
            </div>

        </div>
    );
}

/* ---------- small pieces ---------- */
function Section({ title, icon, children, wide }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 avoid-break ${wide ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                {icon}<h3 className="font-bold text-slate-800 text-sm">{title}</h3>
            </div>
            <dl className="divide-y divide-slate-50">{children}</dl>
        </div>
    );
}

function Row({ label, value, icon, format }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 text-sm">
            <dt className="text-slate-500 shrink-0 flex items-center gap-1">{icon}{label}</dt>
            <dd className="text-right font-medium text-slate-900 print-break-all min-w-0">
                {value ? (format ? formatFieldValue(label, value) : value) : <span className="font-normal italic text-slate-300">Not provided</span>}
            </dd>
        </div>
    );
}

function PageBtn({ onClick, disabled, icon, label }) {
    return (
        <button onClick={onClick} disabled={disabled} aria-label={label} className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            {icon}
        </button>
    );
}

function StatusChip({ status }) {
    const s = STATUS[status] || STATUS.pending;
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 ${s.chip}`}>{s.label}</span>;
}
