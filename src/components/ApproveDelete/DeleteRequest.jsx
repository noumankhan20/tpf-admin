"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2, CheckCircle, XCircle, Clock, Search, AlertTriangle, Eye,
  TrendingUp, LayoutGrid, ClipboardCheck, Camera, Edit, Globe, Share2,
  CreditCard, Package, Calculator, FolderKanban, HandHeart, Users, Shield,
  FileText, Scale, Download, MessageSquare, Heart, UserCheck, Building2,
  Briefcase, SlidersHorizontal, RefreshCw, ArrowLeft,
} from "lucide-react";
import {
  useGetAllDeleteRequestsQuery,
  useApproveDeleteRequestMutation,
  useRejectDeleteRequestMutation,
} from "@/utils/slices/deleteApiSlice"; // ← adjust path to match your project

// ── Module icon map ──────────────────────────────────────────────────────────
// API modules use "Category / SubCategory" format (e.g. "CMS / Blogs")
// We match on the base module name or substring for flexibility
const MODULE_ICONS = {
  "Admin Dashboard": TrendingUp, "Dashboard Summary": LayoutGrid,
  "Financial Aid": ClipboardCheck, "KYC Verification": ClipboardCheck,
  "Organization Verification": ClipboardCheck, Photography: Camera,
  "Photo-Editing": Edit, "CMS-Admin": Globe, "Social-Media": Share2,
  "Disbursement-Tasks": CreditCard, Inventory: Package,
  "Finance & Accounting": Calculator, "Career & Job Opportunites": Briefcase,
  "Employee Management": Briefcase, "Volunteer Management": Users,
  "task-management": FolderKanban, "Donation Management": HandHeart,
  "Campaign Management": FolderKanban, Donor: Heart,
  "permanent-donors": UserCheck, volunteers: Users, employees: Briefcase,
  organizations: Building2, "Security & Access": Shield,
  "Tickets-Queries": MessageSquare, "Communication Audit": Shield,
  "Document Management": FileText, "Legal and Compliance": Scale,
  Downloads: Download, "Internal Communication": MessageSquare,
  // CMS sub-modules
  Blogs: Globe, Notices: FileText, Tailored: LayoutGrid, Influencers: Users,
  "Impact Stories": Heart, "Trusted By": Shield, Communities: Building2,
  // Legal sub-modules
  Agreements: Scale, "Business Resolutions": Scale,
};

/** Pick an icon by matching module string against known keys */
function getModuleIcon(module) {
  if (!module) return FolderKanban;
  // Exact match first
  if (MODULE_ICONS[module]) return MODULE_ICONS[module];
  // Partial match (e.g. "CMS / Blogs" → "Blogs")
  for (const key of Object.keys(MODULE_ICONS)) {
    if (module.toLowerCase().includes(key.toLowerCase())) return MODULE_ICONS[key];
  }
  return FolderKanban;
}

/** Derive a readable category label from the module string */
function getModuleCategory(module) {
  if (!module) return "general";
  const lower = module.toLowerCase();
  if (lower.startsWith("cms")) return "cms";
  if (lower.startsWith("legal")) return "legal";
  if (lower.includes("finance") || lower.includes("donation") || lower.includes("disbursement")) return "finance";
  if (lower.includes("volunteer") || lower.includes("employee") || lower.includes("hr")) return "hr";
  if (lower.includes("inventory") || lower.includes("resource")) return "resource";
  if (lower.includes("kyc") || lower.includes("security") || lower.includes("compliance")) return "compliance";
  return "general";
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  approved: { label: "Approved", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ request, onClose, onApprove, onReject }) {
  if (!request) return null;
  const IconComp = getModuleIcon(request.module);
  const status = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <h3 className="text-gray-900 font-semibold text-base leading-snug pr-4">{request.entityName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 shrink-0">
            <XCircle size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[58vh] overflow-y-auto">
          {/* Module */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Module</p>
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <IconComp size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">{request.module}</p>
                <p className="text-xs text-gray-400 capitalize">{getModuleCategory(request.module)}</p>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Status</p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium ${status.bg} ${status.border} ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
            </div>
          </div>

          {/* Details rows */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
            {[
              { label: "Requested By", val: request.requestedByName ?? "—" },
              { label: "Role", val: request.requestedByRole ?? "—" },
              { label: "Email", val: request.requestedByEmail ?? "—" },
              { label: "Requested At", val: formatDate(request.requestedAt) },
              ...(request.resolvedAt ? [
                { label: "Resolved At", val: formatDate(request.resolvedAt) },
                { label: "Resolved By", val: request.resolvedBy ?? "Super Admin" },
              ] : []),
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-right max-w-[55%] leading-snug text-gray-800 break-all">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          {request.status === "pending" ? (
            <>
              <button onClick={() => onReject(request)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                <XCircle size={15} /> Reject
              </button>
              <button onClick={() => onApprove(request)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors">
                <CheckCircle size={15} /> Approve
              </button>
            </>
          ) : (
            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ request, action, onConfirm, onClose, isLoading }) {
  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl p-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isApprove ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
          {isApprove ? <CheckCircle size={22} className="text-emerald-500" /> : <XCircle size={22} className="text-red-500" />}
        </div>
        <h3 className="text-gray-900 font-semibold text-lg mb-1">
          {isApprove ? "Approve Delete Request" : "Reject Delete Request"}
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          {isApprove
            ? `This will permanently delete "${request.entityName}" from ${request.module}. This action cannot be undone.`
            : `The delete request from ${request.requestedByName} will be rejected.`}
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 text-sm">
          <p className="text-gray-500"><span className="text-gray-700 font-medium">Entity:</span> {request.entityName}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isApprove ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
          >
            {isLoading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : isApprove ? "Yes, Approve" : "Reject Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[200, 140, 130, 80, 100].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 rounded-lg bg-gray-100 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DeleteRequestsPage() {
  const router = useRouter();

  // ── RTK Query hooks ──
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllDeleteRequestsQuery();

  const [approveDeleteRequest, { isLoading: isApproving }] = useApproveDeleteRequestMutation();
  const [rejectDeleteRequest, { isLoading: isRejecting }] = useRejectDeleteRequestMutation();

  // ── Local UI state ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modal, setModal] = useState(null); // { request, action }
  const [toast, setToast] = useState(null);

  const requests = apiResponse?.data ?? [];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = (request, action) => {
    setSelectedRequest(null);
    setModal({ request, action });
  };

  const handleConfirm = async () => {
    const { request, action } = modal;
    try {
      if (action === "approve") {
        await approveDeleteRequest(request.id).unwrap();
        showToast(`Request approved — "${request.entityName}" will be deleted.`, "success");
      } else {
        await rejectDeleteRequest(request.id).unwrap();
        showToast(`Request from ${request.requestedByName} has been rejected.`, "error");
      }
      setModal(null);
    } catch (err) {
      showToast(err?.data?.message ?? "Something went wrong. Please try again.", "error");
    }
  };

  const uniqueModules = useMemo(
    () => [...new Set(requests.map((r) => r.module))].sort(),
    [requests]
  );

  const filtered = useMemo(() => requests.filter((r) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        r.entityName?.toLowerCase().includes(q) ||
        r.module?.toLowerCase().includes(q) ||
        r.requestedByName?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)) &&
      (statusFilter === "all" || r.status === statusFilter) &&
      (moduleFilter === "all" || r.module === moduleFilter)
    );
  }), [requests, search, statusFilter, moduleFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  }), [requests]);

  const isMutating = isApproving || isRejecting;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .page-root { min-height: 100vh; background: #f8fafc; font-family: 'Geist', sans-serif; color: #0f172a; }
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; }
        .row-hover:hover { background: #f0fdf4; }
        .badge-mono { font-family: 'Geist Mono', monospace; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #a7f3d0; border-radius: 2px; }
        .select-custom {
          appearance: none; background: #fff; border: 1px solid #e2e8f0; color: #64748b;
          border-radius: 10px; padding: 8px 32px 8px 12px; font-size: 13px;
          font-family: 'Geist', sans-serif; cursor: pointer; outline: none; transition: border-color 0.15s;
        }
        .select-custom:focus { border-color: #10b981; color: #0f172a; }
        .select-wrapper { position: relative; }
        .select-wrapper::after {
          content: ''; position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent;
          border-top: 5px solid #94a3b8; pointer-events: none;
        }
        @keyframes toastIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .toast-anim { animation: toastIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="page-root p-6 lg:p-8">

        {/* ── Back + Header ── */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-5 group w-fit"
          >
            <div className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center group-hover:border-emerald-300 group-hover:bg-emerald-50 transition-all">
              <ArrowLeft size={13} />
            </div>
            Back
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: "-0.02em" }}>Delete Requests</h1>
              <p className="text-gray-400 text-sm mt-1">Review and action deletion requests raised by module admins</p>
            </div>
          </div>
        </div>

        {/* ── Error banner ── */}
        {isError && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">
            <AlertTriangle size={16} />
            Failed to load delete requests. Please try refreshing.
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Requests", val: stats.total, icon: FolderKanban, color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200" },
            { label: "Pending Review", val: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Approved", val: stats.approved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            { label: "Rejected", val: stats.rejected, icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
          ].map(({ label, val, icon: Icon, color, bg, border }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} border ${border}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${color}`}>
                  {isLoading ? <span className="inline-block w-6 h-6 rounded bg-gray-200 animate-pulse" /> : val}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="card p-4 mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="Search by entity, module, requester, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-400">
              <SlidersHorizontal size={13} />
              <span className="text-xs">Filter:</span>
            </div>
            {/* Status filter */}
            <div className="select-wrapper">
              <select className="select-custom" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {[["all", "All Status"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            {/* Module filter */}
            <div className="select-wrapper">
              <select className="select-custom" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
                <option value="all">All Modules</option>
                {uniqueModules.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["Entity", "Module", "Requested By", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <Search size={28} className="opacity-30" />
                        <p className="text-sm">No requests match your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((req) => {
                  const IconComp = getModuleIcon(req.module);
                  const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                  return (
                    <tr
                      key={req.id}
                      className="row-hover transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      {/* Entity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                            <Trash2 size={13} className="text-red-400" />
                          </div>
                          <p className="text-sm text-gray-800 font-medium leading-snug max-w-[200px] truncate">{req.entityName}</p>
                        </div>
                      </td>
                      {/* Module */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <IconComp size={13} className="text-emerald-500 shrink-0" />
                          <span className="text-sm text-gray-600 whitespace-nowrap">{req.module}</span>
                        </div>
                      </td>
                      {/* Requested By */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800">{req.requestedByName ?? "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.requestedAt ? formatDate(req.requestedAt) : "—"}
                        </p>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${status.bg} ${status.border} ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {req.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction(req, "approve")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors whitespace-nowrap"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleAction(req, "reject")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                          >
                            <Eye size={12} /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Showing <span className="text-gray-600 font-medium">{filtered.length}</span> of{" "}
              <span className="text-gray-600 font-medium">{requests.length}</span> requests
            </p>
            {stats.pending > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertTriangle size={12} />
                {stats.pending} request{stats.pending > 1 ? "s" : ""} awaiting review
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedRequest && (
        <DetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={(r) => handleAction(r, "approve")}
          onReject={(r) => handleAction(r, "reject")}
        />
      )}

      {/* ── Confirm Modal ── */}
      {modal && (
        <ConfirmModal
          request={modal.request}
          action={modal.action}
          onConfirm={handleConfirm}
          onClose={() => !isMutating && setModal(null)}
          isLoading={isMutating}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[999] toast-anim flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-white border-emerald-200 text-emerald-600" : "bg-white border-red-200 text-red-500"
          }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}