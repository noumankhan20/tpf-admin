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
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                            ? 'bg-emerald-50 border-emerald-50 shadow-sm'
                            : 'hover:bg-gray-50 border-transparent'
                            } border`}
                    >
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-transform group-hover:scale-105 shadow-sm ${admin.isSuperAdmin
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                            }`}>
                            {admin.fullName.charAt(0)}
                        </div>

                        {/* Content */}
                        <div className="text-left min-w-0 flex-1">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <p className={`font-bold text-[14.5px] truncate ${isActive ? 'text-emerald-700' : 'text-gray-900'}`}>
                                    {admin.fullName}
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[12px] text-gray-500 truncate font-medium">
                                    {admin.isSuperAdmin ? 'Super Admin' : 'Administrator'}
                                </p>
                                {unreadCount > 0 && (
                                    <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    );
}
