'use client';
import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Upload, Calendar, FileText, ArrowLeft, Download, AlertCircle } from 'lucide-react';
import {
    useCreateBusinessResolutionMutation,
    useGetAllBusinessResolutionsQuery,
    useUpdateBusinessResolutionMutation,
    useDeleteBusinessResolutionMutation
} from '@/utils/slices/business-resolutionApiSlice';

const BusinessResolutions = () => {
    // API Hooks
    const { data: resolutionsData, isLoading, isError, refetch } = useGetAllBusinessResolutionsQuery();
    const [createResolution, { isLoading: isCreating }] = useCreateBusinessResolutionMutation();
    const [updateResolution, { isLoading: isUpdating }] = useUpdateBusinessResolutionMutation();
    const [deleteResolution, { isLoading: isDeleting }] = useDeleteBusinessResolutionMutation();

    const [resolutions, setResolutions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResolution, setEditingResolution] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const [formData, setFormData] = useState({
        resolutionTitle: '',
        agenda: '',
        resolutionDate: new Date().toISOString().split('T')[0]
    });

    // Update local state when data is fetched
    useEffect(() => {
        if (resolutionsData?.data) {
            setResolutions(resolutionsData.data);
        }
    }, [resolutionsData]);

    const handleOpenModal = (resolution = null) => {
        if (resolution) {
            setEditingResolution(resolution);
            setFormData({
                resolutionTitle: resolution.resolutionTitle,
                agenda: resolution.agenda,
                resolutionDate: resolution.resolutionDate
                    ? new Date(resolution.resolutionDate).toISOString().split("T")[0]
                    : ""
            });
            setUploadedFiles([]);
        } else {
            setEditingResolution(null);
            setFormData({
                resolutionTitle: '',
                agenda: '',
                resolutionDate: new Date().toISOString().split('T')[0]
            });
            setUploadedFiles([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingResolution(null);
        setUploadedFiles([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + uploadedFiles.length > 1) {
            return;
        }
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveDocument = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!formData.resolutionTitle || !formData.agenda || !formData.resolutionDate) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('resolutionTitle', formData.resolutionTitle);
            submitData.append('agenda', formData.agenda);
            submitData.append('resolutionDate', formData.resolutionDate);

            uploadedFiles.forEach((file) => {
                submitData.append('documents', file);
            });

            if (editingResolution) {
                await updateResolution({
                    id: editingResolution._id,
                    formData: submitData
                }).unwrap();
            } else {
                await createResolution(submitData).unwrap();
            }

            refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save resolution:', error);
            alert('Failed to save resolution. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteResolution(id).unwrap();
            refetch();
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete resolution:', error);
            alert('Failed to delete resolution. Please try again.');
        }
    };

    const truncateText = (text, maxLength = 80) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const formatFileSize = (bytes) => {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-32">
                        <div className="text-center">
                            <div className="relative w-16 h-16 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-emerald-600 rounded-full animate-spin border-t-transparent"></div>
                            </div>
                            <p className="text-gray-600 font-medium">Loading resolutions...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-md mx-auto mt-32">
                        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Resolutions</h3>
                            <p className="text-gray-600 mb-6">There was an error retrieving your data. Please try again.</p>
                            <button
                                onClick={() => refetch()}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="mb-8 inline-flex items-center cursor-pointer gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                Business Resolutions
                            </h1>
                            <p className="text-gray-600">Centralized management of business decisions and documentation</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            disabled={isCreating}
                            className="inline-flex items-center cursor-pointer justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isCreating ? 'Creating...' : 'New Resolution'}</span>
                        </button>
                    </div>
                </div>

                {/* Table - Desktop */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Resolution Title
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Agenda
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Documents
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {resolutions.map((resolution) => (
                                    <tr key={resolution._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 text-sm">
                                                {resolution.resolutionTitle}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-600 text-sm max-w-md">
                                                {truncateText(resolution.agenda, 100)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>{resolution.documents?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                {formatDate(resolution.resolutionDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(resolution)}
                                                    disabled={isUpdating}
                                                    className="p-2 text-gray-500 cursor-pointer hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(resolution._id)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-gray-500 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cards - Mobile/Tablet */}
                <div className="lg:hidden space-y-4">
                    {resolutions.map((resolution) => (
                        <div key={resolution._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 text-base pr-2">
                                    {resolution.resolutionTitle}
                                </h3>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => handleOpenModal(resolution)}
                                        disabled={isUpdating}
                                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(resolution._id)}
                                        disabled={isDeleting}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                {truncateText(resolution.agenda, 120)}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{resolution.documents?.length || 0} files</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-xs">{formatDate(resolution.resolutionDate)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {resolutions.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resolutions Yet</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first business resolution</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-600/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Resolution</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleCloseModal();
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingResolution ? 'Edit Resolution' : 'Create Resolution'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="px-6 py-6 space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Resolution Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="resolutionTitle"
                                        value={formData.resolutionTitle}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Enter resolution title"
                                    />
                                </div>

                                {/* Agenda */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Agenda <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="agenda"
                                        value={formData.agenda}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                        placeholder="Describe the resolution agenda and key points..."
                                    />
                                </div>

                                {/* Resolution Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Resolution Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="resolutionDate"
                                        value={formData.resolutionDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Document Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Supporting Documents
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-600 text-sm mb-2">
                                            Drop your files here or click to browse
                                        </p>
                                        <p className="text-gray-500 text-xs mb-3">Documents (PDF, DOC, DOCX, XLS, XLSX, TXT)</p>
                                        <label className="inline-block cursor-pointer">
                                            <span className="text-emerald-600 text-sm font-medium hover:text-emerald-700">
                                                Select Files
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                disabled={uploadedFiles.length >= 2}
                                            />
                                        </label>
                                    </div>

                                    {/* Uploaded Files */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDocument(index)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Existing Documents */}
                                    {editingResolution?.documents && editingResolution.documents.length > 0 && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm font-medium text-gray-900 mb-3">Current Documents</p>
                                            <div className="space-y-2">
                                                {editingResolution.documents.map((doc, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <FileText className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                                                                <p className="text-xs text-gray-500">{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        {doc.signedUrl && (
                                                            <a
                                                                href={doc.signedUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span>Download</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-3 flex items-start gap-1.5">
                                                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                <span>Uploading new documents will replace the existing ones</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isCreating || isUpdating}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
                            >
                                {isCreating || isUpdating
                                    ? (editingResolution ? 'Updating...' : 'Creating...')
                                    : (editingResolution ? 'Update' : 'Create')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowDeleteConfirm(null);
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Resolution?</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                This action cannot be undone. The resolution and all associated documents will be permanently removed.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(16px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default BusinessResolutions;