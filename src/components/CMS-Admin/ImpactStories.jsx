"use client";
import React, { useState, useEffect } from "react";
import { Save, XCircle, Home, Menu, Upload, Edit2, ArrowLeft, Trash2, Plus, Search, Eye, EyeOff, Users, ArrowRight, Sparkles, Image as ImageIcon, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    useGetImpactStoriesQuery,
    useCreateImpactStoryMutation,
    useUpdateImpactStoryMutation,
    useDeleteImpactStoryMutation,
} from "@/utils/slices/cms/impactApi";
const IMAGE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Live Preview Component
const StoryCardPreview = ({ story, darkMode = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer
        ${darkMode ? 'bg-zinc-800' : 'bg-white'}
        ${isHovered ? 'shadow-2xl shadow-emerald-500/10 scale-[1.02]' : 'shadow-md'}
        border ${darkMode ? 'border-zinc-700/50' : 'border-emerald-100'}`}
        >
            <div className="relative overflow-hidden h-48">
                <img
                    src={
                        story.image?.startsWith("data:")
                            ? story.image
                            : `${IMAGE_URL}${story.image}`
                    }
                    alt={story.title}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                    <div className="flex items-center gap-3 text-white text-sm">
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">1.2K+ helped</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <h3 className={`font-bold text-xl mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300 leading-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                    {story.title || "Story Title"}
                </h3>

                <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {story.excerpt || story.description || "Story description goes here..."}
                </p>

                <div className={`pt-3 border-t ${darkMode ? 'border-zinc-700' : 'border-emerald-100'}`}>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:gap-3 transition-all duration-300">
                        <span>Read the full story</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function StoryCardsCMS() {
    const {
        data,
        isLoading,
        error,
    } = useGetImpactStoriesQuery();

    const [createImpactStory] = useCreateImpactStoryMutation();
    const [updateImpactStory] = useUpdateImpactStoryMutation();
    const [deleteImpactStory] = useDeleteImpactStoryMutation();

    const storyCards = data?.data ?? [];

    const [viewMode, setViewMode] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCard, setSelectedCard] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewDarkMode, setPreviewDarkMode] = useState(false);
    const router = useRouter();

    const [cardForm, setCardForm] = useState({
        title: "",
        excerpt: "",
        story: "",
        mediaLinks: [],
        image: "",
        imageFile: null,
        imagePreview: null,
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image size should be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCardForm(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: reader.result,
                image: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddCard = () => {
        setCardForm({
            title: "",
            excerpt: "",
            story: "",
            mediaLinks: [],
            image: "",
            imageFile: null,
            imagePreview: null,
        });
        setViewMode("add-card");
    };

    const handleEditCard = (card) => {
        setSelectedCard(card);
        setCardForm({
            title: card.title,
            excerpt: card.description,
            story: card.story,
            mediaLinks: card.mediaLinks || [],
            image: card.image,
            imageFile: null,
            imagePreview: `${IMAGE_URL}${card.image}`,
        });
        setViewMode("edit-card");
    };

    const handleSaveCard = async () => {
        if (!cardForm.title.trim()) return alert("Title is required");
        if (!cardForm.excerpt.trim()) return alert("Description is required");

        try {
            const formData = new FormData();
            formData.append("title", cardForm.title);
            formData.append("description", cardForm.excerpt);
            formData.append("story", cardForm.story);

            if (cardForm.imageFile) {
                formData.append("image", cardForm.imageFile);
            }

            cardForm.mediaLinks.forEach(link => formData.append("mediaLinks", link));

            let res;

            if (viewMode === "edit-card" && selectedCard) {
                res = await updateImpactStory({ id: selectedCard._id, formData }).unwrap();

                alert("Story updated successfully!");
            } else {
                res = await createImpactStory(formData).unwrap();
                alert("Story added successfully!");
                setViewMode("overview");
                setSelectedCard(null);
            }
        } catch (err) {
            console.error("Error saving story:", err);
            alert(err.response?.data?.message || "Failed to save story");
        }
    };

    const handleDeleteCard = async (id) => {
        if (!confirm("Are you sure you want to delete this story?")) return;

        try {
            await deleteImpactStory(id).unwrap();
            alert("Story deleted successfully!");
        } catch (err) {
            console.error("Error deleting story:", err);
            alert("Failed to delete story");
        }
    };


    const filteredCards = storyCards.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );


    if (isLoading) {
        return <div className="p-10 text-center">Loading impact stories...</div>;
    }

    if (error) {
        return (
            <div className="p-10 text-center text-red-500">
                Failed to load impact stories
            </div>
        );
    }
    return (
        <div className="flex h-screen bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/20 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden bg-white/80 backdrop-blur-lg border-b border-emerald-100 px-4 py-3 flex items-center shadow-sm">
                    <h1 className="ml-3 text-lg font-bold text-emerald-900">Story Cards CMS</h1>
                </div>

                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-sm text-emerald-600 mb-3">
                                <Home size={16} />
                                <span className="font-medium">Home</span>
                                <span className="text-emerald-300">/</span>
                                <span className="font-semibold text-emerald-900">Story Cards</span>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => router.push("/cms-admin")}
                                    className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white transition-all border border-gray-300 shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900">
                                    Story Cards Management
                                </h1>
                            </div>
                            <p className="text-emerald-700">
                                Create and manage impactful story cards with beautiful visuals
                            </p>
                        </div>

                        {viewMode === "overview" && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-emerald-500/5 border border-emerald-100 p-6 sm:p-8">
                                    {/* Stats and Actions Bar */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                                                <ImageIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-emerald-900">Story Cards</h2>
                                                <p className="text-sm text-emerald-600 font-medium">{storyCards.length} active {storyCards.length === 1 ? 'card' : 'cards'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => setShowPreview(!showPreview)}
                                                className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${showPreview
                                                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                                                    : 'bg-white text-emerald-600 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50'
                                                    }`}
                                            >
                                                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                                                {showPreview ? 'Hide' : 'Show'} Preview
                                            </button>
                                            <button
                                                onClick={handleAddCard}
                                                className="px-6 py-2.5 cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02]"
                                            >
                                                <Plus size={18} />
                                                Add Story Card
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview Gallery */}
                                    {showPreview && (
                                        <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200">
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-emerald-600" />
                                                    Live Preview Gallery
                                                </h3>
                                            </div>
                                            <div className={`rounded-2xl p-6 ${previewDarkMode ? 'bg-zinc-900' : 'bg-white shadow-inner'}`}>
                                                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-50">
                                                    {storyCards.map(card => (
                                                        <div key={card._id} className="w-[320px] flex-shrink-0">
                                                            <StoryCardPreview story={card} darkMode={previewDarkMode} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Search Bar */}
                                    <div className="relative mb-8">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                                        <input
                                            className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-400 transition-all"
                                            placeholder="Search story cards..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Cards Grid */}
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredCards.map(card => (
                                            <div key={card._id} className="group bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-300">
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={`${IMAGE_URL}${card.image}`}
                                                        alt={card.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-emerald-900 group-hover:text-emerald-600 transition-colors">{card.title}</h3>
                                                    <p className="text-sm text-emerald-700 mb-3 line-clamp-2">{card.description}</p>
                                                    <p className="text-xs text-black mb-4 flex items-center gap-1.5">
                                                        <CheckCircle size={12} />
                                                        Updated: {new Date(card.updatedAt).toLocaleString()}
                                                    </p>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditCard(card)}
                                                            className="flex-1 cursor-pointer py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30"
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCard(card._id)}
                                                            className="flex-1 py-2.5 cursor-pointer bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 font-semibold flex items-center justify-center gap-2 text-sm transition-all duration-300"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredCards.length === 0 && (
                                        <div className="text-center py-20">
                                            <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-4">
                                                <Search size={48} className="text-emerald-400" />
                                            </div>
                                            <p className="text-emerald-700 text-lg font-semibold">No story cards found</p>
                                            <p className="text-emerald-500 text-sm mt-2">Try adjusting your search query</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(viewMode === "add-card" || viewMode === "edit-card") && (
                            <div className="space-y-6">
                                <button
                                    onClick={() => setViewMode("overview")}
                                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold group transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    Back to Story Cards
                                </button>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Form Section */}
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-emerald-500/5 border border-emerald-100 p-8">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-2 bg-emerald-100 rounded-xl">
                                                <Edit2 className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-emerald-900">
                                                {viewMode === "add-card" ? "Add New Story Card" : "Edit Story Card"}
                                            </h2>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                                Story Image *
                                            </label>
                                            <p className="text-xs text-emerald-600 mb-3">
                                                Recommended: 600x400px (landscape), JPG/PNG, max 10MB
                                            </p>

                                            <label className="border-3 border-dashed border-emerald-300 rounded-2xl p-8 block text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 group">
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                {cardForm.imagePreview ? (
                                                    <div className="space-y-3">
                                                        <img
                                                            src={cardForm.imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-56 object-cover rounded-xl shadow-lg"
                                                        />
                                                        <p className="text-sm text-emerald-600 font-semibold group-hover:text-emerald-700">Click to change image</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="inline-flex p-4 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                                                            <Upload size={32} className="text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-semibold text-emerald-900 mb-1">Click to upload image</p>
                                                            <p className="text-sm text-emerald-600">JPG, PNG up to 10MB</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </label>
                                        </div>

                                        {/* Title */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                                Story Title *
                                                <span className="text-xs font-normal text-emerald-500 ml-2">({cardForm.title.length}/100)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3.5 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-400 transition-all"
                                                placeholder="Enter story title..."
                                                value={cardForm.title}
                                                onChange={e => setCardForm(prev => ({ ...prev, title: e.target.value }))}
                                                maxLength={100}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                                Story Description *
                                                <span className="text-xs font-normal text-emerald-500 ml-2">({cardForm.excerpt.length}/300)</span>
                                            </label>
                                            <textarea
                                                rows={5}
                                                className="w-full px-4 py-3.5 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-400 resize-none transition-all"
                                                placeholder="Enter story description..."
                                                value={cardForm.excerpt}
                                                onChange={e => setCardForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                                maxLength={300}
                                            />
                                            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                                                <CheckCircle size={12} />
                                                Displayed as 2 lines on cards
                                            </p>
                                        </div>

                                        {/* Full Story */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-emerald-900 mb-2">
                                                Full Story Content *
                                            </label>
                                            <textarea
                                                rows={5}
                                                className="w-full px-4 py-3.5 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-400 resize-none transition-all"
                                                placeholder="Enter the complete story..."
                                                value={cardForm.story}
                                                onChange={e => setCardForm(prev => ({ ...prev, story: e.target.value }))}
                                            />
                                        </div>

                                        {/* Media Links */}
                                        <div className="mb-8">
                                            <label className="block text-sm font-bold text-emerald-900 mb-3">Media Links</label>
                                            <div className="space-y-3">
                                                {cardForm.mediaLinks.map((link, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={link}
                                                            onChange={(e) => {
                                                                const updated = [...cardForm.mediaLinks];
                                                                updated[index] = e.target.value;
                                                                setCardForm(prev => ({ ...prev, mediaLinks: updated }));
                                                            }}
                                                            className="flex-1 px-4 py-3 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-400 transition-all"
                                                            placeholder="Enter media link (YouTube / Drive / Image URL)"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setCardForm(prev => ({
                                                                    ...prev,
                                                                    mediaLinks: prev.mediaLinks.filter((_, i) => i !== index)
                                                                }))
                                                            }
                                                            className="p-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCardForm(prev => ({
                                                        ...prev,
                                                        mediaLinks: [...prev.mediaLinks, ""]
                                                    }))
                                                }
                                                className="mt-3 px-5 py-2.5 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-xl font-semibold hover:bg-emerald-200 transition-all flex items-center gap-2"
                                            >
                                                <Plus size={16} />
                                                Add Link
                                            </button>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSaveCard}
                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40"
                                            >
                                                <Save size={20} />
                                                {viewMode === "add-card" ? "Add Story Card" : "Save Changes"}
                                            </button>
                                            <button
                                                onClick={() => setViewMode("overview")}
                                                className="px-8 py-4 bg-white border-2 border-emerald-300 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={20} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview & Tips Section */}
                                    <div className="space-y-6">
                                        {/* Live Preview */}
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-emerald-500/5 border border-emerald-100 p-6">
                                            <h3 className="text-lg font-bold text-emerald-900 mb-5 flex items-center gap-2">
                                                <Eye className="w-5 h-5 text-emerald-600" />
                                                Live Preview
                                            </h3>
                                            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border-2 border-emerald-200">
                                                <StoryCardPreview story={cardForm} />
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