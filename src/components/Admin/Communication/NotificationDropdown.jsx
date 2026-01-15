"use client";

import React, { useState, useEffect } from 'react';
import { useGetInternalMessagesQuery, useMarkMessagesAsReadMutation } from '@/utils/slices/internalCommunicationApiSlice';
import { useSelector } from 'react-redux';
import { Bell, MessageSquare, Globe, Reply, X } from 'lucide-react';
import { useSocket } from '@/utils/context/SocketContext';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import ReplyModal from './ReplyModal';

export default function NotificationDropdown() {
    const { adminInfo } = useSelector((state) => state.adminAuth);
    const { socket } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

    const { data: messagesData, refetch } = useGetInternalMessagesQuery();
    const messages = messagesData?.data || [];

    // Get current user ID safely
    const currentUserId = adminInfo?._id || adminInfo?.id;

    // Filter unread messages not sent by me
    const unreadMessages = messages.filter(m => {
        const senderId = m.sender?._id || m.sender?.id || m.sender;
        return !m.readBy.includes(currentUserId) && senderId !== currentUserId;
    });

    useEffect(() => {
        if (socket && currentUserId) {
            const handleNewMessage = (payload) => {
                const receiverId = payload.receiver?._id || payload.receiver?.id || payload.receiver;
                // Refetch if I am the receiver or if it's a global message
                if (receiverId === currentUserId || payload.isGlobal) {
                    refetch();
                }
            };

            socket.on('new_internal_message', handleNewMessage);
            return () => socket.off('new_internal_message', handleNewMessage);
        }
    }, [socket, currentUserId, refetch]);

    const handleMessageClick = (msg) => {
        setSelectedMessage(msg);
        setIsReplyModalOpen(true);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative text-gray-700 hover:text-gray-900 p-2 rounded-lg transition-colors ${isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                title="Internal Messages"
            >
                <MessageSquare size={20} />
                {unreadMessages.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
                        {unreadMessages.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md">
                                <h3 className="font-bold text-gray-900">Messages</h3>
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                    {unreadMessages.length} New
                                </span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {unreadMessages.length === 0 ? (
                                    <div className="p-8 text-center flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Bell className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 text-sm font-medium">All caught up!</p>
                                    </div>
                                ) : (
                                    Object.values(unreadMessages.reduce((acc, msg) => {
                                        const key = msg.isGlobal ? 'global' : (msg.sender?._id || msg.sender?.id || msg.sender);
                                        if (!acc[key]) {
                                            acc[key] = { ...msg, count: 1 };
                                        } else {
                                            acc[key].count += 1;
                                            // Keep the most recent message
                                            if (new Date(msg.createdAt) > new Date(acc[key].createdAt)) {
                                                acc[key] = { ...msg, count: acc[key].count };
                                            }
                                        }
                                        return acc;
                                    }, {})).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((group) => (
                                        <button
                                            key={group._id}
                                            onClick={() => handleMessageClick(group)}
                                            className="w-full p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-colors text-left flex gap-3 group"
                                        >
                                            <div className="relative shrink-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${group.isGlobal ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {group.isGlobal ? <Globe className="w-5 h-5" /> : group.sender.fullName.charAt(0)}
                                                </div>
                                                {group.count > 1 && (
                                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                                        {group.count}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-bold text-gray-900 text-sm truncate pr-2">
                                                        {group.isGlobal ? 'Global Update' : group.sender.fullName}
                                                    </p>
                                                    <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">
                                                        {format(new Date(group.createdAt), 'hh:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                    {group.content}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
                                    View All Reports
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ReplyModal
                isOpen={isReplyModalOpen}
                onClose={() => setIsReplyModalOpen(false)}
                message={selectedMessage}
                adminInfo={adminInfo}
            />
        </div>
    );
}
