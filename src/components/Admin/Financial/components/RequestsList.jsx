import React from 'react';
import { Mail, Calendar, Inbox, ChevronLeft, ChevronRight, User, Users } from 'lucide-react';
import { Badge } from './Badge';
import { toTitleCase } from '@/utils/formatters';

export const RequestsList = React.memo(({
    isLoading,
    displayForms,
    selectedForm,
    setSelectedForm,
    totalCount,
    startIndex,
    endIndex,
    activeFilterCount,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages
}) => {
    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100/70 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col min-h-0 bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs no-print">
            
            {/* Queue Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                        Applications Queue
                    </span>
                    <span className="px-2 py-0.5 text-xs text-slate-500 bg-slate-200/50 rounded-full font-medium">
                        {totalCount}
                    </span>
                    {activeFilterCount > 0 && (
                        <span className="text-xs text-slate-400 font-normal">
                            ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active)
                        </span>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded disabled:opacity-30 transition cursor-pointer"
                        title="Previous page"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-medium text-slate-500 px-1">
                        {currentPage} / {totalPages || 1}
                    </span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded disabled:opacity-30 transition cursor-pointer"
                        title="Next page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Queue List Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {displayForms.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                        <Inbox className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
                        <p className="text-sm font-medium text-slate-700">No applications found</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs font-normal">There are no records matching your current filter criteria.</p>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="text-blue-600 text-xs font-medium mt-3 hover:underline cursor-pointer">
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    displayForms.map((form) => {
                        const isSelected = selectedForm?._id === form._id;
                        const initial = form.fullName ? form.fullName.charAt(0).toUpperCase() : 'A';
                        const isOther = form.formType === 'other';

                        return (
                            <div
                                key={form._id}
                                onClick={() => setSelectedForm(form)}
                                className={`p-4 cursor-pointer transition-all border-l-2 hover:bg-slate-50/80 ${
                                    isSelected
                                        ? 'bg-slate-50 border-l-slate-800'
                                        : 'border-l-transparent'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
                                            isOther ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {initial}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-slate-900 text-base leading-snug">
                                                    {toTitleCase(form.fullName || form.organizationName)}
                                                </h4>
                                                {isOther ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                                                        <Users size={12} />
                                                        For: {toTitleCase(form.relationName || 'Beneficiary')} ({form.relation || 'Relative'})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                                                        <User size={12} />
                                                        Self Application
                                                    </span>
                                                )}
                                                {form.isSpecialCase && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase">
                                                        Special Case
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                                                {form.email && (
                                                    <span className="flex items-center gap-1 text-slate-600">
                                                        <Mail size={12} /> {form.email}
                                                    </span>
                                                )}
                                                {form.contactNumber && (
                                                    <span className="text-slate-500">
                                                        Phone: {form.contactNumber}
                                                    </span>
                                                )}
                                                {form.aidType && (
                                                    <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                                                        Aid: {form.aidType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <Badge status={form.status} />
                                        <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(form.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

RequestsList.displayName = 'RequestsList';
