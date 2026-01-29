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
              onClick={() => handleStatusFilter("published")}
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
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                filters.status === "draft"
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-slate-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data?.data?.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Cover Image */}
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                  {blog.coverImage?.url ? (
                    <img
                      src={getMediaUrl(blog.coverImage.url)}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        blog.status === "published"
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {blog.excerpt || "No excerpt available"}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                    {blog.author?.name && (
                      <div className="flex items-center gap-1">
                        <span>by {blog.author.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          +{blog.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onEdit(blog)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-all active:scale-95"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(blog._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
              <p className="text-sm text-slate-600 hidden sm:block">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {(data.pagination.page - 1) * data.pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(
                    data.pagination.page * data.pagination.limit,
                    data.pagination.total
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {data.pagination.total}
                </span>{" "}
                results
              </p>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(data.pagination.pages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === data.pagination.pages ||
                      (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all active:scale-95 ${
                            filters.page === pageNum
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === filters.page - 2 ||
                      pageNum === filters.page + 2
                    ) {
                      return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === data.pagination.pages}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}