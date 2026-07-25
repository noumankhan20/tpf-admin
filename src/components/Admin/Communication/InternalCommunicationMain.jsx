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
        <div className="flex h-[calc(100vh-70px)] w-full bg-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar */}
            <div className="w-[340px] flex flex-col bg-gray-50 border-r border-gray-300 overflow-hidden">
                {/* Sidebar Header */}
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/select-portal')}
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                                title="Back to Portal"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-[22px] font-black text-gray-900 tracking-tight">Messages</h2>
                        </div>
                    </div>

                    {/* Global Message Button */}
                    <button
                        onClick={() => {
                            setIsGlobalMode(true);
                            setSelectedAdmin(null);
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-200 font-bold shadow-md border ${
                            isGlobalMode
                                ? 'bg-emerald-700 text-white border-emerald-800'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                        }`}
                    >
                        Broadcast Global Message
                        {globalUnreadCount > 0 && (
                            <span className="ml-2 bg-white text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                                {globalUnreadCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
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

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {selectedAdmin || isGlobalMode ? (
                    <ChatWindow
                        selectedAdmin={selectedAdmin}
                        isGlobalMode={isGlobalMode}
                        adminInfo={adminInfo}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative shadow-md border border-gray-300">
                                <MessageSquare className="w-10 h-10 text-emerald-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Internal Messaging</h3>
                        <p className="text-gray-600 max-w-sm text-base font-medium leading-relaxed mb-8">
                            Select a conversation from the sidebar or start a new global broadcast.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
}
