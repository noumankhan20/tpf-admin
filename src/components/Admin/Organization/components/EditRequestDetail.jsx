'use client';

import React, { useState } from 'react';
import {
    CheckCircle, XCircle, Building, User, Mail, Globe, Phone, ArrowRight, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getMediaUrl } from '@/utils/media';
import { useApproveOrganizationEditMutation } from '@/utils/slices/organizationApiSlice';
import { toTitleCase } from '@/utils/formatters';

export const EditRequestDetail = ({ org, onProcessed }) => {
    const [adminNotes, setAdminNotes] = useState('');
    const [approveEdit, { isLoading }] = useApproveOrganizationEditMutation();

    if (!org || !org.editRequests) return null;

    const edit = org.editRequests;

    const handleAction = async (status) => {
        try {
            await approveEdit({ id: org._id, status, adminNotes }).unwrap();
            onProcessed();
            toast.success(`Edit request ${status} successfully`);
        } catch (err) {
            console.error(err);
            toast.error(err?.data?.message || "Action failed");
        }
    };

    const DiffRow = ({ label, current, requested, icon: Icon }) => {
        if (!requested) return null;
        return (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-slate-600">
                    <Icon size={14} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-700">{label}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    <div className="p-2.5 bg-white rounded border border-slate-200/80">
                        <p className="text-xs text-slate-400 font-medium mb-0.5">Current value</p>
                        <p className="text-slate-600 text-xs font-normal italic">{current || '—'}</p>
                    </div>
                    <div className="hidden md:flex items-center justify-center text-slate-400 font-normal">
                        <ArrowRight size={14} />
                    </div>
                    <div className="p-2.5 bg-emerald-50/70 rounded border border-emerald-200/60">
                        <p className="text-xs text-emerald-700 font-medium mb-0.5">Requested change</p>
                        <p className="text-emerald-950 text-xs font-medium">{requested}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col relative shadow-2xs">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{toTitleCase(org.organizationName)}</h2>
                    <p className="text-xs font-normal text-slate-500 mt-0.5">Proposed profile updates & requested changes</p>
                </div>
                <div className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200/60 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Pending approval</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar pb-24">
                
                {/* Logo Change */}
                {edit.logo && (
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Building size={14} className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-700">Organization logo</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                            <div className="flex flex-col items-center gap-2 p-2.5 bg-white rounded border border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">Current logo</p>
                                <img src={getMediaUrl(org.organizationLogo)} className="w-14 h-14 rounded object-cover border border-slate-200" alt="Current Logo" />
                            </div>
                            <div className="hidden md:flex items-center justify-center text-slate-400">
                                <ArrowRight size={14} />
                            </div>
                            <div className="flex flex-col items-center gap-2 p-2.5 bg-emerald-50/70 rounded border border-emerald-200/60">
                                <p className="text-xs text-emerald-700 font-medium">Requested logo</p>
                                <img src={getMediaUrl(edit.logo)} className="w-14 h-14 rounded object-cover border border-emerald-400" alt="Requested Logo" />
                            </div>
                        </div>
                    </div>
                )}

                <DiffRow label="Official website URL" current={org.officialWebsite} requested={edit.officialWebsite} icon={Globe} />

                {/* Contact Details Diff */}
                {edit.contactDetails && (Object.values(edit.contactDetails).some(v => !!v)) && (
                    <div className="space-y-2.5 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact person changes</h4>
                        <DiffRow label="Contact name" current={org.contactDetails?.contactName} requested={edit.contactDetails?.contactName} icon={User} />
                        <DiffRow label="Contact email" current={org.contactDetails?.contactEmail} requested={edit.contactDetails?.contactEmail} icon={Mail} />
                        <DiffRow label="Contact number" current={org.contactDetails?.contactNumber} requested={edit.contactDetails?.contactNumber} icon={Phone} />
                    </div>
                )}

                {/* Personal Details Diff */}
                {edit.personalDetails && (Object.values(edit.personalDetails).some(v => !!v)) && (
                    <div className="space-y-2.5 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Director / Founder changes</h4>
                        <DiffRow label="Name" current={org.isNGO ? org.ngoDetails?.founderName : org.companyDetails?.directorName} requested={edit.personalDetails?.name} icon={User} />
                        <DiffRow label="Email address" current={org.isNGO ? org.ngoDetails?.founderEmail : org.companyDetails?.directorEmail} requested={edit.personalDetails?.email} icon={Mail} />
                        <DiffRow label="Mobile number" current={org.isNGO ? org.ngoDetails?.founderMobile : org.companyDetails?.directorMobile} requested={edit.personalDetails?.mobile} icon={Phone} />
                    </div>
                )}
            </div>

            {/* Footer Action Bar */}
            <div className="border-t border-slate-200/80 px-6 py-3.5 bg-white sticky bottom-0 z-20">
                <div className="mb-3">
                    <textarea
                        placeholder="Add admin notes or reason for approval / rejection..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg focus:bg-white focus:outline-none focus:border-slate-400 transition resize-none font-normal placeholder:text-slate-400"
                        rows={2}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100/80 rounded-lg border border-rose-200/70 transition text-xs font-medium cursor-pointer disabled:opacity-50"
                    >
                        <XCircle size={14} />
                        Reject changes
                    </button>
                    <button
                        onClick={() => handleAction('approved')}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-2xs transition text-xs font-medium cursor-pointer disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={14} />}
                        Approve & apply updates
                    </button>
                </div>
            </div>
        </div>
    );
};
