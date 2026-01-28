"use client";

import { useState, useEffect } from "react";
import {
    useGetAllNoticesQuery,
    useGetNoticeByIdQuery,
    useCreateNoticeMutation,
    useUpdateNoticeMutation,
    useDeleteNoticeMutation,
} from "@/utils/slices/noticesApiSlice";

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
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500 text-white">
            {category || "General"}
        </span>
    );
}

// ============================================
// COMPONENT: Alert Message
// ============================================
function Alert({ type, message, onClose }) {
    const bgColor = type === "success" ? "bg-emerald-50" : "bg-red-50";
    const borderColor = type === "success" ? "border-emerald-200" : "border-red-200";
    const textColor = type === "success" ? "text-emerald-800" : "text-red-800";
    const iconColor = type === "success" ? "text-emerald-500" : "text-red-500";

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4 flex items-start justify-between`}>
            <div className="flex items-start">
                <svg
                    className={`w-5 h-5 ${iconColor} mr-3 mt-0.5`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {type === "success" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                </svg>
                <p className={`text-sm ${textColor}`}>{message}</p>
            </div>
            <button onClick={onClose} className={`${textColor} hover:opacity-70`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// ============================================
// COMPONENT: Modal Base
// ============================================
// ============================================
// COMPONENT: Modal Base (FIXED)
// ============================================
function Modal({ isOpen, onClose, title, children, size = "lg" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Center container */}
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
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
        <Modal isOpen={isOpen} onClose={onClose} title="View Notice" size="lg">
            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-2 pt-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            ) : noticeData ? (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{noticeData.title}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <CategoryBadge category={noticeData.category} />
                            <span className="text-sm text-gray-500">
                                Published: {formatDate(noticeData.publishAt)}
                            </span>
                            {noticeData.expiresAt && (
                                <span className="text-sm text-gray-500">
                                    Expires: {formatDate(noticeData.expiresAt)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {noticeData.description}
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs text-gray-500">
                            Created: {formatDate(noticeData.createdAt)}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">Notice not found</div>
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

  // Fetch notice ONLY in edit mode
  const { data: notice, isLoading: isFetching } =
    useGetNoticeByIdQuery(noticeId, {
      skip: !isEditMode || !isOpen,
    });

  const [createNotice, { isLoading: isCreating }] =
    useCreateNoticeMutation();
  const [updateNotice, { isLoading: isUpdating }] =
    useUpdateNoticeMutation();

  const isSubmitting = isCreating || isUpdating;

  // ✅ SINGLE, SAFE EFFECT
  useEffect(() => {
    if (!isOpen) return;

    if (!isEditMode) {
      // Create mode → reset form
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
        onSuccess("Notice updated successfully!");
      } else {
        await createNotice(formData).unwrap();
        onSuccess("Notice created successfully!");
      }
      onClose();
    } catch (error) {
      onSuccess(
        error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} notice`,
        "error"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Notice" : "Create New Notice"}
    >
      {isFetching && isEditMode ? (
        <div className="animate-pulse h-40 bg-gray-200 rounded" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            placeholder="Title"
          />

          {/* Description */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
            rows={4}
          />

          {/* Category */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select category</option>
            <option value="general">General</option>
            <option value="events">Events</option>
            <option value="volunteer">Volunteer</option>
            <option value="donations">Donations</option>
            <option value="programs">Programs</option>
            <option value="administrative">Administrative</option>
          </select>

          {/* Publish Date */}
          <input
            type="date"
            name="publishAt"
            value={formData.publishAt}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          {/* Expires At */}
          <input
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 text-white px-4 py-2 rounded"
            >
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}


// ============================================
// COMPONENT: DeleteConfirmModal
// ============================================
function DeleteConfirmModal({ isOpen, onClose, noticeId, noticeTitle, onSuccess }) {
    const [deleteNotice, { isLoading }] = useDeleteNoticeMutation();

    const handleDelete = async () => {
        try {
            await deleteNotice(noticeId).unwrap();
            onSuccess("Notice deleted successfully!");
            onClose();
        } catch (error) {
            onSuccess(error?.data?.message || "Failed to delete notice", "error");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Notice" size="sm">
            <div className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <div className="text-center">
                    <p className="text-gray-700 mb-2">Are you sure you want to delete this notice?</p>
                    <p className="text-sm font-medium text-gray-900">{noticeTitle}</p>
                    <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ============================================
// COMPONENT: NoticesTable
// ============================================
function NoticesTable({ notices, isLoading, onView, onEdit, onDelete }) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publish Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-32"></div></td>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notices found</h3>
                <p className="text-gray-600">Get started by creating your first notice.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Publish Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {notices.map((notice) => (
                            <tr key={notice._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                        {notice.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <CategoryBadge category={notice.category} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(notice.publishAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(notice.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onView(notice._id)}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                            title="View"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onEdit(notice._id)}
                                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(notice._id, notice.title)}
                                            className="text-red-600 hover:text-red-700 font-medium transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
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

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedNoticeId, setSelectedNoticeId] = useState(null);
    const [selectedNoticeTitle, setSelectedNoticeTitle] = useState("");

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
                        <p className="text-gray-600 mt-1">Create, edit, and manage all notices</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Notice
                    </button>
                </div>

                {/* Alert */}
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {/* Error State */}
                {isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-800">
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
                    onSuccess={showAlert}
                />

                <DeleteConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={closeModals}
                    noticeId={selectedNoticeId}
                    noticeTitle={selectedNoticeTitle}
                    onSuccess={showAlert}
                />
            </div>
        </div>
    );
}