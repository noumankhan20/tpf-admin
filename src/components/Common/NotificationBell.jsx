"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Camera, FileText, Share2, Wallet, Star, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useSocket } from '@/utils/context/SocketContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const NotificationBell = ({ moduleFilter = null }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const admin = useSelector((state) => state.adminAuth.adminInfo);
    const { socket } = useSocket();
    const dropdownRef = useRef(null);
    const router = useRouter();

    // Fetch initial pending data on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            const adminId = admin?._id || admin?.id;
            if (!adminId) return;
            try {
                const apiBase = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';

                // Fetch Tasks
                const taskRes = await fetch(`${apiBase}/workflow/tasks/pending-all`, {
                    credentials: 'include'
                });
                const taskResult = await taskRes.json();

                let allInitial = [];

                if (taskResult.success && taskResult.data) {
                    // Map task modules to admin permissions
                    const TASK_PERMISSION_MAP = {
                        'PHOTO_TASK': ['Photography', 'Photo-Editing'],
                        'CMS_TASK': ['CMS-Admin'],
                        'SOCIAL_TASK': ['Social-Media'],
                        'FINANCE_TASK': ['Finance & Accounting', 'Donation Management', 'Disbursement-Tasks'],
                    };

                    const taskNotifications = taskResult.data
                        .filter(task => {
                            const requiredModules = TASK_PERMISSION_MAP[task.module];
                            return admin?.isSuperAdmin || (requiredModules && requiredModules.some(m => admin?.modules?.includes(m)));
                        })
                        .map(task => ({
                            id: task._id,
                            type: 'TASK',
                            module: task.module,
                            title: `Pending: ${task.taskType.replace(/_/g, ' ')}`,
                            time: task.createdAt,
                            read: false, // Show red dot for pending work
                            data: task
                        }));
                    allInitial = [...taskNotifications];
                }

                // Fetch Pending Forms if in VERIFY module
                const isVerifyModule = !moduleFilter || moduleFilter === 'VERIFY';
                const isFinancialAidFilter = moduleFilter === 'FINANCIAL_AID';
                const isKYCFilter = moduleFilter === 'KYC';

                // Permission checks
                const hasFinancialAidAccess = admin?.isSuperAdmin || admin?.modules?.includes('Financial Aid');
                const hasKYCAccess = admin?.isSuperAdmin || admin?.modules?.includes('KYC Verification');

                if ((isVerifyModule || isFinancialAidFilter) && hasFinancialAidAccess) {
                    // Fetch Financial Aid Forms
                    const formRes = await fetch(`${apiBase}/admin/verify/forms?status=pending`, {
                        credentials: 'include'
                    });
                    const formResult = await formRes.json();

                    if (formResult.success && formResult.data) {
                        const formNotifications = formResult.data.map(form => ({
                            id: form._id,
                            type: 'FORM',
                            formType: form.formType || 'FINANCIAL_AID',
                            title: `Pending Verification: ${form.formType?.replace(/_/g, ' ') || 'FINANCIAL AID'}`,
                            subtitle: form.fullName || form.organizationName,
                            time: form.createdAt,
                            read: false,
                            data: form
                        }));
                        allInitial = [...allInitial, ...formNotifications];
                    }
                }

                if ((isVerifyModule || isKYCFilter) && hasKYCAccess) {
                    // Fetch KYC Requests
                    try {
                        const kycRes = await fetch(`${apiBase}/admin/kyc/requests?status=pending`, {
                            credentials: 'include'
                        });
                        const kycResult = await kycRes.json();
                        if (kycResult.success && kycResult.data) {
                            const kycNotifications = kycResult.data.map(kyc => ({
                                id: kyc._id,
                                type: 'FORM',
                                formType: 'KYC',
                                title: `Pending Verification: KYC Request`,
                                subtitle: (kyc.kycDetails?.fullLegalName || kyc.fullName || 'User'),
                                time: kyc.kycDetails.submittedAt,
                                read: false,
                                data: kyc
                            }));
                            allInitial = [...allInitial, ...kycNotifications];
                        }
                    } catch (err) {
                        console.error('KYC Notification fetch failed:', err);
                    }
                }

                // Filter by module if needed
                const filtered = moduleFilter
                    ? allInitial.filter(n => n.type === 'FORM' || n.module === moduleFilter)
                    : allInitial;

                setNotifications(filtered);
                setUnreadCount(filtered.length);
            } catch (err) {
                console.error('Failed to fetch initial notifications:', err);
            }
        };

        fetchInitialData();
    }, [admin, moduleFilter]);

    useEffect(() => {
        if (!socket) return;

        const handleTaskAssigned = (data) => {
            const adminId = admin?._id || admin?.id;

            // Map task modules to admin permissions
            const TASK_PERMISSION_MAP = {
                'PHOTO_TASK': ['Photography', 'Photo-Editing'],
                'CMS_TASK': ['CMS-Admin'],
                'SOCIAL_TASK': ['Social-Media'],
                'FINANCE_TASK': ['Finance & Accounting', 'Donation Management', 'Disbursement-Tasks'],
            };

            const requiredModules = TASK_PERMISSION_MAP[data.module];
            const hasModuleAccess = admin?.isSuperAdmin || (requiredModules && requiredModules.some(m => admin?.modules?.includes(m)));

            // Check if this task is for the current admin AND they have module access
            if (data.assignedAdminId === adminId && hasModuleAccess) {
                const newNotification = {
                    id: data.taskId,
                    type: 'TASK',
                    module: data.module,
                    title: `New Task: ${data.taskType.replace(/_/g, ' ')}`,
                    time: new Date().toISOString(),
                    read: false,
                    data: data
                };

                // Filter check
                if (!moduleFilter || moduleFilter === data.module) {
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toast.success(newNotification.title);
                }
            }
        };

        const handleFormSubmitted = (data) => {
            // Form submissions are global for verifiers
            const newNotification = {
                id: data.id,
                type: 'FORM',
                formType: data.type,
                title: `Pending Verification: ${data.type.replace(/_/g, ' ')}`,
                subtitle: data.fullName,
                time: new Date().toISOString(),
                read: false,
                data: data
            };

            // Filter logic
            const isVerifyModule = !moduleFilter || moduleFilter === 'VERIFY';
            const isFinancialAidFilter = moduleFilter === 'FINANCIAL_AID' && data.type !== 'KYC';
            const isKYCFilter = moduleFilter === 'KYC' && data.type === 'KYC';

            // Permission checks
            const hasFinancialAidAccess = admin?.isSuperAdmin || admin?.modules?.includes('Financial Aid');
            const hasKYCAccess = admin?.isSuperAdmin || admin?.modules?.includes('KYC Verification');
            const isRelevantForm = (data.type === 'KYC' && hasKYCAccess) || (data.type !== 'KYC' && hasFinancialAidAccess);

            if ((isVerifyModule || isFinancialAidFilter || isKYCFilter) && isRelevantForm) {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.info(newNotification.title);
            }
        };

        socket.on('taskAssigned', handleTaskAssigned);
        socket.on('formSubmitted', handleFormSubmitted);

        return () => {
            socket.off('taskAssigned', handleTaskAssigned);
            socket.off('formSubmitted', handleFormSubmitted);
        };
    }, [socket, admin, moduleFilter]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleNotificationClick = (notification) => {
        setShowDropdown(false);

        // Navigation logic based on type
        if (notification.type === 'TASK') {
            switch (notification.module) {
                case 'PHOTO_TASK': router.push('/photography'); break;
                case 'CMS_TASK': router.push('/cms-admin/fundraiser'); break;
                case 'SOCIAL_TASK': router.push('/social-media'); break;
                case 'FINANCE_TASK': router.push('/finance'); break;
                default: break;
            }
        } else if (notification.type === 'FORM') {
            if (notification.formType === 'KYC') router.push('/verify/kyc');
            else router.push('/verify/financial'); // Adjust path as needed
        }
    };

    const getIcon = (type, module) => {
        if (type === 'FORM') return <FileText className="w-4 h-4 text-blue-500" />;
        switch (module) {
            case 'PHOTO_TASK': return <Camera className="w-4 h-4 text-emerald-500" />;
            case 'CMS_TASK': return <Star className="w-4 h-4 text-purple-500" />;
            case 'SOCIAL_TASK': return <Share2 className="w-4 h-4 text-blue-500" />;
            case 'FINANCE_TASK': return <Wallet className="w-4 h-4 text-orange-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all relative group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-gray-800' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 relative bg-blue-50/20"
                                    >
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                                {getIcon(n.type, n.module)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="text-sm leading-tight truncate font-bold text-gray-900">
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                        {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {n.subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{n.subtitle}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-12 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-500">No notifications yet</p>
                                    <p className="text-xs text-gray-400 mt-1">We'll alert you when tasks arrive</p>
                                </div>
                            )}
                        </div>

                       
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
