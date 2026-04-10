import React from 'react';
import { X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '@/utils/media';

export default function MediaSelectorModal({
  isOpen,
  onClose,
  media,
  selectedUrl,
  onSelect,
  onUploadNew,
  onVideoUpload,
  uploadedImages = [],
  uploadedVideo = null,
}) {
  if (!isOpen) return null;

  const getImageUrl = (preview, isExisting) => {
    if (!preview) return null;
    if (preview.startsWith('blob:') || preview.startsWith('data:')) return preview;
    if (isExisting) return getMediaUrl(preview);
    return preview;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Campaign Media</h2>
            <p className="text-sm text-gray-600 mt-1">Choose from uploaded or photography team submissions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">

          {/* Upload New Option */}
          <div className="mb-6">
            <label className="block">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  if (file.type.startsWith('video/')) {
                    onVideoUpload(e);
                  } else {
                    onUploadNew(e);
                  }
                }}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer text-center">
                <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="font-semibold text-gray-900 mb-1">Upload New Media</p>
                <p className="text-sm text-gray-600">Click to upload image or video</p>
              </div>
            </label>
          </div>

          {/* ── YOUR UPLOADED FILES — this was the missing section ── */}
          {(uploadedImages.length > 0 || uploadedVideo) && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Your Uploaded Files
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Uploaded video */}
                {uploadedVideo && (
                  <div className="relative aspect-square rounded-xl overflow-hidden border-4 border-emerald-400">
                    <video
                      src={uploadedVideo}
                      className="w-full h-full object-cover"
                      playsInline
                      preload="metadata"
                    />
                    <span className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white rounded-md text-[10px] font-bold uppercase">
                      Video
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-white rounded-md text-[10px] font-bold uppercase">
                      Uploaded
                    </span>
                  </div>
                )}

                {/* Uploaded images */}
                {uploadedImages.map((img, i) => {
                  const src = img.isFromGallery ? getImageUrl(img.url, true) : img.url;
                  const isSelected = selectedUrl === img.url;
                  return (
                    <button
                      key={i}
                      onClick={() => onSelect({ url: img.url, type: 'image' })}
                      className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all ${
                        isSelected
                          ? 'border-emerald-500 shadow-lg scale-105'
                          : 'border-transparent hover:border-emerald-300 hover:shadow-md'
                      }`}
                    >
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold uppercase">
                        Uploaded
                      </span>
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="bg-emerald-500 rounded-full p-3">
                            <Check size={24} className="text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photography Team Media */}
          {media && media.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Photography Team Submissions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...media]
                  .sort((a, b) => (b.submissionType === 'EDITED' ? 1 : -1))
                  .map((file, index) => {
                    const isSelected = selectedUrl === file.url;
                    const isVideo = file.type === 'video';
                    const isEdited = file.submissionType === 'EDITED';
                    return (
                      <button
                        key={index}
                        onClick={() => onSelect(file)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all ${
                          isSelected
                            ? 'border-emerald-500 shadow-lg scale-105'
                            : 'border-transparent hover:border-emerald-300 hover:shadow-md'
                        }`}
                      >
                        {isVideo ? (
                          <video
                            src={getImageUrl(file.url, true)}
                            className="w-full h-full object-cover"
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={getImageUrl(file.url, true)}
                            className="w-full h-full object-cover"
                            alt="Campaign media"
                          />
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${isEdited ? 'bg-amber-500 text-white' : 'bg-gray-600 text-white'}`}>
                            {isEdited ? '✨ Edited' : 'Raw'}
                          </span>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${isVideo ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {isVideo ? 'Video' : 'Image'}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <div className="bg-emerald-500 rounded-full p-3">
                              <Check size={24} className="text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Empty state — only when both sections are empty */}
          {(!media || media.length === 0) && uploadedImages.length === 0 && !uploadedVideo && (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">No media available yet. Upload something above!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={!selectedUrl}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}