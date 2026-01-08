"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Upload, Calendar, CheckCircle, XCircle, Bell, ArrowLeft,
    Eye, Download, AlertCircle, Clock, UserCheck, ImageIcon, Trash2,
    MessageSquare, ChevronRight, Home, Grid, Settings, Menu, X, Camera,
    MapPin, Tag, Target, DollarSign, Users as UsersIcon, Video, Image as ImageIconAlt
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
    useGetCMSTasksQuery,
    useGetCompletedCMSTasksQuery,
    useGetPhotographySubmissionsQuery,
    usePublishCampaignMutation
} from '@/utils/slices/cmsApiSlice';
import { getMediaUrl } from '@/utils/media';

// Utility Functions
const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// CMS Dashboard Component
const CMSDashboard = ({ activeView, setActiveView, tasks = [], onSelectTask }) => {
    const [activeFilter, setActiveFilter] = useState('pending');

    // Filter tasks based on status
    const pendingTasks = tasks.filter(t => t.status === 'pending' || !t.status);
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl md:rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold">CMS Tasks Dashboard</h1>
                            <p className="text-emerald-100 text-sm md:text-lg">Publish campaigns and manage content</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-6 text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{pendingTasks.length} pending tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{completedTasks.length} completed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
                <div
                    onClick={() => setActiveFilter('pending')}
                    className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border-2 transition-all cursor-pointer ${activeFilter === 'pending'
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 md:w-6 md:h-6 text-orange-600" />
                        </div>
                        <span className="text-lg md:text-2xl font-bold text-orange-600">{pendingTasks.length}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-xs md:text-base">Pending Tasks</h3>
                    <p className="text-xs text-gray-600 mt-1">Awaiting campaign details</p>
                </div>

                <div
                    onClick={() => setActiveFilter('completed')}
                    className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border-2 transition-all cursor-pointer ${activeFilter === 'completed'
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                        </div>
                        <span className="text-lg md:text-2xl font-bold text-green-600">{completedTasks.length}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-xs md:text-base">Published</h3>
                    <p className="text-xs text-gray-600 mt-1">Successfully published</p>
                </div>
            </div>

            {/* Filtered Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 capitalize">
                        {activeFilter === 'pending' ? 'Pending Tasks' : 'Published Campaigns'}
                    </h2>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                    {/* Pending Tasks */}
                    {activeFilter === 'pending' && pendingTasks.map((task, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-purple-50 rounded-lg border border-emerald-100">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Camera className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">
                                    Campaign Task: {task.campaignName}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Beneficiary:</span> {task.beneficiaryName}
                                </p>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 break-words">
                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                                    {task.address}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Assigned: {formatDate(task.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                        <ImageIcon className="w-3 h-3" />
                                        Photos ready for review
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onSelectTask(task);
                                    setActiveView('publish');
                                }}
                                className="w-full md:w-auto bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-emerald-700 transition-colors flex-shrink-0"
                            >
                                Publish Campaign
                            </button>
                        </div>
                    ))}

                    {/* Completed Tasks */}
                    {activeFilter === 'completed' && completedTasks.map((task, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-green-50 border-green-200">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">{task.campaignName}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Beneficiary: {task.beneficiaryName}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                        <span>{formatDate(task.publishedAt || task.createdAt)}</span>
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Published
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty States */}
                    {activeFilter === 'pending' && pendingTasks.length === 0 && (
                        <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No pending tasks at the moment</p>
                        </div>
                    )}

                    {activeFilter === 'completed' && completedTasks.length === 0 && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No published campaigns yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Publish Campaign Component
const PublishCampaignPage = ({ setActiveView, selectedTask }) => {
    // Campaign form fields based on campaign model
    const [formData, setFormData] = useState({
        title: '',
        organization: '',
        beneficiaryName: selectedTask?.beneficiaryName || '',
        location: selectedTask?.address || '',
        about: '',
        category: '',
        targetAmount: '',
        deadline: '',
        mediaType: 'image',
        isUrgent: false,
        taxBenefits: false,
        zakatVerified: false,
        impactGoals: ['']
    });

    const [selectedMedia, setSelectedMedia] = useState([]);

    // Fetch photography submissions for this campaign
    const { data: submissionsData, isLoading: submissionsLoading } = useGetPhotographySubmissionsQuery(
        selectedTask?.campaignId,
        { skip: !selectedTask?.campaignId }
    );

    // Publish campaign mutation
    const [publishCampaign, { isLoading: publishing }] = usePublishCampaignMutation();

    // Extract files from photography submissions
    const photographySubmissions = submissionsData?.data?.submissions?.flatMap(submission =>
        submission.files?.map((file, idx) => ({
            id: `${submission._id}-${idx}`,
            url: getMediaUrl(file.url),
            type: file.type,
            uploadedAt: submission.uploadedAt,
            originalName: file.originalName
        }))
    ) || [];

    useEffect(() => {
        if (selectedTask) {
            setFormData(prev => ({
                ...prev,
                beneficiaryName: selectedTask.beneficiaryName || '',
                location: selectedTask.address || ''
            }));
        }
    }, [selectedTask]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImpactGoalChange = (index, value) => {
        const newGoals = [...formData.impactGoals];
        newGoals[index] = value;
        setFormData(prev => ({ ...prev, impactGoals: newGoals }));
    };

    const addImpactGoal = () => {
        setFormData(prev => ({ ...prev, impactGoals: [...prev.impactGoals, ''] }));
    };

    const removeImpactGoal = (index) => {
        const newGoals = formData.impactGoals.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, impactGoals: newGoals }));
    };

    const toggleMediaSelection = (media) => {
        setSelectedMedia(prev => {
            const isSelected = prev.find(m => m.id === media.id);
            if (isSelected) {
                return prev.filter(m => m.id !== media.id);
            } else {
                return [...prev, media];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedMedia.length === 0) {
            alert('Please select at least one media file from photography submissions');
            return;
        }

        try {
            // Prepare campaign data for backend
            const campaignData = {
                title: formData.title,
                organization: formData.organization,
                about: formData.about,
                category: formData.category,
                targetAmount: Number(formData.targetAmount),
                deadline: formData.deadline,
                mediaType: formData.mediaType,
                isUrgent: formData.isUrgent,
                taxBenefits: formData.taxBenefits,
                zakatVerified: formData.zakatVerified,
                impactGoals: formData.impactGoals,
                selectedMediaIds: selectedMedia.map(m => m.id),
                // Using the first selected media as primary
                imageUrl: selectedMedia[0]?.url,
                videoUrl: selectedMedia[0]?.type === 'video' ? selectedMedia[0]?.url : null
            };

            const taskId = selectedTask?.id || selectedTask?._id;

            await publishCampaign({
                taskId,
                campaignData
            }).unwrap();

            alert('Campaign published successfully!');
            setActiveView('dashboard');
        } catch (error) {
            console.error('Publish error:', error);
            alert(error.data?.message || error.data?.error || 'Failed to publish campaign. Please try again.');
        }
    };

    const downloadMedia = async (url, originalName) => {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = originalName || `media-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to direct link without target="_blank"
            const link = document.createElement('a');
            link.href = url;
            link.download = originalName || `media-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl md:rounded-2xl p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold font-serif">Publish Campaign</h1>
                        <p className="text-emerald-100 text-sm md:text-lg">Fill in campaign details and publish to website</p>
                    </div>
                </div>
            </div>

            {/* Photography Submissions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Photography Submissions</h2>
                    <p className="text-sm text-gray-600 mt-1">Select media files to use for the campaign</p>
                </div>
                <div className="p-4 md:p-6">
                    {submissionsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : photographySubmissions.length === 0 ? (
                        <div className="text-center py-8">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No photography submissions available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photographySubmissions.map(media => {
                                const isSelected = selectedMedia.find(m => m.id === media.id);
                                return (
                                    <div key={media.id} className="relative group">
                                        <div
                                            className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300'
                                                }`}
                                            onClick={() => toggleMediaSelection(media)}
                                        >
                                            <img
                                                src={media.url}
                                                alt="Photography submission"
                                                className="w-full h-32 md:h-40 object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadMedia(media.url, media.originalName);
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4 text-gray-700" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {selectedMedia.length > 0 && (
                        <p className="text-sm text-emerald-600 mt-4">
                            {selectedMedia.length} media file(s) selected
                        </p>
                    )}
                </div>
            </div>

            {/* Campaign Details Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Campaign Details</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Campaign Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter a compelling campaign title"
                            required
                        />
                    </div>

                    {/* Organization */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter organization name"
                            required
                        />
                    </div>

                    {/* Beneficiary Name (Read-only from task) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beneficiary Name
                        </label>
                        <input
                            type="text"
                            name="beneficiaryName"
                            value={formData.beneficiaryName}
                            onChange={handleInputChange}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-50"
                            placeholder="Beneficiary name"
                            readOnly
                        />
                    </div>

                    {/* Location (Read-only from task) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg bg-gray-50"
                            placeholder="Location"
                            readOnly
                        />
                    </div>

                    {/* About */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            About Campaign <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="Describe the campaign, its purpose, and impact..."
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="education">Education</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="poverty">Poverty Alleviation</option>
                            <option value="disaster">Disaster Relief</option>
                            <option value="environment">Environment</option>
                            <option value="women">Women Empowerment</option>
                            <option value="children">Children Welfare</option>
                            <option value="elderly">Elderly Care</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Target Amount & Deadline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Amount (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="targetAmount"
                                value={formData.targetAmount}
                                onChange={handleInputChange}
                                className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Enter target amount"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deadline <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                                className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>

                    {/* Impact Goals */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Impact Goals
                        </label>
                        <div className="space-y-2">
                            {formData.impactGoals.map((goal, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => handleImpactGoalChange(index, e.target.value)}
                                        className="flex-1 p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder={`Impact goal ${index + 1}`}
                                    />
                                    {formData.impactGoals.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeImpactGoal(index)}
                                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addImpactGoal}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                + Add Impact Goal
                            </button>
                        </div>
                    </div>

                    {/* Media Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Media Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="mediaType"
                                    value="image"
                                    checked={formData.mediaType === 'image'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-emerald-600"
                                />
                                <span className="text-sm">Image</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="mediaType"
                                    value="video"
                                    checked={formData.mediaType === 'video'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-emerald-600"
                                />
                                <span className="text-sm">Video</span>
                            </label>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isUrgent"
                                checked={formData.isUrgent}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Mark as Urgent</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="taxBenefits"
                                checked={formData.taxBenefits}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Tax Benefits Available</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="zakatVerified"
                                checked={formData.zakatVerified}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Zakat Verified</span>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setActiveView('dashboard')}
                            className="w-full sm:w-auto px-4 md:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={publishing}
                            className="w-full sm:flex-1 bg-emerald-600 text-white py-3 rounded-lg text-sm md:text-base font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {publishing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                    Publish Campaign
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main CMS Tasks Module Component
const CMSTasksModule = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedTask, setSelectedTask] = useState(null);

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('tasks');

    // Fetch CMS tasks from API
    const { data: tasksData, isLoading: tasksLoading } = useGetCMSTasksQuery();
    const { data: completedData, isLoading: completedLoading } = useGetCompletedCMSTasksQuery();

    // Combine pending and completed tasks
    const pendingTasks = tasksData?.data || [];
    const completedTasks = completedData?.data || [];
    const tasks = [...pendingTasks, ...completedTasks];

    const router = useRouter();

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* IMPORTED SIDEBAR COMPONENT */}


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
                    <h1 className="ml-3 text-lg font-bold text-[#0F172A]">CMS Tasks</h1>
                </div>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 md:p-8">
                        {tasksLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : activeView === 'dashboard' ? (
                            <CMSDashboard
                                activeView={activeView}
                                setActiveView={setActiveView}
                                tasks={tasks}
                                onSelectTask={(task) => {
                                    setSelectedTask(task);
                                    setActiveView('publish');
                                }}
                            />
                        ) : activeView === 'publish' ? (
                            <PublishCampaignPage
                                setActiveView={setActiveView}
                                selectedTask={selectedTask}
                            />
                        ) : null}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CMSTasksModule;
