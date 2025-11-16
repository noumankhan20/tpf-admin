"use client";
import React, { useState } from "react";
import { Save, XCircle, Home, Menu, Upload, RefreshCw, Eye, EyeOff } from "lucide-react";
import Sidebar from "../Layout/CMSSideBar";
export default function StartFundraiserBannerCMS() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("before-footer");
  // Initial banner data (this would come from your database)
  const [bannerData, setBannerData] = useState({
    imageUrl: "https://images.unsplash.com/photo-1576381394626-53b3d2d48145?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500",
    title: "Start your fundraiser in minutes",
    description: "No platform fees. Reach millions of generous hearts across the Ummah. Turn your cause into lasting ṣadaqah jāriyah — a reward that continues beyond this world.",
    buttonText: "Create Fundraiser Now",
    lastUpdated: "2025-11-16 10:30",
  });

  // Form state for editing
  const [formData, setFormData] = useState({ ...bannerData });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(bannerData.imageUrl);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Validation
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }
    if (formData.title.length > 100) {
      alert("Title must be less than 100 characters");
      return;
    }
    if (!formData.description.trim()) {
      alert("Description is required");
      return;
    }
    if (formData.description.length > 500) {
      alert("Description must be less than 500 characters");
      return;
    }
    if (!imagePreview) {
      alert("Banner image is required");
      return;
    }

    // Update the main banner data
    setBannerData({
      ...formData,
      lastUpdated: new Date().toLocaleString(),
    });
    
    setHasChanges(false);
    alert("✅ Changes saved successfully! Your banner has been updated.");
  };

  const handleReset = () => {
    if (hasChanges && !confirm("Discard unsaved changes?")) return;
    setFormData({ ...bannerData });
    setImagePreview(bannerData.imageUrl);
    setImageFile(null);
    setHasChanges(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
       <Sidebar 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
            />
      
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="ml-3 text-lg font-bold">Fundraiser Banner</h1>
          </div>
          {hasChanges && (
            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              Unsaved
            </span>
          )}
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Home size={16} />
                <span>Home</span>
                <span>/</span>
                <span className="font-semibold text-gray-900">Start Fundraiser Banner</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Banner Content Manager
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Edit the banner image, title, and description
                  </p>
                </div>
                {hasChanges && (
                  <span className="hidden md:inline-flex px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                    You have unsaved changes
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
              >
                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                {showPreview ? "Hide" : "Show"} Live Preview
              </button>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="mb-6 bg-white rounded-xl shadow-lg border-2 border-purple-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Live Preview</h2>
                  <span className="px-3 py-1 bg-purple-100 text-blue-700 text-xs font-semibold rounded-full">
                    Frontend View
                  </span>
                </div>
                
                {/* Actual banner preview */}
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
                  <img
                    src={imagePreview}
                    alt="Banner Preview"
                    className="h-64 md:h-96 w-full object-cover object-[50%_75%]"
                  />
                  <div className="absolute inset-0 p-6 md:p-10 flex items-center z-20">
                    <div className="max-w-xl text-white">
                      <h3 className="text-2xl md:text-3xl font-semibold mb-3">
                        {formData.title || "Your title here..."}
                      </h3>
                      <p className="text-sm md:text-base text-white/90 mb-5">
                        {formData.description || "Your description here..."}
                      </p>
                      <button className="px-6 py-3 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-lg transition-colors">
                        {formData.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Edit Form */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Banner Content</h2>

                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Banner Image *
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    Recommended: 1200x800px (landscape), JPG/PNG/WebP, max 10MB
                  </p>

                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 block text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <p className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload size={48} className="mx-auto text-gray-400 group-hover:text-blue-500 transition" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Click or drag to upload</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Banner Title * <span className="text-xs font-normal text-gray-500">({formData.title.length}/100)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter banner title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={100}
                  />
                  {formData.title.length > 80 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Consider keeping the title concise for better readability
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Banner Description * <span className="text-xs font-normal text-gray-500">({formData.description.length}/500)</span>
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter banner description..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    maxLength={500}
                  />
                  {formData.description.length > 400 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Consider keeping the description concise for better user experience
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      hasChanges
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      hasChanges
                        ? 'border-2 border-gray-300 hover:bg-gray-50'
                        : 'border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw size={18} />
                    Reset
                  </button>
                </div>
              </div>

              {/* Right Column - Info & Tips */}
              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Current Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <span className="text-sm font-medium text-gray-900">{bannerData.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Best Practices</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Image:</strong> Use high-quality landscape images (16:9 ratio) with focal point at 50% horizontal, 75% vertical</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Title:</strong> Keep it short and compelling (5-10 words works best)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Description:</strong> Focus on benefits and call-to-action (2-3 sentences)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Contrast:</strong> Ensure text is visible against the background image</span>
                    </li>
                  </ul>
                </div>

                {/* Preview Sizes */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Preview Dimensions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Mobile (h-64):</span>
                      <span className="font-medium">256px height</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Desktop (h-96):</span>
                      <span className="font-medium">384px height</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}