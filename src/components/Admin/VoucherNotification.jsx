"use client";

import React, { useState } from 'react';
import { useGetVouchersQuery } from '@/utils/slices/vouchersApiSlice';
import { Bell, Ticket, ChevronRight, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function VoucherNotification() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: vouchersData } = useGetVouchersQuery();
    const router = useRouter();

    const pendingVouchers = vouchersData?.data || [];

    const handleVoucherClick = (vId) => {
        setIsOpen(false);
        // We'll navigate to the volunteer management page
        router.push('/tpf-management/volunteers');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative text-gray-700 hover:text-gray-900 p-2 rounded-lg transition-colors ${isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                title="Pending Vouchers"
            >
                <Bell size={20} />
                {pendingVouchers.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white animate-pulse">
                        {pendingVouchers.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md">
                                <h3 className="font-bold text-gray-900">Voucher Requests</h3>
                                <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                    {pendingVouchers.length} Pending
                                </span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {pendingVouchers.length === 0 ? (
                                    <div className="p-8 text-center flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Ticket className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 text-sm font-medium">No pending vouchers</p>
                                    </div>
                                ) : (
                                    pendingVouchers.map((voucher) => (
                                        <button
                                            key={voucher._id}
                                            onClick={() => handleVoucherClick(voucher._id)}
                                            className="w-full p-4 border-b border-gray-50 hover:bg-orange-50/50 transition-colors text-left flex gap-3 group"
                                        >
                                            <div className="shrink-0">
                                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shadow-sm">
                                                    {voucher.volunteerId?.fullName?.charAt(0) || 'V'}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="font-bold text-gray-900 text-sm truncate pr-2">
                                                        {voucher.volunteerId?.fullName}
                                                    </p>
                                                    <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap flex items-center gap-1">
                                                        <Clock size={8} />
                                                        {new Date(voucher.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-orange-600 font-black mb-1">₹{voucher.amount.toLocaleString()}</p>
                                                <p className="text-[11px] text-gray-500 line-clamp-1">
                                                    {voucher.description}
                                                </p>
                                            </div>
                                            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight size={14} className="text-orange-400" />
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push('/tpf-management/volunteers');
                                    }}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-widest flex items-center justify-center gap-1 mx-auto"
                                >
                                    Manage Volunteers
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
