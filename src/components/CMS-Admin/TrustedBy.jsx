"use client";
import React, { useState } from "react";
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
import Sidebar from "../Layout/CMSSideBar";
export default function PartnersCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("trusted");

  // Partners State
  const [partners, setPartners] = useState([
    {
      id: 1,
      name: "Seed Charity",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fc05b786f1645447ab878b73ca4dd6870%2Ff0e211f4eed743b9a70fe6b4b6001b85?format=webp&width=2000",
      lastUpdated: "2025-11-15 10:30",
      order: 1,
    },
    {
      id: 2,
      name: "Global Family Aid",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fc05b786f1645447ab878b73ca4dd6870%2Fe9df5f33b91d46a293a5d3c661e5ad00?format=webp&width=2000",
      lastUpdated: "2025-11-14 15:20",
      order: 2,
    },
    {
      id: 3,
      name: "Human Relief",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fc05b786f1645447ab878b73ca4dd6870%2F1bf296792ea647b9aa7980631140b241?format=webp&width=2000",
      lastUpdated: "2025-11-13 09:45",
      order: 3,
    },
    {
      id: 4,
      name: "Maan",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fc05b786f1645447ab878b73ca4dd6870%2F9256431f39904e7997bbf0d7f19e2f96?format=webp&width=2000",
      lastUpdated: "2025-11-12 14:10",
      order: 4,
    },
    {
      id: 5,
      name: "UN-ICC",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fc05b786f1645447ab878b73ca4dd6870%2Fed5a55b79ee24f20a5cc6fd1abe39177?format=webp&width=2000",
      lastUpdated: "2025-11-11 11:25",
      order: 5,
    },
    {
      id: 6,
      name: "Little Tree Foundation",
      image: "https://cdn.builder.io/api/v1/image/assets%2Fc05b786f1645447ab878b73ca4dd6870%2F4d5eb38bd91446389d6773e87a9aa424?format=webp&width=2000",
      lastUpdated: "2025-11-10 16:40",
      order: 6,
    },
  ]);

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
  const handleSavePartner = () => {
    if (!partnerForm.name.trim()) {
      alert("Please enter a partner name");
      return;
    }

    if (viewMode === "add-partner") {
      const newPartner = {
        id: Date.now(),
        name: partnerForm.name,
        description: partnerForm.description,
        image: partnerForm.imagePreview,
        status: "Active",
        lastUpdated: new Date().toLocaleString(),
        order: partners.length + 1,
      };
      setPartners([...partners, newPartner]);
      alert("Partner added successfully!");
    } else {
      setPartners(
        partners.map((partner) =>
          partner.id === selectedPartner.id
            ? { 
                ...partner, 
                name: partnerForm.name,
                description: partnerForm.description,
                image: partnerForm.imagePreview,
                lastUpdated: new Date().toLocaleString() 
              }
            : partner
        )
      );
      alert("Partner updated successfully!");
    }
    setViewMode("overview");
    setSelectedPartner(null);
  };

  // Delete Partner
  const handleDeletePartner = (id) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      setPartners(partners.filter((partner) => partner.id !== id));
    }
  };

  // Move Partner Up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newPartners = [...partners];
    [newPartners[index], newPartners[index - 1]] = [newPartners[index - 1], newPartners[index]];
    
    newPartners.forEach((partner, idx) => {
      partner.order = idx + 1;
    });
    
    setPartners(newPartners);
  };

  // Move Partner Down
  const handleMoveDown = (index) => {
    if (index === partners.length - 1) return;
    const newPartners = [...partners];
    [newPartners[index], newPartners[index + 1]] = [newPartners[index + 1], newPartners[index]];
    
    newPartners.forEach((partner, idx) => {
      partner.order = idx + 1;
    });
    
    setPartners(newPartners);
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
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />

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
                          {/* Reorder Controls */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-gray-500 font-medium">
                              Position: {index + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                                  index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                }`}
                                title="Move up"
                              >
                                <ChevronUp size={16} className="text-gray-600 cursor-pointer" />
                              </button>
                              <GripVertical size={16} className="text-gray-400" />
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === filteredPartners.length - 1}
                                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                                  index === filteredPartners.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                }`}
                                title="Move down"
                              >
                                <ChevronDown size={16} className="text-gray-600 cursor-pointer" />
                              </button>
                            </div>
                          </div>

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