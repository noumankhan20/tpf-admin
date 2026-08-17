import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';

export const GroundReportModal = ({
    isOpen,
    onClose,
    status,
    reason,
    setReason,
    onSubmit,
    isUpdating
}) => {
    if (!isOpen) return null;

    const isApprove = status === 'verified' || status === 'approved';
    const isReject = status === 'rejected';
    const isClarification = status === 'clarification_requested' || status === 'clarification';

    const getTitle = () => {
        if (isApprove) return 'Confirm Verification & Approval';
        if (isReject) return 'Confirm Rejection';
        if (isClarification) return 'Request Clarification';
        return 'Update Status';
    };

    const getSubtitle = () => {
        if (isApprove) return 'The organization will be marked as verified and granted full operational access.';
        if (isReject) return 'The application will be rejected and feedback notes recorded.';
        if (isClarification) return 'The organization will be requested to provide updated information or documents.';
        return 'Update verification status for this entity.';
    };

    const getBtnColor = () => {
        if (isApprove) return 'bg-emerald-600 hover:bg-emerald-700 text-white';
        if (isReject) return 'bg-rose-600 hover:bg-rose-700 text-white';
        if (isClarification) return 'bg-amber-600 hover:bg-amber-700 text-white';
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col z-10"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">{getTitle()}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{getSubtitle()}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-slate-200/70 rounded text-slate-400 hover:text-slate-600 transition">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {isClarification ? 'Clarification Requirements / Instructions' : 'Verification Notes & Reason'}
                        </label>
                        <textarea
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 text-xs text-slate-900 placeholder:text-slate-400 transition resize-none h-32 font-medium"
                            placeholder={isClarification ? 'Specify exact documents, certificate updates, or corrections required...' : 'Enter administrative notes or justification for this decision...'}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex justify-end gap-2.5">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isUpdating || !reason.trim()}
                            onClick={onSubmit}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${getBtnColor()}`}
                        >
                            {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send size={13} />
                            )}
                            Confirm Action
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
