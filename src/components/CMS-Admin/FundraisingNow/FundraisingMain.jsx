"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  Search,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import FundraisingHeader from "./FundraisingHeader";
import CampaignList from "./CampaignList";
import CampaignForm from "./CampaignForm";
export default function FundraisingCMS() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCard, setEditingCard] = useState(null);
  const [fundraisingCards, setFundraisingCards] = useState([]);
  const [readyCampaigns, setReadyCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';
  const IMAGE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

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

  const [formData, setFormData] = useState({
    category: "Emergency Aid",
    isUrgent: false,
    taxBenefits: false,
    zakatVerified: false,
    title: "",
    organization: "",
    beneficiaryName: "",
    about: "",
    impactGoals: [""],
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
    documents: [],
    existingDocuments: [],
    campaignId: "",
    selectedImageUrl: "",
    selectedVideoUrl: "",
    taskId: "",
  });

  useEffect(() => {
    fetchFundraisers();
    fetchReadyCampaigns();
  }, []);

  const fetchReadyCampaigns = async () => {
    try {
      const res = await axios.get(`${API_BASE}/campaigns/ready`, { withCredentials: true });
      if (res.data.success) {
        setReadyCampaigns(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ready campaigns:", err);
    }
  };

  const fetchFundraisers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cms/fundraiser/get`, { withCredentials: true });
      const data = await res.data;

      if (data.success) {
        setFundraisingCards(data.data);
      }
    } catch (err) {
      console.error("Error fetching fundraisers:", err);
    }
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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this fundraising campaign?"
    );

    if (!confirmed) return;

    try {
      const res = await axios.delete(`${API_BASE}/cms/fundraiser/delete/${id}`, { withCredentials: true });

      if (res.data?.success) {
        setFundraisingCards((prev) => prev.filter((card) => card._id !== id));
        alert("Campaign deleted successfully");
      } else {
        alert(res.data?.message || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Delete Fundraiser Error:", error);
      alert("Something went wrong while deleting the campaign");
    }
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

      formData.documents.forEach((file) => {
        form.append("documents", file);
      });

      form.append("impactGoals", JSON.stringify(
        formData.impactGoals.filter(g => g.trim() !== "")
      ));

      if (formData.mediaType === "image" && formData.image instanceof File) {
        form.append("image", formData.image);
      }

      if (formData.mediaType === "video" && formData.video instanceof File) {
        form.append("video", formData.video);
      }

      form.append("campaignId", formData.campaignId);
      if (formData.selectedImageUrl) form.append("selectedImageUrl", formData.selectedImageUrl);
      if (formData.selectedVideoUrl) form.append("selectedVideoUrl", formData.selectedVideoUrl);

      let res;

      if (editingCard) {
        res = await axios.put(
          `${API_BASE}/cms/fundraiser/update/${editingCard._id}`,
          form,
          { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
        );
      } else {
        res = await axios.post(
          `${API_BASE}/cms/fundraiser/add`,
          form,
          { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
        );
      }

      const data = res.data;

      if (data.success) {
        if (!editingCard && formData.taskId) {
          try {
            await axios.post(
              `${API_BASE}/workflow/tasks/${formData.taskId}/complete`,
              {},
              { withCredentials: true }
            );
          } catch (taskErr) {
            console.error("Task completion failed (non-fatal):", taskErr);
          }
        }

        alert(editingCard ? "Updated Successfully!" : "Created Successfully!");
        fetchFundraisers();
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
      impactGoals: [""],
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
      documents: [],
      existingDocuments: [],
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

  const filteredCards = fundraisingCards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/cms-admin')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to CMS Panel</span>
        </button>

        <FundraisingHeader
          viewMode={viewMode}
          onAddNew={() => setViewMode("edit")}
        />

        {viewMode === "view" ? (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                  placeholder="Search campaigns by title or organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <CampaignList
              campaigns={filteredCards}
              categoryColors={categoryColors}
              imageUrl={IMAGE_URL}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <CampaignForm
            formData={formData}
            setFormData={setFormData}
            editingCard={editingCard}
            categories={categories}
            categoryColors={categoryColors}
            readyCampaigns={readyCampaigns}
            selectedCampaign={selectedCampaign}
            setSelectedCampaign={setSelectedCampaign}
            imageUrl={IMAGE_URL}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}