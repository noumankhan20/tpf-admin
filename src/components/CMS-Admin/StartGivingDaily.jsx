"use client";
import React, { useState, useEffect } from "react";
import { Save, Home, Menu, Upload, RefreshCw, Eye, EyeOff } from "lucide-react";

import axios from "axios";

export default function StartGivingDaily() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("start-giving-daily");
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [mode, setMode] = useState("create"); // ✅ create | edit
  const [bannerData, setBannerData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "Start Giving Daily",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // ✅ LOAD SECTION ON MOUNT
  useEffect(() => {
    fetchSection();
  }, []);

  // ✅ FETCH CMS DATA
  const fetchSection = async () => {
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
        // ✅ NO DATA → CREATE MODE
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
    }
  };

  // ✅ IMAGE UPLOAD
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

  // ✅ FORM INPUT CHANGE
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // ✅ CREATE API
  const handleCreate = async () => {
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    if (imageFile) form.append("image", imageFile);

    try {
      const res = await axios.post(
        `${API_URL}/cms/start-giving/add`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Created successfully!");
        fetchSection(); // ✅ switches to edit after create
        setHasChanges(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create");
    }
  };

  // ✅ UPDATE API
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Title and description cannot be empty");
      return;
    }

    if (mode === "create") {
      return handleCreate(); // ✅ CREATE MODE
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    if (imageFile) form.append("image", imageFile);

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
    }
  };

  // ✅ RESET
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
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu size={24} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Home size={16} />
              <span>Home</span>
              <span>/</span>
              <span className="font-semibold text-gray-900">Start Giving Daily</span>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg flex gap-2 items-center mb-6"
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>

            {showPreview && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 mb-6">
                <div className="relative rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 z-10"></div>

                  {imagePreview && (
                    <img
                      src={imagePreview}
                      className="w-full h-64 md:h-96 object-cover"
                    />
                  )}

                  <div className="absolute inset-0 flex items-center px-8 z-20">
                    <div className="text-white max-w-xl">
                      <h1 className="text-3xl font-bold mb-3">{formData.title}</h1>
                      <p className="mb-5">{formData.description}</p>
                      <button className="bg-emerald-600 px-6 py-3 rounded-lg text-lg">
                        {formData.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border">

              {/* IMAGE */}
              <label className="block text-sm font-semibold mb-2">Banner Image *</label>
              <label className="border-2 border-dashed p-6 rounded-xl block text-center cursor-pointer">
                <input type="file" className="hidden" onChange={handleImageUpload} />
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <Upload size={40} className="mx-auto text-gray-400" />
                )}
              </label>

              {/* TITLE */}
              <label className="block mt-6 mb-2 text-sm font-semibold">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              {/* DESCRIPTION */}
              <label className="block mt-6 mb-2 text-sm font-semibold">Description</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />

              {/* BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                    hasChanges
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Save size={18} /> {mode === "create" ? "Create Section" : "Save Changes"}
                </button>

                <button
                  onClick={handleReset}
                  disabled={!hasChanges}
                  className="px-6 py-3 rounded-lg border font-semibold"
                >
                  <RefreshCw size={18} /> Reset
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
