import React from 'react';
import {
    CheckCircle, XCircle, Printer, FileText,
    Building, LucideMessageSquareWarning, ExternalLink,
    Calendar, Image as ImageIcon, Target
} from 'lucide-react';
import { Badge } from './Badge';
import { getMediaUrl } from '@/utils/media';
import { toTitleCase } from '@/utils/formatters';

export const CampaignRequestDetail = React.memo(({
    selectedRequest: request,
    onOpenStatusUpdate,
}) => {
    if (!request) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col relative shadow-2xs h-full">
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/40">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 border border-slate-200">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">No campaign selected</h3>
                    <p className="max-w-xs mx-auto text-xs text-slate-500 font-normal leading-relaxed">
                        Select a campaign request from the queue to review proposal media, financial goals, and approve publication.
                    </p>
                </div>
            </div>
        );
    }

    const getDocUrl = (key) => getMediaUrl(key);

    return (
        <div id="printable-campaign" className="w-full bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col relative shadow-2xs">
            <div className="flex flex-col h-full">
                
                {/* Detail Identity Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div className="flex justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            {request.organizationId?.organizationLogo ? (
                                <img
                                    src={getDocUrl(request.organizationId.organizationLogo)}
                                    alt="Organization Logo"
                                    className="w-12 h-12 rounded-lg object-contain border border-slate-200 shrink-0 p-1 bg-white"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-lg shrink-0 border border-slate-200">
                                    <Building size={20} />
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 tracking-tight leading-snug">
                                    {request.title}
                                </h2>
                                <p className="text-xs font-normal text-slate-500 mt-0.5 inline-flex items-center gap-2">
                                    <span>{toTitleCase(request.organizationName)}</span>
                                    <span>·</span>
                                    <span>{toTitleCase(request.category || 'General')}</span>
                                    <span>·</span>
                                    <button
                                        onClick={() => window.print()}
                                        className="no-print text-slate-500 hover:text-slate-900 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                                        title="Print campaign details"
                                    >
                                        <Printer size={12} />
                                        <span>Print form</span>
                                    </button>
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <Badge status={request.status} />
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE WORKSPACE */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar pb-24">

                    {/* Financials & Beneficiary Summary Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <StatusCard
                            icon={<Target className="text-emerald-600" size={16} />}
                            label="Target goal amount"
                            value={`₹${request.targetAmount?.toLocaleString() || 0}`}
                            bgColor="bg-emerald-50/60 border-emerald-200/60"
                        />
                        <StatusCard
                            icon={<Calendar className="text-blue-600" size={16} />}
                            label="Campaign deadline"
                            value={new Date(request.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            bgColor="bg-blue-50/60 border-blue-200/60"
                        />
                        <StatusCard
                            icon={<Building className="text-purple-600" size={16} />}
                            label="Beneficiary"
                            value={request.beneficiaryName ? toTitleCase(request.beneficiaryName) : 'Not specified'}
                            bgColor="bg-purple-50/60 border-purple-200/60"
                        />
                    </div>

                    {/* Editorial Campaign Media Anchor */}
                    {(request.imageUrl || request.videoUrl) && (
                        <DetailSection title="Campaign media preview">
                            <div className="rounded-lg overflow-hidden border border-slate-200/80 bg-slate-950 max-h-[360px] flex justify-center">
                                {request.mediaType === 'video' && request.videoUrl ? (
                                    <video
                                        src={getDocUrl(request.videoUrl)}
                                        controls
                                        className="max-h-[360px] w-full object-contain bg-black"
                                    />
                                ) : request.imageUrl ? (
                                    <img
                                        src={getDocUrl(request.imageUrl)}
                                        alt="Campaign Content"
                                        className="max-h-[360px] w-full object-contain bg-slate-900"
                                    />
                                ) : null}
                            </div>
                        </DetailSection>
                    )}

                    {/* Campaign Narrative */}
                    <DetailSection title="Campaign narrative & proposal details">
                        <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">{request.about}</p>
                        {request.currentStatus && (
                            <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                                <p className="text-xs font-medium text-slate-500 mb-1">Current milestone / update</p>
                                <p className="text-xs text-slate-800 font-normal leading-relaxed">{request.currentStatus}</p>
                            </div>
                        )}
                    </DetailSection>

                    {/* Attributes */}
                    <DetailSection title="Compliance & campaign attributes">
                        <div className="flex flex-wrap gap-2">
                            <Flag label="Urgent need" active={request.isUrgent} />
                            <Flag label="80G tax benefits" active={request.taxBenefits} />
                            <Flag label="Zakat verified" active={request.zakatVerified} />
                            <Flag label="Riba / Interest-free eligible" active={request.ribaEligible} />
                        </div>
                    </DetailSection>

                    {/* Impact Goals */}
                    {request.impactGoals?.length > 0 && (
                        <DetailSection title="Expected impact goals">
                            <ul className="space-y-1.5">
                                {request.impactGoals.map((goal, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-normal">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span>{goal}</span>
                                    </li>
                                ))}
                            </ul>
                        </DetailSection>
                    )}

                    {/* Supporting Documents */}
                    {request.documents?.length > 0 && (
                        <DetailSection title="Supporting verification documents">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {request.documents.map((doc, idx) => (
                                    <DocLink key={idx} label={doc.name || `Document ${idx + 1}`} url={getDocUrl(doc.fileUrl || doc)} />
                                ))}
                            </div>
                        </DetailSection>
                    )}

                    {/* Social Promotion Links */}
                    {request.socialLinks && Object.values(request.socialLinks).some(v => !!v) && (
                        <DetailSection title="Social media channels">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(request.socialLinks).map(([platform, url]) => url && (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/80 hover:bg-slate-100/70 transition group"
                                    >
                                        <span className="text-xs font-medium text-slate-800 capitalize group-hover:text-blue-600">{platform}</span>
                                        <ExternalLink size={11} className="text-slate-400 group-hover:text-blue-600" />
                                    </a>
                                ))}
                            </div>
                        </DetailSection>
                    )}

                    {/* Admin Statement */}
                    {request.adminStatement && (
                        <div className="bg-amber-50/80 rounded-lg p-4 border border-amber-200/80">
                            <div className="flex items-center gap-2 mb-1">
                                <LucideMessageSquareWarning className="text-amber-700" size={16} />
                                <h3 className="text-xs font-semibold text-amber-900">Admin review feedback</h3>
                            </div>
                            <p className="text-xs text-amber-900 font-normal leading-relaxed">"{request.adminStatement}"</p>
                        </div>
                    )}

                    {/* Organization Statement */}
                    {request.organizationStatement && (
                        <div className="bg-emerald-50/80 rounded-lg p-4 border border-emerald-200/80">
                            <div className="flex items-center gap-2 mb-1">
                                <Building className="text-emerald-700" size={16} />
                                <h3 className="text-xs font-semibold text-emerald-900">Organization response</h3>
                            </div>
                            <p className="text-xs text-emerald-900 font-normal leading-relaxed">"{request.organizationStatement}"</p>
                        </div>
                    )}
                </div>

                {/* Sticky Action Bar */}
                {request.status === 'pending' || request.status === 'clarification' ? (
                    <div className="no-print border-t border-slate-200/80 px-6 py-3.5 bg-white sticky bottom-0 z-20">
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => onOpenStatusUpdate('clarification')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100/80 rounded-lg border border-amber-200/70 transition text-xs font-medium cursor-pointer"
                            >
                                <LucideMessageSquareWarning size={14} />
                                Request clarification
                            </button>
                            <button
                                onClick={() => onOpenStatusUpdate('rejected')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100/80 rounded-lg border border-rose-200/70 transition text-xs font-medium cursor-pointer"
                            >
                                <XCircle size={14} />
                                Reject campaign
                            </button>
                            <button
                                onClick={() => onOpenStatusUpdate('approved')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-2xs transition text-xs font-medium cursor-pointer"
                            >
                                <CheckCircle size={14} />
                                Approve & publish
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
});

CampaignRequestDetail.displayName = 'CampaignRequestDetail';

/* --- HELPER COMPONENTS --- */

function DetailSection({ title, children }) {
    return (
        <div className="pt-5 border-t border-slate-100 first:border-t-0 first:pt-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
            {children}
        </div>
    );
}

function StatusCard({ icon, label, value, bgColor }) {
    return (
        <div className={`${bgColor} rounded-lg p-3.5 border flex items-center gap-3`}>
            <div className="p-2 bg-white rounded-md shadow-2xs shrink-0 border border-slate-200/60">
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-slate-900 font-semibold text-sm truncate">{value}</p>
            </div>
        </div>
    );
}

function Flag({ label, active }) {
    return (
        <div className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
            active
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-slate-100 text-slate-400 border-slate-200/60 line-through opacity-60"
        }`}>
            {label}
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
                <span className="text-xs font-medium text-slate-800 truncate">{label}</span>
            </div>
            <span className="text-xs font-medium text-blue-600 group-hover:underline flex items-center gap-1 shrink-0 ml-2">
                <span>Preview</span>
                <ExternalLink size={11} />
            </span>
        </a>
    );
}
