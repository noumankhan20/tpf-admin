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

export default function ChatWindow({ selectedAdmin, isGlobalMode, adminInfo }) {
    const [message, setMessage] = useState('');
    const [page, setPage] = useState(1);
    const [allMessages, setAllMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { socket } = useSocket();

    const { data: messagesData, isFetching, refetch } = useGetInternalMessagesQuery({
        otherAdminId: !isGlobalMode ? selectedAdmin?._id : undefined,
        isGlobal: isGlobalMode ? 'true' : undefined,
        page,
        limit: 20
    }, {
        skip: !isGlobalMode && !selectedAdmin?._id
    });

    const [sendMessage, { isLoading: isSending }] = useSendInternalMessageMutation();
    const [markAsRead] = useMarkMessagesAsReadMutation();

    // Reset when admin changes
    useEffect(() => {
        setPage(1);
        setAllMessages([]);
    }, [selectedAdmin?._id, isGlobalMode]);

    useEffect(() => {
        if (messagesData?.success) {
            const newMessages = messagesData.data;
            setHasMore(messagesData.pagination.hasMore);

            if (page === 1) {
                setAllMessages(newMessages);
                // Scroll to bottom on first load
                setTimeout(scrollToBottom, 100);
            } else {
                // Prepend previous messages
                const container = messagesContainerRef.current;
                const scrollHeightBefore = container.scrollHeight;

                setAllMessages(prev => {
                    const existingIds = new Set(prev.map(m => m._id));
                    const uniqueNew = newMessages.filter(m => !existingIds.has(m._id));
                    return [...uniqueNew, ...prev];
                });

                // Maintain scroll position after prepending
                setTimeout(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - scrollHeightBefore;
                    }
                }, 0);
            }
        }
    }, [messagesData, page]);

    useEffect(() => {
        if (socket) {
            const handleNewMessage = (payload) => {
                const isRelevant = payload.isGlobal ||
                    payload.sender._id === selectedAdmin?._id ||
                    payload.receiver?._id === selectedAdmin?._id ||
                    payload.sender === selectedAdmin?._id ||
                    payload.receiver === selectedAdmin?._id;

                if (isRelevant) {
                    // If it's from the other person or it's a new message in current convo
                    setAllMessages(prev => {
                        if (prev.find(m => m._id === payload._id)) return prev;
                        return [...prev, payload];
                    });

                    // If near bottom, scroll down
                    const container = messagesContainerRef.current;
                    if (container && (container.scrollHeight - container.scrollTop - container.clientHeight < 100)) {
                        setTimeout(scrollToBottom, 100);
                    }
                }
            };

            socket.on('new_internal_message', handleNewMessage);
            return () => socket.off('new_internal_message', handleNewMessage);
        }
    }, [socket, selectedAdmin?._id]);

    useEffect(() => {
        if (allMessages.length > 0) {
            const unreadIds = allMessages
                .filter(m => !m.readBy.includes(adminInfo._id) && m.sender._id !== adminInfo._id)
                .map(m => m._id);

            if (unreadIds.length > 0) {
                markAsRead({ messageIds: unreadIds });
            }
        }
    }, [allMessages, adminInfo._id, markAsRead]);

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
            const res = await sendMessage({
                receiverId: selectedAdmin?._id,
                content: message,
                isGlobal: isGlobalMode
            }).unwrap();

            // Message will be added via socket or manual append if socket fails
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
                        const isOwn = senderId === adminInfo._id;
                        return (
                            <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                    {!isOwn && (
                                        <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase tracking-tight">
                                            {msg.sender?.fullName || 'Admin'}
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
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
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
