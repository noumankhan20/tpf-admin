import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X as XIcon, Plus } from 'lucide-react';

export const GroundReportModal = React.memo(({
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
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
                    >
                        {/* Modal Header */}
                        <div className={`px-6 py-4 flex items-center justify-between text-white ${status === 'approved' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                            <div className="flex items-center gap-3">
                                {status === 'approved' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                <h2 className="text-xl font-bold italic">Ground Report - {status === 'approved' ? 'Approve' : 'Reject'}</h2>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <XIcon size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Ground Verification Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain the basis of your decision (e.g., 'I visited their home, reviewed physical documents, case is genuine...')"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    rows="5"
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Upload Verification Photos
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                    {images.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-gray-100">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => onRemoveImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <XIcon size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group bg-gray-50 text-gray-400 hover:text-blue-600">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={onImageChange}
                                        />
                                        <Plus size={24} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Add Photo</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSubmit}
                                disabled={isUpdating}
                                className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                {isUpdating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Submit Ground Report
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});

GroundReportModal.displayName = 'GroundReportModal';
