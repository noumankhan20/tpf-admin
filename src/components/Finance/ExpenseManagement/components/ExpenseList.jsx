'use client';

import React, { useState, useMemo } from 'react';
import { TrendingDown, Edit3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from 'lucide-react';
import { getMethodIcon, resolveRecipient } from '../utils/expenseHelpers';
import { getMediaUrl } from '@/utils/media';

// ─── Constants ─────────────────────────────────────────────────────────────────
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const TYPE_STYLE = {
    SALARY: { label: 'Salary', bg: '#EFF6FF', color: '#1D4ED8' },
    PURCHASE: { label: 'Purchase', bg: '#FEF3C7', color: '#92400E' },
    BENEFICIARY: { label: 'Beneficiary', bg: '#FEE2E2', color: '#991B1B' },
    OPERATIONAL: { label: 'Operational', bg: '#ECFDF5', color: '#065F46' },
    REIMBURSEMENT: { label: 'Reimburse', bg: '#F5F3FF', color: '#5B21B6' },
    DOCUMENTATION_SERVICE: { label: 'Doc Service', bg: '#E0F2FE', color: '#075985' },
    OTHER: { label: 'Other', bg: '#F3F4F6', color: '#374151' },
};

const METHOD_LABEL = {
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank Transfer',
    UPI: 'UPI',
    CHEQUE: 'Cheque',
    CARD: 'Card',
    OTHER: 'Other',
};

// ─── Date formatter ────────────────────────────────────────────────────────────
const fmtDate = (raw) =>
    new Date(raw).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <tr>
            <td colSpan={9}>
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                    <TrendingDown size={36} className="mb-3" />
                    <p className="text-sm font-semibold text-gray-400">No expenses found</p>
                    <p className="text-xs text-gray-300 mt-1">Try adjusting your filters.</p>
                </div>
            </td>
        </tr>
    );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, perPage, setPerPage, goPage }) {
    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);

    const pageNums = useMemo(() => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
        if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '…', page - 1, page, page + 1, '…', totalPages];
    }, [page, totalPages]);

    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 flex-wrap gap-3">
            {/* Left — count + per-page */}
            <div className="flex items-center gap-3">
                <p className="text-xs text-gray-400 font-medium">
                    {total === 0 ? 'No records' : `${start}–${end} of ${total.toLocaleString('en-IN')}`}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>Show</span>
                    <select
                        value={perPage}
                        onChange={(e) => { setPerPage(Number(e.target.value)); goPage(1); }}
                        className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer"
                    >
                        {PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span>/ page</span>
                </div>
            </div>

            {/* Right — page buttons */}
            <div className="flex items-center gap-1">
                <PageBtn onClick={() => goPage(1)} disabled={page === 1} aria="First page">
                    <ChevronsLeft size={13} />
                </PageBtn>
                <PageBtn onClick={() => goPage(page - 1)} disabled={page === 1} aria="Previous page">
                    <ChevronLeft size={13} />
                </PageBtn>

                {pageNums.map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-gray-300 select-none">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => goPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === page
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <PageBtn onClick={() => goPage(page + 1)} disabled={page === totalPages} aria="Next page">
                    <ChevronRight size={13} />
                </PageBtn>
                <PageBtn onClick={() => goPage(totalPages)} disabled={page === totalPages} aria="Last page">
                    <ChevronsRight size={13} />
                </PageBtn>
            </div>
        </div>
    );
}

function PageBtn({ children, onClick, disabled, aria }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={aria}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
            {children}
        </button>
    );
}

// ─── Desktop Table Row ─────────────────────────────────────────────────────────
function ExpenseTableRow({ expense, onEdit }) {
    const { name: recipientName, sub: recipientSub } = resolveRecipient(expense);
    const dateRaw = expense.date || expense.transactionDate;
    const typeInfo = TYPE_STYLE[expense.expenseType] || TYPE_STYLE.OTHER;

    return (
        <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">

            {/* Date */}
            <td className="px-4 py-3.5 whitespace-nowrap">
                <p className="text-sm font-semibold text-gray-800 tabular-nums">{fmtDate(dateRaw)}</p>
                {expense.transactionTime && (
                    <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">{expense.transactionTime}</p>
                )}
            </td>

            {/* Type */}
            <td className="px-4 py-3.5">
                <div className="flex flex-col gap-1 items-start">
                    <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: typeInfo.bg, color: typeInfo.color }}
                    >
                        {typeInfo.label}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                        DR
                    </span>
                </div>
            </td>

            {/* Recipient */}
            <td className="px-4 py-3.5 max-w-[140px]">
                <p className="text-sm font-semibold text-gray-900 truncate">{recipientName}</p>
                {recipientSub && (
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5 truncate">{recipientSub}</p>
                )}
            </td>

            {/* Campaign */}
            <td className="px-4 py-3.5 max-w-[120px]">
                <div className="flex flex-col gap-1 items-start min-w-0">
                    <p className="text-xs text-gray-500 truncate w-full" title={expense.campaignId?.title}>
                        {expense.campaignId?.title || <span className="text-gray-300">—</span>}
                    </p>
                    {expense.campaignId?.isSpecialCase && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
                            Special Case
                        </span>
                    )}
                </div>
            </td>

            {/* Description */}
            <td className="px-4 py-3.5 max-w-[220px]">
                <p
                    className="text-xs text-gray-700 leading-relaxed"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    title={expense.description}
                >
                    {expense.description || <span className="text-gray-300">—</span>}
                </p>
                {expense.notes && (
                    <p className="text-[10px] text-gray-400 italic mt-1 truncate" title={expense.notes}>
                        "{expense.notes}"
                    </p>
                )}
            </td>

            {/* Method + TXN */}
            <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    {getMethodIcon(expense.paymentMethod)}
                    <span>{METHOD_LABEL[expense.paymentMethod] || expense.paymentMethod}</span>
                </div>
                {expense.transactionId && (
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono tracking-tight">
                        {expense.transactionId}
                    </p>
                )}
            </td>

            {/* Amount */}
            <td className="px-4 py-3.5 whitespace-nowrap text-right">
                <p className="text-sm font-bold text-rose-600 tabular-nums">
                    −₹{expense.amount.toLocaleString('en-IN')}
                </p>

                {expense.amountType && (
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
                        {expense.amountType}
                    </p>
                )}
            </td>

            {/* Status */}
            <td className="px-4 py-3.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Paid
                </span>
            </td>

            {/* Actions */}
            <td className="px-3 py-3.5">
                <div className="flex items-center gap-1">
                    {expense.proofDocument?.fileUrl && (
                        <button
                            onClick={() => window.open(getMediaUrl(expense.proofDocument.fileUrl), '_blank')}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="View Proof"
                        >
                            <FileText size={14} />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit?.(expense)}
                        className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit expense"
                    >
                        <Edit3 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Desktop Table (with pagination) ──────────────────────────────────────────
export function ExpenseTable({ expenses, onEdit }) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    // Reset to page 1 when expenses list changes (filter applied upstream)
    const prevLenRef = React.useRef(expenses.length);
    if (prevLenRef.current !== expenses.length) {
        prevLenRef.current = expenses.length;
        if (page !== 1) setPage(1);
    }

    const totalPages = Math.max(1, Math.ceil(expenses.length / perPage));
    const slice = useMemo(() => {
        const s = (page - 1) * perPage;
        return expenses.slice(s, s + perPage);
    }, [expenses, page, perPage]);

    const goPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

    const HEADERS = [
        { label: 'Date', cls: 'w-[110px]' },
        { label: 'Type', cls: 'w-[90px]' },
        { label: 'Recipient', cls: 'w-[140px]' },
        { label: 'Campaign', cls: 'w-[120px]' },
        { label: 'Description', cls: '' },
        { label: 'Method', cls: 'w-[130px]' },
        { label: 'Amount', cls: 'w-[100px] text-right' },
        { label: 'Status', cls: 'w-[72px]' },
        { label: '', cls: 'w-[72px]' },
    ];

    // Summary totals for visible page
    const pageTotal = slice.reduce((s, e) => s + e.amount, 0);

    return (
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Summary bar */}
            <div className="flex items-center gap-6 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                <Chip label="Total records" value={expenses.length.toLocaleString('en-IN')} />
                <Chip label="Total debit" value={`−₹${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}`} red />
                <Chip label="This page" value={`−₹${pageTotal.toLocaleString('en-IN')}`} />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                    <colgroup>
                        {HEADERS.map((h, i) => <col key={i} className={h.cls} />)}
                    </colgroup>
                    <thead>
                        <tr className="border-b border-gray-100">
                            {HEADERS.map((h, i) => (
                                <th
                                    key={i}
                                    className={`px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/60 ${h.cls}`}
                                >
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {slice.length === 0
                            ? <EmptyState />
                            : slice.map((expense) => (
                                <ExpenseTableRow key={expense._id} expense={expense} onEdit={onEdit} />
                            ))
                        }
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                page={page}
                totalPages={totalPages}
                total={expenses.length}
                perPage={perPage}
                setPerPage={setPerPage}
                goPage={goPage}
            />
        </div>
    );
}

// ─── Mobile Card ───────────────────────────────────────────────────────────────
function ExpenseMobileCard({ expense, onEdit }) {
    const { name: recipientName, sub: recipientSub } = resolveRecipient(expense);
    const dateRaw = expense.date || expense.transactionDate;
    const typeInfo = TYPE_STYLE[expense.expenseType] || TYPE_STYLE.OTHER;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="flex items-start justify-between px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: typeInfo.bg, color: typeInfo.color }}
                    >
                        {typeInfo.label}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">DR</span>
                    <span className="text-xs text-gray-400">{fmtDate(dateRaw)}</span>
                    {expense.transactionTime && (
                        <span className="text-xs text-gray-300">{expense.transactionTime}</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-rose-600 tabular-nums whitespace-nowrap mr-1">
                        −₹{expense.amount.toLocaleString('en-IN')}
                    </p>
                    {expense.proofDocument?.fileUrl && (
                        <button
                            onClick={() => window.open(getMediaUrl(expense.proofDocument.fileUrl), '_blank')}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="View Proof"
                        >
                            <FileText size={13} />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(expense)}
                            className="p-1.5 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        >
                            <Edit3 size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Card body */}
            <div className="px-4 py-3 space-y-2">
                <MobileRow label="Recipient">
                    <span className="font-semibold">{recipientName}</span>
                    {recipientSub && <span className="text-[10px] text-gray-400 ml-1">({recipientSub})</span>}
                </MobileRow>
                {expense.campaignId?.title && (
                    <MobileRow label="Campaign">
                        <div className="flex flex-col items-end gap-1">
                            <span>{expense.campaignId.title}</span>
                            {expense.campaignId.isSpecialCase && (
                                <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
                                    Special Case
                                </span>
                            )}
                        </div>
                    </MobileRow>
                )}
                <MobileRow label="Method">
                    <span className="flex items-center gap-1">
                        {getMethodIcon(expense.paymentMethod)}
                        {METHOD_LABEL[expense.paymentMethod] || expense.paymentMethod}
                    </span>
                </MobileRow>
                {expense.transactionId && (
                    <MobileRow label="TXN ID">
                        <span className="font-mono text-[11px]">{expense.transactionId}</span>
                    </MobileRow>
                )}
                {expense.description && (
                    <div className="pt-1 border-t border-gray-50">
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{expense.description}</p>
                    </div>
                )}
                {expense.notes && (
                    <p className="text-[10px] text-gray-400 italic bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        "{expense.notes}"
                    </p>
                )}
            </div>
        </div>
    );
}

function MobileRow({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">{label}</span>
            <span className="text-xs text-gray-700 font-medium text-right">{children}</span>
        </div>
    );
}

// ─── Mobile List (with pagination) ────────────────────────────────────────────
export function ExpenseMobileList({ expenses, onEdit }) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    const prevLenRef = React.useRef(expenses.length);
    if (prevLenRef.current !== expenses.length) {
        prevLenRef.current = expenses.length;
        if (page !== 1) setPage(1);
    }

    const totalPages = Math.max(1, Math.ceil(expenses.length / perPage));
    const slice = useMemo(() => {
        const s = (page - 1) * perPage;
        return expenses.slice(s, s + perPage);
    }, [expenses, page, perPage]);

    const goPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

    if (expenses.length === 0) {
        return (
            <div className="lg:hidden flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-300">
                <TrendingDown size={36} className="mb-3" />
                <p className="text-sm font-semibold text-gray-400">No expenses found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="lg:hidden space-y-3">
            {slice.map((expense) => (
                <ExpenseMobileCard key={expense._id} expense={expense} onEdit={onEdit} />
            ))}

            {/* Mobile Pagination */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={expenses.length}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    goPage={goPage}
                />
            </div>
        </div>
    );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Chip({ label, value, red }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-bold ${red ? 'text-rose-600' : 'text-gray-700'}`}>{value}</span>
        </div>
    );
}