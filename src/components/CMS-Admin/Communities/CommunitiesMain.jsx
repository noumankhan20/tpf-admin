"use client";
import React, { useState, useEffect, useMemo } from "react";
import { getMediaUrl } from "@/utils/media";
import {
    useGetCommunitiesQuery,
    useCreateCommunityMutation,
    useUpdateCommunityMutation,
    useDeleteCommunityMutation
} from "@/utils/slices/cms/communitiesApi";
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
import { toast } from "react-toastify";
import ConfirmModal from "@/components/Common/ConfirmModal";

export default function CommunitiesMain() {
    const {
        data,
        isLoading,
        error,
    } = useGetCommunitiesQuery();
    const [createCommunity] = useCreateCommunityMutation();
    const [updateCommunity] = useUpdateCommunityMutation();
    const [deleteCommunity] = useDeleteCommunityMutation();

    const [viewMode, setViewMode] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [communityForm, setCommunityForm] = useState({
        name: "",
        image: null,
        imagePreview: null,
        route: "",
    });



    const communities = React.useMemo(() => {
        if (!data?.communities) return [];

        return data.communities.map((item, index) => ({
            id: item._id,
            name: item.title,
            route: item.route || "",
            image: getMediaUrl(item.image),
            lastUpdated: new Date(item.updatedAt).toLocaleString(),
            order: index + 1,
            pendingDelete: item.pendingDelete || false, // 🔥 ADD THIS
        }));
    }, [data]);

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
            route: "",
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
            route: community.route || "",
        });
        setViewMode("edit-community");
    };

    const handleSaveCommunity = async () => {
        if (!communityForm.name) {
            toast.warn("Name is required");
            return;
        }

        if (viewMode === "edit-community") {
            await handleUpdateCommunity();
            return;
        }

        if (!communityForm.image) {
            toast.warn("Image is required");
            return;
        }

        const formData = new FormData();
        formData.append("title", communityForm.name);
        formData.append("image", communityForm.image);
        formData.append("route", communityForm.route);

        try {
            await createCommunity(formData).unwrap();
            toast.success("Community added successfully!");
            setViewMode("overview");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Operation Failed! Please try again later");
        }
    };


    const handleUpdateCommunity = async () => {
        if (!selectedCommunity) return;

        const formData = new FormData();
        formData.append("title", communityForm.name);
        formData.append("route", communityForm.route);
        if (communityForm.image) {
            formData.append("image", communityForm.image);
        }

        try {
            await updateCommunity({
                id: selectedCommunity.id,
                formData,
            }).unwrap();

            toast.success("Community updated successfully!");
            setViewMode("overview");
            setSelectedCommunity(null);
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Operation Failed! Please try again later");
        }
    };


    const handleDeleteCommunity = async (id) => {
        setDeleteId(id);
        setIsDeleting(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await deleteCommunity(deleteId).unwrap();
            toast.success(res?.message || "Operation successful");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Operation Failed! Please try again later");
        }
    };

    const handleCancel = () => {
        setViewMode("overview");
        setSelectedCommunity(null);
    };

    const filteredCommunities = communities.filter((community) =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (isLoading) {
        return <div className="p-10 text-center">Loading communities...</div>;
    }

    if (error) {
        return (
            <div className="p-10 text-center text-red-500">
                Failed to load communities
            </div>
        );
    }


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
                                <h1 className="text-xl font-bold text-gray-800">Communities Management</h1>
                                <p className="text-xs text-gray-500">Manage your community entries</p>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </header>

                    <ConfirmModal
                        isOpen={isDeleting}
                        onClose={() => setIsDeleting(false)}
                        onConfirm={confirmDelete}
                        title="Delete Community"
                        message="Are you sure you want to delete this community? This action cannot be undone."
                    />

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
                                                            {community.pendingDelete ? (
                                                                <button
                                                                    disabled
                                                                    className="flex-1 py-2 bg-yellow-400 text-white rounded-lg text-sm font-semibold cursor-not-allowed"
                                                                >
                                                                    ⏳ Pending
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleDeleteCommunity(community.id)}
                                                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm font-semibold"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete
                                                                </button>
                                                            )}
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