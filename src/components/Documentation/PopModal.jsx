'use client';
import React from 'react';
import { X, FileText, Calendar, Users, CheckCircle, Eye, DollarSign, FileCheck, Paperclip, PenTool } from 'lucide-react';
import { useGetAgreementByIdQuery } from '@/utils/slices/documentationApiSlice';

export default function Modal({ isOpen, onClose, agreementId }) {
    const { data, isLoading, isError } = useGetAgreementByIdQuery(agreementId, {
        skip: !agreementId || !isOpen,
    });

    if (!isOpen) return null;

    const agreement = data?.data;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            Draft: 'bg-blue-50 text-blue-700 border border-blue-200',
            Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            Completed: 'bg-orange-50 text-orange-700 border border-orange-200',
            Terminated: 'bg-red-50 text-red-700 border border-red-200',
            Signed: 'bg-purple-50 text-purple-700 border border-purple-200',
            Cancelled: 'bg-gray-50 text-gray-700 border border-gray-200'
        };
        return statusStyles[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(2)} KB` : `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white px-8 py-6 rounded-t-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-10"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Agreement Overview</h2>
                                    <p className="text-slate-300 text-sm mt-0.5">Complete agreement details and documentation</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-slate-700 mb-4"></div>
                                <p className="text-sm text-slate-600 font-medium">Loading agreement details...</p>
                            </div>
                        )}

                        {isError && (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                                    <X className="w-10 h-10 text-red-500" />
                                </div>
                                <p className="text-xl font-semibold text-slate-900 mb-2">Failed to load agreement</p>
                                <p className="text-sm text-slate-500">Please try again later</p>
                            </div>
                        )}

                        {agreement && (
                            <div className="space-y-8">
                                {/* Header Section */}
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-slate-900">{agreement.agreementTitle}</h3>
                                                <span className={`px-4 py-1.5 text-xs font-semibold rounded-full ${getStatusBadge(agreement.status)}`}>
                                                    {agreement.status}
                                                </span>
                                            </div>
                                            {agreement.referenceNumber && (
                                                <p className="text-sm text-slate-600 font-mono bg-white px-3 py-1 rounded-lg inline-block">
                                                    {agreement.referenceNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Agreement Type</p>
                                            <p className="text-slate-900 font-semibold">{agreement.agreementType}</p>
                                        </div>
                                        {agreement.financialValue && (
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Financial Value</p>
                                                <p className="text-slate-900 font-bold text-lg">₹{agreement.financialValue.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Timeline
                                    </h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Created', date: agreement.dates?.creationDate },
                                            { label: 'Signed', date: agreement.dates?.signingDate },
                                            { label: 'Start', date: agreement.dates?.startDate },
                                            { label: 'End', date: agreement.dates?.endDate }
                                        ].map((item, idx) => (
                                            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{item.label}</p>
                                                <p className="text-slate-900 font-semibold">{formatDate(item.date)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Parties Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Parties & Signatures
                                    </h4>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {agreement.parties && agreement.parties.length > 0 ? (
                                            agreement.parties.map((party) => (
                                                <div key={party._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <h5 className="text-lg font-bold text-slate-900 mb-1">{party.name}</h5>
                                                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                                                                {party.type}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 mb-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="text-slate-500 font-medium min-w-[60px]">Email:</span>
                                                            <span className="text-slate-900">{party.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="text-slate-500 font-medium min-w-[60px]">Phone:</span>
                                                            <span className="text-slate-900">{party.phone}</span>
                                                        </div>
                                                    </div>

                                                    {party.signatureUrl && (
                                                        <div className="pt-4 border-t border-slate-200">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <PenTool className="w-4 h-4 text-slate-500" />
                                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                                        Signature {party.signatureType && `(${party.signatureType})`}
                                                                    </span>
                                                                </div>

                                                                {/* Download button */}
                                                                <a
                                                                    href={party.signatureUrl}
                                                                    download
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs font-semibold text-emerald-600 hover:underline"
                                                                >
                                                                    Download
                                                                </a>
                                                            </div>

                                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center min-h-[100px]">
                                                                <img
                                                                    src={party.signatureUrl}
                                                                    alt={`${party.name} signature`}
                                                                    className="max-h-[80px] max-w-full object-contain"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-sm col-span-2">No parties listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Details Section */}
                                {(agreement.scope || agreement.keyTerms) && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <FileCheck className="w-4 h-4" />
                                            Agreement Details
                                        </h4>
                                        <div className="space-y-4">
                                            {agreement.scope && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Scope</p>
                                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{agreement.scope}</p>
                                                </div>
                                            )}
                                            {agreement.keyTerms && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Key Terms</p>
                                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{agreement.keyTerms}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Documents Section */}
                                {agreement.documents && agreement.documents.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <Paperclip className="w-4 h-4" />
                                            Attached Documents ({agreement.documents.length})
                                        </h4>

                                        <div className="space-y-3">
                                            {agreement.documents.map((doc) => (
                                                <div
                                                    key={doc._id}
                                                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4"
                                                >
                                                    <div className="p-3 bg-slate-100 rounded-xl">
                                                        <FileText className="w-6 h-6 text-slate-600" />
                                                    </div>

                                                    {/* File info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                                            {doc.fileName}
                                                        </p>

                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium uppercase">
                                                                {doc.fileType}
                                                            </span>
                                                            <span>{formatFileSize(doc.fileSize)}</span>
                                                            {doc.uploadedAt && (
                                                                <span>• {formatDate(doc.uploadedAt)}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* ✅ Download button */}
                                                    <a
                                                        href={doc.fileUrl}
                                                        download={doc.fileName}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-semibold text-emerald-600 hover:underline"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Metadata Footer */}
                                <div className="pt-6 border-t border-slate-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500 font-medium mb-1">Created</p>
                                            <p className="text-slate-900 font-semibold">{formatDate(agreement.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 font-medium mb-1">Last Modified</p>
                                            <p className="text-slate-900 font-semibold">{formatDate(agreement.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-slate-50 rounded-b-3xl border-t border-slate-200">
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                            >

                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}