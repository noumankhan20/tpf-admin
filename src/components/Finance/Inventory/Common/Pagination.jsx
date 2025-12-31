'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const renderPageButtons = () => {
        const buttons = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`min-w-[40px] h-10 px-3 rounded-xl font-bold text-sm transition-all ${currentPage === i
                            ? 'bg-gray-900 shadow-lg shadow-gray-200 text-white'
                            : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    return (
        <div className="flex items-center justify-center space-x-2 py-8">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
                className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                title="First Page"
            >
                <ChevronsLeft size={20} />
            </button>
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                title="Previous Page"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center space-x-2">
                {renderPageButtons()}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                title="Next Page"
            >
                <ChevronRight size={20} />
            </button>
            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
                className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                title="Last Page"
            >
                <ChevronsRight size={20} />
            </button>
        </div>
    );
}
