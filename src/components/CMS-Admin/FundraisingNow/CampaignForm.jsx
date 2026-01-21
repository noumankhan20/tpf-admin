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

        // ✅ FIX: use updatedGallery (not prev.imageGallery)
        selectedImageUrl:
          prev.selectedImageUrl === prev.imageGallery[index]
            ? updatedGallery[0] || ""
            : prev.selectedImageUrl,

        imagePreview:
          prev.selectedImageUrl === prev.imageGallery[index]
            ? updatedGallery[0] || null
            : prev.imagePreview,
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
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCard ? "Edit Campaign" : "Create New Campaign"}
            </h2>

            <div className="space-y-6">
              {/* Campaign Selector */}
              {!editingCard && (
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

              {/* Media Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Media Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mediaType: "image" }))}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.mediaType === "image"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    <ImageIcon size={20} className="inline mr-2" />
                    Images
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mediaType: "video" }))}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.mediaType === "video"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    <Play size={20} className="inline mr-2" />
                    Video
                  </button>
                </div>
              </div>

              {/* Media Upload */}
              {formData.mediaType === "image" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Campaign Images <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-3">
                    {/* Upload Button */}
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleMultipleImageUpload}
                      />
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Upload Images</p>
                      <p className="text-xs text-gray-600">Select multiple images</p>
                    </label>

                    {/* Select from Photography */}
                    <button
                      type="button"
                      onClick={() => setShowMediaModal(true)}
                      className="w-full border-2 border-gray-300 rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                    >
                      <ImagePlus size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Select from Photography Team</p>
                    </button>

                    {/* Image Gallery */}
                    {allImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {allImages.map((img) => {
                          const displayUrl = img.isFromGallery ? getImageUrl(img.url, true) : img.url;
                          const isPrimary = formData.imagePreview === (img.isFromGallery ? getImageUrl(img.url, true) : img.url) ||
                            formData.selectedImageUrl === img.url;

                          return (
                            <div key={`${img.isFromGallery}-${img.index}`} className="relative group">
                              <img
                                src={displayUrl}
                                className={`w-full h-32 object-cover rounded-lg border-2 ${isPrimary ? "border-emerald-500" : "border-gray-200"
                                  }`}
                                alt="Campaign"
                              />
                              {isPrimary && (
                                <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                  <Star size={12} fill="white" />
                                  Primary
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryImage(img.isFromGallery ? img.url : displayUrl, img.isFromGallery)}
                                    className="bg-white text-gray-900 px-3 py-1.5 rounded text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors"
                                  >
                                    Set Primary
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeImage(img.index, img.isFromGallery)}
                                  className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Campaign Video <span className="text-red-500">*</span>
                  </label>

                  {formData.videoPreview ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                      <video
                        src={getImageUrl(formData.videoPreview, formData.isExistingVideo)}
                        className="w-full h-48 object-cover"
                        controls
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, video: null, videoPreview: null, selectedVideoUrl: "" }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 block text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Upload Video</p>
                        <p className="text-xs text-gray-600">MP4, MOV, etc.</p>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowMediaModal(true)}
                        className="w-full border-2 border-gray-300 rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                      >
                        <Play size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Select from Photography Team</p>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Badges */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Campaign Badges
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'isUrgent', label: 'Mark as Urgent' },
                    { key: 'taxBenefits', label: 'Tax Benefits Available' },
                    { key: 'zakatVerified', label: 'Zakat Verified' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter campaign title..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Enter organization name..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              {/* Beneficiary Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  placeholder="Enter beneficiary name..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Campaigner Name
                </label>
                <input
                  type="text"
                  value={formData.campaignerName}
                  onChange={(e) => setFormData({ ...formData, campaignerName: e.target.value })}
                  placeholder="Enter campaigner name..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              {/* About Campaign */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  About Campaign
                </label>
                <textarea
                  rows={5}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Describe the campaign in detail..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Status
                </label>
                <textarea
                  rows={3}
                  value={formData.currentStatus}
                  onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                  placeholder="Describe the current status of the campaign..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Impact Goals */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Impact Goals
                </label>
                <div className="space-y-3">
                  {formData.impactGoals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => {
                          const updated = [...formData.impactGoals];
                          updated[index] = e.target.value;
                          setFormData({ ...formData, impactGoals: updated });
                        }}
                        placeholder="e.g., 5,000+ families with clean water"
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                      />
                      {formData.impactGoals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.impactGoals.filter((_, i) => i !== index);
                            setFormData({ ...formData, impactGoals: updated });
                          }}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, impactGoals: [...formData.impactGoals, ""] })}
                  className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  + Add Impact Goal
                </button>
              </div>

              {/* Required Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Required Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.requiredAmount}
                  onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })}
                  placeholder="50000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Campaign Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Supporting Documents
                </label>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 block text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                  <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Upload Documents</p>
                  <p className="text-xs text-gray-600">PDF, DOC, Images</p>
                </label>

                {/* Document Lists */}
                {formData.existingDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Existing Documents</p>
                    {formData.existingDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                        <button
                          onClick={() => removeDocument(index, true)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">New Documents</p>
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          onClick={() => removeDocument(index, false)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold transition-all shadow-sm ${isSaving
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white"
                    }`}
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      {editingCard ? "Updating Campaign..." : "Creating Campaign..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Campaign
                    </>
                  )}
                </button>

                <button
                  onClick={onCancel}
                  className="px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-8 h-fit">
          <CampaignPreview
            formData={formData}
            categoryColors={categoryColors}
            getImageUrl={getImageUrl}
          />
        </div>
      </div>

      {/* Media Selector Modal */}
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