"use client"
import React, { useState } from "react";
import { Save, XCircle, Home, Edit2, Trash2, Plus, Menu, ChevronUp, ChevronDown, GripVertical, Eye, Upload } from "lucide-react";
import Sidebar from "../Layout/CMSSideBar";
export default function InfluencerGalleryCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
   const [activeSection, setActiveSection] = useState("influencers");
  const [influencerImages, setInfluencerImages] = useState([
    { id: 1, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256",  lastUpdated: "2025-11-15 10:30", order: 1 },
    { id: 2, imageUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=256",  lastUpdated: "2025-11-14 15:20", order: 2 },
    { id: 3, imageUrl: "https://plus.unsplash.com/premium_photo-1661964252605-8ba0cd83b056", lastUpdated: "2025-11-13 09:45", order: 3 },
  ]);
  const [imageForm, setImageForm] = useState({ imageFile: null, imagePreview: null, imageUrl: "" });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) { alert('Please upload a valid image'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImageForm(p => ({ ...p, imageFile: file, imagePreview: reader.result, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveImage = () => {
    if (viewMode === "add-image") {
      setInfluencerImages([...influencerImages, { id: Date.now(), ...imageForm, status: "Active", lastUpdated: new Date().toLocaleString(), order: influencerImages.length + 1 }]);
    } else {
      setInfluencerImages(influencerImages.map(img => img.id === selectedImage.id ? { ...img, ...imageForm, lastUpdated: new Date().toLocaleString() } : img));
    }
    alert("Saved!");
    setViewMode("overview");
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...influencerImages];
    [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
    arr.forEach((img, i) => img.order = i + 1);
    setInfluencerImages(arr);
  };

  const handleMoveDown = (idx) => {
    if (idx === influencerImages.length - 1) return;
    const arr = [...influencerImages];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    arr.forEach((img, i) => img.order = i + 1);
    setInfluencerImages(arr);
  };
const filteredImages = influencerImages.filter(img =>
  img.imageUrl.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
            />
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
                    <button onClick={() => { setImageForm({imageFile: null, imagePreview: null, imageUrl: "" }); setViewMode("add-image"); }} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
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
                        <button onClick={() => { setSelectedImage(img); setImageForm({ imageFile: null, imagePreview: img.imageUrl, imageUrl: img.imageUrl }); setViewMode("edit-image"); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-1">
                          <Edit2 size={14} />Edit
                        </button>
                        <button onClick={() => confirm("Delete?") && setInfluencerImages(influencerImages.filter(i => i.id !== img.id))} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center justify-center gap-1">
                          <Trash2 size={14} />Delete
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