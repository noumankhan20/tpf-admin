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
    Menu,
    ImageIcon,
} from "lucide-react";
import Sidebar from "../Layout/CMSSideBar";

export default function CMSAdminPanel() {
    // SIDEBAR STATE
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");

    // HERO PAGE STATES
    const [viewMode, setViewMode] = useState("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedHero, setSelectedHero] = useState(null);

    const emptyHeroForm = {
        image: null,
        imagePreview: null,
        title: "",
        description: "",
        buttonText: "",
        buttonLink: "",
    };

    const [heroForm, setHeroForm] = useState(emptyHeroForm);

    const [existingHeros, setExistingHeros] = useState([
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400",
            title: "Make a Difference Today",
            description: "Join thousands of donors making an impact worldwide.",
            status: "Active",
            lastUpdated: "2025-11-10 14:30",
            buttonText: "Donate Now",
            buttonLink: "https://example.com/donate",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400",
            title: "Transform Lives Together",
            description: "Your donation provides food, shelter, and hope.",
            status: "Draft",
            lastUpdated: "2025-11-08 09:15",
            buttonText: "Know More",
            buttonLink: "https://example.com/more",
        },
    ]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setHeroForm((prev) => ({
                ...prev,
                image: file,
                imagePreview: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleEditHero = (hero) => {
        setSelectedHero(hero);
        setHeroForm({
            image: null,
            imagePreview: hero.image || null,
            title: hero.title || "",
            description: hero.description || "",
            buttonText: hero.buttonText || "",
            buttonLink: hero.buttonLink || "",
        });
        setViewMode("edit");
    };

    const handleSave = () => {
        alert("Changes saved (UI only – connect API later).");
        setViewMode("list");
        setSelectedHero(null);
        setHeroForm(emptyHeroForm);
    };

    const handleCancel = () => {
        setViewMode("list");
        setSelectedHero(null);
        setHeroForm(emptyHeroForm);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this hero section?")) {
            setExistingHeros((prev) => prev.filter((h) => h.id !== id));
        }
    };

    const filteredHeros = existingHeros.filter((hero) =>
        hero.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* IMPORTED SIDEBAR COMPONENT */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* MOBILE MENU BUTTON */}
                <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
                          <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Open menu"
                          >
                            <Menu size={24} className="text-gray-700" />
                          </button>
                          <h1 className="ml-3 text-lg font-bold text-[#0F172A]">Hero Section</h1>
                        </div>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 md:p-8">
                        {activeSection === "hero" ? (
                            <>
                                {/* PAGE HEADER */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 text-sm text-[#64748B] mb-2">
                                        <Home size={16} />
                                        <span>Home</span>
                                        <span>/</span>
                                        <span className="font-semibold text-[#0F172A]">
                                            Hero Section
                                        </span>
                                        {viewMode === "edit" && selectedHero && (
                                            <>
                                                <span>/</span>
                                                <span className="text-[#64748B]">
                                                    Editing: {selectedHero.title}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
                                        Hero Section
                                    </h1>
                                    <p className="text-sm sm:text-base text-[#475569]">
                                        {viewMode === "list"
                                            ? "View and manage all hero banners on the website."
                                            : "Edit the selected hero banner content."}
                                    </p>
                                </div>

                                {/* LIST VIEW */}
                                {viewMode === "list" && (
                                    <div>
                                        {/* SEARCH BAR */}
                                        <div className="bg-white border border-[#E2E8F0] shadow rounded-xl p-4 mb-4 sm:mb-6">
                                            <div className="relative">
                                                <Search
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                                                    size={20}
                                                />
                                                <input
                                                    className="w-full pl-10 pr-4 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm sm:text-base"
                                                    placeholder="Search by title..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* DESKTOP TABLE */}
                                        <div className="hidden md:block bg-white shadow rounded-xl border border-[#E2E8F0] overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[800px]">
                                                    <thead className="bg-[#1E293B] text-white">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-sm">Image</th>
                                                            <th className="px-4 py-3 text-left text-sm">Title</th>
                                                            <th className="px-4 py-3 text-left text-sm">Description</th>
                                                            <th className="px-4 py-3 text-left text-sm">Updated</th>
                                                            <th className="px-4 py-3 text-left text-sm">Actions</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {filteredHeros.map((hero) => (
                                                            <tr
                                                                key={hero.id}
                                                                className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                                            >
                                                                <td className="px-4 py-3">
                                                                    <img
                                                                        src={hero.image}
                                                                        className="w-14 h-14 rounded-lg object-cover"
                                                                        alt={hero.title}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold text-sm">
                                                                    {hero.title}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-[#475569] max-w-[220px] truncate">
                                                                    {hero.description}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-[#64748B]">
                                                                    {hero.lastUpdated}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleEditHero(hero)}
                                                                            className="p-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB]"
                                                                        >
                                                                            <Edit2 size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(hero.id)}
                                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* MOBILE CARD VIEW */}
                                        <div className="md:hidden space-y-4">
                                            {filteredHeros.map((hero) => (
                                                <div
                                                    key={hero.id}
                                                    className="bg-white rounded-xl shadow border border-[#E2E8F0] overflow-hidden"
                                                >
                                                    <img
                                                        src={hero.image}
                                                        alt={hero.title}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-bold text-[#0F172A] text-base">
                                                                {hero.title}
                                                            </h3>
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ml-2 ${hero.status === "Active"
                                                                    ? "bg-[#3B82F6] text-white"
                                                                    : "bg-[#94A3B8] text-white"
                                                                    }`}
                                                            >
                                                                {hero.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[#475569] mb-3">
                                                            {hero.description}
                                                        </p>
                                                        <p className="text-xs text-[#94A3B8] mb-4">
                                                            Updated: {hero.lastUpdated}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditHero(hero)}
                                                                className="flex-1 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <Edit2 size={16} />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(hero.id)}
                                                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* EDIT VIEW */}
                                {viewMode === "edit" && selectedHero && (
                                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                                        {/* FORM */}
                                        <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                                            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">
                                                Edit Hero Section
                                            </h2>

                                            {/* IMAGE UPLOAD */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                                                    Hero Image
                                                </label>
                                                <p className="text-xs text-[#64748B] mb-2">
                                                    Size: height 665px, width 2049px
                                                </p>

                                                <label className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 sm:p-8 block text-center cursor-pointer hover:border-[#3B82F6] transition">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                    />

                                                    {heroForm.imagePreview ? (
                                                        <img
                                                            src={heroForm.imagePreview}
                                                            className="max-h-32 sm:max-h-40 mx-auto rounded-lg mb-3"
                                                            alt="Preview"
                                                        />
                                                    ) : (
                                                        <Upload
                                                            size={40}
                                                            className="mx-auto text-[#94A3B8] mb-3"
                                                        />
                                                    )}

                                                    <p className="text-sm sm:text-base text-[#1E293B] font-medium">
                                                        Click or drag to upload
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                                                        Recommended 1920x1080 JPG/PNG
                                                    </p>
                                                </label>
                                            </div>

                                            {/* TITLE */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                                                    Title
                                                </label>
                                                <input
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm sm:text-base"
                                                    placeholder="Enter title..."
                                                    value={heroForm.title}
                                                    onChange={(e) =>
                                                        setHeroForm((prev) => ({
                                                            ...prev,
                                                            title: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>

                                            {/* DESCRIPTION */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm sm:text-base resize-none"
                                                    placeholder="Short description..."
                                                    value={heroForm.description}
                                                    onChange={(e) =>
                                                        setHeroForm((prev) => ({
                                                            ...prev,
                                                            description: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>

                                            {/* BUTTON TEXT */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                                                    Button Text
                                                </label>
                                                <input
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm sm:text-base"
                                                    placeholder="Donate Now"
                                                    value={heroForm.buttonText}
                                                    onChange={(e) =>
                                                        setHeroForm((prev) => ({
                                                            ...prev,
                                                            buttonText: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>

                                            {/* BUTTON LINK */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                                                    Button Link
                                                </label>
                                                <input
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#60A5FA] text-sm sm:text-base"
                                                    placeholder="https://..."
                                                    value={heroForm.buttonLink}
                                                    onChange={(e) =>
                                                        setHeroForm((prev) => ({
                                                            ...prev,
                                                            buttonLink: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>

                                            {/* BUTTONS */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={handleSave}
                                                    className="flex-1 bg-[#3B82F6] text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#2563EB] flex items-center justify-center gap-2 text-sm sm:text-base"
                                                >
                                                    <Save size={18} />
                                                    Save Changes
                                                </button>

                                                <button
                                                    onClick={handleCancel}
                                                    className="px-6 py-2.5 sm:py-3 border border-[#CBD5E1] rounded-lg font-semibold hover:bg-[#E2E8F0] flex items-center justify-center gap-2 text-sm sm:text-base"
                                                >
                                                    <XCircle size={18} />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>

                                        {/* PREVIEW */}
                                        <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                                            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">
                                                Live Preview
                                            </h2>

                                            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
                                                {heroForm.imagePreview && (
                                                    <img
                                                        src={heroForm.imagePreview}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                                                        alt="Background"
                                                    />
                                                )}

                                                {!heroForm.imagePreview && (
                                                    <ImageIcon
                                                        size={48}
                                                        className="text-[#94A3B8] opacity-30"
                                                    />
                                                )}

                                                <div className="relative z-10 text-center px-4 sm:px-6">
                                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                                                        {heroForm.title || "Your Hero Title"}
                                                    </h1>

                                                    <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-4 sm:mb-6">
                                                        {heroForm.description ||
                                                            "Your description will appear here…"}
                                                    </p>

                                                    {heroForm.buttonText && (
                                                        <button className="bg-[#3B82F6] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#2563EB] shadow-xl text-sm sm:text-base">
                                                            {heroForm.buttonText}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Placeholder for other sections
                            <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-8 sm:p-12 text-center">
                                <p className="text-sm sm:text-base text-[#94A3B8]">
                                    This section is under development. Check back soon for content management features.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}