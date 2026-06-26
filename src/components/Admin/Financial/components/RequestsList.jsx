import React from 'react';
import { Mail, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './Badge';
import { toTitleCase } from '@/utils/formatters';

const PageBtn = ({ onClick, disabled, icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {icon}
    </button>
);

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
    return (
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">Submitted Forms</h2>
                    {totalCount > 0 && (
                        <span className="text-sm text-gray-600">
                            {startIndex}-{endIndex} of {totalCount}
                        </span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <p className="text-xs text-gray-500">
                        {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                    </p>
                )}
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                {isLoading && <p className="text-center text-gray-600 p-8">Loading applications...</p>}

                {!isLoading && displayForms?.map((form) => (
                    <div
                        key={form._id}
                        onClick={() => setSelectedForm(form)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all group ${selectedForm?._id === form._id
                            ? 'bg-blue-50 border-blue-500 shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col min-w-0">
                                <span className={`font-semibold text-lg truncate ${selectedForm?._id === form._id ? 'text-blue-600' : 'text-gray-800'}`}>
                                    {toTitleCase(form.fullName || form.organizationName)}
                                </span>
                                {form.formType === 'other' && form.relationName && (
                                    <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full w-fit mt-1">
                                        For: {toTitleCase(form.relationName)}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-1.5 items-center">
                                {form.isSpecialCase && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase">
                                        Special
                                    </span>
                                )}
                                <Badge status={form.status} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <Mail size={12} /> {form.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} /> {new Date(form.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}

                {!isLoading && displayForms?.length === 0 && (
                    <div className="text-center text-gray-500 p-8 flex flex-col items-center">
                        <FileText className="w-12 h-12 mb-2 opacity-30 text-gray-400" />
                        <p className="font-medium mb-1">No forms found</p>
                        {activeFilterCount > 0 ? (
                            <>
                                <p className="text-xs text-gray-400 mb-3">Try adjusting your filters</p>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </>
                        ) : (
                            <p className="text-xs text-gray-400">No submissions yet</p>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-center gap-2">
                    <PageBtn onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} icon={<ChevronLeft size={16} />} />
                    <span className="text-sm font-medium flex items-center px-2">Page {currentPage} of {totalPages}</span>
                    <PageBtn onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} icon={<ChevronRight size={16} />} />
                </div>
            )}
        </div>
    );
});

RequestsList.displayName = 'RequestsList';
