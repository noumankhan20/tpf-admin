import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    MessageSquare,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    Send,
    Tag,
    User,
    Mail,
    AlertCircle,
    X,
    ArrowLeft,
    Target,
    Zap,
    HelpCircle,
    Edit3,
    Trash2,
    ChevronDown
} from 'lucide-react';
import { useGetAdminFAQsQuery, useAnswerFAQMutation } from '../../../utils/slices/faqApiSlice';
import { toast } from 'react-hot-toast';

const FAQManagement = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFAQ, setSelectedFAQ] = useState(null);
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const router = useRouter();

    const { data, isLoading } = useGetAdminFAQsQuery({
        status: statusFilter,
        category: categoryFilter,
        page: currentPage,
        limit: 10
    });

    const [answerFAQ, { isLoading: isAnswering }] = useAnswerFAQMutation();

    const handleAnswerSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!answer.trim() || !category) {
            toast.error('Please provide an answer and select a category');
            return;
        }
        try {
            await answerFAQ({
                faqId: selectedFAQ._id,
                answer,
                category
            }).unwrap();
            toast.success('FAQ answered and published successfully');
            setSelectedFAQ(null);
            setAnswer('');
            setCategory('');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to answer FAQ');
        }
    };

    const categories = [
        { id: 'general', label: 'General' },
        { id: 'donors', label: 'For Donors' },
        { id: 'beneficiaries', label: 'For Beneficiaries' },
        { id: 'volunteers', label: 'For Volunteers' },
        { id: 'issues', label: 'Issues & Support' },
        { id: 'legal', label: 'Legal' },
        { id: 'other', label: 'Other' }
    ];

    const stats = [
        { label: 'Total Questions', value: data?.pagination?.totalItems || 0, icon: <HelpCircle className="w-7 h-7 text-slate-600" />, iconBg: 'bg-slate-100' },
        { label: 'Pending Answers', value: data?.faqs?.filter(f => f.status === 'pending').length || 0, icon: <Clock className="w-7 h-7 text-emerald-600" />, iconBg: 'bg-emerald-100' },
        { label: 'Answered', value: data?.faqs?.filter(f => f.status === 'answered').length || 0, icon: <CheckCircle2 className="w-7 h-7 text-teal-600" />, iconBg: 'bg-teal-100' },
    ];

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-slate-200 border-t-emerald-600 mb-4"></div>
                <p className="text-slate-600 font-medium">Loading FAQ Database...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Navigation & Header */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="pt-6">
                    <button
                        onClick={() => router.push('/select-portal?category=communication')}
                        className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                </div>

                <div className="py-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-2 tracking-tight">
                        FAQ Management
                    </h1>
                    <p className="text-base text-slate-500">Curate and respond to platform knowledge base inquiries</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                    <p className="text-4xl font-semibold text-slate-900">{stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filters Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by keywords or question content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white text-sm placeholder:text-slate-400 font-medium"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="answered">Answered</option>
                                </select>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Entries Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                    {data?.faqs?.length > 0 ? (
                        data.faqs.map((faq, idx) => (
                            <motion.div
                                key={faq._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${faq.status === 'answered'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                {faq.status === 'answered' ? 'Published' : 'Awaiting Response'}
                                            </span>
                                            {faq.category && (
                                                <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 uppercase">
                                                    {faq.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                                            <Clock className="w-3 h-3" />
                                            {new Date(faq.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 italic">
                                        "{faq.question}"
                                    </h3>

                                    {faq.status === 'answered' && (
                                        <div className="mb-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 relative group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                                            <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                                                <span className="font-extrabold text-emerald-700 block mb-1 uppercase text-[10px] tracking-widest">Public Answer:</span>
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-200">
                                            {faq.submittedBy?.fullName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-tight">{faq.submittedBy?.fullName || 'Anonymous'}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">{faq.submittedBy?.email || 'via Public Portal'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedFAQ(faq);
                                            setAnswer(faq.answer || '');
                                            setCategory(faq.category || '');
                                        }}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${faq.status === 'answered'
                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:scale-105 shadow-lg shadow-emerald-200'
                                            }`}
                                    >
                                        {faq.status === 'answered' ? <Edit3 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                        {faq.status === 'answered' ? 'Edit' : 'Respond'}
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="xl:col-span-2 py-20 bg-white rounded-3xl border border-slate-200 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No matching questions</h3>
                            <p className="text-slate-500 text-sm mt-1">Try resetting your filters or adjusting your search term</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {data?.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pb-12">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                            {currentPage} / {data.pagination.totalPages}
                        </span>
                        <button
                            disabled={currentPage === data.pagination.totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.totalPages))}
                            className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Response Modal */}
            <AnimatePresence>
                {selectedFAQ && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm shadow-2xl overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 animate-in zoom-in-95"
                        >
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 px-8 py-6 flex items-center justify-between border-b border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                                        <MessageSquare className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Responding to Inquiry</h2>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Community Knowledge Base</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedFAQ(null)} className="p-2 hover:bg-slate-200/50 rounded-xl transition-all">
                                    <X className="w-6 h-6 text-slate-400 hover:text-red-500 transition-colors" />
                                </button>
                            </div>

                            <form onSubmit={handleAnswerSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">User Question</label>
                                    <p className="text-lg text-slate-800 font-bold italic line-clamp-4 leading-relaxed tracking-tight">"{selectedFAQ.question}"</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Classify Response <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${category === cat.id
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Your Official Response <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        required
                                        rows="6"
                                        placeholder="Type a clear, professional answer for the public FAQ portal..."
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-medium focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
                                    />
                                </div>
                            </form>

                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setSelectedFAQ(null)}
                                    className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-white transition-all border border-slate-200 uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAnswerSubmit}
                                    disabled={isAnswering || !answer || !category}
                                    className="px-8 py-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-700 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-emerald-100 flex items-center gap-2"
                                >
                                    {isAnswering ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Zap className="w-4 h-4" />}
                                    {isAnswering ? 'Publishing...' : 'Publish Answer'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FAQManagement;
