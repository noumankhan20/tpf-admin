"use client";

import React, { useState, useEffect } from 'react';
import {
    useGetConversationsQuery,
    useGetInternalMessagesQuery
} from '@/utils/slices/internalCommunicationApiSlice';
import { MessageSquare, Shield, Globe, User, Search, Calendar, ChevronUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

function ConversationBlock({ conversation, searchTerm }) {
    const [page, setPage] = useState(1);
    const [allMessages, setAllMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);

    // For participants string to filter
    const participantsStr = conversation.type === 'global'
        ? 'Global'
        : `${conversation.participants[0].fullName} & ${conversation.participants[1].fullName}`;

    const isGlobal = conversation.type === 'global';

    // Explicit params for audit
    const queryParams = isGlobal
        ? { isGlobal: 'true', page, limit: 10 }
        : {
            senderId: conversation.participants[0]._id,
            receiverId: conversation.participants[1]._id,
            page,
            limit: 10
        };

    const { data: activeData, isFetching: activeFetching } = useGetInternalMessagesQuery(queryParams);

    useEffect(() => {
        if (activeData?.success) {
            const newMessages = activeData.data;
            setHasMore(activeData.pagination.hasMore);

            if (page === 1) {
                setAllMessages(newMessages);
            } else {
                setAllMessages(prev => {
                    const existingIds = new Set(prev.map(m => m._id));
                    const uniqueNew = newMessages.filter(m => !existingIds.has(m._id));
                    return [...uniqueNew, ...prev];
                });
            }
        }
    }, [activeData, page]);

    if (!participantsStr.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return null;
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className={`p-4 flex items-center justify-between border-b border-gray-50 ${isGlobal ? 'bg-indigo-50/50' : 'bg-gray-50/30'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${isGlobal ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                        {isGlobal ? <Globe size={20} /> : <MessageSquare size={20} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">
                            {isGlobal ? 'Global Broadcast Room' : participantsStr}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={10} />
                            Last Active: {format(new Date(conversation.lastMessage.createdAt), 'MMM dd, yyyy hh:mm a')}
                        </p>
                    </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white rounded-full border border-gray-100 text-gray-500 shadow-sm">
                    {activeData?.pagination?.total || '...'} Messages
                </span>
            </div>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-gray-50/20 flex flex-col-reverse">
                <div className="space-y-3 flex flex-col">
                    {hasMore && (
                        <div className="flex justify-center pb-2">
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={activeFetching}
                                className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-all flex items-center gap-1 border border-blue-100"
                            >
                                {activeFetching ? <Loader2 size={10} className="animate-spin" /> : <ChevronUp size={10} />}
                                Load previous messages
                            </button>
                        </div>
                    )}

                    {allMessages.map((m) => {
                        const senderName = m.sender?.fullName || 'Deleted Admin';
                        return (
                            <div key={m._id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 font-bold text-xs text-gray-400 shadow-sm">
                                    {senderName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-bold text-gray-700">{senderName}</span>
                                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{format(new Date(m.createdAt), 'hh:mm a')}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 shadow-sm inline-block max-w-full whitespace-pre-wrap">
                                        {m.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function SuperAdminAuditor() {
    const { data: conversationsData, isLoading } = useGetConversationsQuery();
    const [searchTerm, setSearchTerm] = useState('');

    const conversations = conversationsData?.data || [];

    if (isLoading) return (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-gray-500 font-medium italic">Scanning encrypted communications...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-indigo-600" />
                            Security Audit Hub
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Real-time monitoring of all administrative communication channels.</p>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            Auto-purge active: items deleted after 48 hours
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by admin or keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full md:w-80 text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {conversations.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400">No communication history detected.</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <ConversationBlock
                            key={conv.id}
                            conversation={conv}
                            searchTerm={searchTerm}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
