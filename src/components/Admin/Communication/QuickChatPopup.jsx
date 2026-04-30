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
 * - Floating button to toggle messaging list
 * - Tabs for Admins and Super Admins
 * - Draggable chat windows
 */
export default function QuickChatPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChats, setActiveChats] = useState([]); // Array of { id, admin, isGlobal }
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('admins'); // 'admins' or 'superadmins'
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isTopHalf, setIsTopHalf] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

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

    // Load saved position
    useEffect(() => {
        const savedPos = localStorage.getItem('chat_button_position');
        if (savedPos) {
            try {
                const parsed = JSON.parse(savedPos);
                setPosition(parsed);
                // Simple heuristic to check if it was in top half
                if (parsed.y < -300) { // If dragged up significantly
                    setIsTopHalf(true);
                }
            } catch (e) {
                console.error("Failed to load chat position", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const handleDragEnd = (event, info) => {
        const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
        setPosition(newPos);
        localStorage.setItem('chat_button_position', JSON.stringify(newPos));

        // Detect if the button is now in the top half of the viewport
        const buttonElement = event.target.getBoundingClientRect();
        if (buttonElement.top < window.innerHeight / 2) {
            setIsTopHalf(true);
        } else {
            setIsTopHalf(false);
        }
    };

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
        const exists = activeChats.find(chat => chat.id === chatId);
        if (!exists) {
            // Add new chat to the stack (up to 3)
            setActiveChats(prev => [{ id: chatId, admin, isGlobal, isMinimized: false }, ...prev].slice(0, 3));
        } else if (exists.isMinimized) {
            // If already open but minimized, unminimize it
            setActiveChats(prev => prev.map(chat =>
                chat.id === chatId ? { ...chat, isMinimized: false } : chat
            ));
        }
    };

    const toggleMinimize = (chatId) => {
        setActiveChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, isMinimized: !chat.isMinimized } : chat
        ));
    };

    const closeChat = (chatId) => {
        setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
    };

    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = admin.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'superadmins' ? admin.isSuperAdmin : !admin.isSuperAdmin;
        return matchesSearch && matchesTab && admin._id !== currentUserId;
    });

    if (pathname === '/admin/communication' || !isLoaded) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100] pointer-events-none" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* 1. MAIN MESSAGING LIST & BUTTON (DRAGGABLE) */}
            <motion.div
                drag
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={{ x: position.x, y: position.y }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`flex ${isTopHalf ? 'flex-col-reverse' : 'flex-col'} items-end gap-4 pointer-events-auto`}
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: isTopHalf ? -20 : 20, transformOrigin: isTopHalf ? 'top right' : 'bottom right' }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: isTopHalf ? -20 : 20 }}
                            className={`${isTopHalf ? 'mt-4' : 'mb-4'} w-[300px] sm:w-[320px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-200 flex flex-col overflow-hidden`}
                            style={{ height: '520px' }}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when interacting with list
                        >
                            {/* List Header */}
                            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                        {adminInfo?.fullName?.charAt(0)}
                                    </div>
                                    <span className="font-bold text-[15px] text-gray-800">Messaging</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                        <Maximize2 size={16} onClick={() => router.push('/admin/communication')} />
                                    </button>
                                    <button onClick={togglePopup} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Search Messages */}
                            <div className="p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-bold" />
                                    <input
                                        type="text"
                                        placeholder="Search messages"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-100 border-none rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Role-based Tabs */}
                            <div className="flex border-b border-gray-200 px-2">
                                <button
                                    onClick={() => setActiveTab('admins')}
                                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'admins' ? 'text-emerald-700 border-emerald-700' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    Admins
                                </button>
                                <button
                                    onClick={() => setActiveTab('superadmins')}
                                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'superadmins' ? 'text-emerald-700 border-emerald-700' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    Super Admins
                                </button>
                            </div>

                            {/* Chat List Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* Global Channel Section */}
                                <button
                                    onClick={() => openChat(null, true)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 bg-emerald-50/30"
                                >
                                    <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                                        <Globe size={22} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-bold text-[14px] text-gray-900">Global Channel</p>
                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">Team-wide messages</p>
                                    </div>
                                    {globalUnreadCount > 0 && (
                                        <div className="bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shrink-0 shadow-sm">
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
                                            <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0 overflow-hidden border border-gray-200">
                                                {admin.fullName.charAt(0)}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <p className="font-bold text-[14px] text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{admin.fullName}</p>
                                                    <span className="text-[10px] text-gray-400">
                                                        {latestMsg ? format(new Date(latestMsg.createdAt), 'MMM d') : ''}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 truncate line-clamp-1">
                                                    {latestMsg?.content || 'No messages yet'}
                                                </p>
                                            </div>
                                            {unreadCounts[admin._id] > 0 && (
                                                <div className="bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shrink-0 shadow-sm">
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

                {/* Floating Main Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePopup}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 relative cursor-grab active:cursor-grabbing ${isOpen ? 'bg-gray-800' : 'bg-emerald-600'}`}
                >
                    {isOpen ? <X size={24} /> : (
                        <div className="relative pointer-events-none">
                            <MessageSquare size={24} />
                            {totalUnreadCount > 0 && (
                                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-lg border-2 border-white shadow-lg">
                                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                </span>
                            )}
                        </div>
                    )}
                </motion.button>
            </motion.div>

            {/* 2. DRAGGABLE CHAT WINDOWS */}
            <div className="fixed inset-0 pointer-events-none z-[110]">
                <AnimatePresence>
                    {activeChats.map((chat, index) => {
                        // LinkedIn vibe: Stack to the left of the messaging list
                        // List is at right-8 (32px), width 320px. Left edge is at innerWidth - 352.
                        // We want chat windows to start from there, going left.
                        const listLeftEdge = typeof window !== 'undefined' ? window.innerWidth - 352 : 0;
                        const chatWidth = 340;
                        const gap = 12;
                        const startX = listLeftEdge - (index + 1) * (chatWidth + gap);
                        const windowHeight = chat.isMinimized ? 48 : 410;
                        const startY = typeof window !== 'undefined' ? window.innerHeight - windowHeight : 0;

                        return (
                            <motion.div
                                key={chat.id}
                                drag={!chat.isMinimized}
                                dragMomentum={false}
                                initial={{ opacity: 0, scale: 0.9, x: startX, y: startY + 50 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: startX,
                                    y: startY
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                    mass: 0.8
                                }}
                                className="absolute w-[320px] sm:w-[340px] pointer-events-auto shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] rounded-xl overflow-hidden"
                            >
                                <MiniChatWindow
                                    chat={chat}
                                    adminInfo={adminInfo}
                                    onClose={() => closeChat(chat.id)}
                                    onMinimize={() => toggleMinimize(chat.id)}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div >
    );
}

function MiniChatWindow({ chat, adminInfo, onClose, onMinimize }) {
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
            console.error(err);
        }
    };

    return (
        <div className={`flex flex-col bg-white border border-gray-200 overflow-hidden ${chat.isMinimized ? 'h-[48px]' : 'h-[400px]'}`}>
            {/* Window Header - Draggable Handle */}
            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 cursor-move">
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMinimize();
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        {chat.isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Typing Indicator */}
            {typingUser && (
                <div className="px-3 py-1.5 bg-white border-b border-gray-100 flex items-center gap-2">
                    <div className="flex gap-0.5">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600">
                        {isGlobalMode ? `${typingUser.split(' ')[0]} is typing...` : 'typing...'}
                    </p>
                </div>
            )}

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
                {/* 48-hour Auto-delete Notice */}
                <div className="flex items-center justify-center py-1 mb-2">
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
                        Messages auto-delete in 48 hours
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mb-2 min-h-[60px]">
                    <textarea
                        value={message}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                handleSend(e);
                            }
                        }}
                        placeholder="Write a message..."
                        className="w-full bg-transparent border-none text-sm focus:ring-0 focus:outline-none resize-none placeholder:text-gray-500"
                        rows={2}
                    />
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1">

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
