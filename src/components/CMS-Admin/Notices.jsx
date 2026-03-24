"use client";

import { useState, useEffect } from "react";
import {
    useGetAllNoticesQuery,
    useGetNoticeByIdQuery,
    useCreateNoticeMutation,
    useUpdateNoticeMutation,
    useDeleteNoticeMutation,
} from "@/utils/slices/noticesApiSlice";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ConfirmModal from "../Common/ConfirmModal";
// ============================================
// UTILITY: Format Date
// ============================================
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// ============================================
// COMPONENT: CategoryBadge
// ============================================
function CategoryBadge({ category }) {
    const categoryStyles = {
        general: "bg-slate-100 text-slate-700 border-slate-200",
        events: "bg-purple-100 text-purple-700 border-purple-200",
        volunteer: "bg-blue-100 text-blue-700 border-blue-200",
        donations: "bg-amber-100 text-amber-700 border-amber-200",
        programs: "bg-emerald-100 text-emerald-700 border-emerald-200",
        administrative: "bg-rose-100 text-rose-700 border-rose-200",
    };

    const style = categoryStyles[category?.toLowerCase()] || categoryStyles.general;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style} capitalize`}>
            {category || "General"}
        </span>
    );
}


// ============================================
// COMPONENT: Modal Base
// ============================================
function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <div className="relative bg-white rounded-2xl shadow-2xl transform transition-all w-full max-w-2xl animate-modalSlide">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// COMPONENT: NoticeViewModal
// ============================================
function NoticeViewModal({ isOpen, onClose, noticeId }) {
    const { data: notice, isLoading } = useGetNoticeByIdQuery(noticeId, {
        skip: !noticeId || !isOpen,
    });

    const noticeData = notice?.data || notice?.notice || notice;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notice Details">
            {isLoading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
                        <div className="flex gap-2">
                            <div className="h-7 bg-gray-200 rounded-full w-24"></div>
                            <div className="h-7 bg-gray-200 rounded-lg w-32"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            ) : noticeData ? (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {noticeData.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <CategoryBadge category={noticeData.category} />
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Published: {formatDate(noticeData.publishAt)}</span>
                            </div>
                            {noticeData.expiresAt && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Expires: {formatDate(noticeData.expiresAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Description</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {noticeData.description}
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Created on {formatDate(noticeData.createdAt)}</span>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Notice not found</p>
                </div>
            )}
        </Modal>
    );
}

// ============================================
// COMPONENT: NoticeFormModal
// ============================================
function NoticeFormModal({ isOpen, onClose, noticeId, onSuccess }) {
    const isEditMode = Boolean(noticeId);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        publishAt: "",
        expiresAt: "",
    });

    const { data: notice, isLoading: isFetching } = useGetNoticeByIdQuery(noticeId, {
        skip: !isEditMode || !isOpen,
    });

    const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
    const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();

    const isSubmitting = isCreating || isUpdating;

    useEffect(() => {
        if (!isOpen) return;

        if (!isEditMode) {
            setFormData({
                title: "",
                description: "",
                category: "",
                publishAt: "",
                expiresAt: "",
            });
            return;
        }

        if (notice?.data || notice?.notice || notice) {
            const noticeData = notice?.data || notice?.notice || notice;

            setFormData({
                title: noticeData.title || "",
                description: noticeData.description || "",
                category: noticeData.category || "",
                publishAt: formatDateForInput(noticeData.publishAt),
                expiresAt: formatDateForInput(noticeData.expiresAt),
            });
        }
    }, [isOpen, isEditMode, notice]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditMode) {
                await updateNotice({ id: noticeId, data: formData }).unwrap();
                toast.success("Notice updated successfully!");
            } else {
                await createNotice(formData).unwrap();
                toast.success("Notice created successfully!");
            }
            onClose();
        } catch (error) {
            toast.error(
                error?.data?.message || `Failed to ${isEditMode ? "update" : "create"} notice`
            );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Notice" : "Create New Notice"}>
            {isFetching && isEditMode ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg" />
                    <div className="h-32 bg-gray-200 rounded-lg" />
                    <div className="h-12 bg-gray-200 rounded-lg" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                            placeholder="Enter notice title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none"
                            placeholder="Enter notice description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
                        >
                            <option value="">Select a category</option>
                            <option value="general">General</option>
                            <option value="events">Events</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="donations">Donations</option>
                            <option value="programs">Programs</option>
                            <option value="administrative">Administrative</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Publish Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="publishAt"
                                value={formData.publishAt}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                name="expiresAt"
                                value={formData.expiresAt}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? "Update Notice" : "Create Notice"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}


// ============================================
// COMPONENT: NoticesTable
// ============================================
function NoticesTable({ notices, isLoading, onView, onEdit, onDelete }) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Publish Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded-lg w-3/4"></div></td>
                                    <td className="px-6 py-5"><div className="h-7 bg-gray-200 rounded-full w-24"></div></td>
                                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded-lg w-28"></div></td>
                                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded-lg w-28"></div></td>
                                    <td className="px-6 py-5"><div className="h-8 bg-gray-200 rounded-lg w-32"></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (!notices || notices.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No notices yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Get started by creating your first notice to share important information with your community.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Publish Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {notices.map((notice) => (
                            <tr key={notice._id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                        {notice.title}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <CategoryBadge category={notice.category} />
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(notice.publishAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(notice.createdAt)}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {/* View button - always visible */}
                                        <button
                                            onClick={() => onView(notice._id)}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            title="View notice"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>

                                        {/* Edit button - disabled when pendingDelete */}
                                        <button
                                            onClick={() => !notice.pendingDelete && onEdit(notice._id)}
                                            disabled={notice.pendingDelete}
                                            className={`p-2 rounded-lg transition-all ${notice.pendingDelete
                                                    ? "text-gray-300 cursor-not-allowed"
                                                    : "text-blue-600 hover:bg-blue-50"
                                                }`}
                                            title={notice.pendingDelete ? "Pending deletion" : "Edit notice"}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        {/* Delete / Pending button */}
                                        {notice.pendingDelete ? (
                                            <button
                                                disabled
                                                className="px-3 py-1.5 bg-amber-50 text-amber-500 border border-amber-200 rounded-lg text-xs font-semibold cursor-not-allowed"
                                                title="Deletion pending"
                                            >
                                                ⏳ Pending
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onDelete(notice._id, notice.title)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete notice"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// MAIN EXPORT: AdminNoticesPage
// ============================================
export default function AdminNoticesPage() {
    const { data, isLoading, isError, error } = useGetAllNoticesQuery();
    const notices = Array.isArray(data?.data) ? data.data : [];
    const router = useRouter();
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedNoticeId, setSelectedNoticeId] = useState(null);
    const [selectedNoticeTitle, setSelectedNoticeTitle] = useState("");
    const [deleteNotice] = useDeleteNoticeMutation();


    const handleView = (noticeId) => {
        setSelectedNoticeId(noticeId);
        setViewModalOpen(true);
    };

    const handleEdit = (noticeId) => {
        setSelectedNoticeId(noticeId);
        setFormModalOpen(true);
    };

    const handleDelete = (noticeId, noticeTitle) => {
        setSelectedNoticeId(noticeId);
        setSelectedNoticeTitle(noticeTitle);
        setDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedNoticeId(null);
        setFormModalOpen(true);
    };

    const closeModals = () => {
        setViewModalOpen(false);
        setFormModalOpen(false);
        setDeleteModalOpen(false);
        setSelectedNoticeId(null);
        setSelectedNoticeTitle("");
    };

    const confirmDelete = async () => {
        if (!selectedNoticeId) return;
        try {
            await deleteNotice(selectedNoticeId).unwrap();
            toast.success("Notice deleted successfully!");
            closeModals();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete notice");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
                    {/* Back Button */}
                    <div className="px-4 lg:px-8 pt-6">
                        <button
                            onClick={() => router.push("/cms-admin")}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                            Manage Notices
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Create, edit, and manage all your notices in one place
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transform hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Notice
                    </button>
                </div>


                {/* Error State */}
                {isError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-800 font-medium">
                            {error?.data?.message || "Failed to load notices. Please try again."}
                        </p>
                    </div>
                )}

                {/* Table */}
                <NoticesTable
                    notices={notices}
                    isLoading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {/* Modals */}
                <NoticeViewModal
                    isOpen={viewModalOpen}
                    onClose={closeModals}
                    noticeId={selectedNoticeId}
                />

                <NoticeFormModal
                    isOpen={formModalOpen}
                    onClose={closeModals}
                    noticeId={selectedNoticeId}
                />

                <ConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={closeModals}
                    onConfirm={confirmDelete}
                    title="Delete Notice"
                    message={`Are you sure you want to delete the notice: "${selectedNoticeTitle}"? This action cannot be undone.`}
                />
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes modalSlide {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }

                .animate-modalSlide {
                    animation: modalSlide 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}