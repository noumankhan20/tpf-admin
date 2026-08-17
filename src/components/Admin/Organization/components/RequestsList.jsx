import React from 'react';
import { Badge } from './Badge';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
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
                        Organizations queue
                    </span>
                    <span className="px-2 py-0.5 text-xs text-slate-500 bg-slate-200/50 rounded-full font-medium">
                        {totalCount}
                    </span>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
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
                        onClick={() => setCurrentPage(p => p + 1)}
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
                        <p className="text-sm font-medium text-slate-700">No organizations found</p>
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
                        const initial = form.organizationName ? form.organizationName.charAt(0).toUpperCase() : 'O';

                        return (
                            <div
                                key={form._id}
                                onClick={() => setSelectedForm(form)}
                                className={`p-3.5 cursor-pointer transition-all border-l-2 ${
                                    isSelected
                                        ? 'bg-slate-50 border-l-slate-800'
                                        : 'border-l-transparent hover:bg-slate-50/60'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0 border border-slate-200/80">
                                            {initial}
                                        </div>
                                        <h4 className="font-semibold text-slate-900 text-sm truncate leading-snug">
                                            {toTitleCase(form.organizationName)}
                                        </h4>
                                    </div>
                                    <div className="shrink-0">
                                        <Badge status={form.verificationStatus} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 font-normal pl-9">
                                    <div className="flex items-center gap-1.5">
                                        <span>{form.isNGO ? 'NGO' : 'Corporate'}</span>
                                        {form.city && (
                                            <>
                                                <span>·</span>
                                                <span className="truncate max-w-[130px]">
                                                    {toTitleCase(form.city)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 font-normal">
                                        {new Date(form.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
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
