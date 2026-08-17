import React from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';

export const FilterBar = React.memo(({
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    activeFilterCount,
    clearFilters
}) => {
    return (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs mb-6 sticky top-[73px] z-20 flex flex-col gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by organization name, email, city..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200/90 rounded-lg text-slate-900 placeholder:text-slate-400 font-normal focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 rounded-full"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Status Dropdown */}
                <div className="relative min-w-[160px]">
                    <select
                        className="w-full appearance-none bg-slate-50/70 border border-slate-200/90 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-slate-400 transition cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending review</option>
                        <option value="verified">Verified active</option>
                        <option value="rejected">Rejected / action</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Date Dropdown */}
                <div className="relative min-w-[150px]">
                    <select
                        className="w-full appearance-none bg-slate-50/70 border border-slate-200/90 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-slate-400 transition cursor-pointer"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="all">All dates</option>
                        <option value="today">Today</option>
                        <option value="week">Past 7 days</option>
                        <option value="month">Past 30 days</option>
                        <option value="year">Past year</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Clear All Button */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 rounded-lg border border-rose-200/70 transition cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear ({activeFilterCount})
                    </button>
                )}
            </div>

            {/* Active Filter Pills Bar */}
            {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Filter size={11} />
                        Active filters:
                    </span>
                    {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200 text-xs">
                            Search: "{searchQuery}"
                        </span>
                    )}
                    {statusFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200 text-xs">
                            Status: {statusFilter}
                        </span>
                    )}
                    {dateFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200 text-xs">
                            Date: {dateFilter}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

FilterBar.displayName = 'FilterBar';
