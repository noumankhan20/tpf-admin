"use client";
import React, { useState,useEffect } from "react";
import {
  Save,
  XCircle,
  Home,
  Edit2,
  Trash2,
  Search,
  Plus,
  Menu,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";

import axios from "axios";
export default function PartnersCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("trusted");
  const [partners, setPartners] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

useEffect(() => {
  fetchPartners();
}, []);

const fetchPartners = async () => {
  try {
    const res = await axios.get(`${API_URL}/cms/trusted-by/get`);
    if (res.data.success) {
      const formatted = res.data.trustedby.map((item, index) => ({
        id: item._id,
        name: item.title,
        image: `${BASE_URL}${item.image}`,
        lastUpdated: new Date(item.updatedAt).toLocaleString(),
        order: index + 1
      }));

      setPartners(formatted);
    }
  } catch (err) {
    console.error("Fetch trusted-by error:", err);
  }
};

  const [partnerForm, setPartnerForm] = useState({
    name: "",
    description: "",
    image: null,
    imagePreview: null,
  });

  // Handle Image Upload
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

  // Add New Partner
  const handleAddPartner = () => {
    setPartnerForm({
      name: "",
      description: "",
      image: null,
      imagePreview: null,
    });
    setViewMode("add-partner");
  };

  // Edit Partner
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

  // Save Partner
const handleSavePartner = async () => {
  if (!partnerForm.name.trim()) return alert("Name required");

  if (viewMode === "edit-partner") {
    return handleUpdatePartner();   // 🔥 call update instead of add
  }

  // Create mode
  if (!partnerForm.image) return alert("Image required");

  const formData = new FormData();
  formData.append("title", partnerForm.name);
  formData.append("image", partnerForm.image);

  try {
    const res = await axios.post(
      `${API_URL}/cms/trusted-by/add`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (res.data.success) {
      alert("Partner added successfully");
      fetchPartners();
      setViewMode("overview");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add partner");
  }
};


  const handleUpdatePartner = async () => {
  if (!selectedPartner) return;

  const formData = new FormData();
  formData.append("title", partnerForm.name);

  // only append image if user uploads a new one
  if (partnerForm.image) {
    formData.append("image", partnerForm.image);
  }

  try {
    const res = await axios.put(
      `${API_URL}/cms/trusted-by/update/${selectedPartner.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (res.data.success) {
      alert("Partner updated successfully");
      fetchPartners();
      setViewMode("overview");
      setSelectedPartner(null);
    }
  } catch (err) {
    console.error("Update failed:", err);
    alert("Failed to update partner");
  }
};


  // Delete Partner
  const handleDeletePartner = async (id) => {
  if (!confirm("Delete this partner?")) return;

  try {
    const res = await axios.delete(`${API_URL}/cms/trusted-by/delete/${id}`);

    if (res.data.success) {
      alert("Partner deleted");
      fetchPartners();
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete partner");
  }
};

  // Cancel
  const handleCancel = () => {
    setViewMode("overview");
    setSelectedPartner(null);
  };

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar Integration */}
      

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Menu Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <h1 className="ml-3 text-lg font-bold text-[#0F172A]">Trusted Partners</h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-[#64748B] mb-2">
                <Home size={16} />
                <span>Home</span>
                <span>/</span>
                <span className="font-semibold text-[#0F172A]">Trusted By</span>
                {viewMode !== "overview" && (
                  <>
                    <span>/</span>
                    <span className="text-[#64748B]">
                      {viewMode === "add-partner" && "Add New Partner"}
                      {viewMode === "edit-partner" && `Editing: ${selectedPartner?.name}`}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
                Trusted By Section
              </h1>
              <p className="text-sm sm:text-base text-[#475569]">
                {viewMode === "overview"
                  ? "Manage trusted partners and their display order."
                  : "Add or edit partner information."}
              </p>
            </div>

            {/* OVERVIEW MODE */}
            {viewMode === "overview" && (
              <div className="space-y-6">
                {/* Partners Management */}
                <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-1">
                        Partners
                      </h2>
                      <p className="text-sm text-[#64748B]">
                        {partners.length} trusted partners
                      </p>
                    </div>
                    <button
                      onClick={handleAddPartner}
                      className="w-full sm:w-auto px-4 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium cursor-pointer"
                    >
                      <Plus size={18} />
                      <span>Add New Partner</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      size={20}
                    />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search partners by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Partners Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {filteredPartners.map((partner, index) => (
                      <div
                        key={partner.id}
                        className="border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="p-4 sm:p-5">

                          {/* Partner Image & Info */}
                          <div className="flex flex-col items-center mb-4">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 mb-3">
                              <img
                                src={partner.image}
                                alt={partner.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-bold text-[#0F172A] text-center mb-1">
                              {partner.name}
                            </h3>
                            <p className="text-xs text-[#475569] text-center line-clamp-2 mb-2 px-2">
                              {partner.description}
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                              Updated: {partner.lastUpdated}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPartner(partner)}
                              className="flex-1 py-2.5 bg-[#103064] text-white rounded-lg hover:bg-[#2563EB] transition font-medium flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Edit2 size={16} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePartner(partner.id)}
                              className="flex-1 py-2.5 bg-red-900 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2 cursor-pointer"
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
                  {filteredPartners.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={28} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium mb-2">No partners found</p>
                      <p className="text-gray-400 text-sm">
                        {searchQuery ? "Try adjusting your search query" : "Add your first partner to get started"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADD/EDIT PARTNER MODE */}
            {(viewMode === "add-partner" || viewMode === "edit-partner") && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← Back to Partners
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">
                      {viewMode === "add-partner" ? "Add New Partner" : "Edit Partner"}
                    </h2>

                    {/* Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Partner Logo/Image
                      </label>
                      <p className="text-xs text-[#64748B] mb-3">
                        Recommended: Square image (200x200px) JPG/PNG
                      </p>

                      <label className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-8 block text-center cursor-pointer hover:border-[#3B82F6] hover:bg-blue-50 transition">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />

                        {partnerForm.imagePreview ? (
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-24 h-24 rounded-full overflow-hidden shadow-sm">
                              <img
                                src={partnerForm.imagePreview}
                                className="w-full h-full object-cover"
                                alt="Preview"
                              />
                            </div>
                            <p className="text-sm text-blue-600 font-medium">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <ImageIcon size={48} className="mx-auto text-[#94A3B8]" />
                            <div>
                              <p className="text-sm font-medium text-[#1E293B]">
                                Click or drag to upload
                              </p>
                              <p className="text-xs text-[#94A3B8] mt-1">
                                JPG, PNG up to 5MB
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Name */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Partner Name *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleSavePartner}
                        className="flex-1 bg-[#3B82F6] text-white py-3 rounded-lg font-medium hover:bg-[#2563EB] transition flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        <span>{viewMode === "add-partner" ? "Add Partner" : "Save Changes"}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">
                      Live Preview
                    </h2>

                    {/* Main Preview Card */}
                    <div className="bg-white rounded-xl border-2 border-zinc-200 hover:border-emerald-500 shadow-lg p-8 flex flex-col items-center justify-center transition-all duration-300 mb-6">
                      <div className="relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 mb-4 shadow-md">
                        {partnerForm.imagePreview ? (
                          <img
                            src={partnerForm.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={40} className="text-gray-300" />
                        )}
                      </div>

                      <span className="text-sm font-semibold text-zinc-700 text-center">
                        {partnerForm.name || "Partner Name"}
                      </span>
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