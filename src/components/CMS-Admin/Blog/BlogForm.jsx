"use client";
import React, { useState, useEffect } from "react";
import {
  Upload,
  Save,
  ImageIcon,
  Edit2,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  FileText,
  Video,
  Tag as TagIcon,
} from "lucide-react";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "@/utils/slices/cms/blogApi";
import { getMediaUrl } from "@/utils/media";

export default function BlogForm({
  selectedBlog,
  isEditMode,
  onSuccess,
  onError,
  onCancel,
}) {
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: null,
    coverImagePreview: null,
    video: null,
    videoPreview: null,
    status: "draft",
    author: {
      name: "",
      email: "",
    },
    tags: [],
    seo: {
      title: "",
      description: "",
      keywords: "",
    },
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isEditMode && selectedBlog) {
      setFormData({
        title: selectedBlog.title || "",
        slug: selectedBlog.slug || "",
        excerpt: selectedBlog.excerpt || "",
        content: selectedBlog.content || "",
        coverImage: null,
        coverImagePreview: selectedBlog.coverImage?.url
          ? getMediaUrl(selectedBlog.coverImage.url)
          : null,
        video: null,
        videoPreview: selectedBlog.video?.url
          ? getMediaUrl(selectedBlog.video.url)
          : null,
        status: selectedBlog.status || "draft",
        author: {
          name: selectedBlog.author?.name || "",
          email: selectedBlog.author?.email || "",
        },
        tags: selectedBlog.tags || [],
        seo: {
          title: selectedBlog.seo?.title || "",
          description: selectedBlog.seo?.description || "",
          keywords: selectedBlog.seo?.keywords || "",
        },
      });
    }
  }, [selectedBlog, isEditMode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      onError("Video size should be less than 50MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        video: file,
        videoPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    handleChange("slug", slug);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      onError("Title is required");
      return;
    }
    if (!formData.slug.trim()) {
      onError("Slug is required");
      return;
    }
    if (!formData.content.trim()) {
      onError("Content is required");
      return;
    }
    if (!formData.author.name.trim()) {
      onError("Author name is required");
      return;
    }
    if (!isEditMode && !formData.coverImage) {
      onError("Cover image is required");
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("slug", formData.slug);
      submitData.append("excerpt", formData.excerpt);
      submitData.append("content", formData.content);
      submitData.append("status", formData.status);
      submitData.append("author", JSON.stringify(formData.author));
      submitData.append("tags", JSON.stringify(formData.tags));
      submitData.append("seo", JSON.stringify(formData.seo));

      if (formData.coverImage) {
        submitData.append("coverImage", formData.coverImage);
      }
      if (formData.video) {
        submitData.append("video", formData.video);
      }

      if (isEditMode) {
        await updateBlog({
          slug: selectedBlog.slug,
          formData: submitData,
        }).unwrap();
        onSuccess("Blog updated successfully!");
      } else {
        await createBlog(submitData).unwrap();
        onSuccess("Blog created successfully!");
      }
    } catch (err) {
      console.error("Submit error:", err);
      onError(err?.data?.message || "Operation failed");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 p-6 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
              {isEditMode ? (
                <Edit2 className="w-5 h-5 text-indigo-600" />
              ) : (
                <FileText className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? "Edit Blog Post" : "Create New Post"}
              </h2>
              <p className="text-sm text-slate-600">
                {isEditMode ? "Update your blog content" : "Share your thoughts with the world"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/50 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Cover Image {!isEditMode && "*"}
          </label>
          <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 block text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {formData.coverImagePreview ? (
              <div className="relative">
                <img
                  src={formData.coverImagePreview}
                  className="max-h-48 mx-auto rounded-xl mb-3 shadow-lg"
                  alt="Preview"
                />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                  <CheckCircle size={16} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload
                  size={40}
                  className="mx-auto text-slate-400 group-hover:text-indigo-500 transition"
                />
                <p className="text-sm text-slate-700 font-medium">
                  Click to upload cover image
                </p>
                <p className="text-xs text-slate-500">
                  Recommended: 1200x630px, Max 5MB
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Video Upload (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Video (Optional)
          </label>
          <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 block text-center cursor-pointer hover:border-violet-500 hover:bg-violet-50/30 transition-all group">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
            {formData.videoPreview ? (
              <div className="relative">
                <div className="flex items-center justify-center gap-2 text-violet-600">
                  <Video className="w-5 h-5" />
                  <span className="text-sm font-medium">Video attached</span>
                  <CheckCircle size={16} className="text-emerald-500" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Video
                  size={36}
                  className="mx-auto text-slate-400 group-hover:text-violet-500 transition"
                />
                <p className="text-sm text-slate-700 font-medium">
                  Click to upload video
                </p>
                <p className="text-xs text-slate-500">Max 50MB</p>
              </div>
            )}
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Title *
          </label>
          <input
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Enter an engaging title..."
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Slug *
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
              placeholder="blog-post-slug"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
            />
            <button
              onClick={generateSlug}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all active:scale-95"
              type="button"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            URL-friendly version of the title
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Excerpt
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            placeholder="Brief summary for previews..."
            value={formData.excerpt}
            onChange={(e) => handleChange("excerpt", e.target.value)}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Content *
          </label>
          <textarea
            rows={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-mono text-sm"
            placeholder="Write your blog content here..."
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
          />
        </div>

        {/* Author Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Author Name *
            </label>
            <input
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="John Doe"
              value={formData.author.name}
              onChange={(e) =>
                handleNestedChange("author", "name", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Author Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="john@example.com"
              value={formData.author.email}
              onChange={(e) =>
                handleNestedChange("author", "email", e.target.value)
              }
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Enter tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <button
              onClick={addTag}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all active:scale-95"
              type="button"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 group hover:bg-slate-200 transition-all"
              >
                <TagIcon className="w-3.5 h-3.5" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-rose-600 transition-colors"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Status
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleChange("status", "draft")}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                formData.status === "draft"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              type="button"
            >
              Draft
            </button>
            <button
              onClick={() => handleChange("status", "published")}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                formData.status === "published"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              type="button"
            >
              Published
            </button>
          </div>
        </div>

        {/* SEO Section */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" />
            SEO Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                SEO Title
              </label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Title for search engines..."
                value={formData.seo.title}
                onChange={(e) =>
                  handleNestedChange("seo", "title", e.target.value)
                }
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                SEO Description
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                placeholder="Meta description for search engines..."
                value={formData.seo.description}
                onChange={(e) =>
                  handleNestedChange("seo", "description", e.target.value)
                }
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                SEO Keywords
              </label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="keyword1, keyword2, keyword3"
                value={formData.seo.keywords}
                onChange={(e) =>
                  handleNestedChange("seo", "keywords", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all active:scale-95"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditMode ? "Update Post" : "Create Post"}
              </>
            )}
          </button>
        </div>

        {/* Info Alert */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              {isEditMode ? "Update Information" : "Publishing Tips"}
            </p>
            <p className="text-xs text-blue-700">
              {isEditMode
                ? "Changes will be reflected immediately after saving"
                : "Make sure all required fields are filled before publishing"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}