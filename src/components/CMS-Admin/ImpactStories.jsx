"use client";
import React, { useState } from "react";
import { Save, XCircle, Home, Menu, Upload, Edit2, Trash2, Plus, Search, Eye, EyeOff, Users, ArrowRight } from "lucide-react";
import Sidebar from "../Layout/CMSSideBar";

// Live Preview Component
const StoryCardPreview = ({ story, darkMode = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group flex-shrink-0 rounded-3xl overflow-hidden transition-all duration-700 cursor-pointer
        ${darkMode ? 'bg-zinc-800' : 'bg-white'}
        ${isHovered ? 'shadow-2xl scale-105' : 'shadow-lg'}
        border ${darkMode ? 'border-zinc-700/50' : 'border-zinc-200'}`}
        >
            <div className="relative overflow-hidden h-48">
                {story.image ? (
                    <img
                        src={story.image}
                        alt={story.title}
                        className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-125 group-hover:rotate-2"
                    />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 text-white text-sm">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">1.2K+ helped</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <h3 className={`font-bold text-xl mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors duration-300 leading-tight ${darkMode ? 'text-white' : 'text-zinc-900'
                    }`}>
                    {story.title || "Story Title"}
                </h3>

                <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                    {story.excerpt || "Story description goes here..."}
                </p>

                <div className={`pt-3 border-t ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
                    <div className={`inline-flex items-center gap-2 text-sm font-bold transition-all duration-300 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                        <span>Read the full story</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function StoryCardsCMS() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCard, setSelectedCard] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewDarkMode, setPreviewDarkMode] = useState(false);

    const [storyCards, setStoryCards] = useState([
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
            title: "Building Wells in Rural Communities",
            excerpt: "Providing clean water access to villages across East Africa, transforming lives one well at a time.",
            status: "Active",
            lastUpdated: "2025-11-16 10:30",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600",
            title: "Education for Underprivileged Children",
            excerpt: "Supporting schools and providing scholarships to children who dream of a better future through education.",
            status: "Active",
            lastUpdated: "2025-11-15 14:20",
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600",
            title: "Medical Aid for Refugee Families",
            excerpt: "Delivering essential healthcare and medical supplies to displaced families in crisis zones.",
            status: "Active",
            lastUpdated: "2025-11-14 09:15",
        },
    ]);

    const [cardForm, setCardForm] = useState({
        title: "",
        excerpt: "",
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
            excerpt: card.excerpt,
            image: card.image,
            imageFile: null,
            imagePreview: card.image,
        });
        setViewMode("edit-card");
    };

    const handleSaveCard = () => {
        if (!cardForm.title.trim()) {
            alert("Title is required");
            return;
        }
        if (cardForm.title.length > 100) {
            alert("Title must be less than 100 characters");
            return;
        }
        if (!cardForm.excerpt.trim()) {
            alert("Description is required");
            return;
        }
        if (cardForm.excerpt.length > 300) {
            alert("Description must be less than 300 characters");
            return;
        }
        if (!cardForm.imagePreview) {
            alert("Image is required");
            return;
        }

        if (viewMode === "add-card") {
            const newCard = {
                id: Date.now(),
                title: cardForm.title,
                excerpt: cardForm.excerpt,
                image: cardForm.imagePreview,
                status: "Active",
                lastUpdated: new Date().toLocaleString(),
            };
            setStoryCards([...storyCards, newCard]);
            alert("✅ Story card added successfully!");
        } else {
            setStoryCards(storyCards.map(card =>
                card.id === selectedCard.id
                    ? {
                        ...card,
                        title: cardForm.title,
                        excerpt: cardForm.excerpt,
                        image: cardForm.imagePreview,
                        lastUpdated: new Date().toLocaleString(),
                    }
                    : card
            ));
            alert("✅ Story card updated successfully!");
        }

        setViewMode("overview");
        setSelectedCard(null);
    };

    const handleDeleteCard = (id) => {
        if (confirm("Are you sure you want to delete this story card?")) {
            setStoryCards(storyCards.filter(card => card.id !== id));
            alert("Story card deleted successfully");
        }
    };

    const handleExportData = () => {
        const exportData = storyCards.map(({ id, image, title, excerpt }) => ({
            id, image, title, excerpt
        }));
        console.log("Story Cards Data:", JSON.stringify(exportData, null, 2));
        alert("Story cards data exported to console!");
    };

    const filteredCards = storyCards.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="md:hidden bg-white border-b px-4 py-3 flex items-center">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <h1 className="ml-3 text-lg font-bold">Story Cards</h1>
                </div>

                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Home size={16} />
                                <span>Home</span>
                                <span>/</span>
                                <span className="font-semibold text-gray-900">Story Cards</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Story Cards Management
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage story cards with images, titles, and descriptions
                            </p>
                        </div>

                        {viewMode === "overview" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold mb-1">Story Cards</h2>
                                            <p className="text-sm text-gray-600">{storyCards.length} active cards</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setShowPreview(!showPreview)}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                            >
                                                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                                                {showPreview ? "Hide" : "Show"} Preview
                                            </button>
                                            <button
                                                onClick={handleAddCard}
                                                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Add Story Card
                                            </button>
                                        </div>
                                    </div>

                                    {showPreview && (
                                        <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold">Live Preview Gallery</h3>
                                                <button
                                                    onClick={() => setPreviewDarkMode(!previewDarkMode)}
                                                    className="px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
                                                >
                                                    {previewDarkMode ? "Light" : "Dark"} Mode
                                                </button>
                                            </div>
                                            <div className={`rounded-xl p-6 ${previewDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                                                <div className="flex gap-4 overflow-x-auto pb-4">
                                                    {storyCards.map(card => (
                                                        <div key={card.id} className="w-[320px] flex-shrink-0">
                                                            <StoryCardPreview story={card} darkMode={previewDarkMode} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search story cards..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredCards.map(card => (
                                            <div key={card.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                                                <div className="relative h-48">
                                                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                                    <div className="absolute top-2 right-2">
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                            {card.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{card.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.excerpt}</p>
                                                    <p className="text-xs text-gray-400 mb-4">Updated: {card.lastUpdated}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditCard(card)}
                                                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCard(card.id)}
                                                            className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-1 text-sm"
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
                                        <div className="text-center py-16">
                                            <Search size={48} className="mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-500 text-lg font-medium">No story cards found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(viewMode === "add-card" || viewMode === "edit-card") && (
                            <div className="space-y-6">
                                <button onClick={() => setViewMode("overview")} className="text-gray-600 hover:text-gray-900 font-medium">
                                    ← Back to Story Cards
                                </button>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl shadow-sm border p-6">
                                        <h2 className="text-xl font-bold mb-6">
                                            {viewMode === "add-card" ? "Add New Story Card" : "Edit Story Card"}
                                        </h2>

                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold mb-2">
                                                Story Image *
                                            </label>
                                            <p className="text-xs text-gray-600 mb-3">
                                                Recommended: 600x400px (landscape), JPG/PNG, max 10MB
                                            </p>

                                            <label className="border-2 border-dashed rounded-xl p-6 block text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                {cardForm.imagePreview ? (
                                                    <div className="space-y-3">
                                                        <img src={cardForm.imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                                        <p className="text-sm text-blue-600 font-medium">Click to change</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <Upload size={48} className="mx-auto text-gray-400" />
                                                        <p className="text-sm font-medium">Click to upload</p>
                                                        <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold mb-2">
                                                Story Title * <span className="text-xs font-normal text-gray-500">({cardForm.title.length}/100)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter story title..."
                                                value={cardForm.title}
                                                onChange={e => setCardForm(prev => ({ ...prev, title: e.target.value }))}
                                                maxLength={100}
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold mb-2">
                                                Story Description * <span className="text-xs font-normal text-gray-500">({cardForm.excerpt.length}/300)</span>
                                            </label>
                                            <textarea
                                                rows={5}
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                placeholder="Enter story description..."
                                                value={cardForm.excerpt}
                                                onChange={e => setCardForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                                maxLength={300}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                This will be truncated to 2 lines on the frontend (line-clamp-2)
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSaveCard}
                                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                                            >
                                                <Save size={18} />
                                                {viewMode === "add-card" ? "Add Story Card" : "Save Changes"}
                                            </button>
                                            <button
                                                onClick={() => setViewMode("overview")}
                                                className="px-6 py-3 border-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-white rounded-xl shadow-sm border p-6">
                                            <h3 className="text-lg font-bold mb-4">Live Preview</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-semibold mb-2 block">Light Mode</label>
                                                    <StoryCardPreview story={cardForm} darkMode={false} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold mb-2 block">Dark Mode</label>
                                                    <div className="bg-zinc-900 p-4 rounded-xl">
                                                        <StoryCardPreview story={cardForm} darkMode={true} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                                            <h3 className="text-lg font-bold mb-4">💡 Best Practices</h3>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-600">•</span>
                                                    <span><strong>Image:</strong> Use high-quality landscape images (3:2 ratio)</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-600">•</span>
                                                    <span><strong>Title:</strong> Keep it concise and impactful (40-60 chars)</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-600">•</span>
                                                    <span><strong>Description:</strong> Focus on the impact and outcome (100-150 chars)</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-600">•</span>
                                                    <span><strong>Hover Effects:</strong> Preview includes all animations and transitions</span>
                                                </li>
                                            </ul>
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