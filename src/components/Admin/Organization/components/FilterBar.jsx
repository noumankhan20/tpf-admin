import React from 'react';
import { Search, X } from 'lucide-react';

export const FilterBar = React.memo(({
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    activeFilterCount,
    clearFilters
}) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 sticky top-[73px] z-20 flex flex-wrap items-center gap-4 no-print">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Verification Status</span>
                <select
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Registered</span>
                <select
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="year">Past Year</option>
                </select>
            </div>

            {/* Clear All */}
            {activeFilterCount > 0 && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <X className="w-4 h-4" />
                    Clear Filters
                </button>
            )}
        </div>
    );
});

FilterBar.displayName = 'FilterBar';
