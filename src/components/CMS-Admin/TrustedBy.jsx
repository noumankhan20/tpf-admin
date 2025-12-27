"use client";
import React, { useState, useEffect } from "react";
import {
  Save,
  XCircle,
  Home,
  Edit2,
  Trash2,
  Search,
  Plus,
  Menu,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetTrustedByQuery,
         useCreateTrustedByMutation,
         useUpdateTrustedByMutation,
         useDeleteTrustedByMutation
 } from "@/utils/slices/cms/trustedbyApi";

export default function PartnersCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

 const {
  data,
  isLoading,
  error,
} = useGetTrustedByQuery();

const [createTrustedBy] = useCreateTrustedByMutation();
const [updateTrustedBy] = useUpdateTrustedByMutation();
const [deleteTrustedBy] = useDeleteTrustedByMutation();

const partners = (data?.trustedby ?? []).map((item, index) => ({
  id: item._id,
  name: item.title,
  image: `${BASE_URL}${item.image}`,
  lastUpdated: new Date(item.updatedAt).toLocaleString(),
  order: index + 1,
}));


  const [partnerForm, setPartnerForm] = useState({
    name: "",
    description: "",
    image: null,
    imagePreview: null,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPartnerForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddPartner = () => {
    setPartnerForm({
      name: "",
      description: "",
      image: null,
      imagePreview: null,
    });
    setViewMode("add-partner");
  };

  const handleEditPartner = (partner) => {
    setSelectedPartner(partner);
    setPartnerForm({
      name: partner.name,
      description: partner.description || "",
      image: null,
      imagePreview: partner.image,
    });
    setViewMode("edit-partner");
  };

  const handleSavePartner = async () => {
  if (!partnerForm.name.trim()) return alert("Name required");

  const formData = new FormData();
  formData.append("title", partnerForm.name);

  if (partnerForm.image) {
    formData.append("image", partnerForm.image);
  }

  try {
    if (viewMode === "edit-partner") {
      await updateTrustedBy({
        id: selectedPartner.id,
        formData,
      }).unwrap();
      alert("Partner updated successfully");
    } else {
      await createTrustedBy(formData).unwrap();
      alert("Partner added successfully");
    }

    setViewMode("overview");
    setSelectedPartner(null);
  } catch (err) {
    alert(err?.data?.message || "Operation failed");
  }
};


  const handleDeletePartner = async (id) => {
  if (!confirm("Delete this partner?")) return;

  try {
    await deleteTrustedBy(id).unwrap();
    alert("Partner deleted");
  } catch {
    alert("Failed to delete partner");
  }
};


  const handleCancel = () => {
    setViewMode("overview");
    setSelectedPartner(null);
  };

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (error) {
  return (
    <div className="p-10 text-center text-red-500">
      Failed to load trusted partners
    </div>
  );
}


  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-4 py-3 flex items-center shadow-sm">
          <button
            onClick={() => router.push("/cms-admin")}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="ml-3 text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Trusted Partners
          </h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Enhanced Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <Home size={16} className="text-slate-400" />
                <span className="hover:text-slate-700 transition-colors cursor-pointer">Home</span>
                <span className="text-slate-300">/</span>
                <span className="font-semibold text-slate-700">Trusted By</span>
                {viewMode !== "overview" && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500">
                      {viewMode === "add-partner" && "Add New Partner"}
                      {viewMode === "edit-partner" && `Editing: ${selectedPartner?.name}`}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/cms-admin")}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                    Trusted By Section
                  </h1>
                  <p className="text-base text-slate-600">
                    {viewMode === "overview"
                      ? "Manage trusted partners and their display order"
                      : "Add or edit partner information"}
                  </p>
                </div>
              </div>
            </div>

            {/* OVERVIEW MODE */}
            {viewMode === "overview" && (
              <div className="space-y-6">
                {/* Enhanced Partners Management Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 px-6 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-white">
                        <h2 className="text-xl sm:text-2xl font-bold mb-1">
                          Partners Management
                        </h2>
                        <p className="text-blue-100 text-sm">
                          {partners.length} trusted {partners.length === 1 ? 'partner' : 'partners'}
                        </p>
                      </div>
                      <button
                        onClick={handleAddPartner}
                        className="group w-full cursor-pointer sm:w-auto px-5 py-3 bg-white text-emerald-500 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
                      >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                        <span>Add New Partner</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Enhanced Search Bar */}
                    <div className="relative mb-6">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                        placeholder="Search partners by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        {/* Enhanced Partners Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {filteredPartners.map((partner, index) => (
                            <div
                              key={partner.id}
                              className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300"
                            >
                              <div className="p-6">
                                {/* Partner Image & Info */}
                                <div className="flex flex-col items-center mb-5">
                                  <div className="relative w-24 h-24 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-lg ring-4 ring-white group-hover:ring-blue-100 transition-all duration-300">
                                      <img
                                        src={partner.image}
                                        alt={partner.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-lg text-slate-900 text-center mb-2 group-hover:text-blue-600 transition-colors">
                                    {partner.name}
                                  </h3>
                                  {partner.description && (
                                    <p className="text-sm text-slate-600 text-center line-clamp-2 mb-3 px-2">
                                      {partner.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    <span>Updated: {partner.lastUpdated}</span>
                                  </div>
                                </div>

                                {/* Enhanced Action Buttons */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditPartner(partner)}
                                    className="flex-1 cursor-pointer py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                  >
                                    <Edit2 size={16} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePartner(partner.id)}
                                    className="flex-1 py-2.5 cursor-pointer bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Enhanced Empty State */}
                        {filteredPartners.length === 0 && (
                          <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                              <Search size={32} className="text-slate-400" />
                            </div>
                            <p className="text-slate-700 text-xl font-semibold mb-2">
                              No partners found
                            </p>
                            <p className="text-slate-500 text-base max-w-md mx-auto">
                              {searchQuery
                                ? "Try adjusting your search query to find what you're looking for"
                                : "Add your first trusted partner to get started"}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ADD/EDIT PARTNER MODE */}
            {(viewMode === "add-partner" || viewMode === "edit-partner") && (
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={handleCancel}
                  className="group cursor-pointer inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span>
                  <span>Back to Partners</span>
                </button>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Enhanced Form */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5">
                      <h2 className="text-2xl font-bold text-white">
                        {viewMode === "add-partner" ? "Add New Partner" : "Edit Partner"}
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">
                        {viewMode === "add-partner"
                          ? "Fill in the details below to add a new trusted partner"
                          : "Update partner information and save changes"}
                      </p>
                    </div>

                    <div className="p-6">
                      {/* Enhanced Image Upload */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Partner Logo/Image
                        </label>
                        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>Recommended: Square image (200x200px) JPG/PNG</span>
                        </p>

                        <label className="group border-2 border-dashed border-slate-300 rounded-2xl p-8 block text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 bg-slate-50">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />

                          {partnerForm.imagePreview ? (
                            <div className="flex flex-col items-center space-y-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-30"></div>
                                <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
                                  <img
                                    src={partnerForm.imagePreview}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-blue-600 font-medium">
                                <Upload size={16} />
                                <span>Click to change image</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
                                <ImageIcon size={32} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                              </div>
                              <div>
                                <p className="text-base font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                                  Click or drag to upload
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                  JPG, PNG up to 5MB
                                </p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Enhanced Name Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Partner Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                          placeholder="Enter partner name..."
                          value={partnerForm.name}
                          onChange={(e) =>
                            setPartnerForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={handleSavePartner}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              <span>{viewMode === "add-partner" ? "Add Partner" : "Save Changes"}</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isLoading}
                          className="sm:w-auto px-6 py-3.5 bg-slate-100 text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Preview */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5">
                      <h2 className="text-2xl font-bold text-white">
                        Live Preview
                      </h2>
                      <p className="text-emerald-100 text-sm mt-1">
                        See how your partner will appear on the website
                      </p>
                    </div>

                    <div className="p-6">
                      {/* Enhanced Preview Card */}
                      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 shadow-xl p-10 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-xl opacity-20"></div>
                          <div className="relative w-32 h-32 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-xl ring-4 ring-white">
                            {partnerForm.imagePreview ? (
                              <img
                                src={partnerForm.imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon size={48} className="text-slate-300" />
                            )}
                          </div>
                        </div>

                        <span className="text-lg font-bold text-slate-800 text-center">
                          {partnerForm.name || "Partner Name"}
                        </span>

                        {!partnerForm.name && (
                          <p className="text-sm text-slate-500 mt-2 text-center">
                            Enter a name to see the preview
                          </p>
                        )}
                      </div>

                      {/* Info Box */}
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Preview Tips</p>
                            <p className="text-blue-700">
                              This preview shows how your partner will be displayed on the live website. Make sure the logo is clear and the name is accurate.
                            </p>
                          </div>
                        </div>
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