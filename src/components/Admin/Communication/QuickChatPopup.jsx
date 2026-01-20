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
        <div ref={containerRef} className="fixed bottom-8 right-8 z-[100]" style={{ fontFamily: 'Arial, sans-serif' }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-24 right-0 w-[400px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/40 flex flex-col overflow-hidden"
                        style={{ height: 'min(650px, calc(100vh - 140px))' }}
                    >
                        {/* Popup Header - Premium Glassy Gradient */}
                        <div className="p-6 bg-gradient-to-r from-emerald-600/95 to-teal-600/95 text-white flex items-center justify-between shadow-xl relative overflow-hidden backdrop-blur-sm">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-300/20 rounded-full -ml-12 -mb-12 blur-2xl" />

                            <div className="flex items-center gap-4 relative z-10 w-full pr-10">
                                <AnimatePresence mode="wait">
                                    {(selectedAdmin || isGlobalMode) ? (
                                        <motion.button
                                            key="back"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -10, opacity: 0 }}
                                            onClick={() => { setSelectedAdmin(null); setIsGlobalMode(false); }}
                                            className="p-2.5 hover:bg-white/20 rounded-xl transition-all active:scale-95 group/back"
                                        >
                                            <ArrowLeft className="w-5 h-5 group-hover/back:-translate-x-0.5 transition-transform" />
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="icon"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-[inset_0_0_15px_rgba(255,255,255,0.2)] shrink-0"
                                        >
                                            <MessageSquare className="w-5 h-5 text-white drop-shadow-md" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-extrabold text-lg tracking-tight leading-none mb-1.5 truncate text-shadow-sm">
                                        {isGlobalMode ? 'Global Channel' : selectedAdmin ? selectedAdmin.fullName : 'Admin Chats'}
                                    </h3>
                                    <p className="text-[10px] text-emerald-50 font-bold uppercase tracking-[0.15em] opacity-90 flex items-center gap-1.5">
                                        {selectedAdmin ? <><User className="w-3 h-3" /> Personal Chat</> : isGlobalMode ? <><Globe className="w-3 h-3" /> Broadcast</> : <><ShieldCheck className="w-3 h-3" /> Internal Messaging</>}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-6 right-5 z-20 flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        router.push('/admin/communication');
                                        setIsOpen(false);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-full transition-all group/max"
                                    title="View Full Screen"
                                >
                                    <Maximize2 className="w-4 h-4 group-hover/max:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={togglePopup}
                                    className="p-2 hover:bg-white/20 rounded-full transition-all active:rotate-90 group/close"
                                >
                                    <X className="w-5 h-5 group-hover/close:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/50">
                            {selectedAdmin || isGlobalMode ? (
                                <MiniChatWindow
                                    selectedAdmin={selectedAdmin}
                                    isGlobalMode={isGlobalMode}
                                    adminInfo={adminInfo}
                                />
                            ) : (
                                <div className="flex flex-col h-full">
                                    {/* Search - Glassy Floating Look */}
                                    <div className="px-5 py-4 bg-white/40 backdrop-blur-sm z-10">
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search admin members..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 transition-all shadow-sm"
                                                style={{ fontFamily: 'Arial, sans-serif' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Chat List */}
                                    <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
                                        {/* Global Chat Item - Featured style */}
                                        <button
                                            onClick={() => setIsGlobalMode(true)}
                                            className="w-full flex items-center gap-4 p-4 mb-2 rounded-[1.2rem] bg-gradient-to-r from-emerald-50/50 to-teal-50/30 hover:from-emerald-100/50 hover:to-teal-100/30 transition-all duration-300 group relative border border-emerald-100/50"
                                        >
                                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 group-hover:shadow-emerald-500/30 transition-all duration-300">
                                                <Globe className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className="font-black text-gray-800 group-hover:text-emerald-700 transition-colors text-[15px]">Global Channel</p>
                                                <p className="text-xs text-gray-500 font-medium truncate mt-0.5">Communicate with all administrators</p>
                                            </div>
                                            {globalUnreadCount > 0 && (
                                                <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30 animate-pulse">
                                                    {globalUnreadCount}
                                                </span>
                                            )}
                                        </button>

                                        <div className="px-4 py-3 flex items-center gap-3">
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Admins</h4>
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                        </div>

                                        {adminsLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Connecting...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {filteredAdmins.map((admin) => (
                                                    <button
                                                        key={admin._id}
                                                        onClick={() => setSelectedAdmin(admin)}
                                                        className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white hover:shadow-md hover:shadow-gray-200/50 transition-all duration-300 group border border-transparent hover:border-gray-100"
                                                    >
                                                        <div className="relative">
                                                            <div className="w-12 h-12 bg-gradient-to-tr from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-black text-lg shadow-inner group-hover:from-emerald-50 group-hover:to-teal-50 group-hover:text-emerald-600 transition-colors">
                                                                {admin.fullName.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 text-left overflow-hidden">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <p className="font-bold text-gray-700 truncate group-hover:text-emerald-700 transition-colors text-[15px]">{admin.fullName}</p>
                                                                {unreadCounts[admin._id] > 0 && (
                                                                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md shadow-emerald-500/20">
                                                                        {unreadCounts[admin._id]}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 font-semibold truncate uppercase tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
                                                                {admin.isSuperAdmin ? 'Key Authority' : 'System Admin'}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2 backdrop-blur-sm">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Admin Network</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button - Premium Style */}
            <motion.button
                whileHover={{ scale: 1.05, translateY: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePopup}
                className={`w-[4.5rem] h-[4.5rem] rounded-[1.8rem] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(16,185,129,0.3)] relative overflow-hidden transition-all duration-500 group border-4 border-white/20 ${isOpen ? 'bg-gray-900 shadow-gray-900/30 rotate-90' : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
                    }`}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

                {isOpen ? (
                    <X className="w-8 h-8 relative z-10" />
                ) : (
                    <MessageSquare className="w-8 h-8 relative z-10" />
                )}

                {/* Pulsing Core */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 ${isOpen ? 'hidden' : 'block'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 bg-white/50 ${isOpen ? 'hidden' : 'block'}`}></span>
                </span>

                {/* Unread Badge - Floating Effect */}
                {totalUnreadCount > 0 && !isOpen && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -left-1 bg-red-500 text-white text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl border-[3px] border-white shadow-xl z-20"
                    >
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </motion.span>
                )}
            </motion.button>
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
        <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Typing Indicator Bar */}
            <div className="h-7 bg-white/90 backdrop-blur-md px-4 flex items-center shadow-sm border-b border-gray-100 z-10 transition-all">
                {typingUser ? (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="flex gap-0.5">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            {isGlobalMode ? `${typingUser} is typing...` : 'typing...'}
                        </p>
                    </motion.div>
                ) : (
                    <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.2em] w-full text-center">
                        {isGlobalMode ? 'Global Shared Space' : 'Direct Conversation'}
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative"
                style={{
                    backgroundImage: `url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-whatsapp-theme-dot-pattern-light-background.jpg")`,
                    backgroundSize: '350px',
                    backgroundRepeat: 'repeat',
                }}
            >
                <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[2px] pointer-events-none" />

                <div className="flex flex-col gap-2 relative z-10 pb-2">
                    {allMessages.map((msg, i) => {
                        const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
                        const isOwn = senderId?.toString() === currentUserId?.toString();
                        const isContinuation = i > 0 && (allMessages[i - 1].sender?._id || allMessages[i - 1].sender?.id || allMessages[i - 1].sender)?.toString() === senderId?.toString();

                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                key={msg._id || i}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isContinuation ? 'mt-0.5' : 'mt-2'}`}
                            >
                                <div className={`max-w-[85%] px-3.5 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative group ${isOwn
                                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-[1.2rem] rounded-tr-sm'
                                    : 'bg-white text-gray-800 rounded-[1.2rem] rounded-tl-sm border border-gray-100'
                                    }`}>
                                    {isGlobalMode && !isOwn && !isContinuation && (
                                        <p className="text-[10px] font-black text-emerald-600 mb-0.5 uppercase tracking-tighter leading-none">
                                            {msg.sender?.fullName}
                                        </p>
                                    )}
                                    <p className="text-[13.5px] leading-snug break-words font-medium">{msg.content}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                                            {format(new Date(msg.createdAt), 'hh:mm a')}
                                        </span>
                                        {isOwn && (
                                            <span className={`text-[11px] font-bold ${msg.readBy?.length > 0 ? 'text-emerald-100' : 'text-emerald-300/70'}`}>
                                                ✓✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Notice about 48h deletion */}
            <div className="bg-white px-4 py-1.5 flex items-center justify-center border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    Messages automatically deleted in 48 hours
                </p>
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-20">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-5 py-3 text-[13.5px] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-200 transition-all placeholder:text-gray-400"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!message.trim() || isSending}
                    className="w-11 h-11 bg-emerald-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:grayscale shadow-lg shadow-emerald-500/30 active:bg-emerald-700 transition-all"
                >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </motion.button>
            </form>
        </div>
    );
}
