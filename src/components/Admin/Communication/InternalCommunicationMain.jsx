"use client";

import React, { useState } from 'react';
import {
    useGetCommunicationAdminsQuery,
    useGetUnreadCountsQuery
} from '@/utils/slices/internalCommunicationApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import AdminList from './AdminList';
import ChatWindow from './ChatWindow';
import { MessageSquare, Users, Globe } from 'lucide-react';
import { useSocket } from '@/utils/context/SocketContext';
import { useEffect } from 'react'; // Removed duplicate useState import
import { internalCommunicationApiSlice } from '@/utils/slices/internalCommunicationApiSlice';

export default function InternalCommunicationMain() {
    const { data: adminsData, isLoading: adminsLoading } = useGetCommunicationAdminsQuery();
    const { data: unreadData } = useGetUnreadCountsQuery();
    const { socket } = useSocket();
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isGlobalMode, setIsGlobalMode] = useState(false);
    const adminInfo = useSelector((state) => state.adminAuth.adminInfo);

    const currentUserId = adminInfo?._id || adminInfo?.id;
    const dispatch = useDispatch();

    // Listen for new messages to update unread counts live
    useEffect(() => {
        if (socket && currentUserId) {
            const handleUpdate = (payload) => {
                const receiverId = payload.receiver?._id || payload.receiver?.id || payload.receiver;
                const senderId = payload.sender?._id || payload.sender?.id || payload.sender;

                // Manual Cache Update for Unread Counts
                if (payload.isGlobal || receiverId?.toString() === currentUserId.toString()) {
                    dispatch(
                        internalCommunicationApiSlice.util.updateQueryResult(
                            'getUnreadCounts',
                            undefined,
                            (draft) => {
                                if (draft?.success && draft.counts) {
                                    if (payload.isGlobal) {
                                        if (senderId?.toString() !== currentUserId.toString()) {
                                            draft.counts.global = (draft.counts.global || 0) + 1;
                                        }
                                    } else {
                                        const sId = senderId?.toString();
                                        draft.counts.private[sId] = (draft.counts.private[sId] || 0) + 1;
                                    }
                                }
                            }
                        )
                    );
                }
            };

            socket.on('new_internal_message', handleUpdate);
            return () => socket.off('new_internal_message', handleUpdate);
        }
    }, [socket, currentUserId, dispatch]);

    if (adminsLoading) return <div className="p-8 text-center text-gray-500">Loading admins...</div>;

    const admins = adminsData?.data || [];
    const unreadCounts = unreadData?.counts?.private || {};
    const globalUnreadCount = unreadData?.counts?.global || 0;

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
