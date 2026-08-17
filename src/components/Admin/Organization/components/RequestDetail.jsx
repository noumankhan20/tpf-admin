import React from 'react';
import {
    CheckCircle, XCircle, Printer, FileText,
    Building, LucideMessageSquareWarning, ExternalLink
} from 'lucide-react';
import { Badge } from './Badge';
import { PrintableOrganizationForm } from './PrintableOrganizationForm';

import { useGetOrganizationByIdQuery } from '@/utils/slices/organizationApiSlice';
import { getMediaUrl } from '@/utils/media';
import { formatFieldValue, toTitleCase } from '@/utils/formatters';

export const RequestDetail = React.memo(({
    selectedForm: summaryOrg,
    onOpenGroundReport,
}) => {
    // Fetch full details
    const { data: fullOrgData } = useGetOrganizationByIdQuery(summaryOrg?._id, {
        skip: !summaryOrg?._id
    });

    const org = fullOrgData?.data || summaryOrg;

    if (!summaryOrg) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col relative shadow-2xs h-full">
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/40">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 border border-slate-200">
                        <Building className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">No organization selected</h3>
                    <p className="max-w-xs mx-auto text-xs text-slate-500 font-normal leading-relaxed">
                        Select a registration from the queue to review details, documents, and submit decision notes.
                    </p>
                </div>
            </div>
        );
    }

    const isNGO = org.isNGO;
    const ngoDetails = org.ngoDetails || {};
    const companyDetails = org.companyDetails || {};
    const contactDetails = org.contactDetails || {};
    const initial = org.organizationName ? org.organizationName.charAt(0).toUpperCase() : 'O';

    const getDocUrl = (key) => getMediaUrl(key);

    return (
        <>
            {/* Dedicated Formal Printable Form (Visible ONLY during window.print()) */}
            <PrintableOrganizationForm org={org} />

            {/* Interactive Web Detail View */}
            <div className="w-full bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col relative shadow-2xs no-print">
                <div className="flex flex-col h-full">
                    
                    {/* Detail Identity Header */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                        <div className="flex justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                {org.organizationLogo ? (
                                    <img
                                        src={getDocUrl(org.organizationLogo)}
                                        alt="Logo"
                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 p-0.5 bg-white"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-lg shrink-0 border border-slate-200">
                                        {initial}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight leading-snug">
                                        {toTitleCase(org.organizationName)}
                                    </h2>
                                    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-normal mt-0.5">
                                        <span>{isNGO ? 'NGO / Non-profit' : 'Corporate entity'}</span>
                                        {(org.city || org.state) && (
                                            <>
                                                <span>·</span>
                                                <span>{toTitleCase(org.city || '')}{org.state ? `, ${toTitleCase(org.state)}` : ''}</span>
                                            </>
                                        )}
                                        <span>·</span>
                                        <button
                                            onClick={() => window.print()}
                                            className="text-slate-500 hover:text-slate-900 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                                            title="Print official application form"
                                        >
                                            <Printer size={12} />
                                            <span>Print official form</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Badge status={org.verificationStatus} />
                            </div>
                        </div>
                    </div>

                    {/* SCROLLABLE DOCUMENT WORKSPACE */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">

                        {/* Basic Profile */}
                        <DetailSection title="Basic profile">
                            <Grid>
                                <Field label="Official organization email" value={org.organizationEmail} copyable />
                                <Field label="Official website" value={org.officialWebsite} isLink />
                                <Field label="Registered location" value={`${toTitleCase(org.city || '')}, ${toTitleCase(org.state || '')}`} />
                                <Field label="Application submitted" value={new Date(org.createdAt).toLocaleString()} />
                            </Grid>
                            {org.organizationDescription && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-medium text-slate-500 mb-1">Organization overview</p>
                                    <p className="text-sm text-slate-700 leading-relaxed font-normal">{org.organizationDescription}</p>
                                </div>
                            )}
                        </DetailSection>

                        {/* Primary Contact */}
                        <DetailSection title="Primary contact person">
                            <Grid>
                                <Field label="Full name" value={contactDetails.contactName} />
                                <Field label="Designation" value={contactDetails.designation} />
                                <Field label="Official email" value={contactDetails.contactEmail} copyable />
                                <Field label="Contact number" value={contactDetails.contactNumber} />
                            </Grid>
                        </DetailSection>

                        {/* NGO Compliance & Capacity */}
                        {isNGO && (
                            <>
                                <DetailSection title="NGO compliance & governance">
                                    <Grid>
                                        <Field label="Founder / President" value={ngoDetails.founderName} />
                                        <Field label="Founder email" value={ngoDetails.founderEmail} copyable />
                                        <Field label="Founder mobile" value={ngoDetails.founderMobile} />
                                        <Field label="80G certification" value={ngoDetails.has80G} />
                                        <Field label="FCRA certification" value={ngoDetails.hasFCRA} />
                                        <Field label="80G expiry date" value={ngoDetails.certification80GExpiryDate ? new Date(ngoDetails.certification80GExpiryDate).toLocaleDateString() : 'N/A'} />
                                        <Field label="PAN card number" value={ngoDetails.panCard} copyable />
                                    </Grid>
                                    {ngoDetails.causesSupported?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                            <p className="text-xs font-medium text-slate-500 mb-2">Causes supported</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {ngoDetails.causesSupported.map((cause, idx) => (
                                                    <span key={idx} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200/60">
                                                        {formatFieldValue('cause', cause)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </DetailSection>

                                <DetailSection title="Capacity & turnover">
                                    <Grid>
                                        <Field label="Annual turnover" value={ngoDetails.annualTurnover || ngoDetails.annualBudget} />
                                        <Field label="Donor database size" value={ngoDetails.donorDatabase} />
                                        <Field label="Full-time fundraising team?" value={ngoDetails.fullTimeFundraising} />
                                        <Field label="Crowdfunded before?" value={ngoDetails.crowdfundedBefore} />
                                        <Field label="Employee strength" value={ngoDetails.employeeStrength} />
                                        <Field label="Volunteer strength" value={ngoDetails.volunteerStrength} />
                                        <Field label="Organizes annual events?" value={ngoDetails.organizeEvents} />
                                    </Grid>
                                </DetailSection>
                            </>
                        )}

                        {/* Corporate Governance */}
                        {!isNGO && (
                            <DetailSection title="Corporate governance & business details">
                                <Grid>
                                    <Field label="Director / Executive name" value={companyDetails.directorName} />
                                    <Field label="Director email" value={companyDetails.directorEmail} copyable />
                                    <Field label="Director mobile" value={companyDetails.directorMobile} />
                                    <Field label="Business domain" value={companyDetails.businessDomain} />
                                    <Field label="Annual turnover" value={companyDetails.annualTurnover || companyDetails.annualRevenue} />
                                    <Field label="Employee count" value={companyDetails.numberOfEmployees} />
                                    <Field label="Years in operation" value={companyDetails.yearsInOperation} />
                                    <Field label="Document type" value={companyDetails.documentType} />
                                </Grid>
                            </DetailSection>
                        )}

                        {/* Clarification History Timeline Log */}
                        {org.clarifications && org.clarifications.length > 0 && (
                            <DetailSection title="Clarification history log">
                                <div className="space-y-3">
                                    {org.clarifications.map((item, idx) => (
                                        <div key={idx} className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5 space-y-2.5">
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                                                <span className="text-xs font-semibold text-slate-800">
                                                    Round #{idx + 1} clarification
                                                </span>
                                                <span className="text-xs text-slate-400 font-normal">
                                                    {new Date(item.requestedAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-1">Admin note:</p>
                                                <p className="text-xs font-normal text-slate-800 bg-amber-50/80 p-2.5 rounded border border-amber-200/60">
                                                    "{item.requestNotes}"
                                                </p>
                                            </div>
                                            {item.responseNotes && (
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs font-medium text-slate-500">Organization response:</p>
                                                        {item.respondedAt && (
                                                            <span className="text-xs text-slate-400 font-normal">
                                                                {new Date(item.respondedAt).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-normal text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                                                        "{item.responseNotes}"
                                                    </p>
                                                </div>
                                            )}
                                            {item.uploadedDocuments && item.uploadedDocuments.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500 mb-1.5">Uploaded attachments:</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {item.uploadedDocuments.map((docKey, dIdx) => (
                                                            <DocLink key={dIdx} label={`Clarification document ${dIdx + 1}`} url={getDocUrl(docKey)} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        {/* Current Verification Notes */}
                        {org.verificationNotes && (!org.clarifications || org.clarifications.length === 0) && (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <LucideMessageSquareWarning className="text-slate-600" size={16} />
                                    <h3 className="text-xs font-semibold text-slate-800">Admin notes</h3>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed font-normal">{org.verificationNotes}</p>
                                {org.verifiedAt && (
                                    <p className="text-xs text-slate-400 mt-2 font-normal">
                                        Verified date: {new Date(org.verifiedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Verification Documents */}
                        <DetailSection title="Verification documents">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {isNGO ? (
                                    <>
                                        <DocLink label="80G Certificate" url={getDocUrl(ngoDetails.certification80GDocument)} />
                                        <DocLink label="PAN Card Image" url={getDocUrl(ngoDetails.panCardImage)} />
                                    </>
                                ) : (
                                    <>
                                        <DocLink label="Business Registration Document" url={getDocUrl(companyDetails.businessDocument)} />
                                    </>
                                )}
                            </div>
                        </DetailSection>

                    </div>

                    {/* Footer Action Bar */}
                    {org.verificationStatus === 'pending' && (
                        <div className="no-print border-t border-slate-200/80 px-6 py-3.5 bg-white sticky bottom-0 z-20">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => onOpenGroundReport('rejected')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100/80 rounded-lg border border-rose-200/70 transition text-xs font-medium cursor-pointer"
                                >
                                    <XCircle size={14} />
                                    Reject application
                                </button>
                                <button
                                    onClick={() => onOpenGroundReport('clarification_requested')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100/80 rounded-lg border border-amber-200/70 transition text-xs font-medium cursor-pointer"
                                >
                                    <LucideMessageSquareWarning size={14} />
                                    Request clarification
                                </button>
                                <button
                                    onClick={() => onOpenGroundReport('verified')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-2xs transition text-xs font-medium cursor-pointer"
                                >
                                    <CheckCircle size={14} />
                                    Verify & approve
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
});

RequestDetail.displayName = 'RequestDetail';

/* --- HELPER COMPONENTS --- */

function DetailSection({ title, children }) {
    return (
        <div className="pt-5 border-t border-slate-100 first:border-t-0 first:pt-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
            {children}
        </div>
    );
}

function Grid({ children }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
            {children}
        </div>
    );
}

function Field({ label, value, isLink, copyable }) {
    if (!value && value !== 0) return null;

    return (
        <div className="group">
            <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
            {isLink ? (
                <a
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate inline-flex items-center gap-1 font-medium text-sm"
                >
                    {value}
                    <ExternalLink size={11} />
                </a>
            ) : (
                <p className="text-slate-900 font-normal text-sm inline-flex items-center gap-2 break-all">
                    {formatFieldValue(label, value.toString())}
                    {copyable && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(value);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 rounded text-slate-400 transition no-print cursor-pointer"
                            title="Copy"
                        >
                            <FileText size={10} />
                        </button>
                    )}
                </p>
            )}
        </div>
    );
}

function DocLink({ label, url }) {
    if (!url) return null;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-lg border border-slate-200/80 transition group"
        >
            <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText className="text-slate-500 w-4 h-4 shrink-0" />
                <span className="text-xs font-medium text-slate-800 truncate">
                    {formatFieldValue('document', label)}
                </span>
            </div>
            <span className="text-xs font-medium text-blue-600 group-hover:underline flex items-center gap-1 shrink-0 ml-2">
                <span>Preview</span>
                <ExternalLink size={11} />
            </span>
        </a>
    );
}
