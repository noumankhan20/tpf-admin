"use client";

import React, { useState, useEffect } from 'react';
import {
    useSendInternalMessageMutation,
    useMarkMessagesAsReadMutation
} from '@/utils/slices/internalCommunicationApiSlice';
import { X, Send, Loader2, MessageSquare, User, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Reply } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ReplyModal({ isOpen, onClose, message, adminInfo }) {
    const [reply, setReply] = useState('');
    const [sendInternalMessage, { isLoading: isSending }] = useSendInternalMessageMutation();
    const [markAsRead] = useMarkMessagesAsReadMutation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && message) {
            markAsRead({ messageIds: [message._id] });
        }
    }, [isOpen, message, markAsRead]);

    if (!isOpen || !message || !mounted) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!reply.trim() || isSending) return;

        try {
            await sendInternalMessage({
                receiverId: message.sender._id,
                content: reply,
                parentMessageId: message._id,
                isGlobal: false
            }).unwrap();
            setReply('');
            onClose();
        } catch (err) {
            console.error("Failed to send reply:", err);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    onClick={onClose}
                ></motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-blue-600">
                                {message.isGlobal ? <Globe size={24} /> : <MessageSquare size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {message.isGlobal ? 'Global Update' : `Message from ${message.sender.fullName}`}
                                </h3>
                                <p className="text-xs text-blue-600/60 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                    {format(new Date(message.createdAt), 'MMMM dd, hh:mm a')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="relative mb-8">
                            <div className="absolute top-0 bottom-0 left-[18px] w-0.5 bg-gray-100"></div>
                            <div className="flex gap-4">
                                <div className="w-9 h-9 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center z-10 shrink-0 shadow-sm">
                                    <User size={16} className="text-gray-400" />
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl rounded-tl-none border border-gray-100">
                                    <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-[52px] mt-2">
                                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter flex items-center gap-1">
                                    <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                    This message will expire in 48 hours
                                </p>
                            </div>
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSend} className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Reply size={16} className="text-blue-600" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type your reply</span>
                            </div>
                            <div className="relative">
                                <textarea
                                    rows="4"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Write something thoughtful..."
                                    className="w-full bg-white border border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all resize-none shadow-sm"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={!reply.trim() || isSending}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-200 font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
                                >
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
                                    Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
