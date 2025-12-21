
"use client";
import React, { useState } from 'react';
import { Camera, MapPin, Calendar, Bell, ArrowLeft, Eye, Download, Clock, User, Menu, X, ExternalLink, CheckCircle, Link as LinkIcon } from 'lucide-react';

// Mock Campaign Data with full details
const mockCampaigns = [
    {
        id: 1,
        title: 'Rural Education Initiative - Computer Lab Setup',
        description: 'Setting up computer labs in rural schools to provide digital education access to underprivileged students. This campaign aims to bridge the digital divide and empower young minds with technology skills essential for their future.',
        campaignName: 'Rural Education Initiative',
        beneficiaryName: 'Priya Sharma',
        address: 'Village Khajuraho, District Chhatarpur, Madhya Pradesh, 471606',
        deadline: '2025-01-15',
        status: 'pending',
        createdAt: '2024-12-08',
        images: [
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600'
        ],
        cmsAdminName: 'Rajesh Kumar',
        socialLinks: null
    },
    {
        id: 2,
        title: 'Healthcare Support - Mobile Medical Van',
        description: 'Deploying mobile medical vans to provide free healthcare services in remote villages. Our medical team will conduct health check-ups, distribute medicines, and create health awareness among rural communities.',
        campaignName: 'Healthcare Support',
        beneficiaryName: 'Amit Singh',
        address: 'Village Bundi, District Tonk, Rajasthan, 304804',
        deadline: '2025-01-25',
        status: 'pending',
        createdAt: '2024-12-06',
        images: [
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600'
        ],
        cmsAdminName: 'Priya Sharma',
        socialLinks: null
    }
];

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const SocialMediaDashboard = () => {
    const [campaigns, setCampaigns] = useState(mockCampaigns);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [socialLinks, setSocialLinks] = useState({
        instagram: '',
        facebook: '',
        youtube: '',
        twitter: '',
        linkedin: '',
        other: ''
    });

    const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');

    const handleViewCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setIsViewModalOpen(true);
    };

    const handleMarkAsComplete = (campaign) => {
        setSelectedCampaign(campaign);
        setSocialLinks({
            instagram: '',
            facebook: '',
            youtube: '',
            twitter: '',
            linkedin: '',
            other: ''
        });
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

    const handleLinkChange = (e) => {
        const { name, value } = e.target;
        setSocialLinks(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitCompletion = () => {
        if (!selectedCampaign) return;

        const updatedCampaigns = campaigns.map(campaign => {
            if (campaign.id === selectedCampaign.id) {
                return {
                    ...campaign,
                    status: 'completed',
                    socialLinks: socialLinks,
                    completedAt: new Date().toISOString()
                };
            }
            return campaign;
        });

        setCampaigns(updatedCampaigns);
        setIsCompleteModalOpen(false);
        setSelectedCampaign(null);
        setSocialLinks({
            instagram: '',
            facebook: '',
            youtube: '',
            twitter: '',
            linkedin: '',
            other: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="w-full px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Left: Back button */}
                        <button
                            onClick={() => console.log('Back to portal')}
                            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 cursor-pointer sm:h-4" />
                            <span className="hidden xs:inline">Back</span>
                        </button>

                        {/* Right: Notification, Title & User */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                {pendingCampaigns.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold">
                                        {pendingCampaigns.length}
                                    </span>
                                )}
                            </div>

                            {/* Title & Icon */}
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <Camera className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 leading-tight">
                                        Social Media Manager
                                    </h1>
                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                        Campaign Management
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-800 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-4 sm:mb-6 lg:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Camera className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold">Welcome Back!</h2>
                            <p className="text-blue-100 text-xs sm:text-sm lg:text-lg">Manage and promote campaigns</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                            </div>
                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{pendingCampaigns.length}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">Pending Campaigns</h3>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Ready to promote</p>
                    </div>

                    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                            </div>
                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{completedCampaigns.length}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">Completed</h3>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Successfully promoted</p>
                    </div>
                </div>

                {/* Pending Campaigns */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
                    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">Pending Campaigns</h2>
                        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mt-0.5 sm:mt-1">New campaigns awaiting promotion</p>
                    </div>

                    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                        {pendingCampaigns.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <Clock className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-2 sm:mb-3" />
                                <p className="text-gray-500 text-xs sm:text-sm lg:text-base">No pending campaigns at the moment</p>
                            </div>
                        ) : (
                            pendingCampaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 lg:p-6 border-2 border-blue-200 hover:border-blue-300 transition-all">
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        {/* Campaign Image */}
                                        <div className="w-full">
                                            <img
                                                src={campaign.images[0]}
                                                alt={campaign.title}
                                                className="w-full h-40 sm:h-48 lg:h-56 object-cover rounded-lg shadow-md"
                                            />
                                        </div>

                                        {/* Campaign Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                                                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 flex-1">{campaign.title}</h3>
                                                <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                                                    New
                                                </span>
                                            </div>

                                            <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 line-clamp-2">{campaign.description}</p>

                                            <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs lg:text-sm text-gray-600 mb-3 sm:mb-4">
                                                <p><span className="font-semibold">Beneficiary:</span> {campaign.beneficiaryName}</p>
                                                <p className="flex items-start gap-1">
                                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                                                    <span className="break-words">{campaign.address}</span>
                                                </p>
                                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        Deadline: {formatDate(campaign.deadline)}
                                                    </span>
                                                    <span>Added by: {campaign.cmsAdminName}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleViewCampaign(campaign)}
                                                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                                                >
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAsComplete(campaign)}
                                                    className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    Mark Complete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Completed Campaigns */}
                {completedCampaigns.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">Completed Campaigns</h2>
                        </div>

                        <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                            {completedCampaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-green-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-green-200">
                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 flex-1">{campaign.title}</h3>
                                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                                            Completed
                                        </span>
                                    </div>

                                    {campaign.socialLinks && (
                                        <div className="mt-3 sm:mt-4 space-y-2">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Posted on:</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {Object.entries(campaign.socialLinks).map(([platform, link]) => (
                                                    link && (
                                                        <a
                                                            key={platform}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                            <span className="truncate">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* View Campaign Modal */}
            {isViewModalOpen && selectedCampaign && (
                <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Campaign Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Title & Description */}
                            <div>
                                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{selectedCampaign.title}</h4>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">{selectedCampaign.description}</p>
                            </div>

                            {/* Campaign Info */}
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                <p><span className="font-semibold">Campaign Name:</span> {selectedCampaign.campaignName}</p>
                                <p><span className="font-semibold">Beneficiary:</span> {selectedCampaign.beneficiaryName}</p>
                                <p><span className="font-semibold">Location:</span> {selectedCampaign.address}</p>
                                <p><span className="font-semibold">Deadline:</span> {formatDate(selectedCampaign.deadline)}</p>
                                <p><span className="font-semibold">Added by:</span> {selectedCampaign.cmsAdminName}</p>
                            </div>

                            {/* Campaign Images */}
                            <div>
                                <h5 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">Campaign Images</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {selectedCampaign.images.map((img, index) => (
                                        <div key={index} className="group relative">
                                            <img
                                                src={img}
                                                alt={`Campaign ${index + 1}`}
                                                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow"
                                                onClick={() => setSelectedImage(img)}
                                            />
                                            <button
                                                onClick={() => handleDownloadImage(img)}
                                                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1.5 sm:p-2 rounded-lg shadow-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                            >
                                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleMarkAsComplete(selectedCampaign);
                                }}
                                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Mark as Completed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Preview" className="max-w-full max-h-full rounded-lg" />
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white hover:text-gray-300 p-1"
                    >
                        <X className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                </div>
            )}

            {/* Mark as Complete Modal */}
            {isCompleteModalOpen && selectedCampaign && (
                <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 z-10">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Add Social Media Links</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Add links to where you've posted this campaign</p>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200">
                                <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{selectedCampaign.title}</h4>
                                <p className="text-xs sm:text-sm text-gray-600">{selectedCampaign.beneficiaryName}</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitCompletion(); }} className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                        <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Instagram Post Link
                                    </label>
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={socialLinks.instagram}
                                        onChange={handleLinkChange}
                                        placeholder="https://instagram.com/p/..."
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                        <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Facebook Post Link
                                    </label>
                                    <input
                                        type="url"
                                        name="facebook"
                                        value={socialLinks.facebook}
                                        onChange={handleLinkChange}
                                        placeholder="https://facebook.com/..."
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <LinkIcon className="w-4 h-4" />
                                        YouTube Video Link
                                    </label>
                                    <input
                                        type="url"
                                        name="youtube"
                                        value={socialLinks.youtube}
                                        onChange={handleLinkChange}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <LinkIcon className="w-4 h-4" />
                                        Twitter/X Post Link
                                    </label>
                                    <input
                                        type="url"
                                        name="twitter"
                                        value={socialLinks.twitter}
                                        onChange={handleLinkChange}
                                        placeholder="https://twitter.com/..."
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <LinkIcon className="w-4 h-4" />
                                        LinkedIn Post Link
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={socialLinks.linkedin}
                                        onChange={handleLinkChange}
                                        placeholder="https://linkedin.com/..."
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <LinkIcon className="w-4 h-4" />
                                        Other Platform Link
                                    </label>
                                    <input
                                        type="url"
                                        name="other"
                                        value={socialLinks.other}
                                        onChange={handleLinkChange}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                    <p className="font-medium">Note: Add at least one social media link to complete the campaign.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCompleteModalOpen(false)}
                                        className="flex-1 px-5 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!Object.values(socialLinks).some(link => link.trim())}
                                        className="flex-1 px-5 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Submit & Complete
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialMediaDashboard;