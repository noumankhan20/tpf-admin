import React from 'react';
import {
    CheckCircle, XCircle, X as XIcon, Camera, Printer, FileText,
    Building, User, Phone, Mail, MapPin, Briefcase, CreditCard, Users,
    LucideMessageSquareWarning
} from 'lucide-react';
import { Badge } from './Badge';

import { useGetFormByIdQuery } from '@/utils/slices/financialAidApiSlice';
import { getMediaUrl } from '@/utils/media';
import { formatFieldValue } from '@/utils/formatters';

export const RequestDetail = React.memo(({
    selectedForm: summaryForm, // Recieve summary from list
    onOpenGroundReport,
}) => {
    // Fetch full details
    const { data: fullFormData, isLoading: isDetailsLoading } = useGetFormByIdQuery(summaryForm?._id, {
        skip: !summaryForm?._id
    });

    const selectedForm = fullFormData?.data || summaryForm;

    if (!summaryForm) {
        return (
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm h-full print:h-auto">
                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <FileText className="w-10 h-10 text-blue-500/30" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Application Selected</h3>
                    <p className="max-w-xs mx-auto text-gray-600">Select a form from the list on the left to view full details and perform actions.</p>
                </div>
            </div>
        );
    }

    return (
        <div id="printable-form" className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm print:overflow-visible print:h-auto">
            <div className="flex flex-col h-full print:h-auto print:overflow-visible">
                {/* Detail Header */}
                <div className="p-6 border-b border-gray-200 bg-white backdrop-blur-sm z-10 sticky top-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {formatFieldValue('name', selectedForm.fullName || selectedForm.organizationName)}
                                {selectedForm.formType === 'other' && selectedForm.relationName && (
                                    <span className="text-gray-400 font-medium text-lg ml-2"> (For: {formatFieldValue('name', selectedForm.relationName)})</span>
                                )}
                            </h2>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1.5 text-gray-700">
                                    {selectedForm.isOrganization ? <Building size={14} className="text-blue-600" /> : <User size={14} className="text-emerald-600" />}
                                    {selectedForm.isOrganization ? 'Organization' : 'Individual'}
                                </span>
                                <span className="text-gray-600">ID: {selectedForm._id}</span>
                                <button
                                    onClick={() => window.print()}
                                    className="no-print p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                                    title="Print Form"
                                >
                                    <Printer size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 uppercase tracking-widest mb-5 font-semibold">Current Status</p>
                            <Badge status={selectedForm.status} size="large" />
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE FORM DATA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32 print:overflow-visible print:h-auto print:pb-0">

                    {/* SECTION GROUP 1: Basic Info & Address */}
                    <div className="grid grid-cols-1 gap-6 avoid-break print-grid">
                        {/* SECTION 1: Personal / Basic Info */}
                        <DetailSection title="Basic Information" icon={<User className="text-blue-600" />}>
                            <Grid>
                                <Field
                                    label={selectedForm.formType === 'other' ? "Campaigner Name" : "Campaigner & Beneficiary"}
                                    value={selectedForm.fullName}
                                />
                                <Field label="Contact Number" value={selectedForm.contactNumber} icon={<Phone size={14} />} />
                                <Field label="Email Address" value={selectedForm.email} icon={<Mail size={14} />} />
                                {!selectedForm.isOrganization && (
                                    <>
                                        <Field label="Date of Birth" value={selectedForm.dateOfBirth} />
                                        <Field label="Gender" value={selectedForm.gender} />
                                        <Field label="Marital Status" value={selectedForm.maritalStatus} />
                                        {selectedForm.formType === 'other' && (
                                            <>
                                                <Field label="Relationship" value={selectedForm.relation} />
                                                <Field label="Beneficiary Name" value={selectedForm.relationName} />
                                            </>
                                        )}
                                    </>
                                )}
                            </Grid>
                        </DetailSection>

                        {/* SECTION 2: Address */}
                        <DetailSection title="Address Details" icon={<MapPin className="text-blue-600" />}>
                            <Grid cols={1}>
                                <Field label="Current Address" value={selectedForm.currentAddress} />
                                <Field label="Permanent Address" value={selectedForm.permanentAddress} />
                                <Field label="Address Same?" value={selectedForm.sameAddress ? 'Yes' : 'No'} />
                            </Grid>
                        </DetailSection>
                    </div>

                    {/* SECTION 3: Organization Specifics (if org) */}
                    {selectedForm.isOrganization && (
                        <div className="avoid-break bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
                                <Building className="w-8 h-8 text-blue-400" />
                                <h3 className="text-lg font-semibold text-gray-800">Organization Details</h3>
                            </div>
                            <Grid>
                                <Field label="Organization Name" value={selectedForm.organizationName} />
                                <Field label="Non-Profit Type" value={selectedForm.nonProfit} />
                                <Field label="Registration Number" value={selectedForm.registrationNumber} />
                                <Field label="Website" value={selectedForm.ngoWebsite} isLink />
                                <Field label="Founder Name" value={selectedForm.founderName} />
                                <Field label="Founder Email" value={selectedForm.founderEmail} />
                                <Field label="Founder Mobile" value={selectedForm.founderMobile} />
                                <Field label="Contact Person" value={selectedForm.contactName} />
                                <Field label="Contact Email" value={selectedForm.contactEmail} />
                                <Field label="Designation" value={selectedForm.designation} />
                                <Field label="Budget" value={selectedForm.budget} />
                                <Field label="Employee Strength" value={selectedForm.employeeStrength} />
                                <Field label="Volunteer Strength" value={selectedForm.volunteerStrength} />
                                <Field label="Crowdfunded Before?" value={selectedForm.crowdfundedBefore} />
                                <div className="col-span-full">
                                    <Field label="Causes Supported" value={selectedForm.causeSupported?.join(', ')} />
                                </div>
                                <div className="col-span-full">
                                    <Field label="About NGO" value={selectedForm.aboutNGO} />
                                </div>
                            </Grid>
                        </div>
                    )}

                    {/* SECTION GROUP 2: Financial/Professional & Banking */}
                    <div className="grid grid-cols-1 gap-6 avoid-break print-grid">
                        {/* SECTION 4: Professional & Financial (Individual) */}
                        {!selectedForm.isOrganization && (
                            <DetailSection title="Professional & Financial" icon={<Briefcase className="text-blue-600" />}>
                                <Grid>
                                    <Field label="Occupation" value={selectedForm.occupation} />
                                    <Field label="Monthly Income" value={selectedForm.monthlyIncome ? `₹${selectedForm.monthlyIncome}` : 'N/A'} />
                                    <Field label="Number of Dependents" value={selectedForm.numberOfDependents} />
                                </Grid>
                            </DetailSection>
                        )}

                        {/* SECTION 5: Banking Details */}
                        <DetailSection title="Banking Information" icon={<CreditCard className="text-blue-600" />}>
                            <Grid>
                                <Field label="Bank Name & Branch" value={selectedForm.bankNameBranch} />
                                <Field label="Account Number" value={selectedForm.accountNumber} copyable />
                                <Field label="IFSC Code" value={selectedForm.ifscCode} copyable />
                            </Grid>
                        </DetailSection>
                    </div>

                    {/* SECTION GROUP 3: Identity & Request */}
                    <div className="grid grid-cols-1 gap-6 avoid-break print-grid">
                        {/* SECTION 6: Identity & Certifications */}
                        <DetailSection title="Identity & Certifications" icon={<FileText className="text-blue-600" />}>
                            <Grid>
                                {!selectedForm.isOrganization ? (
                                    <>
                                        <Field label="ID Type" value={selectedForm.idType} />
                                        <Field label="Government ID Number" value={selectedForm.govIdNumber} />
                                    </>
                                ) : (
                                    <>
                                        <Field label="Has 80G?" value={selectedForm.has80G} />
                                        <Field label="80G Expiry" value={selectedForm.expiryDate} />
                                        <Field label="Has FCRA?" value={selectedForm.hasFCRA} />
                                        <Field label="PAN Card No" value={selectedForm.panCard} />
                                    </>
                                )}
                            </Grid>
                        </DetailSection>

                        {/* SECTION 7: Request Details (Hardship) */}
                        <DetailSection title="Aid Request Details" icon={<Users className="text-blue-600" />}>
                            <Grid cols={1}>
                                <Field label="Aid Type Requested" value={selectedForm.aidType} />
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-600 text-xs uppercase tracking-wider font-bold mb-2">Hardship Description</p>
                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedForm.hardshipDescription || 'No description provided.'}</p>
                                </div>
                            </Grid>
                        </DetailSection>
                    </div>

                    {/* SECTION 9: Ground Verification Report */}
                    {selectedForm.groundReport && selectedForm.groundReport.reason && (
                        <div className="avoid-break bg-white rounded-xl p-6 border-2 border-dashed border-emerald-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <CheckCircle size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 italic">Ground Verification Report</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-emerald-50/30 p-4 rounded-lg">
                                    <p className="text-xs text-emerald-700 uppercase tracking-wider font-bold mb-2">Verification Summary</p>
                                    <p className="text-gray-800 leading-relaxed italic">"{selectedForm.groundReport.reason}"</p>
                                </div>
                                {selectedForm.groundReport.images?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Verification Photos</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {selectedForm.groundReport.images.map((img, idx) => (
                                                <a
                                                    key={idx}
                                                    href={getMediaUrl(img)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-500 transition-all shadow-sm group"
                                                >
                                                    <img
                                                        src={getMediaUrl(img)}
                                                        alt={`Verification ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Camera className="text-white w-6 h-6" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION 8: Documents (Links) */}
                    <div className="print-col-span-2">
                        <DetailSection title="Uploaded Documents" icon={<FileText className="text-blue-600" />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DocLink label="Government ID" url={selectedForm.govIdDocumentPath} />
                                <DocLink label="Bank Statement" url={selectedForm.bankStatementPath} />

                                {selectedForm.isOrganization && (
                                    <>
                                        <DocLink label="80G Certificate" url={selectedForm.certification80GPath} />
                                        <DocLink label="PAN Card Image" url={selectedForm.panCardImagePath} />
                                    </>
                                )}

                                {selectedForm.supportingDocumentsPaths?.map((path, idx) => (
                                    <DocLink key={idx} label={`Supporting Doc ${idx + 1}`} url={path} />
                                ))}

                                {selectedForm.supportingPicturesPaths?.length > 0 && (
                                    <div className="col-span-full mt-6">
                                        <div className="flex items-center gap-2 text-emerald-600 mb-4">
                                            <Camera className="w-5 h-5" />
                                            <p className="text-sm font-bold uppercase tracking-wider">Supporting Pictures</p>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {selectedForm.supportingPicturesPaths.map((img, idx) => (
                                                <a
                                                    key={idx}
                                                    href={getMediaUrl(img)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-500 transition-all shadow-sm group"
                                                >
                                                    <img
                                                        src={getMediaUrl(img)}
                                                        alt={`Supporting Picture ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <FileText className="text-white w-6 h-6" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(selectedForm.clarificationDocuments?.length > 0 || selectedForm.clarificationComment) && (
                                    <>
                                        <div className="col-span-full mt-4 mb-2">
                                            <div className="flex items-center gap-2 text-purple-600">
                                                <FileText className="w-4 h-4" />
                                                <p className="text-sm font-bold uppercase tracking-wider">Clarification Response</p>
                                            </div>
                                            <div className="h-px bg-purple-200 mt-2"></div>
                                        </div>
                                        
                                        {selectedForm.clarificationComment && (
                                            <div className="col-span-full bg-purple-50 p-4 rounded-lg border border-purple-100 mb-2">
                                                <p className="text-xs text-purple-800 uppercase tracking-wider font-bold mb-1">Message from Applicant</p>
                                                <p className="text-gray-800 whitespace-pre-wrap">{selectedForm.clarificationComment}</p>
                                            </div>
                                        )}

                                        {selectedForm.clarificationDocuments?.map((path, idx) => (
                                            <DocLink key={`clarification-${idx}`} label={`Clarification Doc ${idx + 1}`} url={path} />
                                        ))}
                                    </>
                                )}
                            </div>
                        </DetailSection>
                    </div>

                </div>

                {/* Footer / Action Bar */}
                {selectedForm.status === 'pending' && (
                    <div className="border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full backdrop-blur-md z-20">
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => onOpenGroundReport('clarification')}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl border border-red-200 transition-all font-semibold"
                            >
                                <LucideMessageSquareWarning size={18} />
                                Clarification
                            </button>
                            <button
                                onClick={() => onOpenGroundReport('rejected')}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all font-semibold"
                            >
                                <XCircle size={18} />
                                Reject
                            </button>
                            <button
                                onClick={() => onOpenGroundReport('approved')}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-lg hover:-translate-y-1"
                            >
                                <CheckCircle size={20} />
                                Approve
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
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 avoid-break">
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

function Field({ label, value, icon, isLink, copyable }) {
    if (!value) return null;

    return (
        <div className="group">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-2">
                {icon && <span className="text-blue-600">{icon}</span>}
                {label}
            </p>
            {isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline hover:text-blue-700 truncate block">
                    {value}
                </a>
            ) : (
                <p className="text-gray-800 font-medium text-[15px] break-words flex items-center gap-2 print-break-all">
                    {formatFieldValue(label, value)}
                    {copyable && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(value);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-600 transition no-print"
                            title="Copy"
                        >
                            <FileText size={12} />
                        </button>
                    )}
                </p>
            )}
        </div>
    );
}

function DocLink({ label, url }) {
    if (!url) return null;
    const fullUrl = getMediaUrl(url);
    return (
        <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 hover:border-blue-500 rounded-lg transition-all group shadow-sm"
        >
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <FileText className="text-blue-600 w-5 h-5" />
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">{label}</p>
                <p className="text-xs text-gray-500 truncate no-print">Click to view document</p>
            </div>
        </a>
    );
}
