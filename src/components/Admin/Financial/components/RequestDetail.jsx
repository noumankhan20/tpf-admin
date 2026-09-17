import React from 'react';
import {
    CheckCircle, XCircle, X as XIcon, Camera, Printer, FileText,
    Building, User, Phone, Mail, MapPin, Briefcase, CreditCard, Users,
    LucideMessageSquareWarning
} from 'lucide-react';
import { Badge } from './Badge';
import { toast } from 'react-toastify';

import { useGetFormByIdQuery, useLinkCampaignMutation } from '@/utils/slices/financialAidApiSlice';
import { useGetCampaignListQuery } from '@/utils/slices/campaignSlice';
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

    const { data: campaignList } = useGetCampaignListQuery();
    const [linkCampaign, { isLoading: isLinking }] = useLinkCampaignMutation();
    const [selectedCampaignId, setSelectedCampaignId] = React.useState('');

    React.useEffect(() => {
        setSelectedCampaignId('');
    }, [summaryForm?._id]);

    const handleLinkCampaign = async () => {
        if (!selectedCampaignId) return;
        try {
            await linkCampaign({ id: selectedForm._id, campaignId: selectedCampaignId }).unwrap();
            toast.success("Campaign linked successfully!");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to link campaign");
        }
    };

    const handleUnlinkCampaign = async () => {
        if (!window.confirm("Are you sure you want to unlink this campaign?")) return;
        try {
            await linkCampaign({ id: selectedForm._id, campaignId: null }).unwrap();
            toast.success("Campaign unlinked successfully!");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to unlink campaign");
        }
    };

    if (!summaryForm) {
        return (
            <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm h-full print:h-auto">
                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <FileText className="w-10 h-10 text-blue-500/30" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Application Selected</h3>
                    <p className="max-w-xs mx-auto text-gray-600">Select an application from the queue list above to view full details.</p>
                </div>
            </div>
        );
    }

    const isOtherForm = selectedForm.formType === 'other';

    return (
        <div id="printable-form" className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm print:overflow-visible print:h-auto">
            <div className="flex flex-col h-full print:h-auto print:overflow-visible">
                {/* Detail Header */}
                <div className="p-6 border-b border-gray-200 bg-white backdrop-blur-sm z-10 sticky top-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {isOtherForm ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                        Relative / Other Application
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Self / Own Application
                                    </span>
                                )}
                                <span className="text-xs text-gray-500">ID: {selectedForm._id}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                {isOtherForm ? (
                                    <>
                                        <span>Campaigner: {formatFieldValue('name', selectedForm.fullName)}</span>
                                        {selectedForm.relationName && (
                                            <span className="text-emerald-700 font-bold block text-lg sm:text-xl mt-0.5">
                                                Beneficiary: {formatFieldValue('name', selectedForm.relationName)} ({selectedForm.relation || 'Relative'})
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span>{formatFieldValue('name', selectedForm.fullName || selectedForm.organizationName)}</span>
                                )}
                            </h2>
                            <div className="flex items-center gap-3 text-sm mt-2">
                                <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1.5 text-gray-700 font-medium">
                                    {selectedForm.isOrganization ? <Building size={14} className="text-blue-600" /> : <User size={14} className="text-emerald-600" />}
                                    {selectedForm.isOrganization ? 'Organization' : 'Individual'}
                                </span>
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
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">Status</p>
                            <div className="flex flex-col items-end gap-2">
                                <Badge status={selectedForm.status} size="large" />
                                {selectedForm.isSpecialCase && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase bg-purple-100 text-purple-700 border-purple-200">
                                        Special Case
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE FORM DATA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32 print:overflow-visible print:h-auto print:pb-0">

                    {/* SECTION: Campaign Linking */}
                    {selectedForm.campaignId && typeof selectedForm.campaignId === 'object' ? (
                        <DetailSection title="Linked Campaign Details" icon={<Building className="text-emerald-600" />}>
                            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">
                                            {selectedForm.campaignId.title}
                                        </h4>
                                        <p className="text-xs text-gray-500">ID: {selectedForm.campaignId._id}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                        selectedForm.campaignId.campaignStatus === 'ACTIVE' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {selectedForm.campaignId.campaignStatus}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-100">
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase tracking-wider font-bold">Raised Amount</p>
                                        <p className="text-emerald-700 font-bold text-lg">₹{selectedForm.campaignId.raisedAmount || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase tracking-wider font-bold">Target Amount</p>
                                        <p className="text-gray-800 font-bold text-lg">₹{selectedForm.campaignId.targetAmount || 0}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-3 border-t border-emerald-100 no-print">
                                    {selectedForm.campaignId.slug && (
                                        <a 
                                            href={`https://tpfaid.org/campaign/${selectedForm.campaignId.slug}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition text-sm font-semibold inline-block"
                                        >
                                            View Campaign
                                        </a>
                                    )}
                                    <button 
                                        onClick={handleUnlinkCampaign}
                                        disabled={isLinking}
                                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition text-sm font-semibold"
                                    >
                                        Unlink Campaign
                                    </button>
                                </div>
                            </div>
                        </DetailSection>
                    ) : (
                        !selectedForm.isSpecialCase && (
                            <DetailSection title="Link to Existing Campaign" icon={<Building className="text-blue-600" />}>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        This beneficiary form is not currently linked to any campaign. You can search and link it to an existing campaign that has already been created.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <select 
                                                value={selectedCampaignId}
                                                onChange={(e) => setSelectedCampaignId(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">-- Select Campaign --</option>
                                                {campaignList?.data
                                                    ?.filter(camp => !camp.isSpecialCase)
                                                    ?.map(camp => (
                                                        <option key={camp._id} value={camp._id}>
                                                            {camp.title} ({camp.beneficiaryName || 'No Beneficiary'})
                                                        </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button 
                                            onClick={handleLinkCampaign}
                                            disabled={!selectedCampaignId || isLinking}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                                        >
                                            {isLinking ? 'Linking...' : 'Link Campaign'}
                                        </button>
                                    </div>
                                </div>
                            </DetailSection>
                        )
                    )}

                    {/* SECTION: Distinct Campaigner & Beneficiary Sections */}
                    {isOtherForm ? (
                        <div className="space-y-6">
                            {/* SECTION 1: Campaigner's Details & ID */}
                            <DetailSection title="Campaigner Details & Identification" icon={<User className="text-amber-600" />}>
                                <Grid>
                                    <Field label="Campaigner Name" value={selectedForm.fullName} />
                                    <Field label="Relationship to Beneficiary" value={selectedForm.relation} />
                                    <Field label="Contact Number" value={selectedForm.contactNumber} icon={<Phone size={14} />} />
                                    <Field label="Email Address" value={selectedForm.email} icon={<Mail size={14} />} />
                                    <Field label="Campaigner ID Type" value={selectedForm.idType?.toUpperCase()} />
                                    <Field label="Campaigner Govt ID Number" value={selectedForm.govIdNumber} copyable />
                                </Grid>
                                
                                {selectedForm.govIdDocumentPath && (
                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-3">Campaigner ID Proof Document</p>
                                        <div className="max-w-xs">
                                            <DocPreview label="Campaigner Govt ID" url={selectedForm.govIdDocumentPath} badgeText="Campaigner Document" />
                                        </div>
                                    </div>
                                )}
                            </DetailSection>

                            {/* SECTION 2: Beneficiary's Details & ID */}
                            <DetailSection title="Beneficiary Details & Identification" icon={<Users className="text-emerald-600" />}>
                                <Grid>
                                    <Field label="Beneficiary Name" value={selectedForm.relationName} />
                                    <Field label="Date of Birth" value={selectedForm.dateOfBirth} />
                                    <Field label="Gender" value={selectedForm.gender} />
                                    <Field label="Marital Status" value={selectedForm.maritalStatus} />
                                    <Field label="Number of Dependents" value={selectedForm.numberOfDependents} />
                                    <Field label="Beneficiary ID Type" value={(selectedForm.beneficiaryIdType || selectedForm.details?.rawFields?.beneficiaryIdType || 'Government ID')?.toUpperCase()} />
                                    <Field label="Beneficiary Govt ID Number" value={selectedForm.beneficiaryGovIdNumber || selectedForm.details?.rawFields?.beneficiaryGovIdNumber} copyable />
                                </Grid>

                                {(selectedForm.beneficiaryGovIdDocumentPath || selectedForm.details?.files?.beneficiaryGovIdDocumentPath) && (
                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-3">Beneficiary ID Proof Document</p>
                                        <div className="max-w-xs">
                                            <DocPreview 
                                                label="Beneficiary Govt ID" 
                                                url={selectedForm.beneficiaryGovIdDocumentPath || selectedForm.details?.files?.beneficiaryGovIdDocumentPath} 
                                                badgeText="Beneficiary Document" 
                                            />
                                        </div>
                                    </div>
                                )}
                            </DetailSection>
                        </div>
                    ) : (
                        /* Self / Own Form Section */
                        <DetailSection title="Applicant & Beneficiary Information" icon={<User className="text-emerald-600" />}>
                            <Grid>
                                <Field label="Full Name" value={selectedForm.fullName} />
                                <Field label="Contact Number" value={selectedForm.contactNumber} icon={<Phone size={14} />} />
                                <Field label="Email Address" value={selectedForm.email} icon={<Mail size={14} />} />
                                <Field label="Date of Birth" value={selectedForm.dateOfBirth} />
                                <Field label="Gender" value={selectedForm.gender} />
                                <Field label="Marital Status" value={selectedForm.maritalStatus} />
                                <Field label="Number of Dependents" value={selectedForm.numberOfDependents} />
                                <Field label="ID Type" value={selectedForm.idType?.toUpperCase()} />
                                <Field label="Government ID Number" value={selectedForm.govIdNumber} copyable />
                            </Grid>

                            {selectedForm.govIdDocumentPath && (
                                <div className="mt-5 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-3">Government ID Proof Document</p>
                                    <div className="max-w-xs">
                                        <DocPreview label="Applicant Govt ID" url={selectedForm.govIdDocumentPath} badgeText="Govt ID Proof" />
                                    </div>
                                </div>
                            )}
                        </DetailSection>
                    )}

                    {/* SECTION: Address Details */}
                    <DetailSection title="Address Details" icon={<MapPin className="text-blue-600" />}>
                        <Grid cols={1}>
                            <Field label="Current Address" value={selectedForm.currentAddress} />
                            <Field label="Permanent Address" value={selectedForm.permanentAddress} />
                            <Field label="Address Same?" value={selectedForm.sameAddress ? 'Yes' : 'No'} />
                        </Grid>
                    </DetailSection>

                    {/* SECTION: Financial & Banking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 avoid-break">
                        {!selectedForm.isOrganization && (
                            <DetailSection title="Employment & Income" icon={<Briefcase className="text-blue-600" />}>
                                <Grid cols={1}>
                                    <Field label="Occupation" value={selectedForm.occupation} />
                                    <Field label="Monthly Income" value={selectedForm.monthlyIncome !== undefined ? `₹${selectedForm.monthlyIncome}` : 'N/A'} />
                                </Grid>
                            </DetailSection>
                        )}

                        <DetailSection title="Banking Information" icon={<CreditCard className="text-blue-600" />}>
                            <Grid cols={1}>
                                <Field label="Bank Name & Branch" value={selectedForm.bankNameBranch} />
                                <Field label="Account Number" value={selectedForm.accountNumber} copyable />
                                <Field label="IFSC Code" value={selectedForm.ifscCode} copyable />
                            </Grid>
                        </DetailSection>
                    </div>

                    {/* SECTION: Aid Request Details */}
                    <DetailSection title="Aid Request Details" icon={<Users className="text-blue-600" />}>
                        <Grid cols={1}>
                            <Field label="Aid Type Requested" value={selectedForm.aidType} />
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-gray-600 text-xs uppercase tracking-wider font-bold mb-2">Hardship Description</p>
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedForm.hardshipDescription || 'No description provided.'}</p>
                            </div>
                        </Grid>
                    </DetailSection>

                    {/* SECTION: Ground Verification Report */}
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
                                                <DocPreview key={idx} label={`Verification Photo ${idx + 1}`} url={img} badgeText="Ground Verification" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION: Uploaded Documents & Pictures (Visual Previews) */}
                    <DetailSection title="Uploaded Financial & Supporting Documents" icon={<FileText className="text-blue-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {selectedForm.bankStatementPath && (
                                <DocPreview label="Bank Statement" url={selectedForm.bankStatementPath} badgeText="Financial Proof" />
                            )}

                            {selectedForm.supportingDocumentsPaths?.map((path, idx) => (
                                <DocPreview key={idx} label={`Supporting Doc ${idx + 1}`} url={path} badgeText="Supporting Doc" />
                            ))}

                            {selectedForm.supportingPicturesPaths?.map((img, idx) => (
                                <DocPreview key={`pic-${idx}`} label={`Supporting Photo ${idx + 1}`} url={img} badgeText="Photo Proof" />
                            ))}

                            {selectedForm.clarificationDocuments?.map((path, idx) => (
                                <DocPreview key={`clarification-${idx}`} label={`Clarification Doc ${idx + 1}`} url={path} badgeText="Clarification" />
                            ))}
                        </div>

                        {selectedForm.clarificationComment && (
                            <div className="mt-4 bg-purple-50 p-4 rounded-lg border border-purple-100">
                                <p className="text-xs text-purple-800 uppercase tracking-wider font-bold mb-1">Clarification Response from Applicant</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{selectedForm.clarificationComment}</p>
                            </div>
                        )}
                    </DetailSection>

                </div>

                {/* Footer / Action Bar */}
                {selectedForm.status === 'pending' && (
                    <div className="border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full backdrop-blur-md z-20 fab-avoid">
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => onOpenGroundReport('special-case')}
                                className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl border border-purple-200 transition-all font-semibold cursor-pointer"
                            >
                                <CheckCircle size={18} />
                                Special Case
                            </button>
                            <button
                                onClick={() => onOpenGroundReport('clarification')}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl border border-amber-200 transition-all font-semibold cursor-pointer"
                            >
                                <LucideMessageSquareWarning size={18} />
                                Clarification
                            </button>
                            <button
                                onClick={() => onOpenGroundReport('rejected')}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all font-semibold cursor-pointer"
                            >
                                <XCircle size={18} />
                                Reject
                            </button>
                            <button
                                onClick={() => onOpenGroundReport('approved')}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-lg hover:-translate-y-1 cursor-pointer"
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
    if (value === undefined || value === null || value === '') return null;

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
                                toast.info(`Copied ${label} to clipboard!`);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-600 transition no-print cursor-pointer"
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

/* --- VISUAL DOCUMENT PREVIEW COMPONENT --- */
function DocPreview({ label, url, badgeText }) {
    if (!url) return null;
    const fullUrl = getMediaUrl(url);
    const cleanUrl = url.toLowerCase();
    const isImage = cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.png') || cleanUrl.endsWith('.webp') || cleanUrl.endsWith('.gif');
    const isPdf = cleanUrl.endsWith('.pdf');

    const handleClick = (e) => {
        e.preventDefault();
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div 
            onClick={handleClick}
            className="group relative border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col no-print"
        >
            {/* Header Badge / Label */}
            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 truncate" title={label}>{label}</span>
                {badgeText && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase shrink-0">
                        {badgeText}
                    </span>
                )}
            </div>

            {/* Thumbnail Preview Area */}
            <div className="h-44 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                {isImage ? (
                    <img 
                        src={fullUrl} 
                        alt={label} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                ) : isPdf ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs mb-2 shadow-xs">
                            PDF
                        </div>
                        <span className="text-xs text-slate-600 font-medium truncate max-w-[160px]">
                            {url.split('/').pop()}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-slate-600 font-medium truncate max-w-[160px]">
                            View Document
                        </span>
                    </div>
                )}

                {/* Hover overlay button */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5">
                        <Camera size={14} className="text-emerald-600" />
                        <span>Click to Preview Document</span>
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3.5 py-2 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span className="uppercase font-semibold text-[10px] text-slate-400">
                    {url.split('.').pop()?.toUpperCase() || 'DOC'}
                </span>
                <span className="text-emerald-600 font-medium group-hover:underline flex items-center gap-1">
                    Open document &rarr;
                </span>
            </div>
        </div>
    );
}
