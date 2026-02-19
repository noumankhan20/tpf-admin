import React from 'react';
import { Badge } from './Badge';
import { ChevronLeft, ChevronRight, Inbox, Megaphone } from 'lucide-react';

export const CampaignRequestsList = React.memo(({
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
            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm no-print">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Campaign Requests ({totalCount})
                </span>
                <div className="flex gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-bold self-center px-2">{currentPage}/{totalPages || 1}</span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {displayForms.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <Inbox className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No campaign requests found</p>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="text-blue-500 text-xs mt-2 hover:underline">Clear all filters</button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {displayForms.map((form) => (
                            <div
                                key={form._id}
                                onClick={() => setSelectedForm(form)}
                                className={`p-4 cursor-pointer transition-all hover:bg-blue-50/50 border-l-4 ${selectedForm?._id === form._id ? 'bg-blue-50 border-blue-500 shadow-inner' : 'border-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-800 truncate flex-1 pr-2">
                                        {form.title}
                                    </h4>
                                    <Badge status={form.status} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Megaphone size={12} />
                                        <span className="text-xs font-medium">{form.organizationName}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(form.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

CampaignRequestsList.displayName = 'CampaignRequestsList';
