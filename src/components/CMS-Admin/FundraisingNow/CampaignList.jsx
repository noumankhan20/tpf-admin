import React from 'react';
import { Edit2, Trash2, Calendar, AlertCircle, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/utils/media';

export default function CampaignList({
  campaigns,
  categoryColors,
  onEdit,
  onDelete,
  pagination,       // { total, page, limit, totalPages, hasNextPage, hasPrevPage }
  onPageChange,     // (newPage) => void
}) {
  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
        <p className="text-gray-600">Create your first fundraising campaign to get started</p>
      </div>
    );
  }

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // Already sorted by backend (createdAt: -1), but fallback sort if needed
  const sorted = [...campaigns].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : a._id;
    const dateB = b.createdAt ? new Date(b.createdAt) : b._id;
    return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
  });

  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = pagination || {};

  // Build page number array with ellipsis logic
  const getPageNumbers = () => {
    if (!totalPages || totalPages <= 1) return [];
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* List */}
      <div className="flex flex-col gap-3">
        {sorted.map((card) => {
          const expired = isExpired(card.deadline);

          return (
            <div
              key={card._id}
              className={`bg-white rounded-xl border-2 transition-all duration-200 group ${
                expired
                  ? 'border-gray-200 opacity-75'
                  : 'border-gray-200 hover:border-emerald-400'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center gap-4 px-4 py-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {card.mediaType === 'video' ? (
                    <video
                      src={getMediaUrl(card.videoUrl)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={getMediaUrl(card.imageUrl)}
                      className="w-full h-full object-cover"
                      alt={card.title}
                    />
                  )}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {card.title}
                    </h3>
                    {card.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 flex-shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-1">{card.organization}</p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColors[card.category]}`}>
                      {card.category}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      ₹{(card.requiredAmount || 0).toLocaleString()}
                    </span>
                    {card.deadline && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {new Date(card.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {expired ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                      <AlertCircle size={12} />
                      Expired
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={12} />
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-3">
                <button
                  onClick={() => onEdit(card)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(card._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          {/* Count info */}
          <p className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
            </span>{' '}
            of <span className="font-medium text-gray-700">{total}</span> campaigns
          </p>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrevPage}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((num, idx) =>
              num === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm select-none">
                  …
                </span>
              ) : (
                <button
                  key={num}
                  onClick={() => onPageChange(num)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium border transition-colors ${
                    num === page
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                  }`}
                >
                  {num}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}