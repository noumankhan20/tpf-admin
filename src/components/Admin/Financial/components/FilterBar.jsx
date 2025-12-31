import React from 'react';
import { Search, SortAsc, SortDesc, X as XIcon } from 'lucide-react';

export const FilterBar = React.memo(({
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    sortOrder, setSortOrder,
    activeFilterCount, clearFilters
}) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>

                {/* Date Filter */}
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>

                {/* Sort Order */}
                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                        <XIcon className="w-4 h-4" />
                        Clear ({activeFilterCount})
                    </button>
                )}
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                    {statusFilter !== 'all' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                            Status: {statusFilter}
                            <button onClick={() => setStatusFilter('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                                <XIcon className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {dateFilter !== 'all' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                            Date: {dateFilter}
                            <button onClick={() => setDateFilter('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                                <XIcon className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {searchQuery !== '' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                            Search: "{searchQuery}"
                            <button onClick={() => setSearchQuery('')} className="hover:bg-blue-200 rounded-full p-0.5">
                                <XIcon className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

FilterBar.displayName = 'FilterBar';
