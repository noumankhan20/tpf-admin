"use client";

import { useState } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between p-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                >
                    <Menu size={20} />
                </button>

                {/* Search Bar */}
                <div className={`${isSearchExpanded ? 'absolute inset-x-0 px-4 bg-white border-b border-gray-200' : 'relative'} 
                    transition-all duration-200 mx-auto sm:mx-0 sm:w-96`}>
                    
                    {!isSearchExpanded && (
                        <button
                            onClick={() => setIsSearchExpanded(true)}
                            className="sm:hidden text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Search size={20} />
                        </button>
                    )}

                    <div className={`relative ${isSearchExpanded ? 'flex items-center py-3' : 'hidden sm:block'}`}>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                            />
                        </div>

                        {isSearchExpanded && (
                            <button
                                onClick={() => setIsSearchExpanded(false)}
                                className="ml-3 text-gray-600 hover:text-gray-900 font-medium"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    <button className="relative text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 hidden sm:block">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                            NK
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-900">Nikhil Kumar</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}