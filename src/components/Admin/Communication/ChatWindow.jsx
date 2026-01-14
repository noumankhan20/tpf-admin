"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    useGetInternalMessagesQuery,
    useSendInternalMessageMutation,
    useMarkMessagesAsReadMutation
} from '@/utils/slices/internalCommunicationApiSlice';
import { Send, Loader2, User, Globe, MessageCircle, ChevronUp } from 'lucide-react';
import { useSocket } from '@/utils/context/SocketContext';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { internalCommunicationApiSlice } from '@/utils/slices/internalCommunicationApiSlice';

const MessageItem = ({ msg, isOwn, adminInfo, onVisible }) => {
    const itemRef = useRef(null);

    useEffect(() => {
        if (isOwn) return; // Don't track own messages

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onVisible(msg._id);
                    observer.disconnect(); // Only track once
                }
            },
            { threshold: 0.5 }
        );

        if (itemRef.current) {
            observer.observe(itemRef.current);
        }

        return () => observer.disconnect();
    }, [msg._id, isOwn, onVisible]);

    return (
        <div ref={itemRef} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                    <span className="text-[10px] font-bold text-emerald-600 mb-1 ml-1 uppercase tracking-tight">
                        {msg.sender?.fullName || 'Admin'}
                    </span>
                )}
                {isOwn && (
                    <span className="text-[10px] font-bold text-gray-500 mb-1 mr-1 uppercase tracking-tight">
                        {adminInfo?.fullName}
                    </span>
                )}
                <div className={`p-3 rounded-2xl shadow-sm text-sm ${isOwn
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                    {msg.content}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 flex items-center gap-1 uppercase font-bold tracking-tighter">
                    {format(new Date(msg.createdAt), 'hh:mm a')}
                    {isOwn && msg.readBy?.length > 0 && (
                        <span className="text-blue-500 ml-1">Read</span>
                    )}
                </span>
            </div>
        </div>
    );
};

export default function ChatWindow({ selectedAdmin, isGlobalMode, adminInfo }) {
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const [page, setPage] = useState(1);
    const [allMessages, setAllMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [typingAdmin, setTypingAdmin] = useState(null);
    const typingTimeoutRef = useRef(null);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { socket } = useSocket();

    const currentUserId = adminInfo?._id || adminInfo?.id;
    const selectedAdminId = selectedAdmin?._id || selectedAdmin?.id;

    const { data: messagesData, isFetching, refetch } = useGetInternalMessagesQuery({
        otherAdminId: !isGlobalMode ? selectedAdminId : undefined,
        isGlobal: isGlobalMode ? 'true' : undefined,
        page,
        limit: 20
    }, {
        skip: !isGlobalMode && !selectedAdminId
    });

    const [sendMessage, { isLoading: isSending }] = useSendInternalMessageMutation();
    const [markAsRead] = useMarkMessagesAsReadMutation();

    // Reset when admin changes
    useEffect(() => {
        setPage(1);
        setAllMessages([]);
        // The query params will naturally change and fetch new data
    }, [selectedAdminId, isGlobalMode]);

    useEffect(() => {
        if (messagesData?.success && !isFetching) {
            const newMessages = messagesData.data;
            setHasMore(messagesData.pagination.hasMore);

            if (page === 1) {
                setAllMessages(newMessages);
                setTimeout(scrollToBottom, 300);
            } else {
                const container = messagesContainerRef.current;
                const scrollHeightBefore = container.scrollHeight;

                setAllMessages(prev => {
                    const existingIds = new Set(prev.map(m => m._id));
                    const uniqueNew = newMessages.filter(m => !existingIds.has(m._id));
                    // uniqueNew is older page [M61...M80], prev is newer [M81...M100]
                    return [...uniqueNew, ...prev];
                });

                setTimeout(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - scrollHeightBefore;
                    }
                }, 0);
            }
        }
    }, [messagesData, page, isFetching]);

    useEffect(() => {
        if (socket && currentUserId) {
            const handleNewMessage = (payload) => {
                const pSenderId = (payload.sender?._id || payload.sender?.id || payload.sender)?.toString();
                const pReceiverId = (payload.receiver?._id || payload.receiver?.id || payload.receiver)?.toString();
                const sAdminId = selectedAdminId?.toString();
                const cUserId = currentUserId?.toString();

                const isRelevant = isGlobalMode
                    ? payload.isGlobal
                    : (!payload.isGlobal && sAdminId && (pSenderId === sAdminId || pReceiverId === sAdminId));

                if (isRelevant) {
                    setAllMessages(prev => {
                        if (prev.find(m => m._id === payload._id)) return prev;
                        return [...prev, payload];
                    });

                    // Optimization: Manual Cache Update
                    dispatch(
                        internalCommunicationApiSlice.util.updateQueryResult(
                            'getInternalMessages',
                            {
                                otherAdminId: !isGlobalMode ? sAdminId : undefined,
                                isGlobal: isGlobalMode ? 'true' : undefined,
                                page: 1,
                                limit: 20
                            },
                            (draft) => {
                                if (draft?.success && Array.isArray(draft.data)) {
                                    if (!draft.data.find(m => m._id === payload._id)) {
                                        draft.data.push(payload);
                                    }
                                }
                            }
                        )
                    );

                    const container = messagesContainerRef.current;
                    if (container && (container.scrollHeight - container.scrollTop - container.clientHeight < 300)) {
                        setTimeout(scrollToBottom, 100);
                    }
                }
            };

            const handleTypingStart = (payload) => {
                const sAdminId = selectedAdminId?.toString();
                if (isGlobalMode && payload.isGlobal) {
                    setTypingAdmin(payload.senderName);
                } else if (!isGlobalMode && !payload.isGlobal && payload.senderId?.toString() === sAdminId) {
                    setTypingAdmin(payload.senderName);
                }
            };

            const handleTypingStop = (payload) => {
                setTypingAdmin(null);
            };

            socket.on('new_internal_message', handleNewMessage);
            socket.on('typing_start', handleTypingStart);
            socket.on('typing_stop', handleTypingStop);

            return () => {
                socket.off('new_internal_message', handleNewMessage);
                socket.off('typing_start', handleTypingStart);
                socket.off('typing_stop', handleTypingStop);
            };
        }
    }, [socket, selectedAdminId, currentUserId, isGlobalMode, dispatch]);

    const handleVisible = (msgId) => {
        markAsRead({ messageIds: [msgId] });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLoadMore = () => {
        if (hasMore && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        try {
            await sendMessage({
                receiverId: selectedAdminId,
                content: message,
                isGlobal: isGlobalMode
            }).unwrap();

            setMessage('');
            scrollToBottom();
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${isGlobalMode
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                        : 'bg-gradient-to-br from-blue-500 to-teal-500'
                        }`}>
                        {isGlobalMode ? <Globe className="w-5 h-5" /> : selectedAdmin?.fullName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">
                            {isGlobalMode ? 'Global Channel' : selectedAdmin?.fullName}
                        </h3>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Active Now
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30"
            >
                {hasMore && (
                    <div className="flex justify-center pb-4">
                        <button
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all flex items-center gap-2 border border-blue-100 shadow-sm disabled:opacity-50"
                        >
                            {isFetching ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <ChevronUp className="w-3 h-3" />
                            )}
                            Load previous messages
                        </button>
                    </div>
                )}

                {allMessages.length === 0 && !isFetching ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <MessageCircle className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">No messages yet. Say hi!</p>
                    </div>
                ) : (
                    allMessages.map((msg, i) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isOwn = senderId?.toString() === currentUserId?.toString();
                        return (
                            <MessageItem
                                key={msg._id}
                                msg={msg}
                                isOwn={isOwn}
                                adminInfo={adminInfo}
                                onVisible={handleVisible}
                            />
                        )
                    })
                )}

                {typingAdmin && (
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold animate-pulse ml-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {typingAdmin} is typing...
                    </div>
                )}

                <div ref={messagesEndRef} />

                {/* 48 Hour Deletion Notice Moved to Bottom */}
                <div className="flex justify-center pt-4 sticky bottom-0 z-20">
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50/90 backdrop-blur-sm border border-amber-100 rounded-full text-[10px] font-bold text-amber-600 uppercase tracking-widest shadow-sm">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                        Messages are automatically deleted after 48 hours
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            // Typing indicator logic
                            if (socket && (selectedAdminId || isGlobalMode)) {
                                socket.emit("typing_start", {
                                    receiverId: selectedAdminId,
                                    isGlobal: isGlobalMode,
                                    senderId: currentUserId,
                                    senderName: adminInfo?.fullName || "Admin"
                                });

                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = setTimeout(() => {
                                    socket.emit("typing_stop", {
                                        receiverId: selectedAdminId,
                                        isGlobal: isGlobalMode
                                    });
                                }, 3000);
                            }
                        }}
                        placeholder={isGlobalMode ? "Send to all admins..." : "Type your message..."}
                        className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center min-w-[50px]"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
