"use client"
import React, { useState, useEffect } from "react";
import {
  useGetInfluencersQuery,
  useCreateInfluencerMutation,
  useUpdateInfluencerMutation,
  useDeleteInfluencerMutation,
} from "@/utils/slices/cms/influencerApi";
import { Save, XCircle, Home, Edit2, ArrowLeft, Trash2, Plus, ChevronUp, ChevronDown, GripVertical, Eye, Upload, Sparkles, Users, Image as ImageIcon, CheckCircle, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/utils/media";
import { toast } from "react-toastify";
import ConfirmModal from "../Common/ConfirmModal";

export default function InfluencerGalleryCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageForm, setImageForm] = useState({ imageFile: null, imagePreview: null, imageUrl: "" });
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
  } = useGetInfluencersQuery();

  const [createInfluencer] = useCreateInfluencerMutation();
  const [updateInfluencer] = useUpdateInfluencerMutation();
  const [deleteInfluencer] = useDeleteInfluencerMutation();

  const influencerImages =
    data?.influencers?.map((item, index) => ({
      id: item._id,
      imageUrl: getMediaUrl(item.image),
      imagePreview: getMediaUrl(item.image),
      lastUpdated: new Date(item.updatedAt).toLocaleString(),
      order: index + 1,
      pendingDelete: item.pendingDelete,
    })) ?? [];

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) { toast.error('Please upload a valid image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImageForm(p => ({ ...p, imageFile: file, imagePreview: reader.result, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!imageForm.imageFile) return toast.warn("Please upload an image");

    const formData = new FormData();
    formData.append("image", imageForm.imageFile);

    try {
      if (viewMode === "add-image") {
        await createInfluencer(formData).unwrap();
      } else {
        await updateInfluencer({
          id: selectedImage.id,
          formData,
        }).unwrap();
      }

      toast.success("Saved successfully");
      setViewMode("overview");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save image");
    }
  };

  const handleDeleteImage = async (id) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInfluencer(id).unwrap();
      alert("Deleted successfully");
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
    img.imageUrl?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/20 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-lg border-b border-emerald-100 px-4 py-3 flex items-center shadow-sm">
          <h1 className="ml-3 text-lg font-bold text-emerald-900">Influencer Gallery CMS</h1>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-emerald-600 mb-3">
                <Home size={16} />
                <span className="font-medium">Home</span>
                <span className="text-emerald-300">/</span>
                <span className="font-semibold text-emerald-900">Influencer Gallery</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push("/cms-admin")}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900">
                  Influencer Gallery Management
                </h1>
              </div>

              <ConfirmModal
                isOpen={isDeleting}
                onClose={() => setIsDeleting(false)}
                onConfirm={confirmDelete}
                title="Delete Image"
                message="Are you sure you want to permanently delete this image from the gallery? This action cannot be undone."
              />
              <p className="text-emerald-700">
                Manage circular profile images in the horizontal scroll gallery
              </p>
            </div>

            {viewMode === "overview" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-emerald-500/5 border border-emerald-100 p-6 sm:p-8">
                {/* Stats and Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-emerald-900">Gallery Images</h2>
                      <p className="text-sm text-emerald-600 font-medium">
                        {influencerImages.length} {influencerImages.length === 1 ? 'image' : 'images'} in gallery
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${previewMode
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-white text-emerald-600 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                    >
                      {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
                      {previewMode ? 'Hide' : 'Show'} Preview
                    </button>
                    <button
                      onClick={() => {
                        setImageForm({ imageFile: null, imagePreview: null, imageUrl: "" });
                        setViewMode("add-image");
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02]"
                    >
                      <Plus size={18} />
                      Add Image
                    </button>
                  </div>
                </div>

                {/* Preview Gallery */}
                {previewMode && (
                  <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        Live Gallery Preview
                      </h3>
                    </div>
                    <div className="bg-white rounded-2xl p-8 shadow-inner">
                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-50">
                        {influencerImages.map((img, idx) => (
                          <div key={img.id} className="flex-shrink-0">
                            <div className="relative group">
                              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-emerald-400/40 shadow-lg hover:ring-emerald-500/60 transition-all duration-300 hover:scale-105">
                                <img
                                  src={img.imageUrl}
                                  alt={`Influencer ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                {idx + 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Images Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group bg-white border-2 border-emerald-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-300"
                    >

                      {/* Image Preview */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-400/40 shadow-lg group-hover:ring-emerald-500/60 transition-all duration-300 group-hover:scale-105">
                            <img
                              src={img.imageUrl}
                              alt="Influencer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Updated Time */}
                      <p className="text-xs text-emerald-500 mb-4 flex items-center justify-center gap-1.5">
                        <CheckCircle size={12} />
                        {img.lastUpdated}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => !img.pendingDelete && handleEditImage(img)}
                          disabled={img.pendingDelete}
                          className={`flex-1 py-2.5 cursor-pointer rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-300 ${img.pendingDelete
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30"
                            }`}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>

                        {img.pendingDelete ? (
                          <button
                            disabled
                            className="flex-1 py-2.5 bg-amber-50 text-amber-500 border-2 border-amber-200 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                          >
                            ⏳ Pending
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="flex-1 py-2.5 cursor-pointer bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-300"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredImages.length === 0 && (
                  <div className="text-center py-20">
                    <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-4">
                      <ImageIcon size={48} className="text-emerald-400" />
                    </div>
                    <p className="text-emerald-700 text-lg font-semibold">No images in gallery</p>
                    <p className="text-emerald-500 text-sm mt-2">Add your first influencer image to get started</p>
                  </div>
                )}
              </div>
            )}

            {(viewMode === "add-image" || viewMode === "edit-image") && (
              <div className="space-y-6">
                <button
                  onClick={() => setViewMode("overview")}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold group transition-colors"
                >
                  <ChevronUp className="w-4 h-4 rotate-[-90deg] group-hover:-translate-x-1 transition-transform" />
                  Back to Gallery
                </button>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-emerald-500/5 border border-emerald-100 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <Upload className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-emerald-900">
                        {viewMode === "add-image" ? "Add New Image" : "Edit Image"}
                      </h2>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold text-emerald-900 mb-2">
                        Influencer Image *
                      </label>
                      <p className="text-xs text-emerald-600 mb-3">
                        Recommended: Square image (1:1 ratio), JPG/PNG, max 5MB
                      </p>

                      <label className="border-3 border-dashed border-emerald-300 rounded-2xl p-8 block text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 group">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        {imageForm.imagePreview ? (
                          <div className="space-y-4">
                            <div className="w-40 h-40 rounded-full mx-auto overflow-hidden ring-4 ring-emerald-400 shadow-xl">
                              <img
                                src={imageForm.imagePreview}
                                className="w-full h-full object-cover"
                                alt="Preview"
                              />
                            </div>
                            <p className="text-sm text-emerald-600 font-semibold group-hover:text-emerald-700">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="inline-flex p-4 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                              <Upload size={32} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-emerald-900 mb-1">
                                Click to upload image
                              </p>
                              <p className="text-sm text-emerald-600">JPG, PNG up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveImage}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40"
                      >
                        <Save size={20} />
                        {viewMode === "add-image" ? "Add to Gallery" : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setViewMode("overview")}
                        className="px-8 py-4 bg-white border-2 border-emerald-300 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={20} />
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Preview & Tips Section */}
                  <div className="space-y-6">
                    {/* Live Preview */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-emerald-500/5 border border-emerald-100 p-6">
                      <h3 className="text-lg font-bold text-emerald-900 mb-5 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-emerald-600" />
                        Live Preview
                      </h3>
                      <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-xl border-2 border-emerald-200 flex flex-col items-center">
                        <p className="text-sm text-emerald-600 font-medium mb-4">Gallery Display</p>
                        <div className="relative">
                          <div className="w-40 h-40 rounded-full bg-emerald-100 overflow-hidden ring-4 ring-emerald-400/60 shadow-xl">
                            {imageForm.imagePreview ? (
                              <img
                                src={imageForm.imagePreview}
                                className="w-full h-full object-cover"
                                alt="Preview"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Upload size={48} className="text-emerald-400" />
                              </div>
                            )}
                          </div>
                          {imageForm.imagePreview && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              {influencerImages.length + 1}
                            </div>
                          )}
                        </div>
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