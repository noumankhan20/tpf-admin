"use client";
import React from "react";
import { Eye, ImageIcon, Info } from "lucide-react";

export default function HeroPreview({ heroForm }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Live Preview</h2>
                </div>
                <p className="text-sm text-gray-600">
                    {heroForm.title || heroForm.description ? "Real-time preview of your changes" : "See how your hero will look"}
                </p>
            </div>

            <div className="p-6">
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 min-h-[400px] flex items-center justify-center shadow-2xl">
                    {heroForm.imagePreview && (
                        <img
                            src={heroForm.imagePreview}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                            alt="Background"
                        />
                    )}

                    {!heroForm.imagePreview && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon size={64} className="text-white/10" />
                        </div>
                    )}

                    <div className="relative z-10 text-center px-6 max-w-2xl">
                        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                            {heroForm.title || "Your Hero Title"}
                        </h1>

                        <p className="text-lg text-white/90 mb-6 drop-shadow">
                            {heroForm.description || "Your compelling description will appear here..."}
                        </p>

                        <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg">
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Preview Info */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Preview Mode</p>
                        <p className="text-xs text-blue-700">This is how your hero section will appear on the live website</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
