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
  HelpCircle,
  BookOpen,
  Hash,
  List,
  Type,
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
  const [showFormattingGuide, setShowFormattingGuide] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: null,
    coverImagePreview: null,
    video: null,
    videoPreview: null,
    status: "draft",
    author: {
      name: "",
      info: "",
    },
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const EXCERPT_LIMIT = 300;

  useEffect(() => {
    if (isEditMode && selectedBlog) {
      setFormData({
        title: selectedBlog.title || "",
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
          info: selectedBlog.author?.info || "",
        },
        tags: selectedBlog.tags || [],
      });
    }
  }, [selectedBlog, isEditMode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExcerptChange = (value) => {
    // Limit excerpt to 300 characters
    if (value.length <= EXCERPT_LIMIT) {
      handleChange("excerpt", value);
    }
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

    setFormData((prev) => ({
      ...prev,
      video: file,
      videoPreview: URL.createObjectURL(file),
    }));
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
    if (!formData.title || !formData.content || !formData.author.name) {
      onError("Please fill in all required fields");
      return;
    }

    try {
      // --------------------
      // CREATE (always multipart)
      // --------------------
      if (!isEditMode) {
        if (!formData.coverImage) {
          onError("Please upload a cover image");
          return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("excerpt", formData.excerpt);
        data.append("content", formData.content);
        data.append("status", formData.status);
        data.append("author[name]", formData.author.name);
        data.append("author[info]", formData.author.info || "");

        formData.tags.forEach(tag => data.append("tags[]", tag));

        data.append("coverImage", formData.coverImage);
        if (formData.video) data.append("video", formData.video);

        await createBlog(data).unwrap();
        onSuccess("Blog created successfully!");
        return;
      }

      // --------------------
      // UPDATE
      // --------------------

      const hasFiles = formData.coverImage || formData.video;

      let payload;

      if (hasFiles) {
        // multipart ONLY if files changed
        payload = new FormData();
        payload.append("title", formData.title);
        payload.append("excerpt", formData.excerpt);
        payload.append("content", formData.content);
        payload.append("status", formData.status);
        payload.append("author[name]", formData.author.name);
        payload.append("author[info]", formData.author.info || "");
        formData.tags.forEach(tag => payload.append("tags[]", tag));

        if (formData.coverImage) payload.append("coverImage", formData.coverImage);
        if (formData.video) payload.append("video", formData.video);
      } else {
        // JSON payload (THIS FIXES UPDATE)
        payload = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          status: formData.status,
          author: formData.author,
          tags: formData.tags,
        };
      }

      await updateBlog({
        id: selectedBlog._id,
        data: payload,
      }).unwrap();

      onSuccess("Blog updated successfully!");
    } catch (error) {
      onError(error?.data?.message || "Failed to save blog");
    }
  };


  const isLoading = isCreating || isUpdating;

  return (
    <>
      {/* Formatting Guide Modal */}
      {showFormattingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Content Formatting Rules
                  </h3>
                  <p className="text-sm text-indigo-100">
                    Learn how to format your blog content
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormattingGuide(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Headings */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900">1. Headings</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="font-mono text-sm bg-slate-900 text-emerald-400 p-3 rounded-lg mb-2">
                        # Main Heading (H1)
                      </div>
                      <p className="text-sm text-slate-600">
                        Use for main titles • Extra large, bold
                      </p>
                    </div>
                    <div>
                      <div className="font-mono text-sm bg-slate-900 text-emerald-400 p-3 rounded-lg mb-2">
                        ## Sub Heading (H2)
                      </div>
                      <p className="text-sm text-slate-600">
                        Use for major sections • Large, bold
                      </p>
                    </div>
                    <div>
                      <div className="font-mono text-sm bg-slate-900 text-emerald-400 p-3 rounded-lg mb-2">
                        ### Small Heading (H3)
                      </div>
                      <p className="text-sm text-slate-600">
                        Use for subsections • Medium, bold
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      <strong>Important:</strong> Always leave ONE blank line before
                      and after headings!
                    </p>
                  </div>
                </div>

                {/* ALL CAPS */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Type className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900">
                      2. ALL CAPS Headings
                    </h4>
                  </div>
                  <div className="font-mono text-sm bg-slate-900 text-emerald-400 p-3 rounded-lg mb-2">
                    BUILDING TOMORROW TODAY
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Write in ALL CAPITAL LETTERS (max 100 characters)
                  </p>
                  <p className="text-sm text-slate-600">
                    Will appear as: Large bold heading
                  </p>
                </div>

                {/* Paragraphs */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900">3. Paragraphs</h4>
                  </div>
                  <div className="font-mono text-sm bg-slate-900 text-emerald-400 p-3 rounded-lg mb-2 whitespace-pre-wrap">
                    {`This is the first paragraph.

This is the second paragraph.`}
                  </div>
                  <p className="text-sm text-slate-600">
                    Separate paragraphs with ONE blank line
                  </p>
                </div>

                {/* Bullet Lists */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <List className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900">
                      4. Bullet Point Lists
                    </h4>
                  </div>
                  <div className="font-mono text-sm bg-slate-900 text-emerald-400 p-3 rounded-lg mb-2 whitespace-pre-wrap">
                    {`- First bullet point
- Second bullet point
- Third bullet point`}
                  </div>
                  <p className="text-sm text-slate-600">
                    Start with <code className="bg-slate-200 px-1.5 py-0.5 rounded">-</code> (dash) + ONE space
                  </p>
                </div>

                {/* Numbered Lists */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <List className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900">
                      5. Numbered Lists
                    </h4>
                  </div>
                  <div className="font-mono text-sm bg-slate-900 text-emerald-400 p-3 rounded-lg mb-2 whitespace-pre-wrap">
                    {`1. First numbered item
2. Second numbered item
3. Third numbered item`}
                  </div>
                  <p className="text-sm text-slate-600">
                    Start with number + <code className="bg-slate-200 px-1.5 py-0.5 rounded">.</code> + ONE space
                  </p>
                </div>

                {/* Quick Tips */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5 border-2 border-indigo-200">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Quick Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Always add blank lines between different sections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Use <code className="bg-white px-1.5 py-0.5 rounded">#</code> with a space: <code className="bg-white px-1.5 py-0.5 rounded"># Heading</code> not <code className="bg-white px-1.5 py-0.5 rounded">#Heading</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Leave blank lines before and after lists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Keep ALL CAPS sections under 100 characters</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowFormattingGuide(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
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
                  {isEditMode
                    ? "Update your blog content"
                    : "Share your thoughts with the world"}
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

          {/* Excerpt with Character Counter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-800">
                Excerpt / Summary
              </label>
              <span
                className={`text-xs font-semibold ${formData.excerpt.length >= EXCERPT_LIMIT
                    ? "text-red-600"
                    : formData.excerpt.length >= EXCERPT_LIMIT * 0.9
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
              >
                {formData.excerpt.length}/{EXCERPT_LIMIT}
              </span>
            </div>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              placeholder="Brief summary for previews (max 300 characters)..."
              value={formData.excerpt}
              onChange={(e) => handleExcerptChange(e.target.value)}
              maxLength={EXCERPT_LIMIT}
            />
            <p className="text-xs text-slate-500 mt-1">
              A short description that appears in blog previews and search results
            </p>
          </div>

          {/* Content with Formatting Guide Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-800">
                Content *
              </label>
              <button
                type="button"
                onClick={() => setShowFormattingGuide(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-all"
              >
                <HelpCircle size={14} />
                Formatting Guide
              </button>
            </div>
            <textarea
              rows={12}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-mono text-sm"
              placeholder="Write your blog content here... (Click 'Formatting Guide' to learn how to add headings, lists, etc.)"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Use markdown-style formatting: <code className="bg-white px-1.5 py-0.5 rounded mx-1">#</code> for headings,
                  <code className="bg-white px-1.5 py-0.5 rounded mx-1">-</code> for bullets, etc. Click the Formatting Guide for details.
                </span>
              </p>
            </div>
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
                value={formData.author.info}
                onChange={(e) =>
                  handleNestedChange("author", "info", e.target.value)
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
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
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
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${formData.status === "draft"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                type="button"
              >
                Draft
              </button>
              <button
                onClick={() => handleChange("status", "published")}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${formData.status === "published"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                type="button"
              >
                Published
              </button>
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
    </>
  );
}