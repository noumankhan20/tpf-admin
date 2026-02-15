import React from 'react';
import {
    CheckCircle, XCircle, X as XIcon, Camera, Printer, FileText,
    Building, User, Phone, Mail, MapPin, Briefcase, CreditCard, Users,
    LucideMessageSquareWarning, Power, ShieldOff
} from 'lucide-react';
import { Badge } from './Badge';

import { useGetFormByIdQuery } from '@/utils/slices/financialAidApiSlice';
import { getMediaUrl } from '@/utils/media';

export const RequestDetail = React.memo(({
    selectedForm: summaryForm,
    onOpenGroundReport,
    isOrganizationPage = false
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
                    <p className="max-w-xs mx-auto text-gray-600">Select an organization from the list on the left to view full details and perform actions.</p>
                </div>
            </div>
        );
    }

    const isCurrentlyApproved = selectedForm.status === 'approved' || selectedForm.status === 'active';
    const isCurrentlyInactive = selectedForm.status === 'inactive';

    return (
        <div id="printable-form" className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm print:overflow-visible print:h-auto">
            <div className="flex flex-col h-full print:h-auto print:overflow-visible">
                {/* Detail Header */}
                <div className="p-6 border-b border-gray-200 bg-white backdrop-blur-sm z-10 sticky top-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {selectedForm.organizationName || selectedForm.fullName}
                            </h2>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1.5 text-gray-700">
                                    <Building size={14} className="text-blue-600" />
                                    Organization
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
                            <Badge status={selectedForm.status === 'approved' ? 'active' : selectedForm.status} size="large" />
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE FORM DATA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32 print:overflow-visible print:h-auto print:pb-0">

                    {/* NGO Registration Form Information */}
                    <DetailSection title="Organization Registration Information" icon={<Building className="text-blue-600" />}>
                        <Grid>
                            <Field label="Organization Name" value={selectedForm.organizationName || selectedForm.fullName} />
                            <Field label="Registration Type" value={selectedForm.nonProfit} />
                            <Field label="Organization Type Description" value={selectedForm.organizationTypeDescription} />
                            <Field label="City" value={selectedForm.city} />
                            <Field label="Founder Name" value={selectedForm.founderName} />
                            <Field label="Founder Email" value={selectedForm.founderEmail} />
                            <Field label="Founder Mobile" value={selectedForm.founderMobile} />
                            <Field label="Website" value={selectedForm.ngoWebsite} isLink />
                            <div className="col-span-full">
                                <Field label="Cause Supported" value={selectedForm.causeSupported?.join(', ')} />
                            </div>
                            <div className="col-span-full">
                                <Field label="About NGO" value={selectedForm.aboutNGO} />
                            </div>
                        </Grid>
                    </DetailSection>

                    {/* Contact Person Details */}
                    <DetailSection title="Contact Person Details" icon={<User className="text-blue-600" />}>
                        <Grid>
                            <Field label="Contact Name" value={selectedForm.contactName} />
                            <Field label="Contact Number" value={selectedForm.contactNumber} />
                            <Field label="Email Address" value={selectedForm.email} />
                            <Field label="Designation" value={selectedForm.designation} />
                        </Grid>
                    </DetailSection>

                    {/* Organization Profile Details */}
                    <DetailSection title="Organization Profile" icon={<Briefcase className="text-blue-600" />}>
                        <Grid>
                            <Field label="Budget" value={selectedForm.budget} />
                            <Field label="Donor Database" value={selectedForm.donorDatabase} />
                            <Field label="Full Time Fundraising" value={selectedForm.fullTimeFundraising} />
                            <Field label="Crowdfunded Before?" value={selectedForm.crowdfundedBefore} />
                            <Field label="Employee Strength" value={selectedForm.employeeStrength} />
                            <Field label="Volunteer Strength" value={selectedForm.volunteerStrength} />
                            <Field label="Organize Events?" value={selectedForm.organizeEvents} />
                        </Grid>
                    </DetailSection>

                    {/* Certifications & Identity */}
                    <DetailSection title="Identity & Certifications" icon={<FileText className="text-blue-600" />}>
                        <Grid>
                            <Field label="Has 80G?" value={selectedForm.has80G} />
                            <Field label="80G Expiry" value={selectedForm.expiryDate} />
                            <Field label="Has FCRA?" value={selectedForm.hasFCRA} />
                            <Field label="PAN Card No" value={selectedForm.panCard} />
                        </Grid>
                    </DetailSection>

                    {/* Ground Verification Report */}
                    {selectedForm.groundReport && selectedForm.groundReport.reason && (
                        <div className="avoid-break bg-white rounded-xl p-6 border-2 border-dashed border-emerald-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <CheckCircle size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 italic">Verification Report</h3>
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

                    {/* Uploaded Documents */}
                    <div className="print-col-span-2">
                        <DetailSection title="Uploaded Documents" icon={<FileText className="text-blue-600" />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DocLink label="80G Certificate" url={selectedForm.certification80GPath} />
                                <DocLink label="PAN Card Image" url={selectedForm.panCardImagePath} />
                                <DocLink label="Registration Document" url={selectedForm.registrationDocPath} />
                                <DocLink label="PAN Card Document" url={selectedForm.panCardDocPath} />
                            </div>
                        </DetailSection>
                    </div>

                </div>

                {/* Footer / Action Bar */}
                <div className="border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full backdrop-blur-md z-20">
                    <div className="flex justify-end gap-4">
                        {selectedForm.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => onOpenGroundReport('clarification')}
                                    className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all font-semibold"
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
                                    onClick={() => onOpenGroundReport('active')}
                                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-lg hover:-translate-y-1"
                                >
                                    <CheckCircle size={20} />
                                    Approve & Activate
                                </button>
                            </>
                        )}

                        {(isCurrentlyApproved || isCurrentlyInactive) && (
                            <>
                                <button
                                    onClick={() => onOpenGroundReport(isCurrentlyApproved ? 'inactive' : 'active')}
                                    className={`flex items-center gap-2 px-6 py-3 ${isCurrentlyApproved ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'} rounded-xl transition-all font-semibold shadow-sm`}
                                >
                                    {isCurrentlyApproved ? <ShieldOff size={18} /> : <Power size={18} />}
                                    {isCurrentlyApproved ? 'Deactivate Organization' : 'Reactivate Organization'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
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
                    {value}
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
