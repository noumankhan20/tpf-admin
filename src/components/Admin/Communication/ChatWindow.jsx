"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    useGetInternalMessagesQuery,
    useSendInternalMessageMutation,
    useMarkMessagesAsReadMutation,
    useCompleteInternalTaskMutation
} from '@/utils/slices/internalCommunicationApiSlice';
import { Send, Loader2, User, Globe, MessageCircle, ChevronUp, MoreVertical, Paperclip, Smile, CheckSquare, Square, FileText } from 'lucide-react';
import { useSocket } from '@/utils/context/SocketContext';
import { format, isToday, isYesterday } from 'date-fns';

const TASK_CATEGORIES = ['General', 'Disburse Fund Task', 'Verification', 'Other'];

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

    const isSuperAdminUser = adminInfo?.isSuperAdmin || adminInfo?.role?.toLowerCase().includes('super') || adminInfo?.modules?.length >= 30;

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
    const [completeTask] = useCompleteInternalTaskMutation();
    const [isAssigningTask, setIsAssigningTask] = useState(false);
    const [taskCategory, setTaskCategory] = useState('General');
    const [taskFile, setTaskFile] = useState(null);

    const handleCompleteTask = async (messageId) => {
        try {
            await completeTask({ messageId }).unwrap();
        } catch (err) {
            console.error("Failed to complete task:", err);
        }
    };

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
                isGlobal: isGlobalMode,
                isTask: isAssigningTask,
                taskStatus: isAssigningTask ? "PENDING" : undefined,
                taskCategory: isAssigningTask ? taskCategory : null,
                taskProofDocument: null // Optimistically, we won't have the key yet
            };

            setAllMessages(prev => [...prev, tempMessage]);
            const currentMsg = message;
            const wasAssigningTask = isAssigningTask;
            const currentCategory = taskCategory;
            const currentFile = taskFile;
            
            setMessage('');
            setIsAssigningTask(false);
            setTaskFile(null);
            scrollToBottom();

            let payload;
            if (wasAssigningTask) {
                payload = new FormData();
                payload.append('receiverId', selectedAdminId);
                payload.append('content', currentMsg);
                payload.append('isGlobal', isGlobalMode);
                payload.append('isTask', wasAssigningTask);
                payload.append('taskCategory', currentCategory);
                if (currentFile) {
                    payload.append('taskProofDocument', currentFile);
                }
            } else {
                payload = {
                    receiverId: selectedAdminId,
                    content: currentMsg,
                    isGlobal: isGlobalMode,
                    isTask: wasAssigningTask
                };
            }

            await sendMessage(payload).unwrap();

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
        <div className="flex flex-col h-full bg-[#f8f9fa] relative">
            {/* Header */}
            <header className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-20 min-h-[76px]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-emerald-50 text-emerald-600 shadow-sm overflow-hidden border border-gray-100">
                        {isGlobalMode ? <Globe className="w-6 h-6" /> : selectedAdmin?.fullName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-[19px] tracking-tight">
                            {isGlobalMode ? 'Global Announcements' : selectedAdmin?.fullName}
                        </h3>
                        {typingUser ? (
                            <p className="text-[13px] text-emerald-700 font-bold italic">
                                {isGlobalMode ? `${typingUser} is typing...` : 'typing...'}
                            </p>
                        ) : (
                            <p className="text-[13px] text-gray-600 font-medium">
                                {isGlobalMode ? 'Company-wide channel' : 'Administrator'}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 relative custom-scrollbar bg-gray-50"
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
                                    <div className={`flex w-full mb-3 ${isOwn ? 'justify-end pl-12' : 'justify-start pr-12 gap-3'}`}>
                                        {/* Avatar for incoming messages */}
                                        {!isOwn && (
                                            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mt-auto shadow-sm border border-gray-200">
                                                {msg.sender?.fullName?.charAt(0) || <Globe className="w-4 h-4" />}
                                            </div>
                                        )}

                                        <div className={`relative px-5 py-3.5 shadow-sm min-w-[120px] max-w-[85%] group ${isOwn
                                            ? 'bg-emerald-50 text-gray-900 rounded-[20px] rounded-br-sm'
                                            : 'bg-white text-gray-800 rounded-[20px] rounded-bl-sm border border-gray-100'
                                            }`}>

                                            {isGlobalMode && !isOwn && (
                                                <p className="text-[12px] font-bold text-emerald-700 mb-1 leading-none">
                                                    {msg.sender?.fullName}
                                                </p>
                                            )}

                                             {msg.isTask ? (
                                                <div className={`p-4 rounded-xl border my-1 shadow-sm min-w-[250px] ${isOwn ? 'bg-white text-gray-800 border-emerald-100' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-gray-200">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit">Task</span>
                                                            {msg.taskCategory && (
                                                                <span className="text-[11px] font-semibold text-gray-600">{msg.taskCategory}</span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase ${
                                                            msg.taskStatus === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                                                        }`}>
                                                            {msg.taskStatus || "PENDING"}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-[14px] font-medium break-words whitespace-pre-wrap mb-3 text-gray-800">
                                                        {msg.content}
                                                    </p>
                                                    
                                                    {msg.taskProofDocument && (
                                                        <a 
                                                            href={`${process.env.NEXT_PUBLIC_BACKEND_API}/media/${msg.taskProofDocument}`}
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium mb-3 p-2 bg-emerald-50/50 rounded-lg transition-colors border border-emerald-100"
                                                        >
                                                            <FileText size={16} />
                                                            View Proof Document
                                                        </a>
                                                    )}

                                                    {msg.taskStatus !== "COMPLETED" && !isOwn && (
                                                        <button
                                                            onClick={() => handleCompleteTask(msg._id)}
                                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                                                        >
                                                            <CheckSquare size={16} />
                                                            Mark Completed
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                                                    {msg.content}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-end gap-1.5 mt-2 opacity-60">
                                                <span className="text-[10px] font-medium tracking-wide">
                                                    {format(new Date(msg.createdAt), 'hh:mm a')}
                                                </span>
                                                {isOwn && (
                                                    <span className="text-[12px] font-bold text-emerald-700">
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
            <footer className="bg-transparent pb-6 px-4 md:px-8 pt-2">
                {isAssigningTask && (
                    <div className="max-w-4xl mx-auto px-6 py-4 mb-2 bg-white rounded-2xl shadow-sm border border-emerald-100 flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-700">Category:</span>
                            <select
                                value={taskCategory}
                                onChange={(e) => setTaskCategory(e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                                {TASK_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-sm border-l pl-4 border-gray-200">
                            <span className="font-semibold text-gray-700">Proof:</span>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-emerald-600">
                                    <Paperclip size={14} />
                                    {taskFile ? 'Change File' : 'Upload Document (Optional)'}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setTaskFile(e.target.files[0])}
                                    />
                                </label>
                                {taskFile && (
                                    <span className="text-gray-600 truncate max-w-[150px]" title={taskFile.name}>
                                        {taskFile.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 bg-white rounded-full p-2 shadow-sm border border-gray-200">
                    <div className="flex-1 relative flex items-center bg-transparent transition-all ml-4">
                        <textarea
                            value={message}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder={isGlobalMode ? "Send to all administrators..." : (isAssigningTask ? "Describe the task..." : "Type a message...")}
                            className="w-full bg-transparent border-none py-2.5 px-2 focus:outline-none focus:ring-0 text-[15px] placeholder-gray-400 resize-none max-h-[120px] min-h-[44px]"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2 pr-1 pb-1 shrink-0">
                        {isSuperAdminUser && !isGlobalMode && (
                            <button
                                type="button"
                                onClick={() => setIsAssigningTask(prev => !prev)}
                                title="Create Task"
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                    isAssigningTask
                                        ? 'bg-emerald-100 text-emerald-600 shadow-sm'
                                        : 'text-gray-400 hover:text-emerald-500 hover:bg-gray-50'
                                }`}
                            >
                                {isAssigningTask ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!message.trim() || isSending}
                            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-sm shrink-0 cursor-pointer ${!message.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200/50 hover:shadow-md hover:-translate-y-0.5'
                                }`}
                        >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </button>
                    </div>
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
