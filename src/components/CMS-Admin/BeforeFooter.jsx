"use client";
import React, { useState, useEffect } from "react";
import { Save, Home, Menu, ArrowLeft, Upload, RefreshCw, Eye, EyeOff, Image as ImageIcon, AlertCircle } from "lucide-react";

import {
  useGetBeforeFooterQuery,
  useCreateBeforeFooterMutation,
  useUpdateBeforeFooterMutation,
} from "@/utils/slices/cms/beforefooterApi";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/utils/media";
export default function StartFundraiserBannerCMS() {
  const router = useRouter();

  const [mode, setMode] = useState("create");
  const [bannerData, setBannerData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "Create Fundraiser Now",
    buttonRoute: "/my-profile",
  });


  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const { data, isLoading, error, refetch } = useGetBeforeFooterQuery();

  const [createBeforeFooter, { isLoading: isCreating }] = useCreateBeforeFooterMutation();
  const [updateBeforeFooter, { isLoading: isUpdating }] = useUpdateBeforeFooterMutation();

  const isSaving = isCreating || isUpdating;


  const section = data?.data?.[0] || null;


  useEffect(() => {
    if (section) {
      setMode("edit");
      setBannerData(section);

      setFormData({
        title: section.title || "",
        description: section.description || "",
        buttonText: section.buttonText || "Create Fundraiser Now",
        buttonRoute: section.buttonRoute || "/my-profile",

      });

      setImagePreview(section.image ? getMediaUrl(section.image) : "");
      setImageFile(null);
      setHasChanges(false);
    }
  }, [section]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
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

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("All fields required");
      return;
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("buttonText", formData.buttonText);
    form.append("buttonRoute", formData.buttonRoute);
    if (imageFile) form.append("image", imageFile);

    try {
      if (mode === "create") {
        await createBeforeFooter(form).unwrap();
        alert("Created successfully!");
      } else {
        await updateBeforeFooter({
          id: bannerData._id,
          formData: form,
        }).unwrap();
        alert("Updated successfully!");
      }

      setHasChanges(false);
    } catch (err) {
      alert(err?.data?.message || "Failed to save");
    }
  };


  const handleReset = () => {
    if (hasChanges && !confirm("Discard unsaved changes?")) return;

    if (mode === "edit" && bannerData) {
      setFormData({
        title: bannerData.title,
        description: bannerData.description,
        buttonText: bannerData.buttonText || "Create Fundraiser Now",
        buttonRoute: bannerData.buttonRoute || "/my-profile"
      });
      setImagePreview(getMediaUrl(bannerData.image));
    } else {
      setFormData({
        title: "",
        description: "",
        buttonText: "Create Fundraiser Now",
        buttonRoute: "/my-profile",
      });
      setImagePreview("");
    }

    setImageFile(null);
    setHasChanges(false);
  };

  if (!formData) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="animate-pulse text-emerald-600 font-semibold">Loading...</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-emerald-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-emerald-700" />
          </button>
          <h1 className="text-lg font-bold text-emerald-700">CMS Dashboard</h1>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-100 w-fit">
              <Home size={16} className="text-emerald-600" />
              <span className="text-gray-400">/</span>
              <span className="font-semibold text-emerald-700">
                Start Fundraiser Banner
              </span>
            </div>

            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                  onClick={() => router.push("/cms-admin")}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mode === "create" ? "Create" : "Edit"} Fundraiser Banner
                  </h1>
                  <p className="text-gray-600">
                    Manage your fundraiser call-to-action banner displayed before the footer
                  </p>
                </div>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-5 py-2.5 bg-white cursor-pointer text-emerald-700 rounded-xl flex gap-2 items-center font-medium border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md w-fit"
                >
                  {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-6 mb-8 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Live Preview</h3>
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10"></div>

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="h-72 md:h-96 w-full object-cover"
                      alt="Banner preview"
                    />
                  ) : (
                    <div className="h-72 md:h-96 w-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                      <ImageIcon size={64} className="text-emerald-300" />
                    </div>
                  )}

                  <div className="absolute inset-0 p-8 md:p-12 flex items-center z-20">
                    <div className="text-white max-w-2xl">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
                        {formData.title || "Your Banner Title"}
                      </h2>
                      <p className="mb-6 text-lg text-white/95 drop-shadow-md leading-relaxed">
                        {formData.description || "Your banner description will appear here"}
                      </p>
                      <button className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        {formData.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Banner Configuration</h3>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-900 flex items-center gap-2">
                    <ImageIcon size={18} className="text-emerald-600" />
                    Banner Image *
                  </label>

                  <label className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 p-8 rounded-2xl block text-center cursor-pointer transition-all duration-200 bg-emerald-50/30 hover:bg-emerald-50 group">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          className="w-full h-48 object-cover rounded-xl shadow-lg"
                          alt="Upload preview"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold">Click to change image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Upload size={48} className="mx-auto text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-emerald-700 font-semibold mb-1">Click to upload banner image</p>
                        <p className="text-sm text-gray-500">JPG, PNG or WebP (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block mb-3 text-sm font-bold text-gray-900">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter an engaging banner title"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 font-medium"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block mb-3 text-sm font-bold text-gray-900">
                    Description *
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Write a compelling description that encourages users to take action"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 resize-none font-medium"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="block mb-3 text-sm font-bold text-gray-900">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => handleInputChange("buttonText", e.target.value)}
                    placeholder="Create Fundraiser Now"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 font-medium"
                  />
                </div>

                {/* Button Route */}
                <div>
                  <label className="block mb-3 text-sm font-bold text-gray-900">
                    Button Route
                  </label>
                  <input
                    type="text"
                    value={formData.buttonRoute}
                    onChange={(e) => handleInputChange("buttonRoute", e.target.value)}
                    placeholder="/my-profile"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter frontend route only. eg: <code>/my-profile</code>
                  </p>
                </div>


                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-emerald-100">
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`flex-1 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${hasChanges && !isSaving
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {mode === "create" ? "Create Banner" : "Save Changes"}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    disabled={!hasChanges || isSaving}
                    className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all duration-200 ${hasChanges && !isSaving
                      ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    <RefreshCw size={18} />
                    Reset
                  </button>
                </div>

                {/* Status Indicator */}
                {hasChanges && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
                    <AlertCircle size={16} />
                    <span className="font-medium">You have unsaved changes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}