"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Camera, FileText, Share2, Wallet, Star, X, CheckCircle, HandHeart } from 'lucide-react';
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
                        'PHOTO_TASK': ['Photography'],
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
                const isOrgFilter = moduleFilter === 'ORGANIZATION';

                // Permission checks
                const hasFinancialAidAccess = admin?.isSuperAdmin || admin?.modules?.includes('Financial Aid');
                const hasKYCAccess = admin?.isSuperAdmin || admin?.modules?.includes('KYC Verification');
                const hasOrgAccess = admin?.isSuperAdmin || admin?.modules?.includes('Organization Verification');

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

                if ((isVerifyModule || isOrgFilter) && hasOrgAccess) {
                    // Fetch Organization Registrations & Edits
                    try {
                        // Registrations
                        const orgRes = await fetch(`${apiBase}/organizations?verificationStatus=pending`, {
                            credentials: 'include'
                        });
                        const orgResult = await orgRes.json();
                        if (orgResult.success && orgResult.data) {
                            const orgNotifications = orgResult.data.map(org => ({
                                id: org._id,
                                type: 'FORM',
                                formType: 'ORGANIZATION',
                                title: `Pending Verification: Organization`,
                                subtitle: org.organizationName,
                                time: org.createdAt,
                                read: false,
                                data: org
                            }));
                            allInitial = [...allInitial, ...orgNotifications];
                        }

                        // Edits
                        const allOrgRes = await fetch(`${apiBase}/organizations`, {
                            credentials: 'include'
                        });
                        const allOrgResult = await allOrgRes.json();
                        if (allOrgResult.success && allOrgResult.data) {
                            const editNotifications = allOrgResult.data
                                .filter(org => org.editRequests?.status === 'pending')
                                .map(org => ({
                                    id: `${org._id}_edit`,
                                    type: 'FORM',
                                    formType: 'ORGANIZATION_EDIT',
                                    title: `Pending Edit: ${org.organizationName}`,
                                    subtitle: 'Organization details update',
                                    time: org.editRequests.requestedAt || org.updatedAt,
                                    read: false,
                                    data: org
                                }));
                            allInitial = [...allInitial, ...editNotifications];
                        }
                    } catch (err) {
                        console.error('Org Notification fetch failed:', err);
                    }

                    // Fetch Campaign Requests
                    try {
                        const campRes = await fetch(`${apiBase}/campaign-requests/all`, {
                            credentials: 'include'
                        });
                        const campResult = await campRes.json();
                        if (campResult.success && campResult.data) {
                            const campNotifications = campResult.data
                                .filter(req => req.status === 'pending')
                                .map(req => ({
                                    id: req._id,
                                    type: 'FORM',
                                    formType: 'CAMPAIGN_REQUEST',
                                    title: `Pending Campaign: ${req.title}`,
                                    subtitle: req.organizationName,
                                    time: req.createdAt,
                                    read: false,
                                    data: req
                                }));
                            allInitial = [...allInitial, ...campNotifications];
                        }
                  } catch (err) {
                        console.error('Campaign Notification fetch failed:', err);
                    }
                }

                // Fetch Delete Requests (Super Admin only)
                if (admin?.isSuperAdmin && (!moduleFilter || moduleFilter === 'deletion')) {
                    try {
                        const deleteRes = await fetch(`${apiBase}/delete/getall`, {
                            credentials: 'include'
                        });
                        const deleteResult = await deleteRes.json();
                        if (deleteResult.success && deleteResult.data) {
                            const deleteNotifications = deleteResult.data
                                .filter(req => req.status === 'pending')
                                .map(req => ({
                                    id: req.id,
                                    type: 'DELETE_REQUEST',
                                    title: `Pending Delete: ${req.entityName}`,
                                    subtitle: `Module: ${req.module}`,
                                    time: req.requestedAt,
                                    read: false,
                                    data: req
                                }));
                            allInitial = [...allInitial, ...deleteNotifications];
                        }
                    } catch (err) {
                        console.error('Delete Notification fetch failed:', err);
                    }
                }

                // Fetch Offline Donations
                if (admin?.isSuperAdmin || admin?.modules?.includes('Donation Management')) {
                    try {
                        const offlineRes = await fetch(`${apiBase}/offline-donations/get?status=pending`, {
                            credentials: 'include'
                        });
                        const offlineResult = await offlineRes.json();
                        if (offlineResult.donations) {
                            const offlineNotifications = offlineResult.donations.map(donation => ({
                                id: donation.id,
                                type: 'OFFLINE_DONATION',
                                title: `Pending Donation: ₹${donation.amount}`,
                                subtitle: `From: ${donation.fullName} (${donation.method})`,
                                time: donation.submittedOn,
                                read: false,
                                data: donation
                            }));
                            allInitial = [...allInitial, ...offlineNotifications];
                        }
                    } catch (err) {
                        console.error('Offline Donation Notification fetch failed:', err);
                    }
                }

                // Fetch Tickets
                try {
                    const ticketRes = await fetch(`${apiBase}/ticket/getall`, {
                        credentials: 'include'
                    });
                    const ticketResult = await ticketRes.json();
                    if (ticketResult.success && ticketResult.tickets) {
                        const unresolvedTickets = ticketResult.tickets
                            .filter(t => t.status === 'Unresolved')
                            .map(t => ({
                                id: t._id,
                                type: 'TICKET',
                                title: `New Ticket: ${t.queryType.toUpperCase()}`,
                                subtitle: `From: ${t.fullName} (${t.email})`,
                                time: t.createdAt,
                                read: false,
                                data: t
                            }));
                        allInitial = [...allInitial, ...unresolvedTickets];
                    }
                } catch (err) {
                    console.error('Ticket Notification fetch failed:', err);
                }

                // Fetch Pending Vouchers
                if (admin?.isSuperAdmin || admin?.modules?.includes('Finance & Accounting')) {
                    try {
                        const voucherRes = await fetch(`${apiBase}/vouchers/pending`, {
                            credentials: 'include'
                        });
                        const voucherResult = await voucherRes.json();
                        if (voucherResult.success && voucherResult.data) {
                            const pendingVouchers = voucherResult.data.map(v => ({
                                id: v._id,
                                type: 'VOUCHER',
                                title: `Pending Voucher: ₹${v.amount}`,
                                subtitle: `By: ${v.volunteerId?.fullName || 'Volunteer'}`,
                                time: v.createdAt,
                                read: false,
                                data: v
                            }));
                            allInitial = [...allInitial, ...pendingVouchers];
                        }
                    } catch (err) {
                        console.error('Voucher Notification fetch failed:', err);
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

        // Add 10-second fallback polling interval to prevent notification delay
        const pollInterval = setInterval(fetchInitialData, 10000);

        return () => {
            clearInterval(pollInterval);
        };
    }, [admin, moduleFilter]);

    useEffect(() => {
        if (!socket) return;

        const handleTaskAssigned = (data) => {
            const adminId = admin?._id || admin?.id;

            // Map task modules to admin permissions
            const TASK_PERMISSION_MAP = {
                'PHOTO_TASK': ['Photography'],
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
            const hasOrgAccess = admin?.isSuperAdmin || admin?.modules?.includes('Organization Verification');
            const isRelevantForm = (data.type === 'KYC' && hasKYCAccess) ||
                (data.type === 'ORGANIZATION' && hasOrgAccess) ||
                (data.type === 'ORGANIZATION_EDIT' && hasOrgAccess) ||
                (data.type === 'CAMPAIGN_REQUEST' && hasOrgAccess) ||
                (data.type === 'CAMPAIGN_RESUBMITTED' && hasOrgAccess) ||
                (data.type !== 'KYC' && data.type !== 'ORGANIZATION' && data.type !== 'ORGANIZATION_EDIT' && data.type !== 'CAMPAIGN_REQUEST' && data.type !== 'CAMPAIGN_RESUBMITTED' && hasFinancialAidAccess);

            if ((isVerifyModule || isFinancialAidFilter || isKYCFilter) && isRelevantForm) {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.info(newNotification.title);
            }
        };

        const handleDeleteRequestCreated = (data) => {
            if (admin?.isSuperAdmin) {
                const newNotification = {
                    id: data.id,
                    type: 'DELETE_REQUEST',
                    title: `Pending Delete: ${data.entityName}`,
                    subtitle: `Module: ${data.module}`,
                    time: new Date().toISOString(),
                    read: false,
                    data: data
                };

                if (!moduleFilter || moduleFilter === 'deletion') {
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toast.warning(newNotification.title);
                }
            }
        };

        const handleOfflineDonationCreated = (data) => {
            const hasAccess = admin?.isSuperAdmin || admin?.modules?.includes('Donation Management');
            if (hasAccess) {
                const newNotification = {
                    id: data.id,
                    type: 'OFFLINE_DONATION',
                    title: `New Pending Donation: ₹${data.amount}`,
                    subtitle: `From: ${data.fullName}`,
                    time: data.time,
                    read: false,
                    data: data
                };

                if (!moduleFilter || moduleFilter === 'Donation Management') {
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toast.info(newNotification.title);
                }
            }
        };

        const handleOfflineDonationProcessed = (data) => {
            setNotifications(prev => {
                const filtered = prev.filter(n => n.id !== data.id);
                if (prev.length !== filtered.length) {
                    setUnreadCount(prevUnread => Math.max(0, prevUnread - 1));
                }
                return filtered;
            });
        };

        const handleTicketCreated = (data) => {
            const newNotification = {
                id: data.id,
                type: 'TICKET',
                title: `New Ticket: ${data.queryType.toUpperCase()}`,
                subtitle: `From: ${data.fullName}`,
                time: data.time || new Date().toISOString(),
                read: false,
                data: data
            };
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast.info(newNotification.title);
        };

        const handleTicketResolved = (data) => {
            setNotifications(prev => {
                const filtered = prev.filter(n => n.id !== data.id);
                if (prev.length !== filtered.length) {
                    setUnreadCount(prevUnread => Math.max(0, prevUnread - 1));
                }
                return filtered;
            });
        };

        const handleVoucherCreated = (data) => {
            const hasAccess = admin?.isSuperAdmin || admin?.modules?.includes('Finance & Accounting');
            if (hasAccess) {
                const newNotification = {
                    id: data.id,
                    type: 'VOUCHER',
                    title: `Pending Voucher: ₹${data.amount}`,
                    subtitle: `By: ${data.volunteerName}`,
                    time: data.time || new Date().toISOString(),
                    read: false,
                    data: data
                };
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.info(newNotification.title);
            }
        };

        const handleVoucherProcessed = (data) => {
            setNotifications(prev => {
                const filtered = prev.filter(n => n.id !== data.id);
                if (prev.length !== filtered.length) {
                    setUnreadCount(prevUnread => Math.max(0, prevUnread - 1));
                }
                return filtered;
            });
        };

        socket.on('taskAssigned', handleTaskAssigned);
        socket.on('formSubmitted', handleFormSubmitted);
        socket.on('deleteRequestCreated', handleDeleteRequestCreated);
        socket.on('offlineDonationCreated', handleOfflineDonationCreated);
        socket.on('offlineDonationProcessed', handleOfflineDonationProcessed);
        socket.on('ticketCreated', handleTicketCreated);
        socket.on('ticketResolved', handleTicketResolved);
        socket.on('voucherCreated', handleVoucherCreated);
        socket.on('voucherProcessed', handleVoucherProcessed);

        return () => {
            socket.off('taskAssigned', handleTaskAssigned);
            socket.off('formSubmitted', handleFormSubmitted);
            socket.off('deleteRequestCreated', handleDeleteRequestCreated);
            socket.off('offlineDonationCreated', handleOfflineDonationCreated);
            socket.off('offlineDonationProcessed', handleOfflineDonationProcessed);
            socket.off('ticketCreated', handleTicketCreated);
            socket.off('ticketResolved', handleTicketResolved);
            socket.off('voucherCreated', handleVoucherCreated);
            socket.off('voucherProcessed', handleVoucherProcessed);
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
            else if (notification.formType === 'ORGANIZATION' || notification.formType === 'ORGANIZATION_EDIT' || notification.formType === 'CAMPAIGN_REQUEST' || notification.formType === 'CAMPAIGN_RESUBMITTED') router.push('/verify/organization');
            else router.push('/verify/financial'); // Adjust path as needed
        } else if (notification.type === 'DELETE_REQUEST') {
            router.push('/tpf-management/approve-request');
        } else if (notification.type === 'OFFLINE_DONATION') {
            router.push('/donation-management');
        } else if (notification.type === 'TICKET') {
            router.push('/tickets-queries');
        } else if (notification.type === 'VOUCHER') {
            router.push('/tpf-management/volunteers');
        }
    };

    const getIcon = (type, module) => {
        if (type === 'FORM') return <FileText className="w-4 h-4 text-blue-500" />;
        if (type === 'TICKET') return <FileText className="w-4 h-4 text-purple-500" />;
        if (type === 'VOUCHER') return <Wallet className="w-4 h-4 text-emerald-500" />;
        switch (module) {
            case 'PHOTO_TASK': return <Camera className="w-4 h-4 text-emerald-500" />;
            case 'CMS_TASK': return <Star className="w-4 h-4 text-purple-500" />;
            case 'SOCIAL_TASK': return <Share2 className="w-4 h-4 text-blue-500" />;
            case 'FINANCE_TASK': return <Wallet className="w-4 h-4 text-orange-500" />;
            case 'DELETE_REQUEST': return <X className="w-4 h-4 text-red-500" />;
            case 'OFFLINE_DONATION': return <HandHeart className="w-4 h-4 text-pink-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    // Sort notifications descending by timestamp
    const sortedNotifications = React.useMemo(() => {
        return [...notifications].sort((a, b) => new Date(b.time) - new Date(a.time));
    }, [notifications]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1.5 hover:bg-gray-100/80 active:bg-gray-200/50 rounded-lg transition-all relative cursor-pointer"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-gray-800' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200/80 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-medium px-2 py-0.5 rounded-md">
                                    {unreadCount} pending
                                </span>
                            )}
                        </div>

                        {/* List Area */}
                        <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100/60 custom-scrollbar">
                            {sortedNotifications.length > 0 ? (
                                sortedNotifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className="px-4 py-2.5 hover:bg-gray-50/70 transition-colors cursor-pointer flex gap-3 relative bg-white"
                                    >
                                        {/* Minimal unread left dot (clean) */}
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute left-2 top-4 shrink-0" />
                                        
                                        {/* Icon wrapper */}
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 ml-1">
                                            {getIcon(n.type, n.module)}
                                        </div>

                                        {/* Text info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-[12px] font-medium text-gray-700 leading-snug truncate">
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-gray-400 shrink-0 font-normal">
                                                    {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {n.subtitle && (
                                                <p className="text-[11px] text-gray-400 mt-0.5 truncate leading-tight">
                                                    {n.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-10 text-center">
                                    <div className="w-10 h-10 bg-gray-50 border border-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Bell className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-400">No new notifications</p>
                                    <p className="text-[11px] text-gray-400/70 mt-0.5">We'll alert you when actions are required</p>
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
