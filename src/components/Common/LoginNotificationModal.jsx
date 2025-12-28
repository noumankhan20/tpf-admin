"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Bell,
    Camera,
    Star,
    Share2,
    Wallet,
    ChevronRight,
    CheckCircle2,
    Calendar,
    User,
    ArrowRight
} from 'lucide-react';
import { useGetLoginPendingTasksQuery, useAcknowledgeTaskMutation } from '@/utils/slices/taskApiSlice';

const LoginNotificationModal = () => {
    const { data: tasksData, isLoading, refetch } = useGetLoginPendingTasksQuery();
    const [acknowledgeTask, { isLoading: isAcknowledging }] = useAcknowledgeTaskMutation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const pendingTasks = tasksData?.data || [];

    useEffect(() => {
        if (pendingTasks.length > 0) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [pendingTasks]);

    const handleAcknowledge = async () => {
        const currentTask = pendingTasks[currentIndex];
        try {
            // Acknowledge in DB
            await acknowledgeTask(currentTask._id).unwrap();

            // If the list is about to refresh and remove the current item, 
            // the next item will naturally shift to the current index.
            // If it was the last item, the array will become empty and useEffect will close it.
            if (currentIndex >= pendingTasks.length - 1 && currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            }
        } catch (err) {
            console.error("Acknowledge failed:", err);
        }
    };

    const getIcon = (module) => {
        switch (module) {
            case 'PHOTO_TASK': return <Camera className="w-8 h-8 text-emerald-500" />;
            case 'CMS_TASK': return <Star className="w-8 h-8 text-purple-500" />;
            case 'SOCIAL_TASK': return <Share2 className="w-8 h-8 text-blue-500" />;
            case 'FINANCE_TASK': return <Wallet className="w-8 h-8 text-orange-500" />;
            default: return <Bell className="w-8 h-8 text-gray-500" />;
        }
    };

    const getModuleColor = (module) => {
        switch (module) {
            case 'PHOTO_TASK': return 'from-emerald-500 to-emerald-600';
            case 'CMS_TASK': return 'from-purple-500 to-purple-600';
            case 'SOCIAL_TASK': return 'from-blue-500 to-blue-600';
            case 'FINANCE_TASK': return 'from-orange-500 to-orange-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    if (isLoading || !isOpen || pendingTasks.length === 0) return null;

    const task = pendingTasks[currentIndex];
    const campaign = task.campaignId || {};

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header Banner */}
                    <div className={`h-32 bg-gradient-to-br ${getModuleColor(task.module)} relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl p-4">
                                <img src="/TPFAid-LogoDesign-3.svg" alt="TPFAid Logo" className="w-full h-auto" />
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Progress Bar */}
                        <div className="flex gap-1.5 mb-8">
                            {pendingTasks.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-emerald-500' :
                                        idx < currentIndex ? 'bg-emerald-200' : 'bg-gray-100'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="text-center mb-8">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-4 inline-block">
                                {task.module.replace(/_/g, ' ')}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                New Assignment Received
                            </h2>
                            <p className="text-gray-500 mt-2">
                                {task.taskType.replace(/_/g, ' ')}
                            </p>
                        </div>

                        {/* Task Details Card */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                            <div className="space-y-4">
                             

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-gray-100 shrink-0">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Beneficiary</p>
                                        <p className="text-sm font-semibold text-gray-800">{campaign.beneficiaryName || 'N/A'}</p>
                                    </div>
                                </div>

                           
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleAcknowledge}
                                disabled={isAcknowledging}
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isAcknowledging ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        Mark as read
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-2">
                                Task {currentIndex + 1} of {pendingTasks.length}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginNotificationModal;
