import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deep-equal check for dirty detection.
 * Uses JSON serialisation — sufficient for plain form data objects.
 */
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Normalise unitConfig before sending to the backend.
 * - Maps itemName → unitName
 * - Strips qty === 0 presets in unit mode
 * - Ensures sublabel is always set
 * - Always includes configType
 */
function normaliseUnitConfigBeforeSave(unitConfig) {
  if (!unitConfig) return unitConfig;
  const uc = { ...unitConfig };

  if (!uc.unitName && uc.itemName) uc.unitName = uc.itemName;
  if (!uc.unitNamePlural && uc.unitName) uc.unitNamePlural = uc.unitName + 's';

  if (uc.configType === 'unit') {
    uc.presets = (uc.presets || [])
      .filter((p) => Number(p.qty) > 0)
      .map((p) => ({
        ...p,
        sublabel: p.sublabel || `₹${(p.amount || 0).toLocaleString('en-IN')}`,
      }));
  }

  return uc;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

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
  const [activeTab, setActiveTab] = useState('basic');

  // ── Dirty-state tracking ──────────────────────────────────────────────────
  // Capture the initial formData snapshot when the form first mounts (or when
  // editingCard changes). Deploy is only enabled when something has changed.
  const initialDataRef = useRef(null);

  useEffect(() => {
    // Reset snapshot whenever we switch to a new card / blank form
    initialDataRef.current = JSON.parse(JSON.stringify(formData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCard]);

  const isDirty = useMemo(() => {
    if (!initialDataRef.current) return true; // first render before ref is set
    return !deepEqual(formData, initialDataRef.current);
  }, [formData]);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <Layout size={18} /> },
    { id: 'story', label: 'Story & Media', icon: <ImageIcon size={18} /> },
    { id: 'donation', label: 'Donation Config', icon: <Settings size={18} /> },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCampaignSelect = (campaignId) => {
    const campaign = readyCampaigns.find((c) => c._id === campaignId);
    if (!campaign) {
      setSelectedCampaign(null);
      return;
    }
    setSelectedCampaign(campaign);
    const next = {
      ...formData,
      campaignId: campaign._id,
      title: campaign.title || '',
      organization: campaign.organization || '',
      beneficiaryName: campaign.beneficiaryName || '',
      campaignerName: campaign.campaignerName || '',
      requiredAmount: campaign.targetAmount || '',
      category: campaign.category || formData.category,
      about: campaign.about || '',
      impactGoals: campaign.impactGoals?.length ? campaign.impactGoals : [''],
      isUrgent: !!campaign.isUrgent,
      taxBenefits: !!campaign.taxBenefits,
      zakatVerified: !!campaign.zakatVerified,
      ribaEligible: !!campaign.ribaEligible,
      deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '',
      taskId: campaign.taskId || '',
      selectedImageUrl: campaign.imageUrl || '',
      selectedVideoUrl: campaign.videoUrl || '',
      imagePreview: campaign.imageUrl || null,
      videoPreview: campaign.videoUrl || null,
      mediaType: campaign.mediaType || 'image',
      currentStatus: campaign.currentStatus || '',
      imageGallery: campaign.imageGallery || [],
      images: [],
      existingDocuments: campaign.documents || [],
      documents: [],
      unitConfig: campaign.unitConfig || formData.unitConfig,
    };
    setFormData(next);
    // Update snapshot so selecting a campaign doesn't immediately mark dirty
    initialDataRef.current = JSON.parse(JSON.stringify(next));
  };

  const handleMediaSelect = (file) => {
    const isVideo = file.type === 'video';
    const url = file.url;
    if (isVideo) {
      setFormData((prev) => ({
        ...prev,
        mediaType: 'video',
        selectedImageUrl: '',
        selectedVideoUrl: url,
        imagePreview: null,
        videoPreview: url,
        isExistingVideo: true,
        imageGallery: [],
        images: [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        mediaType: 'image',
        selectedImageUrl: url,
        imagePreview: url,
        isExistingImage: true,
        imageGallery: prev.imageGallery.includes(url)
          ? prev.imageGallery
          : [...prev.imageGallery, url],
      }));
    }
    setShowMediaModal(false);
  };

  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setFormData((prev) => ({
      ...prev,
      mediaType: 'image',
      images: [...prev.images, ...files],
      imagePreview: prev.imagePreview || URL.createObjectURL(files[0]),
      selectedImageUrl: prev.selectedImageUrl || '',
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        mediaType: 'video',
        video: file,
        videoPreview: reader.result,
        isExistingVideo: false,
        selectedVideoUrl: '',
        imageGallery: [],
        images: [],
        imagePreview: null,
        selectedImageUrl: '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...files] }));
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
            ? updatedGallery[0] || ''
            : prev.selectedImageUrl,
        imagePreview:
          prev.selectedImageUrl === prev.imageGallery[index]
            ? updatedGallery[0] || null
            : prev.imagePreview,
      }));
    } else {
      const updatedImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
        imagePreview: updatedImages.length > 0 ? URL.createObjectURL(updatedImages[0]) : null,
      }));
    }
  };

  const setPrimaryImage = (url) => {
    setFormData((prev) => ({ ...prev, selectedImageUrl: url, imagePreview: url }));
  };

  const getImageUrl = (preview, isExisting) => {
    if (!preview) return null;
    if (isExisting) {
      if (preview.startsWith('data:')) return preview;
      return getMediaUrl(preview);
    }
    return preview;
  };

  // ── Wrapped onSave — normalise unitConfig first ───────────────────────────
  const handleSave = () => {
    if (!isDirty || isSaving) return;
    // Normalise unitConfig in-place before the parent's onSave fires
    setFormData((prev) => ({
      ...prev,
      unitConfig: normaliseUnitConfigBeforeSave(prev.unitConfig),
    }));
    // Use a microtask so state update flushes before onSave reads formData
    setTimeout(() => onSave(), 0);
  };

  // ── unitConfig helpers ────────────────────────────────────────────────────

  const uc = formData.unitConfig || {};
  const isUnitMode = uc.configType !== 'fixed';

  /**
   * Returns the 4 kit presets currently in the form, seeding defaults if needed.
   */
  const getKitPresets = () => {
    const existing = (uc.presets || []).filter((p) => Number(p.qty) > 0);
    if (existing.length === 4) return existing;
    const cost = Number(uc.unitCost) || 0;
    const name = uc.unitName || uc.itemName || 'Unit';
    const namePl = uc.unitNamePlural || name + 's';
    return [1, 10, 100, 1000].map((qty) => {
      // Prefer existing preset at that position if available
      const match = existing.find((p) => Number(p.qty) === qty);
      if (match) return match;
      const amount = qty * cost;
      return {
        qty,
        amount,
        label: `${qty} ${qty === 1 ? name : namePl}`,
        sublabel: `₹${amount.toLocaleString('en-IN')}`,
      };
    });
  };

  const updateKitPreset = (index, patch) => {
    setFormData((prev) => {
      const prevUc = prev.unitConfig || {};
      const cost = Number(prevUc.unitCost) || 0;
      const name = prevUc.unitName || prevUc.itemName || 'Unit';
      const namePl = prevUc.unitNamePlural || name + 's';
      const existing = (prevUc.presets || []).filter((p) => Number(p.qty) > 0);
      const base =
        existing.length === 4
          ? existing
          : [1, 10, 100, 1000].map((qty) => {
            const m = existing.find((p) => Number(p.qty) === qty);
            if (m) return m;
            const amount = qty * cost;
            return { qty, amount, label: `${qty} ${qty === 1 ? name : namePl}`, sublabel: `₹${amount.toLocaleString('en-IN')}` };
          });

      const updated = base.map((p, i) => {
        if (i !== index) return p;
        const merged = { ...p, ...patch };
        // Auto-recompute label/sublabel after qty or amount change
        const qty = Number(merged.qty);
        const amount = Number(merged.amount);
        return {
          ...merged,
          label: `${qty} ${qty === 1 ? name : namePl}`,
          sublabel: `₹${amount.toLocaleString('en-IN')}`,
        };
      });

      return { ...prev, unitConfig: { ...prevUc, presets: updated } };
    });
  };

  // ── Misc ──────────────────────────────────────────────────────────────────

  const availableMedia =
    selectedCampaign?.photographySubmissions?.flatMap((sub) =>
      (sub.files || []).map((file) => ({
        ...file,
        submissionType: sub.submissionType || 'RAW',
      }))
    ) || [];

  const allImages = [
    ...formData.imageGallery.map((url, i) => ({ url, isFromGallery: true, index: i })),
    ...formData.images.map((file, i) => ({
      url: URL.createObjectURL(file),
      isFromGallery: false,
      index: i,
    })),
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="max-w-4xl mx-auto antialiased text-gray-900"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl border-2 border-gray-100 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingCard ? 'Refine Campaign' : 'Draft New Campaign'}
            </h2>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-tight">
              Configure your fundraising parameters below.
            </p>
          </div>

          <div className="space-y-8">
            {/* ══════════════════════════════════════════════════════════════
                TAB 1 — Basic Info
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Campaign Source */}
                {!editingCard && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Campaign Source <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            source: 'INTERNAL',
                            permanentType: 'Other',
                          }))
                        }
                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.source !== 'FOUNDATION'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Public Campaign
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            source: 'FOUNDATION',
                            organization: 'True Path Foundation',
                            campaignerName: 'True Path Foundation',
                            beneficiaryName: 'Multiple Beneficiaries',
                            permanentType: 'Zakat Campaign',
                            allowedDonationTypes: ['Zakat'],
                            zakatVerified: true,
                            ribaEligible: false,
                          }))
                        }
                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${formData.source === 'FOUNDATION'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Foundation (Permanent)
                      </button>
                    </div>
                  </div>
                )}

                {/* Permanent Campaign Type */}
                {formData.source === 'FOUNDATION' && (
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
                        if (val === 'Zakat Campaign') { allowed = ['Zakat']; zakat = true; }
                        else if (val === 'Bank Interest (Riba)') { allowed = ['Riba']; riba = true; }
                        else if (val === 'Emergency Funds') { allowed = ['Sadaqah', 'Lillah', 'Riba', 'Imdad']; riba = true; }
                        setFormData((prev) => ({
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
                      {formData.allowedDonationTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold uppercase"
                        >
                          Accepts: {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaign Selector */}
                {!editingCard && formData.source !== 'FOUNDATION' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select Existing Campaign{' '}
                      <span className="text-red-500">(optional for inhouse campaigns)</span>
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
                    disabled={formData.source === 'FOUNDATION'}
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
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Category
                    </label>
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
                    {['isUrgent', 'taxBenefits', 'zakatVerified', 'ribaEligible', 'sadaqahEligible', 'lillahEligible', 'imdadEligible'].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border-2 transition-all ${formData[key]
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                            : 'bg-white border-gray-100 text-gray-400 opacity-60'
                          }`}
                      >
                        {key.replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 2 — Story & Media
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'story' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Story/Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Media */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Media Assets
                    </label>
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, mediaType: 'image' }))}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold ${formData.mediaType === 'image'
                            ? 'bg-white shadow-sm text-emerald-600'
                            : 'text-gray-500'
                          }`}
                      >
                        Images
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, mediaType: 'video' }))}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold ${formData.mediaType === 'video'
                            ? 'bg-white shadow-sm text-emerald-600'
                            : 'text-gray-500'
                          }`}
                      >
                        Video
                      </button>
                    </div>

                    {formData.mediaType === 'image' ? (
                      <div className="grid grid-cols-3 gap-2">
                        {allImages.map((img, i) => (
                          <div key={i} className="aspect-square relative group">
                            <img
                              src={img.isFromGallery ? getImageUrl(img.url, true) : img.url}
                              className={`w-full h-full object-cover rounded-lg border-2 ${formData.selectedImageUrl === img.url
                                  ? 'border-emerald-500'
                                  : 'border-transparent'
                                }`}
                              alt=""
                            />
                            <button
                              onClick={() => removeImage(img.index, img.isFromGallery)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setShowMediaModal(true)}
                          className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                        >
                          <ImagePlus size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {formData.videoPreview ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <video
                              src={getImageUrl(formData.videoPreview, formData.isExistingVideo)}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() =>
                                setFormData((p) => ({ ...p, video: null, videoPreview: null }))
                              }
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowMediaModal(true)}
                            className="w-full py-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 font-bold text-xs uppercase underline"
                          >
                            Link Video Resource
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* External Links + Status */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Digital Footprint
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['instagram', 'youtube', 'facebook', 'twitter'].map((p) => (
                        <input
                          key={p}
                          type="url"
                          placeholder={p}
                          value={formData.socialLinks?.[p] || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, [p]: e.target.value },
                            }))
                          }
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:border-emerald-500 outline-none"
                        />
                      ))}
                    </div>
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        Current Status Update
                      </label>
                      <textarea
                        value={formData.currentStatus}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, currentStatus: e.target.value }))
                        }
                        className="w-full p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-xs font-medium focus:border-emerald-400 outline-none"
                        rows={2}
                        placeholder="Quick update..."
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-emerald-500" size={18} />
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                      Supporting Documents
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                        <input type="file" multiple onChange={handleDocumentUpload} className="hidden" />
                        <Upload className="mb-2 text-gray-400 group-hover:text-emerald-500 transition-colors" size={24} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600">
                          Click to Upload Documents
                        </span>
                        <p className="text-[9px] text-gray-400 mt-1">PDF, DOC, Images supported</p>
                      </label>
                    </div>
                    <div className="space-y-2">
                      {formData.existingDocuments?.map((doc, i) => (
                        <div
                          key={`ex-${i}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gray-200 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <FileText className="text-gray-400" size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                                Existing
                              </span>
                              <span className="text-xs font-bold text-gray-700 truncate max-w-[180px]">
                                {doc.name}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(i, true)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {formData.documents?.map((doc, i) => (
                        <div
                          key={`new-${i}`}
                          className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 group animate-in slide-in-from-right-2 duration-300"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg shadow-sm border border-emerald-100">
                              <FileText className="text-emerald-500" size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-emerald-500 uppercase leading-none mb-1">
                                New Upload
                              </span>
                              <span className="text-xs font-bold text-emerald-800 truncate max-w-[180px]">
                                {doc.name}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(i, false)}
                            className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {!formData.existingDocuments?.length && !formData.documents?.length && (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dotted border-gray-100 rounded-2xl">
                          <FileText className="text-gray-100 mb-2" size={32} />
                          <p className="text-[10px] font-bold text-gray-300 uppercase">
                            No documents attached
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TAB 3 — Donation Config
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'donation' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Goal + Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/50 p-6 rounded-3xl border-2 border-emerald-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Campaign Goal (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.requiredAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, requiredAmount: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-white border-2 border-emerald-200 rounded-2xl text-lg font-bold text-emerald-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-5 py-4 bg-white border-2 border-emerald-200 rounded-2xl font-bold text-emerald-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Matrix Config */}
                <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="text-emerald-500" size={20} /> Matrix Configuration
                    </h3>
                  </div>

                  {/* ── Config Mode Toggle ────────────────────────────────── */}
                  <div className="flex p-1 bg-gray-100 rounded-xl max-w-sm">
                    {/* Impact (Kits) */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => {
                          const prevUc = p.unitConfig || {};
                          const cost = Number(prevUc.unitCost) || 0;
                          const name = prevUc.unitName || prevUc.itemName || 'Unit';
                          const namePl = prevUc.unitNamePlural || name + 's';

                          // Restore kit presets if they exist, else seed defaults
                          const existing = (prevUc.presets || []).filter(
                            (pr) => Number(pr.qty) > 0
                          );
                          const restored =
                            existing.length > 0
                              ? existing
                              : [1, 10, 100, 1000].map((qty) => {
                                const amount = qty * cost;
                                return {
                                  qty,
                                  amount,
                                  label: `${qty} ${qty === 1 ? name : namePl}`,
                                  sublabel: `₹${amount.toLocaleString('en-IN')}`,
                                };
                              });

                          return {
                            ...p,
                            unitConfig: {
                              ...prevUc,
                              configType: 'unit',
                              presets: restored,
                            },
                          };
                        })
                      }
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${isUnitMode
                          ? 'bg-white shadow text-emerald-600'
                          : 'text-gray-500'
                        }`}
                    >
                      Impact (Kits)
                    </button>

                    {/* Simple Amounts */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => {
                          const prevUc = p.unitConfig || {};
                          const existingFlat = (prevUc.presets || []).filter(
                            (pr) => !pr.qty || Number(pr.qty) === 0
                          );
                          const defaultFlat = [50, 100, 200, 500, 1000].map((amt) => ({
                            qty: 0,
                            amount: amt,
                            label: `₹${amt.toLocaleString('en-IN')}`,
                            sublabel: null,
                          }));
                          return {
                            ...p,
                            unitConfig: {
                              ...prevUc,
                              configType: 'fixed',
                              presets:
                                existingFlat.length > 0 ? existingFlat : defaultFlat,
                            },
                          };
                        })
                      }
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${!isUnitMode
                          ? 'bg-white shadow text-emerald-600'
                          : 'text-gray-500'
                        }`}
                    >
                      Simple Amounts
                    </button>
                  </div>

                  {/* ── Unit-mode metadata ────────────────────────────────── */}
                  {isUnitMode ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Emoji */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                          Symbol
                        </label>
                        <input
                          type="text"
                          value={uc.emoji || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              unitConfig: { ...uc, emoji: e.target.value },
                            })
                          }
                          className="w-full p-3 border-2 border-gray-100 rounded-xl text-center text-xl"
                        />
                      </div>

                      {/* Unit Cost */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                          Unit Cost (₹)
                        </label>
                        <input
                          type="number"
                          value={uc.unitCost || ''}
                          onChange={(e) => {
                            const cost = parseInt(e.target.value) || 0;
                            const name = uc.unitName || uc.itemName || 'Unit';
                            const namePl = uc.unitNamePlural || name + 's';
                            setFormData((prev) => ({
                              ...prev,
                              unitConfig: {
                                ...prev.unitConfig,
                                unitCost: cost,
                                // Cascade cost change to all kit presets
                                presets: (prev.unitConfig?.presets || []).map((p) => {
                                  if (!p.qty || Number(p.qty) === 0) return p;
                                  const qty = Number(p.qty);
                                  const amount = qty * cost;
                                  return {
                                    ...p,
                                    amount,
                                    label: `${qty} ${qty === 1 ? name : namePl}`,
                                    sublabel: `₹${amount.toLocaleString('en-IN')}`,
                                  };
                                }),
                              },
                            }));
                          }}
                          className="w-full p-3 border-2 border-gray-100 rounded-xl font-bold focus:border-emerald-500 outline-none"
                        />
                      </div>

                      {/* Item Name */}
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                          Item Name (singular, e.g. "Iftaar Kit")
                        </label>
                        <input
                          type="text"
                          placeholder="Iftaar Kit"
                          value={uc.unitName || uc.itemName || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const valPl = val ? val + 's' : '';
                            const cost = Number(uc.unitCost) || 0;
                            setFormData((prev) => ({
                              ...prev,
                              unitConfig: {
                                ...prev.unitConfig,
                                unitName: val,
                                unitNamePlural: prev.unitConfig?.unitNamePlural || valPl,
                                itemName: val, // keep legacy field in sync
                                presets: (prev.unitConfig?.presets || []).map((p) => {
                                  if (!p.qty || Number(p.qty) === 0) return p;
                                  const qty = Number(p.qty);
                                  const amount = p.amount || qty * cost;
                                  return {
                                    ...p,
                                    amount,
                                    label: `${qty} ${qty === 1 ? val : valPl}`,
                                    sublabel: `₹${amount.toLocaleString('en-IN')}`,
                                  };
                                }),
                              },
                            }));
                          }}
                          className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase text-center">
                        Unit metrics hidden. Campaign will show only fixed amounts.
                      </p>
                    </div>
                  )}

                  {/* ── Preset editor ─────────────────────────────────────── */}
                  <div className="pt-4 border-t border-dashed">
                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-4">
                      {isUnitMode ? 'Impact Presets' : 'Configure Amount Buttons'}
                    </label>

                    {/* Fixed-mode editor */}
                    {!isUnitMode && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in fade-in">
                        {(
                          (uc.presets?.filter((p) => !p.qty || Number(p.qty) === 0).length === 5
                            ? uc.presets.filter((p) => !p.qty || Number(p.qty) === 0)
                            : [50, 100, 200, 500, 1000].map((amt) => ({
                              qty: 0,
                              amount: amt,
                              label: `₹${amt.toLocaleString('en-IN')}`,
                            })))
                        ).map((preset, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white border-2 border-gray-100 rounded-2xl flex flex-col gap-2 shadow-sm hover:border-emerald-200 transition-all"
                          >
                            <label className="text-[8px] font-bold text-gray-400 uppercase">
                              Button {i + 1}
                            </label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                ₹
                              </span>
                              <input
                                type="number"
                                value={preset.amount}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setFormData((prev) => {
                                    const flatPresets =
                                      prev.unitConfig?.presets?.filter(
                                        (p) => !p.qty || Number(p.qty) === 0
                                      ).length === 5
                                        ? [...prev.unitConfig.presets.filter(
                                          (p) => !p.qty || Number(p.qty) === 0
                                        )]
                                        : [50, 100, 200, 500, 1000].map((amt) => ({
                                          qty: 0,
                                          amount: amt,
                                          label: `₹${amt.toLocaleString('en-IN')}`,
                                        }));
                                    flatPresets[i] = {
                                      ...flatPresets[i],
                                      amount: val,
                                      label: `₹${val.toLocaleString('en-IN')}`,
                                    };
                                    return {
                                      ...prev,
                                      unitConfig: {
                                        ...prev.unitConfig,
                                        presets: flatPresets,
                                      },
                                    };
                                  });
                                }}
                                className="w-full pl-5 p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unit-mode editor */}
                    {isUnitMode && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2">
                        {getKitPresets().map((preset, i) => {
                          const qty = Number(preset.qty) || 0;
                          const total = Number(preset.amount) || 0;
                          const name = uc.unitName || uc.itemName || 'Unit';
                          const namePl = uc.unitNamePlural || name + 's';

                          return (
                            <div
                              key={i}
                              className="p-4 bg-white border-2 border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:border-emerald-300 transition-all"
                            >
                              <div className="text-xs font-bold text-gray-400 uppercase mb-3">
                                Box {i + 1}
                              </div>
                              <div className="flex flex-col gap-2 w-full text-left">
                                <div>
                                  <label className="text-[8px] font-bold text-gray-400 block uppercase mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    value={qty}
                                    onChange={(e) =>
                                      updateKitPreset(i, {
                                        qty: parseInt(e.target.value) || 0,
                                        amount:
                                          (parseInt(e.target.value) || 0) *
                                          (Number(uc.unitCost) || 0),
                                      })
                                    }
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-emerald-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-gray-400 block uppercase mb-1">
                                    Amount (₹)
                                  </label>
                                  <input
                                    type="number"
                                    value={total}
                                    onChange={(e) =>
                                      updateKitPreset(i, {
                                        amount: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-emerald-600 focus:border-emerald-500 outline-none"
                                  />
                                </div>
                              </div>
                              <div className="mt-3 text-[10px] font-bold text-gray-500 truncate w-full">
                                {qty} {qty === 1 ? name : namePl}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <div className="mt-8 pt-8 border-t flex items-center justify-between">
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-xs transition-colors"
            >
              Abandon
            </button>

            <div className="flex items-center gap-3">
              {/* Unsaved changes indicator */}
              {isDirty && !isSaving && (
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide animate-pulse">
                  Unsaved changes
                </span>
              )}
              {!isDirty && !isSaving && editingCard && (
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                  No changes
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                title={!isDirty ? 'No changes to save' : ''}
                className={`px-10 py-4 rounded-2xl font-bold uppercase text-sm shadow-xl transition-all ${isSaving
                    ? 'bg-emerald-300 text-white cursor-wait'
                    : !isDirty
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 cursor-pointer'
                  }`}
              >
                {isSaving ? 'Processing...' : 'Deploy Campaign'}
              </button>
            </div>
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