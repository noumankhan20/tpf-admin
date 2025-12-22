"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Home,
    ArrowLeft,
    Bell,
    Image,
    Eye,
    CheckCircle,
    XCircle,
    Search,
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    GripVertical,
    Users
} from "lucide-react";
import CommunityForm from "./CommunitiesForm";
import CommunityPreview from "./CommunitiesPreview";
export default function CommunitiesMain() {
    const [viewMode, setViewMode] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [successText, setSuccessText] = useState("");
    
    const [communityForm, setCommunityForm] = useState({
        name: "",
        image: null,
        imagePreview: null,
    });

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    useEffect(() => {
        if (showErrorMessage) {
            const timer = setTimeout(() => setShowErrorMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showErrorMessage]);

    const fetchCommunities = async () => {
        try {
            const response = await axios.get(`${API_URL}/cms/communities/get`);
            
            if (response.data.success) {
                const formatted = response.data.commmunities.map((item, index) => ({
                    id: item._id,
                    name: item.title,
                    image: `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.image}`,
                    lastUpdated: new Date(item.updatedAt).toLocaleString(),
                    order: index + 1,
                }));

                setCommunities(formatted);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

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

    const handleAddCommunity = () => {
        setCommunityForm({
            name: "",
            image: null,
            imagePreview: null,
        });
        setSelectedCommunity(null);
        setViewMode("add-community");
    };

    const handleEditCommunity = (community) => {
        setSelectedCommunity(community);
        setCommunityForm({
            name: community.name,
            image: null,
            imagePreview: community.image,
        });
        setViewMode("edit-community");
    };

    const handleSaveCommunity = async () => {
        if (!communityForm.name) {
            alert("Name is required");
            return;
        }

        if (viewMode === "edit-community") {
            await handleUpdateCommunity();
            return;
        }

        if (!communityForm.image) {
            alert("Image is required");
            return;
        }

        const formData = new FormData();
        formData.append("title", communityForm.name);
        formData.append("image", communityForm.image);

        try {
            const response = await axios.post(
                `${API_URL}/cms/communities/add`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success) {
                setSuccessText("Community added successfully!");
                setShowSuccessMessage(true);
                fetchCommunities();
                setViewMode("overview");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setShowErrorMessage(true);
        }
    };

    const handleUpdateCommunity = async () => {
        if (!selectedCommunity) return;

        const formData = new FormData();
        formData.append("title", communityForm.name);

        if (communityForm.image) {
            formData.append("image", communityForm.image);
        }

        try {
            const response = await axios.put(
                `${API_URL}/cms/communities/update/${selectedCommunity.id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success) {
                setSuccessText("Community updated successfully!");
                setShowSuccessMessage(true);
                fetchCommunities();
                setViewMode("overview");
                setSelectedCommunity(null);
            }
        } catch (error) {
            console.error("Update error:", error);
            setShowErrorMessage(true);
        }
    };

    const handleDeleteCommunity = async (id) => {
        const confirmDelete = confirm("Are you sure you want to delete this community?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`${API_URL}/cms/communities/delete/${id}`);

            if (response.data.success) {
                setSuccessText("Community deleted successfully!");
                setShowSuccessMessage(true);
                fetchCommunities();
            }
        } catch (error) {
            console.error("Delete error:", error);
            setShowErrorMessage(true);
        }
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newCommunities = [...communities];
        [newCommunities[index], newCommunities[index - 1]] = [newCommunities[index - 1], newCommunities[index]];
        
        newCommunities.forEach((comm, idx) => {
            comm.order = idx + 1;
        });
        
        setCommunities(newCommunities);
    };

    const handleMoveDown = (index) => {
        if (index === communities.length - 1) return;
        const newCommunities = [...communities];
        [newCommunities[index], newCommunities[index + 1]] = [newCommunities[index + 1], newCommunities[index]];
        
        newCommunities.forEach((comm, idx) => {
            comm.order = idx + 1;
        });
        
        setCommunities(newCommunities);
    };

    const handleCancel = () => {
        setViewMode("overview");
        setSelectedCommunity(null);
    };

    const filteredCommunities = communities.filter((community) =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return (
        <>
            {/* Success Toast */}
            {showSuccessMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md w-[90%] sm:w-auto animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold">{successText}</p>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {showErrorMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-600 to-red-400 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md w-[90%] sm:w-auto animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold">Operation Failed!</p>
                        <p className="text-sm text-red-100">Please try again later</p>
                    </div>
                </div>
            )}

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
                                <h1 className="text-xl font-bold text-gray-800">Communities Management</h1>
                                <p className="text-xs text-gray-500">Manage your community entries</p>
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
                                    <span className="font-semibold text-gray-800">Communities</span>
                                    {viewMode !== "overview" && (
                                        <>
                                            <span>/</span>
                                            <span className="text-gray-600">
                                                {viewMode === "add-community" && "Add New"}
                                                {viewMode === "edit-community" && `Editing: ${selectedCommunity?.name}`}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Stats Bar - Only in Overview */}
                                {viewMode === "overview" && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-800">{communities.length}</p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Communities</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-800">Active</p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                                    <Eye className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-800">Live</p>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Visibility</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* OVERVIEW MODE */}
                            {viewMode === "overview" && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 border-b border-gray-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-800 mb-1">All Communities</h2>
                                                <p className="text-sm text-gray-600">{communities.length} communities listed</p>
                                            </div>
                                            <button
                                                onClick={handleAddCommunity}
                                                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                                            >
                                                <Plus size={18} />
                                                <span>Add Community</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Search Bar */}
                                        <div className="relative mb-6">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                placeholder="Search communities by name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        {/* Communities Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredCommunities.map((community, index) => (
                                                <div
                                                    key={community.id}
                                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                                >
                                                    {/* Image */}
                                                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                                                        <img
                                                            src={community.image}
                                                            alt={community.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                                        
                                                        {/* Reorder Controls */}
                                                        <div className="absolute top-2 left-2 flex gap-1 bg-white/90 rounded-lg p-1">
                                                            <button
                                                                onClick={() => handleMoveUp(index)}
                                                                disabled={index === 0}
                                                                className={`p-1.5 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                                                title="Move up"
                                                            >
                                                                <ChevronUp size={16} className="text-gray-700" />
                                                            </button>
                                                            <GripVertical size={16} className="text-gray-400 self-center" />
                                                            <button
                                                                onClick={() => handleMoveDown(index)}
                                                                disabled={index === filteredCommunities.length - 1}
                                                                className={`p-1.5 rounded ${index === filteredCommunities.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                                                title="Move down"
                                                            >
                                                                <ChevronDown size={16} className="text-gray-700" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4">
                                                        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                                                            {community.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mb-4">
                                                            Updated: {community.lastUpdated}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditCommunity(community)}
                                                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                                                            >
                                                                <Edit2 size={14} />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCommunity(community.id)}
                                                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                                                            >
                                                                <Trash2 size={14} />
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

                            {/* ADD/EDIT MODE */}
                            {(viewMode === "add-community" || viewMode === "edit-community") && (
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <CommunityForm
                                        communityForm={communityForm}
                                        setCommunityForm={setCommunityForm}
                                        handleImageUpload={handleImageUpload}
                                        handleSave={handleSaveCommunity}
                                        handleCancel={handleCancel}
                                        isEditMode={viewMode === "edit-community"}
                                    />
                                    <CommunityPreview communityForm={communityForm} />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}