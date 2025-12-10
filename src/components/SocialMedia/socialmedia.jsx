"use client";
import React, { useState } from 'react';
import { Camera, MapPin, Calendar, Bell, ArrowLeft, Eye, Download, Clock, User, Menu, X, ExternalLink, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    const router = useRouter();
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Camera className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base md:text-xl font-bold text-gray-800">Social Media Manager</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">Campaign Management Portal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="relative">
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Bell className="w-5 h-5" />
                                    {pendingCampaigns.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                                            {pendingCampaigns.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={() => router.push("/select-portal")}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <div className="hidden md:flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5">
                                <span className="text-sm">Social Media Manager</span>
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                            </div>

                            <div className="md:hidden w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl md:rounded-2xl p-6 md:p-8 text-white mb-6 md:mb-8">
                    <div className="flex items-center gap-3 md:gap-4 mb-3">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Camera className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold">Welcome Back!</h2>
                            <p className="text-blue-100 text-sm md:text-lg">Manage and promote campaigns effectively</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-orange-600">{pendingCampaigns.length}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Pending Campaigns</h3>
                        <p className="text-xs text-gray-600 mt-1">Ready to promote</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                            </div>
                            <span className="text-2xl md:text-3xl font-bold text-green-600">{completedCampaigns.length}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Completed</h3>
                        <p className="text-xs text-gray-600 mt-1">Successfully promoted</p>
                    </div>
                </div>

                {/* Pending Campaigns */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Pending Campaigns</h2>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">New campaigns awaiting promotion</p>
                    </div>

                    <div className="p-4 md:p-6 space-y-4">
                        {pendingCampaigns.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm md:text-base">No pending campaigns at the moment</p>
                            </div>
                        ) : (
                            pendingCampaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border-2 border-blue-200 hover:border-blue-300 transition-all">
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        {/* Campaign Image Preview */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={campaign.images[0]}
                                                alt={campaign.title}
                                                className="w-full lg:w-40 h-40 object-cover rounded-lg shadow-md"
                                            />
                                        </div>

                                        {/* Campaign Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <h3 className="text-base md:text-lg font-bold text-gray-900">{campaign.title}</h3>
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                                    New
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{campaign.description}</p>

                                            <div className="space-y-2 text-xs md:text-sm text-gray-600 mb-4">
                                                <p><span className="font-semibold">Beneficiary:</span> {campaign.beneficiaryName}</p>
                                                <p className="flex items-start gap-1">
                                                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    <span className="break-words">{campaign.address}</span>
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        Deadline: {formatDate(campaign.deadline)}
                                                    </span>
                                                    <span>Added by: {campaign.cmsAdminName}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => handleViewCampaign(campaign)}
                                                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Full Details
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAsComplete(campaign)}
                                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Mark as Completed
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
                        <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Completed Campaigns</h2>
                        </div>

                        <div className="p-4 md:p-6 space-y-4">
                            {completedCampaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-green-50 rounded-xl p-4 md:p-6 border border-green-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-base md:text-lg font-bold text-gray-900">{campaign.title}</h3>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            Completed
                                        </span>
                                    </div>

                                    {campaign.socialLinks && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Posted on:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {Object.entries(campaign.socialLinks).map(([platform, link]) => (
                                                    link && (
                                                        <a
                                                            key={platform}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Campaign Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Title & Description */}
                            <div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-3">{selectedCampaign.title}</h4>
                                <p className="text-gray-700 leading-relaxed">{selectedCampaign.description}</p>
                            </div>

                            {/* Campaign Info */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                <p><span className="font-semibold">Campaign Name:</span> {selectedCampaign.campaignName}</p>
                                <p><span className="font-semibold">Beneficiary:</span> {selectedCampaign.beneficiaryName}</p>
                                <p><span className="font-semibold">Location:</span> {selectedCampaign.address}</p>
                                <p><span className="font-semibold">Deadline:</span> {formatDate(selectedCampaign.deadline)}</p>
                                <p><span className="font-semibold">Added by:</span> {selectedCampaign.cmsAdminName}</p>
                            </div>

                            {/* Campaign Images */}
                            <div>
                                <h5 className="font-semibold text-gray-900 mb-3">Campaign Images</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedCampaign.images.map((img, index) => (
                                        <div key={index} className="group relative">
                                            <img
                                                src={img}
                                                alt={`Campaign ${index + 1}`}
                                                className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow"
                                                onClick={() => setSelectedImage(img)}
                                            />
                                            <button
                                                onClick={() => handleDownloadImage(img)}
                                                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleMarkAsComplete(selectedCampaign);
                                }}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <CheckCircle className="w-4 h-4" />
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
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>
            )}

            {/* Mark as Complete Modal */}
            {isCompleteModalOpen && selectedCampaign && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Add Social Media Post Links</h3>
                            <p className="text-sm text-gray-600 mt-1">Add links to where you've posted this campaign</p>
                        </div>

                        <div className="p-6">
                            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                                <h4 className="font-semibold text-gray-900 mb-1">{selectedCampaign.title}</h4>
                                <p className="text-sm text-gray-600">{selectedCampaign.beneficiaryName}</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitCompletion(); }} className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <LinkIcon className="w-4 h-4" />
                                        Instagram Post Link
                                    </label>
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={socialLinks.instagram}
                                        onChange={handleLinkChange}
                                        placeholder="https://instagram.com/p/..."
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <LinkIcon className="w-4 h-4" />
                                        Facebook Post Link
                                    </label>
                                    <input
                                        type="url"
                                        name="facebook"
                                        value={socialLinks.facebook}
                                        onChange={handleLinkChange}
                                        placeholder="https://facebook.com/..."
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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