'use client';

import React, { useState } from 'react';
import {
    CheckCircle, XCircle, Building, User, Mail, Globe, Phone, FileText, ArrowRight, Save, Loader2
} from 'lucide-react';
import { getMediaUrl } from '@/utils/media';
import { useApproveOrganizationEditMutation } from '@/utils/slices/organizationApiSlice';

export const EditRequestDetail = ({ org, onProcessed }) => {
    const [adminNotes, setAdminNotes] = useState('');
    const [approveEdit, { isLoading }] = useApproveOrganizationEditMutation();

    if (!org || !org.editRequests) return null;

    const edit = org.editRequests;

    const handleAction = async (status) => {
        try {
            await approveEdit({ id: org._id, status, adminNotes }).unwrap();
            onProcessed();
        } catch (err) {
            console.error(err);
            alert("Action failed");
        }
    };

    const DiffRow = ({ label, current, requested, icon: Icon }) => {
        if (!requested) return null;
        return (
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Icon size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current</p>
                        <p className="text-gray-600 text-sm italic">{current || '—'}</p>
                    </div>
                    <div className="hidden md:flex items-center justify-center text-blue-500">
                        <ArrowRight size={20} />
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Requested</p>
                        <p className="text-gray-800 text-sm font-bold">{requested}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm h-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{org.organizationName}</h2>
                    <p className="text-xs text-gray-500 font-medium">Edit Request ID: {org._id}</p>
                </div>
                <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200">
                    Pending Approval
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
                {/* Logo Change */}
                {edit.logo && (
                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Building size={14} className="text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Organization Logo</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Current</p>
                                <img src={getMediaUrl(org.organizationLogo)} className="w-20 h-20 rounded-lg object-cover border border-gray-100" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] text-emerald-500 font-bold uppercase">Requested</p>
                                <img src={getMediaUrl(edit.logo)} className="w-20 h-20 rounded-lg object-cover border-emerald-200 border-2 shadow-lg" />
                            </div>
                        </div>
                    </div>
                )}

                <DiffRow label="Official Website" current={org.officialWebsite} requested={edit.officialWebsite} icon={Globe} />

                {/* Contact Details Diff */}
                {edit.contactDetails && (Object.values(edit.contactDetails).some(v => !!v)) && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contact Person Changes</h4>
                        <DiffRow label="Contact Name" current={org.contactDetails?.contactName} requested={edit.contactDetails?.contactName} icon={User} />
                        <DiffRow label="Contact Email" current={org.contactDetails?.contactEmail} requested={edit.contactDetails?.contactEmail} icon={Mail} />
                        <DiffRow label="Contact Number" current={org.contactDetails?.contactNumber} requested={edit.contactDetails?.contactNumber} icon={Phone} />
                    </div>
                )}

                {/* Personal Details Diff */}
                {edit.personalDetails && (Object.values(edit.personalDetails).some(v => !!v)) && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Personal Details Changes</h4>
                        <DiffRow label="Director/Founder Name" current={org.isNGO ? org.ngoDetails?.founderName : org.companyDetails?.directorName} requested={edit.personalDetails?.name} icon={User} />
                        <DiffRow label="Director/Founder Email" current={org.isNGO ? org.ngoDetails?.founderEmail : org.companyDetails?.directorEmail} requested={edit.personalDetails?.email} icon={Mail} />
                        <DiffRow label="Director/Founder Mobile" current={org.isNGO ? org.ngoDetails?.founderMobile : org.companyDetails?.directorMobile} requested={edit.personalDetails?.mobile} icon={Phone} />
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="mb-4">
                    <textarea
                        placeholder="Add admin notes or reason for rejection..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full text-xs font-medium p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        rows={2}
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all font-semibold"
                    >
                        <XCircle size={18} />
                        Reject Changes
                    </button>
                    <button
                        onClick={() => handleAction('approved')}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-lg"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={20} />}
                        Approve & Update
                    </button>
                </div>
            </div>
        </div>
    );
};
