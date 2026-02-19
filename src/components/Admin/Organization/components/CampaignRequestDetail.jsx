import React from 'react';
import {
    CheckCircle, XCircle, Printer, FileText,
    Building, User, Mail, Briefcase,
    LucideMessageSquareWarning, ExternalLink,
    IndianRupee, Calendar, Image as ImageIcon,
    Play, Target, Globe
} from 'lucide-react';
import { Badge } from './Badge';
import { getMediaUrl } from '@/utils/media';

export const CampaignRequestDetail = React.memo(({
    selectedRequest: request,
    onOpenStatusUpdate,
}) => {
    if (!request) {
        return (
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm h-full">
                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <ImageIcon className="w-10 h-10 text-emerald-500/30" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Campaign Selected</h3>
                    <p className="max-w-xs mx-auto text-gray-600">Select a campaign request from the list on the left to review details and approve/reject.</p>
                </div>
            </div>
        );
    }

    const getDocUrl = (key) => getMediaUrl(key);

    return (
        <div id="printable-campaign" className="lg:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col relative shadow-sm">
            <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            {request.organizationId?.organizationLogo ? (
                                <img
                                    src={getDocUrl(request.organizationId.organizationLogo)}
                                    alt="Organization Logo"
                                    className="w-24 h-24 rounded-lg object-contain border border-gray-100 shadow-sm p-1"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <Building className="text-emerald-500" size={32} />
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                    {request.title}
                                </h2>
                                <p className="text-emerald-600 font-bold mb-2 flex items-center gap-1.5">
                                    <Building size={16} />
                                    {request.organizationName}
                                </p>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center gap-1.5 font-semibold text-xs">
                                        {request.category}
                                    </span>
                                    <span className="text-gray-500 font-medium">ID: {request._id}</span>
                                    <button
                                        onClick={() => window.print()}
                                        className="no-print p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                                    >
                                        <Printer size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Request Status</p>
                            <Badge status={request.status} size="large" />
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE DATA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">

                    {/* Financials & Deadline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatusCard
                            icon={<Target className="text-emerald-600" />}
                            label="Target Amount"
                            value={`₹${request.targetAmount?.toLocaleString()}`}
                            bgColor="bg-emerald-50"
                        />
                        <StatusCard
                            icon={<Calendar className="text-blue-600" />}
                            label="Deadline"
                            value={new Date(request.deadline).toLocaleDateString()}
                            bgColor="bg-blue-50"
                        />
                        <StatusCard
                            icon={<User className="text-purple-600" />}
                            label="Beneficiary"
                            value={request.beneficiaryName || 'Not Specified'}
                            bgColor="bg-purple-50"
                        />
                    </div>

                    {/* Campaign Media (Photo/Video) */}
                    {(request.imageUrl || request.videoUrl) && (
                        <DetailSection title="Campaign Media" icon={<ImageIcon className="text-emerald-600" />}>
                            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 max-h-[400px] flex justify-center">
                                {request.mediaType === 'video' && request.videoUrl ? (
                                    <video
                                        src={getDocUrl(request.videoUrl)}
                                        controls
                                        className="max-h-[400px] w-auto bg-black"
                                    />
                                ) : request.imageUrl ? (
                                    <img
                                        src={getDocUrl(request.imageUrl)}
                                        alt="Campaign Content"
                                        className="max-h-[400px] w-auto object-contain"
                                    />
                                ) : null}
                            </div>
                        </DetailSection>
                    )}
                    <DetailSection title="About Campaign" icon={<FileText className="text-blue-600" />}>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{request.about}</p>
                        {request.currentStatus && (
                            <div className="mt-4 p-4 bg-blue-50/30 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-700 uppercase font-bold mb-2">Current Status</p>
                                <p className="text-gray-700 text-sm leading-relaxed">{request.currentStatus}</p>
                            </div>
                        )}
                    </DetailSection>

                    {/* Badges & Flags */}
                    <DetailSection title="Campaign Features" icon={<Target className="text-blue-600" />}>
                        <div className="flex flex-wrap gap-3">
                            <Flag label="Urgent" active={request.isUrgent} />
                            <Flag label="Tax Benefits" active={request.taxBenefits} />
                            <Flag label="Zakat Verified" active={request.zakatVerified} />
                            <Flag label="Riba Eligible" active={request.ribaEligible} />
                        </div>
                    </DetailSection>

                    {/* Impact Goals */}
                    {request.impactGoals?.length > 0 && (
                        <DetailSection title="Impact Goals" icon={<Target className="text-blue-600" />}>
                            <ul className="space-y-2">
                                {request.impactGoals.map((goal, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {goal}
                                    </li>
                                ))}
                            </ul>
                        </DetailSection>
                    )}

                    {/* Documents */}
                    {request.documents?.length > 0 && (
                        <DetailSection title="Supporting Documents" icon={<FileText className="text-blue-600" />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {request.documents.map((doc, idx) => (
                                    <DocLink key={idx} label={doc.name || `Document ${idx + 1}`} url={getDocUrl(doc.fileUrl || doc)} />
                                ))}
                            </div>
                        </DetailSection>
                    )}

                    {/* Social Links */}
                    {request.socialLinks && Object.values(request.socialLinks).some(v => v) && (
                        <DetailSection title="Social Media Promotion" icon={<Globe className="text-blue-600" />}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(request.socialLinks).map(([platform, url]) => url && (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 hover:border-emerald-500 transition-all"
                                    >
                                        <span className="text-xs font-bold capitalize">{platform}</span>
                                        <ExternalLink size={10} className="text-gray-400" />
                                    </a>
                                ))}
                            </div>
                        </DetailSection>
                    )}

                    {/* Admin Feedback Section */}
                    {request.adminStatement && (
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                            <div className="flex items-center gap-2 mb-3">
                                <LucideMessageSquareWarning className="text-amber-600" size={20} />
                                <h3 className="text-lg font-bold text-amber-800">Latest Feedback</h3>
                            </div>
                            <p className="text-amber-900 text-sm italic">"{request.adminStatement}"</p>
                        </div>
                    )}

                    {/* Organization Statement / Comment */}
                    {request.organizationStatement && (
                        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Building className="text-emerald-600" size={20} />
                                <h3 className="text-lg font-bold text-emerald-800">Organization Response</h3>
                            </div>
                            <p className="text-emerald-900 text-sm italic">"{request.organizationStatement}"</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {request.status === 'pending' || request.status === 'clarification' ? (
                    <div className="no-print border-t border-gray-200 p-6 bg-white absolute bottom-0 w-full z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                        <div className="flex justify-start gap-3">
                            <button
                                onClick={() => onOpenStatusUpdate('clarification')}
                                className="px-5 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all font-semibold text-sm"
                            >
                                Request Clarification
                            </button>
                            <button
                                onClick={() => onOpenStatusUpdate('rejected')}
                                className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border border-red-200 transition-all font-semibold text-sm"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onOpenStatusUpdate('approved')}
                                className="px-8 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold"
                            >
                                Approve & Go Live
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

function DetailSection({ title, icon, children }) {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function StatusCard({ icon, label, value, bgColor }) {
    return (
        <div className={`${bgColor} rounded-xl p-4 border border-white/50 flex items-center gap-3`}>
            <div className="p-2 bg-white rounded-lg shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</p>
                <p className="text-gray-900 font-bold">{value}</p>
            </div>
        </div>
    );
}

function Flag({ label, active }) {
    return (
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${active
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-gray-50 border-gray-100 text-gray-400 opacity-50"
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
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 hover:border-blue-500 rounded-xl transition-all group"
        >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="text-blue-600 w-4 h-4" />
            </div>
            <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-800 truncate">{label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">View file</p>
            </div>
        </a>
    );
}
