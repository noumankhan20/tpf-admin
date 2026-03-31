"use client";
import React, { useState, useEffect } from "react";
import {
  useGetTailoredQuery,
  useCreateTailoredMutation,
  useUpdateTailoredMutation,
  useDeleteTailoredMutation,
} from "@/utils/slices/cms/tailoredApi";
import {
  Loader2,
  Upload,
  Save,
  XCircle,
  Edit2,
  Trash2,
  Search,
  Plus,
  Image as ImageIcon,
  CheckCircle,
  X,
  ArrowLeft,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../Common/ConfirmModal";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/utils/media";

export default function TailoredFeedCMS() {
  const {
    data,
    isLoading,
    error,
  } = useGetTailoredQuery();

  const feedItems = data?.tailored ?? [];
  const [createTailored, { isLoading: isCreating }] =
    useCreateTailoredMutation();

  const [updateTailored, { isLoading: isUpdating }] =
    useUpdateTailoredMutation();

  const [deleteTailored, { isLoading: isDeleting }] =
    useDeleteTailoredMutation();

  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeletingModal, setIsDeletingModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const router = useRouter();
  const [itemForm, setItemForm] = useState({
    title: "",
    route: "",
    mediaFile: null,
    mediaPreview: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Alert Component with enhanced styling
  const Alert = ({ type, message, onDismiss }) => {
    const isSuccess = type === "success";

    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0 ${isSuccess
        ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-900"
        : "bg-red-50 border-2 border-red-500 text-red-900"
        } rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-300`}>
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle size={18} className="text-white" />
            </div>
          ) : (
            <div className="bg-red-500 rounded-full p-1">
              <AlertCircle size={18} className="text-white" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold">{message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 hover:opacity-70 transition-opacity p-1 hover:bg-gray-200 rounded-full"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };
  // Show success or error message
  const showMessage = (message, type = "success") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Handle Media Upload with validation
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showMessage("Please upload a valid image file (JPG, PNG, or WebP)", "error");
      return;
    }

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
    });
    setSelectedItem(null);
    setViewMode("add-item");
  };

  // Handle Edit Item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setItemForm({
      title: item.title || "",
      route: item.route || "",
      mediaFile: null,
      mediaPreview: item.image ? getMediaUrl(item.image) : null,
    });
    setViewMode("edit-item");
  };

  // Handle Save Item
  const handleSaveItem = async () => {
    if (!itemForm.title.trim()) {
      showMessage("Title is required", "error");
      return;
    }
    if (!itemForm.route.trim()) {
      showMessage("Route is required", "error");
      return;
    }

    if (viewMode === "add-item" && !itemForm.mediaFile) {
      showMessage("Please upload an image", "error");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", itemForm.title.trim());
    formData.append("route", itemForm.route.trim());

    if (itemForm.mediaFile) {
      formData.append("image", itemForm.mediaFile);
    }

    try {
      if (viewMode === "add-item") {
        await createTailored(formData).unwrap();
        showMessage("Item added successfully!");
      } else {
        await updateTailored({
          id: selectedItem._id,
          formData,
        }).unwrap();
        showMessage("Item updated successfully!");
      }

      setViewMode("overview");
      setSelectedItem(null);
      setItemForm({
        title: "",
        route: "",
        mediaFile: null,
        mediaPreview: null,
      });
    } catch (err) {
      showMessage(err?.data?.message || "Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Handle Delete Item
  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setIsDeletingModal(true);
  };

  // ✅ FIX
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteTailored(itemToDelete._id).unwrap();
      showMessage("Item deleted successfully!");
    } catch (error) {
      showMessage(error?.data?.message || "Something went wrong", "error");
    } finally {
      setIsDeletingModal(false);
      setItemToDelete(null);
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
    });
  };

  // Filter Items
  const filteredItems = feedItems.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (isLoading) {
    return <div className="p-10 text-center">Loading feed items...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load feed items
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-b border-emerald-100 px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/cms-admin")}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {viewMode === "overview" ? "Feed Items" :
                  viewMode === "add-item" ? "Add Item" : "Edit Item"}
              </h1>
              {viewMode === "overview" && (
                <p className="text-xs text-emerald-600 font-medium">{feedItems.length} items</p>
              )}
            </div>
          </div>
          {viewMode === "overview" && (
            <button
              onClick={handleAddItem}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
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
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-emerald-100/50 p-6 sm:p-8">
                  {/* Enhanced Desktop Header */}
                  <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => router.push("/cms-admin")}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                          <LayoutGrid size={24} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          Feed Items
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 ml-14">
                        Manage your carousel items • <span className="font-semibold text-emerald-600">{feedItems.length} total items</span>
                      </p>
                    </div>
                    <button
                      onClick={handleAddItem}
                      disabled={isLoading}
                      className="group cursor-pointer flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                      <span>Add New Item</span>
                    </button>
                  </div>

                  {/* Enhanced Search Bar */}
                  <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input
                      className="w-full pl-12 pr-4 py-4 border-2 border-emerald-100 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Search items by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                        </div>
                        <span className="text-gray-600 font-medium">Loading items...</span>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Items Grid */}
                  {!isLoading && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                          <div
                            key={item._id}
                            className="group bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="relative h-52 bg-gradient-to-br from-gray-100 to-emerald-50 overflow-hidden">
                              {item.image ? (
                                <img
                                  src={getMediaUrl(item.image)}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    if (!e.target.src.includes("placeholder-image.jpg")) {
                                      e.target.src = "/images/placeholder-image.jpg";
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon size={56} className="text-emerald-300" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div className="p-5">
                              <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                                {item.title}
                              </h3>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => !item.pendingDelete && handleEditItem(item)}
                                  disabled={isLoading || item.pendingDelete}
                                  className={`flex cursor-pointer items-center justify-center gap-2 flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 ${item.pendingDelete
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    }`}
                                >
                                  <Edit2 size={16} />
                                  <span>Edit</span>
                                </button>

                                {item.pendingDelete ? (
                                  <button
                                    disabled
                                    className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-amber-50 text-amber-500 border-2 border-amber-200 rounded-xl font-semibold cursor-not-allowed"
                                  >
                                    <span>⏳ Pending</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteItem(item)}
                                    disabled={isLoading}
                                    className="flex cursor-pointer items-center justify-center gap-2 flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

                      {/* Enhanced Empty State */}
                      {filteredItems.length === 0 && (
                        <div className="text-center py-20">
                          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                            {feedItems.length === 0 ? (
                              <Sparkles size={36} className="text-emerald-600" />
                            ) : (
                              <Search size={36} className="text-emerald-600" />
                            )}
                          </div>
                          <p className="text-gray-700 text-xl font-bold mb-2">
                            {feedItems.length === 0 ? "No items yet" : "No items found"}
                          </p>
                          <p className="text-gray-500 mb-8">
                            {feedItems.length === 0
                              ? "Get started by adding your first feed item"
                              : "Try adjusting your search query"
                            }
                          </p>
                          {feedItems.length === 0 && (
                            <button
                              onClick={handleAddItem}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
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

            {/* Enhanced Add/Edit Item Section */}
            {(viewMode === "add-item" || viewMode === "edit-item") && (
              <div className="space-y-6">
                {/* Enhanced Desktop Back Button */}
                <div className="hidden md:flex items-center gap-3 mb-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors disabled:opacity-50 font-medium group"
                  >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Items</span>
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Enhanced Form */}
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-emerald-100/50 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                        {viewMode === "add-item" ? (
                          <Plus size={24} className="text-white" />
                        ) : (
                          <Edit2 size={24} className="text-white" />
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {viewMode === "add-item" ? "Add New Item" : "Edit Item"}
                      </h2>
                    </div>

                    {/* Enhanced Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold mb-3 text-gray-900">
                        Image Upload {viewMode === "add-item" && <span className="text-red-500">*</span>}
                      </label>

                      <label className="group border-3 border-dashed border-emerald-200 rounded-2xl p-8 block text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleMediaUpload}
                          disabled={isSubmitting}
                        />

                        {itemForm.mediaPreview ? (
                          <div className="space-y-4">
                            <div className="relative inline-block">
                              <img
                                src={itemForm.mediaPreview}
                                alt="Preview"
                                className="max-h-48 mx-auto rounded-2xl shadow-lg ring-4 ring-emerald-100"
                              />
                              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload size={32} className="text-emerald-600" />
                              </div>
                            </div>
                            <p className="text-sm text-emerald-600 font-semibold">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                              <Upload size={32} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-gray-900 mb-1">
                                Click or drag to upload
                              </p>
                              <p className="text-sm text-gray-500">
                                JPG, PNG or WebP (Max 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Enhanced Title Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold mb-3 text-gray-900">
                        Item Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-4 py-4 border-2 border-emerald-100 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Enter item title..."
                        value={itemForm.title}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                        <span>Choose a descriptive title</span>
                        <span className={itemForm.title.length > 80 ? "text-red-500 font-semibold" : ""}>{itemForm.title.length}/100</span>
                      </p>
                    </div>

                    {/* Enhanced Route Input */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold text-gray-900 mb-3">
                        Route (Frontend Path)  <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-4 py-4 border-2 border-emerald-100 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400"
                        placeholder="/services/web-development"
                        value={itemForm.route}
                        onChange={(e) =>
                          setItemForm((prev) => ({ ...prev, route: e.target.value }))
                        }
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Optional: Add a route path for navigation
                      </p>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                      >
                        <XCircle size={18} />
                        <span>Cancel</span>
                      </button>

                      <button
                        onClick={handleSaveItem}
                        disabled={isSubmitting || !itemForm.title.trim()}
                        className="w-full sm:flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {/* Enhanced Preview */}
                  <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-emerald-100/50 p-6 sm:p-8 ${viewMode === "add-item" ? "hidden lg:block" : ""}`}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                        <Sparkles size={24} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Live Preview
                      </h2>
                    </div>

                    <div className="border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-lg bg-white">
                      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-emerald-50">
                        {itemForm.mediaPreview ? (
                          <img
                            src={itemForm.mediaPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                              <ImageIcon size={32} className="text-emerald-400" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">No image uploaded</p>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">
                          {itemForm.title || "Item Title"}
                        </h3>
                        {!itemForm.title ? (
                          <p className="text-gray-400 text-sm">
                            Enter a title to see the preview
                          </p>
                        ) : (
                          <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                            Preview Mode
                          </div>
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
      <ConfirmModal
        isOpen={isDeletingModal}
        onClose={() => {
          setIsDeletingModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  );
}