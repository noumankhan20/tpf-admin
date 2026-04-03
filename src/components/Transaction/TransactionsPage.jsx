"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Search, Filter, X, ChevronDown, ChevronUp, Eye,
    ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown,
    Wallet, RefreshCw, Download, Calendar, SlidersHorizontal,
    ArrowLeft, ChevronLeft, ChevronRight, Building2, User,
    CreditCard, FileText, Hash, AlertCircle, CheckCircle2,
    Clock, XCircle, Banknote, Smartphone, Landmark, Check
} from "lucide-react";
import { useGetAllTransactionsQuery } from "@/utils/slices/transactionApiSlice";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────
const DONATION_TYPES = ["ZAKAAT", "SADAQAH", "LILLAH", "IMDAD", "RIBA"];
const EXPENSE_TYPES = ["SALARY", "BENEFICIARY", "PURCHASE", "REIMBURSEMENT", "OPERATIONAL", "DOCUMENTATION_SERVICE", "OTHER"];
const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "CARD", "OTHER", "RTGS", "NEFT", "IMPS"];
const SOURCES = ["ONLINE", "OFFLINE", "EXPENSE"];
const STATUSES = ["SUCCESS", "APPROVED", "PENDING", "FAILED", "REJECTED"];

const STATUS_CONFIG = {
    SUCCESS:  { label: "Success",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    APPROVED: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    PENDING:  { label: "Pending",  color: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400" },
    FAILED:   { label: "Failed",   color: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
    REJECTED: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
};

const SOURCE_CONFIG = {
    ONLINE:  { label: "Online",   color: "bg-blue-50 text-blue-700 border-blue-200",         icon: Smartphone },
    OFFLINE: { label: "Offline",  color: "bg-purple-50 text-purple-700 border-purple-200",   icon: Landmark },
    EXPENSE: { label: "Expense",  color: "bg-orange-50 text-orange-700 border-orange-200",   icon: Banknote },
};

const EXPENSE_TYPE_LABELS = {
    SALARY: "Salary",
    BENEFICIARY: "Beneficiary",
    PURCHASE: "Purchase",
    REIMBURSEMENT: "Reimbursement",
    OPERATIONAL: "Operational",
    DOCUMENTATION_SERVICE: "Documentation",
    OTHER: "Other",
};

const METHOD_ICONS = {
    UPI: Smartphone,
    CASH: Wallet,
    CHEQUE: FileText,
    BANK_TRANSFER: Landmark,
    CARD: CreditCard,
    RTGS: Landmark,
    NEFT: Landmark,
    IMPS: Landmark,
    OTHER: Hash,
    ONLINE: Smartphone,
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
};

const fmtDateShort = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const SourceBadge = ({ source }) => {
    const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.ONLINE;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
};

const TypePill = ({ type }) =>
    type === "CREDIT" ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white">
            <ArrowDownLeft size={10} />CR
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white">
            <ArrowUpRight size={10} />DR
        </span>
    );

// Stat card
const StatCard = ({ label, value, sub, icon: Icon, accent, loading }) => (
    <div
        className="relative bg-white rounded-2xl p-5 overflow-hidden"
        style={{ boxShadow: `0 1px 3px rgba(0,0,0,0.06), 0 4px 16px ${accent}18` }}
    >
        <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-6"
            style={{ background: `radial-gradient(circle, ${accent}, transparent)` }}
        />
        <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}18` }}>
                <Icon size={15} style={{ color: accent }} />
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
        {loading ? (
            <div className="w-28 h-7 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
            <p className="text-2xl font-bold text-gray-800 tabular-nums">{value}</p>
        )}
        {sub && !loading && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        <div className="mt-3 h-0.5 w-8 rounded-full" style={{ background: accent }} />
    </div>
);

// Filter chip
const FilterChip = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
        {label}
        <button onClick={onRemove} className="hover:text-emerald-900 ml-0.5">
            <X size={10} strokeWidth={2.5} />
        </button>
    </span>
);

// ─────────────────────────────────────────────────────────
// FILTER DRAWER
// ─────────────────────────────────────────────────────────
const FilterDrawer = ({ open, onClose, filters, onApply }) => {
    const [local, setLocal] = useState(filters);
    useEffect(() => { setLocal(filters); }, [filters]);

    if (!open) return null;

    const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

    const reset = () => {
        const empty = {
            startDate: "", endDate: "", minAmount: "", maxAmount: "",
            type: "", source: "", donationType: "", expenseType: "",
            paymentMethod: "", status: "", campaignId: "",
            sortBy: "date", sortOrder: "desc",
        };
        setLocal(empty);
        onApply(empty);
        onClose();
    };

    const apply = () => { onApply(local); onClose(); };

    const TogglePill = ({ val, active, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                active
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
        >
            {val}
        </button>
    );

    const Section = ({ title, children }) => (
        <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
            {children}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            {/* backdrop */}
            <div className="flex-1 bg-black/30 backdrop-blur-sm" />
            {/* panel */}
            <div
                className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-hidden"
                style={{ borderLeft: "1px solid #e5e7eb" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} className="text-emerald-500" />
                        <h3 className="text-[15px] font-semibold text-gray-900">Filters</h3>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400">
                        <X size={15} />
                    </button>
                </div>

                {/* body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    <Section title="Transaction Type">
                        <div className="flex flex-wrap gap-2">
                            {["", "CREDIT", "DEBIT"].map((v) => (
                                <TogglePill key={v} val={v || "All"} active={local.type === v} onClick={() => set("type", v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="Source">
                        <div className="flex flex-wrap gap-2">
                            {["", ...SOURCES].map((v) => (
                                <TogglePill key={v} val={v || "All"} active={local.source === v} onClick={() => set("source", v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="Status">
                        <div className="flex flex-wrap gap-2">
                            {["", ...STATUSES].map((v) => (
                                <TogglePill key={v} val={v || "All"} active={local.status === v} onClick={() => set("status", v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="Date Range">
                        <div className="grid grid-cols-2 gap-3">
                            {[["startDate", "From"], ["endDate", "To"]].map(([k, lbl]) => (
                                <div key={k}>
                                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">{lbl}</label>
                                    <input type="date" value={local[k]}
                                        onChange={(e) => set(k, e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
                                    />
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Amount Range (₹)">
                        <div className="grid grid-cols-2 gap-3">
                            {[["minAmount", "Min"], ["maxAmount", "Max"]].map(([k, lbl]) => (
                                <div key={k}>
                                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">{lbl}</label>
                                    <input type="number" placeholder={lbl} value={local[k]}
                                        onChange={(e) => set(k, e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Donation Type">
                        <div className="flex flex-wrap gap-2">
                            {["", ...DONATION_TYPES].map((v) => (
                                <TogglePill key={v} val={v || "All"} active={local.donationType === v} onClick={() => set("donationType", v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="Expense Type">
                        <div className="flex flex-wrap gap-2">
                            {["", ...EXPENSE_TYPES].map((v) => (
                                <TogglePill key={v} val={v ? (EXPENSE_TYPE_LABELS[v] || v) : "All"} active={local.expenseType === v} onClick={() => set("expenseType", v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="Payment Method">
                        <div className="flex flex-wrap gap-2">
                            {["", ...PAYMENT_METHODS].map((v) => (
                                <TogglePill key={v} val={v || "All"} active={local.paymentMethod === v} onClick={() => set("paymentMethod", v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="Sort">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] text-gray-400 font-medium mb-1 block">Sort By</label>
                                <select value={local.sortBy} onChange={(e) => set("sortBy", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400">
                                    <option value="date">Date</option>
                                    <option value="amount">Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] text-gray-400 font-medium mb-1 block">Order</label>
                                <select value={local.sortOrder} onChange={(e) => set("sortOrder", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400">
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </Section>
                </div>

                {/* footer */}
                <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button onClick={reset}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Reset All
                    </button>
                    <button onClick={apply}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────
const TransactionDetailModal = ({ tx, onClose }) => {
    if (!tx) return null;

    const isCredit = tx.type === "CREDIT";
    const MethodIcon = METHOD_ICONS[tx.paymentMethod] || Hash;

    const Row = ({ label, value, mono }) => (
        <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400 font-medium flex-shrink-0 w-36">{label}</span>
            <span className={`text-sm text-gray-800 text-right break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>{value || "—"}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
            onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
                style={{ border: "1px solid #e5e7eb" }}
                onClick={(e) => e.stopPropagation()}>

                {/* accent bar */}
                <div className={`h-1 w-full ${isCredit ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-rose-400 to-rose-600"}`} />

                {/* header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isCredit ? "bg-emerald-50" : "bg-rose-50"}`}>
                            {isCredit
                                ? <ArrowDownLeft size={18} className="text-emerald-600" />
                                : <ArrowUpRight size={18} className="text-rose-600" />}
                        </div>
                        <div>
                            <p className="text-[15px] font-semibold text-gray-900">Transaction Details</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <TypePill type={tx.type} />
                                <SourceBadge source={tx.source} />
                                <StatusBadge status={tx.status} />
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400">
                        <X size={16} />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* amount hero */}
                    <div className={`mx-6 mt-5 p-4 rounded-xl ${isCredit ? "bg-emerald-50" : "bg-rose-50"}`}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                        <p className={`text-3xl font-bold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                            {isCredit ? "+" : "−"} ₹{fmt(tx.amount)}
                        </p>
                        {tx.tipAmount > 0 && (
                            <p className="text-xs text-gray-400 mt-1">+ ₹{fmt(tx.tipAmount)} tip</p>
                        )}
                    </div>

                    <div className="px-6 py-4 space-y-1">
                        <Row label="Date & Time" value={fmtDate(tx.date)} />
                        <Row label="Transaction ID" value={tx.transactionId} mono />
                        {tx.gatewayId && <Row label="Gateway ID" value={tx.gatewayId} mono />}
                        <Row label="Description" value={tx.description} />
                        <Row label="Payment Method" value={tx.paymentMethod} />
                        {tx.donationType && <Row label="Donation Type" value={tx.donationType} />}
                        {tx.expenseType && <Row label="Expense Type" value={EXPENSE_TYPE_LABELS[tx.expenseType] || tx.expenseType} />}
                        {tx.campaign && <Row label="Campaign" value={tx.campaign.title} />}
                    </div>

                    {/* User info */}
                    <div className="mx-6 mb-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                            {isCredit ? "Donor" : "Recorded By"}
                        </p>
                        <Row label="Name" value={tx.user?.name} />
                        <Row label="Email" value={tx.user?.email} />
                        {tx.user?.mobile && <Row label="Mobile" value={tx.user?.mobile} />}
                        {tx.user?.location && <Row label="Location" value={tx.user?.location} />}
                    </div>

                    {/* Meta */}
                    {tx.meta && Object.keys(tx.meta).filter(k => tx.meta[k]).length > 0 && (
                        <div className="mx-6 mb-6 p-4 border border-gray-100 rounded-xl">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Additional Info</p>
                            {tx.meta.bankName && <Row label="Bank" value={tx.meta.bankName} />}
                            {tx.meta.bankAccountName && <Row label="Account Holder" value={tx.meta.bankAccountName} />}
                            {tx.meta.referenceNumber && <Row label="Reference No." value={tx.meta.referenceNumber} mono />}
                            {tx.meta.utrNumber && <Row label="UTR No." value={tx.meta.utrNumber} mono />}
                            {tx.meta.chequeNumber && <Row label="Cheque No." value={tx.meta.chequeNumber} mono />}
                            {tx.meta.upiId && <Row label="UPI ID" value={tx.meta.upiId} />}
                            {tx.meta.paymentApp && <Row label="Payment App" value={tx.meta.paymentApp} />}
                            {tx.meta.transactionDate && <Row label="Transaction Date" value={fmtDateShort(tx.meta.transactionDate)} />}
                            {tx.meta.remarks && <Row label="Remarks" value={tx.meta.remarks} />}
                            {tx.meta.notes && <Row label="Notes" value={tx.meta.notes} />}
                            {tx.meta.vendor?.name && <Row label="Vendor" value={tx.meta.vendor.name} />}
                            {tx.meta.recordedBy?.name && <Row label="Recorded By" value={tx.meta.recordedBy.name} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────
const Pagination = ({ current, total, onChange }) => {
    const pages = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) pages.push(i);
        else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
            <p className="text-xs text-gray-400">Page {current} of {total}</p>
            <div className="flex items-center gap-1">
                <button disabled={current === 1} onClick={() => onChange(current - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={13} />
                </button>
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`d${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">…</span>
                    ) : (
                        <button key={p} onClick={() => onChange(p)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                                p === current
                                    ? "bg-emerald-500 text-white"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}>
                            {p}
                        </button>
                    )
                )}
                <button disabled={current === total} onClick={() => onChange(current + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────
export default function TransactionsPage() {
    const router = useRouter();

    // Search
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 450);
        return () => clearTimeout(t);
    }, [search]);

    // Pagination & rows
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Filters state (applied)
    const EMPTY_FILTERS = {
        startDate: "", endDate: "", minAmount: "", maxAmount: "",
        type: "", source: "", donationType: "", expenseType: "",
        paymentMethod: "", status: "", campaignId: "",
        sortBy: "date", sortOrder: "desc",
    };
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [filterOpen, setFilterOpen] = useState(false);

    // Selected transaction for detail modal
    const [selected, setSelected] = useState(null);

    // Reset page when search/filters change
    useEffect(() => { setPage(1); }, [debouncedSearch, appliedFilters, limit]);

    const queryParams = useMemo(() => {
        const p = { page, limit };
        if (debouncedSearch?.length >= 2) p.search = debouncedSearch;
        Object.entries(appliedFilters).forEach(([k, v]) => { if (v) p[k] = v; });
        return p;
    }, [page, limit, debouncedSearch, appliedFilters]);

    const { data, isLoading, isFetching, error, refetch } = useGetAllTransactionsQuery(queryParams);

    const transactions = data?.transactions || [];
    const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalTransactions: 0 };
    const summary = data?.summary || { totalCredits: 0, totalDebits: 0, netBalance: 0, creditCount: 0, debitCount: 0, totalCount: 0 };

    // Build active filter chips (exclude sort)
    const activeChips = useMemo(() => {
        const chips = [];
        const labels = {
            type: "Type", source: "Source", status: "Status",
            donationType: "Donation Type", expenseType: "Expense",
            paymentMethod: "Method",
        };
        Object.entries(labels).forEach(([k, lbl]) => {
            if (appliedFilters[k]) chips.push({ key: k, label: `${lbl}: ${appliedFilters[k]}` });
        });
        if (appliedFilters.startDate || appliedFilters.endDate) {
            chips.push({ key: "date", label: `Date: ${appliedFilters.startDate || "∞"} – ${appliedFilters.endDate || "∞"}` });
        }
        if (appliedFilters.minAmount || appliedFilters.maxAmount) {
            chips.push({ key: "amount", label: `₹${appliedFilters.minAmount || "0"} – ₹${appliedFilters.maxAmount || "∞"}` });
        }
        return chips;
    }, [appliedFilters]);

    const removeChip = (key) => {
        if (key === "date") setAppliedFilters((p) => ({ ...p, startDate: "", endDate: "" }));
        else if (key === "amount") setAppliedFilters((p) => ({ ...p, minAmount: "", maxAmount: "" }));
        else setAppliedFilters((p) => ({ ...p, [key]: "" }));
    };

    const applyFilters = (f) => {
        setAppliedFilters(f);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">

                {/* ── Header ── */}
                <div className="mb-6 relative">
                    <button onClick={() => router.back()}
                        className="absolute left-0 top-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="text-center px-14">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                            Transaction Ledger
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Unified view of all credits &amp; debits
                        </p>
                    </div>
                    <button onClick={refetch}
                        className={`absolute right-0 top-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors ${isFetching ? "animate-spin" : ""}`}>
                        <RefreshCw size={15} />
                    </button>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total Transactions" value={fmt(summary.totalCount)}
                        icon={FileText} accent="#10b981" loading={isLoading} />
                    <StatCard label="Total Credits" value={`₹${fmt(summary.totalCredits)}`}
                        sub={`${summary.creditCount} donations`}
                        icon={ArrowDownLeft} accent="#10b981" loading={isLoading} />
                    <StatCard label="Total Debits" value={`₹${fmt(summary.totalDebits)}`}
                        sub={`${summary.debitCount} expenses`}
                        icon={ArrowUpRight} accent="#ef4444" loading={isLoading} />
                    <div className="relative rounded-2xl p-5 overflow-hidden"
                        style={{
                            background: summary.netBalance >= 0
                                ? "linear-gradient(135deg,#059669,#10b981,#34d399)"
                                : "linear-gradient(135deg,#dc2626,#ef4444,#f87171)",
                            boxShadow: summary.netBalance >= 0
                                ? "0 4px 20px rgba(16,185,129,0.35)"
                                : "0 4px 20px rgba(239,68,68,0.35)",
                        }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Wallet size={15} className="text-white" />
                            </div>
                            <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Net Balance</p>
                        </div>
                        {isLoading
                            ? <div className="w-28 h-7 bg-white/20 rounded-lg animate-pulse" />
                            : <p className="text-2xl font-bold text-white tabular-nums">₹{fmt(Math.abs(summary.netBalance))}</p>}
                        <p className="text-xs text-white/60 mt-1">{summary.netBalance >= 0 ? "Surplus" : "Deficit"}</p>
                        <div className="mt-3 h-0.5 w-8 rounded-full bg-white/40" />
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div className="flex gap-2">
                        {/* search */}
                        <div className="flex-1 relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search name, email, mobile, TXN ID…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                            />
                            {search && (
                                <button onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* rows per page */}
                        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-emerald-400 hidden sm:block">
                            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} rows</option>)}
                        </select>

                        {/* filter button */}
                        <button onClick={() => setFilterOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors border"
                            style={activeChips.length > 0
                                ? { background: "#ecfdf5", borderColor: "#6ee7b7", color: "#059669" }
                                : { background: "white", borderColor: "#e5e7eb", color: "#374151" }}>
                            <SlidersHorizontal size={14} />
                            <span className="hidden sm:inline">Filters</span>
                            {activeChips.length > 0 && (
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* active chips */}
                    {activeChips.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                            {activeChips.map((c) => (
                                <FilterChip key={c.key} label={c.label} onRemove={() => removeChip(c.key)} />
                            ))}
                            <button onClick={() => setAppliedFilters(EMPTY_FILTERS)}
                                className="text-xs text-gray-400 hover:text-gray-600 underline">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* count row */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-xs text-gray-400">
                        {isFetching ? "Fetching…" : `Showing ${transactions.length} of ${pagination.totalTransactions} transactions`}
                    </p>
                    <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 focus:outline-none sm:hidden">
                        {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} rows</option>)}
                    </select>
                </div>

                {/* ── Loading / Error ── */}
                {isLoading && (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <RefreshCw size={22} className="animate-spin text-emerald-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">Loading transactions…</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
                        <AlertCircle size={22} className="text-red-400 mx-auto mb-3" />
                        <p className="text-sm text-red-500">Error loading transactions. Please try again.</p>
                    </div>
                )}

                {/* ── Desktop Table ── */}
                {!isLoading && !error && (
                    <div className={`hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden transition-opacity ${isFetching ? "opacity-60" : ""}`}
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {["Type", "Date & Time", "User", "Campaign", "Description", "Method", "Amount", "Status", ""].map((h) => (
                                            <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                                                No transactions found matching your filters.
                                            </td>
                                        </tr>
                                    ) : transactions.map((tx) => {
                                        const MethodIcon = METHOD_ICONS[tx.paymentMethod] || Hash;
                                        const isCredit = tx.type === "CREDIT";
                                        return (
                                            <tr key={String(tx._id)} className="hover:bg-gray-50/70 transition-colors group">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-col gap-1">
                                                        <TypePill type={tx.type} />
                                                        <SourceBadge source={tx.source} />
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <p className="text-sm text-gray-800 font-medium">{fmtDateShort(tx.date)}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {tx.date ? new Date(tx.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{tx.user?.name || "—"}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[140px]">{tx.user?.email || tx.user?.mobile || ""}</p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm text-gray-600 truncate max-w-[130px]">{tx.campaign?.title || "—"}</p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm text-gray-600 truncate max-w-[160px]" title={tx.description}>{tx.description || "—"}</p>
                                                    {tx.donationType && (
                                                        <span className="text-[10px] font-semibold text-indigo-500">{tx.donationType}</span>
                                                    )}
                                                    {tx.expenseType && (
                                                        <span className="text-[10px] font-semibold text-orange-500">{EXPENSE_TYPE_LABELS[tx.expenseType] || tx.expenseType}</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <MethodIcon size={12} />
                                                        {tx.paymentMethod || "—"}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <p className={`text-[15px] font-bold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                                                        {isCredit ? "+" : "−"}₹{fmt(tx.amount)}
                                                    </p>
                                                    {tx.tipAmount > 0 && (
                                                        <p className="text-[10px] text-gray-400">+₹{fmt(tx.tipAmount)} tip</p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge status={tx.status} />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <button onClick={() => setSelected(tx)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800">
                                                        <Eye size={13} />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination current={pagination.currentPage} total={pagination.totalPages} onChange={setPage} />
                    </div>
                )}

                {/* ── Mobile Cards ── */}
                {!isLoading && !error && (
                    <div className={`lg:hidden space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                        {transactions.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-400">
                                No transactions found.
                            </div>
                        ) : transactions.map((tx) => {
                            const isCredit = tx.type === "CREDIT";
                            const MethodIcon = METHOD_ICONS[tx.paymentMethod] || Hash;
                            return (
                                <div key={String(tx._id)} className="bg-white rounded-xl border border-gray-100 p-4"
                                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <TypePill type={tx.type} />
                                                <SourceBadge source={tx.source} />
                                            </div>
                                            <p className="text-xs text-gray-400">{fmtDate(tx.date)}</p>
                                        </div>
                                        <p className={`text-lg font-bold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                                            {isCredit ? "+" : "−"}₹{fmt(tx.amount)}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5 text-sm mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400 text-xs">User</span>
                                            <span className="text-gray-700 font-medium text-xs truncate max-w-[180px]">{tx.user?.name || "—"}</span>
                                        </div>
                                        {tx.campaign && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400 text-xs">Campaign</span>
                                                <span className="text-gray-700 text-xs truncate max-w-[180px]">{tx.campaign.title}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-xs">Method</span>
                                            <span className="flex items-center gap-1 text-gray-700 text-xs">
                                                <MethodIcon size={11} />{tx.paymentMethod}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        <StatusBadge status={tx.status} />
                                        <button onClick={() => setSelected(tx)}
                                            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800">
                                            <Eye size={13} />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <Pagination current={pagination.currentPage} total={pagination.totalPages} onChange={setPage} />
                    </div>
                )}
            </div>

            {/* Filter Drawer */}
            <FilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={appliedFilters}
                onApply={applyFilters}
            />

            {/* Detail Modal */}
            {selected && (
                <TransactionDetailModal tx={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}