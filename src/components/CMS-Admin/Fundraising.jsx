"use client";
import React, { useState, useEffect } from "react";
import NotificationBell from '../Common/NotificationBell';
import {
  Upload,
  Save,
  XCircle,
  Image,
  Home,
  Trash2,
  Search,
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
import axios from "axios";

export default function FundraisingCMS() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("fundraising");
  const [viewMode, setViewMode] = useState("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCard, setEditingCard] = useState(null);
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';
  const IMAGE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';
  const [formData, setFormData] = useState({
    category: "Emergency Aid",
    isUrgent: false,
    taxBenefits: false,
    zakatVerified: false,
    title: "",
    organization: "",
    beneficiaryName: "",
    about: "",
    impactGoals: [""], // array of sentences
    requiredAmount: "",
    deadline: "",
    mediaType: "image",
    image: null,
    imagePreview: null,
    video: null,
    videoPreview: null,
    currentAmount: 0,
    totalDonors: 0,
    isExistingImage: false,
    isExistingVideo: false,
    documents: [],            // new uploads (File[])
    existingDocuments: [],    // documents from backend
    campaignId: "",           // ✅ Linked draft campaign ID
    selectedImageUrl: "",     // ✅ Photography team's image URL
    selectedVideoUrl: "",     // ✅ Photography team's video URL
    taskId: "",               // ✅ Task ID for workflow automation
  });

  const [readyCampaigns, setReadyCampaigns] = useState([]); // ✅ Campaigns ready to be published
  const [selectedCampaign, setSelectedCampaign] = useState(null); // ✅ Currently selected draft


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

  const [fundraisingCards, setFundraisingCards] = useState([]);

  useEffect(() => {
    fetchFundraisers();
    fetchReadyCampaigns();
  }, []);

  const fetchReadyCampaigns = async () => {
    try {
      const res = await axios.get(`${API_BASE}/campaigns/ready`);
      if (res.data.success) {
        setReadyCampaigns(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ready campaigns:", err);
    }
  };

  const fetchFundraisers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cms/fundraiser/get`);
      const data = await res.data;

      if (data.success) {
        setFundraisingCards(data.data);
      }
    } catch (err) {
      console.error("Error fetching fundraisers:", err);
    }
  };

  const handleMediaTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      mediaType: type,
      image: null,
      imagePreview: null,
      video: null,
      videoPreview: null,
      isExistingImage: false,
      isExistingVideo: false,
    }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeNewDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const removeExistingDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
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
        isExistingImage: false, // This is a new upload
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
        isExistingVideo: false, // This is a new upload
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
      isExistingImage: false,
    }));
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({
      ...prev,
      video: null,
      videoPreview: null,
      isExistingVideo: false,
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
      beneficiaryName: card.beneficiaryName || "",
      about: card.about || "",
      impactGoals: card.impactGoals?.length ? card.impactGoals : [""],
      requiredAmount: card.requiredAmount,
      deadline: card.deadline?.split("T")[0],
      mediaType: card.mediaType || "image",
      image: null,
      imagePreview: card.imageUrl,
      video: null,
      videoPreview: card.videoUrl,
      currentAmount: card.currentAmount,
      totalDonors: card.totalDonors,
      isExistingImage: !!card.imageUrl,
      isExistingVideo: !!card.videoUrl,
      existingDocuments: card.documents || [],
      documents: [],

    });
    setViewMode("edit");
  };


  // Helper function to get the correct image URL
  const getImageUrl = (preview, isExisting) => {
    if (!preview) return null;
    if (isExisting) {
      if (preview.startsWith("http")) return preview;
      // Ensure no double slashes
      const baseUrl = IMAGE_URL.replace(/\/$/, "");
      const path = preview.replace(/^\//, "");
      return `${baseUrl}/${path}`;
    }
    return preview;
  };

  const handleCampaignSelect = (campaignId) => {
    const campaign = readyCampaigns.find(c => c._id === campaignId);
    if (!campaign) {
      setSelectedCampaign(null);
      resetForm();
      return;
    }

    setSelectedCampaign(campaign);
    setFormData(prev => ({
      ...prev,
      campaignId: campaign._id,
      title: campaign.title || "",
      organization: campaign.organization || "",
      beneficiaryName: campaign.beneficiaryName || "",
      requiredAmount: campaign.targetAmount || "",
      deadline: campaign.deadline ? campaign.deadline.split('T')[0] : "",
      taskId: campaign.taskId || "",
      // Reset media when switching campaigns
      selectedImageUrl: "",
      selectedVideoUrl: "",
      imagePreview: null,
      videoPreview: null,
    }));
  };

  const selectPhotographyMedia = (file) => {
    const isVideo = file.type === "video";
    const url = file.url;
    setFormData(prev => ({
      ...prev,
      mediaType: isVideo ? "video" : "image",
      selectedImageUrl: isVideo ? "" : url,
      selectedVideoUrl: isVideo ? url : "",
      imagePreview: isVideo ? null : url,
      videoPreview: isVideo ? url : null,
      isExistingImage: !isVideo,
      isExistingVideo: isVideo,
    }));
  };

  const handleSave = async () => {
    try {
      const form = new FormData();

      form.append("title", formData.title);
      form.append("organization", formData.organization);
      form.append("category", formData.category);
      form.append("requiredAmount", formData.requiredAmount);
      form.append("deadline", formData.deadline);
      form.append("mediaType", formData.mediaType);

      form.append("isUrgent", formData.isUrgent);
      form.append("taxBenefits", formData.taxBenefits);
      form.append("zakatVerified", formData.zakatVerified);
      form.append("beneficiaryName", formData.beneficiaryName);
      form.append("about", formData.about);
      // Append documents
      formData.documents.forEach((file) => {
        form.append("documents", file);
      });

      form.append("impactGoals", JSON.stringify(
        formData.impactGoals.filter(g => g.trim() !== "")

      ));


      // Append ONLY new files (File instances)
      if (formData.mediaType === "image" && formData.image instanceof File) {
        form.append("image", formData.image);
      }

      if (formData.mediaType === "video" && formData.video instanceof File) {
        form.append("video", formData.video);
      }

      // 🔹 Append linking data
      form.append("campaignId", formData.campaignId);
      if (formData.selectedImageUrl) form.append("selectedImageUrl", formData.selectedImageUrl);
      if (formData.selectedVideoUrl) form.append("selectedVideoUrl", formData.selectedVideoUrl);

      let res;

      // ----------------------------------------------------
      // 🔥 UPDATE MODE
      // ----------------------------------------------------
      if (editingCard) {
        res = await axios.put(
          `${API_BASE}/cms/fundraiser/update/${editingCard._id}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      // ----------------------------------------------------
      // 🆕 CREATE MODE
      // ----------------------------------------------------
      else {
        res = await axios.post(
          `${API_BASE}/cms/fundraiser/add`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      const data = res.data;

      if (data.success) {
        // ✅ Automate workflow task completion if ataskId is present
        if (!editingCard && formData.taskId) {
          try {
            await axios.post(
              `${API_BASE}/workflow/tasks/${formData.taskId}/complete`,
              {},
              { withCredentials: true }
            );
            console.log("Workflow step completed successfully");
          } catch (taskErr) {
            console.error("Task completion failed (non-fatal):", taskErr);
          }
        }

        alert(editingCard ? "Updated Successfully!" : "Created Successfully!");
        fetchFundraisers();   // refresh list
        resetForm();
        setEditingCard(null);
        setViewMode("view");
      } else {
        alert(data.message || "Something went wrong");
      }

    } catch (error) {
      console.error("Save Fundraiser Error:", error);
      alert("Something went wrong while saving.");
    }
  };


  const resetForm = () => {
    setFormData({
      category: "Emergency Aid",
      isUrgent: false,
      taxBenefits: false,
      zakatVerified: false,
      title: "",
      organization: "",
      beneficiaryName: "",
      about: "",
      impactGoals: [""],          // ✅ FIX
      requiredAmount: "",
      deadline: "",
      mediaType: "image",
      image: null,
      imagePreview: null,
      video: null,
      videoPreview: null,
      currentAmount: 0,
      totalDonors: 0,
      isExistingImage: false,
      isExistingVideo: false,
      documents: [],              // ✅ FIX
      existingDocuments: [],      // ✅ FIX
      campaignId: "",
      selectedImageUrl: "",
      selectedVideoUrl: "",
      taskId: "",
    });
    setSelectedCampaign(null);
  };


  const handleCancel = () => {
    setViewMode("view");
    setEditingCard(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this fundraising campaign?"
    );

    if (!confirmed) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/cms/fundraiser/delete/${id}`
      );

      if (res.data?.success) {
        // Optimistically update UI
        setFundraisingCards((prev) =>
          prev.filter((card) => card._id !== id)
        );
        alert("Campaign deleted successfully");
      } else {
        alert(res.data?.message || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Delete Fundraiser Error:", error);
      alert("Something went wrong while deleting the campaign");
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
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
                        Fundraising Now
                      </h1>
                      <p className="text-sm sm:text-base text-[#475569]">
                        Manage active fundraising campaigns and donation cards.
                      </p>
                    </div>
                    <NotificationBell moduleFilter="CMS_TASK" />
                  </div>
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
                    <div key={card._id} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-4">

                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        {card.mediaType === "video" ? (
                          <video
                            src={`${IMAGE_URL}${card.videoUrl}`}
                            className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={`${IMAGE_URL}${card.imageUrl}`}
                            className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#0F172A] truncate">{card.title}</h3>
                        <p className="text-sm text-[#64748B] truncate">{card.organization}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[card.category]}`}>
                          {card.category}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {/* EDIT */}
                        <button
                          onClick={() => handleEdit(card)}
                          className="p-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1E3D36] cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(card._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                          title="Delete"
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
                      {/* 🔹 CAMPAIGN SELECTOR (Only in create mode) */}
                      {!editingCard && (
                        <div>
                          <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                            Select Approved Draft Campaign <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.campaignId}
                            onChange={(e) => handleCampaignSelect(e.target.value)}
                            className="w-full px-4 py-3 border border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base font-medium"
                          >
                            <option value="">-- Click to select an approved draft --</option>
                            {readyCampaigns.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.title} ({c.beneficiaryName})
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-blue-600 italic">
                            Only campaigns with uploaded photography are shown here.
                          </p>
                        </div>
                      )}
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
                        <label className="block text-sm font-semibold mb-2">
                          Beneficiary Name
                        </label>
                        <input
                          type="text"
                          value={formData.beneficiaryName}
                          onChange={(e) =>
                            setFormData({ ...formData, beneficiaryName: e.target.value })
                          }
                          className="w-full px-4 py-3 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          About Campaign
                        </label>
                        <textarea
                          rows={5}
                          value={formData.about}
                          onChange={(e) =>
                            setFormData({ ...formData, about: e.target.value })
                          }
                          placeholder="Describe the campaign in detail..."
                          className="w-full px-4 py-3 border rounded-lg resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Campaign Impact Goals
                        </label>

                        <div className="space-y-3">
                          {(formData.impactGoals || []).map((goal, index) => (

                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={goal}
                                onChange={(e) => {
                                  const updated = [...formData.impactGoals];
                                  updated[index] = e.target.value;
                                  setFormData({ ...formData, impactGoals: updated });
                                }}
                                placeholder="e.g. 5,000+ families with clean water access"
                                className="flex-1 px-4 py-2 border rounded-lg"
                              />

                              {formData.impactGoals.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = formData.impactGoals.filter(
                                      (_, i) => i !== index
                                    );
                                    setFormData({ ...formData, impactGoals: updated });
                                  }}
                                  className="text-red-600"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              impactGoals: [...formData.impactGoals, ""],
                            })
                          }
                          className="mt-3 text-sm text-blue-700 font-semibold"
                        >
                          + Add Impact Goal
                        </button>
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

                      {/* 🔹 PHOTOGRAPHY GALLERY */}
                      {selectedCampaign && selectedCampaign.photographySubmissions?.length > 0 && (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                          <label className="block text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                            <Image size={18} />
                            Select Photography Submission
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {selectedCampaign.photographySubmissions.flatMap(sub => sub.files || []).map((file, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => selectPhotographyMedia(file)}
                                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${(formData.selectedImageUrl === file.url || formData.selectedVideoUrl === file.url)
                                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                  : "border-transparent hover:border-emerald-300"
                                  }`}
                              >
                                {file.type === "video" ? (
                                  <video src={getImageUrl(file.url, true)} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={getImageUrl(file.url, true)} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-white text-[10px] font-bold">SELECT</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          <p className="mt-2 text-[11px] text-emerald-700 italic">
                            Tip: Select an image above to use it as the main campaign cover.
                          </p>
                        </div>
                      )}

                      {/* MEDIA TYPE SELECTION */}
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-3">
                          Select Media Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleMediaTypeChange("image")}
                            className={`p-4 rounded-lg border-2 transition-all ${formData.mediaType === "image"
                              ? "border-[#2D6A4F] bg-[#2D6A4F]/5"
                              : "border-[#CBD5E1] hover:border-[#94A3B8]"
                              }`}
                          >
                            <Image
                              size={32}
                              className={`mx-auto mb-2 ${formData.mediaType === "image"
                                ? "text-[#2D6A4F]"
                                : "text-[#94A3B8]"
                                }`}
                            />
                            <p
                              className={`text-sm font-semibold ${formData.mediaType === "image"
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
                            className={`p-4 rounded-lg border-2 transition-all ${formData.mediaType === "video"
                              ? "border-[#2D6A4F] bg-[#2D6A4F]/5"
                              : "border-[#CBD5E1] hover:border-[#94A3B8]"
                              }`}
                          >
                            <Play
                              size={32}
                              className={`mx-auto mb-2 ${formData.mediaType === "video"
                                ? "text-[#2D6A4F]"
                                : "text-[#94A3B8]"
                                }`}
                            />
                            <p
                              className={`text-sm font-semibold ${formData.mediaType === "video"
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
                                    src={getImageUrl(formData.imagePreview, formData.isExistingImage)}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                    onError={(e) => {
                                      console.error("Image load error:", e.target.src);
                                      e.target.src = "https://placehold.co/300x200?text=Image+Not+Found";
                                    }}
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
                                    src={getImageUrl(formData.videoPreview, formData.isExistingVideo)}
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
                      {/* DOCUMENTS UPLOAD */}
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                          Supporting Documents
                        </label>

                        <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-4">
                          <label className="flex flex-col items-center cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,image/*"
                              className="hidden"
                              onChange={handleDocumentUpload}
                            />

                            <FileText size={36} className="text-[#94A3B8] mb-2" />
                            <p className="text-sm font-medium">
                              Upload documents (PDF, DOC, Images)
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                              Multiple files allowed
                            </p>
                          </label>
                        </div>

                        {/* Existing Documents */}
                        {formData.existingDocuments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold text-[#64748B]">Existing Documents</p>
                            {formData.existingDocuments.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-[#F8FAFC] border rounded-lg px-3 py-2"
                              >
                                <span className="text-sm truncate">
                                  {doc.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeExistingDocument(index)}
                                  className="text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New Documents */}
                        {formData.documents.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold text-[#64748B]">New Documents</p>
                            {formData.documents.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-[#F8FAFC] border rounded-lg px-3 py-2"
                              >
                                <span className="text-sm truncate">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeNewDocument(index)}
                                  className="text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>


                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                          onClick={handleSave}
                          className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Save size={20} />
                          Save Campaign
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 border-2 border-[#CBD5E1] text-[#0F172A] rounded-lg font-semibold hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                            <>
                              <video
                                src={getImageUrl(formData.videoPreview, formData.isExistingVideo)}
                                className="absolute inset-0 w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80"></div>
                            </>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center">
                                <Play size={64} className="text-[#94A3B8]" />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80"></div>
                            </>
                          )}

                          {/* Badges */}
                          {formData.isUrgent && (
                            <div className="absolute top-3 left-3 z-20 bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
                              Urgent
                            </div>
                          )}
                          {formData.taxBenefits && (
                            <div className="absolute top-3 right-3 z-20 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
                              Tax Benefits
                            </div>
                          )}

                          {/* Content structure matching frontend */}
                          <div className="relative z-10">
                            {/* Spacer matching aspect-video */}
                            <div className="aspect-video"></div>

                            {/* Content section */}
                            <div className="p-4">
                              <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem] text-white">
                                {formData.title || "Your Campaign Title Here"}
                              </h3>
                              <p className="text-xs text-zinc-200 mb-3 truncate">
                                {formData.organization || "Organization Name"}
                              </p>

                              <div className="mb-3">
                                <div className="flex justify-between text-xs mb-2">
                                  <span className="font-medium text-white">
                                    {formatCurrency(formData.currentAmount || 0)}
                                  </span>
                                  <span className="text-zinc-200">
                                    of {formatCurrency(formData.requiredAmount || 0)}
                                  </span>
                                </div>

                                {formData.deadline && (
                                  <div className="mb-2">
                                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                      {Math.max(0, Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24)))} Days Left
                                    </span>
                                  </div>
                                )}

                                <div className="w-full bg-zinc-700/50 rounded-full h-2">
                                  <div
                                    className="bg-emerald-600 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${calculatePercentage(
                                        formData.currentAmount || 0,
                                        formData.requiredAmount || 0
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mb-3 text-xs">
                                <span className="text-zinc-200">
                                  <Users className="w-3 h-3 inline mr-1" />
                                  {formData.totalDonors || 0} donors
                                </span>
                                <span className="font-medium text-emerald-400">
                                  {calculatePercentage(formData.currentAmount || 0, formData.requiredAmount || 0)}% funded
                                </span>
                              </div>

                              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-base transition-colors mb-3">
                                Donate Now
                              </button>

                              <div className="flex items-center justify-between pt-3 border-t border-zinc-600/50">
                                <div className="flex items-center gap-3">
                                  <button className="flex items-center gap-1 text-zinc-300 hover:text-red-400 transition-colors">
                                    <Heart className="w-4 h-4" />
                                  </button>
                                  <button className="flex items-center gap-1 text-zinc-300 hover:text-emerald-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                  </button>
                                </div>
                                {formData.zakatVerified && (
                                  <div className="flex items-center gap-1 text-[10px] bg-emerald-900/40 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-300 whitespace-nowrap">Zakaat Verified</span>
                                  </div>
                                )}
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
                          </div>
                        </div>
                      ) : (
                        // Half card image display
                        <>
                          <div className="relative h-44">
                            {formData.imagePreview ? (
                              <img
                                src={getImageUrl(formData.imagePreview, formData.isExistingImage)}
                                alt="Campaign"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("Preview image load error:", e.target.src);
                                  e.target.src = "https://placehold.co/300x200?text=Image+Preview+Error";
                                }}
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