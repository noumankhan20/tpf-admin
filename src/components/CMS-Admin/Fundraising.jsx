"use client";
import React, { useState } from "react";
import {
  Upload,
  Save,
  XCircle,
  Image,
  Home,
  Trash2,
  Search,
  Calendar,
  Users,
  Edit2,
  AlertCircle,
  CheckCircle,
  Shield,
  Play,
  Clock,
  Menu,
  X,
  Heart,
  Rss,
  Award,
  MessageSquare,
  Flag,
  FileText,
  PlusIcon,
} from "lucide-react";
import Sidebar from "../Layout/CMSSideBar";
export default function FundraisingCMS() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("fundraising");
  const [viewMode, setViewMode] = useState("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCard, setEditingCard] = useState(null);

  const [formData, setFormData] = useState({
    category: "Emergency Aid",
    isUrgent: false,
    taxBenefits: false,
    zakatVerified: false,
    title: "",
    organization: "",
    requiredAmount: "",
    deadline: "",
    mediaType: "image", // New field: 'image' or 'video'
    image: null,
    imagePreview: null,
    video: null,
    videoPreview: null,
    currentAmount: 0,
    totalDonors: 0,
  });

  const categories = [
    "Emergency Aid",
    "Medical Aid",
    "Orphans",
    "Education",
    "Clean Water",
  ];

  const categoryColors = {
    "Emergency Aid": "bg-red-100 text-red-800",
    "Medical Aid": "bg-blue-100 text-blue-800",
    Orphans: "bg-purple-100 text-purple-800",
    Education: "bg-amber-100 text-amber-800",
    "Clean Water": "bg-cyan-100 text-cyan-800",
  };

  const [fundraisingCards, setFundraisingCards] = useState([
    {
      id: 1,
      mediaType: "image",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
      video: null,
      title: "Emergency Relief for Earthquake Victims",
      organization: "Global Relief Foundation",
      category: "Emergency Aid",
      isUrgent: true,
      taxBenefits: true,
      zakatVerified: true,
      requiredAmount: 500000,
      currentAmount: 342000,
      totalDonors: 1240,
      deadline: "2025-12-31",
      daysLeft: 46,
    },
    {
      id: 2,
      mediaType: "video",
      image: null,
      video: "https://example.com/video.mp4",
      title: "Medical Treatment for Children",
      organization: "Children's Health Fund",
      category: "Medical Aid",
      isUrgent: false,
      taxBenefits: true,
      zakatVerified: false,
      requiredAmount: 250000,
      currentAmount: 180000,
      totalDonors: 850,
      deadline: "2025-11-30",
      daysLeft: 15,
    },
    {
      id: 3,
      mediaType: "image",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
      video: null,
      title: "Build Schools in Rural Areas",
      organization: "Education for All",
      category: "Education",
      isUrgent: false,
      taxBenefits: true,
      zakatVerified: true,
      requiredAmount: 750000,
      currentAmount: 425000,
      totalDonors: 2100,
      deadline: "2026-03-15",
      daysLeft: 120,
    },
  ]);

  const handleMediaTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      mediaType: type,
      image: null,
      imagePreview: null,
      video: null,
      videoPreview: null,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        video: file,
        videoPreview: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({
      ...prev,
      video: null,
      videoPreview: null,
    }));
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      category: card.category,
      isUrgent: card.isUrgent,
      taxBenefits: card.taxBenefits,
      zakatVerified: card.zakatVerified,
      title: card.title,
      organization: card.organization,
      requiredAmount: card.requiredAmount,
      deadline: card.deadline,
      mediaType: card.mediaType || "image",
      image: null,
      imagePreview: card.image,
      video: null,
      videoPreview: card.video,
      currentAmount: card.currentAmount,
      totalDonors: card.totalDonors,
    });
    setViewMode("edit");
  };

  const handleSave = () => {
    alert("Fundraising card saved successfully!");
    setViewMode("view");
  };

  const handleCancel = () => {
    setViewMode("view");
    setEditingCard(null);
    setFormData({
      category: "Emergency Aid",
      isUrgent: false,
      taxBenefits: false,
      zakatVerified: false,
      title: "",
      organization: "",
      requiredAmount: "",
      deadline: "",
      mediaType: "image",
      image: null,
      imagePreview: null,
      video: null,
      videoPreview: null,
      currentAmount: 0,
      totalDonors: 0,
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this fundraising card?")) {
      setFundraisingCards((prev) => prev.filter((card) => card.id !== id));
    }
  };

  const calculatePercentage = (current, required) => {
    const req = Number(required) || 0;
    const cur = Number(current) || 0;
    if (req <= 0) return 0;
    return Math.min(Math.round((cur / req) * 100), 100);
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
    <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />

      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <h1 className="ml-3 text-lg font-bold text-[#0F172A]">Fundraising</h1>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-[#64748B] mb-2">
                <Home size={16} />
                <span>Home</span>
                <span>/</span>
                <span className="font-semibold text-[#0F172A]">
                  Fundraising Now
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
                    Fundraising Now
                  </h1>
                  <p className="text-sm sm:text-base text-[#475569]">
                    Manage active fundraising campaigns and donation cards.
                  </p>
                </div>
                {viewMode === "view" && (
                  <button
                    onClick={() => setViewMode("edit")}
                    className="bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center sm:justify-start cursor-pointer"
                  >
                    <PlusIcon size={20} />
                    Add New Campaign
                  </button>
                )}
              </div>
            </div>

            {viewMode === "view" && (
              <div>
                <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-xl p-4 mb-4 sm:mb-6">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      size={20}
                    />
                    <input
                      className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                      placeholder="Search fundraising campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-4">
                  {fundraisingCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {card.mediaType === "video" ? (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <Play size={24} className="text-white" />
                          </div>
                        ) : (
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#0F172A] truncate">
                          {card.title}
                        </h3>
                        <p className="text-sm text-[#64748B] truncate">
                          {card.organization}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[card.category]} inline-block mt-1`}>
                          {card.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(card)}
                          className="p-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1E3D36]"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {viewMode === "edit" && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={handleCancel}
                    className="text-[#2D6A4F] hover:text-[#1E3D36] font-medium flex items-center gap-2 text-sm cursor-pointer"
                  >
                    ← Back to list
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* LEFT - FORM */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-6">
                      {editingCard ? "Edit Fundraising Card" : "Add New Fundraising Card"}
                    </h2>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                          Badges
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.isUrgent}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  isUrgent: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-[#CBD5E1] text-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]"
                            />
                            <span className="text-sm text-[#0F172A]">Mark as Urgent</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.taxBenefits}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  taxBenefits: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-[#CBD5E1] text-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]"
                            />
                            <span className="text-sm text-[#0F172A]">Tax Benefits Available</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.zakatVerified}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  zakatVerified: e.target.checked,
                                })
                              }
                              className="w-5 h-5 rounded border-[#CBD5E1] text-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]"
                            />
                            <span className="text-sm text-[#0F172A]">Zakat Verified</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Campaign Title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Enter campaign title..."
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organization: e.target.value,
                            })
                          }
                          placeholder="Enter organization name..."
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Required Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.requiredAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requiredAmount: e.target.value,
                            })
                          }
                          placeholder="50000"
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Campaign Deadline
                        </label>
                        <input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) =>
                            setFormData({ ...formData, deadline: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      {/* MEDIA TYPE SELECTION */}
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                          Select Media Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleMediaTypeChange("image")}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.mediaType === "image"
                                ? "border-[#2D6A4F] bg-[#2D6A4F]/5"
                                : "border-[#CBD5E1] hover:border-[#94A3B8]"
                            }`}
                          >
                            <Image
                              size={32}
                              className={`mx-auto mb-2 ${
                                formData.mediaType === "image"
                                  ? "text-[#2D6A4F]"
                                  : "text-[#94A3B8]"
                              }`}
                            />
                            <p
                              className={`text-sm font-semibold ${
                                formData.mediaType === "image"
                                  ? "text-[#2D6A4F]"
                                  : "text-[#64748B]"
                              }`}
                            >
                              Image
                            </p>
                            <p className="text-xs text-[#94A3B8] mt-1">
                              Half card display
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMediaTypeChange("video")}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.mediaType === "video"
                                ? "border-[#2D6A4F] bg-[#2D6A4F]/5"
                                : "border-[#CBD5E1] hover:border-[#94A3B8]"
                            }`}
                          >
                            <Play
                              size={32}
                              className={`mx-auto mb-2 ${
                                formData.mediaType === "video"
                                  ? "text-[#2D6A4F]"
                                  : "text-[#94A3B8]"
                              }`}
                            />
                            <p
                              className={`text-sm font-semibold ${
                                formData.mediaType === "video"
                                  ? "text-[#2D6A4F]"
                                  : "text-[#64748B]"
                              }`}
                            >
                              Video
                            </p>
                            <p className="text-xs text-[#94A3B8] mt-1">
                              Full card display
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* IMAGE UPLOAD (only if image selected) */}
                      {formData.mediaType === "image" && (
                        <div>
                          <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                            Campaign Image
                          </label>

                          <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 sm:p-6">
                            {formData.imagePreview ? (
                              <>
                                <div className="relative max-h-40 mx-auto rounded-lg overflow-hidden">
                                  <img
                                    src={formData.imagePreview}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                  <label className="px-4 py-2 bg-blue-900 text-white text-sm rounded-lg font-medium cursor-pointer hover:bg-blue-700">
                                    Replace Image
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={handleImageUpload}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg font-medium hover:bg-red-50"
                                  >
                                    Remove Image
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label className="block text-center cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                />
                                <Upload
                                  size={40}
                                  className="mx-auto text-[#94A3B8] mb-3"
                                />
                                <p className="text-sm sm:text-base text-[#1E293B] font-medium">
                                  Click or drag to upload image
                                </p>
                                <p className="text-xs sm:text-sm text-[#94A3B8]">
                                  Recommended 800x600, JPG/PNG
                                </p>
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                      {/* VIDEO UPLOAD (only if video selected) */}
                      {formData.mediaType === "video" && (
                        <div>
                          <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                            Campaign Video
                          </label>

                          <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 sm:p-6">
                            {formData.videoPreview ? (
                              <>
                                <div className="relative max-h-40 mx-auto rounded-lg overflow-hidden bg-black">
                                  <video
                                    src={formData.videoPreview}
                                    className="w-full h-full object-contain"
                                    controls
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveVideo}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                  <label className="px-4 py-2 bg-[#2D6A4F] text-white text-sm rounded-lg font-medium cursor-pointer hover:bg-[#1E3D36]">
                                    Replace Video
                                    <input
                                      type="file"
                                      accept="video/*"
                                      className="hidden"
                                      onChange={handleVideoUpload}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleRemoveVideo}
                                    className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg font-medium hover:bg-red-50"
                                  >
                                    Remove Video
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label className="block text-center cursor-pointer">
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={handleVideoUpload}
                                />
                                <Play
                                  size={40}
                                  className="mx-auto text-[#94A3B8] mb-3"
                                />
                                <p className="text-sm sm:text-base text-[#1E293B] font-medium">
                                  Click or drag to upload video
                                </p>
                                <p className="text-xs sm:text-sm text-[#94A3B8]">
                                  MP4 format recommended, max 50MB
                                </p>
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                          onClick={handleSave}
                          className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Save size={20} />
                          Save Campaign
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 border-2 border-[#CBD5E1] text-[#0F172A] rounded-lg font-semibold hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={20} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT - LIVE PREVIEW */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-6">
                      Live Preview
                    </h2>

                    {/* Preview card matching frontend design */}
                    <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] overflow-hidden max-w-[285px] mx-auto">
                      {formData.mediaType === "video" ? (
                        // Full card video display
                        <div className="relative">
                          {formData.videoPreview ? (
                            <div className="relative aspect-video bg-black">
                              <video
                                src={formData.videoPreview}
                                className="w-full h-full object-cover"
                                controls
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center">
                              <Play size={64} className="text-[#94A3B8]" />
                            </div>
                          )}

                          {formData.isUrgent && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs rounded-full font-bold shadow-lg">
                              <AlertCircle size={16} />
                              URGENT
                            </div>
                          )}

                          {/* Content overlay on video */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className={`px-3 py-1.5 text-xs rounded-full font-semibold ${categoryColors[formData.category]}`}>
                                {formData.category}
                              </span>
                              {formData.taxBenefits && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-green-500/90 text-white text-xs rounded-full font-semibold">
                                  <CheckCircle size={14} />
                                  Tax Benefits
                                </span>
                              )}
                              {formData.zakatVerified && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/90 text-white text-xs rounded-full font-semibold">
                                  <Shield size={14} />
                                  Zakat Verified
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-bold mb-1 leading-tight line-clamp-2">
                              {formData.title || "Your Campaign Title Here"}
                            </h3>

                            <p className="text-sm text-white/90 mb-3">
                              {formData.organization || "Organization Name"}
                            </p>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xl font-bold">
                                    {formatCurrency(formData.currentAmount || 0)}
                                  </p>
                                  <p className="text-xs text-white/80">
                                    raised of {formatCurrency(formData.requiredAmount || 0)}
                                  </p>
                                </div>
                              </div>

                              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${calculatePercentage(
                                      formData.currentAmount || 0,
                                      formData.requiredAmount || 0
                                    )}%`,
                                  }}
                                />
                              </div>

                              {formData.deadline && (
                                <div className="flex items-center gap-1.5 text-white/90 text-sm">
                                  <Clock size={14} />
                                  <span className="font-medium">
                                    {Math.max(
                                      0,
                                      Math.ceil(
                                        (new Date(formData.deadline) - new Date()) /
                                        (1000 * 60 * 60 * 24)
                                      )
                                    )}{" "}
                                    days left
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Half card image display
                        <>
                          <div className="relative h-44">
                            {formData.imagePreview ? (
                              <img
                                src={formData.imagePreview}
                                alt="Campaign"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center">
                                <Image size={64} className="text-[#94A3B8]" />
                              </div>
                            )}

                            {formData.isUrgent && (
                              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs rounded-full font-bold shadow-lg">
                                <AlertCircle size={16} />
                                URGENT
                              </div>
                            )}
                          </div>

                          <div className="p-5">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className={`px-3 py-1.5 text-xs rounded-full font-semibold ${categoryColors[formData.category]}`}>
                                {formData.category}
                              </span>
                              {formData.taxBenefits && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                  <CheckCircle size={14} />
                                  Tax Benefits
                                </span>
                              )}
                              {formData.zakatVerified && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                                  <Shield size={14} />
                                  Zakat Verified
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-[#0F172A] mb-2 leading-tight line-clamp-2">
                              {formData.title || "Your Campaign Title Here"}
                            </h3>

                            <p className="text-sm text-[#64748B] mb-5">
                              {formData.organization || "Organization Name"}
                            </p>

                            <div className="space-y-3 mb-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-2xl font-bold text-[#2D6A4F]">
                                    {formatCurrency(formData.currentAmount || 0)}
                                  </p>
                                  <p className="text-xs text-[#64748B]">
                                    raised of {formatCurrency(formData.requiredAmount || 0)}
                                  </p>
                                </div>
                              </div>

                              <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#1E3D36] rounded-full transition-all duration-500"
                                  style={{
                                    width: `${calculatePercentage(
                                      formData.currentAmount || 0,
                                      formData.requiredAmount || 0
                                    )}%`,
                                  }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                {formData.deadline && (
                                  <div className="flex items-center gap-1.5 text-[#64748B]">
                                    <Clock size={16} />
                                    <span className="font-medium">
                                      {Math.max(
                                        0,
                                        Math.ceil(
                                          (new Date(formData.deadline) - new Date()) /
                                          (1000 * 60 * 60 * 24)
                                        )
                                      )}{" "}
                                      days left
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button className="w-full bg-[#2D6A4F] text-white py-3.5 rounded-xl font-bold hover:bg-[#1E3D36] transition-all transform hover:scale-[1.02] shadow-lg">
                              Donate Now
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-[#E2E8F0] rounded-xl">
                      <p className="text-sm text-[#475569]">
                        <strong className="text-[#0F172A]">Preview Tip:</strong>{" "}
                        {formData.mediaType === "video" 
                          ? "Video will display across the full card with content overlay at the bottom."
                          : "Image will display on the top half of the card with content below."}
                      </p>
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