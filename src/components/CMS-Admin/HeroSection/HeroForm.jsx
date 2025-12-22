"use client";
import React from "react";
import { Upload, Save, ImageIcon, Edit2, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function HeroForm({ 
    heroForm, 
    setHeroForm, 
    handleImageUpload, 
    handleSave, 
    isEditMode 
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        {isEditMode ? (
                            <Edit2 className="w-5 h-5 text-blue-600" />
                        ) : (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? "Edit Hero Banner" : "Create Hero Banner"}
                    </h2>
                </div>
                <p className="text-sm text-gray-600">
                    {isEditMode ? "Update your hero section content" : "Design your website's main hero section"}
                </p>
            </div>

            <div className="p-6 space-y-5">
                {/* IMAGE UPLOAD */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Hero Image {!isEditMode && "*"}
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                        {isEditMode 
                            ? "Recommended: 1920x1080px (2049x665px for wide displays)" 
                            : "Recommended: 1920x1080px, JPG/PNG format"}
                    </p>

                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 block text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />

                        {heroForm.imagePreview ? (
                            <div className="relative">
                                <img
                                    src={heroForm.imagePreview}
                                    className="max-h-40 mx-auto rounded-lg mb-3 shadow-md"
                                    alt="Preview"
                                />
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
                                    <CheckCircle size={16} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload size={40} className="mx-auto text-gray-400 group-hover:text-emerald-500 transition" />
                                <p className="text-sm text-gray-700 font-medium">
                                    Click or drag to upload {isEditMode && "new image"}
                                </p>
                                {!isEditMode && (
                                    <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                                )}
                            </div>
                        )}
                    </label>
                </div>

                {/* TITLE */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Hero Title *
                    </label>
                    <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder={isEditMode ? "Enter title..." : "Enter compelling headline..."}
                        value={heroForm.title}
                        onChange={(e) =>
                            setHeroForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                    />
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Description *
                    </label>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                        placeholder={isEditMode ? "Short description..." : "Write a brief description..."}
                        value={heroForm.description}
                        onChange={(e) =>
                            setHeroForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                    />
                </div>

                {/* SAVE BUTTON */}
                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        {isEditMode ? "Save Changes" : "Create Hero Banner"}
                    </button>
                </div>

                {/* Info Alert */}
                {isEditMode ? (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-900 mb-1">Important Note</p>
                            <p className="text-xs text-amber-700">Changes will be visible after 5 minutes on your live website after saving</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Getting Started</p>
                            <p className="text-xs text-blue-700">Fill in all required fields to create your hero banner</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}