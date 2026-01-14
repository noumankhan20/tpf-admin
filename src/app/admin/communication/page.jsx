"use client";

import React from 'react';
import InternalCommunicationMain from '@/components/Admin/Communication/InternalCommunicationMain';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommunicationPage() {
    const router = useRouter();

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => router.push("/select-portal")}
                    className="flex items-center gap-2 mb-6 px-4 py-2 hover:bg-white rounded-xl transition-colors text-gray-500 hover:text-gray-900 font-medium text-sm border border-transparent hover:border-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portal
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Internal Communication</h1>
                    <p className="text-gray-500">Secure messaging platform for TPF Administrators</p>
                </div>

                <InternalCommunicationMain />
            </div>
        </div>
    );
}
