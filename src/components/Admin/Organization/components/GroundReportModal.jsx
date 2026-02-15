import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

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

    const isApprove = status === 'verified';
    const isReject = status === 'rejected';

    const getTitle = () => {
        if (isApprove) return 'Approve & Verify Organization';
        if (isReject) return 'Reject Application';
        return 'Update Verification Status';
    };

    const getBtnColor = () => {
        if (isApprove) return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20';
        if (isReject) return 'bg-red-600 hover:bg-red-700 shadow-red-500/20';
        return 'bg-blue-600 hover:bg-blue-700';
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{getTitle()}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Verification Notes</label>
                        <textarea
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none h-40 text-sm"
                            placeholder="Enter the reason or any verification notes for this action..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isUpdating || !reason.trim()}
                            onClick={onSubmit}
                            className={`flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${getBtnColor()}`}
                        >
                            {isUpdating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={16} />
                            )}
                            Confirm & Update
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
