"use client";

import React from 'react';
import SuperAdminAuditor from '@/components/Admin/Communication/SuperAdminAuditor';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommunicationAuditPage() {
    const router = useRouter();

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.push("/tpf-management")}
                    className="flex items-center gap-2 mb-6 px-4 py-2 hover:bg-white rounded-xl transition-colors text-gray-500 hover:text-gray-900 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Management
                </button>

                <SuperAdminAuditor />
            </div>
        </div>
    );
}
