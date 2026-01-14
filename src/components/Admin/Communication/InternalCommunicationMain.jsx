"use client";

import React, { useState } from 'react';
import {
    useGetCommunicationAdminsQuery,
    useGetInternalMessagesQuery
} from '@/utils/slices/internalCommunicationApiSlice';
import { useSelector } from 'react-redux';
import AdminList from './AdminList';
import ChatWindow from './ChatWindow';
import { MessageSquare, Users, Globe } from 'lucide-react';
import { useSocket } from '@/utils/context/SocketContext';
import { useEffect } from 'react';

export default function InternalCommunicationMain() {
    const { data: adminsData, isLoading: adminsLoading } = useGetCommunicationAdminsQuery();
    const { data: messagesData, refetch: refetchMessages } = useGetInternalMessagesQuery();
    const { socket } = useSocket();
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isGlobalMode, setIsGlobalMode] = useState(false);
    const adminInfo = useSelector((state) => state.adminAuth.adminInfo);

    const currentUserId = adminInfo?._id || adminInfo?.id;

    // Listen for new messages to update unread counts live
    useEffect(() => {
        if (socket && currentUserId) {
            const handleUpdate = (payload) => {
                const receiverId = payload.receiver?._id || payload.receiver?.id || payload.receiver;
                // Update counts if I am the receiver or if it's a global message from someone else
                if (payload.isGlobal || receiverId?.toString() === currentUserId.toString()) {
                    refetchMessages();
                }
            };

            socket.on('new_internal_message', handleUpdate);
            return () => socket.off('new_internal_message', handleUpdate);
        }
    }, [socket, currentUserId, refetchMessages]);

    if (adminsLoading) return <div className="p-8 text-center text-gray-500">Loading admins...</div>;

    const admins = adminsData?.data || [];
    const messages = messagesData?.data || [];

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
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            Internal Chat
                        </h2>
                    </div>

                    <div className="p-3">
                        <button
                            onClick={() => {
                                setIsGlobalMode(true);
                                setSelectedAdmin(null);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-2 relative ${isGlobalMode
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                                }`}
                        >
                            <Globe className="w-5 h-5" />
                            <div className="text-left flex-1">
                                <p className="font-bold text-sm">Global Message</p>
                                <p className={`text-[10px] ${isGlobalMode ? 'text-blue-100' : 'text-gray-400'}`}>Message everyone</p>
                            </div>
                            {globalUnreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {globalUnreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="px-4 py-2">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Admins List ({admins.length})
                            </h3>
                            <AdminList
                                admins={admins}
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
                <div className="flex-1 flex flex-col bg-white">
                    {selectedAdmin || isGlobalMode ? (
                        <ChatWindow
                            selectedAdmin={selectedAdmin}
                            isGlobalMode={isGlobalMode}
                            adminInfo={adminInfo}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-10 h-10 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
                            <p className="text-gray-500 max-w-xs">
                                Choose an admin from the list or send a global message to start communicating.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
