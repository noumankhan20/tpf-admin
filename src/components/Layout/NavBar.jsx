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


                {/* Right Section */}
        <div className="flex items-center space-x-4 ml-auto">
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