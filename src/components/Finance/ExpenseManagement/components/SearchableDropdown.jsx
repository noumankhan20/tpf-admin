'use client';

import React from 'react';
import { Search, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SearchableDropdown
 *
 * A fully self-contained paginated dropdown with search.
 *
 * Props:
 *  - dropdownRef      React ref attached to the wrapper div
 *  - open             boolean – whether the panel is visible
 *  - onToggle         () => void – toggles open
 *  - icon             ReactNode – icon shown on the left of the trigger
 *  - placeholder      string
 *  - selectedLabel    string | null – label for the selected value
 *  - required         boolean
 *  - hiddenValue      string – value fed to the invisible validation input
 *  - search           string
 *  - onSearchChange   (val: string) => void
 *  - searchPlaceholder string
 *  - page             number
 *  - totalPages       number
 *  - onPageChange     (page: number) => void
 *  - items            array of { id, label }
 *  - selectedId       string
 *  - onSelect         (id: string) => void
 *  - noneLabel        string  (default "None")
 *  - emptyMessage     string
 */
export default function SearchableDropdown({
    dropdownRef,
    open,
    onToggle,
    icon,
    placeholder = 'Select…',
    selectedLabel,
    required = false,
    hiddenValue = '',
    search,
    onSearchChange,
    searchPlaceholder = 'Search…',
    page,
    totalPages,
    onPageChange,
    items = [],
    selectedId,
    onSelect,
    noneLabel = 'None',
    emptyMessage = 'No results found.',
}) {
    return (
        <div ref={dropdownRef} className="relative">
            {/* Hidden input for HTML5 required validation */}
            {required && (
                <input
                    type="text"
                    required
                    value={hiddenValue}
                    onChange={() => {}}
                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                />
            )}

            {/* Trigger */}
            <div
                onClick={onToggle}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 outline-none transition-all flex items-center justify-between cursor-pointer select-none relative"
            >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                <span className={`text-sm font-medium truncate ${selectedLabel ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${open ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-[60] p-4 flex flex-col space-y-3"
                    >
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onSearchChange(''); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Options */}
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                            {/* None option */}
                            <DropdownItem
                                label={`${placeholder} (${noneLabel})`}
                                isSelected={!selectedId}
                                onClick={(e) => { e.stopPropagation(); onSelect(''); }}
                            />

                            {items.length === 0 ? (
                                <p className="text-center py-4 text-xs text-gray-400 font-medium">{emptyMessage}</p>
                            ) : (
                                items.map((item) => (
                                    <DropdownItem
                                        key={item.id}
                                        label={item.label}
                                        isSelected={selectedId === item.id}
                                        onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
                                    />
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t pt-3 border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                                <PaginationButton
                                    disabled={page === 1}
                                    onClick={(e) => { e.stopPropagation(); onPageChange(Math.max(1, page - 1)); }}
                                    direction="prev"
                                />
                                <span>Page {page} of {totalPages}</span>
                                <PaginationButton
                                    disabled={page === totalPages}
                                    onClick={(e) => { e.stopPropagation(); onPageChange(Math.min(totalPages, page + 1)); }}
                                    direction="next"
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DropdownItem({ label, isSelected, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer font-medium ${
                isSelected
                    ? 'bg-emerald-50/70 text-emerald-700 font-semibold border-l-2 border-emerald-600'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
        >
            {label}
        </div>
    );
}

function PaginationButton({ disabled, onClick, direction }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all flex items-center gap-0.5 text-gray-600 border border-gray-100 cursor-pointer"
        >
            {direction === 'prev' ? (
                <><ChevronLeft size={12} /> Prev</>
            ) : (
                <>Next <ChevronRight size={12} /></>
            )}
        </button>
    );
}