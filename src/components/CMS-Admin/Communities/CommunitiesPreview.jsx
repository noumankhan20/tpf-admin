"use client";
import React from "react";
import { Eye, Image, Info } from "lucide-react";

export default function CommunityPreview({ communityForm }) {
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
                    {communityForm.name ? "Real-time preview of your community" : "See how your community will look"}
                </p>
            </div>

            <div className="p-6">
                <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-200">
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                        {communityForm.imagePreview ? (
                            <img
                                src={communityForm.imagePreview}
                                alt="Community Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Image size={64} className="text-gray-300" />
                            </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                            <h3 className="font-bold text-white text-xl mb-3 drop-shadow-lg">
                                {communityForm.name || "Community Name"}
                            </h3>
                            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full transition-colors duration-200 shadow-lg">
                                Join Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Info */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Preview Mode</p>
                        <p className="text-xs text-blue-700">This is how your community card will appear on the website</p>
                    </div>
                </div>
            </div>
        </div>
    );
}