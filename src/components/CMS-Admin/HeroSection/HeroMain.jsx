"use client";
import React, { useState, useEffect } from "react";
import {
    Save,
    Home,
    ArrowLeft,
    Bell,
    ImageIcon,
    Eye,
    CheckCircle,
    XCircle,
} from "lucide-react";
import {
    useGetHeroQuery,
    useCreateHeroMutation,
    useUpdateHeroMutation
} from "@/utils/slices/cms/heroApi";
import { toast } from "react-toastify";
import { getMediaUrl } from "@/utils/media";
import HeroForm from "./HeroForm";
import HeroPreview from "./HeroPreview";

export default function HeroSection() {
    // State Management
    const [createHero] = useCreateHeroMutation();
    const [updateHero] = useUpdateHeroMutation();
    const { data, isLoading, error } = useGetHeroQuery();
    const [activeSection, setActiveSection] = useState("hero");
    const [viewMode, setViewMode] = useState("list");
    const [heroForm, setHeroForm] = useState({
        image: null,
        imagePreview: null,
        title: "",
        description: "",
        buttonText: "",
        buttonRoute: "",
    });
    const [existingHeros, setExistingHeros] = useState([]);
    const [selectedHero, setSelectedHero] = useState(null);

    const heroExists = existingHeros.length > 0;

    // Fetch existing heroes from backend
    useEffect(() => {
        if (data?.hero?.length > 0) {
            const hero = data.hero[0];

            const heroWithUrl = {
                ...hero,
                id: hero._id,
                image: hero.image
                    ? getMediaUrl(hero.image)
                    : null,
                lastUpdated: new Date(hero.updatedAt).toLocaleDateString(),
            };

            setExistingHeros([heroWithUrl]);
            setSelectedHero(heroWithUrl);
            setHeroForm({
                image: null,
                imagePreview: heroWithUrl.image,
                title: heroWithUrl.title || "",
                description: heroWithUrl.description || "",
                buttonText: heroWithUrl.buttonText || "",
                buttonRoute: heroWithUrl.buttonRoute || "",
            });

            setViewMode("edit");
        } else {
            setExistingHeros([]);
            setSelectedHero(null);
            setViewMode("list");
        }
    }, [data]);


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

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("title", heroForm.title);
            formData.append("description", heroForm.description);
            formData.append("buttonText", heroForm.buttonText);
            formData.append("buttonRoute", heroForm.buttonRoute);
            if (heroForm.image) {
                formData.append("image", heroForm.image);
            }

            if (selectedHero) {
                await updateHero({
                    id: selectedHero.id,
                    formData,
                }).unwrap();

                toast.success("Hero banner updated successfully!");
            } else {
                await createHero(formData).unwrap();
                toast.success("Hero banner created successfully!");
            }
        } catch (err) {
            console.error("Hero save failed:", err);
            toast.error("Failed to save hero banner");
        }
    };


    return (
        <>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 shadow-sm">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Hero Section Management</h1>
                                <p className="text-xs text-gray-500">Configure your website's hero banner</p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
                            {/* Breadcrumb */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <Home size={16} />
                                    <span>Home</span>
                                    <span>/</span>
                                    <span className="font-semibold text-gray-800">Hero Section</span>
                                    {viewMode === "edit" && selectedHero && (
                                        <>
                                            <span>/</span>
                                            <span className="text-gray-600">Editing: {selectedHero.title}</span>
                                        </>
                                    )}
                                </div>

                                {/* Stats Bar */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <ImageIcon className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{existingHeros.length}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Active Banner</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{heroExists ? 'Live' : 'Empty'}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                                <Eye className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{selectedHero?.lastUpdated || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Last Updated</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form and Preview Grid */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <HeroForm
                                    heroForm={heroForm}
                                    setHeroForm={setHeroForm}
                                    handleImageUpload={handleImageUpload}
                                    handleSave={handleSave}
                                    isEditMode={viewMode === "edit"}
                                />
                                <HeroPreview heroForm={heroForm} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}