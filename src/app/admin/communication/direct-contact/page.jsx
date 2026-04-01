'use client';

import React from 'react';
import DirectEmail from '@/components/Admin/Communication/DirectEmail';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DirectContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ChevronLeft className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                <span>Communication</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-blue-600">Direct Contact</span>
              </nav>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Member Outreach</h1>
            </div>
          </div>

          
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-4"
      >
        <DirectEmail />
      </motion.div>
    </div>
  );
}
