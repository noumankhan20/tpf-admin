"use client";
import React, { useState, useEffect } from "react";
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
import axios from "axios";

export default function CMSAdminPanel() {
    // SIDEBAR STATE
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");

    // HERO PAGE STATES
    const [viewMode, setViewMode] = useState("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [heroForm, setHeroForm] = useState({
        image: null,
        imagePreview: null,
        title: "",
        description: "",
        buttonText: "",
        buttonLink: "",
    });
    const [existingHeros, setExistingHeros] = useState([]);
    const [selectedHero, setSelectedHero] = useState(null);
    const heroExists = existingHeros.length > 0;

    // Fetch existing heroes from backend
    const fetchHeroes = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/cms/hero/get`);
            const heroes = res.data.hero || [];

            const heroesWithUrls = heroes.map(hero => ({
                ...hero,
                id: hero._id,
                image: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000'}${hero.image}`,
                lastUpdated: new Date(hero.updatedAt).toLocaleDateString()
            }));

            console.log("Heroes fetched successfully:", heroes);
            setExistingHeros(heroesWithUrls);

        } catch (error) {
            console.error("Failed to fetch heroes:", error);
        }
    };

    useEffect(() => {
        fetchHeroes();
    }, []);

    useEffect(() => {
        if (existingHeros.length > 0) {
            const hero = existingHeros[0];

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
        } else {
            setViewMode("list");
        }
    }, [existingHeros]);



    const filteredHeros = existingHeros.filter((hero) =>
        hero.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hero.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setHeroForm((prev) => ({
                ...prev,
                image: file,
                imagePreview: reader.result, // Preview image
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append("title", heroForm.title);
        formData.append("description", heroForm.description);
        if (heroForm.image) {
            formData.append("image", heroForm.image); // Append the image file only if new image is uploaded
        }

        try {
            // If selectedHero is not null, update the Hero section
            if (selectedHero) {
                // ✅ UPDATE EXISTING HERO ONLY
                const res = await axios.put(
                    `${process.env.NEXT_PUBLIC_BACKEND_API}/cms/hero/update/${selectedHero.id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                alert(res.data.message || "Hero updated successfully");
            } else {
                // ✅ EXTRA SAFETY: BLOCK CREATE
                if (existingHeros.length > 0) {
                    alert("Only one hero banner is allowed.");
                    return;
                }

                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_API}/cms/hero/add`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                alert(res.data.message || "Hero created successfully");
            }


            // Reset the form and go back to the list view
            setHeroForm({
                image: null,
                imagePreview: null,
                title: "",
                description: "",
            });
            // setSelectedHero(null);
            // setViewMode("list");
            fetchHeroes(); // Refresh the list of heroes after creating or updating
        } catch (error) {
            console.error("Error while saving hero:", error);
            alert("Failed to save hero section");
        }
    };

    const handleEditHero = (hero) => {
        setSelectedHero(hero);
        setHeroForm({
            image: null,
            imagePreview: hero.image || null, // Image preview for the edit view
            title: hero.title || "",
            description: hero.description || "",
            buttonText: hero.buttonText || "",
            buttonLink: hero.buttonLink || "",
        });
        setViewMode("edit");
    };

  const handleCancel = () => {
  if (heroExists && existingHeros.length > 0) {
    const hero = existingHeros[0];

    // ✅ Restore original hero data
    setSelectedHero(hero);
    setHeroForm({
      image: null,
      imagePreview: hero.image || null,
      title: hero.title || "",
      description: hero.description || "",
      buttonText: hero.buttonText || "",
      buttonLink: hero.buttonLink || "",
    });

    setViewMode("edit"); // ✅ Always go back to edit
  } else {
    // ✅ No hero exists → reset to add mode
    setHeroForm({
      image: null,
      imagePreview: null,
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
    });

    setSelectedHero(null);
    setViewMode("list");
  }
};


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
                                {viewMode === "list" && !heroExists && (
                                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">

                                        {/* ✅ ADD HERO FORM */}
                                        <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                                            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">
                                                Add Hero Section
                                            </h2>

                                            {/* IMAGE UPLOAD */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                                                    Hero Image
                                                </label>

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
                                                        <Upload size={40} className="mx-auto text-[#94A3B8] mb-3" />
                                                    )}

                                                    <p className="text-sm text-[#1E293B] font-medium">
                                                        Click or drag to upload
                                                    </p>
                                                </label>
                                            </div>

                                            {/* TITLE */}
                                            <div className="mb-5">
                                                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                                                    Title
                                                </label>
                                                <input
                                                    className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg"
                                                    value={heroForm.title}
                                                    onChange={(e) =>
                                                        setHeroForm((prev) => ({ ...prev, title: e.target.value }))
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
                                                    className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg"
                                                    value={heroForm.description}
                                                    onChange={(e) =>
                                                        setHeroForm((prev) => ({ ...prev, description: e.target.value }))
                                                    }
                                                />
                                            </div>

                                            {/* SAVE BUTTON */}
                                            <button
                                                onClick={handleSave}
                                                className="w-full bg-[#22C55E] text-white py-3 rounded-lg font-semibold"
                                            >
                                                Create Hero
                                            </button>
                                        </div>

                                        {/* ✅ PREVIEW */}
                                        <div className="bg-white rounded-xl shadow border border-[#E2E8F0] p-4 sm:p-6">
                                            <h2 className="text-lg font-bold mb-4">Live Preview</h2>

                                            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] min-h-[300px] flex items-center justify-center">
                                                {heroForm.imagePreview && (
                                                    <img
                                                        src={heroForm.imagePreview}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                                                    />
                                                )}

                                                <div className="relative z-10 text-center px-4">
                                                    <h1 className="text-3xl font-bold text-white mb-3">
                                                        {heroForm.title || "Your Hero Title"}
                                                    </h1>

                                                    <p className="text-white/90">
                                                        {heroForm.description || "Hero description here…"}
                                                    </p>
                                                </div>
                                            </div>
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

                                            {/* BUTTONS */}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={handleSave}
                                                    className="flex-1 bg-[#3B82F6] text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#2563EB] flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                                                >
                                                    <Save size={18} />
                                                    Save Changes
                                                </button>

                                                <button
                                                    onClick={handleCancel}
                                                    className="px-6 py-2.5 sm:py-3 border border-[#CBD5E1] rounded-lg font-semibold hover:bg-[#E2E8F0] flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
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