import React from 'react';
import {
  Image as ImageIcon,
  Play,
  Users,
  Heart,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
} from 'lucide-react';
import { getMediaUrl } from '@/utils/media';
export default function CampaignPreview({ formData, categoryColors }) {
  const calculatePercentage = (current, required) => {
    const req = Number(required) || 0;
    const cur = Number(current) || 0;
    if (req <= 0) return 0;
    return Math.min(Math.round((cur / req) * 100), 100);
  };

  const getImageUrl = (preview, isExisting) => {
    if (!preview) return null;
    if (preview.startsWith('blob:') || preview.startsWith('data:')) return preview;
    if (isExisting) return getMediaUrl(preview);
    return preview;
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
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <h3 className="text-lg font-bold text-gray-900">Live Preview</h3>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm max-w-[320px] mx-auto">
        {formData.mediaType === "video" ? (
          // Video Preview
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70"></div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <Play size={64} className="text-gray-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70"></div>
              </>
            )}

            {/* Badges */}
            <div className="flex flex-col gap-2 absolute top-3 left-3 z-20">
              {formData.isUrgent && (
                <div className="bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                  Urgent
                </div>
              )}
              {formData.source === 'SPONSORED' && (
                <div className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                  Sponsored
                </div>
              )}
            </div>
            {formData.taxBenefits && (
              <div className="absolute top-3 right-3 z-20 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                Tax Benefits
              </div>
            )}

            <div className="relative z-10">
              <div className="aspect-video"></div>

              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem] text-white">
                  {formData.title || "Your Campaign Title"}
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
                      className="bg-emerald-500 h-2 rounded-full transition-all"
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

                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-sm transition-colors mb-3">
                  Donate Now
                </button>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-600/50">
                  <div className="flex items-center gap-3">
                    <button className="text-zinc-300 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="text-zinc-300 hover:text-emerald-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                  {formData.zakatVerified && (
                    <div className="flex items-center gap-1 text-[10px] bg-emerald-900/40 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Zakaat</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Image Preview
          <>
            <div className="relative h-44">
              {formData.imagePreview ? (
                <img
                  src={getImageUrl(formData.imagePreview, formData.isExistingImage)}
                  alt="Campaign"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon size={64} className="text-gray-400" />
                </div>
              )}

              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                {formData.isUrgent && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs rounded-full font-bold shadow-md">
                    <AlertCircle size={14} />
                    URGENT
                  </div>
                )}
                {formData.source === 'SPONSORED' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-full font-bold shadow-md">
                    SPONSORED
                  </div>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${categoryColors[formData.category]}`}>
                  {formData.category}
                </span>
                {formData.taxBenefits && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                    <CheckCircle size={12} />
                    Tax Benefits
                  </span>
                )}
                {formData.zakatVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                    <Shield size={12} />
                    Zakat
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                {formData.title || "Your Campaign Title"}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {formData.organization || "Organization Name"}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(formData.currentAmount || 0)}
                    </p>
                    <p className="text-xs text-gray-600">
                      raised of {formatCurrency(formData.requiredAmount || 0)}
                    </p>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
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
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={14} />
                      <span className="font-medium text-xs">
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

              <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-sm">
                Donate Now
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-xs text-emerald-800">
          <strong>Preview Tip:</strong>{" "}
          {formData.mediaType === "video"
            ? "Video displays full card with overlay"
            : "Image displays on top half with content below"}
        </p>
      </div>
    </div>
  );
}