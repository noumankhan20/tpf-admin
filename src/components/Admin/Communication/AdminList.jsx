"use client";

import React from 'react';

export default function AdminList({ admins, selectedAdmin, onSelectAdmin, unreadCounts = {} }) {
    return (
        <div className="space-y-1">
            {admins.map((admin) => {
                const unreadCount = unreadCounts[admin._id?.toString()];
                return (
                    <button
                        key={admin._id}
                        onClick={() => onSelectAdmin(admin)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${selectedAdmin?._id === admin._id
                            ? 'bg-blue-50 border border-blue-100'
                            : 'hover:bg-gray-100 border border-transparent'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 shadow-sm ${admin.isSuperAdmin ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-blue-500 to-teal-500 text-white'
                            }`}>
                            {admin.fullName.charAt(0)}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                            <p className={`font-bold text-sm truncate ${selectedAdmin?._id === admin._id ? 'text-blue-700' : 'text-gray-900'}`}>
                                {admin.fullName}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                                {admin.isSuperAdmin ? 'Super Admin' : 'Administrator'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shrink-0">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    );
}
