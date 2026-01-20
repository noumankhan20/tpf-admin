"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    useGetInternalMessagesQuery,
    useSendInternalMessageMutation,
    useMarkMessagesAsReadMutation
} from '@/utils/slices/internalCommunicationApiSlice';
import { Send, Loader2, User, Globe, MessageCircle, ChevronUp, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { useSocket } from '@/utils/context/SocketContext';
import { format, isToday, isYesterday } from 'date-fns';

export default function ChatWindow({ selectedAdmin, isGlobalMode, adminInfo }) {
    const [message, setMessage] = useState('');
    const [page, setPage] = useState(1);
    const [allMessages, setAllMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { socket } = useSocket();

    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);

    const currentUserId = adminInfo?._id || adminInfo?.id;
    const selectedAdminId = selectedAdmin?._id || selectedAdmin?.id;

    const { data: messagesData, isFetching, refetch } = useGetInternalMessagesQuery({
        otherAdminId: !isGlobalMode ? selectedAdminId : undefined,
        isGlobal: isGlobalMode ? 'true' : undefined,
        page,
        limit: 30
    }, {
        skip: !isGlobalMode && !selectedAdminId
    });

    const [sendMessage, { isLoading: isSending }] = useSendInternalMessageMutation();
    const [markAsRead] = useMarkMessagesAsReadMutation();

    // Reset when admin changes
    useEffect(() => {
        setPage(1);
        setAllMessages([]);
        setTypingUser(null);
    }, [selectedAdminId, isGlobalMode]);

    useEffect(() => {
        if (messagesData?.success) {
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
                    return [...uniqueNew, ...prev];
                });

                setTimeout(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - scrollHeightBefore;
                    }
                }, 0);
            }
        }
    }, [messagesData, page]);

    useEffect(() => {
        if (socket && currentUserId) {
            const handleNewMessage = (payload) => {
                const payloadSenderId = payload.sender?._id || payload.sender?.id || payload.sender;
                const payloadReceiverId = payload.receiver?._id || payload.receiver?.id || payload.receiver;

                const sAdminId = selectedAdminId?.toString();
                const pSenderId = payloadSenderId?.toString();
                const pReceiverId = payloadReceiverId?.toString();
                const cUserId = currentUserId?.toString();

                const isRelevant = isGlobalMode
                    ? payload.isGlobal
                    : (!payload.isGlobal && sAdminId && (pSenderId === sAdminId || pReceiverId === sAdminId));

                if (isRelevant) {
                    setAllMessages(prev => {
                        if (prev.find(m => m._id === payload._id)) return prev;
                        return [...prev, payload];
                    });

                    const container = messagesContainerRef.current;
                    if (container && (container.scrollHeight - container.scrollTop - container.clientHeight < 250)) {
                        setTimeout(scrollToBottom, 100);
                    }
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
    }, [allMessages, currentUserId, markAsRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLoadMore = () => {
        if (hasMore && !isFetching) {
            setPage(prev => prev + 1);
        }
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
            const tempMessage = {
                _id: Date.now().toString(),
                content: message,
                sender: adminInfo,
                createdAt: new Date().toISOString(),
                readBy: [],
                isGlobal: isGlobalMode
            };

            // Optimistic update for better UX
            setAllMessages(prev => [...prev, tempMessage]);
            const currentMsg = message;
            setMessage('');
            scrollToBottom();

            await sendMessage({
                receiverId: selectedAdminId,
                content: currentMsg,
                isGlobal: isGlobalMode
            }).unwrap();

        } catch (err) {
            console.error("Failed to send message:", err);
            // Revert on error? Or show error indicator
        }
    };

    const formatMessageDate = (date) => {
        const d = new Date(date);
        if (isToday(d)) return format(d, 'hh:mm a');
        if (isYesterday(d)) return `Yesterday, ${format(d, 'hh:mm a')}`;
        return format(d, 'MMM d, hh:mm a');
    };

    return (
        <div className="flex flex-col h-full bg-[#e5ddd5] relative">
            {/* Header */}
            <header className="p-3 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-20 min-h-[70px]">
                <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-transform hover:scale-105 cursor-pointer ${isGlobalMode
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        }`}>
                        {isGlobalMode ? <Globe className="w-6 h-6" /> : selectedAdmin?.fullName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-extrabold text-[#111b21] text-lg leading-tight">
                            {isGlobalMode ? 'Internal Global Channel' : selectedAdmin?.fullName}
                        </h3>
                        {typingUser && (
                            <p className="text-[14px] text-emerald-600 font-bold italic animate-pulse">
                                {isGlobalMode ? `${typingUser} is typing...` : 'typing...'}
                            </p>
                        )}
                    </div>
                </div>

            </header>

            {/* Messages Area with WhatsApp Background Pattern */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 relative custom-scrollbar"
                style={{
                    backgroundImage: `url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-whatsapp-theme-dot-pattern-light-background.jpg")`,
                    backgroundSize: '400px',
                    backgroundRepeat: 'repeat',
                    backgroundBlendMode: 'soft-light'
                }}
            >
                {hasMore && (
                    <div className="flex justify-center pb-6">
                        <button
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            className="text-[13px] font-black text-white bg-emerald-600/80 hover:bg-emerald-600 px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm disabled:opacity-50 uppercase tracking-widest"
                        >
                            {isFetching ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <ChevronUp className="w-3.5 h-3.5" />
                            )}
                            Previous Messages
                        </button>
                    </div>
                )}

                {allMessages.length === 0 && !isFetching ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white/20 backdrop-blur-[2px] rounded-3xl p-10 mx-auto max-w-sm border border-white/30">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                            <MessageCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-base font-black uppercase tracking-widest mb-1">Secure Channel Established</p>
                        <p className="text-[13px] font-medium text-center">Start the conversation below.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {allMessages.map((msg, i) => {
                            const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
                            const isOwn = senderId?.toString() === currentUserId?.toString();

                            // Check if date header needed
                            const showDate = i === 0 ||
                                format(new Date(allMessages[i - 1].createdAt), 'yyyy-MM-dd') !==
                                format(new Date(msg.createdAt), 'yyyy-MM-dd');

                            return (
                                <React.Fragment key={msg._id}>
                                    {showDate && (
                                        <div className="flex justify-center my-6">
                                            <span className="px-4 py-1.5 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] border border-white/50">
                                                {isToday(new Date(msg.createdAt)) ? 'Today' :
                                                    isYesterday(new Date(msg.createdAt)) ? 'Yesterday' :
                                                        format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex w-full mb-1 ${isOwn ? 'justify-end pl-12' : 'justify-start pr-12'}`}>
                                        <div className={`relative px-4 py-3 shadow-sm min-w-[80px] group ${isOwn
                                            ? 'bg-[#dcf8c6] rounded-l-xl rounded-br-xl rounded-tr-none'
                                            : 'bg-white rounded-r-xl rounded-bl-xl rounded-tl-none'
                                            }`}>

                                            {/* Triangle tip for bubble */}
                                            <div className={`absolute top-0 w-2 h-2 ${isOwn
                                                ? '-right-1.5 bg-[#dcf8c6] [clip-path:polygon(0_0,0_100%,100%_0)]'
                                                : '-left-1.5 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)]'
                                                }`}></div>

                                            {isGlobalMode && !isOwn && (
                                                <p className="text-[12px] font-black text-emerald-600 mb-1 leading-none">
                                                    {msg.sender?.fullName}
                                                </p>
                                            )}

                                            <p className="text-[16px] text-[#111b21] leading-relaxed break-words whitespace-pre-wrap">
                                                {msg.content}
                                            </p>

                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                                                    {format(new Date(msg.createdAt), 'hh:mm a')}
                                                </span>
                                                {isOwn && (
                                                    <span className={`text-[12px] font-bold ${msg.readBy?.length > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                        {msg.readBy?.length > 0 ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Notice about 48h deletion */}
            <div className="bg-[#f0f2f5] px-4 py-2 flex items-center justify-center border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Messages automatically get deleted in 48 hours
                </p>
            </div>

            {/* Input Area */}
            <footer className="p-3 bg-[#f0f2f5] border-t border-gray-200">
                <form onSubmit={handleSend} className="flex items-center gap-3 max-w-4xl mx-auto">


                    <div className="flex-1 relative flex items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder={isGlobalMode ? "Send to all administrators..." : "Type a message"}
                            className="w-full bg-white border-none py-2.5 px-5 rounded-full focus:outline-none focus:ring-0 text-base shadow-sm placeholder-gray-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-90 ${!message.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#00a884] hover:bg-[#008f72] text-white shadow-[#00a884]/20'
                            }`}
                    >
                        {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                </form>
            </footer>

            {/* 48 Hour Deletion Pulse */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/70 backdrop-blur-md text-[#ffffff] text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest border border-white/20">
                    Ephemeral Channel: 48h Auto-Delete active
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
}
