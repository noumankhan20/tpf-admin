"use client";

import React from 'react';

export default function AdminList({ admins, selectedAdmin, onSelectAdmin, unreadCounts = {} }) {
    return (
        <div className="space-y-0.5">
            {admins.map((admin) => {
                const unreadCount = unreadCounts[admin._id?.toString()];
                const isActive = selectedAdmin?._id === admin._id;

                return (
                    <button
                        key={admin._id}
                        onClick={() => onSelectAdmin(admin)}
                        className={`w-full flex items-center gap-4 px-4 py-3 bg-white transition-all duration-200 group relative ${
                            isActive
                                ? 'bg-gray-50'
                                : 'hover:bg-gray-50/50'
                        }`}
                    >
                        {/* Active Indicator Bar */}
                        {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md"></div>
                        )}

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center font-bold text-lg bg-emerald-50 text-emerald-600">
                                {admin.fullName.charAt(0)}
                            </div>
                            {unreadCount > 0 && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                    {unreadCount}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="text-left min-w-0 flex-1 border-b border-gray-100 pb-3 group-last:border-b-0">
                            <div className="flex justify-between items-baseline mb-1 mt-1">
                                <p className={`font-semibold text-[15px] truncate ${isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                    {admin.fullName}
                                </p>
                                <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                                    {/* Placeholder time for design, you could pass actual last message time here */}
                                    09:00 AM
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-[13px] truncate font-medium ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {admin.isSuperAdmin ? 'Super Admin' : 'Administrator'}
                                </p>
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    );
}
