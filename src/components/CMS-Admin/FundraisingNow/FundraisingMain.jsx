"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  Search,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import {
  useGetFundraisersQuery,
  useCreateFundraiserMutation,
  useUpdateFundraiserMutation,
  useDeleteFundraiserMutation,
  useUpdateCampaignStatusMutation
} from "@/utils/slices/cms/fundraiserApi";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/Common/ConfirmModal";
import FundraisingHeader from "./FundraisingHeader";
import CampaignList from "./CampaignList";
import CampaignForm from "./CampaignForm";
import ReferralLinkGeneratorModal from "./ReferralLinkGeneratorModal";

export default function FundraisingCMS() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCard, setEditingCard] = useState(null);
  const [readyCampaigns, setReadyCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [linkGenOpen, setLinkGenOpen] = useState(false);
  const [linkGenCampaign, setLinkGenCampaign] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:7000/api';

  const categories = [
    "Emergency Aid",
    "Medical Aid",
    "Disaster Relief",
    "Orphans & Children",
    "Education",
    "Women Empowerment",
    "Clean Water",
    "Food Distribution",
    "Healthcare",
    "Elderly Care",
    "Animal Welfare",
    "Environment",
    "Other",
  ];


  const categoryColors = {
    "Emergency Aid": "bg-red-100 text-red-800",
    "Medical Aid": "bg-blue-100 text-blue-800",
    Orphans: "bg-purple-100 text-purple-800",
    Education: "bg-amber-100 text-amber-800",
    "Clean Water": "bg-cyan-100 text-cyan-800",
    "Construction": "bg-amber-100 text-amber-800",
  };

  const [formData, setFormData] = useState({
    category: "Emergency Aid",
    customCategory: "",
    source: "INTERNAL",
    permanentType: "Other", // Zakat Campaign, Bank Interest (Riba), Emergency Funds
    fundsDisbursed: 0,
    allowedDonationTypes: [],
    isUrgent: false,
    taxBenefits: false,
    zakatVerified: false,
    ribaEligible: false,
    sadaqahEligible: true,
    lillahEligible: true,
    imdadEligible: true,
    title: "",
    organization: "",
    beneficiaryName: "",
    campaignerName: "",
    about: "",
    impactGoals: [""],
    requiredAmount: "",
    deadline: "",
    mediaType: "image",
    images: [],
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
    currentStatus: "",
    imageGallery: [],
    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      twitter: "",
      linkedin: "",
      other: "",
    },
    unitConfig: {
      itemName: "Kit",
      unitCost: 1000,
      emoji: "📦",
      presets: [],
      configType: "fixed",
      fixedPresets: [50, 100, 200, 500, 1000]
    },
  });

  const {
    data: fundraisersResponse,
    isLoading: isFundraisersLoading,
    isError: isFundraisersError,
  } = useGetFundraisersQuery({ page: currentPage, limit: 10 });
  const [createFundraiser, { isLoading: isCreating }] =
    useCreateFundraiserMutation();

  const [updateFundraiser, { isLoading: isUpdating }] =
    useUpdateFundraiserMutation();

  const isSaving = isCreating || isUpdating;

  const [deleteFundraiser] = useDeleteFundraiserMutation();
  const [updateCampaignStatus] = useUpdateCampaignStatusMutation();

  const fundraisingCards = fundraisersResponse?.data || [];

  useEffect(() => {
    fetchReadyCampaigns();
  }, []);

  const fetchReadyCampaigns = async () => {
    try {
      const res = await axios.get(`${API_BASE}/campaigns/ready?taskType=CREATE_CAMPAIGN`, { withCredentials: true });
      if (res.data.success) {
        setReadyCampaigns(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ready campaigns:", err);
    }
  };

  const fetchCampaignByFundraiser = async (fundraiserId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/campaigns/by-fundraiser/${fundraiserId}`,
        { withCredentials: true }
      );

      return res.data?.data || null;
    } catch (err) {
      console.error("Failed to fetch campaign:", err);
      return null;
    }
  };


  const handleEdit = async (card) => {
    setEditingCard(card);
    const campaign = await fetchCampaignByFundraiser(card._id);

    // ✅ TAKE LATEST SOCIAL MEDIA SUBMISSION
    const latestSocialLinks =
      campaign?.socialMediaSubmissions?.length
        ? campaign.socialMediaSubmissions[
          campaign.socialMediaSubmissions.length - 1
        ].links
        : {
          instagram: "",
          facebook: "",
          youtube: "",
          twitter: "",
          linkedin: "",
          other: "",
        };

    setFormData({
      category: card.category,
      customCategory: card.customCategory || "",
      source: card.source || "INTERNAL",
      fundsDisbursed: card.fundsDisbursed || 0,
      allowedDonationTypes: card.allowedDonationTypes || [],
      isUrgent: card.isUrgent,
      taxBenefits: card.taxBenefits,
      zakatVerified: card.zakatVerified,
      ribaEligible: card.ribaEligible,
      sadaqahEligible: card.sadaqahEligible ?? true,
      lillahEligible: card.lillahEligible ?? true,
      imdadEligible: card.imdadEligible ?? true,
      title: card.title,
      organization: card.organization,
      beneficiaryName: card.beneficiaryName || campaign?.beneficiaryName || "",
      campaignerName: card.campaignerName || campaign?.campaignerName || "",
      about: card.about || "",
      impactGoals: card.impactGoals?.length ? card.impactGoals : [""],
      requiredAmount: card.requiredAmount,
      deadline: card.deadline?.split("T")[0],
      mediaType: card.mediaType || "image",
      images: [],
      imagePreview: card.imageUrl,
      video: null,
      videoPreview: card.videoUrl,
      currentAmount: card.currentAmount,
      totalDonors: card.totalDonors,
      isExistingImage: !!card.imageUrl,
      isExistingVideo: !!card.videoUrl,
      existingDocuments: card.documents || [],
      documents: [],
      currentStatus: "", // Keep this empty for new input
      statusHistory: card.statusHistory || [], // ✅ Load existing history
      selectedImageUrl: card.imageUrl || "",
      selectedVideoUrl: card.videoUrl || "",
      imageGallery: card.imageGallery || [],
      socialLinks: latestSocialLinks,
      unitConfig: {
        itemName: card.unitConfig?.itemName || card.unitConfig?.unitName || "Kit",
        unitCost: card.unitConfig?.unitCost || 1000,
        emoji: card.unitConfig?.emoji || "📦",
        presets: card.unitConfig?.presets || [],
        configType: card.unitConfig?.configType || "fixed",
        fixedPresets: card.unitConfig?.fixedPresets || [50, 100, 200, 500, 1000]
      },
    });
    setViewMode("edit");
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFundraiser(deleteId).unwrap();
      toast.success("Campaign deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete campaign");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };
  const finalCategory =
    formData.category === "Other" && formData.customCategory.trim()
      ? formData.customCategory.trim()
      : formData.category;



  const handleSave = async () => {
    try {
      const form = new FormData();
      console.log("🚀 FORM DATA BEFORE SAVE:");
      console.log("currentStatus:", formData.currentStatus);
      console.log("formData:", formData);
      form.append("title", formData.title);
      form.append("organization", formData.organization);
      form.append("category", finalCategory);
      form.append("source", formData.source);
      form.append("fundsDisbursed", formData.fundsDisbursed);
      let allowedTypes = formData.allowedDonationTypes;
      if (formData.source !== "FOUNDATION") {
        allowedTypes = [];
        if (formData.zakatVerified) allowedTypes.push("Zakat");
        if (formData.sadaqahEligible) allowedTypes.push("Sadaqah");
        if (formData.lillahEligible) allowedTypes.push("Lillah");
        if (formData.imdadEligible) allowedTypes.push("Imdad");
        if (formData.ribaEligible) allowedTypes.push("Riba");
      }
      form.append("allowedDonationTypes", JSON.stringify(allowedTypes));

      if (formData.source !== "FOUNDATION") {
        form.append("requiredAmount", formData.requiredAmount);
        form.append("deadline", formData.deadline);
      }
      form.append("mediaType", formData.mediaType);
      form.append("isUrgent", formData.isUrgent);
      form.append("taxBenefits", formData.taxBenefits);
      form.append("zakatVerified", formData.zakatVerified);
      form.append("ribaEligible", formData.ribaEligible);
      form.append("sadaqahEligible", formData.sadaqahEligible);
      form.append("lillahEligible", formData.lillahEligible);
      form.append("imdadEligible", formData.imdadEligible);
      form.append("beneficiaryName", formData.beneficiaryName);
      form.append("campaignerName", formData.campaignerName);
      form.append("about", formData.about);
      if (formData.statusHistory && formData.statusHistory.length > 0) {
        form.append("statusHistory", JSON.stringify(formData.statusHistory));
      }
      if (formData.socialLinks) {
        form.append("socialLinks", JSON.stringify(formData.socialLinks));
      }

      formData.documents.forEach((file) => {
        form.append("documents", file);
      });

      form.append("impactGoals", JSON.stringify(
        formData.impactGoals.filter(g => g.trim() !== "")
      ));

      const rawItemName = formData.unitConfig.itemName || "Unit";
      let finalPresets = [];

      if (formData.unitConfig.configType === "fixed") {
        const amounts = formData.unitConfig.fixedPresets || [50, 100, 200, 500, 1000];
        finalPresets = [
          ...amounts.map(amt => ({ amount: amt, label: `₹${amt.toLocaleString()}`, sublabel: null, qty: 0 })),
        ];
      } else {
        const impactPresets = (formData.unitConfig.presets && formData.unitConfig.presets.length > 0)
          ? formData.unitConfig.presets.map(p => {
            const name = p.qty === 1 ? rawItemName : `${rawItemName}s`;
            const finalAmount = p.amount !== undefined ? p.amount : (p.qty * (formData.unitConfig.unitCost || 0));
            return {
              ...p,
              amount: finalAmount,
              label: `${p.qty} ${name}`,
              sublabel: `₹${finalAmount.toLocaleString()}`
            };
          })
          : [1, 10, 100, 1000].map(qty => {
            const name = qty === 1 ? rawItemName : `${rawItemName}s`;
            const amt = qty * (formData.unitConfig.unitCost || 0);
            return {
              qty,
              amount: amt,
              label: `${qty} ${name}`,
              sublabel: `₹${amt.toLocaleString()}`
            };
          });

        finalPresets = [
          { amount: 50, label: "₹50", sublabel: "Gift", qty: 0 },
          { amount: 100, label: "₹100", sublabel: "Gift", qty: 0 },
          ...impactPresets
        ];
      }

      form.append("unitConfig", JSON.stringify({
        ...formData.unitConfig,
        presets: finalPresets
      }));

      if (formData.mediaType === "image") {
        formData.images.forEach((file) => {
          form.append("image", file);
        });
      }

      if (editingCard) {
        form.append("imageGallery", JSON.stringify(formData.imageGallery));
        form.append("existingDocuments", JSON.stringify(formData.existingDocuments));
      }

      if (formData.mediaType === "video" && formData.video instanceof File) {
        form.append("video", formData.video);
      }

      form.append("campaignId", formData.campaignId);
      if (formData.selectedImageUrl) form.append("selectedImageUrl", formData.selectedImageUrl);
      if (formData.selectedVideoUrl) form.append("selectedVideoUrl", formData.selectedVideoUrl);

      if (editingCard) {
        await updateFundraiser({
          id: editingCard._id,
          formData: form,
        }).unwrap();
      } else {
        await createFundraiser(form).unwrap();
      }

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
      console.log("📦 Sending currentStatus:", formData.currentStatus);
      toast.success(editingCard ? "Updated Successfully!" : "Created Successfully!");
      resetForm();
      setEditingCard(null);
      setViewMode("view");
    } catch (error) {
      console.error("Save Fundraiser Error:", error);
      toast.error("Something went wrong while saving.");
    }
  };

  const resetForm = () => {
    setFormData({
      category: "Emergency Aid",
      customCategory: "",
      isUrgent: false,
      taxBenefits: false,
      zakatVerified: false,
      ribaEligible: false,
      title: "",
      organization: "",
      beneficiaryName: "",
      campaignerName: "",
      about: "",
      impactGoals: [""],
      requiredAmount: "",
      deadline: "",
      mediaType: "image",
      images: [],
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
      currentStatus: "",
      statusHistory: [],
      imageGallery: [],
      socialLinks: {
        instagram: "",
        facebook: "",
        youtube: "",
        twitter: "",
        linkedin: "",
        other: "",
      },
      unitConfig: {
        itemName: "Kit",
        unitCost: 1000,
        emoji: "📦",
        presets: [],
        configType: "fixed",
        fixedPresets: [50, 100, 200, 500, 1000]
      },
    });
    setSelectedCampaign(null);
  };

  const handleInactive = async (id) => {
    try {
      await updateCampaignStatus({
        id,
        action: "inactive",
      }).unwrap();
      toast.success("Campaign marked as inactive");
    } catch (err) {
      console.error(err);
      const errorMessage = err?.data?.message || "Failed to update campaign";
      toast.error(errorMessage);
    }
  };
  const handleComplete = async (id) => {
    try {
      await updateCampaignStatus({
        id,
        action: "complete",
      }).unwrap();
      toast.success("Campaign marked as complete");
    } catch (err) {
      console.error(err);
      const errorMessage = err?.data?.message || "Failed to update campaign";
      toast.error(errorMessage);
    }
  };
  const handleActive = async (id) => {
  try {
    await updateCampaignStatus({
      id,
      action: "active",
    }).unwrap();

    toast.success("Campaign activated successfully");
  } catch (err) {
    console.error(err);
    const errorMessage = err?.data?.message || "Failed to update campaign";
    toast.error(errorMessage);
  }
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

  if (isFundraisersLoading) {
    return <div className="p-6">Loading fundraisers...</div>;
  }

  if (isFundraisersError) {
    return <div className="p-6 text-red-600">Failed to load fundraisers</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <ConfirmModal
          isOpen={isDeleting}
          onClose={() => setIsDeleting(false)}
          onConfirm={confirmDelete}
          title="Delete Fundraising Campaign"
          message="Are you sure you want to permanently delete this fundraising campaign? This action cannot be undone."
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
              imageUrl={undefined}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkInactive={handleInactive}
              onMarkComplete={handleComplete}
              onMarkActive={handleActive}
              onGenerateLink={(card) => {
                setLinkGenCampaign(card);
                setLinkGenOpen(true);
              }}
              pagination={fundraisersResponse?.pagination}
              onPageChange={setCurrentPage}
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
            imageUrl={undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        )}

        <ReferralLinkGeneratorModal
          isOpen={linkGenOpen}
          onClose={() => {
            setLinkGenOpen(false);
            setLinkGenCampaign(null);
          }}
          campaignSlug={linkGenCampaign?.campaignId?.slug || linkGenCampaign?.slug}
          campaignTitle={linkGenCampaign?.title}
        />
      </div>
    </div>
  );
}