"use client";
import React from "react";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getMediaUrl } from "@/utils/media";

export default function BlogList({
  data,
  isLoading,
  error,
  filters,
  setFilters,
  onEdit,
  onDelete,
}) {
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
        <p className="text-rose-600 font-semibold">Failed to load blogs</p>
        <p className="text-rose-500 text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter("PUBLISHED")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                filters.status === "published"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => handleStatusFilter("draft")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${filters.status === "draft"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-200"></div>
              <div className="p-3 space-y-2">
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold mb-2">No blogs found</p>
          <p className="text-slate-500 text-sm">
            Try adjusting your filters or create a new blog post
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {data?.data?.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
              >
                {/* Cover Image - Reduced aspect ratio */}
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                  {blog.coverImage?.url ? (
                    <img
                      src={getMediaUrl(blog.coverImage.url)}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  {/* Status Badge - Smaller */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm uppercase tracking-wide ${blog.status === "published"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                        }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                </div>

                {/* Content - Compact */}
                <div className="p-3">
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-slate-600 text-xs mb-2.5 line-clamp-2 leading-relaxed">
                    {blog.excerpt || "No excerpt available"}
                  </p>

                  {/* Meta Info - Condensed */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {blog.author?.name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{blog.author.name}</span>
                      </>
                    )}
                  </div>

                  {/* Tags - Compact */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {blog.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {blog.tags.length > 2 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          +{blog.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions - Compact */}
                  {/* Actions - Compact */}
                  <div className="flex gap-1.5 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => !blog.pendingDelete && onEdit(blog)}
                      disabled={blog.pendingDelete}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${blog.pendingDelete
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }`}
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {blog.pendingDelete ? (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-amber-50 text-amber-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onDelete(blog._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Compact */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200/60 p-3 shadow-sm fab-avoid">
              <p className="text-xs text-slate-600 hidden md:block">
                <span className="font-semibold text-slate-900">
                  {(data.pagination.page - 1) * data.pagination.limit + 1}
                </span>
                {" - "}
                <span className="font-semibold text-slate-900">
                  {Math.min(
                    data.pagination.page * data.pagination.limit,
                    data.pagination.total
                  )}
                </span>
                {" of "}
                <span className="font-semibold text-slate-900">
                  {data.pagination.total}
                </span>
              </p>

              <div className="flex gap-1.5 mx-auto md:mx-0 md:ml-auto">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(data.pagination.pages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first, last, current, and one page on each side
                    const showPage =
                      pageNum === 1 ||
                      pageNum === data.pagination.pages ||
                      (pageNum >= filters.page - 1 && pageNum <= filters.page + 1);

                    const showEllipsis =
                      pageNum === filters.page - 2 ||
                      pageNum === filters.page + 2;

                    if (showPage) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${filters.page === pageNum
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (showEllipsis) {
                      return <span key={pageNum} className="px-1 text-slate-400 text-xs">•••</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === data.pagination.pages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}