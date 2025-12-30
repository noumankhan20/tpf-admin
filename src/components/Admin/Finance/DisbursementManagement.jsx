'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../Common/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Search,
    FileText,
    CreditCard,
    Building,
    User,
    CheckCircle,
    Clock,
    Camera,
    X as XIcon,
    ChevronRight,
    QrCode
} from 'lucide-react';
import {
    useGetFinanceAssignmentsQuery,
    useSubmitFinanceProofMutation
} from '@/utils/slices/financeApiSlice';

export default function DisbursementManagement() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'completed'
    const [selectedTask, setSelectedTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: assignmentsData, isLoading, refetch } = useGetFinanceAssignmentsQuery();

    const assignments = assignmentsData?.data || [];

    const filteredAssignments = assignments.filter(task => {
        const matchesTab = activeTab === 'pending' ? task.status !== 'completed' : task.status === 'completed';
        const matchesSearch =
            (task.campaignName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.beneficiaryName || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const pendingCount = assignments.filter(t => t.status !== 'completed').length;
    const completedCount = assignments.filter(t => t.status === 'completed').length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push('/finance')}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Disbursement Tasks</h1>
                        <p className="text-xs text-gray-500">Process beneficiary payments and transaction proofs</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <NotificationBell moduleFilter="FINANCE_TASK" />
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<CreditCard className="text-blue-600" />}
                        label="Total Assignments"
                        value={assignments.length}
                        color="blue"
                    />
                    <StatCard
                        icon={<Clock className="text-orange-600" />}
                        label="Pending Tasks"
                        value={pendingCount}
                        color="orange"
                    />
                    <StatCard
                        icon={<CheckCircle className="text-green-600" />}
                        label="Completed Tasks"
                        value={completedCount}
                        color="green"
                    />
                </div>

                {/* Filters & Content */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Pending ({pendingCount})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'completed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Completed ({completedCount})
                            </button>
                        </div>

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns or beneficiaries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-500">Loading assignments...</div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">No {activeTab} tasks found</div>
                        ) : (
                            <table className="w-full text-left font-sans">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Campaign & Beneficiary</th>
                                        <th className="px-6 py-4">Disbursement Amount</th>
                                        <th className="px-6 py-4">Deadline</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAssignments.map((task) => (
                                        <tr key={task.taskId} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{task.campaignName}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {task.beneficiaryName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">₹{task.amount?.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">Target: ₹{task.targetAmount?.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(task.deadline).toLocaleDateString(undefined, {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${task.status === 'completed'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : task.status === 'in_progress'
                                                        ? 'bg-orange-50 text-orange-700 border-orange-100'
                                                        : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-orange-500' : 'bg-blue-500'
                                                        }`} />
                                                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedTask(task)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${task.status === 'completed'
                                                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                                        : 'text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
                                                        }`}
                                                >
                                                    {task.status === 'completed' ? 'View proof' : 'Process task'}
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <ActionModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        refetch={refetch}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    const bgColors = {
        blue: 'bg-blue-50',
        orange: 'bg-orange-50',
        green: 'bg-green-50'
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bgColors[color]} flex items-center justify-center shrink-0`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function ActionModal({ task, onClose, refetch }) {
    const [paymentMode, setPaymentMode] = useState('online'); // 'online', 'offline'
    const [proofFiles, setProofFiles] = useState([]);
    const [transactionRef, setTransactionRef] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [submitProofRequest] = useSubmitFinanceProofMutation();

    const isCompleted = task.status === 'completed';

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setProofFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setProofFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (proofFiles.length === 0) {
            alert('Please upload a proof of transaction');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitProofRequest({
                taskId: task.taskId,
                campaignId: task.campaignId,
                transactionRef,
                paymentMode,
                proofs: proofFiles
            }).unwrap();

            setUploadSuccess(true);
            setIsSubmitting(false);

            setTimeout(() => {
                refetch();
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Submit Error:', error);
            alert('Failed to process disbursement' + (error.data?.message ? ': ' + error.data.message : ''));
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isCompleted ? 'Transaction Details' : 'Process Disbursement'}</h2>
                        <p className="text-sm text-gray-500">{task.campaignName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200">
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* Bank Details Card */}
                    <div className="bg-blue-600 rounded-2xl p-6 text-white mb-8 relative overflow-hidden shadow-lg shadow-blue-200">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Building size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-4">
                                <Building size={16} /> Beneficiary Bank Details
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <p className="text-blue-100 text-xs lowercase">Bank Name & Branch</p>
                                    <p className="font-bold text-lg">{task.beneficiaryDetails?.bankNameBranch || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-xs lowercase">Account Holder</p>
                                    <p className="font-bold text-lg">{task.beneficiaryName || 'N/A'}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <p className="text-blue-100 text-xs lowercase">Account Number</p>
                                    <div className="flex items-center gap-3">
                                        <p className="font-mono text-xl tracking-wider">{task.beneficiaryDetails?.accountNumber || 'N/A'}</p>
                                        <button className="p-1 hover:bg-blue-500 rounded transition" onClick={() => navigator.clipboard.writeText(task.beneficiaryDetails?.accountNumber)}>
                                            <CreditCard size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-xs lowercase">IFSC Code</p>
                                    <p className="font-mono text-xl tracking-wider">{task.beneficiaryDetails?.ifscCode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isCompleted && !uploadSuccess && (
                        <div className="space-y-6">
                            {/* Payment Mode */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Transition Mode</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMode('online')}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${paymentMode === 'online'
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                            }`}
                                    >
                                        <QrCode size={20} />
                                        <span className="font-bold">Online</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMode('offline')}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${paymentMode === 'offline'
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                            }`}
                                    >
                                        <Building size={20} />
                                        <span className="font-bold">Offline</span>
                                    </button>
                                </div>
                            </div>

                            {/* Transaction Ref */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Transaction Reference # (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    placeholder="Enter UTR, Txn ID, or Cheque #"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Proof Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Proof (Photography)</label>
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all group cursor-pointer"
                                    onClick={() => document.getElementById('finance-proof').click()}
                                >
                                    <input
                                        type="file"
                                        id="finance-proof"
                                        multiple
                                        hidden
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf"
                                    />
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Camera className="text-gray-400" size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">Click or drag files here</p>
                                    <p className="text-xs text-gray-500 mt-1">Upload photos of receipt, screen shot, or deposit slip</p>
                                </div>

                                {proofFiles.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        {proofFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-xl">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="text-blue-600 shrink-0" size={16} />
                                                    <span className="text-xs font-medium text-blue-700 truncate">{file.name}</span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="text-blue-400 hover:text-blue-600">
                                                    <XIcon size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {uploadSuccess && (
                        <div className="py-12 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle className="text-green-600" size={40} />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Disbursement Processed!</h3>
                            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                                The transaction proof has been uploaded and the task is now marked as complete.
                            </p>
                        </div>
                    )}

                    {isCompleted && (
                        <div className="space-y-6">
                            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3">
                                <CheckCircle className="text-green-600" />
                                <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Disbursement Completed Successfully</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-gray-400 text-xs lowercase mb-1 underline">Payment Mode</p>
                                    <p className="font-bold text-gray-900 capitalize">{task.paymentMode || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-gray-400 text-xs lowercase mb-1 underline">Transaction Ref</p>
                                    <p className="font-bold text-gray-900">{task.transactionRef || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Display Proofs */}
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-3">Uploaded Proofs</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {task.proofs?.map((proof, idx) => (
                                        <a
                                            key={idx}
                                            href={`${(process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api').replace(/\/api\/?$/, '')}${proof.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-500 transition-all shadow-sm flex flex-col items-center justify-center"
                                        >
                                            {proof.fileType?.startsWith('image') ? (
                                                <img
                                                    src={`${(process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api').replace(/\/api\/?$/, '')}${proof.fileUrl}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    alt="Proof"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="text-blue-600 w-8 h-8" />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">View Document</span>
                                                </div>
                                            )}
                                        </a>
                                    ))}
                                    {(!task.proofs || task.proofs.length === 0) && (
                                        <div className="col-span-full py-4 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            No proofs available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all font-sans"
                    >
                        Close
                    </button>
                    {!isCompleted && !uploadSuccess && (
                        <button
                            disabled={isSubmitting || proofFiles.length === 0}
                            onClick={handleSubmit}
                            className={`flex-[2] px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting || proofFiles.length === 0
                                ? 'bg-gray-300 shadow-none cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle size={18} /> Process & Complete
                                </>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
