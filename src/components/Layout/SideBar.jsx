"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    PieChart,
    BarChart2,
    Users,
    FileText,
    Settings,
    LogOut,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const navLinks = [
    { icon: PieChart, label: "Dashboard", path: "/" },
    { icon: BarChart2, label: "Campaigns", path: "/campaigns" },
    { icon: Users, label: "Donors", path: "/donors" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar({ 
    isCollapsed, 
    setIsCollapsed, 
    isMobileOpen, 
    setIsMobileOpen,
    activeTab = "Dashboard",
    onTabChange 
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read tab from URL on mount
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl) {
            // Capitalize first letter to match tab names
            const formattedTab = tabFromUrl.charAt(0).toUpperCase() + tabFromUrl.slice(1).toLowerCase();
            onTabChange(formattedTab);
        }
    }, [searchParams, onTabChange]);

    // Handle tab change and update URL
    const handleTabChange = (tabLabel) => {
        onTabChange(tabLabel);
        setIsMobileOpen(false);
        
        // Update URL with tab parameter
        const tabParam = tabLabel.toLowerCase();
        router.push(`?tab=${tabParam}`, { scroll: false });
    };
    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed h-full z-50 transition-all duration-300 bg-white border-r border-gray-200
                    lg:relative lg:left-0 
                    ${isMobileOpen ? 'left-0' : '-left-full'} 
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
                    w-64 flex flex-col shadow-lg lg:shadow-none`}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 rounded-lg h-10 w-10 flex items-center justify-center text-white font-bold shadow-sm">
                            D
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">DonateNow</h2>
                                <p className="text-xs text-gray-500">Admin Panel</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:block text-gray-500 hover:text-gray-700"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = activeTab === link.label;
                            
                            return (
                                <li key={link.label}>
                                    <button
                                        onClick={() => handleTabChange(link.label)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                                            ${isActive 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={20} className="flex-shrink-0" />
                                        {!isCollapsed && (
                                            <span className="font-medium">{link.label}</span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Section */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {!isCollapsed && (
                            <span className="font-medium">Logout</span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}