import React from 'react';
import {
    CheckCircle, XCircle, Printer, FileText,
    Building, User, Mail, Briefcase,
    LucideMessageSquareWarning, ExternalLink
} from 'lucide-react';
import { Badge } from './Badge';

import { useGetOrganizationByIdQuery } from '@/utils/slices/organizationApiSlice';

export const RequestDetail = React.memo(({
    selectedForm: summaryOrg,
    onOpenGroundReport,
}) => {
    // Fetch full details
    const { data: fullOrgData, isLoading: isDetailsLoading } = useGetOrganizationByIdQuery(summaryOrg?._id, {
        skip: !summaryOrg?._id
    });

    const org = fullOrgData?.data || summaryOrg;

    if (!summaryOrg) {
        return (
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm h-full print:h-auto">
                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <FileText className="w-10 h-10 text-blue-500/30" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Organization Selected</h3>
                    <p className="max-w-xs mx-auto text-gray-600">Select a registration from the list on the left to view full details and perform actions.</p>
                </div>
            </div>
        );
    }

    const isNGO = org.isNGO;
    const ngoDetails = org.ngoDetails || {};
    const companyDetails = org.companyDetails || {};
    const contactDetails = org.contactDetails || {};

    const getDocUrl = (key) => {
        if (!key) return null;
        if (key.startsWith('http')) return key;
        // Use BACKEND_URL (root) instead of BACKEND_API (/api) for static files
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_API?.replace('/api', '');
        return `${baseUrl}/uploads/${key}`;
    };

    return (
        <div id="printable-form" className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm print:overflow-visible print:h-auto">
            <div className="flex flex-col h-full print:h-auto print:overflow-visible">
                {/* Detail Header */}
                <div className="p-6 border-b border-gray-200 bg-white backdrop-blur-sm z-10 sticky top-0">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            {org.organizationLogo && (
                                <img
                                    src={getDocUrl(org.organizationLogo)}
                                    alt="Logo"
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                                />
                            )}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                    {org.organizationName}
                                </h2>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center gap-1.5 font-semibold">
                                        <Building size={14} />
                                        {isNGO ? 'NGO' : 'Company'}
                                    </span>
                                    <span className="text-gray-500 font-medium">ID: {org._id}</span>
                                    <button
                                        onClick={() => window.print()}
                                        className="no-print p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                                        title="Print Form"
                                    >
                                        <Printer size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Verification Status</p>
                            <Badge status={org.verificationStatus} size="large" />
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE FORM DATA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32 print:overflow-visible print:h-auto print:pb-0">

                    {/* Basic Information */}
                    <DetailSection title="Basic Information" icon={<Building className="text-blue-600" />}>
                        <Grid>
                            <Field label="Email" value={org.organizationEmail} copyable />
                            <Field label="Website" value={org.officialWebsite} isLink />
                            <Field label="Location" value={`${org.city}, ${org.state}`} />
                            <Field label="Registered On" value={new Date(org.createdAt).toLocaleString()} />
                        </Grid>
                        {org.organizationDescription && (
                            <div className="mt-4 p-4 bg-white border border-gray-100 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Description</p>
                                <p className="text-gray-700 text-sm leading-relaxed">{org.organizationDescription}</p>
                            </div>
                        )}
                    </DetailSection>

                    {/* Contact Person */}
                    <DetailSection title="Contact Person" icon={<User className="text-blue-600" />}>
                        <Grid>
                            <Field label="Name" value={contactDetails.contactName} />
                            <Field label="Designation" value={contactDetails.designation} />
                            <Field label="Email" value={contactDetails.contactEmail} copyable />
                            <Field label="Number" value={contactDetails.contactNumber} />
                        </Grid>
                    </DetailSection>

                    {/* NGO Specific Details */}
                    {isNGO && (
                        <>
                            <DetailSection title="NGO Specific Details" icon={<Briefcase className="text-blue-600" />}>
                                <Grid>
                                    <Field label="Founder Name" value={ngoDetails.founderName} />
                                    <Field label="Founder Email" value={ngoDetails.founderEmail} copyable />
                                    <Field label="Founder Mobile" value={ngoDetails.founderMobile} />
                                    <Field label="80G Certification" value={ngoDetails.has80G} />
                                    <Field label="FCRA Certification" value={ngoDetails.hasFCRA} />
                                    <Field label="80G Expiry" value={ngoDetails.certification80GExpiryDate ? new Date(ngoDetails.certification80GExpiryDate).toLocaleDateString() : 'N/A'} />
                                    <Field label="PAN Card" value={ngoDetails.panCard} copyable />
                                </Grid>
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Causes Supported</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ngoDetails.causesSupported?.map((cause, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold border border-blue-100">
                                                {cause}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </DetailSection>

                            <DetailSection title="NGO Profile & Capacity" icon={<Briefcase className="text-blue-600" />}>
                                <Grid>
                                    <Field label="Annual Budget" value={ngoDetails.annualBudget} />
                                    <Field label="Donor Database" value={ngoDetails.donorDatabase} />
                                    <Field label="Fundraising Team?" value={ngoDetails.fullTimeFundraising} />
                                    <Field label="Crowdfunded Before?" value={ngoDetails.crowdfundedBefore} />
                                    <Field label="Employee Strength" value={ngoDetails.employeeStrength} />
                                    <Field label="Volunteer Strength" value={ngoDetails.volunteerStrength} />
                                    <Field label="Organize Events?" value={ngoDetails.organizeEvents} />
                                </Grid>
                            </DetailSection>
                        </>
                    )}

                    {/* Company Specific Details */}
                    {!isNGO && (
                        <DetailSection title="Company Specific Details" icon={<Building className="text-blue-600" />}>
                            <Grid>
                                <Field label="Director Name" value={companyDetails.directorName} />
                                <Field label="Director Email" value={companyDetails.directorEmail} copyable />
                                <Field label="Director Mobile" value={companyDetails.directorMobile} />
                                <Field label="Business Domain" value={companyDetails.businessDomain} />
                                <Field label="Annual Revenue" value={companyDetails.annualRevenue} />
                                <Field label="Employees" value={companyDetails.numberOfEmployees} />
                                <Field label="Years in operation" value={companyDetails.yearsInOperation} />
                                <Field label="Document Type" value={companyDetails.documentType} />
                            </Grid>
                        </DetailSection>
                    )}

                    {/* Verification Notes */}
                    {org.verificationNotes && (
                        <div className="avoid-break bg-white rounded-xl p-6 border-2 border-dashed border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <LucideMessageSquareWarning size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Admin Notes</h3>
                            </div>
                            <div className="bg-blue-50/30 p-4 rounded-lg">
                                <p className="text-gray-800 leading-relaxed italic">"{org.verificationNotes}"</p>
                                {org.verifiedAt && (
                                    <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">
                                        Verified On: {new Date(org.verifiedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    <DetailSection title="Documents" icon={<FileText className="text-blue-600" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isNGO ? (
                                <>
                                    <DocLink label="80G Certificate" url={getDocUrl(ngoDetails.certification80GDocument)} />
                                    <DocLink label="PAN Card Image" url={getDocUrl(ngoDetails.panCardImage)} />
                                </>
                            ) : (
                                <>
                                    <DocLink label="Business Registration" url={getDocUrl(companyDetails.businessDocument)} />
                                </>
                            )}
                        </div>
                    </DetailSection>

                </div>

                {/* Footer / Action Bar */}
                {org.verificationStatus === 'pending' && (
                    <div className="no-print border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full backdrop-blur-md z-20">
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => onOpenGroundReport('rejected')}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all font-semibold"
                            >
                                <XCircle size={18} />
                                Reject
                            </button>
                            <button
                                onClick={() => onOpenGroundReport('verified')}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-lg hover:-translate-y-1"
                            >
                                <CheckCircle size={20} />
                                Verify & Approve
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

RequestDetail.displayName = 'RequestDetail';

/* --- HELPER COMPONENTS --- */

function DetailSection({ title, icon, children }) {
    return (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 avoid-break shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Grid({ children, cols = 2 }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-x-8 gap-y-6`}>
            {children}
        </div>
    );
}

function Field({ label, value, isLink, copyable }) {
    if (!value && value !== 0) return null;

    return (
        <div className="group">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1.5">{label}</p>
            {isLink ? (
                <a
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline hover:text-blue-700 truncate flex items-center gap-1 font-medium"
                >
                    {value}
                    <ExternalLink size={12} />
                </a>
            ) : (
                <p className="text-gray-800 font-semibold text-sm flex items-center gap-2 break-all">
                    {value.toString()}
                    {copyable && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(value);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-400 font-normal transition no-print"
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
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 hover:border-blue-500 rounded-xl transition-all group shadow-sm"
        >
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-inner">
                <FileText className="text-blue-600 w-5 h-5" />
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase no-print">Click to view</p>
            </div>
        </a>
    );
}
