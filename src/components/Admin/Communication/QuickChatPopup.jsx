"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowLeft, Search, Globe, Send, Loader2, Sparkles, User, ShieldCheck, Maximize2 } from 'lucide-react';
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

export default function QuickChatPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isGlobalMode, setIsGlobalMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);

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

    const filteredAdmins = admins.filter(admin =>
        admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        admin._id !== currentUserId
    );

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (pathname === '/admin/communication') return null;

    return (
        <div ref={containerRef} className="fixed bottom-8 right-8 z-[100]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="absolute bottom-24 right-0 w-[400px] bg-white rounded-3xl shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1),0_20px_50px_-10px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col overflow-hidden"
                        style={{ height: 'min(680px, calc(100vh - 140px))' }}
                    >
                        {/* Popup Header - Light Professional Header */}
                        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10 w-full pr-10">
                                <AnimatePresence mode="wait">
                                    {(selectedAdmin || isGlobalMode) ? (
                                        <motion.button
                                            key="back"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -10, opacity: 0 }}
                                            onClick={() => { setSelectedAdmin(null); setIsGlobalMode(false); }}
                                            className="p-2 hover:bg-gray-50 rounded-lg transition-all active:scale-95 group/back text-slate-500"
                                        >
                                            <ArrowLeft className="w-5 h-5 group-hover/back:-translate-x-0.5 transition-transform" />
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="icon"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-lg tracking-tight leading-none mb-1 truncate text-slate-800">
                                        {isGlobalMode ? 'Global Team' : selectedAdmin ? selectedAdmin.fullName : 'Messages'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.1em] flex items-center gap-1.5 mt-0.5">
                                        {selectedAdmin ? <><User className="w-3 h-3 text-emerald-500" /> Direct Messaging</> : isGlobalMode ? <><Globe className="w-3 h-3 text-emerald-500" /> Global Channel</> : <><ShieldCheck className="w-3 h-3 text-emerald-500" /> Internal Communication</>}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-6 right-5 z-20 flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        router.push('/admin/communication');
                                        setIsOpen(false);
                                    }}
                                    className="p-2 hover:bg-gray-50 rounded-lg transition-all text-slate-400 hover:text-slate-600"
                                    title="View Full Screen"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={togglePopup}
                                    className="p-2 hover:bg-gray-50 rounded-lg transition-all text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative flex flex-col bg-white">
                            {selectedAdmin || isGlobalMode ? (
                                <MiniChatWindow
                                    selectedAdmin={selectedAdmin}
                                    isGlobalMode={isGlobalMode}
                                    adminInfo={adminInfo}
                                />
                            ) : (
                                <div className="flex flex-col h-full">
                                    {/* Search */}
                                    <div className="px-5 py-4 bg-white border-b border-gray-50">
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search members..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/30 focus:bg-white transition-all text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Chat List */}
                                    <div className="flex-1 overflow-y-auto pt-2 pb-3 custom-scrollbar">
                                        {/* Global Chat Item - Emerald Light Style */}
                                        <div className="px-3 mb-4">
                                            <button
                                                onClick={() => setIsGlobalMode(true)}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/60 transition-all duration-300 group shadow-sm"
                                            >
                                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                                    <Globe className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="font-bold text-emerald-900 text-[15px]">Global Channel</p>
                                                    <p className="text-[11px] text-emerald-600 font-medium truncate mt-0.5">Communicate with all administrators</p>
                                                </div>
                                                {globalUnreadCount > 0 && (
                                                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {globalUnreadCount}
                                                    </span>
                                                )}
                                            </button>
                                        </div>

                                        <div className="px-5 py-2 mb-2 flex items-center gap-3">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Direct Messages</h4>
                                            <div className="h-px bg-gray-100 flex-1"></div>
                                        </div>

                                        {adminsLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading Chats</p>
                                            </div>
                                        ) : (
                                            <div className="px-3 space-y-1">
                                                {filteredAdmins.map((admin) => (
                                                    <button
                                                        key={admin._id}
                                                        onClick={() => setSelectedAdmin(admin)}
                                                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent"
                                                    >
                                                        <div className="relative">
                                                            <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-base transition-colors group-hover:bg-white group-hover:text-emerald-600 border border-transparent group-hover:border-emerald-100">
                                                                {admin.fullName.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 text-left overflow-hidden">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <p className="font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors text-[14px]">{admin.fullName}</p>
                                                                {unreadCounts[admin._id] > 0 && (
                                                                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                        {unreadCounts[admin._id]}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 font-medium truncate">
                                                                {admin.isSuperAdmin ? 'Super Administrator' : 'System Administrator'}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="p-3 bg-gray-50 flex items-center justify-center gap-2 border-t border-gray-100">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Internal Messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button - Clean Professional Logic */}
            <div className="relative group">
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePopup}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 relative ${isOpen ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-emerald-500 hover:bg-emerald-500/90 shadow-emerald-500/20 shadow-xl'
                        }`}
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <MessageSquare className="w-6 h-6" />
                    )}
                </motion.button>

                {/* Unread Badge - Floating Effect - Moved OUTSIDE overflow-hidden button */}
                {totalUnreadCount > 0 && !isOpen && (
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-2 -left-2 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-lg border-2 border-white shadow-lg z-20"
                    >
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </motion.span>
                )}
            </div>
        </div>
    );
}

function MiniChatWindow({ selectedAdmin, isGlobalMode, adminInfo }) {
    const [message, setMessage] = useState('');
    const [allMessages, setAllMessages] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { socket } = useSocket();

    const currentUserId = adminInfo?._id || adminInfo?.id;
    const selectedAdminId = selectedAdmin?._id || selectedAdmin?.id;

    const { data: messagesData, isFetching } = useGetInternalMessagesQuery({
        otherAdminId: !isGlobalMode ? selectedAdminId : undefined,
        isGlobal: isGlobalMode ? 'true' : undefined,
        limit: 50
    });

    const [sendMessage, { isLoading: isSending }] = useSendInternalMessageMutation();
    const [markAsRead] = useMarkMessagesAsReadMutation();

    useEffect(() => {
        if (messagesData?.success) {
            setAllMessages(messagesData.data);
            setTimeout(scrollToBottom, 500);
        }
    }, [messagesData]);

    useEffect(() => {
        if (socket && currentUserId) {
            const handleNewMessage = (payload) => {
                const sAdminId = selectedAdminId?.toString();
                const pSenderId = (payload.sender?._id || payload.sender?.id || payload.sender)?.toString();
                const pReceiverId = (payload.receiver?._id || payload.receiver?.id || payload.receiver)?.toString();
                const cUserId = currentUserId?.toString();

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

            const handleTyping = (payload) => {
                const payloadSenderId = payload.senderId?.toString();
                const payloadReceiverId = payload.receiverId?.toString();
                const sAdminId = selectedAdminId?.toString();
                const cUserId = currentUserId?.toString();

                if (payloadSenderId === cUserId) return;

                const isRelevant = isGlobalMode
                    ? payload.isGlobal
                    : (!payload.isGlobal && payloadSenderId === sAdminId && payloadReceiverId === cUserId);

                if (isRelevant) {
                    setTypingUser(payload.senderName);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
                }
            };

            socket.on('new_internal_message', handleNewMessage);
            socket.on('typing_internal', handleTyping);
            return () => {
                socket.off('new_internal_message', handleNewMessage);
                socket.off('typing_internal', handleTyping);
            };
        }
    }, [socket, selectedAdminId, currentUserId, isGlobalMode]);

    useEffect(() => {
        if (allMessages.length > 0 && currentUserId) {
            const cUserId = currentUserId.toString();
            const unreadIds = allMessages
                .filter(m => {
                    const senderId = m.sender?._id || m.sender?.id || m.sender;
                    return !m.readBy.includes(cUserId) && senderId?.toString() !== cUserId;
                })
                .map(m => m._id);

            if (unreadIds.length > 0) {
                markAsRead({ messageIds: unreadIds });
            }
        }
    }, [allMessages, currentUserId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleInputChange = (value) => {
        setMessage(value);
        if (socket && currentUserId) {
            socket.emit('typing_internal', {
                senderId: currentUserId,
                senderName: adminInfo?.fullName,
                receiverId: isGlobalMode ? null : selectedAdminId,
                isGlobal: isGlobalMode
            });
        }
    };

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
            console.error("Failed to send message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Typing Indicator Bar */}
            <div className="h-8 bg-white px-4 flex items-center border-b border-gray-100 z-10 transition-all">
                {typingUser ? (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="flex gap-0.5">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            {isGlobalMode ? `${typingUser.split(' ')[0]} typing` : 'typing...'}
                        </p>
                    </motion.div>
                ) : (
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] w-full text-center">
                        End-to-End Encrypted Secure Channel
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
                <div className="flex flex-col gap-2 pb-2">
                    {allMessages.map((msg, i) => {
                        const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
                        const isOwn = senderId?.toString() === currentUserId?.toString();
                        const isContinuation = i > 0 && (allMessages[i - 1].sender?._id || allMessages[i - 1].sender?.id || allMessages[i - 1].sender)?.toString() === senderId?.toString();

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg._id || i}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isContinuation ? 'mt-0.5' : 'mt-3'}`}
                            >
                                <div className={`max-w-[85%] px-4 py-2.5 shadow-sm relative ${isOwn
                                    ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm'
                                    : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-gray-100'
                                    }`}>
                                    {isGlobalMode && !isOwn && !isContinuation && (
                                        <p className="text-[10px] font-bold text-emerald-500 mb-1 uppercase tracking-tight">
                                            {msg.sender?.fullName}
                                        </p>
                                    )}
                                    <p className="text-[14px] leading-relaxed break-words font-medium">{msg.content}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-40">
                                        <span className="text-[9px] font-bold uppercase">
                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                        </span>
                                        {isOwn && (
                                            <ShieldCheck className={`w-2.5 h-2.5 ${msg.readBy?.length > 0 ? 'text-white' : 'text-white/40'}`} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div ref={messagesEndRef} className="h-2" />
            </div>

            <div className="bg-white border-t border-gray-100 flex flex-col pt-1 pb-3 px-3 gap-2">
                {/* Notice about 48h deletion */}
                <div className="flex items-center justify-center py-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
                        Auto-delete active: 48 hours
                    </p>
                </div>

                <form onSubmit={handleSend} className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Type internal message..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/30 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="px-5 bg-emerald-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale shadow-lg shadow-emerald-500/20 active:bg-emerald-600 transition-all"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
