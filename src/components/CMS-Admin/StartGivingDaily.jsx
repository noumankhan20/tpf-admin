"use client";
import React, { useState, useEffect } from "react";
import { Save, Home, Menu, Upload, RefreshCw, Eye, EyeOff,ArrowLeft, AlertCircle, CheckCircle2, Image, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function StartGivingDaily() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router= useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("start-giving-daily");
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [mode, setMode] = useState("create");
  const [bannerData, setBannerData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "Start Giving Daily",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchSection();
  }, []);

  const fetchSection = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/cms/start-giving/get`);

      if (res.data.success && res.data.data.length > 0) {
        const section = res.data.data[0];

        setMode("edit");
        setBannerData(section);

        setFormData({
          title: section.title,
          description: section.description,
          buttonText: "Start Giving Daily",
        });

        setImagePreview(`${BASE_URL}${section.image}`);
      } else {
        setMode("create");
        setBannerData(null);
        setFormData({
          title: "",
          description: "",
          buttonText: "Start Giving Daily",
        });
        setImagePreview("");
      }
    } catch (err) {
      console.error("Fetch Start-Giving Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCreate = async () => {
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    if (imageFile) form.append("image", imageFile);

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/cms/start-giving/add`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Created successfully!");
        fetchSection();
        setHasChanges(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Title and description cannot be empty");
      return;
    }

    if (mode === "create") {
      return handleCreate();
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    if (imageFile) form.append("image", imageFile);

    setIsLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/cms/start-giving/update/${bannerData._id}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Updated successfully!");
        fetchSection();
        setHasChanges(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (hasChanges && !confirm("Discard unsaved changes?")) return;

    if (mode === "edit" && bannerData) {
      setFormData({
        title: bannerData.title,
        description: bannerData.description,
        buttonText: "Start Giving Daily",
      });

      setImagePreview(`${BASE_URL}${bannerData.image}`);
      setImageFile(null);
    } else {
      setFormData({
        title: "",
        description: "",
        buttonText: "Start Giving Daily",
      });
      setImagePreview("");
      setImageFile(null);
    }

    setHasChanges(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-4 py-3 flex items-center shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            <Menu size={24} className="text-slate-700" />
          </button>
          <h1 className="ml-3 text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Start Giving Daily
          </h1>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Enhanced Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Home size={16} className="text-slate-400" />
              <span className="hover:text-slate-700 transition-colors cursor-pointer">Home</span>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-700">Start Giving Daily</span>
            </div>

            {/* Enhanced Page Header with Preview Toggle */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => router.push("/cms-admin")}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                  Start Giving Daily Section
                </h1>
                <p className="text-base text-slate-600">
                  {mode === "create" ? "Create your hero banner section" : "Manage your hero banner content and design"}
                </p>
              </div>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="group px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transition-all duration-200 flex gap-2 items-center font-semibold"
              >
                {showPreview ? <EyeOff size={18} className="group-hover:scale-110 transition-transform" /> : <Eye size={18} className="group-hover:scale-110 transition-transform" />}
                <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
              </button>
            </div>

            {/* Loading State */}
            {isLoading && !showPreview && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
              </div>
            )}

            {/* Enhanced Preview Section */}
            {showPreview && (
              <div className="mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                  {/* Preview Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Sparkles size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Live Preview</h3>
                        <p className="text-emerald-100 text-sm">See your changes in real-time</p>
                      </div>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="p-6">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10"></div>

                      {/* Background Image */}
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          className="w-full h-72 md:h-96 object-cover"
                          alt="Banner preview"
                        />
                      ) : (
                        <div className="w-full h-72 md:h-96 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <div className="text-center">
                            <Image size={64} className="text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Upload an image to preview</p>
                          </div>
                        </div>
                      )}

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex items-center px-8 md:px-12 lg:px-16 z-20">
                        <div className="text-white max-w-2xl">
                          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
                            {formData.title || "Your Title Here"}
                          </h1>
                          <p className="text-base md:text-lg mb-6 drop-shadow-md leading-relaxed text-white/95">
                            {formData.description || "Your description will appear here"}
                          </p>
                          <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-8 py-3.5 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                            {formData.buttonText}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preview Info Box */}
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-emerald-800">
                          <p className="font-semibold mb-1">Preview Mode Active</p>
                          <p className="text-emerald-700">
                            This is how your banner will appear on the live website. Make changes below to see them reflected here instantly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Form Section */}
            {!isLoading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 px-6 py-5">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {mode === "create" ? "Create Banner Section" : "Edit Banner Content"}
                  </h2>
                  <p className="text-slate-300 text-sm">
                    {mode === "create"
                      ? "Fill in the details below to create your hero banner"
                      : "Update your banner content and save changes"}
                  </p>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                  {/* Enhanced Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      Banner Image
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      <span>Recommended: 1920x1080px, JPG or PNG, max 5MB</span>
                    </p>

                    <label className="group relative border-2 border-dashed border-slate-300 rounded-2xl p-8 block text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-200 bg-slate-50">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />

                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative rounded-xl overflow-hidden shadow-lg max-h-64">
                            <img
                              src={imagePreview}
                              className="w-full h-full object-cover"
                              alt="Preview"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 px-4 py-2 rounded-lg">
                                <p className="text-slate-700 font-semibold flex items-center gap-2">
                                  <Upload size={16} />
                                  Click to change
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                            <Upload size={32} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                              Click or drag to upload banner image
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              High-resolution images work best
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Enhanced Title Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      Banner Title
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter a compelling title..."
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {formData.title.length} characters • Keep it concise and impactful
                    </p>
                  </div>

                  {/* Enhanced Description Textarea */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      Description
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-slate-900 placeholder:text-slate-400 resize-none"
                      placeholder="Write a compelling description that engages your audience..."
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {formData.description.length} characters • Describe your call-to-action clearly
                    </p>
                  </div>

                  {/* Status Indicator */}
                  {hasChanges && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Unsaved Changes</p>
                          <p className="text-amber-700">
                            You have unsaved changes. Click "Save Changes" to apply them or "Reset" to discard.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isLoading}
                      className={`flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${hasChanges && !isLoading
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          <span>{mode === "create" ? "Create Section" : "Save Changes"}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReset}
                      disabled={!hasChanges || isLoading}
                      className={`sm:w-auto px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${hasChanges && !isLoading
                          ? "bg-slate-100 text-slate-700 border-2 border-slate-200 hover:bg-slate-200 hover:border-slate-300"
                          : "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                        }`}
                    >
                      <RefreshCw size={18} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}