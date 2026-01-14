'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetAgreementByIdQuery, useUpdateAgreementMutation, useUpdatePartySignatureMutation, useUpdateAgreementDocumentsMutation } from '@/utils/slices/documentationApiSlice';
import {
    ArrowLeft,
    FileText,
    Calendar,
    Users,
    IndianRupee,
    FileCheck,
    Save,
    X,
    Loader2,
    CheckCircle
} from 'lucide-react';

export default function EditAgreement() {
    const { id } = useParams();
    const router = useRouter();
    const [pendingSignatures, setPendingSignatures] = useState({});
    const [pendingDocuments, setPendingDocuments] = useState({
        signed: [],
        supporting: [],
        amendments: [],
    });

    const [formData, setFormData] = useState({
        agreementTitle: '',
        agreementType: '',
        status: '',
        financialValue: '',
        scope: '',
        keyTerms: '',
        dates: {
            creationDate: '',
            signingDate: '',
            startDate: '',
            endDate: ''
        }
    });

    const { data, isLoading, isError } = useGetAgreementByIdQuery(id, {
        skip: !id,
    });
    const [updateAgreement, { isLoading: isUpdating }] = useUpdateAgreementMutation();
    const [updatePartySignature, { isLoading: isUploadingSignature }] =
        useUpdatePartySignatureMutation();
    const [updateAgreementDocuments, { isLoading: isUploadingDocuments }] =
        useUpdateAgreementDocumentsMutation();

    const agreement = data?.data;

    useEffect(() => {
        if (agreement) {
            setFormData({
                agreementTitle: agreement.agreementTitle || '',
                agreementType: agreement.agreementType || '',
                status: agreement.status || '',
                financialValue: agreement.financialValue || '',
                scope: agreement.scope || '',
                keyTerms: agreement.keyTerms || '',
                dates: {
                    creationDate: agreement.dates?.creationDate ? new Date(agreement.dates.creationDate).toISOString().split('T')[0] : '',
                    signingDate: agreement.dates?.signingDate ? new Date(agreement.dates.signingDate).toISOString().split('T')[0] : '',
                    startDate: agreement.dates?.startDate ? new Date(agreement.dates.startDate).toISOString().split('T')[0] : '',
                    endDate: agreement.dates?.endDate ? new Date(agreement.dates.endDate).toISOString().split('T')[0] : ''
                }
            });
        }
    }, [agreement]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            dates: {
                ...prev.dates,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1️⃣ Update agreement fields
            await updateAgreement({
                id,
                data: formData,
            }).unwrap();

            // 2️⃣ Upload signatures
            for (const [partyId, file] of Object.entries(pendingSignatures)) {
                await updatePartySignature({
                    agreementId: id,
                    partyId,
                    file,
                }).unwrap();
            }

            // 3️⃣ Upload documents
            const hasDocs = Object.values(pendingDocuments).some(
                (arr) => arr.length > 0
            );

            if (hasDocs) {
                await updateAgreementDocuments({
                    id,
                    files: pendingDocuments,
                }).unwrap();
            }

            router.push('/documentation-management');
        } catch (err) {
            console.error(err);
        }
    };

    const documentsByType = React.useMemo(() => {
        const map = {
            signed: [],
            supporting: [],
            amendments: [],
        };

        agreement?.documents?.forEach((doc) => {
            map[doc.fileType]?.push(doc);
        });

        return map;
    }, [agreement]);



    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-slate-700 animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">Loading agreement details...</p>
                </div>
            </div>
        );
    }


    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <X className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Failed to load agreement</h3>
                    <p className="text-slate-500 mb-6">Please try again later</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-semibold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!agreement) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600">No agreement found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-b border-slate-700/50">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2.5 hover:bg-white/10 rounded-lg cursor-pointer transition-all text-white/80 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">Edit Agreement</h1>
                                    <p className="text-white text-sm mt-0.5">Update agreement information and details</p>
                                </div>
                            </div>
                        </div>
                        {agreement.referenceNumber && (
                            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                {agreement.referenceNumber}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-600" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Agreement Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="agreementTitle"
                                        value={formData.agreementTitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900"
                                        placeholder="Enter agreement title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Agreement Type *
                                    </label>
                                    <select
                                        name="agreementType"
                                        value={formData.agreementType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-white text-slate-900"
                                        required
                                    >
                                        <option value="">Select type</option>
                                        <option value="Contract">Contract</option>
                                        <option value="MoU">MoU</option>
                                        <option value="NDA">NDA</option>
                                        <option value="Service Agreement">Service Agreement</option>
                                        <option value="Partnership Agreement">Partnership Agreement</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-white text-slate-900"
                                        required
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Signed">Signed</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Terminated">Terminated</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <IndianRupee className="w-4 h-4" />
                                        Financial Value
                                    </label>
                                    <input
                                        type="number"
                                        name="financialValue"
                                        value={formData.financialValue}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900"
                                        placeholder="Enter financial value"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-600" />
                                Timeline
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Creation Date
                                    </label>
                                    <input
                                        type="date"
                                        name="creationDate"
                                        value={formData.dates.creationDate}
                                        onChange={handleDateChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Signing Date
                                    </label>
                                    <input
                                        type="date"
                                        name="signingDate"
                                        value={formData.dates.signingDate}
                                        onChange={handleDateChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.dates.startDate}
                                        onChange={handleDateChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.dates.endDate}
                                        onChange={handleDateChange}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agreement Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-slate-600" />
                                Agreement Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Scope
                                </label>
                                <textarea
                                    name="scope"
                                    value={formData.scope}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900 resize-none"
                                    placeholder="Enter agreement scope"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Key Terms
                                </label>
                                <textarea
                                    name="keyTerms"
                                    value={formData.keyTerms}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-slate-900 resize-none"
                                    placeholder="Enter key terms"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parties Info (Read-only) */}
                    {agreement.parties.map((party) => (
                        <div key={party._id} className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{party.name}</h3>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                                        {party.type}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-sm mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 w-14">Email:</span>
                                    <span className="text-slate-900 truncate">{party.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 w-14">Phone:</span>
                                    <span className="text-slate-900">{party.phone}</span>
                                </div>
                            </div>

                            {/* 👇 Signature preview */}
                            {party.signatureUrl && (
                                <div className="mb-3">
                                    <img
                                        src={party.signatureUrl}
                                        alt="Signature"
                                        className="max-h-20 object-contain border rounded"
                                    />
                                </div>
                            )}

                            {/* 👇 Signature upload */}
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Replace Signature
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    setPendingSignatures((prev) => ({
                                        ...prev,
                                        [party._id]: file,
                                    }));
                                }}

                                className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3
                 file:rounded-lg file:border-0
                 file:bg-slate-100 file:text-slate-700
                 hover:file:bg-slate-200"
                            />
                        </div>
                    ))}


                    {/* Documents Info (Read-only) */}
                    {agreement.documents && agreement.documents.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-sm border border-purple-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-purple-100 to-purple-50 border-b border-purple-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Attached Documents (Read-only)
                                    </h2>
                                    <span className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                                        {agreement.documents.length} {agreement.documents.length === 1 ? 'Document' : 'Documents'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {agreement.documents.map((doc) => (
                                        <div key={doc._id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                                            <div className="p-2.5 bg-slate-100 rounded-lg">
                                                <FileText className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{doc.fileName}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium uppercase">
                                                        {doc.fileType}
                                                    </span>
                                                    <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Upload New Documents */}
                    {/* Documents Management */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-600" />
                                Documents
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {["signed", "supporting", "amendments"].map((type) => {
                                const existingDocs = documentsByType[type];

                                return (
                                    <div key={type} className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-700 capitalize">
                                            {type} document
                                        </h4>

                                        {/* Existing documents */}
                                        {existingDocs.length > 0 && (
                                            <div className="space-y-2">
                                                {existingDocs.map((doc) => (
                                                    <div
                                                        key={doc._id}
                                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                                                    >
                                                        <span className="text-sm text-slate-800 truncate">
                                                            {doc.fileName}
                                                        </span>

                                                        <span className="text-xs text-slate-500">
                                                            {(doc.fileSize / 1024).toFixed(1)} KB
                                                        </span>
                                                    </div>
                                                ))}

                                                {/* Replace option */}
                                                <label className="block text-xs font-semibold text-slate-600 mt-2">
                                                    Replace {type} document
                                                </label>
                                                <input
                                                    type="file"
                                                    onChange={(e) =>
                                                        setPendingDocuments((prev) => ({
                                                            ...prev,
                                                            [type]: Array.from(e.target.files),
                                                        }))
                                                    }
                                                    className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-slate-100 file:text-slate-700
                hover:file:bg-slate-200"
                                                />
                                            </div>
                                        )}

                                        {/* Upload option (only if none exist) */}
                                        {existingDocs.length === 0 && (
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                    Upload {type} document
                                                </label>
                                                <input
                                                    type="file"
                                                    onChange={(e) =>
                                                        setPendingDocuments((prev) => ({
                                                            ...prev,
                                                            [type]: Array.from(e.target.files),
                                                        }))
                                                    }
                                                    className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-slate-100 file:text-slate-700
                hover:file:bg-slate-200"
                                                />
                                            </div>
                                        )}

                                        {/* Pending indicator */}
                                        {pendingDocuments[type].length > 0 && (
                                            <p className="text-xs text-amber-600">
                                                {pendingDocuments[type].length} file(s) selected — will upload on Save
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>



                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating || isUploadingSignature || isUploadingDocuments}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}