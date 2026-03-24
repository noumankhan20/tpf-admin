"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useGetBlogsQuery,
  useDeleteBlogMutation,
} from "@/utils/slices/cms/blogApi";
import BlogList from "./BlogList";
import BlogForm from "./BlogForm";
import BlogStats from "./BlogStats";

export default function BlogMain() {
  // State Management
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    tag: "",
    search: "",
    page: 1,
    limit: 10,
  });

  // API Hooks
  const { data, isLoading, error, refetch } = useGetBlogsQuery(filters);
  const [deleteBlog] = useDeleteBlogMutation();

  // Auto-hide messages
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    if (showErrorMessage) {
      const timer = setTimeout(() => setShowErrorMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showErrorMessage]);

  const handleCreateNew = () => {
    setSelectedBlog(null);
    setViewMode("create");
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setViewMode("edit");
  };

  const handleDelete = async (blogId) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await deleteBlog(blogId).unwrap();
      setSuccessText(res?.message || "Operation successful");
      setShowSuccessMessage(true);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorText("Failed to delete blog");
      setShowErrorMessage(true);
    }
  };

  const handleSuccess = (message) => {
    setSuccessText(message);
    setShowSuccessMessage(true);
    setViewMode("list");
    refetch();
  };

  const handleError = (message) => {
    setErrorText(message);
    setShowErrorMessage(true);
  };

  const handleCancel = () => {
    setSelectedBlog(null);
    setViewMode("list");
  };

  return (
    <>
      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md w-[90%] sm:w-auto animate-slideDown">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{successText}</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-600 to-rose-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md w-[90%] sm:w-auto animate-slideDown">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Operation Failed!</p>
            <p className="text-sm text-rose-100">{errorText || "Please try again later"}</p>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shrink-0 shadow-sm sticky top-0 z-40">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => viewMode !== "list" ? handleCancel() : window.history.back()}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Blog Management
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {viewMode === "list" && "Manage your blog posts"}
                  {viewMode === "create" && "Create new blog post"}
                  {viewMode === "edit" && "Edit blog post"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {viewMode === "list" && (
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Post</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-all relative active:scale-95">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
              {viewMode === "list" && (
                <>
                  <BlogStats data={data} isLoading={isLoading} />
                  <BlogList
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    filters={filters}
                    setFilters={setFilters}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </>
              )}

              {(viewMode === "create" || viewMode === "edit") && (
                <BlogForm
                  selectedBlog={selectedBlog}
                  isEditMode={viewMode === "edit"}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onCancel={handleCancel}
                />

              )}
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}