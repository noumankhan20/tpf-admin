import React from 'react';
import { Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';
import { getMediaUrl } from '@/utils/media';

export default function CampaignList({ campaigns, categoryColors, onEdit, onDelete }) {
  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
        <p className="text-gray-600 mb-6">Create your first fundraising campaign to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((card) => (
        <div
          key={card._id}
          className="bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-500 transition-all duration-200 overflow-hidden group"
        >
          {/* Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            {card.mediaType === "video" ? (
              <video
                src={getMediaUrl(card.videoUrl)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <img
                src={getMediaUrl(card.imageUrl)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt={card.title}
              />
            )}

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[card.category]}`}>
                {card.category}
              </span>
            </div>

            {/* Urgent Badge */}
            {card.isUrgent && (
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                  Urgent
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
              {card.title}
            </h3>

            <p className="text-sm text-gray-600 mb-4 line-clamp-1">
              {card.organization}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                {/* <DollarSign size={16} className="text-emerald-600" /> */}
                <span className="font-medium">
                  ₹{(card.requiredAmount || 0).toLocaleString()}
                </span>
              </div>
              {card.deadline && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar size={16} className="text-emerald-600" />
                  <span className="font-medium">
                    {new Date(card.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => !card.pendingDelete && onEdit(card)}
                disabled={card.pendingDelete}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors font-medium ${card.pendingDelete
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>

              {card.pendingDelete ? (
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-500 rounded-lg font-medium cursor-not-allowed"
                >
                  <span>⏳ Pending</span>
                </button>
              ) : (
                <button
                  onClick={() => onDelete(card._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}