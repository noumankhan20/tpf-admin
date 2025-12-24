"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Loader2,
  Upload,
  Save,
  XCircle,
  Edit2,
  Trash2,
  Search,
  Plus,
  Menu,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import Sidebar from "@/components/Layout/CMSSideBar";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:7000/api";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const TAILORED_ENDPOINTS = {
  create: `${API_BASE_URL}/cms/tailored/add`,
  getAll: `${API_BASE_URL}/cms/tailored/get`,
  update: (id) => `${API_BASE_URL}/cms/tailored/update/${id}`,
  delete: (id) => `${API_BASE_URL}/cms/tailored/delete/${id}`,
};

export default function TailoredFeedCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("feed");

  const [feedItems, setFeedItems] = useState([]);
  const [itemForm, setItemForm] = useState({
    title: "",
    route: "",
    mediaFile: null,
    mediaPreview: null,
    mediaUrl: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Alert Component
  const Alert = ({ type, message, onDismiss }) => {
    const isSuccess = type === "success";

    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0 ${isSuccess
        ? "bg-green-50 border border-green-200 text-green-800"
        : "bg-red-50 border border-red-200 text-red-800"
        } rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-300`}>
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Fetch Tailored Items
  const fetchFeedItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(TAILORED_ENDPOINTS.getAll);
      setFeedItems(response.data.tailored || []);
    } catch (error) {
      setError("Failed to fetch feed items. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Create New Feed Item
  const createFeedItem = async (formData) => {
    try {
      await axios.post(TAILORED_ENDPOINTS.create, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showMessage("Item added successfully!");
      fetchFeedItems();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to add item.");
    }
  };

  // Update Feed Item
  const updateFeedItem = async (id, formData) => {
    try {
      await axios.put(TAILORED_ENDPOINTS.update(id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showMessage("Item updated successfully!");
      fetchFeedItems();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update item.");
    }
  };

  // Delete Feed Item
  const deleteFeedItem = async (id) => {
    try {
      await axios.delete(TAILORED_ENDPOINTS.delete(id));
      showMessage("Item deleted successfully!");
      fetchFeedItems();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete item.");
    }
  };

  // Show success or error message
  const showMessage = (message, type = "success") => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handle Media Upload with validation
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showMessage("Please upload a valid image file (JPG, PNG, or WebP)", "error");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage("File size must be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setItemForm((prev) => ({
        ...prev,
        mediaFile: file,
        mediaPreview: reader.result,
        mediaUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Item
  const handleAddItem = () => {
    setItemForm({
      title: "",
      route: "",
      mediaFile: null,
      mediaPreview: null,
      mediaUrl: "",
    });
    setSelectedItem(null);
    setViewMode("add-item");
    setError(null);
  };

  // Handle Edit Item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setItemForm({
      title: item.title || "",
      route: item.route || "",
      mediaFile: null,
      mediaPreview: item.image ? `${IMAGE_BASE_URL}${item.image}` : null,
      mediaUrl: item.image ? `${IMAGE_BASE_URL}${item.image}` : "",
    });
    setViewMode("edit-item");
    setError(null);
  };

  // Handle Save Item (Create/Update)
  const handleSaveItem = async () => {
    // Validation
    if (!itemForm.title.trim()) {
      showMessage("Title is required", "error");
      return;
    }

    if (viewMode === "add-item" && !itemForm.mediaFile) {
      showMessage("Please upload an image", "error");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", itemForm.title.trim());
    formData.append("route", itemForm.route.trim());
    if (itemForm.mediaFile) {
      formData.append("image", itemForm.mediaFile);
    }

    try {
      if (viewMode === "add-item") {
        await createFeedItem(formData);
      } else if (viewMode === "edit-item" && selectedItem) {
        await updateFeedItem(selectedItem._id, formData);
      }

      // Reset form and go to overview
      setViewMode("overview");
      setSelectedItem(null);
      setItemForm({
        title: "",
        route: "",
        mediaFile: null,
        mediaPreview: null,
        mediaUrl: "",
      });
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (item) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${item.title}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      await deleteFeedItem(item._id);
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setViewMode("overview");
    setSelectedItem(null);
    setItemForm({
      title: "",
      route: "",
      mediaFile: null,
      mediaPreview: null,
      mediaUrl: "",
    });
    setError(null);
  };

  // Filter Items by Title
  const filteredItems = feedItems.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Fetch Feed Items when component mounts
  useEffect(() => {
    fetchFeedItems();
  }, []);

  useEffect(() => {
    if (error) {
      // Show error once and then clear it after a delay
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);


  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">


      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <h1 className="ml-3 text-lg font-bold text-[#0F172A]">
              {viewMode === "overview" ? "Feed Items" :
                viewMode === "add-item" ? "Add Item" : "Edit Item"}
            </h1>
          </div>
          {viewMode === "overview" && (
            <button
              onClick={handleAddItem}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Add item"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage("")}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

            {/* Overview Section */}
            {viewMode === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                  {/* Desktop Header */}
                  <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-1">
                        Feed Items
                      </h2>
                      <p className="text-sm text-[#64748B]">
                        {feedItems.length} items in carousel
                      </p>
                    </div>
                    <button
                      onClick={handleAddItem}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={20} />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Search items by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                        <span className="text-gray-600 text-sm">Loading items...</span>
                      </div>
                    </div>
                  )}

                  {/* Items Grid */}
                  {!isLoading && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {filteredItems.map((item) => (
                          <div
                            key={item._id}
                            className="border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 bg-white"
                          >
                            <div className="relative h-48 bg-gray-100">
                              {item.image ? (
                                <img
                                  src={`${IMAGE_BASE_URL}${item.image}`}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    if (!e.target.src.includes("placeholder-image.jpg")) {
                                      e.target.src = "/images/placeholder-image.jpg";  // Set the fallback image
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon size={48} className="text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div className="p-4 sm:p-5">
                              <h3 className="font-bold text-[#0F172A] text-lg mb-3 line-clamp-2 leading-tight">
                                {item.title}
                              </h3>

                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  disabled={isLoading}
                                  className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Edit2 size={16} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  disabled={isLoading}
                                  className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={16} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Empty State */}
                      {filteredItems.length === 0 && (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Search size={28} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            {feedItems.length === 0 ? "No items yet" : "No items found"}
                          </p>
                          <p className="text-gray-400 text-sm mb-6">
                            {feedItems.length === 0
                              ? "Get started by adding your first feed item"
                              : "Try adjusting your search query"
                            }
                          </p>
                          {feedItems.length === 0 && (
                            <button
                              onClick={handleAddItem}
                              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Add First Item
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Add/Edit Item Section */}
            {(viewMode === "add-item" || viewMode === "edit-item") && (
              <div className="space-y-6">
                {/* Desktop Back Button */}
                <div className="hidden md:flex items-center gap-3 mb-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    ← Back to Items
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#0F172A]">
                      {viewMode === "add-item" ? "Add New Item" : "Edit Item"}
                    </h2>

                    {/* Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-3 text-[#0F172A]">
                        Image Upload {viewMode === "add-item" && <span className="text-red-500">*</span>}
                      </label>

                      <label className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 sm:p-8 block text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleMediaUpload}
                          disabled={isSubmitting}
                        />

                        {itemForm.mediaPreview ? (
                          <div className="space-y-3">
                            <img
                              src={itemForm.mediaPreview}
                              alt="Preview"
                              className="max-h-40 sm:max-h-48 mx-auto rounded-lg shadow-sm"
                            />
                            <p className="text-sm text-blue-600 font-medium">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <ImageIcon size={40} className="mx-auto text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Click or drag to upload
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG or WebP (Max 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2 text-[#0F172A]">
                        Item Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter item title..."
                        value={itemForm.title}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {itemForm.title.length}/100 characters
                      </p>
                    </div>

                    {/* ✅ ROUTE FIELD */}
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Route (Frontend Path)
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg"
                        placeholder="/services/web-development"
                        value={itemForm.route}
                        onChange={(e) =>
                          setItemForm((prev) => ({ ...prev, route: e.target.value }))
                        }
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={18} />
                        <span>Cancel</span>
                      </button>

                      <button
                        onClick={handleSaveItem}
                        disabled={isSubmitting || !itemForm.title.trim()}
                        className="w-full sm:flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            <span>{viewMode === "add-item" ? "Add Item" : "Save Changes"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Preview - Hidden on mobile for add mode, always visible for edit */}
                  <div className={`bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6 ${viewMode === "add-item" ? "hidden lg:block" : ""
                    }`}>
                    <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#0F172A]">
                      Live Preview
                    </h2>

                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
                      <div className="relative h-48 sm:h-64 bg-gray-100">
                        {itemForm.mediaPreview ? (
                          <img
                            src={itemForm.mediaPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <ImageIcon size={48} className="text-gray-300 mb-3" />
                            <p className="text-gray-400 text-sm">No image uploaded</p>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-[#0F172A]">
                          {itemForm.title || "Item Title"}
                        </h3>
                        {!itemForm.title && (
                          <p className="text-gray-400 text-sm">
                            Enter a title to see the preview
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}