"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, XCircle, Home, Edit2, Trash2, Plus, Menu, ChevronUp, ChevronDown, GripVertical, Eye, Upload } from "lucide-react";

export default function InfluencerGalleryCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeSection, setActiveSection] = useState("influencers");
  const [influencerImages, setInfluencerImages] = useState([]);
  const [imageForm, setImageForm] = useState({ imageFile: null, imagePreview: null, imageUrl: "" });
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      const res = await axios.get(`${API_URL}/cms/influencer/get`);
      if (res.data.success) {
        const formatted = res.data.influencers.map((item, index) => ({
          id: item._id,
          imageUrl: `${BASE_URL}${item.image}`,
          imagePreview: `${BASE_URL}${item.image}`,
          lastUpdated: new Date(item.updatedAt).toLocaleString(),
          order: index + 1
        }));

        setInfluencerImages(formatted);
      }
    } catch (err) {
      console.error("fetch error:", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) { alert('Please upload a valid image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImageForm(p => ({ ...p, imageFile: file, imagePreview: reader.result, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!imageForm.imageFile) return alert("Please upload an image");

    const formData = new FormData();
    formData.append("image", imageForm.imageFile);

    try {
      let res;

      // ADD MODE
      if (viewMode === "add-image") {
        res = await axios.post(
          `${API_URL}/cms/influencer/add`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      // EDIT MODE
      else {
        res = await axios.put(
          `${API_URL}/cms/influencer/update/${selectedImage.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      if (res.data.success) {
        alert("Saved successfully");
        fetchInfluencers();
        setViewMode("overview");
      }

    } catch (err) {
      console.error(err);
      alert("Failed to save image");
    }
  };

  const handleDeleteImage = async (id) => {
    if (!confirm("Delete this image?")) return;

    try {
      const res = await axios.delete(`${API_URL}/cms/influencer/delete/${id}`);

      if (res.data.success) {
        alert("Deleted successfully");
        fetchInfluencers();
      }

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleEditImage = (img) => {
    setSelectedImage(img);
    setImageForm({
      imageFile: null,
      imagePreview: img.imageUrl,
      imageUrl: img.imageUrl
    });
    setViewMode("edit-image");
  };

  const filteredImages = influencerImages.filter(img =>
    img.imageUrl
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden bg-white border-b px-4 py-3 flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
          <h1 className="ml-3 text-lg font-bold">Influencer Gallery</h1>
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Influencer Gallery Management</h1>
            <p className="text-sm text-gray-600 mb-6">Manage images in the horizontal scroll gallery</p>

            {viewMode === "overview" && (
              <div className="bg-white rounded-xl shadow border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                  <div><h2 className="text-xl font-bold">{influencerImages.length} Images</h2></div>
                  <div className="flex gap-2">
                    <button onClick={() => { setImageForm({ imageFile: null, imagePreview: null, imageUrl: "" }); setViewMode("add-image"); }} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Plus size={18} />Add
                    </button>
                  </div>
                </div>

                {previewMode && (
                  <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <h3 className="font-bold mb-4">Live Preview</h3>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredImages.map((img, idx) => (
                    <div key={img.id} className="border rounded-xl p-4 hover:shadow-lg transition">
                      <div className="flex justify-between mb-3">
                        <span className="text-xs text-gray-500">#{idx + 1}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className={`p-1 rounded hover:bg-gray-100 ${idx === 0 ? 'opacity-30' : ''}`}><ChevronUp size={16} /></button>
                          <GripVertical size={16} className="text-gray-400" />
                          <button onClick={() => handleMoveDown(idx)} disabled={idx === filteredImages.length - 1} className={`p-1 rounded hover:bg-gray-100 ${idx === filteredImages.length - 1 ? 'opacity-30' : ''}`}><ChevronDown size={16} /></button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center mb-3">
                        <img src={img.imageUrl} alt={img.title} className="w-24 h-24 rounded-full object-cover mb-2 ring-2 ring-blue-400/40" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditImage(img)}
                          className="flex items-center justify-center gap-1 flex-1 py-2 bg-blue-600 text-white rounded-lg"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="flex items-center justify-center gap-1 flex-1 py-2 bg-red-500 text-white rounded-lg"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(viewMode === "add-image" || viewMode === "edit-image") && (
              <div className="space-y-6">
                <button onClick={() => setViewMode("overview")} className="text-gray-600 hover:text-gray-900">← Back</button>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow border p-6">
                    <h2 className="text-xl font-bold mb-6">{viewMode === "add-image" ? "Add Image" : "Edit Image"}</h2>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">Image *</label>
                      <label className="border-2 border-dashed rounded-xl p-8 block text-center cursor-pointer hover:border-blue-500">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        {imageForm.imagePreview ? (
                          <div><img src={imageForm.imagePreview} className="w-32 h-32 rounded-full mx-auto mb-2 ring-4 ring-blue-400" alt="" /><p className="text-sm text-blue-600">Click to change</p></div>
                        ) : (
                          <div><Plus size={32} className="mx-auto text-gray-400 mb-2" /><p className="text-sm">Click to upload</p></div>
                        )}
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSaveImage} className="flex-1 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"><Save size={18} />Save</button>
                      <button onClick={() => setViewMode("overview")} className="px-6 py-3 border-2 rounded-lg flex items-center justify-center gap-2"><XCircle size={18} />Cancel</button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow border p-6">
                    <h2 className="text-xl font-bold mb-6">Preview</h2>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-blue-200 mb-6 flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 ring-4 ring-blue-400/60 overflow-hidden">
                        {imageForm.imagePreview ? <img src={imageForm.imagePreview} className="w-full h-full object-cover" alt="" /> : <Plus size={48} className="text-gray-400 mx-auto mt-8" />}
                      </div>
                    </div>
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