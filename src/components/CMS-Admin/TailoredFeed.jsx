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
  Image as ImageIcon,
} from "lucide-react";
import Sidebar from "@/components/Layout/CMSSideBar";
export default function TailoredFeedCMS() {
  const [viewMode, setViewMode] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("feed");

  const [feedItems, setFeedItems] = useState([
    {
      id: 1,
      title: "Financial Emergency Aid ",
      mediaUrl: "https://media.istockphoto.com/id/813320518/photo/social-assistance.webp?a=1&b=1&s=612x612&w=0&k=20&c=ViKfqudhFcslXku_zcd9RYePinRk6gWWi1S7qL6kVwI=",
    },
    {
      id: 2,
      title: "Global Muslim Crisis Support ", 
      mediaUrl: "https://images.unsplash.com/photo-1573886578907-58681efbaad3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8R2xvYmFsJTIwTXVzbGltJTIwQ3Jpc2lzJTIwU3VwcG9ydHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
  },
    {
      id: 3,
      title: "Eid Kits(Eid-al-Fitr)", 
      mediaUrl: "https://i.etsystatic.com/27296220/r/il/cd44af/3622176989/il_570xN.3622176989_2kws.jpg",
    },
    {
      id: 4,
      title: "Clean Water Initiative",
      mediaUrl: "https://images.unsplash.com/photo-1541844053589-346841d0b34c?w=600",
    },
  ]);

  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    mediaFile: null,
    mediaPreview: null,
    mediaUrl: "",
  });

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

  const handleAddItem = () => {
    setItemForm({
      title: "",
      description: "",
      mediaFile: null,
      mediaPreview: null,
      mediaUrl: "",
    });
    setViewMode("add-item");
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setItemForm({
      title: item.title,
      description: item.description,
      mediaFile: null,
      mediaPreview: item.mediaUrl,
      mediaUrl: item.mediaUrl,
    });
    setViewMode("edit-item");
  };

  const handleSaveItem = () => {
    if (viewMode === "add-item") {
      const newItem = {
        id: Date.now(),
        ...itemForm,
        status: "Active",
        lastUpdated: new Date().toLocaleString(),
      };
      setFeedItems([...feedItems, newItem]);
      alert("Item added successfully!");
    } else {
      setFeedItems(
        feedItems.map((item) =>
          item.id === selectedItem.id
            ? { ...item, ...itemForm, lastUpdated: new Date().toLocaleString() }
            : item
        )
      );
      alert("Item updated successfully!");
    }
    setViewMode("overview");
    setSelectedItem(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setFeedItems(feedItems.filter((item) => item.id !== id));
    }
  };

  const handleCancel = () => {
    setViewMode("overview");
    setSelectedItem(null);
  };

  const filteredItems = feedItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

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
          <h1 className="ml-3 text-lg font-bold text-[#0F172A]">Feed Items</h1>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* OVERVIEW */}
            {viewMode === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-1">
                        Feed Items
                      </h2>
                      <p className="text-sm text-[#64748B]">
                        {feedItems.length} items in carousel
                      </p>
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search items by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48 bg-gray-100">
                          <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="p-4 sm:p-5">
                          <h3 className="font-bold text-[#0F172A] text-lg mb-2 line-clamp-1">{item.title}</h3>
                          <p className="text-sm text-[#475569] mb-3 line-clamp-2">{item.description}</p>
                          <p className="text-xs text-[#94A3B8] mb-4">Updated: {item.lastUpdated}</p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="flex-1 py-2.5 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition font-medium flex items-center justify-center gap-2"
                            >
                              <Edit2 size={16} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredItems.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Search size={28} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium mb-2">No items found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search query</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADD / EDIT ITEM */}
            {(viewMode === "add-item" || viewMode === "edit-item") && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ← Back
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#0F172A]">
                      {viewMode === "add-item" ? "Edit Item" : null}

                    </h2>

                    {/* Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-3 text-[#0F172A]">Image Upload</label>

                      <label className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-8 block text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />

                        {itemForm.mediaPreview ? (
                          <div className="space-y-3">
                            <img src={itemForm.mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                            <p className="text-sm text-blue-600 font-medium">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <ImageIcon size={48} className="mx-auto text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Click or drag to upload</p>
                              <p className="text-xs text-gray-500 mt-1">Recommended 600×400 JPG / PNG</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Item Title</label>
                      <input
                        className="w-full px-4 py-2.5 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter item title..."
                        value={itemForm.title}
                        onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2" 
                        onClick={handleSaveItem}
                      >
                        <Save size={18} />
                        <span>{viewMode === "add-item" ? "Add Item" : "Save Changes"}</span>
                      </button>

                      <button
                        className="sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                        onClick={handleCancel}
                      >
                        <XCircle size={18} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#0F172A]">Live Preview</h2>

                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
                      <div className="relative h-64 bg-gray-100">
                        {itemForm.mediaPreview ? (
                          <img src={itemForm.mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <ImageIcon size={56} className="text-gray-300 mb-3" />
                            <p className="text-gray-400 text-sm">No image uploaded</p>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-[#0F172A]">
                          {itemForm.title || "Item Title"}
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                          {itemForm.description || "Item description will appear here..."}
                        </p>
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