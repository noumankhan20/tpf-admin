import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Trash2, Send } from 'lucide-react';

export const GroundReportModal = ({
    isOpen,
    onClose,
    status,
    reason,
    setReason,
    images,
    onImageChange,
    onRemoveImage,
    onSubmit,
    isUpdating
}) => {
    if (!isOpen) return null;

    const isApprove = status === 'approved' || status === 'active';
    const isReject = status === 'rejected';
    const isInactive = status === 'inactive';
    const isClarification = status === 'clarification';

    const getTitle = () => {
        if (isApprove) return 'Approve & Activate Organization';
        if (isReject) return 'Reject Application';
        if (isInactive) return 'Deactivate Organization';
        if (isClarification) return 'Request Clarification';
        return 'Update Status';
    };

    const getBtnColor = () => {
        if (isApprove) return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20';
        if (isReject) return 'bg-red-600 hover:bg-red-700 shadow-red-500/20';
        if (isInactive) return 'bg-gray-600 hover:bg-gray-700 shadow-gray-500/20';
        if (isClarification) return 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20';
        return 'bg-blue-600 hover:bg-blue-700';
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
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
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <h3 className="text-xl font-bold text-gray-800">{getTitle()}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Reason / Message */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                {isClarification ? 'Message to Organization' : 'Verification Notes / Reason'}
                            </label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none h-32"
                                placeholder={isClarification ? "Request specific missing documents or clarifications..." : "Enter verification findings or reason for this status change..."}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>

                        {/* Images - Skip for Clarification */}
                        {!isClarification && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Verification Photos (Optional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm bg-gray-100">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => onRemoveImage(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all text-gray-400 hover:text-blue-500">
                                        <Upload size={24} />
                                        <span className="text-xs font-bold uppercase">Add Photo</span>
                                        <input type="file" multiple className="hidden" onChange={onImageChange} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
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
                            {isClarification ? 'Send Message' : 'Confirm & Update Status'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
