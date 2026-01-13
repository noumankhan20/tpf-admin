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
    }));
  };

  const handleMediaSelect = (file) => {
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
    setShowMediaModal(false);
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        mediaType: isVideo ? "video" : "image",
        [isVideo ? 'video' : 'image']: file,
        [isVideo ? 'videoPreview' : 'imagePreview']: reader.result,
        [isVideo ? 'isExistingVideo' : 'isExistingImage']: false,
      }));
      setShowMediaModal(false);
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

  const getImageUrl = (preview, isExisting) => {
    if (!preview) return null;
    if (isExisting) {
      if (preview.startsWith("data:")) return preview;
      return getMediaUrl(preview);
    }
    return preview;
  };

  const availableMedia = selectedCampaign?.photographySubmissions?.flatMap(sub => sub.files || []) || [];

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

              {/* Media Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Campaign Media <span className="text-red-500">*</span>
                </label>

                {formData.imagePreview || formData.videoPreview ? (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                    {formData.mediaType === "video" ? (
                      <video
                        src={getImageUrl(formData.videoPreview, formData.isExistingVideo)}
                        className="w-full h-48 object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={getImageUrl(formData.imagePreview, formData.isExistingImage)}
                        className="w-full h-48 object-cover"
                        alt="Preview"
                      />
                    )}
                    <button
                      onClick={() => setShowMediaModal(true)}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <div className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ImagePlus size={20} />
                        Change Media
                      </div>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMediaModal(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="font-semibold text-gray-900 mb-1">Select Media</p>
                    <p className="text-sm text-gray-600">
                      Choose from photography team or upload new
                    </p>
                  </button>
                )}
              </div>

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
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold transition-all shadow-sm
    ${isSaving
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white"
                    }
  `}
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
        onUploadNew={handleMediaUpload}
      />
    </>
  );
}