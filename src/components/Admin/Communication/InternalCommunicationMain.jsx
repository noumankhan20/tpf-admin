"use client";

import React, { useState, useEffect } from 'react';
import {
    useGetCommunicationAdminsQuery,
    useGetInternalMessagesQuery
} from '@/utils/slices/internalCommunicationApiSlice';
import { useSelector } from 'react-redux';
import AdminList from './AdminList';
import ChatWindow from './ChatWindow';
import { MessageSquare, Users, Globe, ArrowLeft, Search, MoreVertical, LogOut } from 'lucide-react';
import { useSocket } from '@/utils/context/SocketContext';
import { useRouter } from 'next/navigation';

export default function InternalCommunicationMain() {
    const router = useRouter();
    const { data: adminsData, isLoading: adminsLoading } = useGetCommunicationAdminsQuery();
    const { data: messagesData, refetch: refetchMessages } = useGetInternalMessagesQuery();
    const { socket } = useSocket();
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isGlobalMode, setIsGlobalMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const adminInfo = useSelector((state) => state.adminAuth.adminInfo);

    const currentUserId = adminInfo?._id || adminInfo?.id;

    // Listen for new messages to update unread counts live
    useEffect(() => {
        if (socket && currentUserId) {
            const handleUpdate = (payload) => {
                const receiverId = payload.receiver?._id || payload.receiver?.id || payload.receiver;
                if (payload.isGlobal || receiverId?.toString() === currentUserId.toString()) {
                    refetchMessages();
                }
            };

            socket.on('new_internal_message', handleUpdate);
            return () => socket.off('new_internal_message', handleUpdate);
        }
    }, [socket, currentUserId, refetchMessages]);

    if (adminsLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-medium animate-pulse">Initializing Secure Channel...</p>
                </div>
            </div>
        );
    }

    const admins = adminsData?.data || [];
    const messages = messagesData?.data || [];

    // Calculate last message timestamp for each admin to sort the list
    const lastMessageTimes = messages.reduce((acc, m) => {
        if (m.isGlobal) return acc;
        const senderId = (m.sender?._id || m.sender).toString();
        const receiverId = (m.receiver?._id || m.receiver).toString();

        const otherId = senderId === currentUserId?.toString() ? receiverId : senderId;
        const msgTime = new Date(m.createdAt).getTime();

        if (!acc[otherId] || msgTime > acc[otherId]) {
            acc[otherId] = msgTime;
        }
        return acc;
    }, {});

    // Filter admins based on search
    const filteredAdmins = admins.filter(admin =>
        admin.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort admins: Recent message activity first, then alphabetical fallback
    const sortedAdmins = [...filteredAdmins].sort((a, b) => {
        const timeA = lastMessageTimes[a._id.toString()] || 0;
        const timeB = lastMessageTimes[b._id.toString()] || 0;

        if (timeA !== timeB) return timeB - timeA;
        return a.fullName.localeCompare(b.fullName);
    });

    // Calculate unread counts per admin
    const unreadCounts = messages.reduce((acc, m) => {
        const senderId = m.sender?._id || m.sender?.id || m.sender;
        if (!m.isGlobal && !m.readBy.includes(currentUserId) && senderId?.toString() !== currentUserId?.toString()) {
            const sId = senderId?.toString();
            acc[sId] = (acc[sId] || 0) + 1;
        }
        return acc;
    }, {});

    // Calculate global unread
    const globalUnreadCount = messages.filter(m =>
        m.isGlobal &&
        !m.readBy.includes(currentUserId) &&
        (m.sender?._id || m.sender?.id || m.sender)?.toString() !== currentUserId?.toString()
    ).length;

    return (
        <div className="flex h-screen w-full bg-[#f0f2f5] overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Sidebar */}
            <div className="w-[400px] flex flex-col bg-white border-r border-gray-200">
                {/* Sidebar Header */}
                <div className="p-4 bg-gray-50/50 flex flex-col gap-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/select-portal?category=communication')}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                title="Back to Portal"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {adminInfo?.fullName?.charAt(0)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900">Chats</h2>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-lg text-base transition-all placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Global Message Card */}
                    <div className="p-2 pt-3">
                        <button
                            onClick={() => {
                                setIsGlobalMode(true);
                                setSelectedAdmin(null);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative ${isGlobalMode
                                ? 'bg-emerald-50 border border-emerald-100 shadow-sm'
                                : 'hover:bg-gray-50 group border border-transparent'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${isGlobalMode ? 'bg-emerald-600 shadow-emerald-200' : 'bg-emerald-500'
                                } text-white shadow-lg`}>
                                <Globe className="w-6 h-6" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className={`font-bold text-base ${isGlobalMode ? 'text-emerald-700' : 'text-gray-900'}`}>Global Message</p>
                                <p className="text-[13px] text-gray-500 truncate">Broadcast to all administrators</p>
                            </div>
                            {globalUnreadCount > 0 && (
                                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {globalUnreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="p-2">
                        <div className="px-4 py-2">
                            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                                Conversations ({sortedAdmins.length})
                            </h3>
                        </div>
                        <AdminList
                            admins={sortedAdmins}
                            selectedAdmin={selectedAdmin}
                            unreadCounts={unreadCounts}
                            onSelectAdmin={(admin) => {
                                setSelectedAdmin(admin);
                                setIsGlobalMode(false);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#f0f2f5] min-w-0 h-full relative">
                {selectedAdmin || isGlobalMode ? (
                    <ChatWindow
                        selectedAdmin={selectedAdmin}
                        isGlobalMode={isGlobalMode}
                        adminInfo={adminInfo}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-50 scale-150"></div>
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative shadow-2xl border border-white">
                                <MessageSquare className="w-16 h-16 text-emerald-500" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Internal Portal Messaging</h3>
                        <p className="text-gray-500 max-w-md text-xl leading-relaxed mb-8">
                            Connected channel for administrator communications. Please maintain professional decorum.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-400 bg-white/50 px-4 py-2 rounded-full border border-gray-200">
                            End-to-end connection active
                        </div>
                    </div>
                )}

                {/* WhatsApp-like detail: Background Pattern Overlay could be added via CSS */}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #dfe3e7;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e0;
                }
            `}</style>
        </div>
    );
}
