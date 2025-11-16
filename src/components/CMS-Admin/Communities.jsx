"use client";
import React, { useState } from "react";
import {
  Upload,
  Save,
  XCircle,
  Home,
  Edit2,
  Trash2,
  Search,
  Plus,
  Menu,
  ImageIcon,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import Sidebar from "../Layout/CMSSideBar";

export default function CommunitiesCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("communities");

  // Communities State
  const [communities, setCommunities] = useState([
    {
      id: 1,
     name: "Blood Community", 
    image: "https://www.shutterstock.com/image-vector/high-quality-blood-drop-isolated-600nw-2589564683.jpg",
      lastUpdated: "2025-11-15 10:30",
      order: 1,
    },
    {
      id: 2,
       name: "Masjid Building Initiative", 
    image: "https://images.unsplash.com/photo-1512167108213-5ee155879c6a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFzamlkJTIwYnVpbGRpbmclMjBpbml0aWF0aXZlfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
      lastUpdated: "2025-11-14 15:20",
      order: 2,
    },
    {
      id: 3,
       name: "Quranic Studies Center", 
    image: "https://media.istockphoto.com/id/1161964542/photo/koran-holy-book-of-muslims-on-the-table-still-life.webp?a=1&b=1&s=612x612&w=0&k=20&c=q8tCvR0FT0W38pRIOTM_vFwV1ndJ3FRK42KhnvSYTPs=",
      lastUpdated: "2025-11-13 09:45",
      order: 3,
    },
    {
      id: 4,
     name: "Modern Islamic School Project", 
    image: "https://images.unsplash.com/photo-1643429096345-9de0d2ab7e7c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8TW9kZXJuJTIwSXNsYW1pYyUyMFNjaG9vbCUyMFByb2plY3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
      lastUpdated: "2025-11-12 14:10",
      order: 4,
    },
  ]);

  const [communityForm, setCommunityForm] = useState({
    name: "",
    image: null,
    imagePreview: null,
  });

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCommunityForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Edit Section Header
  const handleEditSection = () => {
    setViewMode("edit-section");
  };

  // Save Section Header
  const handleSaveSection = () => {
    alert("Section header updated successfully!");
    setViewMode("overview");
  };

  // Add New Community
  const handleAddCommunity = () => {
    setCommunityForm({
      name: "",
      image: null,
      imagePreview: null,
    });
    setViewMode("add-community");
  };

  // Edit Community
  const handleEditCommunity = (community) => {
    setSelectedCommunity(community);
    setCommunityForm({
      name: community.name,
      image: null,
      imagePreview: community.image,
    });
    setViewMode("edit-community");
  };

  // Save Community
  const handleSaveCommunity = () => {
    if (viewMode === "add-community") {
      const newCommunity = {
        id: Date.now(),
        ...communityForm,
        image: communityForm.imagePreview,
        lastUpdated: new Date().toLocaleString(),
        order: communities.length + 1,
      };
      setCommunities([...communities, newCommunity]);
      alert("Community added successfully!");
    } else {
      setCommunities(
        communities.map((community) =>
          community.id === selectedCommunity.id
            ? { 
                ...community, 
                ...communityForm,
                image: communityForm.imagePreview,
                lastUpdated: new Date().toLocaleString() 
              }
            : community
        )
      );
      alert("Community updated successfully!");
    }
    setViewMode("overview");
    setSelectedCommunity(null);
  };

  // Delete Community
  const handleDeleteCommunity = (id) => {
    if (confirm("Are you sure you want to delete this community?")) {
      setCommunities(communities.filter((community) => community.id !== id));
    }
  };

  // Move Community Up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newCommunities = [...communities];
    [newCommunities[index], newCommunities[index - 1]] = [newCommunities[index - 1], newCommunities[index]];
    
    // Update order values
    newCommunities.forEach((comm, idx) => {
      comm.order = idx + 1;
    });
    
    setCommunities(newCommunities);
  };

  // Move Community Down
  const handleMoveDown = (index) => {
    if (index === communities.length - 1) return;
    const newCommunities = [...communities];
    [newCommunities[index], newCommunities[index + 1]] = [newCommunities[index + 1], newCommunities[index]];
    
    // Update order values
    newCommunities.forEach((comm, idx) => {
      comm.order = idx + 1;
    });
    
    setCommunities(newCommunities);
  };

  // Cancel
  const handleCancel = () => {
    setViewMode("overview");
    setSelectedCommunity(null);
  };

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
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
        {/* Mobile Menu Button */}
       <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
                 <button
                   onClick={() => setSidebarOpen(true)}
                   className="p-2 hover:bg-gray-100 rounded-lg"
                   aria-label="Open menu"
                 >
                   <Menu size={24} className="text-gray-700" />
                 </button>
                 <h1 className="ml-3 text-lg font-bold text-[#0F172A]">Communities</h1>
               </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8">
            
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-[#64748B] mb-2">
                <Home size={16} />
                <span>Home</span>
                <span>/</span>
                <span className="font-semibold text-[#0F172A]">Communities</span>
                {viewMode !== "overview" && (
                  <>
                    <span>/</span>
                    <span className="text-[#64748B]">
                      {viewMode === "edit-section" && "Edit Section"}
                      {viewMode === "add-community" && "Add New Community"}
                      {viewMode === "edit-community" && `Editing: ${selectedCommunity?.name}`}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
                Communities Section
              </h1>
              <p className="text-sm sm:text-base text-[#475569]">
                {viewMode === "overview"
                  ? "Manage communities and section content."
                  : viewMode === "edit-section"
                  ?"Add or edit community information."
                : null}
              </p>
            </div>

            {/* OVERVIEW MODE */}
            {viewMode === "overview" && (
              <div className="space-y-6">

                {/* Communities Management */}
                <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-1">
                        Communities
                      </h2>
                      <p className="text-sm text-[#64748B]">
                        {communities.length} communities
                      </p>
                    </div>
                    <button
                      onClick={handleAddCommunity}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Plus size={16} />
                      <span>Add New Community</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      size={20}
                    />
                    <input
                      className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm"
                      placeholder="Search communities by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Communities Grid - Desktop & Tablet */}
                  <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredCommunities.map((community, index) => (
                      <div
                        key={community.id}
                        className="border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex">
                          {/* Reorder Controls */}
                          <div className="flex flex-col items-center justify-center bg-gray-50 px-2 py-4">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                                index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title="Move up"
                            >
                              <ChevronUp size={18} className="text-gray-600" />
                            </button>
                            <GripVertical size={16} className="text-gray-400 my-1" />
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === filteredCommunities.length - 1}
                              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                                index === filteredCommunities.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title="Move down"
                            >
                              <ChevronDown size={18} className="text-gray-600" />
                            </button>
                          </div>

                          {/* Image */}
                          <div className="relative w-32 flex-shrink-0 bg-gray-100">
                            <img
                              src={community.image}
                              alt={community.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4">
                            <h3 className="font-bold text-[#0F172A] mb-2 line-clamp-1">
                              {community.name}
                            </h3>
                            <p className="text-xs text-[#94A3B8] mb-4">
                              Updated: {community.lastUpdated}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCommunity(community)}
                                className="flex-1 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] flex items-center justify-center gap-2 text-sm"
                              >
                                <Edit2 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCommunity(community.id)}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Communities List - Mobile */}
                  <div className="sm:hidden space-y-4">
                    {filteredCommunities.map((community, index) => (
                      <div
                        key={community.id}
                        className="border border-[#E2E8F0] rounded-xl overflow-hidden"
                      >
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={community.image}
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                community.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {community.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          {/* Reorder Controls */}
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className={`p-2 bg-gray-100 rounded-lg ${
                                index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                              }`}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <span className="text-xs text-gray-500 flex-1">
                              Position: {index + 1}
                            </span>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === filteredCommunities.length - 1}
                              className={`p-2 bg-gray-100 rounded-lg ${
                                index === filteredCommunities.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'
                              }`}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>

                          <h3 className="font-bold text-[#0F172A] mb-2">
                            {community.name}
                          </h3>
                          <p className="text-xs text-[#94A3B8] mb-4">
                            Updated: {community.lastUpdated}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCommunity(community)}
                              className="flex-1 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] flex items-center justify-center gap-2 text-sm"
                            >
                              <Edit2 size={16} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCommunity(community.id)}
                              className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm"
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
                  {filteredCommunities.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-2">No communities found</p>
                      <p className="text-sm text-gray-400">
                        {searchQuery ? "Try adjusting your search" : "Add your first community to get started"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EDIT SECTION MODE */}
            {viewMode === "edit-section" && (
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Form */}
                <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">
                    Edit Section Header
                  </h2>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Section Title
                    </label>
                    <input
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm sm:text-base"
                      placeholder="Enter section title..."
                      value={sectionHeader.title}
                      onChange={(e) =>
                        setSectionHeader((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSaveSection}
                      className="flex-1 bg-[#3B82F6] text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#2563EB] flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Save size={18} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2.5 sm:py-3 border border-[#CBD5E1] rounded-lg font-semibold hover:bg-[#E2E8F0] flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <XCircle size={18} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">
                    Live Preview
                  </h2>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 sm:p-8 border border-emerald-100">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
                      {sectionHeader.title || "Section Title"}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* ADD/EDIT COMMUNITY MODE */}
            {(viewMode === "add-community" || viewMode === "edit-community") && (
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Form */}
                <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">
                    {viewMode === "add-community" ? "Add New Community" : "Edit Community"}
                  </h2>

                  {/* Image Upload */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Community Image
                    </label>
                    <p className="text-xs text-[#64748B] mb-2">
                      Recommended: 600x400px JPG/PNG
                    </p>

                    <label className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 sm:p-8 block text-center cursor-pointer hover:border-[#3B82F6] transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />

                      {communityForm.imagePreview ? (
                        <img
                          src={communityForm.imagePreview}
                          className="max-h-32 sm:max-h-40 mx-auto rounded-lg mb-3"
                          alt="Preview"
                        />
                      ) : (
                        <ImageIcon size={40} className="mx-auto text-[#94A3B8] mb-3" />
                      )}

                      <p className="text-sm sm:text-base text-[#1E293B] font-medium">
                        Click or drag to upload
                      </p>
                      <p className="text-xs sm:text-sm text-[#94A3B8]">
                        JPG, PNG up to 5MB
                      </p>
                    </label>
                  </div>

                  {/* Name */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Community Name
                    </label>
                    <input
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm sm:text-base"
                      placeholder="Enter community name..."
                      value={communityForm.name}
                      onChange={(e) =>
                        setCommunityForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSaveCommunity}
                      className="flex-1 bg-[#3B82F6] text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#2563EB] flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Save size={18} />
                      <span>{viewMode === "add-community" ? "Add Community" : "Save Changes"}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2.5 sm:py-3 border border-[#CBD5E1] rounded-lg font-semibold hover:bg-[#E2E8F0] flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <XCircle size={18} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">
                    Community Preview
                  </h2>
                  <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                    <div className="relative h-48 bg-gray-100">
                      {communityForm.imagePreview ? (
                        <img
                          src={communityForm.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={48} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <h3 className="font-semibold text-white text-lg mb-2 drop-shadow-md">
                          {communityForm.name || "Community Name"}
                        </h3>
                        <button className="cursor-pointer text-xs flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-colors duration-200">
                          Join Now
                        </button>
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