"use client";
import React, { useState, useMemo } from 'react';
import { Camera, MapPin, Calendar, Bell, ArrowLeft, Eye, Download, Clock, User, Menu, X, ExternalLink, CheckCircle, Link as LinkIcon, Search, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetSocialAssignmentsQuery,
    useSubmitSocialLinksMutation,
    useCompleteSocialTaskMutation
} from '../../utils/slices/socialMediaApiSlice';
import { toast } from 'react-toastify';

const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// --- Sub-Components ---

const StatsCard = ({ title, count, subtitle, icon: Icon, colorClass, bgClass, onClick, active }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-xl p-4 sm:p-6 transition-all duration-300 cursor-pointer border ${active ? 'ring-2 ring-emerald-500 shadow-md border-emerald-200' : 'hover:shadow-md border-gray-200'} bg-white`}
    >
        <div className="flex items-center justify-between z-10 relative">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className={`text-2xl sm:text-3xl font-bold mt-1 ${colorClass}`}>{count}</h3>
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl ${bgClass}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
        </div>
    </div>
);

const CampaignCard = ({ campaign, onAction, actionLabel, actionIcon: ActionIcon, actionColor, onView }) => {
    // Combine heroImage and photos for display
    const displayImage = campaign.heroImage || (campaign.photos && campaign.photos[0]?.url) || 'https://via.placeholder.com/400?text=No+Image';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative mb-4 overflow-hidden rounded-xl h-48">
                <img
                    src={displayImage}
                    alt={campaign.campaignName}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md ${campaign.status === 'pending'
                        ? 'bg-orange-100/90 text-orange-700'
                        : 'bg-emerald-100/90 text-emerald-700'
                        }`}>
                        {campaign.status}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {campaign.campaignName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {campaign.description || 'No description provided.'}
                    </p>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex flex-wrap gap-y-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <div className="w-full flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{campaign.beneficiaryName}</span>
                        </div>
                        <div className="w-full flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>Deadline: {formatDate(campaign.deadline)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            onClick={() => onView(campaign)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Details
                        </button>
                        <button
                            onClick={() => onAction(campaign)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all ${actionColor === 'green'
                                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200/50'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200/50'
                                }`}
                        >
                            <ActionIcon className="w-4 h-4" />
                            {actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Component ---

const SocialMediaDashboard = () => {
    const { data: assignmentsData, isLoading, refetch } = useGetSocialAssignmentsQuery();
    const [submitLinks, { isLoading: isSubmittingLinks }] = useSubmitSocialLinksMutation();
    const [completeTask, { isLoading: isCompletingTask }] = useCompleteSocialTaskMutation();

    const [activeTab, setActiveTab] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [socialLinks, setSocialLinks] = useState({
        instagram: '', facebook: '', youtube: '', twitter: '', linkedin: '', other: ''
    });

    const campaigns = assignmentsData?.data || [];

    const pendingCampaigns = useMemo(() => campaigns.filter(c => c.status === 'pending'), [campaigns]);
    const completedCampaigns = useMemo(() => campaigns.filter(c => c.status === 'completed'), [campaigns]);

    const filteredList = useMemo(() => {
        const list = activeTab === 'pending' ? pendingCampaigns : completedCampaigns;
        if (!searchQuery.trim()) return list;
        return list.filter(c =>
            c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [activeTab, pendingCampaigns, completedCampaigns, searchQuery]);

    const handleViewCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setIsViewModalOpen(true);
    };

    const handleMarkAsComplete = (campaign) => {
        setSelectedCampaign(campaign);
        setSocialLinks({ instagram: '', facebook: '', youtube: '', twitter: '', linkedin: '', other: '' });
        setIsCompleteModalOpen(true);
    };

    const handleDownloadImage = (imageUrl) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `campaign-image-${Date.now()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmitCompletion = async () => {
        if (!selectedCampaign) return;

        try {
            // 1. Submit the social media links
            const submitResponse = await submitLinks({
                taskId: selectedCampaign.taskId,
                campaignId: selectedCampaign.campaignId,
                links: socialLinks
            }).unwrap();

            if (submitResponse.success) {
                // 2. Mark the task as complete in the workflow
                const completeResponse = await completeTask({
                    taskId: selectedCampaign.taskId
                }).unwrap();

                if (completeResponse.success) {
                    toast.success("Links submitted and campaign marked as complete!");
                    setIsCompleteModalOpen(false);
                    setSelectedCampaign(null);
                    setActiveTab('completed');
                    refetch();
                } else {
                    toast.error(completeResponse.message || "Failed to complete the task.");
                }
            } else {
                toast.error(submitResponse.message || "Failed to submit social links.");
            }
        } catch (error) {
            console.error("Error completing campaign:", error);
            toast.error(error?.data?.message || "An error occurred while finalizing the campaign.");
        }
    };

    const handleLinkChange = (e) => {
        const { name, value } = e.target;
        setSocialLinks(prev => ({ ...prev, [name]: value }));
    };

    const isProcessing = isSubmittingLinks || isCompletingTask;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800">Social Media Portal</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            {pendingCampaigns.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                {/* Welcome & Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Welcome Banner */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
                                <Camera className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Social Media Dashboard</h1>
                                <p className="text-emerald-100 max-w-xl text-sm sm:text-base opacity-90">
                                    Manage campaign promotions, download assets, and track social presence across all platforms effectively.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatsCard
                            title="Pending Promotions"
                            count={pendingCampaigns.length}
                            subtitle="Campaigns waiting for update"
                            icon={Clock}
                            colorClass="text-orange-600"
                            bgClass="bg-orange-50"
                            active={activeTab === 'pending'}
                            onClick={() => setActiveTab('pending')}
                        />
                        <StatsCard
                            title="Completed Campaigns"
                            count={completedCampaigns.length}
                            subtitle="Successfully promoted"
                            icon={CheckCircle}
                            colorClass="text-emerald-600"
                            bgClass="bg-emerald-50"
                            active={activeTab === 'completed'}
                            onClick={() => setActiveTab('completed')}
                        />
                    </div>
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sticky top-20 z-20 bg-gray-50/50 py-2 backdrop-blur-sm">
                    {/* Tabs */}
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex w-full sm:w-auto">
                        {['pending', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns, beneficiaries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredList.length > 0 ? (
                            filteredList.map(campaign => (
                                <CampaignCard
                                    key={campaign.taskId}
                                    campaign={campaign}
                                    onView={handleViewCampaign}
                                    onAction={activeTab === 'pending' ? handleMarkAsComplete : handleViewCampaign}
                                    actionLabel={activeTab === 'pending' ? "Mark Complete" : "View"}
                                    actionIcon={activeTab === 'pending' ? CheckCircle : Eye}
                                    actionColor={activeTab === 'pending' ? 'green' : 'blue'}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600">No campaigns found</h3>
                                <p className="text-sm">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* View Modal */}
            {isViewModalOpen && selectedCampaign && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col shadow-2xl"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h3 className="text-xl font-bold text-gray-900">Campaign Details</h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedCampaign.campaignName}</h4>
                                        <p className="text-gray-600 leading-relaxed">{selectedCampaign.description || 'No description available for this campaign.'}</p>
                                    </div>

                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Camera className="w-4 h-4 text-emerald-500" />
                                            Media Assets
                                        </h5>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {/* Hero Image */}
                                            {selectedCampaign.heroImage && (
                                                <div className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100 ring-2 ring-emerald-500 ring-offset-2">
                                                    <img src={selectedCampaign.heroImage} alt="Hero" className="w-full h-full object-cover cursor-pointer" onClick={() => setSelectedImage(selectedCampaign.heroImage)} />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[10px] py-0.5 text-center font-bold">HERO IMAGE</div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDownloadImage(selectedCampaign.heroImage); }}
                                                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            {/* Campaign Photos */}
                                            {selectedCampaign.photos?.map((photo, idx) => (
                                                <div key={idx} className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100">
                                                    <img src={photo.url} alt={`Campaign ${idx}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setSelectedImage(photo.url)} />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDownloadImage(photo.url); }}
                                                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!selectedCampaign.heroImage && (!selectedCampaign.photos || selectedCampaign.photos.length === 0)) && (
                                                <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                                    No assets available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-sm text-gray-600 border border-gray-100">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Beneficiary</p>
                                            <p className="font-medium text-gray-900">{selectedCampaign.beneficiaryName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                                            <p className="font-medium text-gray-900">{selectedCampaign.location || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Deadline</p>
                                            <p className="font-medium text-gray-900">{formatDate(selectedCampaign.deadline)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Task Type</p>
                                            <p className="font-medium text-gray-900">{selectedCampaign.taskType?.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>

                                    {selectedCampaign.status === 'pending' && (
                                        <button
                                            onClick={() => { setIsViewModalOpen(false); handleMarkAsComplete(selectedCampaign); }}
                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Go to Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Complete Task Modal */}
            {isCompleteModalOpen && selectedCampaign && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Finalize Promotion</h3>
                                <p className="text-sm text-gray-500">Submit social proofs for {selectedCampaign.campaignName}</p>
                            </div>
                            <button onClick={() => setIsCompleteModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitCompletion(); }} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'other'].map((platform) => (
                                        <div key={platform} className="col-span-1">
                                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                                <LinkIcon className="w-3.5 h-3.5" />
                                                {platform}
                                            </label>
                                            <input
                                                type="url"
                                                name={platform}
                                                value={socialLinks[platform]}
                                                onChange={handleLinkChange}
                                                placeholder={`Paste ${platform} link...`}
                                                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 rounded-full shrink-0">
                                        <Bell className="w-4 h-4 text-amber-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-amber-900">Requirement</h4>
                                        <p className="text-xs text-amber-700 mt-0.5">Please provide at least one valid social link to finalize this promotion.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => setIsCompleteModalOpen(false)}
                                        className="flex-1 px-5 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing || !Object.values(socialLinks).some(link => link.trim())}
                                        className="flex-1 px-5 py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Submit & Complete'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Image Preview Overlay */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-7xl max-h-screen">
                        <img src={selectedImage} alt="Full Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                        <button className="absolute -top-12 right-0 text-white/70 hover:text-white p-2" onClick={() => setSelectedImage(null)}>
                            <X className="w-8 h-8" />
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SocialMediaDashboard;