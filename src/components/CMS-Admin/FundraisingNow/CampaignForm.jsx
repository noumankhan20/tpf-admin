import React, { useState } from 'react';
import {
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Play,
  FileText,
  Trash2,
  ImagePlus,
  Star,
  Settings,
  Layout,
  Trophy,
  History,
  Hash,
  Smile,
  Zap,
} from 'lucide-react';
import { getMediaUrl } from '@/utils/media';
import MediaSelectorModal from './MediaSelectorModal';
import CampaignPreview from './CampaignPreview';

export default function CampaignForm({
  formData,
  setFormData,
  editingCard,
  categories,
  categoryColors,
  readyCampaigns,
  selectedCampaign,
  setSelectedCampaign,
  onSave,
  onCancel,
  isSaving,
}) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <Layout size={18} /> },
    { id: "story", label: "Story & Media", icon: <ImageIcon size={18} /> },
    { id: "donation", label: "Donation Config", icon: <Settings size={18} /> },
  ];

  const handleCampaignSelect = (campaignId) => {
    const campaign = readyCampaigns.find(c => c._id === campaignId);
    if (!campaign) {
      setSelectedCampaign(null);
      return;
    }

    setSelectedCampaign(campaign);
    setFormData(prev => ({
      ...prev,
      campaignId: campaign._id,
      title: campaign.title || "",
      organization: campaign.organization || "",
      beneficiaryName: campaign.beneficiaryName || "",
      campaignerName: campaign.campaignerName || "",
      requiredAmount: campaign.targetAmount || "",
      category: campaign.category || prev.category,
      about: campaign.about || "",
      impactGoals: campaign.impactGoals?.length ? campaign.impactGoals : [""],
      isUrgent: !!campaign.isUrgent,
      taxBenefits: !!campaign.taxBenefits,
      zakatVerified: !!campaign.zakatVerified,
      ribaEligible: !!campaign.ribaEligible,
      deadline: campaign.deadline ? campaign.deadline.split('T')[0] : "",
      taskId: campaign.taskId || "",
      selectedImageUrl: campaign.imageUrl || "",
      selectedVideoUrl: campaign.videoUrl || "",
      imagePreview: campaign.imageUrl || null,
      videoPreview: campaign.videoUrl || null,
      mediaType: campaign.mediaType || "image",
      currentStatus: campaign.currentStatus || "",
      imageGallery: campaign.imageGallery || [],
      images: [],
      unitConfig: campaign.unitConfig || prev.unitConfig,
    }));
  };

  const handleMediaSelect = (file) => {
    const isVideo = file.type === "video";
    const url = file.url;

    if (isVideo) {
      setFormData(prev => ({
        ...prev,
        mediaType: "video",
        selectedImageUrl: "",
        selectedVideoUrl: url,
        imagePreview: null,
        videoPreview: url,
        isExistingVideo: true,
        imageGallery: [],
        images: [],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        mediaType: "image",
        selectedImageUrl: url,
        imagePreview: url,
        isExistingImage: true,
        imageGallery: prev.imageGallery.includes(url) ? prev.imageGallery : [...prev.imageGallery, url],
      }));
    }
    setShowMediaModal(false);
  };

  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    setFormData((prev) => ({
      ...prev,
      mediaType: "image",
      images: [...prev.images, ...imageFiles],
      imagePreview: prev.imagePreview || URL.createObjectURL(imageFiles[0]),
      selectedImageUrl: prev.selectedImageUrl || "",
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        mediaType: "video",
        video: file,
        videoPreview: reader.result,
        isExistingVideo: false,
        selectedVideoUrl: "",
        imageGallery: [],
        images: [],
        imagePreview: null,
        selectedImageUrl: "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeDocument = (index, isExisting) => {
    if (isExisting) {
      setFormData((prev) => ({
        ...prev,
        existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index),
      }));
    }
  };

  const removeImage = (index, isFromGallery) => {
    if (isFromGallery) {
      const updatedGallery = formData.imageGallery.filter((_, i) => i !== index);

      setFormData((prev) => ({
        ...prev,
        imageGallery: updatedGallery,
        imageGalleryChanged: true,
        selectedImageUrl:
          prev.selectedImageUrl === prev.imageGallery[index]
            ? updatedGallery[0] || ""
            : prev.selectedImageUrl,
        imagePreview:
          prev.selectedImageUrl === prev.imageGallery[index]
            ? updatedGallery[0] || null
            : prev.imagePreview,
      }));
    } else {
      // 🔥 FIX FOR UPLOADED IMAGES
      const updatedImages = formData.images.filter((_, i) => i !== index);

      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
        imagePreview:
          updatedImages.length > 0
            ? URL.createObjectURL(updatedImages[0])
            : null,
      }));
    }
  };


  const setPrimaryImage = (url) => {
    setFormData((prev) => ({
      ...prev,
      selectedImageUrl: url,
      imagePreview: url,
      // 🚫 DO NOT touch imageGallery here
    }));
  };


  const getImageUrl = (preview, isExisting) => {
    if (!preview) return null;
    if (isExisting) {
      if (preview.startsWith("data:")) return preview;
      return getMediaUrl(preview);
    }
    return preview;
  };

  const availableMedia = selectedCampaign?.photographySubmissions?.flatMap(sub =>
    (sub.files || []).map(file => ({ ...file, submissionType: sub.submissionType || 'RAW' }))
  ) || [];

  const allImages = [
    ...formData.imageGallery.map((url, i) => ({ url, isFromGallery: true, index: i })),
    ...formData.images.map((file, i) => ({ url: URL.createObjectURL(file), isFromGallery: false, index: i }))
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto" style={{ fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"' }}>
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl border-2 border-gray-100 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900">
              {editingCard ? "Refine Campaign" : "Draft New Campaign"}
            </h2>
            <p className="text-gray-500 font-medium text-xs">Configure your fundraising parameters below.</p>
          </div>

          <div className="space-y-8">
            {activeTab === "basic" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Campaign Source Selection */}
                {!editingCard && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Campaign Source <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, source: "INTERNAL", permanentType: "Other" }))}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.source !== "FOUNDATION"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Public Campaign
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            source: "FOUNDATION",
                            organization: "True Path Foundation",
                            campaignerName: "True Path Foundation",
                            beneficiaryName: "Multiple Beneficiaries",
                            permanentType: "Zakat Campaign",
                            allowedDonationTypes: ["Zakat"],
                            zakatVerified: true,
                            ribaEligible: false,
                          }));
                        }}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.source === "FOUNDATION"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        Foundation (Permanent)
                      </button>
                    </div>
                  </div>
                )}

                {/* Permanent Campaign Type Selection (Only for Foundation) */}
                {formData.source === "FOUNDATION" && (
                  <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100 mb-6">
                    <label className="block text-sm font-bold text-emerald-800 mb-2">
                      Permanent Campaign Type
                    </label>
                    <select
                      value={formData.permanentType}
                      onChange={(e) => {
                        const val = e.target.value;
                        let allowed = [];
                        let zakat = false;
                        let riba = false;
                        if (val === "Zakat Campaign") {
                          allowed = ["Zakat"];
                          zakat = true;
                        } else if (val === "Bank Interest (Riba)") {
                          allowed = ["Riba"];
                          riba = true;
                        } else if (val === "Emergency Funds") {
                          allowed = ["Sadaqah", "Lillah", "Riba", "Imdad"];
                          ribaEligible = true;
                        }

                        setFormData(prev => ({
                          ...prev,
                          permanentType: val,
                          allowedDonationTypes: allowed,
                          zakatVerified: zakat,
                          ribaEligible: riba,
                          title: val,
                        }));
                      }}
                      className="w-full px-4 py-2 bg-white border-2 border-emerald-200 rounded-lg focus:border-emerald-500 outline-none font-semibold text-emerald-900"
                    >
                      <option value="Zakat Campaign">Zakat Campaign</option>
                      <option value="Bank Interest (Riba)">Bank Interest (Riba)</option>
                      <option value="Emergency Funds">Emergency Funds</option>
                    </select>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.allowedDonationTypes.map(type => (
                        <span key={type} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold uppercase">
                          Accepts: {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaign Selector */}
                {!editingCard && formData.source !== "FOUNDATION" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select Existing Campaign <span className="text-red-500">(optional for inhouse campaigns)</span>
                    </label>
                    <select
                      value={formData.campaignId}
                      onChange={(e) => handleCampaignSelect(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-sans"
                    >
                      <option value="">Select a campaign...</option>
                      {readyCampaigns.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title} ({c.beneficiaryName})
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-600">
                      • Select a campaign if it came via photography/workflow
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                      • Leave empty to create an in-house campaign
                    </p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter campaign title..."
                    disabled={formData.source === "FOUNDATION"}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all disabled:bg-gray-50 font-medium"
                  />
                </div>

                {/* Organization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Organization..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Campaigner Name
                    </label>
                    <input
                      type="text"
                      value={formData.campaignerName}
                      onChange={(e) => setFormData({ ...formData, campaignerName: e.target.value })}
                      placeholder="Name..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Category & Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-8">
                    {['isUrgent', 'taxBenefits', 'zakatVerified', 'ribaEligible'].map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData[key] ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}
                      >
                        {key.replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "story" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">About the Campaign</label>
                  <textarea
                    rows={4}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Graphics Section */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Media Assets</label>
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                      <button type="button" onClick={() => setFormData(p => ({ ...p, mediaType: 'image' }))} className={`flex-1 py-1.5 rounded-md text-xs font-bold ${formData.mediaType === 'image' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}>Images</button>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, mediaType: 'video' }))} className={`flex-1 py-1.5 rounded-md text-xs font-bold ${formData.mediaType === 'video' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}>Video</button>
                    </div>

                    {formData.mediaType === 'image' ? (
                      <div className="grid grid-cols-3 gap-2">
                        {allImages.map((img, i) => (
                          <div key={i} className="aspect-square relative group">
                            <img src={img.isFromGallery ? getImageUrl(img.url, true) : img.url} className={`w-full h-full object-cover rounded-lg border-2 ${formData.selectedImageUrl === img.url ? 'border-emerald-500' : 'border-transparent'}`} />
                            <button onClick={() => removeImage(img.index, img.isFromGallery)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                          </div>
                        ))}
                        <button onClick={() => setShowMediaModal(true)} className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"><ImagePlus size={20} /></button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {formData.videoPreview ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <video src={getImageUrl(formData.videoPreview, formData.isExistingVideo)} className="w-full h-full object-cover" />
                            <button onClick={() => setFormData(p => ({ ...p, video: null, videoPreview: null }))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setShowMediaModal(true)} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 font-bold text-xs uppercase underline">Link Video Resource</button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* External Links */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Digital Footprint</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['instagram', 'youtube', 'facebook', 'twitter'].map(p => (
                        <input
                          key={p}
                          type="url"
                          placeholder={p}
                          value={formData.socialLinks?.[p] || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [p]: e.target.value } }))}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:border-emerald-500 outline-none"
                        />
                      ))}
                    </div>
                    <div className="pt-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Status Feed</label>
                      <textarea value={formData.currentStatus} onChange={(e) => setFormData(p => ({ ...p, currentStatus: e.target.value }))} className="w-full p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-xs font-medium focus:border-emerald-400 outline-none" rows={2} placeholder="Quick update..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "donation" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/50 p-6 rounded-3xl border-2 border-emerald-100">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Campaign Goal (₹)</label>
                    <input
                      type="number"
                      value={formData.requiredAmount}
                      onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })}
                      className="w-full px-5 py-4 bg-white border-2 border-emerald-200 rounded-2xl text-lg font-bold text-emerald-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-5 py-4 bg-white border-2 border-emerald-200 rounded-2xl font-bold text-emerald-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Zap className="text-emerald-500" size={20} /> Matrix Configuration
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Symbol</label>
                      <input type="text" value={formData.unitConfig?.emoji} onChange={e => setFormData({ ...formData, unitConfig: { ...formData.unitConfig, emoji: e.target.value } })} className="w-full p-3 border-2 border-gray-100 rounded-xl text-center text-xl" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Unit Cost (₹)</label>
                      <input
                        type="number"
                        value={formData.unitConfig?.unitCost}
                        onChange={e => {
                          const cost = parseInt(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            unitConfig: {
                              ...prev.unitConfig,
                              unitCost: cost,
                              presets: prev.unitConfig.presets.map(p => p.qty > 0 ? { ...p, amount: p.qty * cost } : p)
                            }
                          }));
                        }}
                        className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Item Name (e.g. Kit)</label>
                      <input
                        type="text"
                        placeholder="Kit"
                        value={formData.unitConfig?.itemName || formData.unitConfig?.unitName}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            unitConfig: { ...prev.unitConfig, itemName: val }
                          }));
                        }}
                        className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Automated Preset Preview */}
                  <div className="pt-4 border-t border-dashed">
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">
                      Automatic Impact Presets
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(formData.unitConfig?.presets?.length === 4 ? formData.unitConfig.presets : [1, 10, 100, 1000].map(q => ({ qty: q }))).map((preset, i) => {
                        const qty = preset.qty || 0;
                        const cost = formData.unitConfig?.unitCost || 0;
                        const total = qty * cost;
                        const rawName = formData.unitConfig?.itemName || formData.unitConfig?.unitName || 'Unit';
                        const name = qty === 1 ? rawName : `${rawName}s`;
                        const label = `${qty} ${name}`;

                        return (
                          <div key={i} className="p-4 bg-white border-2 border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:border-emerald-300 transition-all">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                              Qty Box {i + 1}
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <input
                                type="number"
                                value={qty}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  setFormData(prev => {
                                    const currentPresets = prev.unitConfig?.presets?.length === 4 ? [...prev.unitConfig.presets] : [1, 10, 100, 1000].map(q => ({ qty: q }));
                                    currentPresets[i] = { ...currentPresets[i], qty: val, amount: val * (prev.unitConfig?.unitCost || 0) };
                                    return {
                                      ...prev,
                                      unitConfig: { ...prev.unitConfig, presets: currentPresets }
                                    };
                                  });
                                }}
                                className="w-16 p-1 text-center bg-gray-50 border border-gray-200 rounded-lg text-sm font-black focus:border-emerald-500 outline-none"
                              />
                            </div>
                            <div className="text-[10px] font-bold text-gray-600 mb-1 truncate w-full px-1">
                              {name}
                            </div>
                            <div className="text-xs font-black text-emerald-600">
                              ₹{total.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>


                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t flex items-center justify-between">
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-xs transition-colors"
            >
              Abandon
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all ${isSaving ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                }`}
            >
              {isSaving ? "Processing..." : "Deploy Campaign"}
            </button>
          </div>
        </div>
      </div>

      <MediaSelectorModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        media={availableMedia}
        selectedUrl={formData.selectedImageUrl || formData.selectedVideoUrl}
        onSelect={handleMediaSelect}
        onUploadNew={handleMultipleImageUpload}
      />
    </>
  );
}
