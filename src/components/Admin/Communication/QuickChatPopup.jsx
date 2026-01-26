"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, X, Search, Globe, Send, Loader2,
    User, ShieldCheck, Maximize2, MoreHorizontal, Minimize2,
    Paperclip, Image as ImageIcon, Smile
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { useSocket } from '@/utils/context/SocketContext';
import {
    useGetCommunicationAdminsQuery,
    useGetInternalMessagesQuery,
    useSendInternalMessageMutation,
    useMarkMessagesAsReadMutation
} from '@/utils/slices/internalCommunicationApiSlice';
import { format } from 'date-fns';

/**
 * LinkedIn-Style Quick Chat Popup
 * - Messaging list stays on the right
 * - Active chats open as separate windows to the left
 */
export default function QuickChatPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChats, setActiveChats] = useState([]); // Array of { id, admin, isGlobal }
    const [searchQuery, setSearchQuery] = useState('');

    const adminInfo = useSelector((state) => state.adminAuth.adminInfo);
    const pathname = usePathname();
    const router = useRouter();
    const currentUserId = adminInfo?._id || adminInfo?.id;
    const { socket } = useSocket();

    const { data: adminsData, isLoading: adminsLoading } = useGetCommunicationAdminsQuery();
    const { data: messagesData, refetch: refetchMessages } = useGetInternalMessagesQuery();

    const admins = adminsData?.data || [];
    const messages = messagesData?.data || [];

    // Listen for new messages
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

    // Unread counts logic
    const unreadCounts = messages.reduce((acc, m) => {
        const senderId = m.sender?._id || m.sender?.id || m.sender;
        if (!m.isGlobal && !m.readBy.includes(currentUserId) && senderId?.toString() !== currentUserId?.toString()) {
            const sId = senderId?.toString();
            acc[sId] = (acc[sId] || 0) + 1;
        }
        return acc;
    }, {});

    const globalUnreadCount = messages.filter(m =>
        m.isGlobal &&
        !m.readBy.includes(currentUserId) &&
        (m.sender?._id || m.sender?.id || m.sender)?.toString() !== currentUserId?.toString()
    ).length;

    const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0) + globalUnreadCount;

    const togglePopup = () => setIsOpen(!isOpen);

    const openChat = (admin, isGlobal = false) => {
        const chatId = isGlobal ? 'global' : admin._id;
        if (!activeChats.find(chat => chat.id === chatId)) {
            // Add new chat to the stack (up to 3)
            setActiveChats(prev => [{ id: chatId, admin, isGlobal }, ...prev].slice(0, 3));
        }
    };

    const closeChat = (chatId) => {
        setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
    };

    const filteredAdmins = admins.filter(admin =>
        admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        admin._id !== currentUserId
    );

    if (pathname === '/admin/communication') return null;

    return (
        <div className="fixed bottom-0 right-8 z-[100] flex flex-row-reverse items-end gap-3 pointer-events-none" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* 1. MAIN MESSAGING LIST (LINKEDIN STYLE) */}
            <div className="flex flex-col items-end pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 1, y: 520 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 1, y: 520 }}
                            transition={{ duration: 0.2 }}
                            className="w-[300px] sm:w-[320px] bg-white rounded-t-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-200 flex flex-col overflow-hidden"
                            style={{ height: '520px' }}
                        >
                            {/* List Header */}
                            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                                        {adminInfo?.fullName?.charAt(0)}
                                    </div>
                                    <span className="font-bold text-[14px] text-gray-800">Messaging</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                        <MoreHorizontal size={16} />
                                    </button>
                                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                        <Maximize2 size={16} onClick={() => router.push('/admin/communication')} />
                                    </button>
                                    <button onClick={togglePopup} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                        <Minimize2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Search Messages */}
                            <div className="p-2.5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-bold" />
                                    <input
                                        type="text"
                                        placeholder="Search messages"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border-none rounded-md text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Focused / Other Tabs */}
                            <div className="flex border-b border-gray-200">
                                <button className="flex-1 py-2 text-sm font-bold text-emerald-700 border-b-2 border-emerald-700">Focused</button>
                                <button className="flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50">Other</button>
                            </div>

                            {/* Chat List Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* Global Channel Section */}
                                <button
                                    onClick={() => openChat(null, true)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                >
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                        <Globe size={24} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-bold text-[14px] text-gray-900">Global Channel</p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">Team-wide messages</p>
                                    </div>
                                    {globalUnreadCount > 0 && (
                                        <div className="bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shrink-0">
                                            {globalUnreadCount}
                                        </div>
                                    )}
                                </button>

                                {/* Direct Admin Chats */}
                                {filteredAdmins.map((admin) => {
                                    const latestMsg = messages.filter(m =>
                                        !m.isGlobal && (
                                            (m.sender?._id || m.sender) === admin._id ||
                                            (m.receiver?._id || m.receiver) === admin._id
                                        )
                                    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                                    return (
                                        <button
                                            key={admin._id}
                                            onClick={() => openChat(admin)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 group"
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0 overflow-hidden border border-gray-200">
                                                {admin.fullName.charAt(0)}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <p className="font-bold text-[14px] text-gray-900 truncate group-hover:text-emerald-700">{admin.fullName}</p>
                                                    <span className="text-[10px] text-gray-400">
                                                        {latestMsg ? format(new Date(latestMsg.createdAt), 'MMM d') : ''}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate line-clamp-1">
                                                    {latestMsg?.content || 'Say hello!'}
                                                </p>
                                            </div>
                                            {unreadCounts[admin._id] > 0 && (
                                                <div className="bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shrink-0">
                                                    {unreadCounts[admin._id]}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Toggle Bar */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={togglePopup}
                    className={`w-[300px] sm:w-[320px] h-[48px] rounded-t-lg flex items-center justify-between px-4 bg-white border border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 pointer-events-auto`}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px] ring-2 ring-emerald-50">
                            {adminInfo?.fullName?.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-gray-800">Messaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {totalUnreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {totalUnreadCount}
                            </span>
                        )}
                        <MoreHorizontal size={18} className="text-gray-500" />
                        <Maximize2 size={16} className="text-gray-500" />
                        <X size={20} className="text-gray-500" />
                    </div>
                </motion.button>
            </div>

            {/* 2. TABBED CHAT WINDOWS (OPENS TO LEFT) */}
            <div className="flex flex-row-reverse items-end gap-3 pointer-events-none pr-2">
                <AnimatePresence>
                    {activeChats.map((chat) => (
                        <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, scale: 0.95, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 50 }}
                            className="w-[320px] sm:w-[340px] pointer-events-auto"
                        >
                            <MiniChatWindow
                                chat={chat}
                                adminInfo={adminInfo}
                                onClose={() => closeChat(chat.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function MiniChatWindow({ chat, adminInfo, onClose }) {
    const [message, setMessage] = useState('');
    const [allMessages, setAllMessages] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { socket } = useSocket();

    const { admin: selectedAdmin, isGlobal: isGlobalMode } = chat;
    const currentUserId = adminInfo?._id || adminInfo?.id;
    const selectedAdminId = selectedAdmin?._id || selectedAdmin?.id;

    const { data: messagesData } = useGetInternalMessagesQuery({
        otherAdminId: !isGlobalMode ? selectedAdminId : undefined,
        isGlobal: isGlobalMode ? 'true' : undefined,
        limit: 50
    });

    const [sendMessage, { isLoading: isSending }] = useSendInternalMessageMutation();
    const [markAsRead] = useMarkMessagesAsReadMutation();

    useEffect(() => {
        if (messagesData?.success) {
            setAllMessages(messagesData.data);
            setTimeout(scrollToBottom, 300);
        }
    }, [messagesData]);

    useEffect(() => {
        if (socket && currentUserId) {
            const handleNewMessage = (payload) => {
                const sAdminId = selectedAdminId?.toString();
                const pSenderId = (payload.sender?._id || payload.sender?.id || payload.sender)?.toString();
                const pReceiverId = (payload.receiver?._id || payload.receiver?.id || payload.receiver)?.toString();

                const isRelevant = isGlobalMode
                    ? payload.isGlobal
                    : (!payload.isGlobal && (pSenderId === sAdminId || pReceiverId === sAdminId));

                if (isRelevant) {
                    setAllMessages(prev => {
                        if (prev.find(m => m._id === payload._id)) return prev;
                        return [...prev, payload];
                    });
                    setTimeout(scrollToBottom, 100);
                }
            };

            socket.on('new_internal_message', handleNewMessage);
            return () => socket.off('new_internal_message', handleNewMessage);
        }
    }, [socket, selectedAdminId, currentUserId, isGlobalMode]);

    useEffect(() => {
        if (allMessages.length > 0 && currentUserId) {
            const unreadIds = allMessages
                .filter(m => {
                    const sId = (m.sender?._id || m.sender)?.toString();
                    return !m.readBy.includes(currentUserId.toString()) && sId !== currentUserId.toString();
                })
                .map(m => m._id);

            if (unreadIds.length > 0) {
                markAsRead({ messageIds: unreadIds });
            }
        }
    }, [allMessages, currentUserId]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        try {
            const currentMsg = message;
            setMessage('');
            await sendMessage({
                receiverId: selectedAdminId,
                content: currentMsg,
                isGlobal: isGlobalMode
            }).unwrap();
            scrollToBottom();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-[400px] bg-white rounded-t-xl shadow-[0_0_15px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden">
            {/* Window Header */}
            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs ring-1 ring-gray-100">
                            {isGlobalMode ? <Globe size={14} /> : selectedAdmin?.fullName?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="max-w-[150px]">
                        <p className="font-bold text-sm text-gray-800 truncate">
                            {isGlobalMode ? 'Global Team' : selectedAdmin?.fullName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><MoreHorizontal size={16} /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><Maximize2 size={16} /></button>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><X size={18} /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f4f2ee]/30 custom-scrollbar">
                {allMessages.map((msg, i) => {
                    const isOwn = (msg.sender?._id || msg.sender)?.toString() === currentUserId?.toString();
                    return (
                        <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            {!isOwn && (
                                <div className="w-7 h-7 rounded-full bg-gray-200 mr-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                                    {msg.sender?.fullName?.charAt(0)}
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${isOwn ? 'bg-emerald-600 text-white' : 'bg-white text-gray-800'
                                }`}>
                                {isGlobalMode && !isOwn && <p className="text-[10px] font-bold text-emerald-600 mb-0.5">{msg.sender?.fullName}</p>}
                                <p className="leading-relaxed">{msg.content}</p>
                                <p className={`text-[9px] mt-1 text-right ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                                    {format(new Date(msg.createdAt), 'h:mm a')}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* LinkedIn Style Input Footer */}
            <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-2 mb-2 min-h-[60px]">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write a message..."
                        className="w-full bg-transparent border-none text-sm focus:ring-0 resize-none placeholder:text-gray-500"
                        rows={2}
                    />
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1">
                        <button type="button" className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors"><ImageIcon size={18} /></button>
                        <button type="button" className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors"><Paperclip size={18} /></button>
                        <button type="button" className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors"><Smile size={18} /></button>
                    </div>
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-gray-300 text-white rounded-full font-bold text-sm transition-all"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
